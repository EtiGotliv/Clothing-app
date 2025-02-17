import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import App from './App.jsx';

// import { DuckProvider } from './context/DuckContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthPrcvider.js';


const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      {/* <DuckProvider> */}
        <App />
      {/* </DuckProvider> */}
      </AuthProvider>   
    </QueryClientProvider>
  </React.StrictMode>
);
