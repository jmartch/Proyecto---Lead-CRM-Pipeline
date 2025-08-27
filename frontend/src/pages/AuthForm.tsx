import React, { useCallback, useState } from 'react';
import { useForm, type SubmitHandler, type FieldValues } from 'react-hook-form';
import Input from "../components/inputs/Inputs";
import Button from "../components/buttons/Button";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import '../utils/AuthForm.css'
import { useNavigate } from "react-router-dom";

type Variant = "Login" | "Register";

const AuthForm = () => {
  const [variant, setVariant] = useState<Variant>("Login");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();


  const toggleVariant = useCallback(() => {
    setVariant((current) => {
      const nextVariant = current === "Login" ? "Register" : "Login";
      console.log(" Cambiando variant a:", nextVariant);
      return nextVariant;
    });
  }, []);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FieldValues>({
    defaultValues: {
      name: '',
      email: '',
      password: ''
    },
  });


  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    console.log(" Iniciando submit:", { variant, data: { ...data, password: "[OCULTO]" } });

    setIsLoading(true);

    try {
      // Verificar URL de API
      const apiUrl = import.meta.env.VITE_API_URL + '/api/users';
      console.log("🌐 API URL:", apiUrl);

      if (!apiUrl) {
        console.error(" VITE_API_URL no está definida");
        toast.error("Error de configuración: URL de API no encontrada");
        return;
      }

      if (variant === "Register") {
        console.log(" Procesando registro...");

        const registerUrl = `${apiUrl}/register`;

        const registerData = {
          nombre: data.name,
          email: data.email,
          password: data.password
        };
        console.log(" Datos de registro:", { ...registerData, password: "[OCULTO]" });

        const response = await axios.post(registerUrl, registerData, {
          headers: { 'Content-Type': 'application/json' }
        });

        console.log("Registro exitoso:", response.data);
        toast.success("Usuario registrado correctamente");
        reset();
        setVariant("Login");
      }
      else if (variant === "Login") {
        console.log("Procesando login...");

        const loginUrl = `${apiUrl}/login`;
        console.log("URL de login:", loginUrl);

        const loginData = {
          email: data.email,
          password: data.password
        };
        console.log("Datos de login:", { ...loginData, password: "[OCULTO]" });

        console.log("Enviando petición de login...");
        const response = await axios.post(loginUrl, loginData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
          

        console.log("Login exitoso:", {
          ...response.data,
          token: response.data.token ? "[TOKEN_RECIBIDO]" : "NO_TOKEN"
        });

        toast.success("Inicio de sesión exitoso");

        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          console.log("Token guardado en localStorage");
          navigate("/inicio");

        } else {
          console.warn("No se recibió token en la respuesta");
        }

        reset();

      }

    } catch (error: any) {
      console.error("Error en submit:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });

      // Mostrar error específico
      const errorMessage = error.response?.data?.message ||
        error.message ||
        "Error en el servidor";

      toast.error(errorMessage);

    } finally {
      console.log("Finalizando submit");
      setIsLoading(false);
    }
  };

  // Log cuando el componente se monta
  React.useEffect(() => {
    console.log("🎬 AuthForm montado");
    console.log("🌐 Variables de entorno:", {
      VITE_API_URL: import.meta.env.VITE_API_URL,
      NODE_ENV: import.meta.env.NODE_ENV
    });
  }, []);

  return (
    <div className="login-container">
      <div className="login-card">
        <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
          <h2 className="login-title">
            {variant === "Login" ? "Iniciar Sesión" : "Crear Cuenta"}
          </h2>

          {variant === "Register" && (
            <Input
              id="name"
              label="Nombre"
              register={register}
              error={errors}
              disabled={isLoading}
            />
          )}

          <Input
            id="email"
            label="Email"
            type="email"
            register={register}
            error={errors}
            disabled={isLoading}
          />

          <Input
            id="password"
            label="Password"
            type="password"
            register={register}
            error={errors}
            disabled={isLoading}
          />

          <div className="login-button-container">
            <Button disabled={isLoading} type="submit">
              {isLoading
                ? (variant === "Login" ? "Iniciando..." : "Creando...")
                : (variant === "Login" ? "Iniciar Sesión" : "Crear Cuenta")
              }
            </Button>
          </div>
        </form>

        <div className="login-footer">
          <div>
            {variant === "Login" ? "¿Nuevo aquí?" : "¿Ya tienes cuenta?"}
          </div>
          <div
            onClick={toggleVariant}
            className="login-link"
          >
            {variant === "Login" ? "Crear cuenta" : "Iniciar sesión"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;