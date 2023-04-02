import React, { useState, useEffect } from 'react';
import "../css/list.css"

function MyList() {
 
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch('/api/Website/list?sessionID='+sessionStorage.getItem('sessionID')+'&hash='+sessionStorage.getItem('hash'))
      .then(response => {
        if(response.status === 200){
            return response.json();
        }else {
          console.log(response.status)
          sessionStorage.setItem('sessionID','');
          sessionStorage.setItem('sessionExpired', true);
          window.location.reload(false)
        }
      })
      .then(data => setItems(data));
  },[]);

  const handleClick = (id) => {
    sessionStorage.setItem('Entry', true);
    sessionStorage.setItem('Account', false);
    sessionStorage.setItem('PasswordGenerator', false);
    sessionStorage.setItem('GeneratorSettings', false);
    sessionStorage.setItem('AddNewAccount', false);
    sessionStorage.setItem('EntryValue', id);
    window.location.reload(false)
  };

  const handleImgClick = (entry) => {
    window.open(entry.website_adress, "_blank")
  };

  return (
    <div className="table-container">
      <table className="table">
        <tbody>
          {items.map((entry) => (
            <tr key={entry.iD_website}>
              <td className="td">
                <button onClick={() => handleImgClick(entry)}>
                  <img src={'/icons/' + entry.icon } onError={(e)=>{e.target.onError = null; e.target.src = '/icons/question-mark.png'}} alt="icon" width="40" height="40"/>
                </button>
              </td>
              <td>
                <button className="button" onClick={() => handleClick(entry.iD_website)}>
                  {entry.website_name}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MyList;
