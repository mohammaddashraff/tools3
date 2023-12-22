# Use a base image
FROM node:latest

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to download dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
# EXPOSE 3000

chown -R 1008510000:0 /.npm

# Command to run the application
CMD ["npm", "start"]
