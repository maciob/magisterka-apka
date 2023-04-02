import React from 'react';
import '../css/login.css';
import Navbar from '../components/upperbar';

function Main() {
  return (
    <div>
        <Navbar/>
        <div className="form">
            <p>This page is a master's thesis done by Maciej Bekas.</p>
            <p>The subject of the thesis is a password manager issued by the AWS cloud.</p>
            <p>The application code and the terraform code are available in these repositories:</p>
            <ul>
                <li><a href="https://github.com/maciob/magisterka-apka">Application</a></li>
                <li><a href="https://github.com/maciob/magisterka-terraform">Terraform</a></li>
            </ul>
            <p>To use the application, register and then log in using the buttons on the right side of the top panel.</p>
        </div>
    </div>
  );
}

export default Main;