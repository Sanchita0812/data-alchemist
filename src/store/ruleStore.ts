import { create } from "zustand";
import { Rule } from "@/types/rule";

interface RuleStore {
  rules: Rule[];
  addRule: (rule: Rule) => void;
  deleteRule: (id: string) => void;
  setRules: (rules: Rule[]) => void;
}

export const useRuleStore = create<RuleStore>((set) => ({
  rules: [],
  addRule: (rule) =>
    set((state) => ({
      rules: [...state.rules, rule],
    })),
  deleteRule: (id) =>
    set((state) => ({
      rules: state.rules.filter((r) => r.id !== id),
    })),
  setRules: (rules) => set({ rules }),
}));
