"use client";

import React from "react";
import * as XLSX from "xlsx";

// 📦 Props: Single callback with all parsed entities
export interface FileUploaderProps {
  onDataParsed: (data: {
    clients: any[];
    workers: any[];
    tasks: any[];
  }) => void;
}

// 🧠 Header normalization map
const HEADER_MAP: Record<string, string> = {
  client_name: "ClientName",
  "client id": "ClientID",
  skills: "Skills",
  "available slots": "AvailableSlots",
  attributesjson: "AttributesJSON",
  prioritylevel: "PriorityLevel",
  requestedtaskids: "RequestedTaskIDs",
  taskid: "TaskID",
  taskname: "TaskName",
  duration: "Duration",
  requiredskills: "RequiredSkills",
  preferredphases: "PreferredPhases",
  maxconcurrent: "MaxConcurrent",
  workerid: "WorkerID",
  workername: "WorkerName",
  maxloadperphase: "MaxLoadPerPhase",
  qualificationlevel: "QualificationLevel",
  workergroup: "WorkerGroup",
};

// 🔧 Normalize headers for each row
const normalizeHeaders = (row: Record<string, any>) => {
  const normalized: Record<string, any> = {};
  for (const key in row) {
    const mappedKey = HEADER_MAP[key.trim().toLowerCase()] || key;
    normalized[mappedKey] = row[key];
  }
  return normalized;
};

// 🔍 Find sheet by keyword match
const findSheet = (workbook: XLSX.WorkBook, keyword: string) => {
  const sheetName = workbook.SheetNames.find((name) =>
    name.toLowerCase().includes(keyword.toLowerCase())
  );
  return sheetName ? workbook.Sheets[sheetName] : undefined;
};

const FileUploader: React.FC<FileUploaderProps> = ({ onDataParsed }) => {
  const [fileName, setFileName] = React.useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const fileData = event.target?.result;
        const workbook = XLSX.read(fileData, { type: "binary" });

        const clientsSheet = findSheet(workbook, "client");
        const workersSheet = findSheet(workbook, "worker");
        const tasksSheet = findSheet(workbook, "task");

        if (!clientsSheet || !workersSheet || !tasksSheet) {
          throw new Error(
            `❌ Missing one or more required sheets. Found sheets: ${workbook.SheetNames.join(
              ", "
            )}`
          );
        }

        const clients = (XLSX.utils.sheet_to_json(clientsSheet) as Record<string, any>[])
  .map(normalizeHeaders);

const workers = (XLSX.utils.sheet_to_json(workersSheet) as Record<string, any>[])
  .map(normalizeHeaders);

const tasks = (XLSX.utils.sheet_to_json(tasksSheet) as Record<string, any>[])
  .map(normalizeHeaders);


        setFileName(file.name);
        onDataParsed({ clients, workers, tasks });
      } catch (err) {
        console.error("❌ Error parsing file:", err);
        alert(
          "❌ Failed to parse file. Please make sure it includes valid 'Clients', 'Workers', and 'Tasks' sheets."
        );
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="flex flex-col gap-2 p-4 border rounded-xl shadow-sm bg-white">
      <label className="text-sm font-semibold">Upload Unified File (.xlsx)</label>
      <input
        type="file"
        accept=".xlsx"
        onChange={handleFile}
        className="text-sm"
      />
      {fileName && (
        <p className="text-sm text-green-600">✅ Uploaded: {fileName}</p>
      )}
    </div>
  );
};

export default FileUploader;
