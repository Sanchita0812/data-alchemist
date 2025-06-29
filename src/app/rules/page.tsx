"use client";

import React, { useState } from "react";
import { Rule } from "@/types/rule";
import RuleForm from "./RuleForm";
import RuleList from "./RuleList";

export default function RulePage() {
  const [rules, setRules] = useState<Rule[]>([]);

  const handleAddRule = (newRule: Rule) => {
    setRules((prev) => [...prev, newRule]);
  };

  const handleDeleteRule = (id: string) => {
    setRules((prev) => prev.filter((rule) => rule.id !== id));
  };

  return (
    <div className="min-h-screen p-6 bg-muted/50">
      <h1 className="text-2xl font-semibold mb-4">⚙️ Rule Builder</h1>
      <RuleForm onAddRule={handleAddRule} />
      <RuleList rules={rules} onDelete={handleDeleteRule} />
    </div>
  );
}
