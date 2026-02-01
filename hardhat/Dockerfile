FROM node:22-alpine

WORKDIR /app

# Install dependencies and curl for healthcheck
RUN apk add --no-cache curl

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port for Hardhat node
EXPOSE 8545

# Start Hardhat node
CMD ["npx", "hardhat", "node"]

