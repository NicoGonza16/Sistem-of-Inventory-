# Frontend - Sistema de Inventario Bar/Restaurante

Frontend administrativo profesional construido con React + Vite para operar un bar o restaurante con módulos de dashboard, inventario, mesas, cuentas, ventas y reportes.

## Tecnologías

- React
- Vite
- React Router DOM
- Axios
- TailwindCSS
- Context API
- React Icons
- React Hot Toast
- Recharts
- Framer Motion

## Instalación

1. Entrar a la carpeta `Frontend`.
2. Instalar dependencias:

```bash
npm install
```

3. Verificar el archivo `.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

## Ejecución

Modo desarrollo:

```bash
npm run dev
```

Build de producción:

```bash
npm run build
```

Vista previa del build:

```bash
npm run preview
```

## Estructura

```text
Frontend/
├── public/
├── src/
│   ├── api/
│   ├── assets/
│   ├── components/
│   │   ├── charts/
│   │   ├── layout/
│   │   └── ui/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   │   ├── auth/
│   │   ├── categorias/
│   │   ├── cuentas/
│   │   ├── dashboard/
│   │   ├── mesas/
│   │   ├── productos/
│   │   ├── reportes/
│   │   └── ventas/
│   ├── routes/
│   ├── services/
│   ├── styles/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.mjs
└── package.json
```

## Backend esperado

El frontend está preparado para consumir un backend Express en:

```text
http://localhost:3001/api
```

Endpoints utilizados:

- `POST /auth/login`
- `GET /auth/me`
- `GET|POST|PUT|DELETE /productos`
- `GET|POST|PUT|DELETE /categorias`
- `GET|POST|PUT /mesas`
- `GET|POST|PUT|DELETE /cuentas`
- `GET|POST|DELETE /detalle-cuenta`

## Funcionalidades incluidas

- Login con persistencia de JWT en `localStorage`.
- Rutas protegidas.
- Sidebar responsive colapsable.
- Navbar administrativa con búsqueda visual, notificaciones y perfil.
- Dashboard con métricas y gráficas.
- CRUD visual de productos con búsqueda, filtros, paginación y modal.
- CRUD visual de categorías.
- Vista POS de mesas con apertura y cierre de cuentas.
- Módulo de ventas para agregar productos a cuentas abiertas y cerrar venta.
- Reportes con datos reales cuando existen endpoints y fallback mock si faltan datos.
- Toasters, loaders, estados vacíos y confirmaciones.

## Notas

- Si el backend no está levantado o el JWT no es válido, el usuario será redirigido al login.
- El módulo de reportes puede usar datos mock automáticamente si alguna consulta falla.
- Para una experiencia completa, asegúrate de que PostgreSQL, Prisma y el backend estén operativos.
