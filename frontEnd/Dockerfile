# Use a base image
FROM node:latest

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to download dependencies
COPY package*.json ./

# Change ownership of npm cache directory
RUN mkdir /.npm && chown -R 1008510000:0 /.npm

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
# EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]

ENV REACT_APP_API_PORT=https://back-end-final-muhammadashraf-dev.apps.sandbox-m4.g2pi.p1.openshiftapps.com