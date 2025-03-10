/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { sendMessage } from '@/actions/ai';
import { useState, useRef, useEffect } from 'react';
import type { MessageSchema } from '@/schemas/message.schema';
import { useForm } from 'react-hook-form';
import { getUserChatHistory } from '@/actions/message.action';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Send } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface FormValues {
  message: string;
}

export default function ChatBotPage() {
  const [messages, setMessages] = useState<MessageSchema[]>([]);
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

    try {
      const response = await sendMessage(session, userMessage);

      if (response.success) {
        setMessages((prev) => [...prev, response.data]);
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
    }
  };

  return (
    <>
      {messages.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">
            No messages yet. Start a conversation!
          </p>
        </div>
      ) : (
        <>
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
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
        <Input
          {...register('message')}
          placeholder="Type your message..."
          disabled={isSubmitting || !isAuthenticated}
          className="flex-1"
        />
        <Button type="submit" disabled={isSubmitting || !isAuthenticated}>
          {isSubmitting ? (
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
    </>
  );
}
