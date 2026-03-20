import { create } from 'zustand';

interface CepStore {
  cep: string;
  setCep: (cep: string) => void;
}

export const useCepStore = create<CepStore>((set) => ({
  cep: '',
  setCep: (cep) => set({ cep }),
}));
