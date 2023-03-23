import React, { useState } from 'react';
import Navbar from '../components/upperbar';
import '../css/login.css'
import LowerBar from '../components/lowerbar';
import {useNavigate} from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [googleAuthenticator, setGoogleAuthenticator] = useState(false);
  const [code, setCode] = useState("");
  const [sessionID, setSessionID] = useState("");
  const [twoFAtype, setTwoFAtype] = useState("");

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
      } else {
        return { success: false, error: 'Invalid login or password.' };
      }
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Error submitting credentials.' };
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
        setGoogleAuthenticator(true);
        setSessionID(data.sessionID);
        setTwoFAtype(data.type);
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
          <button type="submit" className="form__button">Login</button>
        </form>
      </div>
      )}
    </div>
  );
}

export default LoginPage;
