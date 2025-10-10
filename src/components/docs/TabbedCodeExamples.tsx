import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeBlock } from './CodeBlock';

export interface CodeExample {
  language: string;
  label: string;
  code: string;
}

interface TabbedCodeExamplesProps {
  examples: CodeExample[];
  title?: string;
}

export const TabbedCodeExamples: React.FC<TabbedCodeExamplesProps> = ({ examples, title = 'Example Request' }) => {
  const [activeTab, setActiveTab] = useState(examples[0]?.language || 'curl');

  return (
    <div className="my-6">
      <h4 className="text-lg font-semibold mb-4">{title}</h4>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          {examples.map((example) => (
            <TabsTrigger key={example.language} value={example.language}>
              {example.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {examples.map((example) => (
          <TabsContent key={example.language} value={example.language}>
            <CodeBlock code={example.code} language={example.language} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

