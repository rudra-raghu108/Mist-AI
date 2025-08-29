import React, { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSend, 
  disabled = false, 
  placeholder = "Ask me anything about SRM or any topic..." 
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSend(trimmedMessage);
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="sticky bottom-0 bg-gradient-chat/80 backdrop-blur-lg border-t border-border p-4">
      <div className="mx-auto max-w-4xl">
        <div className="relative flex items-end gap-3 rounded-2xl bg-card p-3 shadow-medium border border-border">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "min-h-[60px] max-h-[120px] resize-none border-0 bg-transparent",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "placeholder:text-muted-foreground"
            )}
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            variant="hero"
            size="sm"
            className="self-end px-4 py-2"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};