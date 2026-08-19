import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@/services/userApiService';
import { useAuth } from '@/hooks/useAuth';

/**
 * React Query hook to fetch the authenticated user's profile.
 * Only runs when the user is authenticated (has JWT token).
 *
 * @returns {{ profile: object|null, isLoading: boolean, isError: boolean, error: unknown, refetch: Function }}
 */
export function useUserProfile() {
  const { isAuthenticated } = useAuth();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getProfile,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 min
  });

  return {
    profile: data?.data?.user ?? data?.user ?? null,
    isLoading,
    isError,
    error,
    refetch,
  };
}
