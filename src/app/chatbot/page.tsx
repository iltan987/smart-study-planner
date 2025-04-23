'use client';

import { sendMessage } from '@/actions/ai';
import { getTextHistory } from '@/actions/history.action';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ContentType, TextContentRole } from '@/generated/prisma-client';
import {
  type TextContentSchema,
  type UserTextSchema,
} from '@/schemas/history.schema';
import { Bot, Send } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function ChatBotPage() {
  const [messages, setMessages] = useState<TextContentSchema[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch chat history on mount
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    getTextHistory()
      .then((history) => {
        if (history.success) {
          setMessages(history.data);
        }
      })
      .catch((error) => {
        console.error('Error fetching chat history:', error);
      });
  }, [isAuthenticated, session?.user.id]);

  const onSubmit = async () => {
    if (!isAuthenticated) return;
    if (!inputValue.trim()) return;

    const userMessage: UserTextSchema = {
      text: inputValue,
      timeSent: new Date(),
      type: ContentType.text,
      role: TextContentRole.user,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await sendMessage(session, userMessage);

      if (response.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: TextContentRole.model,
            text: response.data.text,
            timeSent: response.data.timeSent,
            type: ContentType.text,
          },
        ]);
      } else {
        console.error('Error sending message:', response.error);
        toast.error('Error', {
          description: 'Sorry, something went wrong. Please try again later.',
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error', {
        description: 'Sorry, something went wrong. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="p-4 border-b shadow-sm bg-card flex items-center">
        <Avatar className="h-10 w-10 mr-3 flex items-center justify-center bg-primary/10">
          <Bot className="h-6 w-6 text-primary" />
        </Avatar>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Support Bot</h1>
          <p className="text-sm text-muted-foreground">Always here to help</p>
        </div>
      </div>

      {/* Messages container - only this part is scrollable */}
      <div
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground text-lg">How can I help you?</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === TextContentRole.user
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              <Card
                className={`max-w-3/4 p-3 ${
                  msg.role === TextContentRole.user ? 'bg-primary' : 'bg-accent'
                }`}
              >
                <div className="flex items-start">
                  {msg.role === TextContentRole.model && (
                    <Avatar className="h-8 w-8 mr-2 flex items-center justify-center flex-shrink-0 bg-primary/10">
                      <Bot className="h-5 w-5 text-primary" />
                    </Avatar>
                  )}
                  <div className="w-full overflow-hidden">
                    <p
                      className={`break-words whitespace-normal text-left ${
                        msg.role === TextContentRole.user
                          ? 'text-primary-foreground'
                          : 'text-accent-foreground'
                      }`}
                    >
                      {msg.text}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.role === TextContentRole.user
                          ? 'text-right text-primary-foreground/70'
                          : 'text-left text-accent-foreground/70'
                      }`}
                    >
                      {msg.timeSent.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          ))
        )}

        {/* Improved loading indicator with centered bot icon */}
        {isLoading && (
          <div className="flex justify-start">
            <Card className="max-w-3/4 p-3 bg-accent">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2 bg-muted flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-muted-foreground" />
                </Avatar>
                <div className="flex items-center space-x-1 px-2 py-1 bg-muted rounded-full">
                  <div
                    className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse"
                    style={{ animationDuration: '1s', animationDelay: '0s' }}
                  ></div>
                  <div
                    className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse"
                    style={{ animationDuration: '1s', animationDelay: '0.2s' }}
                  ></div>
                  <div
                    className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse"
                    style={{ animationDuration: '1s', animationDelay: '0.4s' }}
                  ></div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area - fixed at the bottom */}
      <div className="border-t p-4 bg-background">
        <div className="flex items-center space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
            disabled={isLoading || !isAuthenticated}
          />
          <Button
            onClick={onSubmit}
            size="icon"
            disabled={isLoading || !isAuthenticated || !inputValue.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
