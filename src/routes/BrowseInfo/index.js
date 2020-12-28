import React, { useState, useEffect } from 'react'
import { Container, Row, Col } from 'react-grid-system';
import { Link, useParams } from "react-router-dom"
import MetaTags from 'react-meta-tags';
import { useAppContext } from "../../libs/contextLib";
import { getStores, getInventoryForCreator, getProfileForCreator } from "../../functions/UIStateFunctions.js";
import { buyAsset, sellAsset, depositAsset } from "../../functions/AssetFunctions.js";
import Loader from "../../components/Loader";
import "./style.css";

export default () => {
  const { id } = useParams();
  const { globalState, setGlobalState } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [profile, setProfile] = useState(null);
  const [sellPrice, setSellPrice] = useState(0);
  const [mainnetAddress, setMainnetAddress] = useState("");
  const [store, setStore] = useState(null);
  const [price, setPrice] = useState(null);
  const [pending, setPending] = useState(null);

  useEffect(() => {
    getInventoryForCreator(id, 0, true, globalState).then(res => {
      setItem(res.creatorInventories[id][0]);
      setLoading(false);
    });
    getStores().then(res => {
      if (res[id]) {
        setStore(res[id].id);
        setPrice(res[id].price);
      }
    });
  }, []);

  const ethEnabled = () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      window.ethereum.enable();
      return true;
    }
    return false;
  }

  const loginWithMetaMask = async () => {
    if (!ethEnabled()) {
      return "Please install MetaMask to use Webaverse!";
    } else {
      const web3 = window.web3;
      const eth = await window.ethereum.request({ method: 'eth_accounts' });
      if (eth && eth[0]) {
        return eth[0];
      } else {
        ethereum.on('accountsChanged', (accounts) => {
          handleTransfer();
        });
        return false;
      }
    }
  }

  const handleSuccess = (res) => {
    console.log("HANDLING SUCCESS", res);
    setGlobalState({ ...globalState, refresh: "true" });
    setLoading(false);
  }

  const handleError = (err) => {
    console.log("HANDLING ERROR", err);
    setLoading(false);
  }

  const handleBuy = (e) => {
    e.preventDefault();
    setLoading(true);
    getStores().then(res => {
      buyAsset(res[id].id, 'sidechain', globalState.loginToken.mnemonic, handleSuccess, handleError);
    });
  }

  const handleSell = (e) => {
    e.preventDefault();
    setLoading(true);
    sellAsset(id, sellPrice, 'sidechain', globalState.loginToken.mnemonic, handleSuccess, handleError);
  }

  const handleTransfer = async (e) => {
    if(e) {
      e.preventDefault();
    }

    setLoading(true);

    try {
      const ethAccount = await loginWithMetaMask();
      if (ethAccount) {
        console.log(id, 'webaverse', mainnetAddress, globalState);
        await depositAsset(id, 'webaverse', mainnetAddress, mainnetAddress, globalState);
        handleSuccess();
      } if (ethEnabled()) {
        setPending(true);
      } else {
        setLoading(false);
      }
    } catch (err) {
      handleError(err.toString());
    }
  }

  const handleSellPriceChange = (e) => {
    setSellPrice(e.target.value);
  }
  const handleMainnetAddressChange = (e) => {
    setMainnetAddress(e.target.value);
  }

  const Buttons = () => {
    if (item && globalState.address && globalState.address != item.owner.address.toLowerCase()) {
      return (
        <>
          <a className="button" onClick={e => handleBuy(e)}>
            Buy 
          </a>
        </>
      );
    } else {
      return null;
    }
  }

  const Item = () => item ? 
    <>
      <Col sm={12} md={6}>
        <div className="profileHeader">
          <div className="profileName">
            <h1 className="itemText">{item.name}</h1>
            <Link to={"/accounts/" + item.minter.address.toLowerCase()}>
              <p className="itemText">Minter: {item.minter.username}</p>
            </Link>
            <p>Total Supply: {item.totalSupply}</p>
            { price && ( <p>price: {price}</p> )}
          </div>
        </div>
      </Col>
      <Col sm={12} md={6}>
        <img className="itemImage" style={{
          backgroundImage: `url("${item.image}")`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
        }} />
      </Col>
    </>
  : null

  return (
    <Container>
      <Row style={{ justifyContent: "center" }}>
        { loading ?
          <Loader loading={loading} />
        : [
          <Item />,
          globalState.address && item && item.owner.address.toLowerCase() == globalState.address && (
            <Row style={{ justifyContent: "center" }}>
              <Col sm={12} md={8}>
                <input className="infoInput" type="number" onChange={handleSellPriceChange} placeholder="Sale price" />
                <a className="button" onClick={e => handleSell(e)}>
                  Sell
                </a>
              </Col>
              <Col sm={12} md={8}>
                <input className="infoInput" type="text" onChange={handleMainnetAddressChange} placeholder="Mainnet address" />
                <a className="button" onClick={e => handleTransfer(e)}>
                  Transfer
                </a>
              </Col>
            </Row>
          ),
          store && ( <Buttons /> )
        ]}
      </Row>
      { item && (
        <MetaTags>
          <title>{item.name}</title>
          <meta name="description" content={item.description} />
          <meta property="og:title" content={item.name} />
          <meta property="og:image" content={item.image} />
        </MetaTags>
      )}
    </Container>
  )
}
