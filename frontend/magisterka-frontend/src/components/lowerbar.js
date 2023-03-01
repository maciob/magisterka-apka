import React, { useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';
import '../css/lowerbar.css'

function LowerBar() {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
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
    // Send POST request when timeLeft reaches 0
    if (timeLeft === 0) {
      fetch('/api/User/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: 'Timer finished' })
      })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.log(error));
      
      // Reset timer to 5 minutes
      setTimeLeft(300);
      navigate('/home');
    }
  }, [timeLeft]);

  return (
    <div className="lower-bar">
      <p>Time left: {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? '0' : ''}{timeLeft % 60}</p>
    </div>
  );
}
export default LowerBar;
