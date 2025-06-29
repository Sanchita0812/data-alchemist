"use client";

import React, { useState } from "react";
import { applyRules, ApplyRuleResult } from "@/lib/applyRules";
import { exportEntitiesToExcel, exportRuleResultsToExcel } from "@/lib/exportToExcel";
import { Button } from "@/components/ui/button";
import RuleResultCard from "@/components/Rule/RuleResultCard";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ArrowLeft, Download, Play } from "lucide-react";

import { useParsedDataStore } from "@/store/parsedDataStore";
import { useRuleStore } from "@/store/ruleStore";

export default function RuleApplyPage() {
  const { parsedData } = useParsedDataStore();   
  const { rules } = useRuleStore();              

  const [results, setResults] = useState<ApplyRuleResult[]>([]);
  const [ran, setRan] = useState(false);
  const [isExportingData, setIsExportingData] = useState(false);
  const [isExportingResults, setIsExportingResults] = useState(false);

  const handleRunRules = () => {
    if (!parsedData || rules.length === 0) return;

    const outcome = applyRules(parsedData, rules);
    setResults(outcome);
    setRan(true);
  };

  const handleExportDataset = async () => {
    if (parsedData) {
      setIsExportingData(true);
      try {
        exportEntitiesToExcel(parsedData);
        setTimeout(() => {
          alert("✅ Dataset exported successfully!");
        }, 500);
      } catch (error) {
        console.error("Export error:", error);
        alert("❌ Failed to export dataset. Please try again.");
      } finally {
        setIsExportingData(false);
      }
    }
  };

  const handleExportResults = async () => {
    if (results.length > 0) {
      setIsExportingResults(true);
      try {
        exportRuleResultsToExcel(results);
        setTimeout(() => {
          alert("✅ Rule results exported successfully!");
        }, 500);
      } catch (error) {
        console.error("Export error:", error);
        alert("❌ Failed to export results. Please try again.");
      } finally {
        setIsExportingResults(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header with Back Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <Button asChild variant="outline" size="sm" className="flex items-center gap-2">
            <Link href="/rules">
              <ArrowLeft className="h-4 w-4" />
              Back to Rule Builder
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              🧠 Apply Rules
            </h1>
            <p className="text-muted-foreground">
              Review how your defined rules behave on the current dataset
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Button 
            onClick={handleRunRules} 
            disabled={!rules.length}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Run All Rules
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportDataset}
            disabled={isExportingData}
            className="flex items-center gap-2"
          >
            {isExportingData ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export Cleaned Dataset
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportResults} 
            disabled={!results.length || isExportingResults}
            className="flex items-center gap-2"
          >
            {isExportingResults ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export Rule Results
              </>
            )}
          </Button>
        </div>

        <Separator className="my-6" />

        {/* Results */}
        {ran && results.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground italic">No rules matched or no rules defined.</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="grid gap-4">
            {results.map((result, idx) => (
              <RuleResultCard key={idx} result={result} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}