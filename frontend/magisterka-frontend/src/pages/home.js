import React, { useState , useEffect } from 'react';
import Navbar from '../components/upperbar';
import LowerBar from '../components/lowerbar';
import MyList from '../components/list';
import Menu from "../components/menu"
import Entry from "../components/entry"
import "../css/home.css"
function Home() {
  const sessionID = sessionStorage.getItem('sessionID');
  const hash = sessionStorage.getItem('hash');

  // const { sessionID, hash } = props;
  console.log(sessionID);
  console.log(hash);

  return (
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
            <text>Account</text>
          )}
          { JSON.parse(sessionStorage.getItem('PasswordGenerator')) && (
            <text>PasswordGenerator</text>
          )}
          { JSON.parse(sessionStorage.getItem('GeneratorSettings')) && (
            <text>GeneratorSettings</text>
          )}
          { JSON.parse(sessionStorage.getItem('AddNewAccount')) && (
            <text>AddNewAccount</text>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
