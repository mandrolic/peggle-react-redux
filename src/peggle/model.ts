import { Action } from 'redux';
import { Vector2 } from '../vector2/vector2';
// import Bounds from './bounds';
import { PositionedEntity, Physics } from './physics';

export type Tick = number; 

export type PeggleActionType = 'PEGGLE_TICK' | 'USER_CLICKED' | 'SWEEP_UP';
export interface TickAction extends Action { type: 'PEGGLE_TICK'; payload: Tick; }
export interface UserClickedAction extends Action { type: 'USER_CLICKED'; } 
export interface SweepUpAction extends Action { type: 'SWEEP_UP'; }

export type PeggleAction =
      TickAction 
      | UserClickedAction
      | SweepUpAction;

export type VerticalWall = { lowerBound: number, 
      upperBound: number, 
      hPos: number, 
      width: number
    };
  
export type PegType = 'Normal' | 'Red' | 'MultiBall';

export type  Ball = { physics: Physics,
     hitCount: number,
     lastHitLocation: Vector2
    };

export type Bucket = {
    xOffset: number,
    width: number,
    direction: number
};

export interface  Peg extends PositionedEntity   { 
    pegType: PegType;
    hitCount: number;
    scoreLastHit: number;
    scoreDisplayTimeLeft: number;
    }

export type  LevelDef = { pegs: Peg[],
    walls: VerticalWall[]
    };

export type GameState =
    'Aiming'
    | 'BallInPlay'
    | 'SweepingUp'
    | 'GameOver';

export interface ScoreMarker extends PositionedEntity  {
    text: String;
    opacity: number;
    scoreMarkerFadeSpeed: number;
}

export type PeggleState = {
      score: number
      elapsedTimeMs: number,
      barrelAngle: number,
      barrelMoveDirection: 'Left' | 'Right',
      walls: VerticalWall[],
      balls: Ball[],
      pegs: Peg[],
      gameState: GameState,
      bucket: Bucket,
      scoreMarkers: ScoreMarker[],
      ballsLeft: number,
      redPegTargetForCurrentLevel: number
};