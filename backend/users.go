package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"github.com/dgrijalva/jwt-go"
	_ "github.com/dgrijalva/jwt-go"
	_ "github.com/lib/pq"
	"net/http"
	"time"
)

var secretKey = []byte("your-secret-key") // Change this to a strong, unique secret key

// Claims struct to represent the data to be included in the token
type Claims struct {
	UserID   int    `json:"user_id"`
	Username string `json:"username"`
	jwt.StandardClaims
}

// GenerateToken generates a JWT token
func GenerateToken(userID int, username string) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour) // Token expires in 24 hours

	claims := &Claims{
		UserID:   userID,
		Username: username,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(secretKey)
}

var userID int
var userType string

func signUp(name string, password string, userType string, email string) error {
	conn, err := sql.Open("postgres", connectionStr)
	if err != nil {
		return err
	}
	var existingEmail string
	err = conn.QueryRow(`SELECT email FROM "user" WHERE email = $1`, email).Scan(&existingEmail)
	switch {
	case err == sql.ErrNoRows:
		_, err = conn.Exec(`INSERT INTO "user" (email, password, usertype, username) VALUES  ($1, $2, $3, $4)`, email, password, userType, name)
		return err
	case err != nil:
		return err
	default:
		return errors.New("Email Already Exist")
	}

}

func signIn(email string, password string) (error, string, int) {
	conn, err := sql.Open("postgres", connectionStr)
	if errors.Is(err, sql.ErrNoRows) {
		return err, "", 0
	}
	err = conn.QueryRow(`select userid,usertype from "user" where email = $1 AND password = $2`, email, password).Scan(&userID, &userType)
	if err != nil {
		return err, "", 0
	}

	// Generate a token upon successful sign-in
	token, err := GenerateToken(userID, email)
	if err != nil {
		return err, "", 0
	}

	return nil, token, userID
}

func signInHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var user struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	err, token, username := signIn(user.Email, user.Password)
	if err != nil {
		response := map[string]interface{}{
			"success": false,
			"message": "Invalid email or password",
		}
		http.Error(w, error.Error(err), http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)
		return
	}

	response := map[string]interface{}{
		"success":  true,
		"message":  "Sign-in successful",
		"userID":   username,
		"userType": userType,
		"token":    token, // Include the token in the response
	}
	json.NewEncoder(w).Encode(response)
}

func signUpHandler(w http.ResponseWriter, r *http.Request) {
	// Handle CORS preflight OPTIONS requests
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Handle only POST requests
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Decode JSON request body
	var user struct {
		Name     string `json:"name"`
		Password string `json:"password"`
		UserType string `json:"userType"`
		Email    string `json:"email"`
	}

	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Perform sign-up logic (replace with your own sign-up logic)
	err = signUp(user.Name, user.Password, user.UserType, user.Email)
	if err != nil {
		// Respond with an error
		response := struct {
			Success bool   `json:"success"`
			Message string `json:"message"`
		}{Success: false, Message: "Failed to sign up"}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	// Respond with success
	response := struct {
		Success bool   `json:"success"`
		Message string `json:"message"`
	}{Success: true, Message: "Sign-up successful"}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
