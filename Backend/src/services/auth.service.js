const bcrypt = require("bcrypt");

/**
 * Crea el administrador inicial SOLO si se definen ADMIN_USER y ADMIN_PASSWORD
 * en las variables de entorno. No hay credenciales por defecto en el código.
 */
const ensureDefaultAdmin = async (prisma) => {
  const username = process.env.ADMIN_USER?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.warn("ADMIN_USER o ADMIN_PASSWORD no definidos: no se crea el administrador inicial.");
    return;
  }

  if (password.length < 8) {
    console.warn("ADMIN_PASSWORD debe tener al menos 8 caracteres: no se crea el administrador inicial.");
    return;
  }

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

  // Migra una contraseña antigua guardada en texto plano a bcrypt (no la cambia)
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
