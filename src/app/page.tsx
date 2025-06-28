"use client";

import React from "react";
import FileUploader, { type FileType } from "@/components/FileUpload/FileUploader";

export default function HomePage() {
  const handleDataParsed = (type: FileType, data: any[]) => {
    console.log(`Parsed ${type} data:`, data);
  };

  return (
    <div>
      <h1>My App</h1>
      <FileUploader 
        type="clients" 
        onDataParsed={handleDataParsed}
      />
    </div>
  );
}