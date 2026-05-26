require("dotenv").config();

const app = require("./app");
const prisma = require("./config/database");
const { ensureDefaultAdmin } = require("./services/auth.service");

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await prisma.$connect();
    await ensureDefaultAdmin(prisma);

    app.listen(PORT, () => {
      console.log(`Servidor backend corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error("No fue posible iniciar el servidor:", error.message);
    process.exit(1);
  }
};

startServer();
