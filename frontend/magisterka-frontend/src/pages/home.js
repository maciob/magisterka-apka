import React from 'react';
import Navbar from '../components/upperbar';
import LowerBar from '../components/lowerbar';
import MyList from '../components/list';
import Menu from "../components/menu"
import "../css/home.css"
function Home() {
  const sessionID = sessionStorage.getItem('sessionID');
  const hash = sessionStorage.getItem('hash');
  // const { sessionID, hash } = props;
  console.log(sessionID);
  console.log(hash);

  return (
    <div>
      <Navbar />
      <div className="footer">
        <LowerBar />
      </div>
      <div className="container">
        <div className="menu">
          <Menu />
        </div>
        <div className="list">
          <MyList />
        </div>
        <div className="details">
          {/* right details content */}
        </div>
      </div>
    </div>
  );
}

export default Home;
