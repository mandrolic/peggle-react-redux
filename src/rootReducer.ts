// import { combineReducers as combineRedux} from 'redux';
import { combineReducers as combineLoop } from 'redux-loop';
import peggle from './peggle';

const rootReducer = combineLoop({
  peggle
});

export default rootReducer;
