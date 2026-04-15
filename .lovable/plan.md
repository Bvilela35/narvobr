

## Plan: Seção "Essenciais" + 2 novas páginas

Inspirada no layout Apple da imagem de referência — dois blocos lado a lado com fundo `#f8f8f8`, títulos centralizados, descrição curta e link de ação.

### 1. Nova página: `/nossa-historia` (Nossa História)

Página editorial contando a história da Narvo. Layout minimalista com seções de texto, alinhado ao manifesto "Engenharia do Silêncio". Conteúdo placeholder editável posteriormente. Helmet SEO incluído.

### 2. Nova página: `/materiais` (Materiais & Design)

Página editorial sobre materiais, qualidade e design dos produtos Narvo. Foco em vocabulário proprietário (aço, polímero, densidade, fosco). Layout similar à página de história. Helmet SEO incluído.

### 3. Novo componente: `EssentialsSection`

Seção com fundo branco, dois blocos `#f8f8f8` lado a lado (grid 2 colunas no desktop, stack no mobile), cada um com:
- Título em bold (ex: "Nossa História", "Materiais & Design")
- Descrição curta centralizada
- Link azul "Saiba mais >"
- Sem imagens inicialmente (pode adicionar depois)

Posicionamento: acima do `<BlogSection />` no `Index.tsx`.

### 4. Rotas no App.tsx

Registrar `/nossa-historia` e `/materiais` como rotas lazy-loaded.

### Arquivos criados/editados

| Arquivo | Ação |
|---------|------|
| `src/components/EssentialsSection.tsx` | Criar — seção 2 blocos |
| `src/pages/NossaHistoria.tsx` | Criar — página história |
| `src/pages/MateriaisDesign.tsx` | Criar — página materiais |
| `src/pages/Index.tsx` | Editar — inserir `<EssentialsSection />` acima de `<BlogSection />` |
| `src/App.tsx` | Editar — adicionar 2 rotas |

