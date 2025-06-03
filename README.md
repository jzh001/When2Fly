## WheAn2Fly

Full Stack Web Development Final Project for CS 35L Software Construction

This application is to assist Bruins by notifying them of other Bruins' flights in similar times so that they can coordinate and split the charge for a rideshare service from the airport.

Users in the app can edit, delete, add their flights, by which a proximity notification gets triggered to show other user(s) who have a flight within 2 hours of current user's flight. Users can also browse other flightswithin a time range and toggle said time range from 1h to 7days, users can toggle to either show or not show their own flights in this list. Users can check their own profile and edit their name and time zone. Users can communicate via email and conduct further planning regarding rideshare.

The app is restricted so that only users with g.ucla.edu email addresses can use it and uses Google authentication credentials to verify that only users with access to the email are able to sign in. All notifications and IDs are stored securely in a Supabase database and related queries use Supabase API and JWT authentication to verify clients and requests.



# Setup Instructions

## Start Both Backend and Frontend Together

To start both the backend and frontend servers simultaneously, run the following script from the project root:

```bash
./start-all.sh
```

This will launch both servers with separate processes.

---

## Manual Setup Instructions for ExpressJS Backend

1. Navigate to the server directory:
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

The backend server should now be running on http://localhost:3000

## Testing Instructions for Backend

To test the routes and authentication (to ensure `.env` is correctly set up), run the following:
   ```
   npm install
   npx jest
   ```

---

## Manual Setup Instructions for React Frontend

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

The frontend server should now be running on http://localhost:5173