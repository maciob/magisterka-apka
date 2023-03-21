import React, { useState , useEffect } from 'react';
import SessionExpired from '../components/sessionexpired';
import Navbar from '../components/upperbar';
import LowerBar from '../components/lowerbar';
import MyList from '../components/list';
import Menu from "../components/menu";
import Account from "../components/account";
import Entry from "../components/entry";
import NewEntry from "../components/newentry";
import GeneratorSettings from '../components/generatorsettings';
import "../css/home.css";
function Home() {
  const [sessionExpired, setSessionExpired] = useState(sessionStorage.getItem('sessionExpired') === 'true');

  return (
    <div>
      {sessionExpired ? (
        <div display="flex">
          <Navbar />
          <SessionExpired />
        </div>
      ) : (
        <div display="flex">
          <Navbar />
          <div className="footer">
            <LowerBar />
          </div>
          <div className="container">
            <div className="menu">
              <Menu />
            </div>
            <div className="list">
              <MyList />
            </div>
            <div className="details">
              { JSON.parse(sessionStorage.getItem('Entry')) && (
                <Entry />
              )}
              { JSON.parse(sessionStorage.getItem('Account')) && (
                <Account />
              )}
              { JSON.parse(sessionStorage.getItem('PasswordGenerator')) && (
                <NewEntry />
              )}
              { JSON.parse(sessionStorage.getItem('GeneratorSettings')) && (
                <GeneratorSettings />
              )}
              { JSON.parse(sessionStorage.getItem('AddNewAccount')) && (
                <NewEntry />
              )}
            </div>
          </div>
        </div>
        )}
    </div>

  );
}

export default Home;
