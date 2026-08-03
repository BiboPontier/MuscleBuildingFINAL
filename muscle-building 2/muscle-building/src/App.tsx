import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ToasterProvider } from '@/components/ui/Toaster';
import { router } from '@/routes/router';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 15_000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToasterProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ToasterProvider>
    </QueryClientProvider>
  );
}
