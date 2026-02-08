# Shinesoon Interview Platform

A React-based interview platform with video interface mockups, live coding editor UI, and interview management.

## Project Structure

- `server/`: Node.js + Express backend with SQLite database.
- `client/`: React + Vite frontend with TailwindCSS.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm

### 1. Backend Setup
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```
Start the server:
```bash
npm run dev
```
The server will run on `http://localhost:5000`.

### 2. Frontend Setup
Open a new terminal, navigate to the client directory and install dependencies:
```bash
cd client
npm install
```
Start the client development server:
```bash
npm run dev
```
The application will open at `http://localhost:5173`.

## Features Implemented
- **Authentication**: Login/Register as Candidate or Interviewer.
- **Dashboard**: View upcoming and completed interviews.
- **Interview Interface**: Mock video call, code editor UI, chat.
- **Feedback**: Post-interview evaluation.
