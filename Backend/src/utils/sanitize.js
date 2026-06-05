const sanitizeUsuario = (usuario) => {
  if (!usuario) {
    return usuario;
  }

  const { contraseña, ...safeUsuario } = usuario;
  return safeUsuario;
};

module.exports = {
  sanitizeUsuario,
};
