require("dotenv").config();

const app = require("./app");
const prisma = require("./config/database");
const { ensureDefaultAdmin } = require("./services/auth.service");

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    console.log("Iniciando servidor...");

    // 1. Conexión a base de datos (Neon)
    await prisma.$connect();
    console.log("Base de datos conectada");

    // 2. Iniciar servidor INMEDIATAMENTE (CRÍTICO)
    app.listen(PORT, () => {
      console.log(`Servidor backend corriendo en el puerto ${PORT}`);
    });

    // 3. Ejecutar tareas pesadas SIN bloquear el arranque
    ensureDefaultAdmin(prisma)
      .then(() => {
        console.log("Admin por defecto verificado/creado");
      })
      .catch((err) => {
        console.error("Error creando admin por defecto:", err.message);
      });

  } catch (error) {
    console.error("No fue posible iniciar el servidor:", error.message);
    process.exit(1);
  }
};

startServer();