import "./app.css";
import "bootstrap/dist/css/bootstrap.css";
import * as React from "react";
import Sales from "./components/sales";
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
        AppStore.on("updateTitle", () => {
            this.setState({
                content: [<div key={"spinCon"} className={"spinnerContainer"}><Spinner fadeIn={"none"} name={"pacman"} /></div>,<div key={"stateCon"} className={"stateCon"}>
                    {AppStore.getTitle()}
                </div>]
            });
        });
        AppStore.on("updateState", () => {
            console.log(AppStore.getState());
            switch (AppStore.getState()){
                case States.Check:{
                    AppStore.updateTitle("Checking");
                    try{
                        this.checkSettings();
                    }catch {
                        AppStore.updateState(States.CheckFailed);
                    }
                    break;
                }
                case States.CheckFailed:{
                    this.showSetUp("Check failed");
                    break;
                }
                case States.Create:{
                    try {
                        AppStore.updateTitle("Creating account");
                        this.createAccount();
                    }catch {
                        AppStore.updateState(States.CreateFailed);
                    }
                    break;
                }
                case States.CreateFailed:{
                    this.showSetUp("Create failed");
                    break;
                }
                case States.LoadSales:{
                    AppStore.updateTitle("Loading sales");
                    Sales.getSaleProgramms();
                    /*this.setState({
                        content: [
                            <Sales/>,
                            <QrCodeButton/>
                        ]
                    })*/
                    break;
                }
            }
        });

        AppStore.updateState(States.Check);
    }

    private showSetUp(message: string = ""){
        this.setState({
            content: [
                <div id={"setupContainer"}>
                    <button onClick={() => this.handleRegisterClick()} id={"regButton"}>REGISTER</button>
                    <button onClick={() => this.handleReloadClick()} id={"reloadButton"}>
                        <svg viewBox="0 0 491.236 491.236" xmlns="http://www.w3.org/2000/svg" >
                            <path fill={"#21252"} d="M55.89,262.818c-3-26-0.5-51.1,6.3-74.3c22.6-77.1,93.5-133.8,177.6-134.8v-50.4c0-2.8,3.5-4.3,5.8-2.6l103.7,76.2
                                            c1.7,1.3,1.7,3.9,0,5.1l-103.6,76.2c-2.4,1.7-5.8,0.2-5.8-2.6v-50.3c-55.3,0.9-102.5,35-122.8,83.2c-7.7,18.2-11.6,38.3-10.5,59.4
                                            c1.5,29,12.4,55.7,29.6,77.3c9.2,11.5,7,28.3-4.9,37c-11.3,8.3-27.1,6-35.8-5C74.19,330.618,59.99,298.218,55.89,262.818z
                                             M355.29,166.018c17.3,21.5,28.2,48.3,29.6,77.3c1.1,21.2-2.9,41.3-10.5,59.4c-20.3,48.2-67.5,82.4-122.8,83.2v-50.3
                                            c0-2.8-3.5-4.3-5.8-2.6l-103.7,76.2c-1.7,1.3-1.7,3.9,0,5.1l103.6,76.2c2.4,1.7,5.8,0.2,5.8-2.6v-50.4
                                            c84.1-0.9,155.1-57.6,177.6-134.8c6.8-23.2,9.2-48.3,6.3-74.3c-4-35.4-18.2-67.8-39.5-94.4c-8.8-11-24.5-13.3-35.8-5
                                            C348.29,137.718,346.09,154.518,355.29,166.018z"/>
                        </svg>
                    </button>
                </div>,
                <div id={"messageContainer"}>
                    <i>{message}</i>
                </div>
            ]
        })
    }

    private handleReloadClick(){
        AppStore.updateState(States.Check);
    }

    private handleRegisterClick(){
        AppStore.updateState(States.Create);
    }

    private checkSettings(){
        if (Cookies.get("stellar-secret")) {
            const pair = StellarSdk.Keypair.fromSecret(Cookies.get("stellar-secret"));
            this.checkAccount(pair);
        } else {
            AppStore.updateState(States.CheckFailed);
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
                AppStore.updateState(States.CreateFailed)
            }else{
                AppStore.updateState(States.Check)
                Cookies.set("stellar-secret", pair.secret())
            }
        });
    }

    private checkAccount(pair){
        this.stellarServer.loadAccount(pair.publicKey().toString()).catch(StellarSdk.NotFoundError, function (error) {
            AppStore.updateState(States.CheckFailed);
        }).then(function(account) {
            console.log(account);
            AppStore.updateState(States.LoadSales);
        });
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
                <div className={"header unselectable"}>
                    LOYALIFY
                </div>
                {this.state.content}
            </div>
        );
    }
    
}

export default App;