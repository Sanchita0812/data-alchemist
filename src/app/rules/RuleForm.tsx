"use client";

import React, { useState } from "react";
import { Rule, RuleType } from "@/types/rule";
import { v4 as uuidv4 } from "uuid";

export interface RuleFormProps {
  onAddRule: (rule: Rule) => void;
  tasks: any[];
  clients: any[];
  workers: any[];
}

const RuleForm: React.FC<RuleFormProps> = ({ onAddRule, tasks, clients, workers }) => {
  const [ruleType, setRuleType] = useState<RuleType>("coRun");

  // Inputs for each rule type
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [groupTag, setGroupTag] = useState("");
  const [minCommonSlots, setMinCommonSlots] = useState<number>(1);
  const [workerGroup, setWorkerGroup] = useState("");
  const [maxSlotsPerPhase, setMaxSlotsPerPhase] = useState<number>(1);

  const handleAdd = () => {
    let newRule: Rule;

    switch (ruleType) {
      case "coRun":
        newRule = { id: uuidv4(), type: "coRun", tasks: selectedTasks };
        break;
      case "slotRestriction":
        newRule = {
          id: uuidv4(),
          type: "slotRestriction",
          groupTag,
          minCommonSlots,
        };
        break;
      case "loadLimit":
        newRule = {
          id: uuidv4(),
          type: "loadLimit",
          workerGroup,
          maxSlotsPerPhase,
        };
        break;
    }

    onAddRule(newRule);
    resetFields(); // optional: reset form after adding
  };

  const resetFields = () => {
    setSelectedTasks([]);
    setGroupTag("");
    setMinCommonSlots(1);
    setWorkerGroup("");
    setMaxSlotsPerPhase(1);
  };

  return (
    <div className="border p-4 rounded-md bg-white shadow-sm space-y-4">
      {/* Rule Type Selector */}
      <div className="flex gap-4 items-center">
        <label className="font-medium">Rule Type:</label>
        <select
          className="border p-2 rounded"
          value={ruleType}
          onChange={(e) => setRuleType(e.target.value as RuleType)}
        >
          <option value="coRun">Co-Run</option>
          <option value="slotRestriction">Slot Restriction</option>
          <option value="loadLimit">Load Limit</option>
        </select>
      </div>

      {/* Dynamic Inputs */}
      {ruleType === "coRun" && (
        <div>
          <label className="font-medium block mb-1">Select Task IDs:</label>
          <select
            multiple
            className="border p-2 w-full rounded h-32"
            value={selectedTasks}
            onChange={(e) =>
              setSelectedTasks(
                Array.from(e.target.selectedOptions, (opt) => opt.value)
              )
            }
          >
            {tasks.map((t: any) => (
              <option key={t.TaskID} value={t.TaskID}>
                {t.TaskID}
              </option>
            ))}
          </select>
        </div>
      )}

      {ruleType === "slotRestriction" && (
        <div className="space-y-2">
          <div>
            <label className="block mb-1">Client Group Tag:</label>
            <input
              type="text"
              className="border p-2 rounded w-full"
              value={groupTag}
              onChange={(e) => setGroupTag(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1">Minimum Common Slots:</label>
            <input
              type="number"
              className="border p-2 rounded w-full"
              value={minCommonSlots}
              onChange={(e) => setMinCommonSlots(Number(e.target.value))}
              min={1}
            />
          </div>
        </div>
      )}

      {ruleType === "loadLimit" && (
        <div className="space-y-2">
          <div>
            <label className="block mb-1">Worker Group:</label>
            <input
              type="text"
              className="border p-2 rounded w-full"
              value={workerGroup}
              onChange={(e) => setWorkerGroup(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1">Max Slots Per Phase:</label>
            <input
              type="number"
              className="border p-2 rounded w-full"
              value={maxSlotsPerPhase}
              onChange={(e) => setMaxSlotsPerPhase(Number(e.target.value))}
              min={1}
            />
          </div>
        </div>
      )}

      {/* Add Rule Button */}
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
