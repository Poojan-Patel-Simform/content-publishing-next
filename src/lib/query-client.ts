import { QueryClient } from "@tanstack/react-query";

export const makeQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 60_000,
      },
    },
  });
};
