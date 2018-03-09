import { Vector2 } from '../vector2/vector2';

let gravity = () => new Vector2(0, 0.001);

function isCollidingWith(p: PositionedEntity, q: PositionedEntity): boolean {
    return p.position.subtract(q.position).magnitude < (p.radius + q.radius);
}

interface PositionedEntity {
    position: Vector2;
    radius: number;
}

interface Physics extends PositionedEntity {
    mass: number;
    velocity: Vector2;
    acceleration: Vector2;
}

function circleArea(radius: number) { return radius * radius * Math.PI; }

// Gets the drag force of a sphere
function getDragForce(radius: number, velocity: Vector2): Vector2 {
    // Drag force - http://en.wikipedia.org/wiki/Drag_equation
    // F = 0.5p(V^2)CdA
    //
    // Where Cd for a sphere is 0.4 http://en.wikipedia.org/wiki/Drag_coefficient
    // p is mass density of the fluid
    let fluidMassDensity = 0.0015;
  
    if (velocity.magnitude === 0) {
      return velocity;
    } else {
      let scalarForce = 0.5 * fluidMassDensity * (velocity.magnitudeSq * 0.4 * circleArea(radius));
      return velocity.normalize().invert().multiplyScalar(scalarForce);
    }
  }
  
function getDragDecellerationForce(dt: number, thing: Physics): Vector2 {
    let dv = thing.acceleration.multiplyScalar(dt);        //  new velocity delta
    let newv = thing.velocity.add(dv);
    return getDragForce(thing.radius, newv);   // from that velocity calc the drag force Vector2
  }
  
// Generic Physics dt Tick - deals with acc, vel, drag etc for all 'PhysicsMotion' types  
function tickPhysics(dt: number, thing: Physics) {
  
    if (dt > 100) {
      console.warn(`Dumping (dt =  ${dt})`);
      return thing;
    }
  
    let newVelocity = getDragDecellerationForce(dt, thing)
      .divideScalar(thing.mass) // = drag dragDecceleration
      .add(thing.acceleration) // = dragAddjustedAcc
      .multiplyScalar(dt)       // = drage detla v
      .add(thing.velocity);
  
    let newPosition = newVelocity
      .multiplyScalar(dt) // = displacement
      .add(thing.position);
  
    let ret: Physics = {
      ...thing,
      position: newPosition,
      velocity: newVelocity,
      acceleration: new Vector2(0, 0)  // Reset acceleration for this dt; it will be calculated again next time
    };
  
    return ret;
  }

export {
    gravity, isCollidingWith, PositionedEntity, Physics, getDragForce, getDragDecellerationForce, tickPhysics
};