import { create } from "zustand";

interface ParsedData {
  clients: any[];
  workers: any[];
  tasks: any[];
}

interface ParsedDataStore {
  data: ParsedData;
  setData: (newData: ParsedData) => void;
}

export const useParsedDataStore = create<ParsedDataStore>((set) => ({
  data: { clients: [], workers: [], tasks: [] },
  setData: (newData) => set({ data: newData }),
}));
