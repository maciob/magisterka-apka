import React, { useState, useEffect } from 'react';

function MyList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch('/api/my-endpoint')
      .then(response => response.json())
      .then(data => setItems(data))
      .catch(error => console.log(error));
  }, []);

  return (
    <div className="my-list">
      <h1>My List</h1>
      <ul>
        {items.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default MyList;
