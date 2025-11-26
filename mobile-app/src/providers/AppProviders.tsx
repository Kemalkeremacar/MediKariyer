import { PropsWithChildren, useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { gluestackConfig } from '@/theme/gluestack.config';

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

export const AppProviders = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(createQueryClient);

  return (
    <GluestackUIProvider config={gluestackConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </GluestackUIProvider>
  );
};

