import React from 'react';
import '../css/sessionexpired.css';
 
function SessionExpired() {
  return (
    <div className='sessionexpired__container'>
      <h2 className='sessionexpired__message'>Your session has expired</h2>
      <p className='sessionexpired__message'>Please log in again to continue using the app.</p>
    </div>
  );
}

export default SessionExpired;
