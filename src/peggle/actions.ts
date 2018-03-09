import  { 
  TickAction, 
  UserClickedAction,
  SweepUpAction
 }  
from './model';

const tick: ((deltaTimeMs: number) => TickAction) = (texdeltaTimeMst: number) => {
  return { type: 'PEGGLE_TICK', payload: texdeltaTimeMst};
};

const userClicked: (() => UserClickedAction) = () => {
  return { type: 'USER_CLICKED' };
}; 

const triggerSweepUp: (() => SweepUpAction) = () => {
  return { type: 'SWEEP_UP' };
}; 

export {
  tick, userClicked, triggerSweepUp
};
