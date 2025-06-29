"use client";

import React, { useState } from "react";
import { Rule, RuleType } from "@/types/rule";
import { v4 as uuidv4 } from "uuid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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

  // Get unique values for suggestions
  const uniqueGroupTags = [...new Set(clients.map(c => c.GroupTag).filter(Boolean))];
  const uniqueWorkerGroups = [...new Set(workers.map(w => w.WorkerGroup).filter(Boolean))];

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

        // Validate that all task IDs exist
        const invalidTasks = taskIds.filter(id => !tasks.some(t => t.TaskID === id));
        if (invalidTasks.length > 0) {
          alert(`Invalid task IDs: ${invalidTasks.join(', ')}`);
          return;
        }
        
        newRule = { id: uuidv4(), type: "coRun", tasks: taskIds };
        break;

      case "slotRestriction":
        if (!groupTag.trim()) {
          alert("Please enter a group tag for the Slot Restriction rule");
          return;
        }
        if (minCommonSlots < 1) {
          alert("Minimum common slots must be at least 1");
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
        if (maxSlotsPerPhase < 1) {
          alert("Max slots per phase must be at least 1");
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
              <SelectItem value="coRun">
                <div className="flex flex-col items-start">
                  <span>Co-Run</span>
                  <span className="text-xs text-muted-foreground">Tasks that must run together</span>
                </div>
              </SelectItem>
              <SelectItem value="slotRestriction">
                <div className="flex flex-col items-start">
                  <span>Slot Restriction</span>
                  <span className="text-xs text-muted-foreground">Minimum common slots for client groups</span>
                </div>
              </SelectItem>
              <SelectItem value="loadLimit">
                <div className="flex flex-col items-start">
                  <span>Load Limit</span>
                  <span className="text-xs text-muted-foreground">Maximum workload per worker group</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dynamic Inputs */}
        {ruleType === "coRun" && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Task IDs (comma-separated)</Label>
              <Input
                placeholder="Enter TaskIDs separated by commas (e.g., T1, T2, T3)"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
              />
            </div>
            {tasks.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Available Tasks:</Label>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {tasks.slice(0, 20).map(task => (
                    <Badge 
                      key={task.TaskID} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => {
                        const currentTasks = taskInput.split(',').map(t => t.trim()).filter(Boolean);
                        if (!currentTasks.includes(task.TaskID)) {
                          setTaskInput(prev => prev ? `${prev}, ${task.TaskID}` : task.TaskID);
                        }
                      }}
                    >
                      {task.TaskID}
                    </Badge>
                  ))}
                  {tasks.length > 20 && (
                    <Badge variant="secondary">+{tasks.length - 20} more</Badge>
                  )}
                </div>
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
                list="group-tags"
              />
              <datalist id="group-tags">
                {uniqueGroupTags.map(tag => (
                  <option key={tag} value={tag} />
                ))}
              </datalist>
              {uniqueGroupTags.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Available Groups:</Label>
                  <div className="flex flex-wrap gap-1">
                    {uniqueGroupTags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant="outline"
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => setGroupTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Minimum Common Slots</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={minCommonSlots}
                onChange={(e) => setMinCommonSlots(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Minimum number of time slots that all clients in this group must have in common
              </p>
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
                list="worker-groups"
              />
              <datalist id="worker-groups">
                {uniqueWorkerGroups.map(group => (
                  <option key={group} value={group} />
                ))}
              </datalist>
              {uniqueWorkerGroups.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Available Groups:</Label>
                  <div className="flex flex-wrap gap-1">
                    {uniqueWorkerGroups.map(group => (
                      <Badge 
                        key={group} 
                        variant="outline"
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => setWorkerGroup(group)}
                      >
                        {group}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Max Slots Per Phase</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={maxSlotsPerPhase}
                onChange={(e) => setMaxSlotsPerPhase(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of time slots any worker in this group can be assigned per phase
              </p>
            </div>
          </div>
        )}

        {/* Add Rule Button */}
        <Button onClick={handleAdd} className="w-full">
          ➕ Add {ruleType === "coRun" ? "Co-Run" : ruleType === "slotRestriction" ? "Slot Restriction" : "Load Limit"} Rule
        </Button>
      </CardContent>
    </Card>
  );
};

export default RuleForm;