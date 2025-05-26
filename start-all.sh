#!/bin/bash
# filepath: start-all.sh

cd backend
npm install
cd ../frontend
npm install
cd ..

# Start backend in background
(cd backend && node index.js) &

# Start frontend in background
(cd frontend && npm run dev) &

# Wait for both to exit (optional, keeps script running)
wait