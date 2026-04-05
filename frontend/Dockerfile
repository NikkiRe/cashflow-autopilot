# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Override VITE_API_BASE_URL so the browser uses nginx proxy (/api)
# instead of the localhost address from .env (which only works for local dev)
ENV VITE_API_BASE_URL=/api

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3030
EXPOSE 3030

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
