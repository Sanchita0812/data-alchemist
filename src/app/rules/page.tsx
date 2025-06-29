"use client";

import React, { useState, useEffect } from "react";
import { Rule } from "@/types/rule";
import RuleForm from "./RuleForm";
import RuleList from "./RuleList";
import RuleRecommendations from "@/components/Rule/RuleRecommendations";
import { validateRules, RuleViolation } from "@/lib/validateRules";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useParsedDataStore } from "@/store/parsedDataStore";
import { useRuleStore } from "@/store/ruleStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

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
    } else {
      setViolations([]);
    }
  }, [localRules, parsedData]);

  const hasData = parsedData && (parsedData.clients.length > 0 || parsedData.workers.length > 0 || parsedData.tasks.length > 0);

  return (
    <div className="min-h-screen p-6 bg-muted/50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">⚙️ Rule Builder</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage business rules for your scheduling system
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{localRules.length} Rules</Badge>
              {violations.length > 0 && (
                <Badge variant="destructive">{violations.length} Issues</Badge>
              )}
            </div>
            <Button onClick={handleValidateRules} disabled={!localRules.length || !hasData}>
              ✅ Validate Rules
            </Button>
          </div>
        </div>

        {/* Data Status */}
        {!hasData && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="flex items-center gap-3 p-4">
              <Info className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">No Data Available</p>
                <p className="text-sm text-yellow-700">
                  Upload data on the main page to see AI recommendations and validate rules.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Rule Creation & Recommendations */}
          <div className="space-y-6">
            {/* AI Recommendations */}
            {hasData && (
              <RuleRecommendations
                data={parsedData}
                onAddRule={handleAddRule}
                existingRules={localRules}
              />
            )}

            {/* Rule Form */}
            <RuleForm
              onAddRule={handleAddRule}
              tasks={parsedData?.tasks || []}
              clients={parsedData?.clients || []}
              workers={parsedData?.workers || []}
            />
          </div>

          {/* Right Column - Rule List & Validation */}
          <div className="space-y-6">
            {/* Validation Results */}
            {violations.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-5 w-5" />
                    Rule Violations ({violations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {violations.map((violation, idx) => (
                    <div key={`${violation.id}-${idx}`} className="flex items-start gap-2 p-2 bg-white rounded border">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-red-800 capitalize">{violation.type} Rule</p>
                        <p className="text-sm text-red-700">{violation.message}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Success Message */}
            {localRules.length > 0 && violations.length === 0 && hasData && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="flex items-center gap-3 p-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">All Rules Valid</p>
                    <p className="text-sm text-green-700">
                      {localRules.length} rule{localRules.length !== 1 ? 's' : ''} validated successfully
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rule List */}
            <Card>
              <CardHeader>
                <CardTitle>Current Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <RuleList
                  rules={localRules}
                  onDelete={handleDeleteRule}
                  onUpdate={handleUpdateRule}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}