# Kosovo Tourism & Cultural Platform

Production-ready full-stack application for showcasing Kosovo's historical, cultural, and natural locations with map-based discovery, media, user visits, and admin content management.

## Stack

- Frontend: Angular 21, TypeScript, Angular Material, OpenStreetMap
- Backend: Node.js, Express, PostgreSQL, JWT authentication
- Database: PostgreSQL with normalized schema and admin audit logs

## Environment setup

### Backend

1. Create `backend/.env` and fill in:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `CLIENT_URL`
   - `GEMINI_API_KEY`

### Frontend

1. Update `frontend/src/environments/environment.ts`
2. Set:
   - `apiUrl`

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
2. Run `npm run seed` to apply the schema and starter data, including sample Kosovo heritage locations

## Seeded starter content

- Default admin user: `admin@heritage360.local`
- Default password: `Admin123!`
- 37 sample locations across Historical, Cultural, Natural, and Museum categories
- Sample locations include Kosovo Museum, Prizren Fortress, Ulpiana Archaeological Park, Mirusha Waterfalls, Germia Park, Brezovica Ski Center, Newborn Monument, Grand Bazaar of Gjakova, Novo Brdo Fortress, and the Jashari Memorial Complex

## Production build

```bash
npm run build
```

## Notes

- Admin users can create, edit, and delete locations
- All location mutations write to `admin_logs`
- `GET /locations` supports search and category filtering through query params
- JWT is sent in the `Authorization: Bearer <token>` header
