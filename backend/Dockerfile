FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install yarn and use it for installation
RUN apk add --no-cache yarn && \
    yarn install

COPY . .

# Build TypeScript code
RUN yarn build

EXPOSE 4000

# Default command runs the server
CMD ["yarn", "start"]

# Use this as alternative entry point to run tests
ENTRYPOINT ["docker-entrypoint.sh"] 