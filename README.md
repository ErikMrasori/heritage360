# Kosovo Tourism & Cultural Platform

Production-ready full-stack application for showcasing Kosovo's historical, cultural, and natural locations with map-based discovery, media, user visits, and admin content management.

## Stack

- Frontend: Angular 21, TypeScript, Angular Material, OpenStreetMap
- Backend: Node.js, Express, PostgreSQL, JWT authentication
- Database: PostgreSQL with normalized schema and admin audit logs

## Project structure

    Kosova360/    
    ├── README.md    
    ├── package.json                         ← monorepo scripts    
    ├── .gitignore    
    ├── uploads/                             ← user-uploaded media 
    │    
    ├── backend/    
    │   ├── package.json    
    │   ├── server.js                        ← process entry    
    │   ├── .env                             ← (gitignored)    
    │   ├── database/    
    │   │   ├── schema.sql                   ← canonical DDL    
    │   │   ├── seed.sql                     ← starter data
    │   │   └── locations_seed.csv           ← bulk-import seed 
    │   ├── scripts/    
    │   │   └── seed.js                      ← schema.sql + seed.sql    
    │   └── src/    
    │       ├── app.js                       ← Express app composition    
    │       ├── config/    
    │       │   ├── db.js                    ← pool + schemaCompat.
    │       │   └── env.js                   ← env var loader + valid    
    │       ├── routes/    
    │       │   ├── auth.routes.js    
    │       │   ├── locations.routes.js    
    │       │   ├── categories.routes.js    
    │       │   ├── reviews.routes.js    
    │       │   ├── visits.routes.js    
    │       │   ├── users.routes.js    
    │       │   ├── upload.routes.js    
    │       │   ├── suggestions.routes.js    
    │       │   └── planner.routes.js    
    │       ├── controllers/    
    │       │   ├── auth.controller.js    
    │       │   ├── locations.controller.js    
    │       │   ├── categories.controller.js    
    │       │   ├── reviews.controller.js    
    │       │   ├── visits.controller.js    
    │       │   └── suggestions.controller.js    
    │       ├── services/    
    │       │   ├── auth.service.js          ← reg/login/verify/resend    
    │       │   ├── email.service.js         ← Resend send wrapper    
    │       │   ├── location.service.js      ← CRUD inside transactions
    │       │   ├── category.service.js    
    │       │   ├── review.service.js    
    │       │   ├── visit.service.js    
    │       │   └── suggestion.service.js    
    │       ├── models/    
    │       │   ├── user.model.js    
    │       │   ├── role.model.js    
    │       │   ├── location.model.js    
    │       │   ├── category.model.js    
    │       │   ├── review.model.js    
    │       │   ├── visit.model.js    
    │       │   ├── suggestion.model.js    
    │       │   └── admin-log.model.js    
    │       ├── middleware/    
    │       │   ├── auth.middleware.js       ← authenticate / authorize    
    │       │   ├── validate.middleware.js    
    │       │   └── error.middleware.js    
    │       ├── validators/    
    │       │   ├── auth.validator.js    
    │       │   ├── location.validator.js    
    │       │   ├── review.validator.js    
    │       │   ├── visit.validator.js    
    │       │   └── suggestion.validator.js    
    │       ├── utils/    
    │       │   ├── api-error.js    
    │       │   ├── async-handler.js    
    │       │   ├── jwt.js    
    │       │   └── media-url.js    
    │       └── scripts/    
    │           ├── import-locations.js      ← CSV bulk-import    
    │           ├── export-media.js          ← dump location_media JSON    
    │           └── import-media.js          ← reload JSON locat._media    
    │    
    └── frontend/    
        ├── package.json    
        ├── angular.json    
        ├── tsconfig.json / tsconfig.app.json    
        ├── public/                          ← static assets (photos)
        └── src/    
            ├── index.html    
            ├── main.ts    
            ├── styles.css                   ← global design  
            ├── environments/    
            │   ├── environment.ts    
            │   └── environment.prod.ts    
            └── app/    
                ├── app.component.ts    
                ├── app.routes.ts    
                ├── app.config.ts    
                ├── core/    
                │   ├── guards/    
                │   │   ├── auth.guard.ts    
                │   │   ├── admin.guard.ts    
                │   │   └── non-admin.guard.ts    
                │   ├── interceptors/        ← HTTP interceptors
                │   ├── models/app.models.ts    
                │   ├── services/    
                │   │   ├── auth.service.ts    
                │   │   ├── category.service.ts    
                │   │   ├── language.service.ts    
                │   │   ├── location.service.ts    
                │   │   ├── maps-loader.service.ts    
                │   │   ├── review.service.ts    
                │   │   ├── suggestion.service.ts    
                │   │   └── visit.service.ts    
                │   └── utils/               ← localized-location, media-url helpers    
                ├── features/    
                │   ├── home/home.component.ts    
                │   ├── auth/login.component.ts    
                │   ├── auth/register.component.ts    
                │   ├── locations/locations-list.component.ts    
                │   ├── locations/location-details.component.ts    
                │   ├── map/map-page.component.ts    
                │   ├── planner/planner.component.ts    
                │   ├── profile/profile.component.ts    
                │   └── admin/admin-dashboard.component.ts    
                └── shared/    
                    ├── components/    
                    │   ├── filter-bar.component.ts    
                    │   ├── map-controls.component.ts    
                    │   └── marker-popup.component.ts    
                    └── pipes/sanitize-url.pipe.ts    

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
