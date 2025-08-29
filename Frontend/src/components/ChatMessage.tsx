import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  onCopy?: (content: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onCopy }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      onCopy?.(message.content);
    }
  };

  const isUser = message.role === 'user';

  return (
    <div className={cn(
      "group relative flex w-full gap-4 rounded-2xl p-6 transition-all duration-300",
      "hover:shadow-medium hover:-translate-y-1",
      isUser 
        ? "ml-auto max-w-[80%] bg-gradient-primary text-primary-foreground shadow-accent" 
        : "mr-auto max-w-[80%] bg-card text-card-foreground shadow-soft border border-border"
    )}>
      <div className="flex-shrink-0">
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full text-lg font-semibold",
          "transition-all duration-300 group-hover:scale-110",
          isUser 
            ? "bg-primary-foreground/20 text-primary-foreground" 
            : "bg-gradient-secondary text-secondary-foreground"
        )}>
          {isUser ? "👤" : "🎓"}
        </div>
      </div>
      
      <div className="flex-1 space-y-2">
        <div className="text-sm font-medium opacity-70">
          {isUser ? "You" : "MIST AI"}
        </div>
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
        </div>
        <div className="text-xs opacity-50">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className={cn(
          "absolute right-2 top-2 h-8 w-8 p-0 opacity-0 transition-all duration-200",
          "group-hover:opacity-100 hover:bg-background/10",
          isCopied && "bg-green-500 text-white hover:bg-green-600"
        )}
      >
        {isCopied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};