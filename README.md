## ICE 05 Project

- Joseph Abata, Michael Napoleone, Riley Meyers
- Group 05

A simple real time chat app for LeBron James fans to talk about basketball. 
Its built with Svelte and Node.js

## What it does

- Lets multiple users chat in real time
- Auto generates some LeBron-themed usernames, for REAL Lebron fans
- Shows message history when you join

## How to run it

1. Make sure you have Node.js installed
2. Install dependencies: `npm install`
3. Start the server: `npm run server`
4. In another terminal, start the frontend: `npm run dev`

## Issues we ran into

- WebSocket connections weren't working right at first
- Had to fix the package.json build script
- Server wasn't serving the frontend properly

## Tech used

- Frontend: Svelte
- Backend: Node.js + Express
- Real time web updates: WebSockets
- Build tool: Vite