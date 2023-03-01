import React from 'react';
import Navbar from '../components/upperbar';
import LowerBar from '../components/lowerbar';

import MyList from '../components/list';

function Home(props) {
  const { sessionID, hash } = props.params;

  return (
    
    <div>
      <MyList sessionID={sessionID} hash={hash}/>
      <LowerBar />
    </div>
  );
}

export default Home;
