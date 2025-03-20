FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install yarn and use it for installation
RUN apk add --no-cache yarn && \
    yarn install

COPY . .

# Make entrypoint script executable
RUN chmod +x /app/docker-entrypoint.sh

# Set the entry point script
ENTRYPOINT ["/app/docker-entrypoint.sh"]

# Build and start the application
CMD ["sh", "-c", "yarn build && yarn start"]

EXPOSE 4000 