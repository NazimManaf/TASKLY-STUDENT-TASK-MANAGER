# Taskly

A simple student task manager built with React and Vite, Node.js and Express, and MongoDB with Mongoose. A small standalone Go program shows sample task statistics.

## Run the app

You need Node.js, npm, and MongoDB. Start MongoDB, then copy `.env.example` to `.env` in the project folder and set `MONGODB_URI` if needed.

In one terminal:

```bash
cd backend
npm install
npm run dev
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local address printed by Vite, usually `http://localhost:5173`.

The Vite development server forwards `/api` requests to the backend. For a deployed frontend, set `VITE_API_URL` to the API base URL (including `/api`).

## Go example

Go is optional. From the project folder:

```bash
cd go
go run main.go
```
