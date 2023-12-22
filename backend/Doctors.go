package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	_ "github.com/lib/pq"
	"net/http"
	"time"
)

func createSlot(doctorId int, slotDate time.Time, startTime time.Time, endTime time.Time) error {
	conn, err := sql.Open("postgres", connectionStr)
	if err != nil {
		return err
	}
	conn.Exec(`INSERT INTO "DoctorsSchedule" (doctorid, slotedate, starttime, endtime) VALUES  ($1, $2, $3, $4)`, doctorId, slotDate, startTime, endTime)
	return err
}

func createSlotHandler(w http.ResponseWriter, r *http.Request) {
	var requestBody struct {
		SlotDate  time.Time `json:"slotDate"`
		StartTime time.Time `json:"startTime"`
		EndTime   time.Time `json:"endTime"`
	}

	err := json.NewDecoder(r.Body).Decode(&requestBody)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to parse request body: %v", err), http.StatusBadRequest)
		return
	}
	err = createSlot(userID, requestBody.SlotDate, requestBody.StartTime, requestBody.EndTime)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to create slot: %v", err), http.StatusInternalServerError)
		return
	}
	fmt.Printf("Received JSON: %+v\n", requestBody)
	w.WriteHeader(http.StatusCreated)
	fmt.Fprintln(w, "Slot created successfully")
}
