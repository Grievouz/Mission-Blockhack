import {EventEmitter} from "events";
import dispatcher from "../dispatcher";
import {LoyalityProgram} from ".././components/loyalify"

class LoyaltyStore extends  EventEmitter{

    private loyalityPrograms: LoyalityProgram[];
    private balances: {[id: string]: string};

    constructor(){
        super();
    }

    public getLoyalityPrograms(): LoyalityProgram[]{
        return this.loyalityPrograms;
    }

    public getBalances(): {[id: string]: string}{
        return this.balances;
    }

    public updateLoyalityPrograms(loyalityPrograms: LoyalityProgram[]){
        this.loyalityPrograms = loyalityPrograms;
        this.emit("updatePrograms");
    }

    public updateBalances(balances: {[id: string]: string}){
        this.balances = balances;
        this.emit("updateBalances");
    }

    public handleActions(action){
        switch (action.type){
            case "UPDATE_PROGRAMS":{
                this.updateLoyalityPrograms(action.loyalityPrograms as LoyalityProgram[]);
                break;
            }
            case "UPDATE_BALANCES":{
                this.updateBalances(action.balances as {[id: string]: string});
                break;
            }
        }
    }
}

const loyaltyStore = new LoyaltyStore();
dispatcher.register(loyaltyStore.handleActions.bind(loyaltyStore));

export default loyaltyStore;