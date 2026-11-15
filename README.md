# Bar Inventory OS

Full stack web app to run a bar or restaurant: inventory, stock movements, tables, bills, sales and reports.

**Live demo:** https://sistem-of-inventory.vercel.app (login required)

## Features

- **Authentication and roles:** JWT login, passwords hashed with bcrypt, and two roles (`admin`, `empleado`) enforced by role middleware.
- **Inventory:** categories, products with image galleries (uploaded to Cloudinary) and stock movements (in/out).
- **Tables and bills:** open tables, add items to a bill and close it.
- **Dashboard and reports:** sales overview and status charts.

## Tech stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, React Router, TanStack Query, Axios, Recharts, Framer Motion |
| Backend | Node.js, Express, Prisma ORM, JWT, bcrypt, Multer + Cloudinary |
| Database | PostgreSQL (Neon) |
| Deployment | Frontend on Vercel, API on Railway |

## Project structure

```
Backend/
  prisma/        schema.prisma and migrations
  src/
    routes/      /api/auth, /api/usuarios, /api/categorias, /api/productos,
                 /api/movimientos, /api/mesas, /api/cuentas, /api/detalle-cuenta, /api/dashboard
    controllers/ request handlers
    services/    auth and inventory logic
    middlewares/ auth, roles, uploads and error handling
Frontend/
  src/
    pages/       dashboard, productos, categorias, mesas, cuentas, ventas, reportes, auth
    components/  layout, product UI, charts and reusable UI
```

## Running locally

**Backend**

```bash
cd Backend
npm install
# .env: PORT, DATABASE_URL, JWT_SECRET, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
npx prisma generate
npx prisma migrate dev
npm run dev
```

**Frontend**

```bash
cd Frontend
npm install
# .env: VITE_API_URL=<backend URL>/api
npm run dev
```

More detail in `Backend/README.md` and `Frontend/README.md`.

## Author

Nicolás González Varela · [GitHub](https://github.com/NicoGonza16) · [LinkedIn](https://www.linkedin.com/in/nicolas-gonzalez-varela-0399123b3)
