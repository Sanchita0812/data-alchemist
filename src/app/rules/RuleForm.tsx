"use client";

import React, { useState } from "react";
import { Rule, RuleType } from "@/types/rule";
import { v4 as uuidv4 } from "uuid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface RuleFormProps {
  onAddRule: (rule: Rule) => void;
  tasks: any[];
  clients: any[];
  workers: any[];
}

const RuleForm: React.FC<RuleFormProps> = ({ onAddRule, tasks, clients, workers }) => {
  const [ruleType, setRuleType] = useState<RuleType>("coRun");
  
  // Co-Run rule inputs
  const [taskInput, setTaskInput] = useState("");
  
  // Slot Restriction rule inputs
  const [groupTag, setGroupTag] = useState("");
  const [minCommonSlots, setMinCommonSlots] = useState<number>(1);
  
  // Load Limit rule inputs
  const [workerGroup, setWorkerGroup] = useState("");
  const [maxSlotsPerPhase, setMaxSlotsPerPhase] = useState<number>(1);

  const handleAdd = () => {
    let newRule: Rule;

    switch (ruleType) {
      case "coRun":
        if (!taskInput.trim()) {
          alert("Please enter task IDs for the Co-Run rule");
          return;
        }
        const taskIds = taskInput
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id);
        
        if (taskIds.length < 2) {
          alert("Co-Run rule requires at least 2 task IDs");
          return;
        }
        
        newRule = { id: uuidv4(), type: "coRun", tasks: taskIds };
        break;

      case "slotRestriction":
        if (!groupTag.trim()) {
          alert("Please enter a group tag for the Slot Restriction rule");
          return;
        }
        newRule = {
          id: uuidv4(),
          type: "slotRestriction",
          groupTag: groupTag.trim(),
          minCommonSlots,
        };
        break;

      case "loadLimit":
        if (!workerGroup.trim()) {
          alert("Please enter a worker group for the Load Limit rule");
          return;
        }
        newRule = {
          id: uuidv4(),
          type: "loadLimit",
          workerGroup: workerGroup.trim(),
          maxSlotsPerPhase,
        };
        break;
    }

    onAddRule(newRule);
    resetFields();
  };

  const resetFields = () => {
    setTaskInput("");
    setGroupTag("");
    setMinCommonSlots(1);
    setWorkerGroup("");
    setMaxSlotsPerPhase(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Rule</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rule Type Selector */}
        <div className="space-y-2">
          <Label>Rule Type</Label>
          <Select value={ruleType} onValueChange={(value) => setRuleType(value as RuleType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="coRun">Co-Run</SelectItem>
              <SelectItem value="slotRestriction">Slot Restriction</SelectItem>
              <SelectItem value="loadLimit">Load Limit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dynamic Inputs */}
        {ruleType === "coRun" && (
          <div className="space-y-2">
            <Label>Task IDs (comma-separated)</Label>
            <Input
              placeholder="Enter TaskIDs separated by commas (e.g., T1, T2, T3)"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
            />
            {tasks.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Available tasks: {tasks.map(t => t.TaskID).join(", ")}
              </div>
            )}
          </div>
        )}

        {ruleType === "slotRestriction" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Client Group Tag</Label>
              <Input
                placeholder="Enter group tag"
                value={groupTag}
                onChange={(e) => setGroupTag(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Minimum Common Slots</Label>
              <Input
                type="number"
                min={1}
                value={minCommonSlots}
                onChange={(e) => setMinCommonSlots(Number(e.target.value))}
              />
            </div>
          </div>
        )}

        {ruleType === "loadLimit" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Worker Group</Label>
              <Input
                placeholder="Enter worker group"
                value={workerGroup}
                onChange={(e) => setWorkerGroup(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Slots Per Phase</Label>
              <Input
                type="number"
                min={1}
                value={maxSlotsPerPhase}
                onChange={(e) => setMaxSlotsPerPhase(Number(e.target.value))}
              />
            </div>
          </div>
        )}

        {/* Add Rule Button */}
        <Button onClick={handleAdd} className="w-full">
          ➕ Add Rule
        </Button>
      </CardContent>
    </Card>
  );
};

export default RuleForm;