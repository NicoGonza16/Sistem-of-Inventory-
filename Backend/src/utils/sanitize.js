const sanitizeUsuario = (usuario) => {
  if (!usuario) {
    return usuario;
  }

  const { contrasena, ...safeUsuario } = usuario;
  return safeUsuario;
};

module.exports = {
  sanitizeUsuario,
};
