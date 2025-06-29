"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FileUploader from "@/components/FileUpload/FileUploader";
import { Button } from "@/components/ui/button";
//import { Separator } from "@/components/ui/separator";
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
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useParsedDataStore } from "@/store/parsedDataStore";
import { 
  Upload, 
  Search, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle, 
  FileSpreadsheet,
  Users,
  Briefcase,
  ClipboardList,
  ArrowRight,
  Sparkles,
  Database,
  Filter
} from "lucide-react";

export default function UploadPage() {
  const { parsedData, setParsedData, updateEntity } = useParsedDataStore();
  
  const [originalData, setOriginalData] = useState<typeof parsedData>({
    clients: [],
    workers: [],
    tasks: [],
  });

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchEntity, setSearchEntity] = useState<"clients" | "workers" | "tasks">("tasks");
  const [isFiltering, setIsFiltering] = useState(false);

  // Called after file upload
  const handleAllSheetsParsed = (data: typeof parsedData) => {
    setParsedData(data);
    setOriginalData(data);
    validateAllEntities(data);
  };

  // Called on inline edits or search filter update
  const handleUpdateEntity = (type: keyof typeof parsedData, updated: any[]) => {
    const newParsed = { ...parsedData, [type]: updated };
    setParsedData(newParsed);
    updateEntity(type, updated);
    validateAllEntities(newParsed);
  };

  const getErrorsFor = (entity: keyof typeof parsedData) =>
    validationErrors.filter((e) => e.entity === entity);

  // Main validator
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

  // Natural Language Filter
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

  const resetData = () => {
    setParsedData(originalData);
    setSearchInput("");
    validateAllEntities(originalData);
  };

  const hasData = parsedData.clients.length > 0 || parsedData.workers.length > 0 || parsedData.tasks.length > 0;
  const totalRecords = parsedData.clients.length + parsedData.workers.length + parsedData.tasks.length;
  const hasErrors = validationErrors.length > 0;

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case "clients": return <Users className="h-5 w-5" />;
      case "workers": return <Briefcase className="h-5 w-5" />;
      case "tasks": return <ClipboardList className="h-5 w-5" />;
      default: return <Database className="h-5 w-5" />;
    }
  };

  const getEntityColor = (entity: string) => {
    switch (entity) {
      case "clients": return "text-blue-600 bg-blue-50 border-blue-200";
      case "workers": return "text-green-600 bg-green-50 border-green-200";
      case "tasks": return "text-purple-600 bg-purple-50 border-purple-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <FileSpreadsheet className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Data Alchemist
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your scheduling data with AI-powered validation and intelligent rule recommendations
          </p>
        </div>

        {/* File Upload Section */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Upload className="h-6 w-6 text-blue-600" />
              Upload Your Data
            </CardTitle>
            <p className="text-muted-foreground">
              Upload a single Excel file (.xlsx) containing Clients, Workers, and Tasks sheets
            </p>
          </CardHeader>
          <CardContent>
            <FileUploader onDataParsed={handleAllSheetsParsed} />
          </CardContent>
        </Card>

        {/* Data Overview Cards */}
        {hasData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Summary Card */}
            <Card className="md:col-span-1 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm font-medium">Total Records</p>
                    <p className="text-3xl font-bold">{totalRecords}</p>
                  </div>
                  <Database className="h-8 w-8 text-indigo-200" />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  {hasErrors ? (
                    <>
                      <AlertTriangle className="h-4 w-4 text-yellow-300" />
                      <span className="text-sm text-yellow-100">{validationErrors.length} issues found</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-sm text-green-100">All data valid</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Entity Cards */}
            {(["clients", "workers", "tasks"] as const).map((entity) => (
              <Card key={entity} className={`border-2 ${getEntityColor(entity)} shadow-md hover:shadow-lg transition-shadow`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getEntityIcon(entity)}
                      <h3 className="font-semibold capitalize">{entity}</h3>
                    </div>
                    <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                      {parsedData[entity].length}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {entity === "clients" && "Client organizations and requirements"}
                    {entity === "workers" && "Available workforce and skills"}
                    {entity === "tasks" && "Tasks to be scheduled"}
                  </p>
                  {getErrorsFor(entity).length > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">{getErrorsFor(entity).length} errors</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Smart Search Section */}
        {hasData && (
          <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                AI-Powered Search & Filter
              </CardTitle>
              <p className="text-muted-foreground">
                Use natural language to filter your data - try "tasks with duration greater than 2" or "workers with Python skills"
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="🔍 e.g., 'tasks with duration > 2 and preferred phase 3' or 'workers in sales team'"
                    className="text-lg py-3"
                    onKeyDown={(e) => e.key === 'Enter' && handleNaturalSearch()}
                  />
                </div>
                <Select value={searchEntity} onValueChange={(val) => setSearchEntity(val as any)}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clients">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Clients
                      </div>
                    </SelectItem>
                    <SelectItem value="workers">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Workers
                      </div>
                    </SelectItem>
                    <SelectItem value="tasks">
                      <div className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        Tasks
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleNaturalSearch} 
                  disabled={isFiltering || !searchInput.trim()}
                  className="px-6"
                >
                  {isFiltering ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Filtering...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={resetData}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Validation Errors Summary */}
        {hasErrors && (
          <Card className="mb-8 border-red-200 bg-red-50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Data Validation Issues ({validationErrors.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {validationErrors.map((error, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {error.entity}
                        </Badge>
                        <span className="text-sm text-red-600">Row {error.rowIndex + 1}</span>
                      </div>
                      <p className="text-sm">
                        <span className="font-medium text-red-800">{error.field}:</span>{" "}
                        <span className="text-red-700">{error.message}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Tables */}
        {hasData && (
          <div className="space-y-8">
            {(["clients", "workers", "tasks"] as const).map((entity) => (
              parsedData[entity].length > 0 && (
                <Card key={entity} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getEntityColor(entity)}`}>
                        {getEntityIcon(entity)}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold capitalize">{entity}</h2>
                        <p className="text-sm text-muted-foreground font-normal">
                          {parsedData[entity].length} records
                          {getErrorsFor(entity).length > 0 && (
                            <span className="text-red-600 ml-2">
                              • {getErrorsFor(entity).length} errors
                            </span>
                          )}
                        </p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DataGrid
                      entity={entity}
                      data={parsedData[entity]}
                      onChange={(data) => handleUpdateEntity(entity, data)}
                      validationErrors={getErrorsFor(entity)}
                    />
                  </CardContent>
                </Card>
              )
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {hasData && (
          <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border-0">
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-lg">Ready for the next step?</h3>
              <p className="text-muted-foreground">
                {hasErrors 
                  ? "Fix validation errors before proceeding to rule configuration"
                  : "Your data looks good! Create intelligent scheduling rules with AI assistance"
                }
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                disabled={hasErrors}
                className="px-6"
              >
                <Filter className="h-4 w-4 mr-2" />
                Export Clean Data
              </Button>
              <Button
                asChild
                size="lg"
                disabled={hasErrors}
                className="px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Link href="/rules" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Build Rules with AI
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasData && (
          <Card className="text-center py-16 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent>
              <div className="max-w-md mx-auto">
                <div className="p-4 bg-blue-50 rounded-full w-fit mx-auto mb-6">
                  <FileSpreadsheet className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Data Uploaded Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Upload your Excel file to get started with data validation and AI-powered rule recommendations
                </p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>📊 Supports .xlsx files with multiple sheets</p>
                  <p>🔍 AI-powered data validation and filtering</p>
                  <p>⚡ Intelligent rule recommendations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}