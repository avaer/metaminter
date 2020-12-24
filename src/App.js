import React, { useEffect, useState } from 'react'
import createHistory from 'history/createBrowserHistory'
import { AppContext } from "./libs/contextLib";
import { InitialStateValues } from "./constants/InitialStateValues";
import storage from "./functions/Storage";

import Routes from "./routes";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Loader from "./components/Loader";

import './assets/css/custom.css';
import './assets/css/content.css';

const App = () => {
  const [globalState, setGlobalState] = useState(InitialStateValues);

  const updateLocalStorage = async (globalState) => {
    if (globalState.logout === "true") {
       setGlobalState({ ...globalState, logout: "false", address: "", name: "", avatarUrl: "", avatarPreview: "", avatarFileName: "" });
      await storage.set('globalState', JSON.stringify(globalState));
    }
    if (globalState.address) {
      await storage.set('globalState', JSON.stringify(globalState));
    }
  }

  const getLocalStorage = async () => {
    const storageState = await storage.get('globalState');

    if (storageState) {
      setGlobalState(JSON.parse(storageState));
    }
  } 

  React.useEffect(() => {
    updateLocalStorage(globalState);
  }, [globalState]);

  React.useEffect(() => {
    getLocalStorage(); 
  }, []);


  return (
        <AppContext.Provider value={{ globalState, setGlobalState }}>
          <NavBar />
          <Routes />
          <Footer />
        </AppContext.Provider>
  )
}

export default App
