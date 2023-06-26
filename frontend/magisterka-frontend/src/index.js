import React , { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import Home from './pages/home';
import Activate from './pages/activate';
import Main from './pages/main';
import NotFoundPage from './pages/notfound';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Main/>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/activate" element={<Activate />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);


