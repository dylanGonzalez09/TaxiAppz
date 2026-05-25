# Use the Node.js image as a base image
FROM node:18-slim

# Install OpenSSL and other dependencies
RUN apt-get update -y && \
    apt-get install -y openssl && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Copy the rest of the application code including Prisma schema
COPY . .

# Install dependencies
RUN npm install --force


# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
CMD ["npm", "start"]
