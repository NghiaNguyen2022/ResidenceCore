import * as React from "react";
import { cn } from "@/lib/utils";
import {
      Table,
      TableBody,
      TableCell,
      TableHead,
      TableHeader,
      TableRow,
} from "@/components/ui/table";
import { LoadingState } from "../feedback/LoadingState";
import { EmptyState } from "../feedback/EmptyState";

export interface DataTableColumn<T> {
      key: string;
      header: React.ReactNode;
      cell: (row: T, index: number) => React.ReactNode;
      className?: string;
      headerClassName?: string;
}

interface DataTableProps<T> {
      columns: DataTableColumn<T>[];
      data: T[];
      loading?: boolean;
      emptyMessage?: string;
      emptyDescription?: string;
      className?: string;
      rowKey: (row: T, index: number) => string | number;
      onRowClick?: (row: T) => void;
}

export function DataTable<T>({
      columns,
      data,
      loading,
      emptyMessage = "Không có dữ liệu",
      emptyDescription,
      className,
      rowKey,
      onRowClick,
}: DataTableProps<T>) {
      if (loading) {
            return <LoadingState />;
      }

      return (
            <div className={cn("rounded-md border border-slate-200 overflow-hidden", className)}>
                  <Table>
                        <TableHeader>
                              <TableRow className="bg-slate-50">
                                    {columns.map((col) => (
                                          <TableHead
                                                key={col.key}
                                                className={cn("text-slate-600 font-medium text-xs uppercase tracking-wide", col.headerClassName)}
                                          >
                                                {col.header}
                                          </TableHead>
                                    ))}
                              </TableRow>
                        </TableHeader>
                        <TableBody>
                              {data.length === 0 ? (
                                    <TableRow>
                                          <TableCell colSpan={columns.length} className="py-12 text-center">
                                                <EmptyState
                                                      title={emptyMessage}
                                                      description={emptyDescription}
                                                />
                                          </TableCell>
                                    </TableRow>
                              ) : (
                                    data.map((row, index) => (
                                          <TableRow
                                                key={rowKey(row, index)}
                                                className={cn(
                                                      "hover:bg-slate-50 transition-colors",
                                                      onRowClick && "cursor-pointer"
                                                )}
                                                onClick={() => onRowClick?.(row)}
                                          >
                                                {columns.map((col) => (
                                                      <TableCell key={col.key} className={cn("py-3", col.className)}>
                                                            {col.cell(row, index)}
                                                      </TableCell>
                                                ))}
                                          </TableRow>
                                    ))
                              )}
                        </TableBody>
                  </Table>
            </div>
      );
}
