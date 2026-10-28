# Movie-Play
Movie-Streaming-Platform

A full-stack movie streaming web application built with the **MERN stack** for the Advanced Web Development (AWD) subject, B.Tech Semester 5.


## Features

- Browse the movie collection, search by title and filter by genre
- Movie details page with a video player
- Register, log in and log out with cookie-based JWT authentication
- Personal watchlist ("My Library") for every user
- Admin-only movie management: add, edit and delete movies
- Role-based access control checked on the backend

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Authentication | JWT stored in an httpOnly cookie |
| Security | bcrypt, Helmet, Joi, express-rate-limit, CORS |

## Project Structure

```
ITM-Play/
├── client/                      # React (Vite) frontend
└── server/                      # Express API
    ├── 7166_server.js           # Entry point
    ├── 7166_app.js              # Express app, middleware, routes
    ├── 7166_config/
    │   └── 7166_db.js           # MongoDB connection
    ├── 7166_middleware/
    │   ├── 7166_auth.js         # JWT verification
    │   ├── 7166_admin.js        # Admin role check
    │   └── 7166_validate.js     # Joi validation
    ├── 7166_models/
    │   ├── 7166_User.js
    │   └── 7166_Movie.js
    └── 7166_routes/
        ├── 7166_authRoutes.js
        └── 7166_movieRoutes.js
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally, or a MongoDB Atlas connection string
- Optional: MongoDB Compass to view the data

### 1. Clone the repository

```bash
git clone https://github.com/IBlameAyush/Movie-Play.git
cd Movie-Play
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file inside `server/`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/moviestreaming
JWT_SECRET=replace_with_a_long_random_string
NODE_ENV=development
```

Generate a strong secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Start the server:

```bash
npm run dev      # development, auto-restart with nodemon
npm start        # production
```

You should see `MongoDB connected successfully` and `Server running on port 5000`. Check the API at `http://localhost:5000/api/7166/health`.

### 3. Set up the frontend

```bash
cd client
npm install
npm run dev
```

The app runs at `http://localhost:5173`. The backend only allows requests from `http://localhost:5173` and `http://127.0.0.1:5173`, and requests must be sent with `credentials: "include"` so the login cookie is used.

### 4. Create an admin user

Every new account is created with the role `user`. To make an admin:

1. Register normally in the app.
2. Open MongoDB Compass, then `moviestreaming`, then `users`.
3. Change the `role` field of your user from `"user"` to `"admin"`.
4. Log out and log in again.

## API Reference

Base URL: `http://localhost:5000/api/7166`

### Authentication (`/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Create an account |
| POST | `/login` | Public | Log in and set the cookie |
| GET | `/me` | Logged in | Current user and role |
| POST | `/logout` | Public | Clear the cookie |
| GET | `/watchlist` | Logged in | Get the saved movies |
| POST | `/watchlist/:movieId` | Logged in | Add a movie to the watchlist |
| DELETE | `/watchlist/:movieId` | Logged in | Remove a movie from the watchlist |

### Movies (`/movies`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | List movies (`?search=` and `?genre=` supported) |
| GET | `/:id` | Public | Get one movie |
| POST | `/` | Admin | Create a movie |
| PUT | `/:id` | Admin | Update a movie |
| DELETE | `/:id` | Admin | Delete a movie |

### Movie fields

`title`, `description`, `genre` (array), `releaseYear`, `posterUrl`, `backdropUrl`, `videoUrl`, `rating` (0 to 10), `featured`.

## Security Measures

- Passwords hashed with **bcrypt** (12 salt rounds) and excluded from queries with `select: false`
- JWT in an **httpOnly** cookie with `sameSite: lax` and `secure` in production
- Admin role checked from the database on every admin request, never taken from the request body
- **Helmet** for secure HTTP headers
- **Joi** schemas for input validation, including `http`/`https` only for media URLs
- **express-rate-limit** on login and register to slow brute-force attempts
- Field whitelist and ObjectId validation on movie routes
- CORS limited to the frontend origin
- Secrets kept in `.env`, which is never committed

## AWD Final Viva Tasks

This project is also the basis for the three viva tasks:

1. **Comparative Technology Study:** JWT vs sessions, REST vs GraphQL, MongoDB vs MySQL, React vs Angular
2. **Security Audit Report:** findings, risk levels, impact and fixes
3. **Security Libraries:** Helmet, bcrypt and Joi, integrated and demonstrated

## Known Limitations and Future Work

- JWT lasts 7 days and cannot be revoked; a refresh-token flow would improve this
- The title search should escape special characters before using a regular expression
- Video URLs depend on external availability; media hosting or a CDN would be needed for a public release
- HTTPS and production environment settings are required before deployment

## License

This project was created for academic purposes.
