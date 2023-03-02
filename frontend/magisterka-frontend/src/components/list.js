import React, { useState, useEffect } from 'react';

function MyList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch('/api/Website/list?sessionID='+sessionStorage.getItem('sessionID')+'&hash='+sessionStorage.getItem('hash'))
      .then(response => response.json())
      .then(data => setItems(data))
      .catch(error => console.log(error));
  });

  return (
    <div className="my-list">
      <h1>My List</h1>
      <ul>
        {items.map(item => (
          <li key={item.ID_website}>{item.website_name}{item.website_adress}{item.Login}{item.Password}</li>
        ))}
      </ul>
    </div>
  );
}

export default MyList;
