import { makeAutoObservable } from 'mobx';
import { BaseManager } from "./DesignManager/BaseManager"
import { TopManager } from './DesignManager/TopManager';
import { StateManager } from './StateManager';
import { TopColorManager } from './DesignManager/TopColorManager';
import { ChairManager } from './DesignManager/ChairManager';


export class DesignManager {
    private _baseManager: BaseManager   
    private _topManager: TopManager
    private _topColorManager: TopColorManager
    private _chairManager: ChairManager

    constructor(libState: StateManager) {
        this._baseManager = new BaseManager(libState);
        this._topManager = new TopManager(libState, "comfortable");
        this._topColorManager = new TopColorManager(libState);
        this._chairManager = new ChairManager(this._topManager);
        makeAutoObservable(this);
    }

    get baseManager(){
        return this._baseManager
    }

    get topManager(){
        return this._topManager
    }

    get topColorManager(){
        return this._topColorManager
    }

    get chairManager(){
        return this._chairManager
    }

    

}

// export const designManager = new DesignManager(state)
