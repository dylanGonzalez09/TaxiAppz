y
FROM node:alpine

# Create and set working directory
WORKDIR /usr/src/node-app

# Copy package.json and yarn.lock as root
COPY package.json yarn.lock ./

# Install dependencies as root
RUN npm install --pure-lockfile

# Change ownership to 'node' user
RUN chown -R node:node /usr/src/node-app

# Switch to 'node' user
USER node

# Copy the rest of the application code
COPY --chown=node:node . .

# Expose the port the app runs on
EXPOSE 4001

# Command to run the app
CMD ["npm", "start"]
