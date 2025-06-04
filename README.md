## When2Fly
Full Stack Web Development Final Project for CS 35L Software Construction

This application helps Bruins coordinate rideshares by notifying them of other Bruins' flights at similar times, making it easier to split the cost of transportation from the airport.

### Key Features

- **Flight Management:** Add, edit, or delete your flights.
- **Proximity Notifications:** Get notified when other users have flights within 2 hours of yours.
- **Flight Browsing:** View flights within a customizable time range (from 1 hour to 7 days). Optionally include your own flights in the list.
- **Profile Management:** Edit your name and time zone.
- **Communication:** Contact other users via email to arrange rideshares.

### Access and Security

- Only users with g.ucla.edu email addresses can sign up, verified through Google authentication.
- All notifications and user IDs are securely stored in a Supabase database.
- All API requests are authenticated using JWT.

---

# Setup Instructions

## Quick Start: Running Both Backend and Frontend

1. From the project root, run:
    ```bash
    ./start-all.sh
    ```
   This will start both the backend and frontend servers.

2. **Access the Web Application:**
   - Open your browser and go to [http://localhost:5173](http://localhost:5173).
   - Sign in with your g.ucla.edu email using Google authentication.
   - Once logged in, you can:
     - Add your upcoming flights.
     - Browse other Bruins' flights and see who is traveling at similar times.
     - Receive notifications about overlapping flights.
     - Edit your profile and manage your flights.
     - Contact other users via email for rideshare coordination.

---

## Manual Setup Instructions

### Backend (ExpressJS)

1. Navigate to the backend directory:
    ```bash
    cd backend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the server:
    ```bash
    node index.js
    ```
   The backend will run at [http://localhost:3000](http://localhost:3000).

4. Testing the Backend:
    ```bash
    npm install
    npx jest
    ```

### Frontend (React)

1. Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the development server:
    ```bash
    npm run dev
    ```
   The frontend will run at [http://localhost:5173](http://localhost:5173).

4. Using the Application:
   - Open [http://localhost:5173](http://localhost:5173) in your browser.
   - Log in with your g.ucla.edu email.
   - Use the dashboard to manage flights, browse matches, and coordinate rideshares.

---

## Environment Variable Setup

Before running the backend or frontend, you must create the required `.env` files in each directory. Example contents are provided below:

### Backend (`backend/.env`)
Create a file named `.env` in the `backend/` directory with the following variables:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173/callback
JWT_SECRET=your_jwt_secret
```

Replace the values with your actual credentials. Do not share these values publicly.

### Frontend (`frontend/.env`)
Create a file named `.env` in the `frontend/` directory with the following variables:

```
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/callback
VITE_BACKEND_URL=http://localhost:3000
```

Replace the values as needed for your environment.

---