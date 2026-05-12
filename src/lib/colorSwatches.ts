// Mapeamento global de nomes de cores -> hex para swatches visuais.
export const COLOR_MAP: Record<string, string> = {
  preto: "#1a1a1a",
  "preto fosco": "#1a1a1a",
  branco: "#f5f5f5",
  "off-white": "#f5f0e8",
  cinza: "#9e9e9e",
  "cinza claro": "#c0c0c0",
  grafite: "#4a4a4a",
  chumbo: "#3d3d3d",
  prata: "#c0c0c0",
  natural: "#d4c5a9",
  caramelo: "#8B5E3C",
  marrom: "#5C3A1E",
  "marrom escuro": "#3B2314",
  bege: "#D4C4A8",
  verde: "#0f3d2e",
  "verde escuro": "#0f3d2e",
  lima: "#b6e36d",
};

export function getColorHex(name: string): string | null {
  return COLOR_MAP[name.toLowerCase().trim()] ?? null;
}
