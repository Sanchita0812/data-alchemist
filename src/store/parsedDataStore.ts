import { create } from "zustand";

type EntityType = "clients" | "workers" | "tasks";

export interface ParsedData {
  clients: any[];
  workers: any[];
  tasks: any[];
}

interface ParsedDataStore {
  parsedData: ParsedData;
  setParsedData: (data: ParsedData) => void;
  updateEntity: (type: EntityType, updated: any[]) => void;
}

export const useParsedDataStore = create<ParsedDataStore>((set) => ({
  parsedData: {
    clients: [],
    workers: [],
    tasks: [],
  },
  setParsedData: (data) => set({ parsedData: data }),
  updateEntity: (type, updated) =>
    set((state) => ({
      parsedData: {
        ...state.parsedData,
        [type]: updated,
      },
    })),
}));