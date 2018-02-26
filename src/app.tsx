import "./app.css";
import "bootstrap/dist/css/bootstrap.css";
import * as React from "react";
import CardList from "./components/cardsList";
import QrCodeButton from "./components/qrcodeButton";
import * as Cookies from "es-cookie";
import * as StellarSdk from "stellar-sdk";
import Popup from "react-popup";
import * as Spinner  from "react-spinkit";

import AppStore, {States} from "./stores/appStore"
import * as AppActions from "./actions/appActions"

class App extends React.Component<{},
    {
        content: JSX.Element[];
    }> {

    private stellarServer = new StellarSdk.Server('https://horizon-testnet.stellar.org');
    private pair;

    constructor(props){
        super(props);

        this.state = {
            content: [<div key={"spinCon"} className={"spinnerContainer"}><Spinner name={"pacman"} /></div>,<div key={"stateCon"} className={"startState"}>
                {AppStore.getTitle()}
            </div>]
        };

        StellarSdk.Network.useTestNetwork();
    }

    componentWillMount(){
        AppStore.on("updateTitle", () => {
            this.setState({
                content: [<div key={"spinCon"} className={"spinnerContainer"}><Spinner name={"pacman"} /></div>,<div key={"stateCon"} className={"startState"}>
                    {AppStore.getTitle()}
                </div>]
            });
        });
        AppStore.on("updateState", () => {
            switch (AppStore.getState()){
                case States.CheckCookie:{
                    AppStore.updateTitle("Checking cookie");
                    this.checkCookie();
                }
                case States.CheckCookieFailed:{
                    AppStore.updateTitle("Creating account");
                    this.createAccount();
                }
                case States.CheckAccount:{
                    AppStore.updateTitle("Checking account");
                    this.checkAccount();
                }
                case States.CheckAccountFailed:{
                    AppStore.updateTitle("Check failed");
                }
                case States.CreateAccount:{
                    AppStore.updateTitle("Create failed");
                    this.createAccount()
                }
                case States.CreateAccountFailed: {
                    AppStore.updateTitle("Create failed");
                }
            }
        });

        AppStore.updateState(States.CheckCookie);
    }

    private checkCookie(){
        if(Cookies.get("stellar-secret")){
            AppStore.updateState(States.CheckAccount);
        }else{
            AppStore.updateState(States.CheckCookieFailed);
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
                AppStore.updateState(States.CreateAccountFailed)
            }else{
                AppStore.updateState(States.CheckAccount)
            }
        });
    }
    private checkAccount(){
        const pair = StellarSdk.Keypair.fromSecret(Cookies.get("secret"));
        this.stellarServer.loadAccount(pair.publicKey().toString()).catch(StellarSdk.NotFoundError, function (error) {
            AppStore.updateState(States.CheckAccountFailed);
        }).then(() => AppStore.updateState(States.LoadSales));
    }

    render() {
        return(
            <div id={"root"}>
                <Popup
                    btnClass="mm-popup__btn"
                    closeBtn={false}
                    closeHtml={null}
                    defaultOk="Schließen"
                    defaultCancel="Cancel"
                    wildClasses={false}
                    escToClose={true} />
                <div className={"header"}>
                    LOYALIFY
                </div>
                {this.state.content}
            </div>
        );
    }
}

export default App;