"use client";

import React from "react";
import { ApplyRuleResult } from "@/lib/applyRules";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RuleResultCardProps {
  result: ApplyRuleResult;
}

const RuleResultCard: React.FC<RuleResultCardProps> = ({ result }) => {
  const { rule, passed, reason } = result;

  return (
    <Card className={passed ? "border-green-500" : "border-red-500"}>
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">
            🛠 {rule.type} Rule
          </h2>
          <Badge variant={passed ? "success" : "destructive"}>
            {passed ? "Passed ✅" : "Failed ❌"}
          </Badge>
        </div>

        <div className="text-sm text-muted-foreground">
          {rule.type === "coRun" && `Tasks to co-run: ${rule.tasks.join(", ")}`}
          {rule.type === "slotRestriction" &&
            `GroupTag: ${rule.groupTag}, Min Common Slots: ${rule.minCommonSlots}`}
          {rule.type === "loadLimit" &&
            `Worker Group: ${rule.workerGroup}, Max Slots/Phase: ${rule.maxSlotsPerPhase}`}
        </div>

        {!passed && reason && (
          <p className="text-sm text-red-700 bg-red-100 p-2 rounded-md">
            ⚠️ {reason}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default RuleResultCard;
