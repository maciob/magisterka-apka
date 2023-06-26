import React, { useState , useEffect } from 'react';
import '../css/account.css'
import Switch from "react-switch";
import {useNavigate} from 'react-router-dom';
import PasswordInput from '../components/passwordinput';
import '../css/login.css'

function Account() {
  const [username, setUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [email, setEmail] = useState(null);
  const [accountType, setAccountType] = useState(null);
  const [twoFA, setTwoFA] = useState();
  const [twoFAtype, setTwoFAtype] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [twoFAError, set2FAError] = useState(false);
  const [passwordChange, setPasswordChange] = useState();
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [sessionID, setSessionID] = useState(sessionStorage.getItem('sessionID'));
  const [hash, setHash] = useState(sessionStorage.getItem('hash'));
  const [TwoFAChange, setTwoFAChange] = useState();
  const [OldTwoFA, setOldTwoFA] = useState();
  const [OldTwoFAtype, setOldTwoFAtype] = useState("");
  const [twoFAresponse, setTwoFAresponse] = useState(false);
  const [code, setCode] = useState("");
  const [googleAuthenticatorURL, setGoogleAuthenticatorURL] = useState("");
  const [googleAuthenticatorPrivateKey, setGoogleAuthenticatorPrivateKey] = useState("");
  const [twoFACodeError, setTwoFACodeError] = useState("");
  const [deleteAccount, setDeleteAccount] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetch('/api/User/account?sessionID='+sessionStorage.getItem('sessionID')+'&hash='+sessionStorage.getItem('hash'))
      const json = await data.json();
      setUsername(json.login)
      setEmail(json.email)
      setOldTwoFA(json.twoFa)
      setOldTwoFAtype(json.twoFAtype)
      setAccountType(json.type)
  }
  fetchData().catch(console.error);
}, []);

  async function submitPassword(data) {
    try {
      const response = await fetch('/api/User/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
        if(response.status === 200){
          const json = await response.json();
          return { success: true, data: json };
        }else if(response.status === 404){
          return { success: false, error: 'Bad old password.' };
        }else if(response.status === 403){
          return { success: false, error: 'Invalid session.' };
        }else if(response.status === 500){
          return { success: false, error: 'Server error.' };
        }else{
          return { success: false, error: 'Something went wrong.' };
        }
    }
    catch (error)
    {
      console.error(error);
      setPasswordError('An error occurred while trying to change password');
    }
  }

  const handlePasswordSumbit = async (e) => {
    e.preventDefault();
    const { success, data, error } = await submitPassword({
        sessionID,
        oldPassword,
        newPassword
      });
      if(success){
        sessionStorage.setItem('hash', data.hash);
        setPasswordChange(false);
        window.location.reload(false)
      }
      else{
        setPasswordError(error);
      }
    };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    const { success, data, error } = await deleteAcc({
      sessionID,
      confirmedPassword
    });
    if(success){
      sessionStorage.setItem('hash', "");
      sessionStorage.setItem('sessionID', "");
      navigate("/login")
    }
    else{
      setPasswordError(error);
    }

    // const input = e.target.value;
  };
  async function deleteAcc(data) {
    try {
      const response = await fetch('/api/User/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
        if(response.status === 200){
          //const json = await response.json();
          return { success: true };
        }else if(response.status === 404){
          return { success: false, error: 'Wrong password.' };
        }else if(response.status === 401){
          return { success: false, error: 'Session has expired.' };
        }else if(response.status === 500){
          return { success: false, error: 'Server error.' };
        }else{
          return { success: false, error: 'Something went wrong.' };
        }
    }
    catch (error)
    {
      console.error(error);
      setPasswordError('An error occurred while trying to delete the account.');
    }
  }




  const ShowPasswordForm = () => {
    setPasswordChange(true);
  };
  const ShowDeleteForm = () => {
    setDeleteAccount(true);
  };
  const CancelDeleteForm = () => {
    setConfirmedPassword("");
    setDeleteAccount(false);
  };
  const CancelPasswordForm = () => {
    setPasswordError("");
    setNewPassword("");
    setOldPassword("");
    setPasswordChange(false);
  };
  const Show2FAForm = () => {
    setTwoFA(OldTwoFA);
    setTwoFAtype(OldTwoFAtype);  
    setTwoFAChange(true);
  };
  const Cancel2FAForm = () => {
    set2FAError("");
    setConfirmedPassword("");
    setTwoFAChange(false);
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    const { success, data, error } = await submit2FA({
      sessionID,
      twoFA,
      twoFAtype,
      confirmedPassword
    });
    if(!success){
      set2FAError(error);
    } else {
      setTwoFAChange(false);
      if(data.twoFA === true && data.type === "Google Authenticator"){
        setTwoFAresponse(true);
        setGoogleAuthenticatorURL(data.url);
        setGoogleAuthenticatorPrivateKey(data.privateKey);
      } else {
        window.location.reload(false)
      }
    }
  };

  async function submit2FA(data) {
    try {
      const response = await fetch('/api/User/otp', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });      
      if(response.status === 200){
        const json = await response.json();
        return { success: true, data: json };
      } else if (response.status === 404) {
        return { success: false, error: 'Your session is invalid.' };
      } else if (response.status === 401) {
        return { success: false, error: 'Wrong password.' };
      } else if (response.status === 304) {
        return { success: false, error: '2FA not changed.' };
      } else if (response.status === 500) {
        return { success: false, error: 'Server error.' };
      } else {
        return { success: false, error: 'Something went wrong.' };
      }
    } 
    catch (error)
    {
      console.error(error);
      set2FAError('An error occurred while trying to change 2FA');
    }
  }

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
      } else if (response.status === 404){
        return { success: false, error: 'Your session is invalid.' };
      } else if (response.status === 400){
        return { success: false, error: 'Invalid code.' };
      } else if (response.status === 500){
        return { success: false, error: 'Server error.' };
      } else {
        return { success: false, error: 'Something went wrong.' };
      }
    } catch (error) {
      console.error(error);
      return { success: false, error: error };
    }
  };

  const submit2FACode = async () => {
    const { success, data, error } = await submitCode({
      sessionID,
      twoFAtype,
      code,
      hash
    });
    if (!success) {
      setTwoFACodeError(error);
    }
    else {
      setTwoFACodeError("");
      window.location.reload(false);
    }
  };

  const handleConfirmPassword = (password) => {
    setConfirmedPassword(password);
  }
  const handleOldPassword = (password) => {
    setOldPassword(password);
  }
  const handleNewPassword = (password) => {
    setNewPassword(password);
  }

  return (
    <div>
        <div className="account_form">
            <div>
                <h2>Personal information</h2>                    
            </div>
            <form onSubmit={handleDeleteAccount}>
              { deleteAccount ? (
                <div>
                <div className="account_form__input-group">
                    <label id="a2" htmlFor="username" className="account_form__label">Username</label>
                    <label id="a1" htmlFor="username" className="account_form__label">{username}</label>
                </div>
                <div className="account_form__input-group">
                    <label id="a2" htmlFor="password" className="account_form__label">Email</label>
                    <label id="a1" htmlFor="username" className="account_form__label">{email}</label>
                </div>
                <div className="account_form__input-group">
                    <label id="a4" htmlFor="username" className="account_form__label">Do you want to delete your account?</label>
                </div>
                <div className="account_form__input-group">
                    <label id="a1" htmlFor="newPassword" className="account_form__label">Confirm password</label>
                    <PasswordInput onPasswordChange={handleConfirmPassword} />
                    {/* <input
                      type="password"
                      id="confirmedPassword"
                      value={confirmedPassword}
                      onChange={(e) => setConfirmedPassword(e.target.value)}
                      className="account_form__input"
                    /> */}
                </div>
                {passwordError && <div className="form__error">{passwordError}</div>}
                <div className="account_form__input-group">
                  <div className="account_menu-middle-2">
                    <button type="submit" className="account_menu-button">Sumbit</button>
                    <button className="account_menu-button" onClick={CancelDeleteForm}>Cancel</button>
                  </div>
                </div>
              </div>
              ) : (
              <div>
                <div className="account_form__input-group">
                    <label id="a2" htmlFor="username" className="account_form__label">Username</label>
                    <label id="a1" htmlFor="username" className="account_form__label">{username}</label>
                </div>
                <div className="account_form__input-group">
                    <label id="a2" htmlFor="password" className="account_form__label">Email</label>
                    <label id="a1" htmlFor="username" className="account_form__label">{email}</label>
                </div>
                <div className="account_form__input-group">
                  <div className="account_menu-middle">
                    <button className="account_menu-button" onClick={ShowDeleteForm}>Delete</button>
                  </div>
                </div>
              </div>
              )}
            </form>
        </div>
        { !accountType && (
        <div className="account_form">
            <div>
                <h2>Master Password</h2>                    
            </div>
            <form onSubmit={handlePasswordSumbit}>
                { passwordChange ? (
                <div>
                  <div className="account_form__input-group">
                    <label id="a1" htmlFor="oldPassword" className="account_form__label">Old password</label>
                    <PasswordInput onPasswordChange={handleOldPassword} />
                    {/* <input
                      type="password"
                      id="oldPassword"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="account_form__input"
                    /> */}
                  </div>
                  <div className="account_form__input-group">
                    <label id="a1" htmlFor="newPassword" className="account_form__label">New password</label>
                    {/* <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="account_form__input"
                    /> */}
                    <PasswordInput onPasswordChange={handleNewPassword} />
                  </div>
                  {passwordError && <div className="form__error">{passwordError}</div>}
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
        )}
        <div className="account_form">
            <div>
                <h2>2nd factor authentication</h2>                    
            </div>
            {twoFAresponse ? (
              <div className="form">
                <div className="form__input-group">
                  <label className="form__label">Scan the generated QR code or type in the private key in Google Authenticator application.</label>
                </div>
                <div className="form__input-group">
                  <img
                    src={googleAuthenticatorURL}
                  />
                </div>
                <div className="form__input-group">
                  <label className="form__label">{googleAuthenticatorPrivateKey}</label>
                </div>
                <div className="form__input-group">
                  <label className="form__label">Type in code generated in Google Authenticator application.</label>
                  <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="form-control"
                  />
                </div>
                {twoFACodeError && <div className="form__error">{twoFACodeError}</div>}
                <button type="button" className="account_menu-button" onClick={submit2FACode}>Submit</button>
              </div>
            ) : (
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
                      <button className="account_menu-button" onClick={Show2FAForm}>Change</button>
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
                    <div className="account_form__input-group">
                      <label id="a1" htmlFor="newPassword" className="account_form__label">Confirm password</label>
                      <PasswordInput onPasswordChange={handleConfirmPassword} />
                      {/* <input
                        type="password"
                        id="confirmedPassword"
                        value={confirmedPassword}
                        onChange={(e) => setConfirmedPassword(e.target.value)}
                        className="account_form__input"
                      /> */}
                    </div>
                    
                    {twoFAError && <div className="form__error">{twoFAError}</div>}

                    <div className="account_menu-middle-2">
                      <button type="submit" className="account_menu-button">Submit</button>
                      <button className="account_menu-button" onClick={Cancel2FAForm}>Cancel</button>
                    </div>
                </div>
                )}
            </form>
            )}
        </div>    
    </div>
  );
}

export default Account;
