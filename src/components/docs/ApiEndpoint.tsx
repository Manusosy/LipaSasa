import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ApiEndpointProps {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
}

export const ApiEndpoint: React.FC<ApiEndpointProps> = ({ method, path, description }) => {
  const methodColors = {
    GET: 'bg-blue-500 hover:bg-blue-600',
    POST: 'bg-green-500 hover:bg-green-600',
    PUT: 'bg-yellow-500 hover:bg-yellow-600',
    DELETE: 'bg-red-500 hover:bg-red-600',
    PATCH: 'bg-purple-500 hover:bg-purple-600',
  };

  return (
    <div className="border border-border rounded-lg p-6 bg-card mb-6">
      <div className="flex items-start gap-4 mb-4">
        <Badge className={`${methodColors[method]} text-white font-mono font-semibold`}>
          {method}
        </Badge>
        <code className="text-lg font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded flex-1">
          {path}
        </code>
      </div>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

