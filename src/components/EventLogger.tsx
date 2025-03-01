'use client';

import { useEffect, useState, useRef } from 'react';
import { socket, ResearchProgressEvent } from '@/lib/socket';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Card } from './ui/card';
import { Terminal, X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';

export function EventLogger() {
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState<ResearchProgressEvent[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleProgress = (event: ResearchProgressEvent) => {
      setEvents((prev) => [...prev, event]);
      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
      }
      setTimeout(scrollToBottom, 100);
    };

    socket.on('progress', handleProgress);

    return () => {
      socket.off('progress', handleProgress);
    };
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
    setTimeout(scrollToBottom, 100);
  };

  const getEventIcon = (type: ResearchProgressEvent['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const formatData = (data: any) => {
    if (!data) return null;
    
    if (typeof data === 'string') return data;
    
    if (data instanceof Error) {
      return `Error: ${data.message}`;
    }
    
    if (typeof data === 'object') {
      if (data.query) return `Processing query: ${data.query}`;
      if (data.message) return data.message;
      if (data.statusCode) return `Status: ${data.statusCode}`;
    }
    
    return null;
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 flex items-center gap-2">
        <Button
          onClick={handleOpen}
          size="icon"
          className="bg-blue-600/90 hover:bg-blue-600 relative rounded-full w-12 h-12 shadow-lg shadow-blue-500/20 backdrop-blur-sm border border-blue-500/20 transition-all duration-200 hover:scale-105"
        >
          <Terminal className="w-5 h-5 text-blue-100" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-white text-blue-600 text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
              {unreadCount}
            </span>
          )}
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[32rem] bg-zinc-900/95 backdrop-blur-xl text-white shadow-2xl border border-zinc-800/50 rounded-xl overflow-hidden">
      <div className="flex justify-between items-center p-4 bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 border-b border-zinc-800/50">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600/20 p-1.5 rounded-md">
            <Terminal className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="font-semibold text-zinc-100">Logi badania</h3>
        </div>
        <Button
          onClick={() => setIsOpen(false)}
          size="icon"
          variant="ghost"
          className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-full w-8 h-8"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      <ScrollArea className="h-[calc(32rem-4rem)]">
        <div className="space-y-2 p-4">
          {events.map((event, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border backdrop-blur-sm transition-colors duration-200 ${
                event.type === 'error'
                  ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10'
                  : event.type === 'success'
                  ? 'bg-green-500/5 border-green-500/20 hover:bg-green-500/10'
                  : 'bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-1 rounded-md ${
                  event.type === 'error'
                    ? 'bg-red-500/10'
                    : event.type === 'success'
                    ? 'bg-green-500/10'
                    : 'bg-blue-500/10'
                }`}>
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-medium text-sm text-zinc-100 whitespace-normal break-words">{event.message}</span>
                    <span className="text-[10px] text-zinc-500 bg-zinc-900/50 px-1.5 py-0.5 rounded-full shrink-0">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {event.data && formatData(event.data) && (
                    <pre className="mt-2 text-xs font-mono bg-zinc-900/50 text-zinc-300 rounded-lg p-3 whitespace-pre-wrap break-words border border-zinc-800/50">
                      {formatData(event.data)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </ScrollArea>
    </Card>
  );
} 