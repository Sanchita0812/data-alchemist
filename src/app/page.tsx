"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import FileUploader from "@/components/FileUpload/FileUploader";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import DataGrid from "@/components/ui/DataGrid";

export default function UploadPage() {
  const [parsedData, setParsedData] = useState<{
    clients: any[];
    workers: any[];
    tasks: any[];
  }>({
    clients: [],
    workers: [],
    tasks: [],
  });

  const handleAllSheetsParsed = (data: {
    clients: any[];
    workers: any[];
    tasks: any[];
  }) => {
    setParsedData(data);
    console.log("✅ Parsed all sheets:", data);
  };

  const updateEntity = (type: "clients" | "workers" | "tasks", updated: any[]) => {
    setParsedData((prev) => ({ ...prev, [type]: updated }));
  };

  return (
    <div className="min-h-screen p-6 bg-muted/50">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">📂 Upload Entity File</h1>
        <p className="text-muted-foreground mt-1">
          Upload a single `.xlsx` file with sheets for Clients, Workers, and Tasks. We'll parse and validate them.
        </p>
      </div>

      {/* File Uploader */}
      <Card className="shadow-md mb-6">
        <CardContent className="p-4">
          <h2 className="text-lg font-medium mb-2">Upload File</h2>
          <FileUploader onDataParsed={handleAllSheetsParsed} />

        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Clients Grid */}
      {!!parsedData.clients.length && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-2">🧑 Clients</h2>
          <DataGrid
            data={parsedData.clients}
            onChange={(data) => updateEntity("clients", data)}
          />
        </div>
      )}

      {/* Workers Grid */}
      {!!parsedData.workers.length && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-2">👷 Workers</h2>
          <DataGrid
            data={parsedData.workers}
            onChange={(data) => updateEntity("workers", data)}
          />
        </div>
      )}

      {/* Tasks Grid */}
      {!!parsedData.tasks.length && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-2">📝 Tasks</h2>
          <DataGrid
            data={parsedData.tasks}
            onChange={(data) => updateEntity("tasks", data)}
          />
        </div>
      )}

      <Separator className="my-8" />

      {/* CTA Button */}
      <div className="flex justify-end">
        <Button
          variant="default"
          disabled={
            !parsedData.clients.length ||
            !parsedData.workers.length ||
            !parsedData.tasks.length
          }
        >
          Proceed to Validation
        </Button>
      </div>
    </div>
  );
}
