"use client";

import React, { useState } from "react";
import { Rule, RuleType, CoRunRule, SlotRestrictionRule, LoadLimitRule } from "@/types/rule";
import { v4 as uuidv4 } from "uuid";
import { Input } from "@/components/ui/input";

export interface RuleFormProps {
  onAddRule: (rule: Rule) => void;
  tasks: any[];
  clients: any[];
  workers: any[];
}

const RuleForm: React.FC<RuleFormProps> = ({ onAddRule, tasks }) => {
  const [ruleType, setRuleType] = useState<RuleType>("coRun");
  const [taskInput, setTaskInput] = useState("");

  const handleAdd = () => {
    let newRule: Rule;

    switch (ruleType) {
      case "coRun":
        const taskIds = taskInput
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id);
        newRule = { id: uuidv4(), type: "coRun", tasks: taskIds };
        break;

      case "slotRestriction":
        newRule = {
          id: uuidv4(),
          type: "slotRestriction",
          groupTag: "",
          minCommonSlots: 0,
        };
        break;

      case "loadLimit":
        newRule = {
          id: uuidv4(),
          type: "loadLimit",
          workerGroup: "",
          maxSlotsPerPhase: 0,
        };
        break;
    }

    onAddRule(newRule);
    setTaskInput(""); 
  };

  return (
    <div className="flex flex-col gap-4 mb-4">
      <div className="flex items-center gap-4">
        <select
          className="border p-2 rounded"
          value={ruleType}
          onChange={(e) => setRuleType(e.target.value as RuleType)}
        >
          <option value="coRun">Co-Run</option>
          <option value="slotRestriction">Slot Restriction</option>
          <option value="loadLimit">Load Limit</option>
        </select>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={handleAdd}
        >
          ➕ Add Rule
        </button>
      </div>

      {/* Co-Run input */}
      {ruleType === "coRun" && (
        <Input
          placeholder="Enter TaskIDs separated by commas"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
        />
      )}
    </div>
  );
};

export default RuleForm;
