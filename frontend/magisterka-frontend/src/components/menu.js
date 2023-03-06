import React from 'react';
import '../css/menu.css';

const Menu = () => {
  return (
    <div className="menu-container">
      <div className="menu-top">
        {/* <img src={logo} alt="logo" /> */}
      </div>
      <div className="menu-middle">
        <button className="menu-button">Account Settings</button>
        <button className="menu-button">Password Generator</button>
        <button className="menu-button">Generator Settings</button>
        <button className="menu-button">Add New Account</button>
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
