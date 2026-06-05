const bcrypt = require("bcrypt");

const ensureDefaultAdmin = async (prisma) => {
  const username = "admin";
  const password = "1234";

  const existingAdmin = await prisma.usuario.findFirst({
    where: {
      usuario: {
        equals: username,
        mode: "insensitive",
      },
      deleted_at: null,
    },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.usuario.create({
      data: {
        nombre: "Administrador General",
        usuario: username,
        contraseña: hashedPassword,
        rol: "admin",
        estado: true,
      },
    });

    return;
  }

  if (!existingAdmin.contraseña?.startsWith("$2")) {
    const hashedPassword = await bcrypt.hash(existingAdmin.contraseña || password, 10);

    await prisma.usuario.update({
      where: { id_usuario: existingAdmin.id_usuario },
      data: {
        contraseña: hashedPassword,
        estado: true,
      },
    });
  }
};

module.exports = {
  ensureDefaultAdmin,
};
