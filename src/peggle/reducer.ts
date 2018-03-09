import { Action } from 'redux';
import { loop, Cmd, LoopReducer } from 'redux-loop';
import { PeggleState, PeggleAction, Ball, Peg, VerticalWall, ScoreMarker, GameState } from './model';  // Bucket PegType
import { Vector2 } from '../vector2/vector2';
import * as Level from './levels';
import Bounds from './bounds';
import { Physics, gravity, isCollidingWith, tickPhysics } from './physics';
import { triggerSweepUp } from './actions';

const launchSpeed = 0.5;
const scoreMarkerFloatSpeed = 0.05;

const initialBall: Ball = {
  physics: {
    mass: 10.0,
    radius: 5.0,
    position: new Vector2(Bounds.gameX / 2, 10.0),
    velocity: new Vector2(0, 0),
    acceleration: new Vector2(0, 0)
  },
  hitCount: 0,
  lastHitLocation: new Vector2(0, 0)
};

function initialState(): PeggleState {

  let initLevel = Level.initLevel;

  return {
    score: 0,
    elapsedTimeMs: 0,
    barrelAngle: 20,
    barrelMoveDirection: 'Left',
    pegs: initLevel.pegs,
    walls: initLevel.walls,
    balls: [],
    gameState: 'Aiming',
    bucket: { xOffset: 0, width: 100, direction: 1 },
    scoreMarkers: [],
    ballsLeft: 10,
    redPegTargetForCurrentLevel: initLevel.pegs.filter(p => p.pegType === 'Red').length
  };
}

function vectorFromPolar(magnitude: number, angleDeg: number): Vector2 {
  return new Vector2(magnitude, 0).rotateByDeg(angleDeg);
}

let tickBall = function (deltaTimeMs: number, model: PeggleState): PeggleState {

  let newBalls = model.balls.map(ball => {
    ball.physics = tickPhysics(deltaTimeMs, { ...ball.physics, acceleration: gravity() });
    return ball;
  });

  model.balls = newBalls;

  return model;
};

let tickBucket = function (deltaTimeMs: number, model: PeggleState): PeggleState {

  let direction = model.bucket.direction;

  if (model.bucket.xOffset === 0) {
    direction = 1.0;
  } else if (model.bucket.xOffset === (Bounds.gameX - model.bucket.width)) {
    direction = -1.0;
  }

  let bucket = {
    ...model.bucket,
    xOffset: model.bucket.xOffset + model.bucket.direction,
    direction
  };

  return { ...model, bucket: bucket };
};

let tickPegs = function (deltaTimeMs: number, model: PeggleState): PeggleState {

  let pegs = model.pegs.map(p => ({ ...p, scoreDisplayTimeLeft: Math.max(p.scoreDisplayTimeLeft - deltaTimeMs, 0) }));

  return { ...model, pegs };
};

let tickBarrelAim = function (deltaTimeMs: number, model: PeggleState): PeggleState {

  // console.log("delta t: " + deltaTimeMs);

  let barrelRotateSpeed = 0.05;

  let newBarrelAngle = model.barrelAngle;
  switch (model.barrelMoveDirection) {
    case 'Right': newBarrelAngle = Math.min(model.barrelAngle + (barrelRotateSpeed * deltaTimeMs), 150); break;
    case 'Left': newBarrelAngle = Math.max(model.barrelAngle - (barrelRotateSpeed * deltaTimeMs), 30); break;
    default: throw 'this should never happen';
  }

  let barrelMoveDirection = (newBarrelAngle >= 150)
    ? 'Left'
    : (newBarrelAngle <= 30) ? 'Right' : model.barrelMoveDirection;

  return {
    ...model,
    barrelAngle: newBarrelAngle,
    barrelMoveDirection
  };
};

function tweakPositionToSurface(ball: Physics, peg: Peg): Vector2 {
  return ball.position
    .subtract(peg.position)
    .normalize()
    .multiplyScalar(ball.radius + peg.radius)
    .add(peg.position);
}

function collideWithPeg(modelSoFar: PeggleState, ball: Ball, peg: Peg): PeggleState {

  function physUpdate(physics: Physics): Physics {
    // Co-erce the position so that the ball and peg do not overlap (TODO -  backout on velocity vector)
    let newBallPos = tweakPositionToSurface(physics, peg);

    // switch out the velocity so that it is away from the hit peg
    // this cant be done with  just a negate of the velocity Vector
    // plus a small delta to stop infinite bouncing top dead center.
    // (This maybe should be random)
    let bounceV = newBallPos
      .subtract(peg.position)
      .normalize()
      .multiplyScalar(physics.velocity.magnitude)
      .rotateTo(0.001);

    return { ...physics, velocity: bounceV, position: newBallPos };
  }

  function cloneBall(b: Ball): Ball {
    return JSON.parse(JSON.stringify(b));
  }

  let reboundedBall: Ball = { ...ball, physics: physUpdate(ball.physics) };

  // AR: todo here - add new ball with flipped x axis if the peg is a multiball peg
  let balls = modelSoFar.balls.map(b => b === ball ? reboundedBall : b);

  // ** Points, and bonuses etc which 'rise off' the hit peg  **

  let points = 0;
  let bonus: string | null = null;

  switch (peg.pegType) {
    case 'Normal':
      points = 10 * (peg.hitCount + 1);
      switch (peg.hitCount) {
        case 2: bonus = 'TRIPLE HIT'; break;
        case 3: bonus = 'QUADRUPLE HIT'; break;
      }
      break;

    case 'Red':
      points = 50;
      switch (peg.hitCount) {
        case 2: bonus = 'TRIPLE HIT'; break;
        case 3: bonus = 'QUADRUPLE HIT'; break;
      }
      break;

    case 'MultiBall':
      points = 100;
      if (peg.hitCount === 0) {
        bonus = 'MULTI BALL';
        let extraBall = cloneBall(balls[0]);
        extraBall.physics.velocity = new Vector2(extraBall.physics.velocity.x * -1, extraBall.physics.velocity.y);
        balls.push(extraBall);
      } else {
        bonus = null;
      }
      break;

    default:
      console.warn(`Unknown peg type ${peg.pegType}`);
  }

  let scoreMarkers = bonus == null
    ? [...modelSoFar.scoreMarkers]
    : [...modelSoFar.scoreMarkers,
    {
      position: peg.position,
      opacity: 1,
      scoreMarkerFadeSpeed: 0.5 / 2000.0,
      radius: 22,
      text: bonus + '\n' + points
    } as ScoreMarker];

  var newPeg = {
    ...peg,
    hitCount: peg.hitCount + 1,
    scoreLastHit: points,
    scoreDisplayTimeLeft: 600
  };

  // replace the hit peg
  let pegs = [...modelSoFar.pegs.filter(p => p !== peg), newPeg];

  return {
    ...modelSoFar,
    balls,
    pegs,
    scoreMarkers,
    score: modelSoFar.score + points
  };
}

function processPegCollisions(model: PeggleState) {

  function testCollide(modelSoFar: PeggleState, ball: Ball): PeggleState {
    let collidingPegs = model.pegs.filter(p => isCollidingWith(p, ball.physics));
    return (collidingPegs.length === 0)
      ? modelSoFar
      : collideWithPeg(modelSoFar, ball, collidingPegs[0]);
  }

  return model.balls.reduce<PeggleState>(testCollide, model);
}

function collideWithWall(model: PeggleState, ball: Ball, wall: VerticalWall): PeggleState {
  let offset = (ball.physics.position.x) > wall.hPos
    ? (wall.width + ball.physics.radius)
    : 0 - (wall.width + ball.physics.radius);

  // hack - mutating ball here - original code updated immutable
  ball.physics.position = new Vector2(wall.hPos + offset, ball.physics.position.y);

  ball.physics.velocity = new Vector2(ball.physics.velocity.x * -1, ball.physics.velocity.y);

  return model;
}

function processWallCollisions(model: PeggleState): PeggleState {

  function isCollidingWithWall(entity: Physics, wall: VerticalWall): boolean {

    let centerDiff = (entity.radius + (wall.width / 2));
    let actualDiff = Math.abs((entity.position.x) - wall.hPos);

    return actualDiff < centerDiff;
  }

  function testCollideWithWall(modelSoFar: PeggleState, ball: Ball): PeggleState {
    let collidingWalls = model.walls.filter(w => isCollidingWithWall(ball.physics, w));
    return collidingWalls.length > 0
      ? collideWithWall(modelSoFar, ball, collidingWalls[0])
      : modelSoFar;
  }

  return model.balls.reduce(testCollideWithWall, model);
}

function newScoreMarker(score: number | null, text: string, pos: Vector2): ScoreMarker {
  return {
    radius: 22,
    position: pos,
    text: text + (score != null ? '\n' + score : ''),
    opacity: 0.5,
    scoreMarkerFadeSpeed: 0.5 / 2000.0,
  };
}

function processBucketCollisions(model: PeggleState): PeggleState {

  /* For each ball that is touching the bucket:
    * Add a bonus ball
    * Create bonus popup
    * Remove that ball from play
  */
  function isInBucket(ball: Ball): boolean {
    return ball.physics.position.x > (model.bucket.xOffset + ball.physics.radius)
      && (ball.physics.position.x) < (model.bucket.xOffset + model.bucket.width - ball.physics.radius)
      && (ball.physics.position.y) > Bounds.gameY;
  }

  let ballsInBucket = model.balls.filter(isInBucket);

  let popups = ballsInBucket
    .map(b => newScoreMarker(null, 'FREE BALL', new Vector2(b.physics.position.x, Bounds.gameY)));

  return {
    ...model,
    balls: model.balls.filter(b => ballsInBucket.indexOf(b) < 0),
    ballsLeft: model.ballsLeft + ballsInBucket.length,
    scoreMarkers: [...popups, ...model.scoreMarkers],
  };
}

function processScoreMarkers(deltaTimeMs: number, model: PeggleState): PeggleState {

  function tickMarker(marker: ScoreMarker) {
    let newPos = marker.position.addY(scoreMarkerFloatSpeed * deltaTimeMs * -1);

    return {
      ...marker,
      opacity: marker.opacity - (marker.scoreMarkerFadeSpeed * deltaTimeMs),
      position: newPos
    };
  }

  let scoreMarkers = model.scoreMarkers
    .map(tickMarker)
    .filter(sm => sm.opacity > 0.0);

  return { ...model, scoreMarkers };
}

function startBallInPlay(model: PeggleState): PeggleState {
  let launchVector = vectorFromPolar(launchSpeed, model.barrelAngle);
  let barrelTip = vectorFromPolar(40, model.barrelAngle).addX(Bounds.gameX / 2);

  let launchedBall = { ...initialBall, lastHitLocation: barrelTip };
  launchedBall.physics.position = barrelTip;
  launchedBall.physics.velocity = launchVector;

  return { ...model, gameState: 'BallInPlay', balls: [launchedBall] };
}

let peggleReducer: LoopReducer<PeggleState, PeggleAction> = (state: PeggleState | undefined, paction: Action) => {

  // Redux will call once initially with undefined state when reducer is combined() with others
  if (state === undefined) {
    // console.log(`PEGGLE REDUCER - (${paction.type}) returning initialstate`);
    return initialState();
  }

  var action = <PeggleAction> paction; // FU typescript

  switch (action.type) {

    case 'PEGGLE_TICK':

      const deltaMs = action.payload;
      let newState = tickBarrelAim(deltaMs, { ...state, elapsedTimeMs: state.elapsedTimeMs + 1 });
      newState = tickBall(deltaMs, newState);
      newState = tickBucket(deltaMs, newState);
      newState = tickPegs(deltaMs, newState);
      newState = processPegCollisions(newState);
      newState = processWallCollisions(newState);
      newState = processBucketCollisions(newState);
      newState = processScoreMarkers(deltaMs, newState);

      let isBallsAtBottom =
        newState.balls.map(b => b.physics.position.y).every(y => y > Bounds.gameY);

      if (isBallsAtBottom && state.gameState === 'BallInPlay') {
        
        newState = {...newState, balls: [], gameState: 'SweepingUp'};

        return loop(newState, Cmd.run(waitThenCleanUpAgain, {
          args: [Cmd.dispatch, Cmd.getState]
        }));
      } else {
        return newState;
      }

    case 'USER_CLICKED':
      switch (state.gameState) {
        case 'Aiming':
          return startBallInPlay(state);

        case 'GameOver':
          return initialState();
        
        default: return {...state};
      }

    case 'SWEEP_UP':
      // delete the first hit peg found
      let hitPegs = state.pegs.filter(p => p.hitCount > 0);
      if (hitPegs.length > 0) {
          let pegs = state.pegs.filter(p => p !== hitPegs[0]);
          return loop({...state, pegs}, Cmd.run(waitThenCleanUpAgain, {
            args: [Cmd.dispatch, Cmd.getState]
          }));
        } else {
          let ballsLeft = state.ballsLeft - 1;
          let gameState: GameState = ballsLeft === 0 ? 'GameOver' : 'Aiming';
          return { ...state, ballsLeft, gameState };
        }

    default:
      return state; // todo
  }
};

function waitThenCleanUpAgain(dispatch: Function) { // <-- what is Dispatcher type?
  window.setTimeout(() => { 
    dispatch(triggerSweepUp()); 
  },                200);
}

export default peggleReducer;