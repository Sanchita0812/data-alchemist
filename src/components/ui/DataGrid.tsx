"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DataGridProps {
  data: any[];
  onChange: (updatedData: any[]) => void;
}

export default function DataGrid({ data, onChange }: DataGridProps) {
  if (!data || data.length === 0) return null;

  const keys = Object.keys(data[0]);

  const handleChange = (rowIdx: number, key: string, value: string) => {
    const updated = [...data];
    updated[rowIdx] = { ...updated[rowIdx], [key]: value };
    onChange(updated);
  };

  return (
    <div className="overflow-auto border rounded-lg mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            {keys.map((key) => (
              <TableHead key={key} className="capitalize">
                {key}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIdx) => (
            <TableRow key={rowIdx}>
              {keys.map((key) => (
                <TableCell key={key}>
                  <Input
                    value={row[key] ?? ""}
                    onChange={(e) => handleChange(rowIdx, key, e.target.value)}
                    className="text-sm"
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
