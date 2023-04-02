import React, { useState, useEffect } from 'react';
import Navbar from '../components/upperbar';
import { useLocation, useNavigate} from 'react-router-dom';
import queryString from 'query-string';
import "../css/home.css";
import '../css/sessionexpired.css';

function Activate() {
    const [value, setValue] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const fetchData = async () => {
          try {
            if (value != "")
            {
                const response = await fetch('/api/User/activate?sessionID=' + value, { method: 'PUT' })
                if (response.status === 200) {
                    return { success: true };
                  } else if (response.status === 400){
                    return { success: false, error: 'The account has been already activated.' };
                  } else if (response.status === 404){
                    return { success: false, error: 'Invalid session.' };
                  } else if (response.status === 500){
                    return { success: false, error: 'Server error.' };
                  } else {
                    return { success: false, error: 'Something went wrong.' };
                  }
                } 
          } catch (error) {
            console.error(error);
            return { success: false, error: error };
          }
        }
        const fetchDataAndUpdateState = async () => {
            const { success, error } = await fetchData();
            if (success) {
              setSuccess(true);
            } else {
              console.error(error);
              setError(error);
            }
          }

        const query = queryString.parse(location.search);
        const sessionID  = query.sessionID;
        setValue(sessionID);
        fetchDataAndUpdateState();
      }, [location.search, value]);
      
    return (
      <div display="flex">
        <Navbar />
        {success ? (
        <div className='sessionexpired__container'>
            <h2 className='sessionexpired__message'>Your account has been successfully activated.</h2>
        </div>
        ) : (
        <div className='sessionexpired__container'>
            <h2 className='sessionexpired__message'>There has been an error activating your account. {error}</h2>
        </div>
        )}
      </div>
    );
  }
  
  export default Activate;