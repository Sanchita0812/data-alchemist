// src/components/RuleBuilder/RuleCard.tsx
"use client";

import React from "react";
import { Rule } from "@/types/rule";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RuleCardProps {
  rule: Rule;
  onDelete: () => void;
}

const RuleCard: React.FC<RuleCardProps> = ({ rule, onDelete }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="capitalize">{rule.type} Rule</CardTitle>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          Delete
        </Button>
      </CardHeader>

      <CardContent className="text-sm space-y-1">
        {rule.type === "coRun" && (
          <div>
            <strong>Tasks:</strong> {rule.tasks.join(", ")}
          </div>
        )}

        {rule.type === "slotRestriction" && (
          <>
            <div>
              <strong>Group Tag:</strong> {rule.groupTag}
            </div>
            <div>
              <strong>Min Common Slots:</strong> {rule.minCommonSlots}
            </div>
          </>
        )}

        {rule.type === "loadLimit" && (
          <>
            <div>
              <strong>Worker Group:</strong> {rule.workerGroup}
            </div>
            <div>
              <strong>Max Slots / Phase:</strong> {rule.maxSlotsPerPhase}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RuleCard;
