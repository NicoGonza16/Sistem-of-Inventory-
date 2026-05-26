import { useState } from "react";
import toast from "react-hot-toast";

const getErrorMessage = (error, fallback = "Ocurrió un error inesperado.") =>
  error?.response?.data?.message || error?.message || fallback;

const useAsyncAction = () => {
  const [loading, setLoading] = useState(false);

  const execute = async (callback, options = {}) => {
    const { successMessage, errorMessage } = options;

    try {
      setLoading(true);
      const result = await callback();

      if (successMessage) {
        toast.success(successMessage);
      }

      return result;
    } catch (error) {
      toast.error(getErrorMessage(error, errorMessage));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading };
};

export default useAsyncAction;
