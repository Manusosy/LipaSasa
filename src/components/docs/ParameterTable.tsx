import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default?: string;
}

interface ParameterTableProps {
  parameters: Parameter[];
  title?: string;
}

export const ParameterTable: React.FC<ParameterTableProps> = ({ parameters, title = 'Parameters' }) => {
  if (parameters.length === 0) {
    return null;
  }

  return (
    <div className="my-6">
      <h4 className="text-lg font-semibold mb-4">{title}</h4>
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Parameter</TableHead>
              <TableHead className="w-[120px]">Type</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parameters.map((param) => (
              <TableRow key={param.name}>
                <TableCell className="font-mono text-sm">
                  <div className="flex items-center gap-2">
                    <code className="text-primary">{param.name}</code>
                    {param.required && (
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    )}
                    {!param.required && (
                      <Badge variant="secondary" className="text-xs">Optional</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {param.type}
                </TableCell>
                <TableCell className="text-sm">
                  {param.description}
                  {param.default && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Default: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{param.default}</code>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

