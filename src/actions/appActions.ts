import dispatcher from "../dispatcher";
import {States} from "../stores/appStore";

export function updateTitle(title: string){
    dispatcher.dispatch({
        type: "UPDATE_TITLE",
        title
    });
}

export function updateState(state: States){
    dispatcher.dispatch({
        type: "UPDATE_STATE",
        state
    });
}