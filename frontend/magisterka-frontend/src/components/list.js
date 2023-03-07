import React, { useState, useEffect } from 'react';
import "../css/list.css"

function MyList() {
 
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch('/api/Website/list?sessionID='+sessionStorage.getItem('sessionID')+'&hash='+sessionStorage.getItem('hash'))
      .then(response => response.json())
      .then(data => setItems(data))
      .catch(error => console.log(error));
  });

  const data = [
    { id: 1, text: 'Lorem ipsum dolor sit amet', icon: 'github.png'},
    { id: 2, text: 'consectetur adipiscing elit', icon: 'airbnb.png'},
    { id: 3, text: 'sed do eiusmod tempor', icon: 'github.png' },
    { id: 4, text: 'Lorem ipsum dolor sit amet', icon: 'github.png' },
    { id: 5, text: 'consectetur adipiscing elit', icon: 'github.png' },
    { id: 6, text: 'sed do eiusmod tempor', icon: 'github.png' },
    { id: 7, text: 'Lorem ipsum dolor sit amet', icon: 'github.png' },
    { id: 8, text: 'consectetur adipiscing elit', icon: 'github.png' },
    { id: 9, text: 'sed do eiusmod tempor', icon: 'github.png' },
    { id: 10, text: 'Lorem ipsum dolor sit amet', icon: 'github.png' },
    { id: 11, text: 'Lorem ipsum dolor sit amet', icon: 'github.png' },
    { id: 12, text: 'consectetur adipiscing elit', icon: 'github.png' },
    { id: 13, text: 'sed do eiusmod tempor', icon: 'github.png' },
    { id: 14, text: 'Lorem ipsum dolor sit amet', icon: 'github.png' },
    { id: 15, text: 'consectetur adipiscing elit', icon: 'github.png' },
    { id: 16, text: 'sed do eiusmod tempor', icon: 'github.png' },
    { id: 17, text: 'Lorem ipsum dolor sit amet', icon: 'github.png' },
    { id: 18, text: 'consectetur adipiscing elit', icon: 'github.png' },
    { id: 19, text: 'sed do eiusmod tempor', icon: 'github.png' },
    { id: 20, text: 'Lorem ipsum dolor sit amet', icon: 'github.png' },
    { id: 21, text: 'consectetur adipiscing elit', icon: 'github.png' },
    { id: 22, text: 'sed do eiusmod tempor', icon: 'github.png' },

    // ... more data objects
  ];

  const handleClick = (id) => {
    console.log(`Button with ID ${id} clicked`);
    sessionStorage.setItem('Entry', true);
    sessionStorage.setItem('Account', false);
    sessionStorage.setItem('PasswordGenerator', false);
    sessionStorage.setItem('GeneratorSettings', false);
    sessionStorage.setItem('AddNewAccount', false);
    sessionStorage.setItem('EntryValue', id);
    window.location.reload(false)
  };

  return (
    <div className="table-container">
      <table className="table">
        <tbody>
          {data.map((entry) => (
            <tr key={entry.id}>
              <td className="td">
                <button onClick={() => handleClick(entry.id)}>
                  <img src={'/icons/' + entry.icon} alt="icon" width="40" height="40" />
                </button>
              </td>
              <td>
                <button className="button" onClick={() => handleClick(entry.id)}>
                  {entry.text}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    // <div className="my-list">
    //   <h1>My List</h1>
    //   <ul>
    //     {items.map(item => (
    //       <li key={item.ID_website}>{item.website_name}</li>
    //     ))}
    //   </ul>
    // </div>
  );
}

export default MyList;
