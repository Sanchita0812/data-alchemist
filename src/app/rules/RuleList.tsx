"use client";

import React from "react";
import { Rule } from "@/types/rule";
import RuleCard from "./RuleCard";

interface RuleListProps {
  rules: Rule[];
  onDelete: (id: string) => void;
  onUpdate: (updatedRule: Rule) => void;
}

const RuleList: React.FC<RuleListProps> = ({ rules, onDelete, onUpdate }) => {
  if (!rules.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No rules created yet.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first rule using the form above or accept an AI recommendation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rules.map((rule) => (
        <RuleCard
          key={rule.id}
          rule={rule}
          onDelete={() => onDelete(rule.id)}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
};

export default RuleList;