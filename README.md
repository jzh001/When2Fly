# When2Fly
Full Stack Web Development Final Project for CS 35L Software Construction

# Setup Instructions

## Start Both Backend and Frontend Together

To start both the backend and frontend servers simultaneously, run the following script from the project root:

```bash
./start-all.sh
```

This will launch both servers in separate processes.

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

The server should now be running on http://localhost:3000

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

The frontend should now be running on http://localhost:5173