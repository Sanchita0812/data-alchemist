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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Link from "next/link"; // ✅ Import Link

export default function UploadPage() {
  const [parsedData, setParsedData] = useState<{
    clients: any[];
    workers: any[];
    tasks: any[];
  }>({ clients: [], workers: [], tasks: [] });

  const [originalData, setOriginalData] = useState<typeof parsedData>({
    clients: [],
    workers: [],
    tasks: [],
  });

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchEntity, setSearchEntity] = useState<"clients" | "workers" | "tasks">("tasks");
  const [isFiltering, setIsFiltering] = useState(false);

  const handleAllSheetsParsed = (data: typeof parsedData) => {
    setParsedData(data);
    setOriginalData(data);
    validateAllEntities(data);
  };

  const updateEntity = (type: keyof typeof parsedData, updated: any[]) => {
    const newParsed = { ...parsedData, [type]: updated };
    setParsedData(newParsed);
    validateAllEntities(newParsed);
  };

  const getErrorsFor = (entity: keyof typeof parsedData) =>
    validationErrors.filter((e) => e.entity === entity);

  const validateAllEntities = (data: typeof parsedData) => {
    const allTaskIDs = new Set(data.tasks.map((t) => t.TaskID));
    const allWorkerSkills = new Set(
      data.workers.flatMap((w) =>
        String(w.Skills || "")
          .split(",")
          .map((s) => s.trim().toLowerCase())
      )
    );

    const clientErrors = validateClients(data.clients, allTaskIDs);
    const taskErrors = validateTasks(data.tasks, allWorkerSkills);
    const workerErrors = validateWorkers(data.workers);

    setValidationErrors([...clientErrors, ...taskErrors, ...workerErrors]);
  };

  const handleNaturalSearch = async () => {
    if (!searchInput.trim()) return;
    setIsFiltering(true);

    try {
      const res = await fetch("/api/nl-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: searchInput,
          data: originalData[searchEntity],
        }),
      });

      const filtered = await res.json();
      const updated = { ...parsedData, [searchEntity]: filtered };
      setParsedData(updated);
      validateAllEntities(updated);
    } catch (err) {
      console.error("❌ Error in filtering:", err);
      alert("Something went wrong while filtering.");
    } finally {
      setIsFiltering(false);
    }
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

      {/* Upload */}
      <Card className="shadow-md mb-6">
        <CardContent className="p-4">
          <h2 className="text-lg font-medium mb-2">Upload File</h2>
          <FileUploader onDataParsed={handleAllSheetsParsed} />
        </CardContent>
      </Card>

      {/* Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-6">
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="🔍 e.g. tasks with duration > 2 and preferred phase 3"
          className="w-full md:w-2/3"
        />
        <Select value={searchEntity} onValueChange={(val) => setSearchEntity(val as any)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select Entity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clients">Clients</SelectItem>
            <SelectItem value="workers">Workers</SelectItem>
            <SelectItem value="tasks">Tasks</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleNaturalSearch} disabled={isFiltering || !searchInput}>
          {isFiltering ? "Filtering..." : `Search ${searchEntity}`}
        </Button>

        <Button
          variant="ghost"
          onClick={() => {
            setParsedData(originalData);
            setSearchInput("");
            validateAllEntities(originalData);
          }}
        >
          Reset
        </Button>
      </div>

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

      {/* Grids */}
      {(["clients", "workers", "tasks"] as const).map((entity) => (
        !!parsedData[entity].length && (
          <div className="mb-10" key={entity}>
            <h2 className="text-xl font-semibold mb-2">
              {entity === "clients" && "🧑 Clients"}
              {entity === "workers" && "👷 Workers"}
              {entity === "tasks" && "📝 Tasks"}
            </h2>
            <DataGrid
              entity={entity}
              data={parsedData[entity]}
              onChange={(data) => updateEntity(entity, data)}
              validationErrors={getErrorsFor(entity)}
            />
          </div>
        )
      ))}

      <Separator className="my-8" />

      {/* CTA */}
      <div className="flex justify-between items-center">
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

        <Button asChild variant="outline">
          <Link href="/rules">➕ Go to Rule Builder</Link>
        </Button>
      </div>
    </div>
  );
}
