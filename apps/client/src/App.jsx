import { BrowserRouter } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './config/wagmi';
import AppRoutes from "./components/routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { LoanProvider } from "./context/LoanContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <LoanProvider>
              <AppRoutes />
            </LoanProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;