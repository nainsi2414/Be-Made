import { makeAutoObservable } from 'mobx';

// import { Design3DManager } from './Design3DManager';
import { DesignManager } from './DesignManager';

export class StateManager {
  constructor() {
    makeAutoObservable(this);
  }

  private _designManager = new DesignManager(this);

  get designManager() {
    return this._designManager;
  }


  // private _design3DManager = new Design3DManager(this);

  // get design3DManager() {
  //   return this._design3DManager;
  // }
}

export const stateManager = new StateManager(); 
