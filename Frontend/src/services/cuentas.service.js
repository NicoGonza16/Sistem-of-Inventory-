import api from "../api/axios";

export const getCuentas = async () => {
  const response = await api.get("/cuentas");
  return response.data;
};

export const createCuenta = async (payload) => {
  const response = await api.post("/cuentas", payload);
  return response.data;
};

export const updateCuenta = async (id, payload) => {
  const response = await api.put(`/cuentas/${id}`, payload);
  return response.data;
};

export const deleteCuenta = async (id) => {
  const response = await api.delete(`/cuentas/${id}`);
  return response.data;
};

export const getDetalleCuenta = async () => {
  const response = await api.get("/detalle-cuenta");
  return response.data;
};

export const createDetalleCuenta = async (payload) => {
  const response = await api.post("/detalle-cuenta", payload);
  return response.data;
};

export const deleteDetalleCuenta = async (id) => {
  const response = await api.delete(`/detalle-cuenta/${id}`);
  return response.data;
};
