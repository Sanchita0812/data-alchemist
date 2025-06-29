// src/app/rules/page.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import RuleForm from "@/rules/RuleForm";
import RuleList from "@/rules/RuleList";

export default function RulesPage() {
  const [rules, setRules] = useState<any[]>([]);

  const addRule = (rule: any) => {
    setRules((prev) => [...prev, rule]);
  };

  return (
    <div className="min-h-screen p-6 bg-muted/50">
      <h1 className="text-2xl font-semibold mb-4">🛠️ Rule Configuration</h1>
      <p className="text-muted-foreground mb-6">
        Define co-run, load-limit, slot-restriction, and other business rules here.
      </p>

      <RuleForm onAddRule={addRule} />

      <Separator className="my-6" />

      <RuleList rules={rules} />
    </div>
  );
}
