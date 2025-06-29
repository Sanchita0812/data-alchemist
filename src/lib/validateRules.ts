import {
    Rule,
    CoRunRule,
    SlotRestrictionRule,
    LoadLimitRule,
    RuleType,
  } from "@/types/rule";
  
  export interface RuleViolation {
    id: string;
    type: RuleType;
    message: string;
  }
  
  export function validateRules(
    rules: Rule[],
    data: {
      clients: any[];
      workers: any[];
      tasks: any[];
    }
  ): RuleViolation[] {
    const violations: RuleViolation[] = [];
  
    for (const rule of rules) {
      if (rule.type === "coRun") {
        violations.push(...validateCoRun(rule as CoRunRule, data.tasks));
      } else if (rule.type === "slotRestriction") {
        violations.push(...validateSlotRestriction(rule as SlotRestrictionRule, data.clients));
      } else if (rule.type === "loadLimit") {
        violations.push(...validateLoadLimit(rule as LoadLimitRule, data.workers));
      }
    }
  
    return violations;
  }
  
  // ✅ Validate CoRun Rule
  function validateCoRun(rule: CoRunRule, tasks: any[]): RuleViolation[] {
    const selectedTasks = tasks.filter((t) => rule.tasks.includes(t.TaskID));
  
    if (selectedTasks.length !== rule.tasks.length) {
      return [
        {
          id: rule.id,
          type: "coRun",
          message: `Some TaskIDs in rule are invalid: ${rule.tasks.join(", ")}`,
        },
      ];
    }
  
    const phaseSets = selectedTasks.map((t) =>
      typeof t.PreferredPhases === "string"
        ? parsePreferredPhases(t.PreferredPhases)
        : Array.isArray(t.PreferredPhases)
        ? t.PreferredPhases.map(Number)
        : []
    );
  
    const mismatch = phaseSets.some(
      (set, _, arr) => JSON.stringify(set) !== JSON.stringify(arr[0])
    );
  
    if (mismatch) {
      return [
        {
          id: rule.id,
          type: "coRun",
          message: `Tasks ${rule.tasks.join(", ")} have different PreferredPhases.`,
        },
      ];
    }
  
    return [];
  }
  
  //Validate Slot Restriction
  function validateSlotRestriction(rule: SlotRestrictionRule, clients: any[]): RuleViolation[] {
    const groupClients = clients.filter((c) => c.GroupTag === rule.groupTag);
  
    if (groupClients.length === 0) {
      return [
        {
          id: rule.id,
          type: "slotRestriction",
          message: `No clients found with groupTag '${rule.groupTag}'.`,
        },
      ];
    }
  
    const slotsLists = groupClients.map((c) => {
      try {
        return Array.isArray(c.AvailableSlots)
          ? c.AvailableSlots.map(Number)
          : JSON.parse(c.AvailableSlots);
      } catch {
        return [];
      }
    });
  
    const validSlots = slotsLists.filter((s) => Array.isArray(s) && s.length > 0);
  
    if (validSlots.length === 0) {
      return [
        {
          id: rule.id,
          type: "slotRestriction",
          message: `Clients in group '${rule.groupTag}' have no valid AvailableSlots.`,
        },
      ];
    }
  
    const commonSlots = validSlots.reduce((acc, slots) =>
      acc.filter((s: number) => slots.includes(s)), validSlots[0]
    );
  
    if (commonSlots.length < rule.minCommonSlots) {
      return [
        {
          id: rule.id,
          type: "slotRestriction",
          message: `Group '${rule.groupTag}' has only ${commonSlots.length} common slots (needs ${rule.minCommonSlots}).`,
        },
      ];
    }
  
    return [];
  }
  
  // ✅ Validate Load Limit
  function validateLoadLimit(rule: LoadLimitRule, workers: any[]): RuleViolation[] {
    const groupWorkers = workers.filter((w) => w.WorkerGroup === rule.workerGroup);
  
    if (!groupWorkers.length) {
      return [
        {
          id: rule.id,
          type: "loadLimit",
          message: `No workers found in group '${rule.workerGroup}'.`,
        },
      ];
    }
  
    const overloaded = groupWorkers.filter((w) => {
      const slots = Array.isArray(w.AvailableSlots)
        ? w.AvailableSlots
        : (() => {
            try {
              return JSON.parse(w.AvailableSlots);
            } catch {
              return [];
            }
          })();
  
      return slots.length > rule.maxSlotsPerPhase;
    });
  
    if (overloaded.length > 0) {
      return [
        {
          id: rule.id,
          type: "loadLimit",
          message: `Workers in group '${rule.workerGroup}' exceed maxSlotsPerPhase (${rule.maxSlotsPerPhase}).`,
        },
      ];
    }
  
    return [];
  }
  
  // 🧠 Parse PreferredPhases like "1-3" or "[1,2,3]"
  function parsePreferredPhases(input: string): number[] {
    if (!input) return [];
  
    if (input.includes("-")) {
      const [start, end] = input.split("-").map(Number);
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
  
    if (input.startsWith("[")) {
      try {
        return JSON.parse(input);
      } catch {
        return [];
      }
    }
  
    return input
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
  }
  