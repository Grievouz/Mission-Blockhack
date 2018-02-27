import dispatcher from "../dispatcher";

export function updateTitle(title: string){
    dispatcher.dispatch({
        type: "UPDATE_TITLE",
        title
    });
}

export function updateState(state: string){
    dispatcher.dispatch({
        type: "UPDATE_STATE",
        state
    });
}