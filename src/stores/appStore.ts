import {EventEmitter} from "events";
import dispatcher from "../dispatcher";

class AppStore extends  EventEmitter{

    state: States;
    title: string = "Initializing";

    constructor(){
        super();
        this.title;
    }

    public getTitle(): string{
        return this.title;
    }

    public getState(): States{
        return this.state;
    }

    public updateTitle(title: string){
        this.title = title;
        this.emit("updateTitle");
    }

    public updateState(state: States){
        this.state = state;
        this.emit("updateState");
    }

    public handleActions(action){
        switch (action.type){
            case "UPDATE_TITLE":{
                this.updateTitle(action.title)
            }
            case "UPDATE_STATE":{
                this.updateState(action.state as States)
            }
        }
    }
}

export enum States{
    Check,
    CheckFailed,

    Create,
    CreateFailed,

    LoadSales,
    Finished
}

const appStore = new AppStore();
dispatcher.register(appStore.handleActions.bind(appStore));

export default appStore;