import React from "react";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24,

      // Queries wait for a connection rather than
      // repeatedly attempting requests while offline.
      networkMode: "online",

      retry: 1,
      refetchOnWindowFocus: false,
    },

    mutations: {
      // Mutation functions run immediately so the
      // offline policy can reject them.
      // They must never be silently queued.
      networkMode: "always",

      retry: 0,
    },
  },
});

interface Props {
  children: React.ReactNode;
}

export function QueryProvider({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export { queryClient };