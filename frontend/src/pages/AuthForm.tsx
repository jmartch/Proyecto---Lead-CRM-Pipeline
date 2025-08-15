import React, { useCallback, useState } from 'react';
import  { useForm, type SubmitHandler,type FieldValues } from 'react-hook-form';
import Input from "../components/inputs/Inputs";
import Button from "../components/buttons/Button";
import axios from 'axios';
import { toast } from 'react-hot-toast';

type Variant = "Login" | "Register";

const AuthForm = () => {
  const [variant, setVariant] = useState<Variant>("Login");
  const [isLoading, setIsLoading] = useState(false);

  const toggleVariant = useCallback(() => {
    setVariant((current) => current === "Login" ? "Register" : "Login");
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<FieldValues>({
    defaultValues: {
      name: '',
      email: '',
      password: ''
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);

    try {
      if (variant === "Register") {
        const token = localStorage.getItem("token"); // Necesario para verifyToken

        if (!token) {
          toast.error("Debes iniciar sesión como admin para registrar usuarios");
          setIsLoading(false);
          return;
        }

        await axios.post(import.meta.env.VITE_API_URL+'/api/users/register', {
          nombre: data.name,
          email: data.email,
          password: data.password
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        toast.success("Usuario registrado correctamente");
        setVariant("Login");
      }

      if (variant === "Login") {
        const res = await axios.post(import.meta.env.VITE_API_URL+'/api/users/login', {
          email: data.email,
          password: data.password
        });

        toast.success("Inicio de sesión exitoso");
        localStorage.setItem("token", res.data.token);
        // Aquí puedes guardar info de usuario si tu backend la envía
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error en el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {variant === "Register" && (
            <Input
              id="name"
              label="Name"
              register={register}
              error={errors}
              disabled={isLoading}
            />
          )}

          <Input
            id="email"
            label="Email"
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
          <div>
            <Button fullWidth disabled={isLoading} type="submit">
              {variant === "Login" ? "Sign In" : "Register"}
            </Button>
          </div>
        </form>

        <div className="flex gap-2 justify-center text-sm mt-6 text-gray-500">
          <div>
            {variant === "Login" ? "¿Nuevo aquí?" : "¿Ya tienes cuenta?"}
          </div>
          <div
            onClick={toggleVariant}
            className="underline text-indigo-500 hover:text-indigo-600 cursor-pointer"
          >
            {variant === "Login" ? "Crear cuenta" : "Iniciar sesión"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
