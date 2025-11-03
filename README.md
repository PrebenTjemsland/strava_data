# Strava Stats Dashboard

<img width="886" height="1291" alt="Screenshot 2025-11-03 at 15 08 38" src="https://github.com/user-attachments/assets/a8189a59-8ba3-4d8c-84c4-d3f370c1566c" />

This project is a modern web application built with React, TypeScript, Vite, and Node.js. It provides a user-friendly dashboard to view your Strava activities and personal statistics. The app uses the OAuth2 protocol to securely fetch your data from the Strava API.
## Features
Secure Authentication: Connect your Strava account using the official OAuth2 flow.
Aggregate Stats: View your all-time totals for running and cycling (distance, time, count).
Fun Visualizations: See your stats displayed in charts and compared to fun real-world metrics (like climbing Mt. Everest!).
Activity Feed: Browse your recent activities on a dedicated page.
Modern Tech Stack: Built with a responsive and fast UI (Vite + React) and a lightweight Node.js backend.

## Strava API Usage Notice
Please note that Strava's API policy limits unapproved applications to 100 API requests every 15 minutes and 1,000 requests daily. This is sufficient for personal use.
If you intend to make this application public or share it with others, you must submit your application to Strava for approval to get a higher rate limit.

## Getting Started

### Prerequisites
* Node.js (v16 or later recommended)
* npm
* A Strava account

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
