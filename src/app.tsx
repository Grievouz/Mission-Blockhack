import "./app.css";
import "bootstrap/dist/css/bootstrap.css";
import * as React from "react";
import CardList from "../../src/components/cardsList";
import QrCodeButton from "../../src/components/qrcodeButton";
import * as Cookies from 'es-cookie';
import * as StellarSdk from "stellar-sdk";
import * as ReactDom from "react-dom";
import Popup from 'react-popup';
import * as Spinner  from "react-spinkit";
class App extends React.Component<{},
    {
    content: JSX.Element[]
    }> {

    private stellarServer = new StellarSdk.Server('https://horizon-testnet.stellar.org');
    private static doesExist: boolean = true;
    private static appElement: App;

    constructor(props){
        super(props);

        StellarSdk.Network.useTestNetwork();

        this.setLoadingState("Checking")
    }

    private displayState: string;
    private firstMount = true;
    componentDidMount(){
        App.appElement = this;
        if(this.firstMount){
            this.loadApp();
            this.firstMount = false;
        }
    }

    private accountExists(account){
        const pair = StellarSdk.Keypair.fromSecret(Cookies.get("secret"));
        this.stellarServer.loadAccount(pair.publicKey().toString()).catch(StellarSdk.NotFoundError, function (error) {
            App.doesExist = false;
            throw new Error('The destination account does not exist!');
        });
    }


    private async loadApp(){
        if(!App.doesExist){
            this.setLoadingState("Creating account")
            const pair = StellarSdk.Keypair.random();

            var request = require('request');
            request.get({
                url: 'https://horizon-testnet.stellar.org/friendbot',
                qs: { addr: pair.publicKey() },
                json: true
            }, function(error, response, body) {
                if (error || response.statusCode !== 200) {
                    console.error('ERROR!', error || body);
                    App.appElement.setState({
                        content: [<div key={"spinCon"} className={"spinnerContainer"}><Spinner name={"pacman"} /></div>,<div key={"stateCon"} className={"startState"}>
                            Create failed
                        </div>]
                    });
                }else{
                    Cookies.set("secret", pair.secret());
                    App.appElement.setLoadingState("Loading sales")
                }
            });
        }else {
            this.setLoadingState("Loading sales")
        }
    }

    private setLoadingState(state: string){
        this.state = {
            content: [<div key={"spinCon"} className={"spinnerContainer"}><Spinner name={"pacman"} /></div>,<div key={"stateCon"} className={"startState"}>
                {state}
            </div>]
        };
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