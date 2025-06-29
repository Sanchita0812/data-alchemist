import {
    Rule,
    CoRunRule,
    LoadLimitRule,
    SlotRestrictionRule,
  } from "@/types/rule";
  
  export interface ApplyRuleResult {
    rule: Rule;
    passed: boolean;
    reason?: string;
  }
  
  interface ParsedData {
    clients: any[];
    workers: any[];
    tasks: any[];
  }
  
  export function applyRules(data: ParsedData, rules: Rule[]): ApplyRuleResult[] {
    return rules.map((rule) => {
      switch (rule.type) {
        case "coRun":
          return checkCoRunRule(rule as CoRunRule, data.tasks);
        case "slotRestriction":
          return checkSlotRestrictionRule(rule as SlotRestrictionRule, data.clients);
        case "loadLimit":
          return checkLoadLimitRule(rule as LoadLimitRule, data.workers);
        default:
          return {
            rule,
            passed: false,
            reason: "Unknown rule type",
          };
      }
    });
  }
  
  // ✅ CoRun Rule
  function checkCoRunRule(rule: CoRunRule, tasks: any[]): ApplyRuleResult {
    const taskMap = new Map(tasks.map((t) => [t.TaskID, t]));
    const missing = rule.tasks.filter((id) => !taskMap.has(id));
  
    if (missing.length) {
      return {
        rule,
        passed: false,
        reason: `Missing task IDs: ${missing.join(", ")}`,
      };
    }
  
    const phaseArrays = rule.tasks.map((id) =>
      normalizePhases(taskMap.get(id)?.PreferredPhases)
    );
  
    if (!phaseArrays.length) {
      return {
        rule,
        passed: false,
        reason: "No phase data available for tasks",
      };
    }
  
    const commonPhases = phaseArrays.reduce((acc, phases) =>
      acc.filter((p) => phases.includes(p))
    );
  
    return {
      rule,
      passed: commonPhases.length > 0,
      reason: commonPhases.length > 0
        ? undefined
        : "No common preferred phases found across tasks",
    };
  }
  
  // ✅ Slot Restriction Rule (FIXED reduce crash)
  function checkSlotRestrictionRule(rule: SlotRestrictionRule, clients: any[]): ApplyRuleResult {
    const groupClients = clients.filter((c) => c.GroupTag === rule.groupTag);
    const allSlots = groupClients.map((c) => normalizePhases(c.AvailableSlots || []));
  
    if (!allSlots.length) {
      return {
        rule,
        passed: false,
        reason: `No clients found with GroupTag '${rule.groupTag}'`,
      };
    }
  
    const common = allSlots.reduce(
      (acc, slots) => acc.filter((s) => slots.includes(s)),
      allSlots[0] ?? [] // ✅ Safe fallback
    );
  
    return {
      rule,
      passed: common.length >= rule.minCommonSlots,
      reason: common.length >= rule.minCommonSlots
        ? undefined
        : `Only ${common.length} common slots found (required ${rule.minCommonSlots})`,
    };
  }
  
  // ✅ Load Limit Rule
  function checkLoadLimitRule(rule: LoadLimitRule, workers: any[]): ApplyRuleResult {
    const groupWorkers = workers.filter((w) => w.WorkerGroup === rule.workerGroup);
  
    for (const w of groupWorkers) {
      const slots = normalizePhases(w.AvailableSlots || []);
      if (slots.length > rule.maxSlotsPerPhase) {
        return {
          rule,
          passed: false,
          reason: `Worker ${w.WorkerID} exceeds max slots (${slots.length} > ${rule.maxSlotsPerPhase})`,
        };
      }
    }
  
    return {
      rule,
      passed: true,
    };
  }
  
  // ✅ Normalizer
  function normalizePhases(phases: any): number[] {
    if (Array.isArray(phases)) return phases.map(Number);
  
    if (typeof phases === "string") {
      try {
        if (phases.startsWith("[")) {
          return JSON.parse(phases);
        }
  
        const match = phases.match(/^(\d+)-(\d+)$/);
        if (match) {
          const start = parseInt(match[1]);
          const end = parseInt(match[2]);
          return Array.from({ length: end - start + 1 }, (_, i) => start + i);
        }
  
        return phases.split(",").map((s) => parseInt(s.trim(), 10));
      } catch {
        return [];
      }
    }
  
    return [];
  }
  