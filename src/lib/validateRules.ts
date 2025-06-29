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
      try {
        if (rule.type === "coRun") {
          violations.push(...validateCoRun(rule as CoRunRule, data.tasks));
        } else if (rule.type === "slotRestriction") {
          violations.push(...validateSlotRestriction(rule as SlotRestrictionRule, data.clients));
        } else if (rule.type === "loadLimit") {
          violations.push(...validateLoadLimit(rule as LoadLimitRule, data.workers));
        }
      } catch (error) {
        violations.push({
          id: rule.id,
          type: rule.type,
          message: `Error validating rule: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }
  
    return violations;
  }
  
  // ✅ Validate CoRun Rule
  function validateCoRun(rule: CoRunRule, tasks: any[]): RuleViolation[] {
    if (!rule.tasks || rule.tasks.length < 2) {
      return [{
        id: rule.id,
        type: "coRun",
        message: "Co-Run rule must specify at least 2 tasks"
      }];
    }

    const selectedTasks = tasks.filter((t) => rule.tasks.includes(t.TaskID));
  
    if (selectedTasks.length !== rule.tasks.length) {
      const missingTasks = rule.tasks.filter(taskId => !tasks.some(t => t.TaskID === taskId));
      return [
        {
          id: rule.id,
          type: "coRun",
          message: `Invalid TaskIDs: ${missingTasks.join(", ")}`,
        },
      ];
    }
  
    // Check if tasks have compatible preferred phases
    const phaseSets = selectedTasks.map((t) => {
      const phases = normalizePhases(t.PreferredPhases);
      return phases.sort((a, b) => a - b);
    });

    // Check for phase compatibility (tasks should have overlapping phases)
    if (phaseSets.length > 1) {
      const firstPhases = phaseSets[0];
      const hasOverlap = phaseSets.every(phases => 
        phases.some(phase => firstPhases.includes(phase))
      );

      if (!hasOverlap) {
        return [
          {
            id: rule.id,
            type: "coRun",
            message: `Tasks ${rule.tasks.join(", ")} have no overlapping preferred phases and cannot run together`,
          },
        ];
      }
    }
  
    return [];
  }
  
  // ✅ Validate Slot Restriction
  function validateSlotRestriction(rule: SlotRestrictionRule, clients: any[]): RuleViolation[] {
    if (!rule.groupTag || !rule.minCommonSlots || rule.minCommonSlots < 1) {
      return [{
        id: rule.id,
        type: "slotRestriction",
        message: "Slot restriction rule must specify a valid group tag and minimum common slots (≥1)"
      }];
    }

    const groupClients = clients.filter((c) => c.GroupTag === rule.groupTag);
  
    if (groupClients.length === 0) {
      return [
        {
          id: rule.id,
          type: "slotRestriction",
          message: `No clients found with group tag '${rule.groupTag}'`,
        },
      ];
    }

    if (groupClients.length === 1) {
      return [
        {
          id: rule.id,
          type: "slotRestriction",
          message: `Only one client found in group '${rule.groupTag}'. Slot restrictions require multiple clients`,
        },
      ];
    }
  
    const slotsLists = groupClients.map((c) => {
      return normalizeSlots(c.AvailableSlots);
    });
  
    const validSlots = slotsLists.filter((s) => Array.isArray(s) && s.length > 0);
  
    if (validSlots.length === 0) {
      return [
        {
          id: rule.id,
          type: "slotRestriction",
          message: `Clients in group '${rule.groupTag}' have no valid available slots`,
        },
      ];
    }

    if (validSlots.length < groupClients.length) {
      return [
        {
          id: rule.id,
          type: "slotRestriction",
          message: `Some clients in group '${rule.groupTag}' have invalid or missing available slots`,
        },
      ];
    }
  
    // Find common slots across all clients in the group
    const commonSlots = validSlots.reduce((acc, slots) =>
      acc.filter((s: number) => slots.includes(s)), validSlots[0]
    );
  
    if (commonSlots.length < rule.minCommonSlots) {
      return [
        {
          id: rule.id,
          type: "slotRestriction",
          message: `Group '${rule.groupTag}' has only ${commonSlots.length} common slots but requires ${rule.minCommonSlots}`,
        },
      ];
    }
  
    return [];
  }
  
  // ✅ Validate Load Limit
  function validateLoadLimit(rule: LoadLimitRule, workers: any[]): RuleViolation[] {
    if (!rule.workerGroup || !rule.maxSlotsPerPhase || rule.maxSlotsPerPhase < 1) {
      return [{
        id: rule.id,
        type: "loadLimit",
        message: "Load limit rule must specify a valid worker group and maximum slots per phase (≥1)"
      }];
    }

    const groupWorkers = workers.filter((w) => w.WorkerGroup === rule.workerGroup);
  
    if (!groupWorkers.length) {
      return [
        {
          id: rule.id,
          type: "loadLimit",
          message: `No workers found in group '${rule.workerGroup}'`,
        },
      ];
    }
  
    const overloadedWorkers = groupWorkers.filter((w) => {
      const slots = normalizeSlots(w.AvailableSlots);
      return slots.length > rule.maxSlotsPerPhase;
    });
  
    if (overloadedWorkers.length > 0) {
      const overloadedIds = overloadedWorkers.map(w => w.WorkerID || 'Unknown').slice(0, 3);
      const moreCount = overloadedWorkers.length - 3;
      
      return [
        {
          id: rule.id,
          type: "loadLimit",
          message: `${overloadedWorkers.length} worker(s) in group '${rule.workerGroup}' exceed the limit of ${rule.maxSlotsPerPhase} slots: ${overloadedIds.join(', ')}${moreCount > 0 ? ` and ${moreCount} more` : ''}`,
        },
      ];
    }
  
    return [];
  }
  
  // 🧠 Helper Functions
  function normalizePhases(phases: any): number[] {
    if (Array.isArray(phases)) return phases.map(Number).filter(n => !isNaN(n));
    
    if (typeof phases === "string") {
      try {
        // Handle range format like "1-3"
        const rangeMatch = phases.match(/^(\d+)-(\d+)$/);
        if (rangeMatch) {
          const start = parseInt(rangeMatch[1]);
          const end = parseInt(rangeMatch[2]);
          return Array.from({ length: end - start + 1 }, (_, i) => start + i);
        }

        // Handle JSON array format like "[1,2,3]"
        if (phases.startsWith("[")) {
          return JSON.parse(phases).map(Number).filter(n => !isNaN(n));
        }

        // Handle comma-separated format like "1,2,3"
        return phases
          .split(",")
          .map(s => parseInt(s.trim(), 10))
          .filter(n => !isNaN(n));
      } catch {
        return [];
      }
    }
    
    return [];
  }

  function normalizeSlots(slots: any): number[] {
    if (Array.isArray(slots)) return slots.map(Number).filter(n => !isNaN(n));
    
    if (typeof slots === "string") {
      try {
        return JSON.parse(slots).map(Number).filter(n => !isNaN(n));
      } catch {
        return [];
      }
    }
    
    return [];
  }