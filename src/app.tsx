import "./app.css";
import * as React from "react";
import LoyaltyList from "./components/loyaltyList";
import QrCodeButton from "./components/qrcodeButton";
import * as Cookies from "es-cookie";
import * as StellarSdk from "stellar-sdk";
import Popup from "react-popup";
import * as Spinner  from "react-spinkit";

import AppStore, {States} from "./stores/appStore"
import * as AppActions from "./actions/appActions"
import * as LoyaltyActions from "./actions/loyaltyAction"
import {LoyalityProgram} from "./components/loyalify";

class App extends React.Component<{},
    {
        content: JSX.Element[];
    }> {

    private pair;
    private loyaltyList: JSX.Element;
    private qrCodeButton: JSX.Element;
    private stellarServer = new StellarSdk.Server('https://horizon-testnet.stellar.org');

    constructor(props){
        super(props);

        this.state = {
            content: [<div key={"spinCon"} className={"spinnerContainer"}><Spinner fadeIn={"none"} name={"pacman"} /></div>,<div key={"stateCon"} className={"startState"}>
                {AppStore.getTitle()}
            </div>]
        };

        StellarSdk.Network.useTestNetwork();
    }

    componentWillMount(){
        AppStore.on("updateState", () => {
            switch (AppStore.getState()){
                case States.Check:{
                    this.updateTitle("Logging in");
                    this.checkSettings();
                    break;
                }
                case States.Create:{
                    this.updateTitle("Creating account");
                    this.createAccount();
                    break;
                }
                case States.LoadSales:{
                    this.updateTitle("Loading sales");
                    this.pair = StellarSdk.Keypair.fromSecret(Cookies.get("stellar-secret"))
                    this.setState({
                        content: [
                            <LoyaltyList key={"0"} pair={this.pair} stellarServer={this.stellarServer}/>,
                            <QrCodeButton key={"1"} pair={this.pair}/>
                        ]
                    });
                    break;
                }
            }
        });

        this.showInitPage();
    }

    private updateTitle(title: string){
        this.setState({
            content: [
                <div key={"0"}  className={"mark unselectable"}>
                    LOYALIFY
                </div>,
                <div key={"1"} className={"spinnerContainer"}><Spinner fadeIn={"none"} name={"pacman"} /></div>,<div key={"stateCon"} className={"stateCon"}>
                    {title}
                </div>]
        });
    }

    private showInitPage(){
        if(!Cookies.get("stellar-secret")){
            this.setState({
                content: [
                    <div key={"0"}  className={"mark unselectable"}>
                        LOYALIFY
                    </div>,
                    <div key={"1"}  id={"setupContainer"}>
                        <button onClick={() => this.handleRegisterClick()} className={"regButton"}>REGISTER</button>
                    </div>,
                ]
            });
        }else{
            this.setState({
                content: [
                    <div key={"0"}  className={"mark unselectable"}>
                        LOYALIFY
                    </div>,
                    <div key={"1"}  id={"setupContainer"}>
                        <button onClick={() => this.handleLoginClick()} className={"regButton"}>LOGIN</button>
                    </div>,
                    <div key={"2"}  id={"botContainer"}>
                        <button onClick={() => this.handleDeleteClick()} className={"delButton"}>RESET</button>
                    </div>
                ]
            });
        }



    }

    private handleLoginClick(){
        AppActions.updateState(States.Check);
    }

    private handleDeleteClick(){
        Cookies.remove("stellar-secret");

        this.showInitPage();
    }

    private handleRegisterClick(){
        AppActions.updateState(States.Create);
    }

    private checkSettings(){
        if (Cookies.get("stellar-secret")) {
            const pair = StellarSdk.Keypair.fromSecret(Cookies.get("stellar-secret"));
            this.checkAccount(pair);
        } else {
            AppActions.updateState(States.Check);
        }
    }

    private createAccount(){
        const pair = StellarSdk.Keypair.random();

        let request = require('request');
        request.get({
            url: 'https://horizon-testnet.stellar.org/friendbot',
            qs: { addr: pair.publicKey() },
            json: true
        }, function(error, response, body) {
            if (error || response.statusCode !== 200) {
                console.error('ERROR!', error || body);
                AppActions.updateState(States.Create)
            }else{
                Cookies.set("stellar-secret", pair.secret())
                AppActions.updateState(States.Check)
            }
        });
    }

    private checkAccount(pair){
        this.stellarServer.loadAccount(pair.publicKey().toString()).catch(StellarSdk.NotFoundError, function (error) {
            AppActions.updateState(States.Check);
        }).then(function(account) {
            AppActions.updateState(States.LoadSales);
        });
    }

    render() {
        return(
            <div id={"react"}>
                <Popup
                    btnClass="mm-popup__btn"
                    closeBtn={false}
                    closeHtml={null}
                    defaultOk="Schließen"
                    defaultCancel="Cancel"
                    wildClasses={false}
                    escToClose={true} />
                {this.state.content}
            </div>
        );
    }
    
}

export default App;