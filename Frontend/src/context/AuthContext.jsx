import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  getProfileRequest,
  loginRequest,
} from "../services/auth.service";

const AuthContext = createContext(null);

const TOKEN_KEY = "token:v1";
const USER_KEY = "user:v1";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error(error);
      localStorage.removeItem(USER_KEY);
      return null;
    }
  });

  const [token, setToken] = useState(() =>
    localStorage.getItem(TOKEN_KEY)
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getProfileRequest();

        const nextUser =
          response?.user ||
          response?.data?.user ||
          response?.data ||
          null;

        if (nextUser) {
          setUser(nextUser);

          localStorage.setItem(
            USER_KEY,
            JSON.stringify(nextUser)
          );
        }
      } catch (error) {
        console.error(
          "Error obteniendo perfil:",
          error.response?.status,
          error.response?.data
        );

        if (
          error?.response?.status === 401 ||
          error?.response?.status === 403
        ) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);

          setToken(null);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [token]);

  const login = async (credentials) => {
    const response = await loginRequest(credentials);

    const authToken =
      response?.token ||
      response?.data?.token;

    const authUser =
      response?.user ||
      response?.data?.user ||
      response?.data?.usuario;

    if (!authToken || !authUser) {
      throw new Error(
        "Respuesta de autenticación inválida."
      );
    }

    localStorage.setItem(
      TOKEN_KEY,
      authToken
    );

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(authUser)
    );

    setToken(authToken);
    setUser(authUser);

    toast.success(
      `Bienvenido, ${authUser.nombre}`
    );
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setToken(null);
    setUser(null);

    toast.success("Sesión cerrada");
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      loading,
      login,
      logout,
    }),
    [user, token, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);

export default AuthContext;