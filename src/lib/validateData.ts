export interface ValidationError {
    entity: "clients" | "workers" | "tasks";
    rowIndex: number;
    field: string;
    message: string;
  }
  
  //Safe JSON check
  function isJSON(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }
  
  //Normalize PreferredPhases field
  function normalizePreferredPhases(value: string): number[] | null {
    if (!value) return null;
  
    const rangeMatch = value.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const [start, end] = [parseInt(rangeMatch[1]), parseInt(rangeMatch[2])];
      if (start <= end) {
        return Array.from({ length: end - start + 1 }, (_, i) => i + start);
      }
      return null;
    }
  
    const listMatch = value.match(/^\[(.*?)\]$/);
    if (listMatch) {
      return listMatch[1]
        .split(",")
        .map((s) => parseInt(s.trim()))
        .filter((n) => !isNaN(n));
    }
  
    return null;
  }
  
  //CLIENT VALIDATION
  export function validateClients(clients: any[], allTaskIDs: Set<string>): ValidationError[] {
    const errors: ValidationError[] = [];
    const seenClientIDs = new Set();
  
    clients.forEach((client, i) => {
      if (!client.ClientID) {
        errors.push({ entity: "clients", rowIndex: i, field: "ClientID", message: "Missing ClientID" });
      } else if (seenClientIDs.has(client.ClientID)) {
        errors.push({ entity: "clients", rowIndex: i, field: "ClientID", message: "Duplicate ClientID" });
      } else {
        seenClientIDs.add(client.ClientID);
      }
  
      if (client.AttributesJSON && !isJSON(client.AttributesJSON)) {
        errors.push({ entity: "clients", rowIndex: i, field: "AttributesJSON", message: "Invalid JSON" });
      }
  
      const requested = (client.RequestedTaskIDs || "").split(",");
      for (const id of requested) {
        const trimmed = id.trim();
        if (trimmed && !allTaskIDs.has(trimmed)) {
          errors.push({ entity: "clients", rowIndex: i, field: "RequestedTaskIDs", message: `Unknown TaskID: ${trimmed}` });
        }
      }
    });
  
    return errors;
  }
  
  //TASK VALIDATION
  export function validateTasks(tasks: any[], allWorkerSkills: Set<string>): ValidationError[] {
    const errors: ValidationError[] = [];
  
    tasks.forEach((task, i) => {
      if (!task.TaskID) {
        errors.push({ entity: "tasks", rowIndex: i, field: "TaskID", message: "Missing TaskID" });
      }
  
      const duration = Number(task.Duration);
      if (isNaN(duration) || duration < 1) {
        errors.push({ entity: "tasks", rowIndex: i, field: "Duration", message: "Duration must be ≥ 1" });
      }
  
      const skills = Array.isArray(task.RequiredSkills)
        ? task.RequiredSkills.map((s: string) => s.trim())
        : String(task.RequiredSkills || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
  
      for (const s of skills) {
        if (s && !allWorkerSkills.has(s)) {
          errors.push({ entity: "tasks", rowIndex: i, field: "RequiredSkills", message: `Unknown Skill: ${s}` });
        }
      }
  
      if (task.PreferredPhases) {
        const normalized = normalizePreferredPhases(String(task.PreferredPhases));
        if (!normalized) {
          errors.push({
            entity: "tasks",
            rowIndex: i,
            field: "PreferredPhases",
            message: "Invalid PreferredPhases format (use '1-3' or '[1,2,3]')",
          });
        }
      }
    });
  
    return errors;
  }
  
  // WORKER VALIDATION
  export function validateWorkers(workers: any[]): ValidationError[] {
    const errors: ValidationError[] = [];
  
    workers.forEach((worker, i) => {
      if (!worker.WorkerID) {
        errors.push({ entity: "workers", rowIndex: i, field: "WorkerID", message: "Missing WorkerID" });
      }
  
      try {
        const slots = Array.isArray(worker.AvailableSlots)
          ? worker.AvailableSlots
          : JSON.parse(worker.AvailableSlots);
  
        if (!Array.isArray(slots)) {
          throw new Error();
        }
      } catch {
        errors.push({ entity: "workers", rowIndex: i, field: "AvailableSlots", message: "AvailableSlots must be an array or valid JSON" });
      }
  
      const maxLoad = Number(worker.MaxLoadPerPhase);
      if (isNaN(maxLoad) || maxLoad < 1) {
        errors.push({ entity: "workers", rowIndex: i, field: "MaxLoadPerPhase", message: "Invalid MaxLoadPerPhase" });
      }
  
      const skills = (worker.Skills || "").split(",").map((s: string) => s.trim());
      if (!skills.length || (skills.length === 1 && skills[0] === "")) {
        errors.push({ entity: "workers", rowIndex: i, field: "Skills", message: "Skills cannot be empty" });
      }
    });
  
    return errors;
  }
  