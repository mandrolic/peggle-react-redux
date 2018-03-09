import * as React from 'react';
import './peg.css';

type Props = {
    x: number;
    y: number;
    radius: number;
    scoreText: string | null;
    pegTypeClass: string;
    otherClasses: string;
};

let renderScore = ({scoreText, x, y }: Props) => {

    if (scoreText == null) {
        return null;
    }

    return (
        <text 
            className="score-text"
            textAnchor="middle"
            dominantBaseline="middle"
            x={x}
            y={y + 16}
        >
      {scoreText}
        </text>
    );
};

let Peg: React.StatelessComponent<Props> = (props: Props) => {

    let {x, y, radius, pegTypeClass, otherClasses, scoreText } = props; 

    return ( 
        <g>
        <circle 
          r={radius} 
          cx={x}
          cy={y}
          className={'peg' + pegTypeClass + ' ' + otherClasses} 
        />
        {scoreText != null ? renderScore(props) : null}
      </g>
      );
};

export default Peg;