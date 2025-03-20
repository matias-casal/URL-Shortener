![URL Shortener](title.png)

# URL Shortener

A modern, full-featured URL shortening service built with TypeScript, React, Node.js, and PostgreSQL.

## Features

- **Custom URL Slugs**: Create personalized, memorable short links
- **User Authentication**: Register and login to manage your shortened URLs
- **Dashboard**: Track and manage all your shortened URLs in one place
- **Analytics**: Monitor link performance with visit counters
- **Dark/Light Mode**: Choose your preferred interface theme
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Rate Limiting**: Prevents abuse with built-in API rate limiting

## Technology Stack

### Backend

- **Node.js & Express**: RESTful API framework
- **TypeScript**: Type-safe JavaScript
- **TypeORM**: Object-relational mapping for database interactions
- **PostgreSQL**: Primary database for persistent storage
- **Redis**: Used for caching and rate limiting
- **JWT Authentication**: Secure user authentication

### Frontend

- **React**: UI component library
- **TypeScript**: Type-safe JavaScript
- **Material-UI**: Modern component framework
- **React Router**: Client-side routing
- **Emotion**: CSS-in-JS styling
- **Context API**: State management

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)

### Installation & Setup

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/url-shortener.git
   cd url-shortener
   ```

2. Start the application using Docker Compose:

   ```
   docker-compose up
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000

## API Endpoints

### URL Operations

- `POST /api/urls`: Create a new shortened URL
- `GET /api/urls/redirect/:slug`: Get redirection information
- `GET /api/urls/details/:id`: Get URL details
- `PUT /api/urls/:id`: Update an existing URL (authenticated)
- `GET /api/urls/user/urls`: Get all URLs for authenticated user
- `PUT /api/urls/:id/assign-to-user`: Assign URL to authenticated user

### Authentication

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login a user
- `GET /api/auth/me`: Get current user information (authenticated)

## Architecture

The application follows a microservices architecture with:

- Frontend container (React)
- Backend API container (Node.js/Express)
- PostgreSQL database container
- Redis cache container

All services are orchestrated using Docker Compose for easy development and deployment.

## Testing

```
# Run backend tests
docker-compose run backend-test
```

## License

This project is licensed under the MIT License:

```
MIT License

Copyright (c) 2023

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Acknowledgements

- Built for a technical challenge by Matias Casal
- Icons by [Material Design Icons](https://materialdesignicons.com/)
