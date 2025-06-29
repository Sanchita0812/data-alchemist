// src/app/rules/RuleForm.tsx
"use client";

import React, { useState } from "react";
import { Rule, RuleType } from "@/types/rule";
import { v4 as uuidv4 } from "uuid";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface RuleFormProps {
  onAdd: (rule: Rule) => void;
}

export default function RuleForm({ onAdd }: RuleFormProps) {
  const [type, setType] = useState<RuleType>("coRun");
  const [form, setForm] = useState<any>({});

  const handleSubmit = () => {
    const rule: Rule = { id: uuidv4(), type, ...form };
    onAdd(rule);
    setForm({});
  };

  return (
    <div className="space-y-4 p-4 border rounded-md bg-white shadow">
      <div>
        <label className="font-semibold">Rule Type</label>
        <Select value={type} onValueChange={(v) => setType(v as RuleType)}>
          <SelectTrigger>
            <SelectValue placeholder="Select rule type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="coRun">Co-Run</SelectItem>
            <SelectItem value="slotRestriction">Slot Restriction</SelectItem>
            <SelectItem value="loadLimit">Load Limit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {type === "coRun" && (
        <Input
          placeholder="Comma-separated Task IDs (e.g. T1,T2)"
          value={form.tasks || ""}
          onChange={(e) => setForm({ tasks: e.target.value.split(",").map(t => t.trim()) })}
        />
      )}

      {type === "slotRestriction" && (
        <>
          <Input
            placeholder="GroupTag"
            value={form.groupTag || ""}
            onChange={(e) => setForm({ ...form, groupTag: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Minimum Common Slots"
            value={form.minCommonSlots || ""}
            onChange={(e) => setForm({ ...form, minCommonSlots: Number(e.target.value) })}
          />
        </>
      )}

      {type === "loadLimit" && (
        <>
          <Input
            placeholder="Worker Group"
            value={form.workerGroup || ""}
            onChange={(e) => setForm({ ...form, workerGroup: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Max Slots Per Phase"
            value={form.maxSlotsPerPhase || ""}
            onChange={(e) => setForm({ ...form, maxSlotsPerPhase: Number(e.target.value) })}
          />
        </>
      )}

      <Button onClick={handleSubmit}>Add Rule</Button>
    </div>
  );
}
