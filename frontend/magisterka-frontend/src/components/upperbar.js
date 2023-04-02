import React from 'react';
import {useNavigate} from 'react-router-dom';
import '../css/upperbar.css';
import '../css/menu.css';

function Navbar() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };
  const handleHomeClick = () => {
    navigate('/');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <div className="navbar">
        <div className="left-button">
            <div className="navbar__new_button" onClick={handleHomeClick}>
                <text>Home</text>
            </div>
        </div>
        <div className="right-buttons">
            <div className="navbar__new_button" onClick={handleLoginClick}>
                <text>Login</text>
            </div>
            <div className="navbar__new_button" onClick={handleRegisterClick}>
                <text>Register</text>
            </div>
        </div>
    </div>
  );
}

export default Navbar;
