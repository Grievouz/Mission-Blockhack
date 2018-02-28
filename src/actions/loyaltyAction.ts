import dispatcher from "../dispatcher";
import {LoyalityProgram} from ".././components/loyalify"

export function updateLoyalityPrograms(loyalityPrograms: LoyalityProgram[]){
    dispatcher.dispatch({
        type: "UPDATE_PROGRAMS",
        loyalityPrograms
    });
}

export function updateBalances(balances: {[id: string]: string}){
    dispatcher.dispatch({
        type: "UPDATE_BALANCES",
        balances
    });
}