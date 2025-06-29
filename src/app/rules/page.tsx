"use client";

import React, { useState, useEffect } from "react";
import { Rule } from "@/types/rule";
import RuleForm from "./RuleForm";
import RuleList from "./RuleList";
import { validateRules, RuleViolation } from "@/lib/validateRules";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDataStore } from "@/store/dataStore";

export default function RulePage() {
  const { parsedData } = useDataStore(); // 🔁 Get actual uploaded data
  const [rules, setRules] = useState<Rule[]>([]);
  const [violations, setViolations] = useState<RuleViolation[]>([]);

  const handleAddRule = (newRule: Rule) => {
    setRules((prev) => [...prev, newRule]);
  };

  const handleDeleteRule = (id: string) => {
    setRules((prev) => prev.filter((rule) => rule.id !== id));
  };

  const handleValidateRules = () => {
    const result = validateRules(rules, parsedData); // ✅ use real data
    setViolations(result);
  };

  useEffect(() => {
    // Optional: auto-validate on data load or rule change
    if (rules.length) {
      handleValidateRules();
    }
  }, [rules, parsedData]);

  return (
    <div className="min-h-screen p-6 bg-muted/50">
      <h1 className="text-2xl font-semibold mb-4">⚙️ Rule Builder</h1>

      <RuleForm onAddRule={handleAddRule} />
      <Separator className="my-4" />

      <RuleList rules={rules} onDelete={handleDeleteRule} />

      <div className="mt-6 flex gap-3 justify-end">
        <Button variant="default" onClick={handleValidateRules} disabled={!rules.length}>
          Validate Rules
        </Button>
      </div>

      {/* Violations Display */}
      {violations.length > 0 && (
        <div className="bg-yellow-100 border border-yellow-400 p-4 rounded-md my-6">
          <h3 className="text-lg font-semibold text-yellow-700 mb-2">
            ⚠️ Rule Violations ({violations.length})
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-yellow-800">
            {violations.map((v, idx) => (
              <li key={`${v.id}-${idx}`}>
                <strong>{v.type}</strong>: {v.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
