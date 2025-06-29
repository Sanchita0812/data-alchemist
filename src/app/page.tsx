"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import FileUploader, { type FileType } from "@/components/FileUpload/FileUploader";
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

  const handleDataParsed = (type: FileType, data: any[]) => {
    setParsedData((prev) => ({ ...prev, [type]: data }));
    console.log(`Parsed ${type} data:`, data);
  };

  const updateClientData = (updated: any[]) =>
    setParsedData((prev) => ({ ...prev, clients: updated }));

  const updateWorkerData = (updated: any[]) =>
    setParsedData((prev) => ({ ...prev, workers: updated }));

  const updateTaskData = (updated: any[]) =>
    setParsedData((prev) => ({ ...prev, tasks: updated }));

  return (
    <div className="min-h-screen p-6 bg-muted/50">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">📂 Upload Entity Files</h1>
        <p className="text-muted-foreground mt-1">
          Upload your CSV or XLSX files for Clients, Workers, and Tasks. We'll parse and validate the data.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <Card className="shadow-md col-span-1">
          <CardContent className="p-4">
            <h2 className="text-lg font-medium mb-2">Upload Clients</h2>
            <FileUploader type="clients" onDataParsed={handleDataParsed} />
            <DataGrid data={parsedData.clients} onChange={updateClientData} />
          </CardContent>
        </Card>

        <Card className="shadow-md col-span-1">
          <CardContent className="p-4">
            <h2 className="text-lg font-medium mb-2">Upload Workers</h2>
            <FileUploader type="workers" onDataParsed={handleDataParsed} />
            <DataGrid data={parsedData.workers} onChange={updateWorkerData} />
          </CardContent>
        </Card>

        <Card className="shadow-md col-span-1">
          <CardContent className="p-4">
            <h2 className="text-lg font-medium mb-2">Upload Tasks</h2>
            <FileUploader type="tasks" onDataParsed={handleDataParsed} />
            <DataGrid data={parsedData.tasks} onChange={updateTaskData} />
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

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
