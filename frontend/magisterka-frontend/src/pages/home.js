import React from 'react';
import Navbar from '../components/upperbar';
import LowerBar from '../components/lowerbar';

import MyList from '../components/list';

function Home() {
  return (
    <div>
      <MyList />
      <LowerBar />
    </div>
  );
}

export default Home;
