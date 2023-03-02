import React from 'react';
import Navbar from '../components/upperbar';
import LowerBar from '../components/lowerbar';

import MyList from '../components/list';

function Home() {
  const sessionID = sessionStorage.getItem('sessionID');
  const hash = sessionStorage.getItem('hash');
  // const { sessionID, hash } = props;
  console.log(sessionID);
  console.log(hash);

  return (
    
    <div>
      <MyList />
      <LowerBar />
    </div>
  );
}

export default Home;
