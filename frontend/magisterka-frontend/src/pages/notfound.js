import React from 'react';
import '../css/login.css';
import Navbar from '../components/upperbar';

const NotFoundPage = () => {
  return (
    <div>
        <Navbar/>
        <div className="form">
            <h2>404 - Page Not Found</h2>
            <p>The page you are looking for does not exist.</p>
        </div>
    </div>
  );
};

export default NotFoundPage;
