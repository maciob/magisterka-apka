import React, { useState } from 'react';
import Navbar from '../components/upperbar';
import '../css/login.css'
import LowerBar from '../components/lowerbar';
import {useNavigate} from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  async function loginUser(credentials) {
    try {
      return await fetch('/api/User/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      }).then(data => data.json())
    }
    catch (error)
    {
      console.error(error);
      setError('An error occurred while trying to login');
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    const value = await loginUser({
      username,
      password
    });
    sessionStorage.setItem('sessionID', value.sessionID);
    sessionStorage.setItem('hash', value.hash);

    // try {
    //   const response = await fetch('/api/User/login', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ username, password }),
    //   });

    //   if (response.ok) {
    //     const {sessionID, hash} = await response.json();
    //     setHash("hash");
    //     setSession("sessionID");  
    //     setSuccess(true);
    //     console.error(sessionID);
    //     console.error(hash);
    navigate('/home');
    //   } else {
    //     setHash("hash");
    //     setSession("sessionID");
    //     console.log('sessionID:', sessionID);
    //     console.log('hash:', hash);
    //     navigate('/home', { state: { sessionID, hash} });
    //     setError('Invalid username or password');
    //   }
    // } catch (error) {
    //   console.error(error);
    //   setError('An error occurred while trying to login');
    // }
  };

  if (success) {
    return <div>You have successfully logged in!</div>;
  }

  return (
    <div>
      <Navbar />
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
      <LowerBar />
    </div>
  );
}

export default LoginPage;
