"use client";

import React, { useState, useEffect } from "react";
import { Rule } from "@/types/rule";
import RuleForm from "./RuleForm";
import RuleList from "./RuleList";
import { validateRules, RuleViolation } from "@/lib/validateRules";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useParsedDataStore } from "@/store/parsedDataStore";
import { useRuleStore } from "@/store/ruleStore";

export default function RulePage() {
  const { parsedData } = useParsedDataStore(); 
  const { rules, setRules: setGlobalRules } = useRuleStore(); 

  const [localRules, setLocalRules] = useState<Rule[]>([]);
  const [violations, setViolations] = useState<RuleViolation[]>([]);

  // Sync with global rules on mount
  useEffect(() => {
    setLocalRules(rules);
  }, [rules]);

  // Add rule
  const handleAddRule = (newRule: Rule) => {
    const updated = [...localRules, newRule];
    setLocalRules(updated);
    setGlobalRules(updated);
  };

  // Update rule (from RuleCard inline edits)
  const handleUpdateRule = (updatedRule: Rule) => {
    const updated = localRules.map((r) => (r.id === updatedRule.id ? updatedRule : r));
    setLocalRules(updated);
    setGlobalRules(updated);
  };

  // Delete rule
  const handleDeleteRule = (id: string) => {
    const updated = localRules.filter((r) => r.id !== id);
    setLocalRules(updated);
    setGlobalRules(updated);
  };

  // Manual validation
  const handleValidateRules = () => {
    if (!parsedData || (!parsedData.clients.length && !parsedData.workers.length && !parsedData.tasks.length)) {
      alert("Please upload and parse data first before validating rules.");
      return;
    }
    
    const result = validateRules(localRules, parsedData);
    setViolations(result);
  };

  // Auto validate on change
  useEffect(() => {
    if (localRules.length && parsedData && (parsedData.clients.length || parsedData.workers.length || parsedData.tasks.length)) {
      const result = validateRules(localRules, parsedData);
      setViolations(result);
    }
  }, [localRules, parsedData]);

  return (
    <div className="min-h-screen p-6 bg-muted/50">
      <h1 className="text-2xl font-semibold mb-4">⚙️ Rule Builder</h1>

      {/* Rule Input */}
      <RuleForm
        onAddRule={handleAddRule}
        tasks={parsedData?.tasks || []}
        clients={parsedData?.clients || []}
        workers={parsedData?.workers || []}
      />

      <Separator className="my-4" />

      {/* List of rules */}
      <RuleList
        rules={localRules}
        onDelete={handleDeleteRule}
        onUpdate={handleUpdateRule}
      />

      <div className="mt-6 flex justify-end">
        <Button onClick={handleValidateRules} disabled={!localRules.length}>
          ✅ Validate Rules
        </Button>
      </div>

      {/* Violations */}
      {violations.length > 0 && (
        <div className="bg-yellow-100 border border-yellow-400 p-4 rounded-md my-6">
          <h3 className="text-lg font-semibold text-yellow-700 mb-2">
            ⚠️ Rule Violations ({violations.length})
          </h3>
          <ul className="list-disc pl-5 text-sm text-yellow-800 space-y-1">
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