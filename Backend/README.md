# Backend - Sistema de Inventario Bar/Restaurante

Backend profesional construido con Node.js, Express, PostgreSQL, Prisma ORM y JWT para gestionar autenticación, inventario, mesas, cuentas, ventas y movimientos.

## Stack

- Node.js
- Express
- PostgreSQL
- Prisma ORM
- JWT
- bcrypt
- dotenv
- cors
- nodemon

## Instalación

1. Entrar a la carpeta `Backend`.
2. Instalar dependencias:

```bash
npm install
```

3. Configurar variables de entorno en `.env`:

```env
PORT=3001
JWT_SECRET=supersecretkey
DATABASE_URL=postgresql://postgres:1234@localhost:5432/bar_inventory
```

## Prisma y migraciones

1. Generar cliente Prisma:

```bash
npx prisma generate
```

2. Ejecutar migración inicial:

```bash
npx prisma migrate dev --name init
```

## Ejecución

Modo desarrollo:

```bash
npm run dev
```

Modo producción:

```bash
npm start
```

## Estructura

```text
Backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── app.js
│   └── server.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

## Endpoints

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET|POST|PUT|DELETE /api/usuarios`
- `GET|POST|PUT|DELETE /api/categorias`
- `GET|POST|PUT|DELETE /api/productos`
- `GET|POST|PUT|DELETE /api/movimientos`
- `GET|POST|PUT|DELETE /api/mesas`
- `GET|POST|PUT|DELETE /api/cuentas`
- `GET|POST|PUT|DELETE /api/detalle-cuenta`

## Reglas de negocio incluidas

- Hash seguro de contraseñas con bcrypt.
- Login con JWT.
- Middleware `verifyToken` y `verifyAdmin`.
- Stock nunca negativo.
- Usuario único.
- Mesa única.
- Categoría válida antes de crear o actualizar productos.
- Creación de detalle de cuenta descuenta stock y registra salida automática.
- Movimientos manuales ajustan stock automáticamente.
- Cierre de cuenta libera la mesa.
- Soft delete en entidades donde conviene preservar historial.

## Notas

- Todas las respuestas usan el formato:

```json
{
  "success": true,
  "message": "mensaje",
  "data": {}
}
```

- Prisma usa PostgreSQL como datasource principal.
- Si PostgreSQL no está corriendo o la base `bar_inventory` no existe, la migración y el arranque fallarán hasta que la conexión esté disponible.
