import React, { useState , useEffect } from 'react';
import '../css/entry.css'
import '../css/account.css'

function Entry() {
    const [show, setShow] = useState(false)
    const [edit, setEdit] = useState(false)
    const [del, setDelete] = useState(false)
    const [yourname, setYourName] = useState("");
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [url, setURL] = useState("");
    const [icon, setIcon] = useState("");
    const [data, setData] = useState("");
    const [sessionID, setSessionID] = useState(sessionStorage.getItem('sessionID'));
    const [hash, setHash] = useState(sessionStorage.getItem('hash'));
    const [websiteID, setWebsiteID] = useState(sessionStorage.getItem('EntryValue'));
    
    useEffect(() => {
        const fetchData = async () => {
            const data = await fetch('/api/Website/entry?sessionID='+sessionStorage.getItem('sessionID')+'&websiteID='+sessionStorage.getItem('EntryValue')+'&hash='+sessionStorage.getItem('hash'))
            const json = await data.json();
            setYourName(json.website_name);
            setLogin(json.login);
            setPassword(json.password);
            setURL(json.website_adress);
            setData(json.data);
            setIcon(json.icon);
        }
        fetchData().catch(console.error);
    }, [])

        
    const handleSaveClick = async (e) => {
        e.preventDefault();
        const value = await EntryData({
            sessionID,
            websiteID,
            hash,
            login,
            password,
            yourname,
            url
        });
        window.location.reload(false)
    }    

    async function EntryData(data) {
        try {
            return await fetch('/api/Website/entry', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }).then(data => data.json())
        }
        catch (error)
        {
            console.error(error);
        }
    }

    const handleShowClick = async () => {
        setShow(prevCheck => !prevCheck)
    }    
    const handleEditClick = async () => {
        setEdit(prevCheck => !prevCheck)
    }
    const handleDeleteClick = async (e) => {
        e.preventDefault();
        const value = await DeleteData({
            sessionID,
            websiteID
        });
        sessionStorage.setItem('Entry', false);
        window.location.reload(false)
    }    

    async function DeleteData(data) {
        try {
            return await fetch('/api/Website/entry?sessionID=' + data.sessionID + '&websiteID=' + data.websiteID, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }).then(data => data.json())
        }
        catch (error)
        {
            console.error(error);
        }
    }

  return (
      <div className="entry__form">
            <form onSubmit={handleSaveClick}>
                <div className='entry__form__input-group'>
                    <label id="c1" className="entry__form__label">Your Name</label>
                    <div id="c4" className='entry__form__input-group__child'>
                        { edit ? (
                            <input
                                type="text"
                                value={yourname}
                                onChange={(e) => setYourName(e.target.value)}
                                className="entry__form__input"
                            />
                        ):(
                            <label id="c4" className="entry__form__label">{yourname}</label>
                        )}
                        <div className="entry__rightside__div">
                            <img src={'/icons/' + icon } onError={(e)=>{e.target.onError = null; e.target.src = '/icons/question-mark.png'}} alt="icon" width="60" height="60"/>
                        </div>
                    </div>
                </div>

                <div className='entry__form__input-group'>
                    <label id="c1" className="entry__form__label">Login</label>
                    { edit ? (
                        <input
                            type="text"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            className="entry__form__input"
                        />
                    ):(
                        <label className="entry__form__label">{login}</label>
                    )}
                    <div className='entry__form__rightside'>
                    
                    </div>                        
                </div>

                <div className='entry__form__input-group'>
                    <label id="c1" className="entry__form__label">Password</label>
                    { edit ? (
                        <div id="c4" className='entry__form__input-group__child'>
                        { show ? (
                            <input
                                type="text"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="entry__form__input"
                            />
                        ):(
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="entry__form__input"
                            />
                        )}
                            <div className='entry__rightside__div'>
                                <button type="button" onClick={handleShowClick} className='entry__button'>Show</button>
                            </div>

                        </div>


                    ):(
                        <div id="c4" className='entry__form__input-group__child'>
                            { show ? (
                                <label id="c4" className="entry__form__label">{password}</label>
                            ):(
                                <label id="c4" className="entry__form__label">************</label>
                            )}
                            <div className='entry__rightside__div'>
                                <button type="button" onClick={handleShowClick} className='entry__button'>Show</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className='entry__form__input-group'>
                    <label id="c1" className="entry__form__label">URL</label>
                    { edit ? (
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setURL(e.target.value)}
                            className="entry__form__input"
                        />
                    ):(
                        <label href={url} className="entry__form__label">{url}</label>
                    )}
                    <div className='entry__form__rightside'>
                            
                    </div>                        
                </div>
                <div className='entry__form__input-group'>
                    <label id="c1" className="entry__form__label">Date</label>
                    <label className="entry__form__label">{data}</label>

                    <div className='entry__form__rightside'>
                    
                    </div>                        
                </div>                
                <div className="entry__form__lowerside">
                    <div className='entry__lowerside__div'>
                        { edit ? (
                            <div className="account_menu-middle-2">
                                <button type="submit" className="account_menu-button">Save</button>
                                <button type="button" onClick={handleEditClick} className="account_menu-button">Cancel</button>
                            </div>
                            ):(
                            <div className="account_menu-middle-2"> 
                                <div className="account_menu-middle-2">
                                    <button type="button" onClick={handleEditClick} className="account_menu-button">Edit</button>
                                </div>
                                <div className="account_menu-middle-2">
                                    <button type="button" onClick={handleDeleteClick} className="account_menu-button">Delete</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </form>
      </div>
  );
}

export default Entry;
