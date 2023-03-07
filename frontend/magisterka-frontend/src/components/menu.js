import React from 'react';
import '../css/menu.css';

const Menu = () => {

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
        <button className="menu-button menu-button-logout">Logout</button>
        <text>Version: 1.0.0</text>
        <br />
        <br />
      </div>
    </div>
  );
};

export default Menu;
