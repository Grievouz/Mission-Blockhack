import "./sales.css";
import * as React from "react";
import {LoyalityProgram} from "./loyalify"
import * as Cookies from "es-cookie";
import * as StellarSdk from "stellar-sdk";
import { Card, CardImg, CardText, CardBody,CardTitle, CardSubtitle, Row, Col, Button } from "reactstrap";

class Sales extends React.Component<{

}, {
    programsList: JSX.Element[]
}> {

    private programs: LoyalityProgram[];
    private static list: Sales;
    private tokenBalances: {[id: string]: string} = {};
    private currentLayout: number = -1;

    constructor(props) {
        super(props);

        this.state = {programsList: []}
    }

    public static getSaleProgramms(){

    }

    private mounted: boolean = false;
    componentDidMount(){
        if(!this.mounted){
            this.checkLayout();
            this.mounted = true;
        }
        this.checkLayout();
        window.addEventListener('resize', this.resize);
    }

    resize = () => this.checkLayout();

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize);
    }

    public checkLayout(){
        if(window.innerWidth > 700 && this.currentLayout != 0){
            this.currentLayout = 0;
            this.initListItems(0);
        }else if (window.innerWidth > 600 && window.innerWidth < 700 && this.currentLayout != 1){
            this.currentLayout = 1;
            this.initListItems(1);
        }else if (window.innerWidth < 600 && this.currentLayout != 2){
            this.currentLayout = 2;
            this.initListItems(2);
        }
    }


    public initListItems(layout: number){
        const xHttp = new XMLHttpRequest();
        xHttp.open("GET", "http://talesofapirate.com:8000/api/programs", false);
        xHttp.send( null );
        this.programs = JSON.parse(xHttp.response) as LoyalityProgram[];

        const pair = StellarSdk.Keypair.fromSecret(Cookies.get("secret"));
        var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

        Cookies.set("balances", JSON.stringify({}));
        Sales.list = this;
        server.loadAccount(pair.publicKey()).then(function (account) {
            Sales.list.createListItems(account, layout);
        });

    }

    public createListItems(account: any, layout:number){


        let balances: {[id: string]: string} = {};
        account.balances.forEach(function(balance) {
            if(balance.asset_code)
                balances[balance.asset_code] = balance.balance;
        });

        let items: JSX.Element[] = [];

        for (let i = 0; i < this.programs.length; i++){

            let companyImgs: JSX.Element[] = [];
            for(let j = 0; j < this.programs[i].companies.length; j++){
                var url: string = "./logos/" + this.programs[i].companies[j] + ".png";
                companyImgs.push(<img src={url} alt={this.programs[i].companies[j]}/>)
            }
            const id = i.toString()

            let tokenAbo: boolean = balances[this.programs[i].token] ? true : false;

            items.push(
                <div id={"cardsContainer" + (layout == 0 ? "One" : layout == 1 ? "Two" : layout == 2 ? "Three" : "")}>
                    <Card>
                        <CardBody>
                            <img className={"heroImage"} height="230px" width="30%" src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Ethereum_logo.svg/2000px-Ethereum_logo.svg.png"></img>
                            <div className={"flexContainer"}>
                                <div className={"contentContainer"}>
                                    <h6>{ tokenAbo ? parseInt(balances[this.programs[i].token]) + " x " + this.programs[i].token : this.programs[i].token }<i>{tokenAbo ? "" : " (nicht registriert!)"}</i></h6>
                                    <p><b>Beschreibung:</b> {this.programs[i].description}</p>
                                    <div className={"vendorsContainer"}>Anbieter:
                                        <br/>
                                        <div className={"vendorImgsContainer"}>
                                            {companyImgs}
                                        </div>
                                    </div>
                                </div>
                                <div className={"btnContainer"}>
                                    <Button id={i} onClick={(event) => this.listedBtn_Click(event.currentTarget)}><img src={"./svgs/" + (tokenAbo ? "shopping-cart.svg" : "plus.svg")}/></Button>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>);
        }
        this.setState({
            programsList: items
        });
        this.tokenBalances = balances;
    }

    private sleep (time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    private async listedBtn_Click(sender: HTMLButtonElement){
        const id:number = parseInt(sender.id);
        if(!this.tokenBalances[this.programs[id].token]){
            const pair = StellarSdk.Keypair.fromSecret(Cookies.get("secret"));
            const asset = new StellarSdk.Asset(this.programs[id].token, this.programs[id].address)
            const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
            const source = this.programs[id].address;
            await server.loadAccount(pair.publicKey())
                .then(function(receiver) {
                    var transaction = new StellarSdk.TransactionBuilder(receiver)
                    // The `changeTrust` operation creates (or alters) a trustline
                    // The `limit` parameter below is optional
                        .addOperation(StellarSdk.Operation.changeTrust({
                            asset: asset
                        }))
                        .build();
                    transaction.sign(pair);
                    return server.submitTransaction(transaction);
                });

            this.initListItems(this.currentLayout);


        }else{
            window.location.href=this.programs[id].shop;
        }


    }

    render() {
        return(
            <div id={"listContainer"}>
                {this.state.programsList}
            </div>
        );
    }
}


export default Sales;