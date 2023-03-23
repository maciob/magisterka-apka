import React, { useState } from 'react';
import Navbar from '../components/upperbar';
import '../css/login.css'
import Switch from "react-switch";
import LowerBar from '../components/lowerbar';
import {useNavigate} from 'react-router-dom';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(null);
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [twoFA, setTwoFA] = useState(false);
  const [twoFAtype, setTwoFAtype] = useState("");
  const [sessionID, setSessionID] = useState("");
  const [googleAuthenticator, setGoogleAuthenticator] = useState(false);
  const [googleAuthenticatorPrivateKey, setGoogleAuthenticatorPrivateKey] = useState("");
  const [code, setCode] = useState("");
  const [googleAuthenticatorURL, setGoogleAuthenticatorURL] = useState("");
  const [status, setStatus] = useState("");

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

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

  async function registerUser(data) {
    try {
      return await fetch('/api/User/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }).then(data => data.json())
    }
    catch (error)
    {
      console.error(error);
      setError('An error occurred while trying to register');
    }
  }

  const handleRegisterClick = async (e) => {
    e.preventDefault();
      const value = await registerUser({
        username,
        password,
        email,
        twoFA,
        twoFAtype
      });
      if(value.twoFA === true)
      {
        setGoogleAuthenticator(true);
        setSessionID(value.sessionID)
        setGoogleAuthenticatorPrivateKey(value.privateKey)
        setGoogleAuthenticatorURL(value.url)
      }
      else
      {
        navigate('/login');
      }
    };

    async function submitCode(data) {
      try {
        const response = await fetch('/api/User/otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        if (response.status === 200) {
          const json = await response.json();
          return { success: true, data: json };
        } else {
          return { success: false, error: 'Invalid code.' };
        }
      } catch (error) {
        console.error(error);
        return { success: false, error: 'Error submitting code.' };
      }
    };
  

    
    const submit2FACode = async () => {
      const { success, data, error } = await submitCode({
        sessionID,
        twoFAtype,
        code
      });
      if (success) {
        navigate('/login');
      } else {
        setError(error);
      }
    };
  return (
    <div>
      <Navbar />
      {googleAuthenticator ? (
        <div className="form">
          <div className="form__input-group">
            <label className="form__label">Scan the generated QR code or type in the private key in Google Authenticator application.</label>
          </div>
          <div className="form__input-group">
            <img
              src={googleAuthenticatorURL}
            />
          </div>
          <div className="form__input-group">
            <label className="form__label">{googleAuthenticatorPrivateKey}</label>
          </div>
          <div className="form__input-group">
            <label className="form__label">Type in code generated in Google Authenticator application.</label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="form__input"
            />
          </div>
          {error && <div className="form__error">{error}</div>}
          <button type="button" className="form__button" onClick={submit2FACode}>Submit</button>
        </div>
      ) : (
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
      )}
    </div>
  );
}

export default RegisterPage;
