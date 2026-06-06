require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/auth.routes");
const usuariosRoutes = require("./routes/usuarios.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const categoriasRoutes = require("./routes/categorias.routes");
const productosRoutes = require("./routes/productos.routes");
const movimientosRoutes = require("./routes/movimientos.routes");
const mesasRoutes = require("./routes/mesas.routes");
const cuentasRoutes = require("./routes/cuentas.routes");
const detalleCuentaRoutes = require("./routes/detalleCuenta.routes");
const errorMiddleware = require("./middlewares/error.middleware");


const app = express();

app.use(cors({
  origin: [
    "https://sistem-of-inventory.vercel.app"
  ],
  credentials: true
}));

const fs = require("fs");

console.log(
  "EXISTE UPLOADS:",
  fs.existsSync(
    path.join(process.cwd(), "uploads")
  )
);

console.log(
  "CONTENIDO UPLOADS:",
  fs.existsSync(
    path.join(process.cwd(), "uploads")
  )
    ? fs.readdirSync(
        path.join(process.cwd(), "uploads")
      )
    : "NO EXISTE"
);

app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API del sistema de inventario operativa.",
    data: null,
  });
});

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/movimientos", movimientosRoutes);
app.use("/api/mesas", mesasRoutes);
app.use("/api/cuentas", cuentasRoutes);
app.use("/api/detalle-cuenta", detalleCuentaRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada.",
    data: null,
  });
});

app.use(errorMiddleware);

module.exports = app;
