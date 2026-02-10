import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { useCartSync } from "./hooks/useCartSync";
import Index from "./pages/Index";
import Colecao from "./pages/Colecao";
import Produto from "./pages/Produto";
import Sobre from "./pages/Sobre";
import Suporte from "./pages/Suporte";
import Trocas from "./pages/Trocas";
import Envio from "./pages/Envio";
import Privacidade from "./pages/Privacidade";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  useCartSync();
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/colecao" element={<Colecao />} />
        <Route path="/produto/:handle" element={<Produto />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/suporte" element={<Suporte />} />
        <Route path="/trocas" element={<Trocas />} />
        <Route path="/envio" element={<Envio />} />
        <Route path="/privacidade" element={<Privacidade />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
