export { default as Game } from './components/Game';
export { default as Bounds } from './bounds';
export * from './actions';
import * as model from './model';
export { model };
import reducer from './reducer';
export default reducer;
