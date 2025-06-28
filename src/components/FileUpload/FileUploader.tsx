"use client";

import React from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";

export type FileType = "clients" | "workers" | "tasks";

export interface FileUploaderProps {
  type: FileType;
  onDataParsed: (type: FileType, data: any[]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ type, onDataParsed }) => {
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const fileData = event.target?.result;
      let parsedData: any[] = [];

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

      onDataParsed(type, parsedData);
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
    </div>
  );
};

export default FileUploader;