import React, { useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';
import '../css/lowerbar.css'

function LowerBar() {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [sessionID, setSessionID] = useState(sessionStorage.getItem('sessionID'));
  const navigate = useNavigate();

  useEffect(() => {
    // Set interval to update timeLeft every second
    const interval = setInterval(() => {
      setTimeLeft(prevTimeLeft => prevTimeLeft - 1);
    }, 1000);

    // Clean up interval when component unmounts
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function LogoutAndRedirect(data) {
      if (timeLeft === 0) {
        sessionStorage.setItem('Entry', false);
        sessionStorage.setItem('Account', false);
        sessionStorage.setItem('PasswordGenerator', false);
        sessionStorage.setItem('GeneratorSettings', false);
        sessionStorage.setItem('AddNewAccount', false);
        try {
          const value = await Logout({
            sessionID
          });
          sessionStorage.setItem('sessionID','');
          sessionStorage.setItem('sessionExpired', true);
          setTimeLeft(300);
          navigate('/');
        } catch (error) {
          console.error(error);
        }
      }
    }
    LogoutAndRedirect();
  }, [timeLeft]);
  
  async function Logout(data) {
    try {
        return await fetch('/api/User/logout?sessionID=' + data.sessionID, { method: 'POST' }).then(data => data.json())
    }
    catch (error)
    {
        console.error(error);
    }
  }
  
  return (
    <div className="lower-bar">
      <p>Time left in session: {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? '0' : ''}{timeLeft % 60}</p>
    </div>
  );
}
export default LowerBar;
