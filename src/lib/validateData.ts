export interface ValidationError {
    entity: "clients" | "workers" | "tasks";
    rowIndex: number;
    field: string;
    message: string;
  }
  
  // Helper
  function isJSON(str: string) {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }
  
  // CLIENT VALIDATION
  export function validateClients(clients: any[], allTaskIDs: Set<string>): ValidationError[] {
    const errors: ValidationError[] = [];
    const seen = new Set();
  
    clients.forEach((client, i) => {
      if (!client.ClientID) {
        errors.push({ entity: "clients", rowIndex: i, field: "ClientID", message: "Missing ClientID" });
      } else if (seen.has(client.ClientID)) {
        errors.push({ entity: "clients", rowIndex: i, field: "ClientID", message: "Duplicate ClientID" });
      } else {
        seen.add(client.ClientID);
      }
  
      if (client.AttributesJSON && !isJSON(client.AttributesJSON)) {
        errors.push({ entity: "clients", rowIndex: i, field: "AttributesJSON", message: "Invalid JSON" });
      }
  
      const requested = (client.RequestedTaskIDs || "").split(",");
      for (const id of requested) {
        if (!allTaskIDs.has(id.trim())) {
          errors.push({ entity: "clients", rowIndex: i, field: "RequestedTaskIDs", message: `Unknown TaskID: ${id}` });
        }
      }
    });
  
    return errors;
  }
  
  // TASK VALIDATION
  export function validateTasks(tasks: any[], allWorkerSkills: Set<string>): ValidationError[] {
    const errors: ValidationError[] = [];
  
    tasks.forEach((task, i) => {
      if (!task.TaskID) {
        errors.push({ entity: "tasks", rowIndex: i, field: "TaskID", message: "Missing TaskID" });
      }
  
      if (task.Duration < 1) {
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
  
      if (typeof task.PreferredPhases === "string") {
        const rangeMatch = task.PreferredPhases.match(/^(\d+)-(\d+)$/);
        const listMatch = task.PreferredPhases.match(/^\[(.*?)\]$/);
  
        if (!rangeMatch && !listMatch) {
          errors.push({ entity: "tasks", rowIndex: i, field: "PreferredPhases", message: "Invalid PreferredPhases format" });
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
  
      if (!Array.isArray(worker.AvailableSlots)) {
        try {
          worker.AvailableSlots = JSON.parse(worker.AvailableSlots);
        } catch {
          errors.push({ entity: "workers", rowIndex: i, field: "AvailableSlots", message: "Must be a valid array" });
        }
      }
  
      if (typeof worker.MaxLoadPerPhase !== "number" || worker.MaxLoadPerPhase < 1) {
        errors.push({ entity: "workers", rowIndex: i, field: "MaxLoadPerPhase", message: "Invalid MaxLoadPerPhase" });
      }
    });
  
    return errors;
  }
  