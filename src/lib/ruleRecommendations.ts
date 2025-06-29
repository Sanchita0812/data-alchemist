export interface RuleRecommendation {
  id: string;
  type: "coRun" | "slotRestriction" | "loadLimit";
  title: string;
  description: string;
  confidence: number; // 0-100
  suggestedRule: any;
  reasoning: string;
}

export function generateRuleRecommendations(data: {
  clients: any[];
  workers: any[];
  tasks: any[];
}): RuleRecommendation[] {
  const recommendations: RuleRecommendation[] = [];

  // 1. Co-Run Rule Recommendations
  recommendations.push(...findCoRunOpportunities(data.tasks));

  // 2. Load Limit Recommendations
  recommendations.push(...findLoadLimitOpportunities(data.workers));

  // 3. Slot Restriction Recommendations
  recommendations.push(...findSlotRestrictionOpportunities(data.clients));

  return recommendations.sort((a, b) => b.confidence - a.confidence);
}

function findCoRunOpportunities(tasks: any[]): RuleRecommendation[] {
  const recommendations: RuleRecommendation[] = [];
  
  // Group tasks by preferred phases
  const phaseGroups: { [key: string]: any[] } = {};
  
  tasks.forEach(task => {
    const phases = normalizePhases(task.PreferredPhases);
    const phaseKey = phases.sort().join(',');
    
    if (!phaseGroups[phaseKey]) {
      phaseGroups[phaseKey] = [];
    }
    phaseGroups[phaseKey].push(task);
  });

  // Find groups with multiple tasks
  Object.entries(phaseGroups).forEach(([phaseKey, groupTasks]) => {
    if (groupTasks.length >= 2 && phaseKey !== '') {
      const taskIds = groupTasks.map(t => t.TaskID);
      const phases = phaseKey.split(',').map(Number);
      
      recommendations.push({
        id: `corun-${Date.now()}-${Math.random()}`,
        type: "coRun",
        title: `Co-Run Opportunity: ${taskIds.slice(0, 3).join(', ')}${taskIds.length > 3 ? '...' : ''}`,
        description: `Tasks ${taskIds.join(', ')} all prefer phases ${phases.join(', ')}. Consider adding a Co-run rule?`,
        confidence: Math.min(95, 60 + (groupTasks.length * 10)),
        suggestedRule: {
          type: "coRun",
          tasks: taskIds
        },
        reasoning: `Found ${groupTasks.length} tasks with identical preferred phases (${phases.join(', ')}). Co-running these tasks could improve scheduling efficiency.`
      });
    }
  });

  // Find tasks with similar skill requirements
  const skillGroups: { [key: string]: any[] } = {};
  
  tasks.forEach(task => {
    const skills = normalizeSkills(task.RequiredSkills);
    const skillKey = skills.sort().join(',');
    
    if (!skillGroups[skillKey]) {
      skillGroups[skillKey] = [];
    }
    skillGroups[skillKey].push(task);
  });

  Object.entries(skillGroups).forEach(([skillKey, groupTasks]) => {
    if (groupTasks.length >= 2 && skillKey !== '') {
      const taskIds = groupTasks.map(t => t.TaskID);
      const skills = skillKey.split(',');
      
      recommendations.push({
        id: `corun-skills-${Date.now()}-${Math.random()}`,
        type: "coRun",
        title: `Skill-Based Co-Run: ${taskIds.slice(0, 2).join(', ')}`,
        description: `Tasks ${taskIds.join(', ')} require identical skills (${skills.join(', ')}). Co-run for resource efficiency?`,
        confidence: Math.min(85, 50 + (groupTasks.length * 8)),
        suggestedRule: {
          type: "coRun",
          tasks: taskIds
        },
        reasoning: `Tasks share identical skill requirements: ${skills.join(', ')}. Co-running could optimize worker allocation.`
      });
    }
  });

  return recommendations;
}

function findLoadLimitOpportunities(workers: any[]): RuleRecommendation[] {
  const recommendations: RuleRecommendation[] = [];
  
  // Group workers by WorkerGroup
  const workerGroups: { [key: string]: any[] } = {};
  
  workers.forEach(worker => {
    const group = worker.WorkerGroup || 'default';
    if (!workerGroups[group]) {
      workerGroups[group] = [];
    }
    workerGroups[group].push(worker);
  });

  Object.entries(workerGroups).forEach(([groupName, groupWorkers]) => {
    if (groupWorkers.length < 2) return;

    // Calculate average load per phase
    const loads = groupWorkers.map(w => {
      const slots = normalizeSlots(w.AvailableSlots);
      return slots.length;
    });

    const avgLoad = loads.reduce((sum, load) => sum + load, 0) / loads.length;
    const maxLoad = Math.max(...loads);
   // const minLoad = Math.min(...loads);

    // Check for overloaded workers
    const overloadedWorkers = groupWorkers.filter(w => {
      const slots = normalizeSlots(w.AvailableSlots);
      return slots.length > avgLoad * 1.5;
    });

    if (overloadedWorkers.length > 0) {
      const suggestedLimit = Math.ceil(avgLoad * 1.2);
      
      recommendations.push({
        id: `loadlimit-${groupName}-${Date.now()}`,
        type: "loadLimit",
        title: `Load Imbalance in ${groupName} Group`,
        description: `${overloadedWorkers.length} workers in "${groupName}" are overloaded (avg: ${avgLoad.toFixed(1)}, max: ${maxLoad}). Set load limit to ${suggestedLimit}?`,
        confidence: Math.min(90, 70 + (overloadedWorkers.length * 5)),
        suggestedRule: {
          type: "loadLimit",
          workerGroup: groupName,
          maxSlotsPerPhase: suggestedLimit
        },
        reasoning: `Detected significant load imbalance. ${overloadedWorkers.length} workers have ${maxLoad} slots while average is ${avgLoad.toFixed(1)}. A limit of ${suggestedLimit} would balance workload.`
      });
    }

    // Check for underutilized groups
    if (maxLoad < 3 && groupWorkers.length > 2) {
      recommendations.push({
        id: `loadlimit-underutil-${groupName}-${Date.now()}`,
        type: "loadLimit",
        title: `Underutilized ${groupName} Group`,
        description: `"${groupName}" workers have low utilization (max: ${maxLoad} slots). Consider increasing capacity or redistributing work.`,
        confidence: 60,
        suggestedRule: {
          type: "loadLimit",
          workerGroup: groupName,
          maxSlotsPerPhase: Math.max(maxLoad + 2, 4)
        },
        reasoning: `Group shows low utilization with maximum ${maxLoad} slots per worker. Could handle more work.`
      });
    }
  });

  return recommendations;
}

function findSlotRestrictionOpportunities(clients: any[]): RuleRecommendation[] {
  const recommendations: RuleRecommendation[] = [];
  
  // Group clients by GroupTag
  const clientGroups: { [key: string]: any[] } = {};
  
  clients.forEach(client => {
    const group = client.GroupTag || 'default';
    if (!clientGroups[group]) {
      clientGroups[group] = [];
    }
    clientGroups[group].push(client);
  });

  Object.entries(clientGroups).forEach(([groupName, groupClients]) => {
    if (groupClients.length < 2) return;

    // Analyze slot overlap
    const allSlots = groupClients.map(c => normalizeSlots(c.AvailableSlots));
    
    if (allSlots.length === 0 || allSlots.some(slots => slots.length === 0)) return;

    // Find common slots
    const commonSlots = allSlots.reduce((common, slots) => 
      common.filter(slot => slots.includes(slot)), allSlots[0]
    );

    // Find total unique slots
    const allUniqueSlots = [...new Set(allSlots.flat())];

    const overlapPercentage = (commonSlots.length / allUniqueSlots.length) * 100;

    if (commonSlots.length >= 2 && overlapPercentage > 30) {
      recommendations.push({
        id: `slotrestriction-${groupName}-${Date.now()}`,
        type: "slotRestriction",
        title: `Slot Coordination for ${groupName}`,
        description: `"${groupName}" clients share ${commonSlots.length} common slots (${commonSlots.join(', ')}). Enforce minimum ${Math.min(commonSlots.length, 3)} common slots?`,
        confidence: Math.min(85, 50 + Math.floor(overlapPercentage / 2)),
        suggestedRule: {
          type: "slotRestriction",
          groupTag: groupName,
          minCommonSlots: Math.min(commonSlots.length, Math.max(2, Math.floor(commonSlots.length * 0.8)))
        },
        reasoning: `Group has ${overlapPercentage.toFixed(1)}% slot overlap with ${commonSlots.length} common slots. Enforcing coordination could improve scheduling.`
      });
    }

    // Check for fragmented availability
    const avgSlotsPerClient = allSlots.reduce((sum, slots) => sum + slots.length, 0) / allSlots.length;
    const fragmentedClients = groupClients.filter((_, i) => allSlots[i].length < avgSlotsPerClient * 0.7);

    if (fragmentedClients.length > 0 && commonSlots.length >= 1) {
      recommendations.push({
        id: `slotrestriction-frag-${groupName}-${Date.now()}`,
        type: "slotRestriction",
        title: `Address Fragmentation in ${groupName}`,
        description: `${fragmentedClients.length} clients in "${groupName}" have limited availability. Require at least ${commonSlots.length} common slots for coordination?`,
        confidence: 65,
        suggestedRule: {
          type: "slotRestriction",
          groupTag: groupName,
          minCommonSlots: Math.max(1, commonSlots.length)
        },
        reasoning: `${fragmentedClients.length} clients have below-average availability. Common slot requirement would ensure coordination.`
      });
    }
  });

  return recommendations;
}

// Helper functions
function normalizePhases(phases: any): number[] {
  if (Array.isArray(phases)) return phases.map(Number);
  
  if (typeof phases === "string") {
    try {
      if (phases.startsWith("[")) {
        return JSON.parse(phases);
      }
      
      const match = phases.match(/^(\d+)-(\d+)$/);
      if (match) {
        const start = parseInt(match[1]);
        const end = parseInt(match[2]);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
      }
      
      return phases.split(",").map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    } catch {
      return [];
    }
  }
  
  return [];
}

function normalizeSkills(skills: any): string[] {
  if (Array.isArray(skills)) return skills.map(s => s.toString().toLowerCase().trim());
  
  if (typeof skills === "string") {
    return skills.split(",").map(s => s.toLowerCase().trim()).filter(Boolean);
  }
  
  return [];
}

function normalizeSlots(slots: any): number[] {
  if (Array.isArray(slots)) return slots.map(Number);
  
  if (typeof slots === "string") {
    try {
      return JSON.parse(slots);
    } catch {
      return [];
    }
  }
  
  return [];
}