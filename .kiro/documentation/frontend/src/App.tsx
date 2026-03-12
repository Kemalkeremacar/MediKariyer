import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ArchitecturePage } from '@/pages/ArchitecturePage';
import { RolesPage } from '@/pages/RolesPage';
import { FlowsPage } from '@/pages/FlowsPage';
import { ImpactAnalysisPage } from '@/pages/ImpactAnalysisPage';
import { APIDocsPage } from '@/pages/APIDocsPage';
import { SettingsPage } from '@/pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/architecture" element={<ArchitecturePage />} />
                        <Route path="/roles" element={<RolesPage />} />
                        <Route path="/flows" element={<FlowsPage />} />
                        <Route path="/impact" element={<ImpactAnalysisPage />} />
                        <Route path="/api-docs" element={<APIDocsPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;