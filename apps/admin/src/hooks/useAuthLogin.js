import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { authService } from "../services/authService";
import { useAuth } from "./useAuth";

export const useLogin = () => {
  const { login } = useAuth();

  return useMutation({
    mutationFn: authService.login,

    onSuccess: (response) => {
      login(
        response.data?.token,
        response.data?.admin
      );
      toast.success('Login successful!');
    },
    onError: (error) => {
      console.log(error)
      toast.error(error?.response?.data?.message || error?.message || 'Failed to login');
    }
  });
};