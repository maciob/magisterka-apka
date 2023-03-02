import React from 'react';
import Navbar from '../components/upperbar';
import LowerBar from '../components/lowerbar';

import MyList from '../components/list';

function Home(props) {
  const sessionID = props.location.state.sessionID;
  const hash = props.location.state.hash;
  // const { sessionID, hash } = props;
  console.error(sessionID);
  console.error(hash);

  return (
    
    <div>
      <MyList sessionID={sessionID} hash={hash}/>
      <LowerBar />
    </div>
  );
}

export default Home;
