import React, { useState , useEffect } from 'react';
import {useNavigate} from 'react-router-dom';
import '../css/menu.css';

const Menu = () => {

  const [sessionID, setSessionID] = useState(sessionStorage.getItem('sessionID'));
  const navigate = useNavigate();

  const handleAccountClick = () => {
    sessionStorage.setItem('Entry', false);
    sessionStorage.setItem('Account', true);
    sessionStorage.setItem('PasswordGenerator', false);
    sessionStorage.setItem('GeneratorSettings', false);
    sessionStorage.setItem('AddNewAccount', false);
    window.location.reload(false)
  };
  const handlePasswordGeneratorClick = () => {
    sessionStorage.setItem('Entry', false);
    sessionStorage.setItem('Account', false);
    sessionStorage.setItem('PasswordGenerator', true);
    sessionStorage.setItem('GeneratorSettings', false);
    sessionStorage.setItem('AddNewAccount', false);
    window.location.reload(false)
  };
  const handleGeneratorSettingsClick = () => {
    sessionStorage.setItem('Entry', false);
    sessionStorage.setItem('Account', false);
    sessionStorage.setItem('PasswordGenerator', false);
    sessionStorage.setItem('GeneratorSettings', true);
    sessionStorage.setItem('AddNewAccount', false);
    window.location.reload(false)
  };
  const handleAddNewAccountClick = () => {
    sessionStorage.setItem('Entry', false);
    sessionStorage.setItem('Account', false);
    sessionStorage.setItem('PasswordGenerator', false);
    sessionStorage.setItem('GeneratorSettings', false);
    sessionStorage.setItem('AddNewAccount', true);
    window.location.reload(false)
  };

  const handleLogoutClick = async () => {
    sessionStorage.setItem('Entry', false);
    sessionStorage.setItem('Account', false);
    sessionStorage.setItem('PasswordGenerator', false);
    sessionStorage.setItem('GeneratorSettings', false);
    sessionStorage.setItem('AddNewAccount', false);
    const value = await Logout({
      sessionID
    });
    sessionStorage.setItem('sessionID','');
    sessionStorage.setItem('sessionExpired', true);
    navigate('/login');
  }

  async function Logout(data) {
      try {
          return await fetch('/api/User/logout?sessionID=' + data.sessionID, {
              method: 'POST' }).then(data => data.json())
      }
      catch (error)
      {
          console.error(error);
      }
  }

  

  return (
    <div className="menu-container">
      <div className="menu-top">
        {/* <img src={logo} alt="logo" /> */}
      </div>
      <div className="menu-middle">
        <button className="menu-button" onClick={handleAccountClick}>Account Settings</button>
        <button className="menu-button" onClick={handlePasswordGeneratorClick}>Password Generator</button>
        <button className="menu-button" onClick={handleGeneratorSettingsClick}>Generator Settings</button>
        <button className="menu-button" onClick={handleAddNewAccountClick}>Add New Account</button>
      </div>
      <div className="menu-bottom">
        <button className="menu-button menu-button-logout" onClick={handleLogoutClick}>Logout</button>
        <text>Version: 1.0.0</text>
        <br />
        <br />
      </div>
    </div>
  );
};

export default Menu;
