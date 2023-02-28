import React, { useState } from 'react';
import Navbar from '../components/upperbar';
import '../css/login.css'
import Switch from "react-switch";

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(null);
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [twoFA, setTwoFA] = useState(false);
  const [twoFAtype, setTwoFAtype] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email) => {
    // regex to check if the email input is valid
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e) => {
    const input = e.target.value;
    setEmail(input);
    setIsValidEmail(validateEmail(input));
  };


  const handleRegisterClick = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/User/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email, twoFA, twoFAtype }),
      });
      if (response.ok) {
        setSuccess(true);
      } else {
        setError('Invalid username or password');
      }
    } catch (error) {
      console.error(error);
      setError('An error occurred while trying to login');
    }
  };

  if (success) {
    return <div>You have registered!</div>;
  }

  return (
    <div>
      <Navbar />
      <div className="form">
        <form onSubmit={handleRegisterClick}>
            <div className="form__input-group">
                <label htmlFor="username" className="form__label">Username</label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form__input"
                />
            </div>
            <div className="form__input-group">
                <label htmlFor="password" className="form__label">Password</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form__input"
                />
            </div>
            <div className="form__input-group">
                <label htmlFor="email" className="form__label">Email</label>
                    <input
                        type="text"
                        id="email"
                        value={email}
                        onChange={handleEmailChange}
                        className="form__input"
                    />
                </div>
                {!isValidEmail && (
                    <div className="form__error">Please enter a valid email address</div>
                )}
            <div/>            
            <div className="form__input-group">
                <label htmlFor="twoFA" className="form__label">2FA</label>
                <div className="form__toggle">
                    <label>
                        <Switch 
                            onChange={(checked) => setTwoFA(checked)} 
                            checked={twoFA}
                            className="react-switch"
                        />
                    </label>
                </div>
            </div>
            {twoFA && (
            <div className="form__input-group">
                <select
                    id="twoFAtype"
                    value={twoFAtype}
                    onChange={(e) => setTwoFAtype(e.target.value)}
                    className="form__input"
                    input="Select two-factor authentication type"
                >
                <option value="" selected disabled hidden>Select two-factor authentication type</option>
                <option value="Email">Email</option>
                <option value="Google Authenticator">Google Authenticator</option>
                </select>
            </div>
            )}
            {error && <div className="form__error">{error}</div>}
            <button type="submit" className="form__button">Register</button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
