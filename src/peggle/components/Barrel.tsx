import * as React from 'react';
import './barrel.css';

interface BarrelProps {
    barrelAngle: number;
}

class Barrel extends React.Component<BarrelProps, {}> {

    render() {

        let tfm = `rotate(${this.props.barrelAngle} 250 0)`;
        
        return (
            <g>
                <rect 
                    className="gunbarrel" 
                    transform={tfm}
                    x="250" 
                    y="-6" 
                    width="40"
                    height="12" 
                />
                <circle 
                    className="gunbase" 
                    cx="250" 
                    cy="0"
                    r="30" 
                />
            </g>

        );
    }
}

export default Barrel;
