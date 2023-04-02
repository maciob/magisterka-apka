import React, { useState } from 'react';
import Navbar from '../components/upperbar';
import '../css/login.css'
import {useNavigate} from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [googleAuthenticator, setGoogleAuthenticator] = useState(false);
  const [code, setCode] = useState("");
  const [sessionID, setSessionID] = useState("");
  const [twoFAtype, setTwoFAtype] = useState("");
  const [hash, setHash] = useState("")
  const [email, setEmail] = useState(false);
  const [twoFA, setTwoFA] = useState(false);

  const navigate = useNavigate();

  async function loginUser(credentials) {
    try {
      const response = await fetch('/api/User/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      if (response.status === 200) {
        const json = await response.json();
        return { success: true, data: json };
      } else if (response.status === 401){
        return { success: false, error: 'Account not activated. Check your email.' };
      } else if (response.status === 404){
        return { success: false, error: 'Invalid login or password.' };
      } else if (response.status === 500){
        return { success: false, error: 'Server error.' };
      } else {
        return { success: false, error: 'Something went wrong.' };
      }
    } catch (error) {
      console.error(error);
      return { success: false, error: error };
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    const { success, data, error } = await loginUser({
      username,
      password
    });
    if (success) {
      if(data.otp === true)
      {
        setTwoFA(true)
        if(data.type === "Google Authenticator"){
          setGoogleAuthenticator(true);
        }
        setSessionID(data.sessionID);
        setTwoFAtype(data.type);
        setHash(data.hash);
        setError("");
      }
      else
      {
        sessionStorage.setItem('sessionID', data.sessionID);
        sessionStorage.setItem('hash', data.hash);
        sessionStorage.setItem('sessionExpired', false);
        navigate('/home');
      }
    } else {
      setError(error);
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
        return { success: false, error: 'Not found, session or user are invalid.' };
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
      sessionStorage.setItem('sessionID', data.sessionID);
      sessionStorage.setItem('hash', data.hash);
      sessionStorage.setItem('sessionExpired', false);
      navigate('/home');
    } else {
      setError(error);
    }
  };
  
  return (
    <div>
      <Navbar />
      {twoFA ? (
        <div>
          {googleAuthenticator ? (
            <div className="form">
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
              <div className="form__input-group">
                <label className="form__label">Type in code send to the email.</label>
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
          )}
        </div>
      ) : (
        <div className="form">
          <form onSubmit={handleLogin}>
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
            {error && <div className="form__error">{error}</div>}
            <br/>
            <button type="submit" className="form__button">Login</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
