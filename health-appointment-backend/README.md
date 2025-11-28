# Health Appointment Backend (Express + lowdb)

## Quick start

1. `cd backend`
2. copy `.env.example` to `.env` and configure
3. `npm install`
4. `npm run dev` (requires nodemon) or `npm start`

## Endpoints (summary)
- POST /api/auth/login  { username, password } -> { token }
- GET /api/patients
- POST /api/patients
- GET /api/doctors
- POST /api/doctors
- GET /api/appointments
- POST /api/appointments

Roles: admin, reception, doctor, patient.
Default admin created: username `admin` / password `admin123`

This backend uses a simple file database (`db.json`) for demo purposes. Replace with PostgreSQL or another DB for production.
