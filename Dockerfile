# Use the official Node.js 16 image.
# https://hub.docker.com/_/node
FROM node:16

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY package*.json ./

# Install production dependencies.
RUN npm install --only=production

# Copy local code to the container image.
COPY . .

# Set the environment variables (set these with your own values)
# SET THIS BEFORE DEPLOYMENT
ENV INFURA_API_KEY="YOUR_INFURA_API_KEY"
ENV COINMARKETCAP_API_KEY="YOUR_COINMARKETCAP_API_KEY"

# Run the web service on container startup.
CMD [ "node", "index.js" ]