import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import type { LoginParams, RegisterParams } from '../types/api';

export const useAuth = () => {
  return useQuery({
    queryKey: ['auth', 'currentUser'],
    queryFn: () => authService.getCurrentUser(),
    enabled: authService.isAuthenticated(),
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: LoginParams) => authService.login(params),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'currentUser'], { user: data.user });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: RegisterParams) => authService.register(params),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'currentUser'], { user: data.user });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      authService.logout();
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'currentUser'], null);
      queryClient.removeQueries({ queryKey: ['favorites'] });
    },
  });
};