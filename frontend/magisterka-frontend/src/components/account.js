import React, { useState , useEffect } from 'react';
import '../css/account.css'
import Switch from "react-switch";
function Account() {
  const [username, setUsername] = useState('');
  const [oldpassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(null);
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [twoFA, setTwoFA] = useState(true);
  const [twoFAtype, setTwoFAtype] = useState("");
  const [items, setItems] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordChange, setPasswordChange] = useState(false);
  const [sessionID, setSessionID] = useState(sessionStorage.getItem('sessionID'));
  const [TwoFAChange, setTwoFAChange] = useState(false);
  const [OldTwoFA, setOldTwoFA] = useState(true);
  const [OldTwoFAtype, setOldTwoFAtype] = useState("");


  useEffect(() => {
    // fetch('/api/Website/entry?sessionID='+sessionStorage.getItem('sessionID')+'&websiteID='+sessionStorage.getItem('EntryValue')+'&hash='+sessionStorage.getItem('hash'))
    //   .then(response => response.json())
    //   .then(data => setItems(data))
    //   .catch(error => console.log(error));
  }, []);

  const validateEmail = (email) => {
    // regex to check if the email input is valid
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  async function submitPassword(data) {
    try {
      return await fetch('/api/User/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }).then(data => data.json())
    }
    catch (error)
    {
      console.error(error);
      setError('An error occurred while trying to login');
    }
  }

  const handlePasswordSumbit = async (e) => {
    e.preventDefault();
    const value = await submitPassword({
      sessionID,
      oldpassword,
      password
    });
    sessionStorage.setItem('hash', value.hash);
  };

  const handleEmailChangeClick = (e) => {
    const input = e.target.value;
  };
  const ShowPasswordForm = () => {
    setPasswordChange(true)
  };
  const CancelPasswordForm = () => {
    setPasswordChange(false)
  };
  const Show2FAForm = () => {
    setTwoFAChange(false)
  };
  const Cancel2FAForm = () => {
    setTwoFAChange(true)
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    const value = await submit2FA({
      sessionID,
      twoFA,
      twoFAtype
    });
    // sessionStorage.setItem('hash', value.hash);
  };

  async function submit2FA(data) {
    try {
      return await fetch('/api/User/asd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }).then(data => data.json())
    }
    catch (error)
    {
      console.error(error);
      setError('An error occurred while trying to login');
    }
  }

  return (
    <div>
        <div className="account_form">
            <div>
                <h2>Personal information</h2>                    
            </div>
            <form onSubmit={handleEmailChangeClick}>
                <div className="account_form__input-group">
                    <label id="a1" htmlFor="username" className="account_form__label">Username</label>
                    <label id="a2" htmlFor="username" className="account_form__label">Username</label>
                </div>
                <div className="account_form__input-group">
                    <label id="a1" htmlFor="password" className="account_form__label">Email</label>
                </div>
            </form>
        </div>
        <div className="account_form">
            <div>
                <h2>Master Password</h2>                    
            </div>
            <form onSubmit={handlePasswordSumbit}>
                { passwordChange ? (
                <div>
                  <div className="account_form__input-group">
                    <label id="a1" htmlFor="oldpassword" className="account_form__label">Old password</label>
                    <input
                      type="password"
                      id="oldpassword"
                      value={oldpassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="account_form__input"
                    />
                  </div>
                  <div className="account_form__input-group">
                    <label id="a1" htmlFor="newpassword" className="account_form__label">New password</label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="account_form__input"
                    />
                  </div>
                  <div className="account_form__input-group">
                    <div className="account_menu-middle-2">
                      <button type="submit" className="account_menu-button">Sumbit</button>
                      <button className="account_menu-button" onClick={CancelPasswordForm}>Cancel</button>
                    </div>
                  </div>
                </div>
                ):(
                <div>
                  <div className="account_form__input-group">
                    <label id="a1" className="account_form__label">Password</label>
                    <label id="a2" className="account_form__label">********</label>
                  </div>
                  <div className="account_form__input-group">
                    <div className="account_menu-middle">
                      <button className="account_menu-button" onClick={ShowPasswordForm}>Change</button>
                    </div>
                  </div>
                </div>
                )}
            </form>
        </div>
        <div className="account_form">
            <div>
                <h2>2nd factor authentication</h2>                    
            </div>
            <form onSubmit={handle2FASubmit}>
                { !TwoFAChange ? (
                <div>
                  <div className="account_form__input-group">
                    <label id="a1" className="account_form__label">Enable 2FA</label>
                    <Switch 
                            disabled={!TwoFAChange}
                            onChange={(checked) => setOldTwoFA(checked)} 
                            checked={OldTwoFA}
                            className="react-switch"
                        />
                  </div>
                  <div className="account_menu-middle-2">
                  {OldTwoFA && (
                    <select
                      id="twoFAtype"
                      value={OldTwoFAtype}
                      disabled={!TwoFAChange}
                      onChange={(e) => setTwoFAtype(e.target.value)}
                      className="account_form__input"
                      input="Select two-factor authentication type">
                    <option value="Email">Email</option>
                    <option value="Google Authenticator">Google Authenticator</option>
                    </select>
                  )}
                  </div>
                  <div className="account_form__input-group">
                    <div className="account_menu-middle">
                      <button className="account_menu-button" onClick={Cancel2FAForm}>Change</button>
                    </div>
                  </div>
                </div>
                ):(
                <div>
                  <div className="account_form__input-group">
                    <label id="a1" className="account_form__label">Enable 2FA</label>
                    <Switch 
                            onChange={(checked) => setTwoFA(checked)} 
                            checked={twoFA}
                            className="react-switch"
                        />
                  </div>
                    <div className="account_menu-middle-2">
                    {twoFA && (
                      <select
                        id="twoFAtype"
                        value={twoFAtype}
                        disabled={!TwoFAChange}
                        onChange={(e) => setTwoFAtype(e.target.value)}
                        className="account_form__input"
                        input="Select two-factor authentication type">
                      <option value="Email">Email</option>
                      <option value="Google Authenticator">Google Authenticator</option>
                      </select>
                    )}
                    </div>
                    <div className="account_menu-middle-2">
                      <button type="submit" className="account_menu-button">Submit</button>
                      <button className="account_menu-button" onClick={Show2FAForm}>Cancel</button>
                    </div>
                </div>
                )}
            </form>
        </div>

    </div>
  );
}

export default Account;
