package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gorilla/mux"
	"log"
	"net/http"
	"time"
)

var DoctorID int

type Doctor struct {
	Name string `json:"name"`
}
type slot struct {
	SlotID    int    `json:"slotID"`
	SlotDate  string `json:"slotDate"`
	StartTime string `json:"StartTime"`
	EndTime   string `json:"EndTime"`
}
type reservation struct {
	AppointmentID    int    `json:"appointmentID"`
	AppointmentDate  string `json:"appointmentDate"`
	AppointmentStart string `json:"appointmentStart"`
	DoctorID         int    `json:"DoctorID"`
}

type jsonResponse struct {
	Success   bool   `json:"success"`
	Message   string `json:"message,omitempty"`
	Schedules []slot `json:"schedules"`
}

func selectDr(drName string) error {
	conn, err := sql.Open("postgres", connectionStr)
	if err != nil {
		return err
	}
	err = conn.QueryRow(`SELECT userid from "user" WHERE username = $1 AND usertype = 'doctor' `, drName).Scan(&DoctorID)
	if err != nil {
		return err
	}
	if err == sql.ErrNoRows {
		return err
	}
	return err
}

func getAvailSlots() ([]slot, error) {
	conn, err := sql.Open("postgres", connectionStr)
	if err != nil {
		return nil, err
	}
	rows, err := conn.Query(`SELECT scheduleid,slotedate,starttime,endtime FROM "DoctorsSchedule" where slotavail = true AND doctorid = $1 `, DoctorID)
	if err != nil {
		return nil, err
	}
	var slots []slot
	for rows.Next() {
		var schedule slot
		var slotid int
		var slotdate, starttime, endtime string

		if err := rows.Scan(&slotid, &slotdate, &starttime, &endtime); err != nil {
			log.Println("Error scanning row:", err)
			return nil, err
		}
		schedule.SlotID = slotid
		schedule.SlotDate = slotdate
		schedule.StartTime = starttime
		schedule.EndTime = endtime
		slots = append(slots, schedule)
	}

	return slots, err
}

func chooseSlot(slotID int) error {
	conn, err := sql.Open("postgres", connectionStr)
	if err != nil {
		return err
	}
	var slotAvailable bool
	err = conn.QueryRow(`SELECT slotavail FROM "DoctorsSchedule" WHERE scheduleid = $1`, slotID).Scan(&slotAvailable)
	if err != nil {
		return err
	}

	if !slotAvailable {
		return errors.New("Selected slot is not available")
	}
	_, err = conn.Exec(`insert into "patientAppointment" (doctorid, scheduleid, appointmentdate,startTime) SELECT doctorid,scheduleid,slotedate,starttime from "DoctorsSchedule" where "DoctorsSchedule".scheduleid = $1 `, slotID)
	_, err = conn.Exec(`UPDATE "DoctorsSchedule" SET slotavail = false WHERE scheduleid = $1`, slotID)
	if err != nil {
		log.Println("Error executing update statement:", err)
		return err
	}
	_, err = conn.Exec(`update "patientAppointment" set patientid = $1 where scheduleid = $2`, userID, slotID)
	return err
}

func getDoctorSchedulesHandler(w http.ResponseWriter, r *http.Request) {
	schedules, err := getAvailSlots()
	if err != nil || DoctorID == 0 {
		// Handle the error, e.g., return an internal server error
		http.Error(w, error.Error(err), http.StatusInternalServerError)
		return
	}

	// Check if there are no available schedules
	if len(schedules) == 0 {
		response := jsonResponse{
			Success: false,
			Message: "No available appointments for this doctor",
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	// Return the schedules as JSON
	response := jsonResponse{
		Success:   true,
		Schedules: schedules,
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func selectDrHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var request struct {
		DoctorName string `json:"doctorName"`
	}

	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	err = selectDr(request.DoctorName)
	if err != nil {
		// Check if the error is due to no rows found
		if errors.Is(err, sql.ErrNoRows) {
			// Doctor not found
			response := map[string]interface{}{
				"success": false,
				"message": "Doctor not found",
			}
			json.NewEncoder(w).Encode(response)
			return
		}

		// Other errors
		response := map[string]interface{}{
			"success": false,
			"message": "Failed to select doctor",
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	// Doctor found
	response := map[string]interface{}{
		"success": true,
		"message": fmt.Sprintf("Doctor ID: %d", DoctorID),
	}
	json.NewEncoder(w).Encode(response)
}

type CreateSlotRequest struct {
	SlotID int `json:"slotID"`
}

func chooseSlotHandler(w http.ResponseWriter, r *http.Request) {
	var requestBody CreateSlotRequest

	// Decode JSON body
	err := json.NewDecoder(r.Body).Decode(&requestBody)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	err = chooseSlot(requestBody.SlotID)

	if err != nil {
		if errors.Is(err, errors.New("Selected slot is not available")) {
			http.Error(w, "Selected slot is not available", http.StatusConflict)
		} else {
			http.Error(w, "Failed to create slot", http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "Slot created successfully")
}

func getAllDoctorNames() ([]Doctor, error) {
	conn, err := sql.Open("postgres", connectionStr)
	if err != nil {
		return nil, err
	}
	defer conn.Close()

	rows, err := conn.Query(`SELECT username FROM "user" where usertype = $1`, "doctor")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var doctors []Doctor
	for rows.Next() {
		var doctor Doctor
		err := rows.Scan(&doctor.Name)
		if err != nil {
			return nil, err
		}
		doctors = append(doctors, doctor)
	}

	return doctors, nil
}
func getAllDoctorNamesHandler(w http.ResponseWriter, r *http.Request) {
	doctors, err := getAllDoctorNames()
	if err != nil {
		http.Error(w, error.Error(err), http.StatusInternalServerError)
		return
	}

	// Convert to JSON and send the response
	responseJSON, err := json.Marshal(doctors)
	if err != nil {
		http.Error(w, "Failed to marshal JSON response", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(responseJSON)
}
func cancelAppointment(appointmentID int) error {
	conn, err := sql.Open("postgres", connectionStr)
	if err != nil {
		return err
	}
	var slotID int
	conn.QueryRow(`select scheduleid from "patientAppointment" where appointmentid = $1 `, appointmentID).Scan(&slotID)
	conn.Exec(`DELETE FROM "patientAppointment" where appointmentid = $1`, appointmentID)
	_, err = conn.Exec(`UPDATE "DoctorsSchedule" SET slotavail = true WHERE scheduleid = $1`, slotID)
	return err
}
func cancelAppointmentHandler(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	scheduleID := params["scheduleid"]

	// Convert the scheduleID to an integer
	var scheduleIDInt int
	fmt.Sscanf(scheduleID, "%d", &scheduleIDInt)

	err := cancelAppointment(scheduleIDInt)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send a success response
	response := map[string]interface{}{
		"success": true,
		"message": "Appointment canceled successfully",
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func getAllReservations(patientID int) ([]reservation, error) {
	conn, err := sql.Open("postgres", connectionStr)
	if err != nil {
		return nil, err
	}
	rows, err := conn.Query(`select appointmentid,appointmentdate,doctorid,starttime from "patientAppointment" where patientid = $1 `, patientID)
	if err != nil {
		return nil, err
	}
	var slots []reservation
	for rows.Next() {
		var schedule reservation
		if err := rows.Scan(&schedule.AppointmentID, &schedule.AppointmentDate, &schedule.DoctorID, &schedule.AppointmentStart); err != nil {
			log.Println("Error scanning row:", err)
			return nil, err
		}
		var parsedDate time.Time
		var parsedTime time.Time
		parsedDate, _ = time.Parse(time.RFC3339, schedule.AppointmentDate)
		datePart := parsedDate.Format("2006-01-02")
		parsedTime, _ = time.Parse(time.RFC3339, schedule.AppointmentStart)
		timePart := parsedTime.Format("15:04:05")
		schedule.AppointmentDate = datePart
		schedule.AppointmentStart = timePart
		slots = append(slots, schedule)
	}
	return slots, err
}

func getAllReservationsHandler(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	patientID := params["patientID"]
	// Convert the patientID to an integer
	var patientIDInt int
	fmt.Sscanf(patientID, "%d", &patientIDInt)
	reservations, err := getAllReservations(patientIDInt)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	// Send the reservations as a JSON response
	response := map[string]interface{}{
		"success":      true,
		"reservations": reservations,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func updateSlot(oldSlotID int, newSlotID int) (int, error) {
	err := cancelAppointment(oldSlotID)
	if err != nil {
		return 0, err
	}
	err = chooseSlot(newSlotID)
	return oldSlotID, err
}

func updateSlotHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse the request body
	var requestBody struct {
		OldSlotID int `json:"oldSlotID"`
		NewSlotID int `json:"newSlotID"`
	}

	err := json.NewDecoder(r.Body).Decode(&requestBody)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	var oldSlot = 0
	// Call the updateSlot function
	oldSlot, err = updateSlot(requestBody.OldSlotID, requestBody.NewSlotID)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to update slot: %v", err), http.StatusInternalServerError)
		return
	}

	// Respond with success
	response := map[string]interface{}{
		"success":   true,
		"OldSlotID": oldSlot,
		"message":   "Slot updated successfully",
	}
	json.NewEncoder(w).Encode(response)
}
