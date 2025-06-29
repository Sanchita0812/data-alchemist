import { create } from "zustand";

interface ParsedData {
  clients: any[];
  workers: any[];
  tasks: any[];
}

interface DataStore {
  parsedData: ParsedData;
  setParsedData: (data: ParsedData) => void;
}

export const useDataStore = create<DataStore>((set) => ({
  parsedData: { clients: [], workers: [], tasks: [] },
  setParsedData: (data) => set({ parsedData: data }),
}));