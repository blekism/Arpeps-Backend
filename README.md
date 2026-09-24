# Arpeps Backend
This project utilizes Supabase as a plain Postgres database, while having my own backend that handles authentication and db interaction. This is not to solve any particular issue with Supabase's JS SDK.
it is primarily to learn backend development using ExpressJs with TypeScript.

### Tech Stack
* NodeJs
* ExpressJs
* Postgres

### Prerequisites
* Node.Js v24.14.1
* ExpressJs v5.2.1
* TypeScript v5.9.3
* Postgres v17.6.1.155

### Architecture Overview
Frontend (Separate Origin)
    │  fetch via apiFetch() / plain fetch() / axios request
    ▼
Express App (app.ts)
    │ cors -> helmet -> cookieParser -> express.json -> rate limiters
    ▼
Routes (routes/*.routes.ts)
    │ maps URL + method + controller, with per route middleware
    ▼  
Middleware (requireAuth, verifyCsrfToken)
    │ classify/gatekeep the request
    ▼
Controllers (controllers/*.controller.ts)
    │ read req, call service(s), shape the HTTP Response
    ▼
Services (service/*.service.ts)
    │ business logic, parametarized queries, transactions
    ▼
Postgres (Supabase) - Obtain schema by running node-pg-migrate up

### Design Decisions
- **Layered Architecture**: For a simple project like Arpeps, having a linear and predictable path makes development and maintenance easier because all requests follow a set path from *.routes.ts -> /middleware -> *.controllers.ts -> *.services.ts. Wherein each directory has its own clear responsibility. If project does or is planned to grow further, Feature-based Architecture may be adopted for a cleaner architecture.

### Components
- **API Layer**: Routes, Middleware and Controllers: handles auth, CSRF validation, and HTTP concerns.
- **Service Layer**: Holds the business logic, kept independent of Express so that it's easy to test.
- **Postgres**: Primary data store for users, papers, generated analysis
- **Express-Rate-Limit**: Simple implementation of rate limiting. Can be substituted with Redis for a more robust rate limiter

### Request Flow: /paper/uploadpaper
1. Request hits the requireAuth middleware first, to validate the user's JWT, and if valid, attach the user_id from the JWT onto the request payload.
2. Request hits the verifyCsrfToken next to check whether the request actually came from your own frontend
3. After all validation finishes, the controller validates the payload via Zod, and if successful, calls the 'postPaperService()'
4. The service then executes the parameterized query to write the data onto Postgres
5. If successful, returns a status 200 immediately

### Installation and setup
1. Clone repo via Github Desktop or via Github CLI
2. Extract the zip
3. Open the project in your preferred text editor
4. Create your .env file in the project folder
5. add the needed values: PORT(to select which port to run the project in), NODE_ENV(dev or prod), DATABASE_URL(postgres db url provided by supabase), JWT_SECRET, JWT_REFRESH
6. Run npm install to install the dependencies
7. Run npm run dev
8. Test in postman first http://localhost:YOUR_PORT/api/health to see if project is running
9. Then run in your terminal npx ts-node src/scripts/test-db.ts to see if database is responding

### Database Setup
1. Run npx node-pg-migrate up to create the schema in supabase

### Project Structure
src/
  config/
  controllers/
  middleware/
  routes/
  scripts/
  services/
  types/
  app.ts
  server.ts


