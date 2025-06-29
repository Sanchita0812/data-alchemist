"use client";

import React from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";

export type FileType = "clients" | "workers" | "tasks";

export interface FileUploaderProps {
  type: FileType;
  onDataParsed: (type: FileType, data: any[]) => void;
}

// Header normalization map
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

// Normalize row headers using HEADER_MAP
function normalizeHeaders(row: Record<string, any>) {
  const normalizedRow: Record<string, any> = {};
  for (const key in row) {
    const mappedKey = HEADER_MAP[key.trim().toLowerCase()] || key;
    normalizedRow[mappedKey] = row[key];
  }
  return normalizedRow;
}

const FileUploader: React.FC<FileUploaderProps> = ({ type, onDataParsed }) => {
  const [fileName, setFileName] = React.useState("");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const fileData = event.target?.result;
      let parsedData: any[] = [];

      try {
        if (file.name.endsWith(".csv")) {
          const parsed = Papa.parse(fileData as string, {
            header: true,
            skipEmptyLines: true,
          });
          parsedData = parsed.data as any[];
        } else if (file.name.endsWith(".xlsx")) {
          const workbook = XLSX.read(fileData, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          parsedData = XLSX.utils.sheet_to_json(sheet);
        }

        // Normalize headers using AI-style mapping
        parsedData = parsedData.map(normalizeHeaders);

        // Update state and pass parsed data
        setFileName(file.name);
        onDataParsed(type, parsedData);
      } catch (error) {
        console.error("Error parsing file:", error);
        alert("❌ Failed to parse file. Please check format or data.");
      }
    };

    if (file.name.endsWith(".csv")) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-2 border rounded-xl shadow-sm bg-white">
      <label className="text-sm font-semibold capitalize">{type} file</label>
      <input
        type="file"
        accept=".csv,.xlsx"
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
