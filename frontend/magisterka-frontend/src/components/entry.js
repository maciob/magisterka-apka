import React, { useState , useEffect } from 'react';
import '../css/entry.css'

function Entry() {
    const [items, setItems] = useState([]);
    useEffect(() => {
      fetch('/api/Website/entry?sessionID='+sessionStorage.getItem('sessionID')+'&websiteID='+sessionStorage.getItem('EntryValue')+'&hash='+sessionStorage.getItem('hash'))
        .then(response => response.json())
        .then(data => setItems(data))
        .catch(error => console.log(error));
    });
    const handleRegisterClick = async (e) => {
        e.preventDefault();
    }    

    const data = [
        { ID_website: 1, website_name: 'Lorem ipsum dolor sit amet', website_adress: 'facebook.com' ,Login:'asd',Password:'asd',icon: 'github.png',Data:'07.03.2023 21:51'},
    ]    



  return (
      <div className="form">
            <form onSubmit={handleRegisterClick}>
                <div className="form__upperside">
                    <div className='form__container'>
                        <div className='form__leftside'>
                            <div className="form__input-group">
                                <label className="form__label">Your Name</label>
                                <label className="form__label">{data[0].website_name}</label>
                                <div className='form__rightside'>
                            
                                </div>                        
    
                            </div>
                        </div>
                    </div>
                    <div className='form__container'>
                        <div className='form__leftside'>
                            <div className="form__input-group">
                                <label className="form__label">Login</label>
                                <label className="form__label">{data[0].Login}</label>
                                <div className='form__rightside'>
                            
                                </div>                        

                            </div>
                        </div>
                    </div>
                    <div className='form__container'>
                        <div className='form__leftside'>
                            <div className="form__input-group">
                                <label className="form__label">Password</label>
                                <label className="form__label">{data[0].Password}</label>
                                <div className='form__rightside'>
                                    <button type="submit" className="form__button">Show</button>
                                </div>                        
                            </div>
                        </div>
                    </div>                    
                    <div className='form__container'>
                        <div className='form__leftside'>
                            <div className="form__input-group">
                                <label className="form__label">URL</label>
                                <label className="form__label">{data[0].website_adress}</label>
                                <div className='form__rightside'>
                            
                                </div>                        
                            </div>
                        </div>
                    </div>
                    <div className='form__container'>
                        <div className='form__leftside'>
                            <div className="form__input-group">
                                <label className="form__label">Date</label>
                                <label className="form__label">{data[0].Data}</label>
                                <div className='form__rightside'>
                            
                                </div>                        
                            </div>
                        </div>
                    </div>


                    {/* <div className="form__input-group">
                        <label className="form__label">Login</label>
                        <label className="form__label">{data[0].Login}</label>
                    </div>
                    <div className="form__input-group">
                        <label className="form__label">Password</label>
                        <label className="form__label">{data[0].Password}</label>
                    </div>
                    <div className="form__input-group">
                        <label className="form__label">URL</label>
                        <label className="form__label">{data[0].website_adress}</label>
                    </div>
                    <div className="form__input-group">
                        <label className="form__label">Date</label>
                        <label className="form__label">{data[0].Data}</label>
                    </div> */}
                </div>
                <div className="form__lowerside">
                    <button type="submit" className="form__button">Register</button>
                </div>
            </form>
      </div>
  );
}

export default Entry;
