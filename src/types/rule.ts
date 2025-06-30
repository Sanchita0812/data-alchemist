
export type RuleType = "coRun" | "slotRestriction" | "loadLimit";

export interface BaseRule {
  id: string;
  type: RuleType;
}

export interface CoRunRule extends BaseRule {
  type: "coRun";
  tasks: string[];
}

export interface SlotRestrictionRule extends BaseRule {
  type: "slotRestriction";
  groupTag: string;
  minCommonSlots: number;
}

export interface LoadLimitRule extends BaseRule {
  type: "loadLimit";
  workerGroup: string;
  maxSlotsPerPhase: number;
}

export type Rule = CoRunRule | SlotRestrictionRule | LoadLimitRule;