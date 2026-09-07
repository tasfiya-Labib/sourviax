# Sourviax

Sourviax is a small Express workspace for connecting buyers with verified suppliers.

## Structure

- `server.js` - Express server and route definitions
- `public/` - marketplace page, styles, scripts, and images
- `views/admin.html` - supplier workspace dashboard
- `.env.example` - local configuration template

## Run locally

```bash
npm install
npm start
```

Open [http://localhost:3001](http://localhost:3001) for the marketplace or [http://localhost:3001/admin](http://localhost:3001/admin) for the supplier workspace.

Set `PORT` in a local `.env` file to use another port.

## Admin authentication

The `/admin` supplier workspace requires login. Copy `.env.example` to `.env` and set unique values for `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `SESSION_SECRET` before starting the server.

For production, add the same variables in your hosting provider's environment settings. Do not commit `.env` or place real credentials in `.env.example`.
