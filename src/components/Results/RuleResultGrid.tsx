

"use client";

import React from "react";
import { ApplyRuleResult } from "@/lib/applyRules";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface RuleResultGridProps {
  results: ApplyRuleResult[];
}

const RuleResultGrid: React.FC<RuleResultGridProps> = ({ results }) => {
  return (
    <div className="grid gap-6">
      {results.map((result, idx) => {
        const { rule, passed, reason } = result;

        return (
          <Card key={rule.id} className="border shadow-md">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold capitalize">
                  {rule.type} Rule
                </h3>
                <Badge variant={passed ? "default" : "destructive"}>
                  {passed ? "✅ Passed" : "❌ Failed"}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                {rule.type === "coRun" &&
                  `Tasks: ${(rule as any).tasks.join(", ")}`}
                {rule.type === "slotRestriction" &&
                  `Group: ${(rule as any).groupTag}, Required Common Slots: ${(rule as any).minCommonSlots}`}
                {rule.type === "loadLimit" &&
                  `Group: ${(rule as any).workerGroup}, Max Load/Phase: ${(rule as any).maxSlotsPerPhase}`}
              </p>

              {!passed && reason && (
                <div className="text-sm text-red-600">⚠️ {reason}</div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default RuleResultGrid;
