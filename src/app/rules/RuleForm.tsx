// src/app/rules/RuleForm.tsx
"use client";

import React, { useState } from "react";
import { Rule, RuleType } from "@/types/rule";
import { v4 as uuidv4 } from "uuid";

export interface RuleFormProps {
  onAddRule: (rule: Rule) => void;
}

const RuleForm: React.FC<RuleFormProps> = ({ onAddRule }) => {
  const [ruleType, setRuleType] = useState<RuleType>("coRun");

  const handleAdd = () => {
    let newRule: Rule;

    switch (ruleType) {
      case "coRun":
        newRule = { id: uuidv4(), type: "coRun", tasks: [] };
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
  };

  return (
    <div className="flex items-center gap-4 mb-4">
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
  );
};

export default RuleForm;
