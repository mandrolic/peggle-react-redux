import * as React from 'react';
import './ball.css';

type Props = {
    x: number;
    y: number;
    radius: number;
};

let Ball: React.StatelessComponent<Props> = ({x, y, radius}: Props) => {
    return ( 
        <circle
           className="ball"
           cx={x} 
           cy={y} 
           r={radius} 
        />
      );
};

export default Ball;