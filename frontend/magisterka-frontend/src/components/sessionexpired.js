import React from 'react';
import '../css/sessionexpired.css';
 
function SessionExpired() {
  return (
    <div>
      <div className='sessionexpired__container'>
        <h2 className='sessionexpired__message'>Your session has expired. Log in to continue using the app.</h2>
      </div>
    </div>
  );
}

export default SessionExpired;
