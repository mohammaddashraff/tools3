// SignUp.js
import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BiUser, BiEnvelope, BiLock } from 'react-icons/bi';
import './SignUp.css';

const API_BASE_URL = process.env.REACT_APP_API_PORT;

function SignUp({ handleSuccessfulAuth }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('patient');
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null); // New state for success message

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(`${API_BASE_URL}/signup`, {
        name,
        email,
        password,
        userType,
      });

      handleSuccessfulAuth(response.data.userType);
      setErrorMessage(null);
      setSuccessMessage('Sign up successful. Please sign in.'); // Set success message
    } catch (error) {
      console.error('Sign up failed:', error);
      setErrorMessage('Sign up failed. Please try again.');
      setSuccessMessage(null); // Reset success message on failure
    }
  };

  return (
      <div className="d-flex vh-100 justify-content-center align-items-center">
        <div className="p-3 signup-container">
          <h2 className="mb-4">Sign Up</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name">Name</label>
              <div className="input-group">
              <span className="input-group-text">
                <BiUser />
              </span>
                <input
                    type="text"
                    placeholder="Enter Name"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="email">Email</label>
              <div className="input-group">
              <span className="input-group-text">
                <BiEnvelope />
              </span>
                <input
                    type="email"
                    placeholder="Enter Email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="password">Password</label>
              <div className="input-group">
              <span className="input-group-text">
                <BiLock />
              </span>
                <input
                    type="password"
                    placeholder="Enter Password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="usertype">User Type</label>
              <select
                  id="usertype"
                  className="form-select"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
            {errorMessage && (
                <div className="alert alert-danger mt-3" role="alert">
                  {errorMessage}
                </div>
            )}

            {successMessage && (
                <div className="alert alert-success mt-3" role="alert">
                  {successMessage}
                </div>
            )}
            <button className="btn btn-primary" type="submit">
              Sign Up
            </button>
          </form>
        </div>
      </div>
  );
}

export default SignUp;