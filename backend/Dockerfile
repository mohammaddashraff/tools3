# Use a base image
FROM golang:latest

# Set the working directory
WORKDIR /app

# Copy go.mod and go.sum files to download dependencies
COPY ./backend .

# Download dependencies
RUN go mod download

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
# EXPOSE 8080

# Build the Go application
RUN go build -o main .

# Command to run the application
CMD ["./main"]
