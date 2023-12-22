import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_PORT;

function PatientPage({ userType, handleSuccessfulAuth, userID, onLogout, token }) {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [doctorSlots, setDoctorSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNewSlot, setSelectedNewSlot] = useState(null);
  const [updateMode, setUpdateMode] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [confirmUpdate, setConfirmUpdate] = useState(false);

  useEffect(() => {
    // Fetch the list of available doctors when the component mounts
    fetchDoctorNames();
  }, []);

  // Helper function to format date and time
  function formatSlotDateTime(dateString, timeString) {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = formatSlotTime(timeString);
    return `${formattedDate} ${formattedTime}`;
  }

  function formatSlotTime(timeString) {
    // console.log('Original timeString:', timeString);

    if (!timeString) {
      return 'Invalid Time';
    }

    // Assuming timeString is in ISO format, e.g., "2023-12-03T10:30:00Z"
    const date = new Date(timeString);

    if (isNaN(date.getTime())) {
      return 'Invalid Time';
    }

    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return formattedTime;
  }


  const handleToggleUpdateMode = () => {
    setUpdateMode(!updateMode);
    setSelectedNewSlot(null);
    if (!updateMode) {
      setSelectedReservation(null);
    }
  };


  const fetchDoctorNames = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/view-all-doctors`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
      });
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  let cancelRequest; // To hold the cancel token
  let latestDoctorSelection = ''; // To keep track of the latest doctor selection

  const handleDoctorChange = async (event) => {
    const selectedDoctorName = event.target.value;
    setSelectedDoctor(selectedDoctorName);

    // Reset selected slot when the doctor changes
    setSelectedSlot(null);

    // Cancel the previous request before making a new one
    if (cancelRequest) {
      cancelRequest.cancel('Operation canceled by the user.');
    }

    // Create a new cancel token
    cancelRequest = axios.CancelToken.source();

    // Update the latest doctor selection
    latestDoctorSelection = selectedDoctorName;

    try {
      const response = await axios.post(
          `${API_BASE_URL}/select-dr`,
          {
            doctorName: selectedDoctorName,
          },
          {
            cancelToken: cancelRequest.token,
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the Authorization header
            },
          }
      );

      // Check if the response corresponds to the most recent doctor selection
      if (latestDoctorSelection === selectedDoctorName) {
        if (response.data.success) {
          // Clear error message when a doctor is selected successfully
          setErrorMessage(null);
          // Fetch available slots for the selected doctor
          fetchDoctorSlots();
        } else {
          console.error('Error selecting doctor:', response.data.message);
          // Handle error, e.g., show a notification to the user
          setErrorMessage('Error selecting doctor: ' + response.data.message);
        }
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        // Request was canceled, no need to handle errors here
        return;
      }

      console.error('Error selecting doctor:', error);
      // Handle error, e.g., show a notification to the user
      setErrorMessage('Error selecting doctor: Something went wrong.');
    }
  };

  const fetchDoctorSlots = async () => {
    try {
      // Set doctorSlots to an empty array first
      setDoctorSlots([]);

      const response = await axios.get(`${API_BASE_URL}/view-avail-slot`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
      });
      setErrorMessage(null); // Clear any previous error message

      if (response.data.schedules.length === 0) {
        // If there are no available slots, set an error message
        setErrorMessage('No Available Slots');
      } else {
        // If there are available slots, update the slots
        setDoctorSlots(response.data.schedules);
      }
    } catch (error) {
      console.error('Error fetching doctor slots:', error);
      if (error.response) {
        if (error.response.status === 500) {
          // Unauthorized - email or password is incorrect
          setErrorMessage('No Available Slots');
        } else {
          // Other server errors
          setErrorMessage('No Available Slots');
        }
      } else {
        // Network errors or other errors
        setErrorMessage('Something went wrong. Please check your network connection and try again.');
      }
    }
  };

  const handleSlotChange = (event) => {
    const selectedSlotID = parseInt(event.target.value);
    const selectedSlot = doctorSlots.find((slot) => slot.slotID === selectedSlotID);
    setSelectedSlot(selectedSlot);
  };

  const handleChooseSlot = async () => {
    if (selectedSlot) {
      try {
        setLoading(true);

        const response = await axios.post(
            `${API_BASE_URL}/choose-slot`,
            {
              slotID: selectedSlot.slotID,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`, // Include the token in the Authorization header
              },
            }
        );

        if (response.status === 200) {
          setDoctorSlots((prevSlots) =>
              prevSlots.filter((slot) => slot.slotID !== selectedSlot.slotID)
          );
          console.log('Slot chosen successfully!');
        } else {
          console.error('Error choosing slot:', response.data.message);
          setErrorMessage('Error choosing slot: ' + response.data.message);
        }
      } catch (error) {
        console.error('Error choosing slot:', error);
        setErrorMessage('Error choosing slot: Something went wrong.');
      } finally {
        setLoading(false);
      }
    }
  };


  const handleUpdateAppointment = async () => {
    if (selectedSlot && selectedNewSlot && selectedReservation) {
      try {
        setLoading(true);

        console.log('Updating appointment...');
        console.log('Old Slot:', selectedSlot);
        console.log('New Slot:', selectedNewSlot);

        const responseCreateNewAppointment = await axios.post(`${API_BASE_URL}/choose-slot`, {
          slotID: selectedNewSlot.slotID,
        });

        if (responseCreateNewAppointment.status === 200) {
          console.log('New appointment created successfully!');

          // Now, cancel the old appointment
          const oldSlotID = updateMode ? selectedReservation.slotID : null;
          const responseCancelOldAppointment = await axios.delete(`${API_BASE_URL}/cancel-appointment/${oldSlotID}`);

          if (responseCancelOldAppointment.data.success) {
            // Handle the update success
            console.log('Appointment updated successfully!');

            // Update reservations in the state by removing the old slot and adding the new slot
            setReservations((prevReservations) =>
                prevReservations.map((reservation) =>
                    reservation.slotID === oldSlotID
                        ? {
                          ...reservation,
                          slotID: selectedNewSlot.slotID,
                          // You might need to update other fields based on your data structure
                        }
                        : reservation
                )
            );

            // Remove the chosen new slot from available slots
            setDoctorSlots((prevSlots) =>
                prevSlots.filter((slot) => slot.slotID !== selectedNewSlot.slotID)
            );

            // Optionally, you can clear the selections or update the UI accordingly
            setUpdateMode(false);
            setSelectedSlot(null);
            setSelectedNewSlot(null);
            setSelectedReservation(null);
          } else {
            console.error('Error canceling old appointment:', responseCancelOldAppointment.data.message);
            setErrorMessage('Error canceling old appointment: ' + responseCancelOldAppointment.data.message);
          }
        } else {
          console.error('Error creating new appointment:', responseCreateNewAppointment.data.message);
          setErrorMessage('Error creating new appointment: ' + responseCreateNewAppointment.data.message);
        }
      } catch (error) {
        console.error('Error updating appointment:', error);
        setErrorMessage('Error updating appointment: Something went wrong.');
      } finally {
        setLoading(false);
      }
    } else {
      console.error('Invalid selection for update. Both old and new slots must be selected.');
    }
  };


  const confirmAndUpdate = () => {
    // You can add additional checks here
    if (selectedReservation && selectedSlot && selectedNewSlot) {
      // You can add a confirmation prompt here
      const confirmed = window.confirm('Are you sure you want to update this appointment?');

      if (confirmed) {
        handleUpdateAppointment();
      } else {
        console.log('Update canceled by the user.');
      }
    } else {
      console.error('Invalid selection for update. Both old and new slots must be selected.');
    }
  };





  const cancelAppointment = async () => {
    if (selectedSlot) {
      try {
        setLoading(true);

        const response = await axios.delete(`${API_BASE_URL}/cancel-appointment/${selectedSlot.scheduleID}`);

        if (response.data.success) {
          console.log('Appointment canceled successfully!');
        } else {
          console.error('Error canceling appointment:', response.data.message);
          setErrorMessage('Error canceling appointment: ' + response.data.message);
        }
      } catch (error) {
        console.error('Error canceling appointment:', error);
        setErrorMessage('Error canceling appointment: Something went wrong.');
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchAllReservations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get-all-reservations/${userID}`);
      console.log(userID)
      if (response.data.success) {

        setReservations(response.data.reservations);
        // Handle successful reservation retrieval
        console.log('Reservations:', response.data.reservations);
      }
      else {
        console.error('Error fetching reservations:', response.data.message);
        // Handle error, e.g., show a notification to the user
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      // Handle error, e.g., show a notification to the user
    }
  };

  const cancelReservation = async (appointmentID) => {
    try {
      setLoading(true);

      const response = await axios.delete(`${API_BASE_URL}/cancel-appointment/${appointmentID}`);

      if (response.data.success) {
        console.log('Appointment canceled successfully!');
        fetchAllReservations();
      } else {
        console.error('Error canceling appointment:', response.data.message);
        setErrorMessage('Error canceling appointment: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error canceling appointment:', error);
      setErrorMessage('Error canceling appointment: Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Perform logout logic here
    // For example, clear user authentication token, reset state, etc.
    // ...

    // Call the onLogout callback to notify the parent component
    onLogout();
  };

  return (
      <div className="container mt-5">

        {/* Logout Button */}
        <button className="btn btn-danger" onClick={handleLogout} style={{ position: 'absolute', top: 10, right: 10 }}>
          Logout
        </button>

        <h1>Choose a Doctor and Slot</h1>

        {/* Doctor Selection */}
        <div className="mb-3">
          <label htmlFor="doctorSelect">Select a Doctor</label>
          <select
              id="doctorSelect"
              className="form-select"
              onChange={handleDoctorChange}
              value={selectedDoctor}
          >
            <option value="" disabled>
              Select a doctor
            </option>
            {doctors.map((doctor, index) => (
                <option key={index} value={doctor.name}>
                  {doctor.name}
                </option>
            ))}
          </select>
        </div>

        {/* Display Doctor's Available Slots */}
        {selectedDoctor && (
            <>
              <h2>{selectedDoctor}'s Available Slots</h2>
              <div className="mb-3">
                {doctorSlots.length > 0 ? (
                    <select
                        id="slotSelect"
                        className="form-select"
                        onChange={handleSlotChange}
                        value={selectedSlot ? selectedSlot.slotID : ''}
                    >
                      <option value="" disabled>
                        Select a slot
                      </option>
                      {doctorSlots.map((slot) => (
                          <option key={slot.slotID} value={slot.slotID}>
                            {"date: "}{slot.slotDate.slice(0,10)} {" start time: "} {slot.StartTime.slice(11,16)} {" end time: "}{slot.EndTime.slice(11,16)}
                          </option>
                      ))}
                    </select>
                ) : (
                    <div>No Available Slots</div>
                )}
              </div>
            </>
        )}



        {/* Error Message */}
        {errorMessage && (
            <div className="alert alert-danger" role="alert">
              {errorMessage}
            </div>
        )}

        {selectedSlot && (
            <div>
              {/* Choose Slot Button */}
              <button className="btn btn-primary" onClick={handleChooseSlot} disabled={loading}>
                {loading ? 'Choosing Slot...' : 'Choose Slot'}
              </button>
            </div>
        )}
        <br/>
        <div>
          {/* Fetch Reservations Button */}
          <button className="btn btn-primary ms-2" onClick={fetchAllReservations}>
            Fetch Reservations
          </button>
        </div>

        {/* Display Reservations Section */}
        {Array.isArray(reservations) && reservations.length > 0 && (
            <div>
              <h2>Your Reservations</h2>
              {reservations.length > 0 ? (
                  <ul>
                    {reservations.map((reservation, index) => (
                        <li key={index} className="mb-3">
                          {/* ... (existing reservation information) */}
                          <strong>SlotID:</strong> {reservation.appointmentID} <br />
                          <strong>Doctor:</strong> {reservation.DoctorID} <br />
                          <strong>Date:</strong> {reservation.appointmentDate} <br />
                          <strong>Time:</strong> {reservation.appointmentStart} <br />

                          {/* New Slot Selection */}
                          {updateMode && selectedReservation.appointmentID === reservation.appointmentID && (
                              <>
                                <label htmlFor={`newSlotSelect_${index}`}>Select New Slot</label>
                                <select
                                    id={`newSlotSelect_${index}`}
                                    className="form-select"
                                    onChange={(event) =>
                                        setSelectedNewSlot(
                                            doctorSlots.find((slot) => slot.slotID === parseInt(event.target.value))
                                        )
                                    }
                                    value={selectedNewSlot ? selectedNewSlot.slotID : ''}
                                >
                                  <option value="" disabled>
                                    Select a new slot
                                  </option>
                                  {doctorSlots.map((slot) => (
                                      <option key={slot.slotID} value={slot.slotID}>
                                        {"date: "}{slot.slotDate.slice(0,10)} {" start time: "} {slot.StartTime.slice(11,16)} {" end time: "}{slot.EndTime.slice(11,16)}
                                      </option>
                                  ))}
                                </select>
                              </>
                          )}

                          {/* Buttons */}
                          <button
                              className="btn btn-danger"
                              onClick={() => cancelReservation(reservation.appointmentID)}
                          >
                            Cancel
                          </button>
                          <button
                              className="btn btn-warning ms-2"
                              onClick={() => {
                                handleToggleUpdateMode();
                                setSelectedReservation(reservation);
                                setConfirmUpdate(true);
                              }}
                          >
                            Update
                          </button>

                          {confirmUpdate && (
                              <button
                                  className="btn btn-primary ms-2"
                                  onClick={() => {
                                    cancelReservation(reservation.appointmentID);
                                    confirmAndUpdate();
                                    setConfirmUpdate(false);
                                  }}
                              >
                                Confirm Update
                              </button>
                          )}
                        </li>
                    ))}
                  </ul>
              ) : (
                  <p>No reservations found.</p>
              )}
            </div>
        )}
      </div>
  );
}


export default PatientPage;