```dockerfile
# Use Node.js LTS image
FROM node:22-alpine

# Create application directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application source
COPY . .

# Application runs on port 4000
EXPOSE 4000

# Start Node.js server
CMD ["npm", "start"]
```
