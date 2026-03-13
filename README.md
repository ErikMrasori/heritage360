# Kosovo Tourism & Cultural Platform

Production-ready full-stack application for showcasing Kosovo's historical, cultural, and natural locations with map-based discovery, media, user visits, and admin content management.

## Stack

- Frontend: Angular 20, TypeScript, Angular Material, Google Maps
- Backend: Node.js, Express, PostgreSQL, JWT authentication
- Database: PostgreSQL with normalized schema and admin audit logs

## Project structure

```text
/
  backend/
    database/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      services/
      utils/
      validators/
    server.js
  frontend/
    src/
      app/
        core/
        features/
        shared/
```

## Environment setup

### Backend

1. Copy `backend/.env.example` to `backend/.env`
2. Fill in:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `CLIENT_URL`
   - `GOOGLE_MAPS_API_KEY` if you want the same key available to other backend integrations later

### Frontend

1. Update `frontend/src/environments/environment.ts`
2. Set:
   - `apiUrl`
   - `googleMapsApiKey`

## Install dependencies

```bash
npm install
npm run install:all
```

## Run locally

### Start backend

```bash
npm run dev:backend
```

Backend runs on `http://localhost:4000`

### Start frontend

```bash
npm run dev:frontend
```

Frontend runs on `http://localhost:4200`

### Run both

```bash
npm run dev
```

## Database setup

1. Create a PostgreSQL database
2. Run `backend/database/schema.sql`
3. Optionally run `backend/database/seed.sql`

## Production build

```bash
npm run build
```

## Notes

- Admin users can create, edit, and delete locations
- All location mutations write to `admin_logs`
- `GET /locations` supports search and category filtering through query params
- JWT is sent in the `Authorization: Bearer <token>` header
