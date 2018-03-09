import * as React from 'react';
import './bucket.css';

type Props = {
    x: number;
    y: number;
    width: number;
};

let Bucket: React.StatelessComponent<Props> = ({x, y, width}: Props) => {
    return ( 
        <rect 
          className="bucket"
          x={x}
          y={y}
          width={width}
          height="5"
        />
      );
};

export default Bucket;