// App.js
import React, { useState } from 'react';
import './App.css';
import SignIn from './SignIn';
import SignUp from './SignUp';
import SchedulePage from './SchedulePage';
import PatientPage from './PatientPage';

function App() {
  const [userType, setUserType] = useState(null);
  const [userID, setPatientID] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isSignIn, setIsSignIn] = useState(true);

  const toggleForm = () => {
    setIsSignIn(!isSignIn);
  };

  const handleSuccessfulAuth = (userType, userID, token) => {
    setUserType(userType);
    setPatientID(userID);
    setToken(token);
    console.log('Handling successful authentication with userType:', userType);
  };

  const handleLogout = () => {
    // Clear token from localStorage
    localStorage.removeItem('token');
    // Reset state
    setUserType(null);
    setPatientID(null);
    setToken(null);
    // Perform any other necessary cleanup or redirect to the login page
  };

  return (
      <div className="App d-flex vh-100 justify-content-center align-items-center">
        <div className="p-3 app-container">
          {userType === 'doctor' ? (
              <SchedulePage userType={userType} handleSuccessfulAuth={handleSuccessfulAuth} userID={userID} onLogout={handleLogout} />
          ) : userType === 'patient' ? (
              <PatientPage userType={userType} handleSuccessfulAuth={handleSuccessfulAuth} userID={userID} onLogout={handleLogout} />
          ) : (
              <>
                {isSignIn ? (
                    <SignIn handleSuccessfulAuth={handleSuccessfulAuth} />
                ) : (
                    <SignUp handleSuccessfulAuth={handleSuccessfulAuth} />
                )}
                <div className="d-flex justify-content-center mt-3">
                  <p>
                    {isSignIn ? "Don't have an account?" : "Already have an account?"}{' '}
                    <span
                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={toggleForm}
                    >
                  {isSignIn ? 'Sign Up' : 'Sign In'}
                </span>
                  </p>
                </div>
              </>
          )}
        </div>
      </div>
  );
}

export default App;