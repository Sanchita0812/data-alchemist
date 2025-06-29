// src/lib/validateRules.ts
import { Rule, CoRunRule, SlotRestrictionRule, LoadLimitRule, RuleType } from "@/types/rule";

export interface RuleViolation {
  id: string;
  type: RuleType;
  message: string;
}

// Entry point to validate all rules
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

// 1. CoRun Rule: Ensure all tasks in the co-run group have the same PreferredPhases
function validateCoRun(rule: CoRunRule, tasks: any[]): RuleViolation[] {
  const selectedTasks = tasks.filter((t) => rule.tasks.includes(t.TaskID));
  const phaseSets = selectedTasks.map((t) =>
    typeof t.PreferredPhases === "string"
      ? parsePreferredPhases(t.PreferredPhases)
      : t.PreferredPhases
  );

  const mismatch = phaseSets.some(
    (set, _, arr) => JSON.stringify(set) !== JSON.stringify(arr[0])
  );

  if (mismatch) {
    return [
      {
        id: rule.id,
        type: "coRun",
        message: `Co-run tasks ${rule.tasks.join(", ")} must have the same PreferredPhases.`,
      },
    ];
  }

  return [];
}

// 2. Slot Restriction Rule: Check if all clients in a group have at least `minCommonSlots` in common
function validateSlotRestriction(rule: SlotRestrictionRule, clients: any[]): RuleViolation[] {
  const groupClients = clients.filter((c) => c.GroupTag === rule.groupTag);
  const slotsLists = groupClients.map((c) => {
    try {
      return JSON.parse(c.AvailableSlots);
    } catch {
      return [];
    }
  });

  const commonSlots = slotsLists.reduce((acc, slots) =>
    acc.filter((s: number) => slots.includes(s))
  );

  if (commonSlots.length < rule.minCommonSlots) {
    return [
      {
        id: rule.id,
        type: "slotRestriction",
        message: `Group '${rule.groupTag}' does not have ${rule.minCommonSlots} common slots.`,
      },
    ];
  }

  return [];
}

// 3. Load Limit Rule: Ensure no worker in group has MaxLoadPerPhase > rule.limit
function validateLoadLimit(rule: LoadLimitRule, workers: any[]): RuleViolation[] {
  const groupWorkers = workers.filter((w) => w.WorkerGroup === rule.workerGroup);
  const overloaded = groupWorkers.filter(
    (w) => w.MaxLoadPerPhase > rule.maxSlotsPerPhase
  );

  if (overloaded.length > 0) {
    return [
      {
        id: rule.id,
        type: "loadLimit",
        message: `Workers in group '${rule.workerGroup}' exceed max slots per phase (${rule.maxSlotsPerPhase}).`,
      },
    ];
  }

  return [];
}

// Utility to parse PreferredPhases
function parsePreferredPhases(input: string): number[] {
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

  return [];
}
