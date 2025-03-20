FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install yarn and use it for installation
RUN apk add --no-cache yarn && \
    yarn install

COPY . .

EXPOSE 4000

# Skip build and use dev mode directly
CMD ["yarn", "dev"] 