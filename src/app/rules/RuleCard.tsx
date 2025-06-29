"use client";

import React, { useState } from "react";
import { Rule, CoRunRule, SlotRestrictionRule, LoadLimitRule } from "@/types/rule";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Check, X } from "lucide-react";

interface RuleCardProps {
  rule: Rule;
  onDelete: () => void;
  onUpdate: (updated: Rule) => void;
}

const RuleCard: React.FC<RuleCardProps> = ({ rule, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRule, setEditedRule] = useState<Rule>(rule);

  const handleSave = () => {
    onUpdate(editedRule);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedRule(rule);
    setIsEditing(false);
  };

  const getRuleTypeColor = (type: string) => {
    switch (type) {
      case "coRun": return "bg-blue-500";
      case "slotRestriction": return "bg-green-500";
      case "loadLimit": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  const getRuleTypeLabel = (type: string) => {
    switch (type) {
      case "coRun": return "Co-Run";
      case "slotRestriction": return "Slot Restriction";
      case "loadLimit": return "Load Limit";
      default: return type;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Badge className={`text-white ${getRuleTypeColor(rule.type)}`}>
            {getRuleTypeLabel(rule.type)}
          </Badge>
          <CardTitle className="text-lg">{getRuleTypeLabel(rule.type)} Rule</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8 p-0"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="h-8 w-8 p-0 text-green-600 hover:text-green-600"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {rule.type === "coRun" && (
          <div className="space-y-2">
            <Label>Task IDs</Label>
            {isEditing ? (
              <Input
                value={(editedRule as CoRunRule).tasks.join(", ")}
                onChange={(e) =>
                  setEditedRule({
                    ...editedRule,
                    tasks: e.target.value.split(",").map((id) => id.trim()).filter(Boolean)
                  } as CoRunRule)
                }
                placeholder="e.g. T1, T2, T3"
              />
            ) : (
              <div className="flex flex-wrap gap-1">
                {(rule as CoRunRule).tasks.map((taskId) => (
                  <Badge key={taskId} variant="outline">
                    {taskId}
                  </Badge>
                ))}
              </div>
            )}
            {!isEditing && (
              <p className="text-sm text-muted-foreground">
                These tasks must run together in the same phase
              </p>
            )}
          </div>
        )}

        {rule.type === "slotRestriction" && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Group Tag</Label>
              {isEditing ? (
                <Input
                  value={(editedRule as SlotRestrictionRule).groupTag}
                  onChange={(e) =>
                    setEditedRule({ ...editedRule, groupTag: e.target.value } as SlotRestrictionRule)
                  }
                />
              ) : (
                <Badge variant="outline" className="w-fit">
                  {(rule as SlotRestrictionRule).groupTag}
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              <Label>Minimum Common Slots</Label>
              {isEditing ? (
                <Input
                  type="number"
                  min={1}
                  value={(editedRule as SlotRestrictionRule).minCommonSlots}
                  onChange={(e) =>
                    setEditedRule({ ...editedRule, minCommonSlots: Number(e.target.value) } as SlotRestrictionRule)
                  }
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{(rule as SlotRestrictionRule).minCommonSlots}</Badge>
                  <span className="text-sm text-muted-foreground">slots required</span>
                </div>
              )}
            </div>
            {!isEditing && (
              <p className="text-sm text-muted-foreground">
                All clients in "{(rule as SlotRestrictionRule).groupTag}" must share at least {(rule as SlotRestrictionRule).minCommonSlots} common time slots
              </p>
            )}
          </div>
        )}

        {rule.type === "loadLimit" && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Worker Group</Label>
              {isEditing ? (
                <Input
                  value={(editedRule as LoadLimitRule).workerGroup}
                  onChange={(e) =>
                    setEditedRule({ ...editedRule, workerGroup: e.target.value } as LoadLimitRule)
                  }
                />
              ) : (
                <Badge variant="outline" className="w-fit">
                  {(rule as LoadLimitRule).workerGroup}
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              <Label>Max Slots Per Phase</Label>
              {isEditing ? (
                <Input
                  type="number"
                  min={1}
                  value={(editedRule as LoadLimitRule).maxSlotsPerPhase}
                  onChange={(e) =>
                    setEditedRule({ ...editedRule, maxSlotsPerPhase: Number(e.target.value) } as LoadLimitRule)
                  }
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{(rule as LoadLimitRule).maxSlotsPerPhase}</Badge>
                  <span className="text-sm text-muted-foreground">max slots</span>
                </div>
              )}
            </div>
            {!isEditing && (
              <p className="text-sm text-muted-foreground">
                Workers in "{(rule as LoadLimitRule).workerGroup}" cannot exceed {(rule as LoadLimitRule).maxSlotsPerPhase} slots per phase
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RuleCard;