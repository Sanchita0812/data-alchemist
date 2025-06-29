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
import { exportRulesToJSON } from "@/lib/exportToExcel";
import Link from "next/link";
import { ArrowLeft, Download, CheckCircle } from "lucide-react";

export default function RulePage() {
  const { parsedData } = useParsedDataStore(); 
  const { rules, setRules: setGlobalRules } = useRuleStore(); 

  const [localRules, setLocalRules] = useState<Rule[]>([]);
  const [violations, setViolations] = useState<RuleViolation[]>([]);
  const [isExporting, setIsExporting] = useState(false);

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

  // Export rules to JSON
  const handleExportRules = async () => {
    if (localRules.length === 0) {
      alert("No rules to export. Please create some rules first.");
      return;
    }

    setIsExporting(true);
    try {
      exportRulesToJSON(localRules);
      setTimeout(() => {
        alert("✅ Rules exported successfully!");
      }, 500);
    } catch (error) {
      console.error("Export error:", error);
      alert("❌ Failed to export rules. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Auto validate on change
  useEffect(() => {
    if (localRules.length && parsedData && (parsedData.clients.length || parsedData.workers.length || parsedData.tasks.length)) {
      const result = validateRules(localRules, parsedData);
      setViolations(result);
    }
  }, [localRules, parsedData]);

  const hasData = parsedData && (parsedData.clients.length > 0 || parsedData.workers.length > 0 || parsedData.tasks.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header with Back Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <Button asChild variant="outline" size="sm" className="flex items-center gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Data Upload
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ⚙️ Rule Builder
            </h1>
            <p className="text-muted-foreground">
              Create intelligent scheduling rules with AI assistance
            </p>
          </div>
        </div>

        {/* Data Status Check */}
        {!hasData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-yellow-400 rounded-full"></div>
              <p className="text-yellow-800 font-medium">No data available</p>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              Please upload and validate your data first before creating rules.{" "}
              <Link href="/" className="underline hover:no-underline">
                Go back to upload data
              </Link>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Rule Creation */}
          <div className="space-y-6">
            {/* AI Recommendations */}
            {hasData && (
              <RuleRecommendations
                data={parsedData}
                onAddRule={handleAddRule}
                existingRules={localRules}
              />
            )}

            {/* Manual Rule Creation */}
            <RuleForm
              onAddRule={handleAddRule}
              tasks={parsedData?.tasks || []}
              clients={parsedData?.clients || []}
              workers={parsedData?.workers || []}
            />
          </div>

          {/* Right Column - Rule Management */}
          <div className="space-y-6">
            {/* Rule Actions */}
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleValidateRules} 
                disabled={!localRules.length || !hasData}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Validate Rules
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExportRules}
                disabled={!localRules.length || isExporting}
                className="flex items-center gap-2"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export Rules
                  </>
                )}
              </Button>
              <Button asChild variant="outline">
                <Link href="/rules/apply">
                  ▶️ Apply Rules
                </Link>
              </Button>
            </div>

            <Separator />

            {/* List of rules */}
            <RuleList
              rules={localRules}
              onDelete={handleDeleteRule}
              onUpdate={handleUpdateRule}
            />
          </div>
        </div>

        {/* Violations */}
        {violations.length > 0 && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-700 mb-4 flex items-center gap-2">
              ⚠️ Rule Violations ({violations.length})
            </h3>
            <div className="space-y-3">
              {violations.map((v, idx) => (
                <div key={`${v.id}-${idx}`} className="bg-white p-3 rounded border border-yellow-200">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                      {v.type}
                    </span>
                  </div>
                  <p className="text-sm text-yellow-800">{v.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}