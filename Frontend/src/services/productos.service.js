import api from "../api/axios";

export const getProductos = async () => {
  const response = await api.get("/productos");
  return response.data;
};

export const createProducto = async (payload) => {
  const response = await api.post("/productos", payload);
  return response.data;
};

export const updateProducto = async (id, payload) => {
  const response = await api.put(`/productos/${id}`, payload);
  return response.data;
};

export const deleteProducto = async (id) => {
  const response = await api.delete(`/productos/${id}`);
  return response.data;
};

export const getProductoImagenes = async (productId) => {
  const response = await api.get(`/productos/${productId}/imagenes`);
  return response.data;
};

export const uploadProductoImagenes = async (productId, files) => {
  const formData = new FormData();
  [...files].forEach((file) => formData.append("imagenes", file));
  const response = await api.post(`/productos/${productId}/imagenes`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateProductoImagen = async (imageId, file) => {
  const formData = new FormData();
  formData.append("imagen", file);
  const response = await api.put(`/productos/imagenes/${imageId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteProductoImagen = async (imageId) => {
  const response = await api.delete(`/productos/imagenes/${imageId}`);
  return response.data;
};
