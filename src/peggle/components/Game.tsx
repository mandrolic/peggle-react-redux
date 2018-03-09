import * as React from 'react';
import { Dispatch } from 'redux';
import * as model from '../model';
import Bounds from '../bounds';
import Ball from './Ball';
import Barrel from './Barrel';
import Bucket from './Bucket';
import Peg from './Peg';

import './game.css';

interface GameProps {
  tick: (t: number) => void;
  peggleState: model.PeggleState;
  onUserClicked: () => void;
  dispatch: Dispatch<{}>;
}

type ReactKey = string | number;

class Game extends React.Component<GameProps, {}> {

private lastTick = 0;
  
 constructor(props: GameProps) {
    super(props);
    this.userClicked = this.userClicked.bind(this);
   // kick off animation
    window.requestAnimationFrame(t => this.animationStep(t));
  }

  animationStep(t: number) {

      setTimeout(() => {
      this.props.tick(t - this.lastTick);  
      this.lastTick = t;
      window.requestAnimationFrame(tt => this.animationStep(tt));

      },         1000 / 60);
    }

  renderWall(wall: model.VerticalWall, key: ReactKey) {
    return (  
              <rect 
                    className="wall"
                    x={wall.hPos}
                    y={wall.upperBound}
                    width={wall.width}
                    height={wall.lowerBound - wall.upperBound}
                    key={key} 
              /> 
            );
  }

  renderBall(ball: model.Ball, key: ReactKey): JSX.Element { 
    return (
      <Ball
           x={ball.physics.position.x} 
           y={ball.physics.position.y} 
           radius={ball.physics.radius} 
      />);
  }

  renderPeg(peg: model.Peg): JSX.Element { 
    
    let pegClassLookup: Record<model.PegType, string> = {
        Normal: '',
        Red: ' redPeg',
        MultiBall: ' multiBallPeg'
    };
            
    let conditionalClasses = [ [peg.hitCount > 0, 'hit' ] ]
             .filter(([include, attr]) => include)
             .map(([include, attr]) => attr)
             .join(' ');
    
    return (
      <Peg
           x={peg.position.x} 
           y={peg.position.y} 
           radius={peg.radius}
           scoreText={peg.scoreDisplayTimeLeft > 0 ? peg.scoreLastHit.toString() : null}
           pegTypeClass={pegClassLookup[peg.pegType]}
           otherClasses={conditionalClasses}
           
      />);
  }

  renderScoreMarker(sm: model.ScoreMarker, key: ReactKey): JSX.Element {
    let translation = `translate(${sm.position.x},${sm.position.y})`;
    
    return (
      <g key={key} transform={translation}  opacity={sm.opacity}>
        <text 
          className="bonus-popup"
          textAnchor="middle"
          dominantBaseline="middle"
        >
        {sm.text}
        </text>
      </g>

    );
  }

  renderBallsLeft(ballsLeft: Number): JSX.Element  {
    return ( 
      <text
        className="game-text"
        y={0}
      >
        <tspan dy="30" x={Bounds.gameX - 10} textAnchor="end">Balls: {ballsLeft}</tspan>
      </text>
    );
  }

  renderScore(score: number, pegs: Array<model.Peg>, requiredRedPegs: number): JSX.Element  {
      const redPegsRemaining = pegs.filter(p => p.pegType ===  'Red').length;
      const redPegsHit = requiredRedPegs - redPegsRemaining;
  
      return (
        <g>
          <g>
            <text
              className="game-text"
              y={0}
            >
              <tspan dy="30" x={10} textAnchor="start">Score: {score}</tspan>
            </text>
          </g>
          <g transform="translate(0 40)">
            <circle r="6" cx="15" cy="5" className="peg redPeg" />
            <text
              className="game-text"
              y={0}
            >
              <tspan dy="10" x={25} textAnchor="start" fontSize="16">{redPegsHit} of {requiredRedPegs}</tspan>
            </text>
          </g>
          </g>
        );
      }

  renderSvgGameTextLine(text: string): JSX.Element {
      let screenCentre = (Bounds.gameX / 2);

      return (
            <tspan 
                dy={60}
                x={screenCentre}
                textAnchor="middle"
            >
                {text}
            </tspan>
            );
      }

  renderGameOver(): JSX.Element {
  
    let backgroundTextOpacity = 0.5; // TEMP

    return (
    <g >
      <rect
        fill="black"
        fillOpacity="0.9"
        width={Bounds.gameX}
        height={Bounds.gameY}
        onClick={this.props.onUserClicked}
       
      />
      <text 
        className="game-text" 
        y={((Bounds.gameY / 2) - 60)}
        strokeOpacity={backgroundTextOpacity}
      >
        {this.renderSvgGameTextLine('GAME')}
        {this.renderSvgGameTextLine('OVER')}
      </text>
    </g>);
  }

  userClicked(ev: React.MouseEvent<SVGElement>) {
    this.props.onUserClicked();
  }

  render() {
    let state = this.props.peggleState;
  
    return (
      <g className="game-svg">
        <rect
          className="game-background"
          width="100%"
          height="100%"
          onClick={this.userClicked}
        />
        <Barrel barrelAngle={state.barrelAngle} /> 
        <g>
          {state.walls.map((w, i) => this.renderWall(w, i))}
        </g>
         <g>
          {state.pegs.map(this.renderPeg)}
        </g>
        <g>
          {state.balls.map((b, i) => this.renderBall(b, i))}
        </g>
        <Bucket x={state.bucket.xOffset} y={Bounds.gameY - 5} width={state.bucket.width}/>
        
        <g>
          {state.scoreMarkers.map((b, i) => this.renderScoreMarker(b, i))}
        </g>

        {this.renderScore(state.score, state.pegs, state.redPegTargetForCurrentLevel)}
        {state.gameState !== 'GameOver'  && this.renderBallsLeft(state.ballsLeft)}
        {state.gameState === 'GameOver'  && this.renderGameOver()}

      </g>
    );
  }
}

{/* {this.renderWalls()}
        {this.renderPegs()}
        {this.renderBalls()} */}

export default Game;
