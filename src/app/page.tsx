"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import FileUploader from "@/components/FileUpload/FileUploader";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import DataGrid from "@/components/ui/DataGrid";
import {
  validateClients,
  validateWorkers,
  validateTasks,
  ValidationError,
} from "@/lib/validateData";

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

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    if (
      parsedData.clients.length &&
      parsedData.workers.length &&
      parsedData.tasks.length
    ) {
      const allTaskIDs = new Set(parsedData.tasks.map((t) => t.TaskID));
      const allWorkerSkills = new Set(
        parsedData.workers.flatMap((w) =>
          String(w.Skills || "")
            .split(",")
            .map((s) => s.trim().toLowerCase())
        )
      );

      const clientErrors = validateClients(parsedData.clients, allTaskIDs);
      const taskErrors = validateTasks(parsedData.tasks, allWorkerSkills);
      const workerErrors = validateWorkers(parsedData.workers);

      setValidationErrors([...clientErrors, ...taskErrors, ...workerErrors]);
    }
  }, [parsedData]);

  const handleAllSheetsParsed = (data: {
    clients: any[];
    workers: any[];
    tasks: any[];
  }) => {
    setParsedData(data);
  };

  const updateEntity = (type: "clients" | "workers" | "tasks", updated: any[]) => {
    setParsedData((prev) => ({ ...prev, [type]: updated }));
  };

  const getErrorsFor = (entity: "clients" | "workers" | "tasks") =>
    validationErrors.filter((e) => e.entity === entity);

  return (
    <div className="min-h-screen p-6 bg-muted/50">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">📂 Upload Entity File</h1>
        <p className="text-muted-foreground mt-1">
          Upload a single `.xlsx` file with sheets for Clients, Workers, and Tasks. We'll parse and validate them.
        </p>
      </div>

      <Card className="shadow-md mb-6">
        <CardContent className="p-4">
          <h2 className="text-lg font-medium mb-2">Upload File</h2>
          <FileUploader onDataParsed={handleAllSheetsParsed} />
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {!!validationErrors.length && (
        <div className="bg-red-100 border border-red-300 p-4 rounded-md my-6">
          <h3 className="text-lg font-semibold text-red-700 mb-2">
            ❌ Validation Errors ({validationErrors.length})
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-red-800">
            {validationErrors.map((error, idx) => (
              <li key={idx}>
                <strong>{error.entity}</strong> (row {error.rowIndex + 1}) -{" "}
                <strong>{error.field}</strong>: {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!!parsedData.clients.length && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-2">🧑 Clients</h2>
          <DataGrid
            entity="clients"
            data={parsedData.clients}
            onChange={(data) => updateEntity("clients", data)}
            validationErrors={getErrorsFor("clients")}
          />
        </div>
      )}

      {!!parsedData.workers.length && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-2">👷 Workers</h2>
          <DataGrid
            entity="workers"
            data={parsedData.workers}
            onChange={(data) => updateEntity("workers", data)}
            validationErrors={getErrorsFor("workers")}
          />
        </div>
      )}

      {!!parsedData.tasks.length && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-2">📝 Tasks</h2>
          <DataGrid
            entity="tasks"
            data={parsedData.tasks}
            onChange={(data) => updateEntity("tasks", data)}
            validationErrors={getErrorsFor("tasks")}
          />
        </div>
      )}

      <Separator className="my-8" />

      <div className="flex justify-end">
        <Button
          variant="default"
          disabled={
            !parsedData.clients.length ||
            !parsedData.workers.length ||
            !parsedData.tasks.length ||
            validationErrors.length > 0
          }
        >
          Proceed to Next Step
        </Button>
      </div>
    </div>
  );
}
