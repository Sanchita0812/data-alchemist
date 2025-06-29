"use client";

import React from "react";
import { Rule } from "@/types/rule";
import RuleCard from "./RuleCard";

interface RuleListProps {
  rules: Rule[];
  onDelete: (id: string) => void;
  onUpdate: (updatedRule: Rule) => void; // ✅ Add update handler
}

const RuleList: React.FC<RuleListProps> = ({ rules, onDelete, onUpdate }) => {
  if (!rules.length) {
    return <p className="text-muted-foreground">No rules added yet.</p>;
  }

  return (
    <div className="grid gap-4">
      {rules.map((rule) => (
        <RuleCard
          key={rule.id}
          rule={rule}
          onDelete={() => onDelete(rule.id)}
          onUpdate={onUpdate} // ✅ Pass update handler
        />
      ))}
    </div>
  );
};

export default RuleList;
