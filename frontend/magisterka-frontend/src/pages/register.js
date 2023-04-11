import React, { useState } from 'react';
import Navbar from '../components/upperbar';
import '../css/login.css'
import Switch from "react-switch";
import LowerBar from '../components/lowerbar';
import PasswordInput from '../components/passwordinput';
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
  const [hash, setHash] = useState("");
  const [error, setError] = useState(false);
  

  const navigate = useNavigate();

  const validateEmail = (email) => {
    // regex to check if the email input is valid
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  

  function validatePassword(password) {
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,30}$/;
    return passwordRegex.test(password);
  }
  function validateLogin(str) {
    return str.length >= 5 && str.length <= 20;
  }
  function validatetwoFAtype(str) {
    return str === "Google Authenticator" || str === "Email";

  }


  const handleEmailChange = (e) => {
    const input = e.target.value;
    setEmail(input);
    setIsValidEmail(validateEmail(input))
  };

  async function registerUser(data) {
    try {
      const response =  await fetch('/api/User/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (response.status === 200) {
        const json = await response.json();
        return { success: true, data: json };
      } else if (response.status === 400){
        return { success: false, error: 'Such a user already exists.' };
      } else if (response.status === 500){
        return { success: false, error: 'Server error.' };
      } else {
        return { success: false, error: 'Something went wrong.' };
      }
    }
    catch (error)
    {
      console.error(error);
      return { success: false, error: error };
    }
  }

  const handleRegisterClick = async (e) => {
      e.preventDefault();
      if(!validateLogin(username)){
        setError("Username needs to have between 5 and 20 characters.");
      } else if(!validatePassword(password)){
        setError("Password needs to have between 8 and 30 characters and at least 1 special character, 1 number, 1 lower and 1 upper character.");
      } else if(!validateEmail(email)){
        setError("Invalid email.");
      } else if(twoFA === true && !validatetwoFAtype(twoFAtype)){
        setError("Choose two factor authentication method.");
      } else {
        setError("");
        const { success, data, error } = await registerUser({
          username,
          password,
          email,
          twoFA,
          twoFAtype
        });
        if(success) {
          if(data.twoFA === true && data.type === "Google Authenticator") {
            setGoogleAuthenticator(true);
            setSessionID(data.sessionID);
            setGoogleAuthenticatorPrivateKey(data.privateKey);
            setGoogleAuthenticatorURL(data.url);
            setHash(data.hash);
          } else {
            navigate('/login');
          }  
        } else {
          setError(error);
        }
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
        } else if (response.status === 404){
          return { success: false, error: 'Your session is invalid.' };
        } else if (response.status === 400){
          return { success: false, error: 'Invalid code.' };
        } else if (response.status === 500){
          return { success: false, error: 'Server error.' };
        } else {
          return { success: false, error: 'Something went wrong.' };
        }
      } catch (error) {
        console.error(error);
        return { success: false, error: error };
      }
    };
  
    const submit2FACode = async () => {
      const { success, data, error } = await submitCode({
        sessionID,
        twoFAtype,
        code,
        hash
      });
      if (success) {
        navigate('/login');
      } else {
        setError(error);
      }
    };
    
    const handlePasswordChange = (password) => {
      setPassword(password);
    }
  

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
              className="form-control"
            />
          </div>
          {error && <div className="form__error">{error}</div>}
          <button type="button" className="form__button" onClick={submit2FACode}>Submit</button>
        </div>
      ) : (
        <div className="form">
          <form autoComplete="off" onSubmit={handleRegisterClick} >
              <div className="form__input-group">
                  <label htmlFor="username" className="form__label">Username</label>
                  <input
                      type="text"
                      // id="username"
                      autoComplete="new-password"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="form-control"
                  />
              </div>
              <div className="form__input-group">
                  <label htmlFor="password" className="form__label">Password</label>
                  {/* <input
                      type="password"
                      // id="password"
                      value={password}
                      autoComplete="new-password"
                      onChange={(e) => setPassword(e.target.value)}
                      className="form__input"
                  /> */}
                  <PasswordInput onPasswordChange={handlePasswordChange} />
              </div>
              <div className="form__input-group">
                  <label htmlFor="email" className="form__label">Email</label>
                      <input
                          type="text"
                          id="email"
                          value={email}
                          onChange={handleEmailChange}
                          className="form-control"
                      />
                  </div>
                  {!isValidEmail && (
                      <div className="form__error">Please enter a valid email address</div>
                  )}
              <div/>            
              <div className="form__input-group">
                  <label htmlFor="twoFA" className="form__label">2FA</label>
                  <div>
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
                      className="form-control"
                      input="Select two-factor authentication type"
                  >
                  <option value="" selected disabled hidden>Select two-factor authentication type</option>
                  <option value="Email">Email</option>
                  <option value="Google Authenticator">Google Authenticator</option>
                  </select>
              </div>
              )}
              {error && <div className="form__error">{error}</div>}
              <br/>
              <button type="submit" className="form__button">Register</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default RegisterPage;
