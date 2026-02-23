FROM node:20-alpine

WORKDIR /app

# Copy dependency files first (for Docker layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose the dev server port
EXPOSE 4938

# Start the dev server
CMD ["npm", "run", "dev"]
