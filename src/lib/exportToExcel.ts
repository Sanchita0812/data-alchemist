// src/lib/exportToExcel.ts
import * as XLSX from "xlsx";

export function exportEntitiesToExcel(entities: {
  clients: any[];
  workers: any[];
  tasks: any[];
}) {
  const wb = XLSX.utils.book_new();

  const clientsSheet = XLSX.utils.json_to_sheet(entities.clients);
  const workersSheet = XLSX.utils.json_to_sheet(entities.workers);
  const tasksSheet = XLSX.utils.json_to_sheet(entities.tasks);

  XLSX.utils.book_append_sheet(wb, clientsSheet, "Clients");
  XLSX.utils.book_append_sheet(wb, workersSheet, "Workers");
  XLSX.utils.book_append_sheet(wb, tasksSheet, "Tasks");

  XLSX.writeFile(wb, "cleaned_dataset.xlsx");
}

export function exportRuleResultsToExcel(results: any[]) {
  const wb = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(
    results.map((r) => ({
      RuleID: r.rule.id,
      RuleType: r.rule.type,
      Passed: r.passed ? "Yes" : "No",
      Reason: r.reason || "-",
    }))
  );

  XLSX.utils.book_append_sheet(wb, sheet, "Rule Results");
  XLSX.writeFile(wb, "rule_results.xlsx");
}

export function exportRulesToJSON(rules: any[]) {
  const wb = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(rules);
  
  XLSX.utils.book_append_sheet(wb, sheet, "Rules");
  XLSX.writeFile(wb, "rules.json");
}