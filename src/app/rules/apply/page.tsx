"use client";

import React, { useState } from "react";
import { applyRules, ApplyRuleResult } from "@/lib/applyRules";
import { exportEntitiesToExcel, exportRuleResultsToExcel } from "@/lib/exportToExcel";
import { Button } from "@/components/ui/button";
import RuleResultCard from "@/components/Rule/RuleResultCard";
import { Separator } from "@/components/ui/separator";

import { useParsedDataStore } from "@/store/parsedDataStore";
import { useRuleStore } from "@/store/ruleStore";

export default function RuleApplyPage() {
  const { parsedData } = useParsedDataStore();   
  const { rules } = useRuleStore();              

  const [results, setResults] = useState<ApplyRuleResult[]>([]);
  const [ran, setRan] = useState(false);

  const handleRunRules = () => {
    if (!parsedData || rules.length === 0) return;

    const outcome = applyRules(parsedData, rules);
    setResults(outcome);
    setRan(true);
  };

  const handleExportDataset = () => {
    if (parsedData) {
      exportEntitiesToExcel(parsedData);
    }
  };

  const handleExportResults = () => {
    if (results.length > 0) {
      exportRuleResultsToExcel(results);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-muted/50">
      <h1 className="text-2xl font-semibold mb-4">🧠 Apply Rules</h1>
      <p className="text-muted-foreground mb-6">
        Review how your defined rules behave on the current dataset.
      </p>

      <div className="flex flex-wrap gap-4 mb-6">
        <Button onClick={handleRunRules} disabled={!rules.length}>
          ▶️ Run All Rules
        </Button>
        <Button variant="outline" onClick={handleExportDataset}>
          📤 Export Cleaned Dataset
        </Button>
        <Button variant="outline" onClick={handleExportResults} disabled={!results.length}>
          📋 Export Rule Results
        </Button>
      </div>

      <Separator className="my-6" />

      {ran && results.length === 0 && (
        <p className="text-gray-500 italic">No rules matched or no rules defined.</p>
      )}

      {results.length > 0 && (
        <div className="grid gap-4">
          {results.map((result, idx) => (
            <RuleResultCard key={idx} result={result} />
          ))}
        </div>
      )}
    </div>
  );
}