// SignIn.js
import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './SignIn.css';
const API_BASE_URL = process.env.REACT_APP_API_PORT;
function SignIn({ handleSuccessfulAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // eslint-disable-next-line no-template-curly-in-string
      const response = await axios.post(`${API_BASE_URL}/signin`, { email, password });

      const { userType, userID, token } = response.data;

      // Save the token and user information in localStorage
      localStorage.setItem('token', token);

      // Update state with user information
      handleSuccessfulAuth(userType, userID, token);

      setErrorMessage(null);
    } catch (error) {
      console.error('Authentication failed:', error);

      if (error.response && error.response.status === 401) {
        setErrorMessage('Invalid email or password. Please try again.');
      } else {
        setErrorMessage('Authentication failed. Please try again.');
      }
    }
  };

  return (
      <div className="d-flex vh-100 justify-content-center align-items-center">
        <div className="p-3 signin-container">
          <h2 className="mb-4">Sign In</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email">Email</label>
              <input
                  type="email"
                  placeholder="Enter Email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password">Password</label>
              <input
                  type="password"
                  placeholder="Enter Password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {errorMessage && (
                <div className="alert alert-danger mt-3" role="alert">
                  {errorMessage}
                </div>
            )}
            <button className="btn btn-primary" type="submit">
              Sign In
            </button>
          </form>
        </div>
      </div>
  );
}

export default SignIn;
