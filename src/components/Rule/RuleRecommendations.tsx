"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { generateRuleRecommendations, RuleRecommendation } from "@/lib/ruleRecommendations";
import { Rule } from "@/types/rule";
import { v4 as uuidv4 } from "uuid";
import { Lightbulb, ThumbsUp, ThumbsDown, Settings, Sparkles } from "lucide-react";

interface RuleRecommendationsProps {
  data: {
    clients: any[];
    workers: any[];
    tasks: any[];
  };
  onAddRule: (rule: Rule) => void;
  existingRules: Rule[];
}

const RuleRecommendations: React.FC<RuleRecommendationsProps> = ({
  data,
  onAddRule,
  existingRules
}) => {
  const [recommendations, setRecommendations] = useState<RuleRecommendation[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (data.clients.length || data.workers.length || data.tasks.length) {
      const newRecommendations = generateRuleRecommendations(data);
      
      // Filter out recommendations for rules that already exist
      const filteredRecommendations = newRecommendations.filter(rec => {
        return !existingRules.some(rule => {
          if (rule.type !== rec.type) return false;
          
          switch (rule.type) {
            case "coRun":
              return JSON.stringify(rule.tasks.sort()) === JSON.stringify(rec.suggestedRule.tasks.sort());
            case "slotRestriction":
              return rule.groupTag === rec.suggestedRule.groupTag;
            case "loadLimit":
              return rule.workerGroup === rec.suggestedRule.workerGroup;
            default:
              return false;
          }
        });
      });
      
      setRecommendations(filteredRecommendations);
    }
  }, [data, existingRules]);

  const handleAcceptRecommendation = (recommendation: RuleRecommendation) => {
    const rule: Rule = {
      id: uuidv4(),
      ...recommendation.suggestedRule
    };
    
    onAddRule(rule);
    setDismissedIds(prev => new Set([...prev, recommendation.id]));
  };

  const handleDismissRecommendation = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]));
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-green-500";
    if (confidence >= 60) return "bg-yellow-500";
    return "bg-orange-500";
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 80) return "High";
    if (confidence >= 60) return "Medium";
    return "Low";
  };

  const visibleRecommendations = recommendations
    .filter(rec => !dismissedIds.has(rec.id))
    .slice(0, showAll ? recommendations.length : 3);

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Rule Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Upload data to see AI-powered rule recommendations based on patterns in your dataset.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          AI Rule Recommendations
          <Badge variant="secondary">{recommendations.length - dismissedIds.size}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {visibleRecommendations.length === 0 ? (
          <p className="text-muted-foreground">
            All recommendations have been addressed. Great job! 🎉
          </p>
        ) : (
          <>
            {visibleRecommendations.map((recommendation) => (
              <div key={recommendation.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{recommendation.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-white ${getConfidenceColor(recommendation.confidence)}`}
                      >
                        {getConfidenceText(recommendation.confidence)} ({recommendation.confidence}%)
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {recommendation.description}
                    </p>
                    <details className="text-xs text-muted-foreground">
                      <summary className="cursor-pointer hover:text-foreground">
                        Why this recommendation?
                      </summary>
                      <p className="mt-1 pl-4 border-l-2 border-muted">
                        {recommendation.reasoning}
                      </p>
                    </details>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAcceptRecommendation(recommendation)}
                    className="flex items-center gap-1"
                  >
                    <ThumbsUp className="h-3 w-3" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDismissRecommendation(recommendation.id)}
                    className="flex items-center gap-1"
                  >
                    <ThumbsDown className="h-3 w-3" />
                    Dismiss
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex items-center gap-1"
                    onClick={() => {
                      // TODO: Implement rule customization modal
                      alert("Rule customization coming soon! For now, you can accept the rule and edit it manually.");
                    }}
                  >
                    <Settings className="h-3 w-3" />
                    Customize
                  </Button>
                </div>
              </div>
            ))}
            
            {recommendations.length - dismissedIds.size > 3 && (
              <>
                <Separator />
                <Button
                  variant="outline"
                  onClick={() => setShowAll(!showAll)}
                  className="w-full"
                >
                  {showAll ? "Show Less" : `Show ${recommendations.length - dismissedIds.size - 3} More Recommendations`}
                </Button>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RuleRecommendations;