package main

import (
	"fmt"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"net/http"
	"os"
	"strconv"
)

var dbBaseURL = os.Getenv("DB_BASE_URL")
var dBasePort = os.Getenv("DB_PORT")
var portStr = os.Getenv("PORT")
var frontPort = os.Getenv("FPORT")
var connectionStr = fmt.Sprintf("user=postgres password=asdyfe2rd dbname=webclinic host=%s port=%s sslmode=disable", dbBaseURL, dBasePort)

func main() {
	var port, _ = strconv.Atoi(portStr)
	//fmt.Printf("DB Base URL: %s\n", dbBaseURL)
	//fmt.Printf("Port: %s\n", port)
	r := mux.NewRouter()
	fmt.Println("Front end port ", frontPort)
	// CORS middleware configuration
	cors := handlers.CORS(
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		handlers.AllowedOrigins([]string{frontPort}), // Adjust this to your frontend's origin
	)

	// Use CORS middleware
	r.Use(cors)

	// Define your routes
	r.HandleFunc("/signin", signInHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/signup", signUpHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/create-slot", createSlotHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/view-avail-slot", getDoctorSchedulesHandler).Methods("GET", "OPTIONS")
	r.HandleFunc("/select-dr", selectDrHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/choose-slot", chooseSlotHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/view-all-doctors", getAllDoctorNamesHandler).Methods("GET", "OPTIONS")
	r.HandleFunc("/cancel-appointment/{scheduleid}", cancelAppointmentHandler).Methods("DELETE", "OPTIONS")
	r.HandleFunc("/get-all-reservations/{patientID}", getAllReservationsHandler).Methods("GET", "OPTIONS")
	r.HandleFunc("/update-slot", updateSlotHandler).Methods("PUT", "OPTIONS")
	// Start the server
	fmt.Printf("Server is running on :%d\n", port)
	fmt.Println(http.ListenAndServe(fmt.Sprintf(":%d", port), r))
}
