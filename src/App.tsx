import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ScrollToTop } from "./components/ScrollToTop";
import { useCartSync } from "./hooks/useCartSync";
import { RoutePrefetcher } from "./components/RoutePrefetcher";
const Index = lazy(() => import("./pages/Index"));
const Colecao = lazy(() => import("./pages/Colecao"));
const ColecaoHandle = lazy(() => import("./pages/ColecaoHandle"));
const Produto = lazy(() => import("./pages/Produto"));

const ProdutoAdicionado = lazy(() => import("./pages/ProdutoAdicionado"));

const Journal = lazy(() => import("./pages/Journal"));
const Artigo = lazy(() => import("./pages/Artigo"));
const Sobre = lazy(() => import("./pages/Sobre"));
const Suporte = lazy(() => import("./pages/Suporte"));
const Trocas = lazy(() => import("./pages/Trocas"));
const Envio = lazy(() => import("./pages/Envio"));
const Privacidade = lazy(() => import("./pages/Privacidade"));
const TermosDeServico = lazy(() => import("./pages/TermosDeServico"));
const Carrinho = lazy(() => import("./pages/Carrinho"));
const Corporativo = lazy(() => import("./pages/Corporativo"));
const NossaHistoria = lazy(() => import("./pages/NossaHistoria"));
const MateriaisDesign = lazy(() => import("./pages/MateriaisDesign"));
const Diagnostico = lazy(() => import("./pages/Diagnostico"));
const Calculadora = lazy(() => import("./pages/Calculadora"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 30 * 60 * 1000,
      staleTime: 1 * 60 * 1000,
    },
  },
});

function AppContent() {
  useCartSync();
  return (
    <Layout>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/carrinho" element={<Carrinho />} />
          <Route path="/colecao" element={<Colecao />} />
          <Route path="/colecao/:handle" element={<ColecaoHandle />} />

          <Route path="/produto/:handle/adicionado" element={<ProdutoAdicionado />} />
          <Route path="/produto/:handle" element={<Produto />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/journal/:slug" element={<Artigo />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/suporte" element={<Suporte />} />
          <Route path="/trocas" element={<Trocas />} />
          <Route path="/envio" element={<Envio />} />
          <Route path="/privacidade" element={<Privacidade />} />
          <Route path="/corporativo" element={<Corporativo />} />
          <Route path="/nossa-historia" element={<NossaHistoria />} />
          <Route path="/materiais" element={<MateriaisDesign />} />
          <Route path="/termos-de-servico" element={<TermosDeServico />} />
          <Route path="/diagnostico" element={<Diagnostico />} />
          <Route path="/calculadora" element={<Calculadora />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <RoutePrefetcher />
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
