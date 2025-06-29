"use client";

import React from "react";
import { Rule } from "@/types/rule";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RuleCardProps {
  rule: Rule;
  onDelete: () => void;
  onUpdate: (updated: Rule) => void; 
}

const RuleCard: React.FC<RuleCardProps> = ({ rule, onDelete, onUpdate }) => {
  const handleChange = (field: string, value: any) => {
    const updated = { ...rule, [field]: value };
    onUpdate(updated);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="capitalize">{rule.type} Rule</CardTitle>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          Delete
        </Button>
      </CardHeader>

      <CardContent className="text-sm space-y-2">
        {rule.type === "coRun" && (
          <div>
            <label className="block font-medium mb-1">Task IDs (comma-separated)</label>
            <Input
              value={rule.tasks.join(", ")}
              onChange={(e) =>
                handleChange(
                  "tasks",
                  e.target.value.split(",").map((id) => id.trim()).filter(Boolean)
                )
              }
              placeholder="e.g. T1, T2, T3"
            />
          </div>
        )}

        {rule.type === "slotRestriction" && (
          <>
            <div>
              <label className="block font-medium mb-1">Group Tag</label>
              <Input
                value={rule.groupTag}
                onChange={(e) => handleChange("groupTag", e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Min Common Slots</label>
              <Input
                type="number"
                value={rule.minCommonSlots}
                onChange={(e) => handleChange("minCommonSlots", Number(e.target.value))}
              />
            </div>
          </>
        )}

        {rule.type === "loadLimit" && (
          <>
            <div>
              <label className="block font-medium mb-1">Worker Group</label>
              <Input
                value={rule.workerGroup}
                onChange={(e) => handleChange("workerGroup", e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Max Slots per Phase</label>
              <Input
                type="number"
                value={rule.maxSlotsPerPhase}
                onChange={(e) => handleChange("maxSlotsPerPhase", Number(e.target.value))}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RuleCard;
