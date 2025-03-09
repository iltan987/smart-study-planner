/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { sendMessage } from '@/actions/ai';
import { useState, useRef, useEffect } from 'react';
import type { MessageSchema } from '@/schemas/message.schema';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import { getUserChatHistory } from '@/actions/message.action';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send } from 'lucide-react';
import Link from 'next/link';

interface FormValues {
  message: string;
}

export default function ChatBotPage() {
  const [messages, setMessages] = useState<MessageSchema[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { message: '' },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    getUserChatHistory(session?.user.id)
      .then((history) => {
        if (history) {
          setMessages(history);
        }
      })
      .catch((error) => {
        console.error('Error fetching chat history:', error);
      });
  }, [isAuthenticated, session?.user.id]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const onSubmit = async (data: FormValues) => {
    if (!isAuthenticated) return;
    if (!data.message.trim()) return;

    const userMessage: MessageSchema = {
      content: data.message,
      owner: 'user',
      time: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    reset();
    setIsLoading(true);

    try {
      const response = await sendMessage(session, userMessage);

      if (response.success) {
        setMessages((prev) => [...prev, response.data]);
      } else {
        const errorMessage: MessageSchema = {
          content: 'Sorry, something went wrong. Please try again later.',
          owner: 'model',
          time: new Date(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage: MessageSchema = {
        content: 'An error occurred while sending your message.',
        owner: 'model',
        time: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="flex-none mb-4">
        <h1 className="text-2xl font-bold">Chat with AI Assistant</h1>
        <p className="text-muted-foreground">
          Ask me anything about your studies
        </p>
      </div>

      {/* Messages Area - Only this should scroll */}
      <div className="flex-1 overflow-hidden mb-4">
        <Card className="h-full flex flex-col overflow-hidden">
          <ScrollArea className="h-full w-full" type="always">
            <div className="p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">
                    No messages yet. Start a conversation!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, i) => (
                    <div
                      key={msg.time.getTime() + i}
                      className={`flex ${
                        msg.owner === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          msg.owner === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary'
                        }`}
                      >
                        {msg.owner === 'model' ? (
                          <ReactMarkdown
                            components={{
                              p: ({ node, ...props }) => (
                                <p
                                  className="prose prose-sm dark:prose-invert"
                                  {...props}
                                />
                              ),
                              a: ({ node, ...props }) => (
                                <Link
                                  className="text-blue-500 hover:underline"
                                  href={props.href || '#'}
                                  {...props}
                                />
                              ),
                              ul: ({ node, ...props }) => (
                                <ul
                                  className="list-disc pl-6 my-2"
                                  {...props}
                                />
                              ),
                              ol: ({ node, ...props }) => (
                                <ol
                                  className="list-decimal pl-6 my-2"
                                  {...props}
                                />
                              ),
                              li: ({ node, ...props }) => (
                                <li className="my-1" {...props} />
                              ),
                              code: ({ node, inline, ...props }) =>
                                inline ? (
                                  <code
                                    className="bg-muted px-1 py-0.5 rounded text-sm"
                                    {...props}
                                  />
                                ) : (
                                  <code
                                    className="block bg-muted p-2 my-2 rounded-md text-sm overflow-x-auto"
                                    {...props}
                                  />
                                ),
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="flex-none">
        <Card className="p-3 border">
          <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
            <Input
              {...register('message')}
              placeholder="Type your message..."
              disabled={isSubmitting || isLoading || !isAuthenticated}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isSubmitting || isLoading || !isAuthenticated}
            >
              {isLoading || isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </form>
          {!isAuthenticated && (
            <p className="text-sm text-muted-foreground mt-2">
              Please sign in to use the chat.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
