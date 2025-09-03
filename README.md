# Strava Stats Dashboard

This project is a modern web application built with React, TypeScript, Vite, and Node.js. It displays your Strava activities and general stats in a user-friendly dashboard. OAuth2 authentication is used to securely fetch your data from Strava.

## Features

-   Login with Strava (OAuth2)
-   View your total running and cycling stats (distance, time, count, etc.)
-   Browse your recent activities on a dedicated page
-   Responsive and fast UI (Vite + React)

## Getting Started

### 1. Register a Strava API Application

1. Go to [Strava API settings](https://www.strava.com/settings/api) and create an app (requires a Strava account).
2. Note your **Client ID**, **Client Secret**, and set the **Authorization Callback Domain** to `localhost:5050` (or your backend port).

### 2. Setup Environment Variables

Create a `.env` file in the `strava-backend` folder (do **not** commit this file to git):

```
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_REDIRECT_URI=http://localhost:5050/exchange_token
```

You can copy `.env.example` as a template.

### 3. Install Dependencies

In the project root:

```
npm install
```

### 4. Start the Backend

In the `strava-backend` folder:

```
node index.js
```

### 5. Start the Frontend

In the project root:

```
npm run dev
```

Visit the URL shown in your terminal (usually http://localhost:5173).

## Security

-   **Never commit your `.env` file or secrets to git!**
-   `.env` is already in `.gitignore`.
-   Use `.env.example` to document required variables for collaborators.

## Usage

1. Click **Connect with Strava** to log in and authorize the app.
2. View your total stats on the main page.
3. Click **Go to Activities** to see your recent activities.

## Folder Structure

-   `src/` — React frontend code
-   `strava-backend/` — Node.js backend for Strava OAuth and API proxy

## Example .env.example

```
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_REDIRECT_URI=http://localhost:5050/exchange_token
```

## License

MIT
