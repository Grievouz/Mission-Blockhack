import "./loyaltyList.css";
import * as React from "react";
import {LoyalityProgram} from "./loyalify"
import * as StellarSdk from "stellar-sdk";
import * as LoyaltyActions from "../actions/loyaltyAction";
import LoyaltyStore from "../stores/loyaltyStore";
import * as Spinner  from "react-spinkit";

class LoyaltyList extends React.Component<{
    pair
    stellarServer
}, {
    items: JSX.Element[]
}> {
    private loyalityPrograms: LoyalityProgram[];
    private balances: {[id: string]: string} = {};

    constructor(props) {
        super(props);

        this.state = {items: []};


        LoyaltyStore.on("updatePrograms", () => {
            this.loyalityPrograms = LoyaltyStore.getLoyalityPrograms();
            this.requestBalances();
        });
        LoyaltyStore.on("updateBalances", () => {
            this.balances = LoyaltyStore.getBalances();
            this.renderList();
        });
        this.requestLoyalityPrograms();
    }

    private async requestLoyalityPrograms(){
        const xHttp = new XMLHttpRequest();
        xHttp.open("GET", "http://talesofapirate.com:8000/api/programs", true);
        xHttp.send( null );
        xHttp.onreadystatechange = function() {
            if(xHttp.readyState == 4){
                LoyaltyActions.updateLoyalityPrograms(JSON.parse(xHttp.responseText) as LoyalityProgram[]);
            }
        };
    }

    private requestBalances(){
        this.props.stellarServer.loadAccount(this.props.pair.publicKey()).then(function(account) {
            let balances: {[id: string]: string} = {};
            for(let i = 0; i < account.balances.length; i++)
                balances[account.balances[i].asset_type] = account.balances[i].balance
            LoyaltyActions.updateBalances(balances);
        });
    }

    public renderList(){
        let items: JSX.Element[] = [];

        for(let i = 0; i < this.loyalityPrograms.length; i++){
            items.push(

                <div  key={i} className={"flip-container"}>
                    <div className={"flipper"}>
                        <div className={"front"}>
                            <div className={"card"} >
                                <div className={"logoContainer"}>
                                    <img src={"./logos/" + this.loyalityPrograms[i].companies[0] + ".png"} alt={"logo"}/>
                                </div>
                                <div className={"header"}>
                                    {this.loyalityPrograms[i].name}
                                </div>
                                <div className={this.balances[this.loyalityPrograms[i].token] ? "amount" : "amount red"}>
                                    {this.balances[this.loyalityPrograms[i].token] ? this.balances[this.loyalityPrograms[i].token] + " x " + this.loyalityPrograms[i].token : "Not participating"}
                                </div>
                            </div>
                        </div>
                        <div className={"back"}>
                            <div className={"card"} >
                                <div className={"header"}>
                                    {this.loyalityPrograms[i].name}
                                </div>
                                <div className={"description"}>
                                    <b><u>Description:</u></b><br/>
                                    {this.loyalityPrograms[i].description}
                                </div>
                                <div className={"amount"}>
                                    {this.balances[this.loyalityPrograms[i].token] ? this.balances[this.loyalityPrograms[i].token] + " x " + this.loyalityPrograms[i].token : ""}
                                </div>
                                <div className={"button"}>
                                    <button id={i.toString()} onClick={(event) => this.handleButtonClick(event.currentTarget)}>
                                        {this.balances[this.loyalityPrograms[i].token] ? "Open shop" : "Participate"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>);
        }
        this.setState({
            items: items
        });
    }

    private async handleButtonClick(sender: HTMLButtonElement){
        const id:number = parseInt(sender.id.toString());
        if(!this.balances[this.loyalityPrograms[id].token]){
            const pair = this.props.pair;
            const stellarServer = this.props.stellarServer;
            const asset = new StellarSdk.Asset(this.loyalityPrograms[id].token, this.loyalityPrograms[id].address)
            const source = this.loyalityPrograms[id].address;
            await this.props.stellarServer.loadAccount(pair.publicKey().toString())
                .then(function(receiver) {
                    var transaction = new StellarSdk.TransactionBuilder(receiver)
                    // The `changeTrust` operation creates (or alters) a trustline
                    // The `limit` parameter below is optional
                        .addOperation(StellarSdk.Operation.changeTrust({
                            asset: asset
                        }))
                        .build();
                    transaction.sign(pair);
                    return stellarServer.submitTransaction(transaction);
                });



        }else{
            window.location.href=this.loyalityPrograms[id].shop;
        }
    }

    render() {
        return(
            <div id={"loayaltyList"}>
                <div key={"0"} className={"mark unselectable"}>
                    LOYALIFY
                </div>
                <div id={"itemContainer"}>
                    {this.state.items}
                </div>
            </div>
        );
    }
}


export default LoyaltyList;