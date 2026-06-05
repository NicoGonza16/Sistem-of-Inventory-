import {
  LazyMotion,
  domAnimation,
  m,
} from "framer-motion";

import { useState } from "react";

import {
  FiLock,
  FiUser,
} from "react-icons/fi";

import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

import { useAuth } from "../../context/AuthContext";

function Login() {
  const { login, isAuthenticated } =
    useAuth();

  const [form, setForm] = useState({
    usuario: "",
    contraseña: "",
  });

  const [errors, setErrors] = useState(
    {}
  );

  const [loading, setLoading] =
    useState(false);

  const navigate = useNavigate();

  const location = useLocation();

  if (isAuthenticated) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  const validate = () => {
    const nextErrors = {};

    if (!form.usuario.trim()) {
      nextErrors.usuario =
        "Ingresa tu usuario.";
    }

    if (!form.contraseña.trim()) {
      nextErrors.contraseña =
        "Ingresa tu contraseña.";
    }

    setErrors(nextErrors);

    return !Object.keys(nextErrors)
      .length;
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      setErrors({});

      await login({
        usuario: form.usuario.trim(),
        contraseña: form.contraseña,
        contraseña: form.contraseña,
      });

      navigate(
        location.state?.from
          ?.pathname || "/dashboard",
        {
          replace: true,
        }
      );
    } catch (error) {
      setErrors((current) => ({
        ...current,
        api:
          error?.response?.data
            ?.message ||
          error?.message ||
          "No fue posible iniciar sesión.",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4">
        <div className="absolute inset-0 bg-grid-radial bg-grid opacity-70" />

        <div className="absolute left-1/2 top-20 size-44 -translate-x-1/2 rounded-full bg-cyan-500/15 blur-3xl" />

        <m.div
          initial={{
            opacity: 0,
            y: 24,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="panel relative w-full max-w-md p-8"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-3xl bg-cyan-500/10 text-lg font-semibold text-cyan-300">
              BI
            </div>

            <h1 className="text-2xl font-semibold text-white">
              BAR INVENTORY OS
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Ingresa para acceder al
              panel.
            </p>
          </div>

          <form
            className="space-y-5"
            onSubmit={handleSubmit}
          >
            <Input
              label="Usuario"
              placeholder="admin"
              icon={FiUser}
              value={form.usuario}
              error={errors.usuario}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  usuario:
                    event.target.value,
                }))
              }
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="••••"
              icon={FiLock}
              value={form.contraseña}
              error={errors.contraseña}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  contraseña:
                    event.target.value,
                }))
              }
            />

            {errors.api ? (
              <p className="text-sm text-rose-400">
                {errors.api}
              </p>
            ) : null}

            <Button
              type="submit"
              loading={loading}
              className="w-full py-3"
            >
              Ingresar
            </Button>
          </form>
        </m.div>
      </div>
    </LazyMotion>
  );
}

export default Login;