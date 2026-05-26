import api from "../api/axios";

export const getMesas = async () => {
  const response = await api.get("/mesas");
  return response.data;
};

export const createMesa = async (payload) => {
  const response = await api.post("/mesas", payload);
  return response.data;
};

export const updateMesa = async (id, payload) => {
  const response = await api.put(`/mesas/${id}`, payload);
  return response.data;
};

export const deleteMesa = async (id) => {
  const response = await api.delete(`/mesas/${id}`);
  return response.data;
};
