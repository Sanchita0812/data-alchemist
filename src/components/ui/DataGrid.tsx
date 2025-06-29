"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ValidationError } from "@/lib/validateData";
import classNames from "classnames";

interface DataGridProps {
  data: any[];
  onChange: (updated: any[]) => void;
  validationErrors?: ValidationError[];
  entity: "clients" | "workers" | "tasks";
}

const DataGrid: React.FC<DataGridProps> = ({
  data,
  onChange,
  validationErrors = [],
  entity,
}) => {
  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  const handleCellChange = (rowIndex: number, key: string, value: string) => {
    const updated = [...data];
    updated[rowIndex] = { ...updated[rowIndex], [key]: value };
    onChange(updated);
  };

  const getErrorForCell = (rowIndex: number, field: string) =>
    validationErrors.find(
      (err) =>
        err.rowIndex === rowIndex &&
        err.field === field &&
        err.entity === entity
    );

  return (
    <TooltipProvider>
      <div className="overflow-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="text-left px-3 py-2 font-medium text-muted-foreground whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t">
                {columns.map((col) => {
                  const error = getErrorForCell(rowIndex, col);
                  const hasError = !!error;

                  const input = (
                    <Input
                      value={row[col] ?? ""}
                      onChange={(e) =>
                        handleCellChange(rowIndex, col, e.target.value)
                      }
                      className={classNames("text-sm w-full", {
                        "border-red-500 bg-red-50": hasError,
                      })}
                    />
                  );

                  return (
                    <td key={col} className="p-2 align-top">
                      {hasError ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{input}</TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[200px]">
                            <span className="text-xs text-red-700">
                              ⚠ {error.message}
                            </span>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        input
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  );
};

export default DataGrid;
