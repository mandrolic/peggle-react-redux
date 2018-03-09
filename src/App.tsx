import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import './App.css';

import {
  model,
  Game,
  tick,
  userClicked,
  Bounds
} from './peggle';

interface AppProps {
  gameModel: model.PeggleState;
  dispatch: Dispatch<{}>;
}

type gameDimInfo = { widthAtr?: string, heightAtr?: string, scaleFactor: number };

class App extends React.Component<AppProps, {}> {

  constructor(props: AppProps) {
    super(props);
  }
 
  render() {
    const { gameModel, dispatch } = this.props;
    
    var { widthAtr, heightAtr } = this.gameDimensions(window.innerWidth, window.innerHeight);

    const vb = `0 0 ${Bounds.gameX} ${Bounds.gameY}`;

    return (
      <div className="App">
        <svg viewBox={vb} width={widthAtr} height={heightAtr}  >
          <Game
            tick={(t: number) => dispatch(tick(t))}
            peggleState={gameModel}
            onUserClicked={() => dispatch(userClicked())}
            dispatch={this.props.dispatch}
          />
        </svg>
      </div>
    );
  }

  private gameDimensions(windowWidth: number, windowHeight: number): gameDimInfo {
    let gameRatio = Bounds.gameX / Bounds.gameY;
    let windowMargin = 48;
    var width = windowWidth - windowMargin;
    var height = windowHeight - windowMargin;
    var windowRatio = width /  height;
    
    return (windowRatio > gameRatio) 
         ? { heightAtr: `${height}px`, scaleFactor: height / Bounds.gameY }
         : { widthAtr: `${width}px`, scaleFactor: width / Bounds.gameX };
  }
}

const  mapCombinedReducerStateToAppProps = (state: {peggle: model.PeggleState }) => {
  return ({ gameModel: state.peggle });
};

export default connect(mapCombinedReducerStateToAppProps)(App);