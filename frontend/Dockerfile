FROM node:18-alpine

WORKDIR /app

# Copy only package.json and yarn.lock first to leverage Docker cache
COPY package.json yarn.lock* ./

# Install dependencies with a clean state
RUN apk add --no-cache yarn && \
    yarn install --frozen-lockfile --network-timeout 600000 --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Run linting
RUN yarn lint || echo "Linting issues found but continuing build"

EXPOSE 3000

CMD ["yarn", "start"] 