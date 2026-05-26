const AppError = require("../utils/appError");

const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.rol !== "admin") {
    return next(new AppError("Acceso restringido a administradores.", 403));
  }

  next();
};

module.exports = {
  verifyAdmin,
};
