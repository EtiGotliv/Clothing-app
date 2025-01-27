import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import App from './App.jsx';
import index from '../src/in'
// import { DuckProvider } from './context/DuckContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* <DuckProvider> */}
      <App />
      {/* </DuckProvider> */}
    </QueryClientProvider>
  </React.StrictMode>
);
