# Base image with Node.js and Python
FROM node:20-alpine AS builder

# Install Python (for yt-dlp) and necessary dependencies
RUN apk add --no-cache python3 py3-pip ffmpeg

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the rest of the app's code
COPY . .

# Install yt-dlp using pip inside the builder
RUN python3 -m venv /venv && \
    /venv/bin/pip install yt-dlp

# Build the Next.js app
RUN yarn build

# -----------------------------------------
# Create a lightweight runtime container
# -----------------------------------------
FROM node:20-alpine

# Install Python in the runtime container
RUN apk add --no-cache python3 py3-pip ffmpeg

# Set working directory
WORKDIR /app

# Copy built files from builder stage
COPY --from=builder /app ./

# Install only production dependencies
RUN yarn install --frozen-lockfile --production

# Set up Python virtual environment with yt-dlp in runtime
RUN python3 -m venv /venv && \
    /venv/bin/pip install yt-dlp

# Ensure the Python environment is used
ENV PATH="/venv/bin:$PATH"

# Expose the port Next.js runs on
EXPOSE 3000

# Start the Next.js app
CMD ["yarn", "start"]