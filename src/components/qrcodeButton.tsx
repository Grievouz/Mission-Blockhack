import "./qrcodeButton.css";
import "./popup.css";
import * as React from "react";
import * as Cookies from 'es-cookie';
import * as StellarSdk from "stellar-sdk";
import { QRCode } from 'react-qr-svg';
import { Card, CardImg, CardText, CardBody,CardTitle, CardSubtitle, Button } from 'reactstrap';
import Popup from 'react-popup';

class QrCodeButton extends React.Component<{}, {}> {

    render() {
        return(
            <Button onClick={() => this.triggerQr()} className={"qrButton btn"}>
                <img src="./svg s/qr-code.svg"></img>
            </Button>
        );
    }

    private triggerQr(){
        let key: string = StellarSdk.Keypair.fromSecret(Cookies.get("secret")).publicKey();
        Popup.alert(<QRCode

            bgColor="#FFFFFF"
            fgColor="#000000"
            level="H"
            style={{ height: "inherit",
                    maxHeight: "400px"
            }}
            value={key}
        />);
    }
}

export default QrCodeButton;