import React, { useState , useEffect } from 'react';
import '../css/entry.css'

function NewEntry() {
    const [show, setShow] = useState(true)
    const [yourname, setYourName] = useState("");
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [url, setURL] = useState("");
    const [sessionID, setSessionID] = useState(sessionStorage.getItem('sessionID'));
    const [hash, setHash] = useState(sessionStorage.getItem('hash'));

    useEffect(() => {
        if(JSON.parse(sessionStorage.getItem('PasswordGenerator')) === true) {
            sendData().catch(console.error);
        }
      }, []);
    const sendData = async () => {
        if(sessionStorage.getItem('SettingsLength') == null || sessionStorage.getItem('SettingsLower') == null || sessionStorage.getItem('SettingsUpper') == null || sessionStorage.getItem('SettingsNumbers') == null || sessionStorage.getItem('SettingsSpecial') == null)
        {
            const data = await fetch('/api/Website/generator?length=16&useLower=true&useUpper=true&useDigits=true&useSpecial=true')
            const json = await data.json();   
            setPassword(json.password) 
        } else {
            const data = await fetch('/api/Website/generator?length='+parseInt(sessionStorage.getItem('SettingsLength'), 10)+'&useLower='+JSON.parse(sessionStorage.getItem('SettingsLower'))+'&useUpper='+JSON.parse(sessionStorage.getItem('SettingsUpper'))+'&useDigits='+JSON.parse(sessionStorage.getItem('SettingsNumbers'))+'&useSpecial='+JSON.parse(sessionStorage.getItem('SettingsSpecial')))
            const json = await data.json();    
            setPassword(json.password)
        }
    }

    const handleConfirmClick = async (e) => {
        e.preventDefault();
        async function EntryData(data) {
            try {
                return await fetch('/api/Website/entry', {
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
                // setError('An error occurred while trying to login');
            }
        }
        const value = await EntryData({
            sessionID,
            hash,
            login,
            password,
            yourname,
            url
        });
        window.location.reload(false)
    };    
  
    const handleShowClick = async () => {
        setShow(prevCheck => !prevCheck)
    }

  return (
      <div className="entry__form">
            <form autoComplete="off" onSubmit={handleConfirmClick}>
                <div className='entry__form__input-group'>
                    <label id="c1" className="entry__form__label">Your Name</label>
                        <input
                            type="text"
                            value={yourname}
                            onChange={(e) => setYourName(e.target.value)}
                            className="entry__form__input"
                        />
                </div>
                <div className='entry__form__input-group'>
                    <label id="c1" className="entry__form__label">Login</label>
                        <input
                            type="text"
                            value={login}
                            // autoComplete="off"
                            onChange={(e) => setLogin(e.target.value)}
                            className="entry__form__input"
                        />
                    <div className='entry__form__rightside'>
                    
                    </div>                        
                </div>

                <div className='entry__form__input-group'>
                    <label id="c1" className="entry__form__label">Password</label>
                        <div id="c4" className='entry__form__input-group__child'>
                            { show ? (
                                <input
                                    type="password"
                                    value={password}
                                    autoComplete="new-password"
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="entry__form__input"
                                />
                                ):(
                                <input
                                    type="text"
                                    value={password}
                                    autoComplete="new-password"
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="entry__form__input"
                                />
                            )}
                            <div className='entry__rightside__div'>
                                <button type="button" onClick={handleShowClick} className='entry__button'>Show</button>
                            </div>
                        </div>
                </div>

                <div className='entry__form__input-group'>
                    <label id="c1" className="entry__form__label">URL</label>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setURL(e.target.value)}
                            className="entry__form__input"
                        />
                    <div className='entry__form__rightside'>
                            
                    </div>                        
                </div>
                <div className="entry__form__lowerside">
                    <div className='entry__lowerside__div'>
                        <button className="entry__button">Save</button>
                    </div>
                </div>
            </form>
      </div>
  );
}

export default NewEntry;
