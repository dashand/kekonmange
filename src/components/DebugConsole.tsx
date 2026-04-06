
import React, { useState, useEffect } from 'react';
import { Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

type LogEntry = {
  id: number;
  type: 'log' | 'error' | 'warn';
  message: string;
  timestamp: string;
};

const DebugConsole = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
    };

    const addLog = (type: 'log' | 'error' | 'warn', args: any[]) => {
      const message = args
        .map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        )
        .join(' ');

      setLogs(prev => [...prev, {
        id: Date.now(),
        type,
        message,
        timestamp: new Date().toLocaleTimeString()
      }]);
    };

    console.log = (...args) => {
      originalConsole.log(...args);
      addLog('log', args);
    };

    console.error = (...args) => {
      originalConsole.error(...args);
      addLog('error', args);
    };

    console.warn = (...args) => {
      originalConsole.warn(...args);
      addLog('warn', args);
    };

    return () => {
      console.log = originalConsole.log;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
    };
  }, []);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-4 left-4 z-50 opacity-50 hover:opacity-100 transition-opacity"
        >
          <Bug className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Console de débogage</SheetTitle>
          <SheetDescription>
            Affiche les logs de console et les erreurs pour faciliter le débogage
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          <div className="space-y-2 pr-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`p-2 rounded font-mono text-sm ${
                  log.type === 'error' 
                    ? 'bg-red-500/10 text-red-600' 
                    : log.type === 'warn'
                    ? 'bg-yellow-500/10 text-yellow-600'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                <div className="text-xs opacity-50 mb-1">{log.timestamp}</div>
                <div className="whitespace-pre-wrap">{log.message}</div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-center text-muted-foreground p-4">
                Aucun log pour le moment
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default DebugConsole;
