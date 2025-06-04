'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { AssistantRating } from '@/types/assistant-rating';
import type { Message } from '@ai-sdk/react';
import { useChat } from '@ai-sdk/react';
import {
  AlertCircle,
  Copy,
  CornerDownLeft,
  Loader2,
  MoreVertical,
  Send,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  XOctagon,
} from 'lucide-react';
import Link from 'next/link';
import type { ComponentRef, FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react'; // Ensure useState is imported
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';

interface ChatPageClientProps {
  chatId: string;
  initialMessages: Message[];
  initialRatings: Record<string, AssistantRating>;
}

export default function ChatPageClient({
  chatId,
  initialMessages,
  initialRatings,
}: ChatPageClientProps) {
  const [clientTimezone, setClientTimezone] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    setClientTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalUseChatSubmit,
    status,
    error,
    setMessages,
    stop,
    reload,
  } = useChat({
    api: '/api/ai/chat',
    id: chatId,
    sendExtraMessageFields: true,
    initialMessages: initialMessages,
    experimental_prepareRequestBody(data) {
      return {
        message: data.messages[data.messages.length - 1],
        id: data.id,
        ...(clientTimezone && { timezone: clientTimezone }),
      };
    },
    onError: (err) => {
      console.error('Chat API error:', err);
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${err.message || 'Could not get a response.'}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    },
  });
  const [ratedMessages, setRatedMessages] = useState(initialRatings);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<ComponentRef<typeof ScrollArea>>(null);
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);
  const [forceScrollToBottom, setForceScrollToBottom] = useState(true);

  // Function to handle copying message content
  const handleCopyMessage = async (content: string) => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      console.log('Message copied to clipboard');
      toast.success('Message copied to clipboard');
    } catch (err) {
      console.error('Failed to copy message:', err);
      toast.error('Failed to copy message');
    }
  };

  // Function to handle deleting a message
  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((msg) => msg.id !== messageId));
    toast.success('Message deleted');
  };

  useEffect(() => {
    const viewportElement = scrollAreaRef.current?.querySelector(
      '[data-radix-scroll-area-viewport]'
    ) as HTMLDivElement | null;
    if (!viewportElement) return;

    const handleScroll = () => {
      const { scrollHeight, scrollTop, clientHeight } = viewportElement;
      const atBottom = scrollHeight - scrollTop - clientHeight < 30;
      setIsUserAtBottom(atBottom);
    };

    viewportElement.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      viewportElement.removeEventListener('scroll', handleScroll);
    };
  }, [scrollAreaRef]);

  useEffect(() => {
    if (messagesEndRef.current) {
      if (forceScrollToBottom) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        setForceScrollToBottom(false); // Reset flag
      } else if (isUserAtBottom) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages, status, isUserAtBottom, forceScrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
    setForceScrollToBottom(true);
  }, [chatId]);

  const handleRating = (messageId: string, rating: 'up' | 'down') => {
    setRatedMessages((prev) => ({
      ...prev,
      [messageId]: prev[messageId] === rating ? null : rating, // Toggle or set new rating
    }));
    // In a real application, you would send this feedback to your backend:
    // sendFeedbackToBackend(messageId, rating);
    console.log(`Rated message ${messageId} as ${rating}`);
  };

  // Wrapped submit handler
  const handleLocalSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() && messages.length > 0 && error) {
      reload();
      return;
    }
    if (!input.trim()) return;

    originalUseChatSubmit(e); // Call the original submit handler from useChat

    setForceScrollToBottom(true); // Force scroll for user's own message
    setIsUserAtBottom(true); // Assume user wants to be at bottom after sending
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Section - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full p-4">
          <div className="space-y-4 mx-auto">
            {messages.map((m) => {
              const textContent = m.parts.some((part) => part.type === 'text')
                ? m.parts
                    .filter((part) => part.type === 'text')
                    .map((part) => (part as { text: string }).text)
                    .join('')
                : m.content;

              const sourceParts =
                m.role === 'assistant' && m.parts
                  ? (m.parts.filter((part) => part.type === 'source') as {
                      source: { id: string; url: string; title?: string };
                    }[])
                  : undefined;

              return (
                <div
                  key={m.id}
                  className={cn(
                    'flex flex-col',
                    m.role === 'user' ? 'items-end' : 'items-start'
                  )}
                >
                  <div
                    className={cn(
                      'group relative max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl p-3 rounded-xl shadow-md text-sm md:text-base',
                      m.role === 'user'
                        ? 'bg-blue-600 text-white self-end rounded-br-none'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 self-start rounded-bl-none'
                    )}
                  >
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {textContent}
                      </ReactMarkdown>
                    </div>
                    {sourceParts && sourceParts.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                        <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Sources:
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {sourceParts.map((part) => (
                            <Link
                              key={`source-${part.source.id}`}
                              href={part.source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-1.5 py-0.5 rounded-md text-blue-600 dark:text-blue-400 hover:underline"
                              title={part.source.url}
                            >
                              {part.source.title ??
                                new URL(part.source.url).hostname}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Copy Message Dropdown */}
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              'h-6 w-6 p-0.5 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0', // Adjusted focus style for minimal impact
                              m.role === 'user'
                                ? 'text-white/70 hover:text-white hover:bg-white/20'
                                : 'text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 hover:bg-gray-200/70 dark:hover:bg-gray-700/70'
                            )}
                            aria-label="Message options"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleCopyMessage(textContent)}
                            className="cursor-pointer"
                          >
                            <Copy className="mr-2 h-3.5 w-3.5" />
                            <span>Copy</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteMessage(m.id)}
                            className="cursor-pointer text-red-600 dark:text-red-400 hover:!text-red-600 dark:hover:!text-red-400 focus:!text-red-600 dark:focus:!text-red-400"
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  {m.role === 'assistant' && (
                    <div className="mt-1.5 flex space-x-1 self-start">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          'h-7 w-7 rounded-full',
                          ratedMessages[m.id] === 'up'
                            ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-700/50'
                            : 'text-gray-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        )}
                        onClick={() => handleRating(m.id, 'up')}
                        aria-label="Rate positive"
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          'h-7 w-7 rounded-full',
                          ratedMessages[m.id] === 'down'
                            ? 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-700/50'
                            : 'text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        )}
                        onClick={() => handleRating(m.id, 'down')}
                        aria-label="Rate negative"
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div ref={messagesEndRef} className="h-0" />
        </ScrollArea>
      </div>

      {error && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <Alert variant="destructive" className="rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Chat Error</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              {error.message ||
                'An unexpected error occurred. Please try again.'}
              <Button
                onClick={() => reload()}
                variant="secondary"
                size="sm"
                disabled={status !== 'ready' && status !== 'error'}
              >
                <CornerDownLeft className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Input Section - Fixed at Bottom */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4 shadow-top-light dark:shadow-top-dark">
        <form
          className="flex items-center space-x-2 sm:space-x-3"
          onSubmit={handleLocalSubmit}
        >
          <Input
            ref={inputRef}
            type="text"
            placeholder={
              error ? 'Retry or type a new message...' : 'Send a message...'
            }
            value={input}
            onChange={handleInputChange}
            disabled={status === 'submitted' || status === 'streaming'} // Disabled during submission/streaming
            className="flex-grow text-sm md:text-base rounded-full px-4 py-3 focus-visible:ring-1 focus-visible:ring-blue-500 dark:bg-gray-700 dark:text-gray-50 dark:placeholder-gray-400"
            autoFocus
            aria-label="Chat input"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (
                  inputRef.current &&
                  inputRef.current.form &&
                  !e.nativeEvent.isComposing
                ) {
                  const form = inputRef.current.form;
                  form.dispatchEvent(
                    new Event('submit', { cancelable: true, bubbles: true })
                  );
                }
              }
            }}
          />
          {status === 'streaming' ? (
            <div>
              <Button
                type="button"
                onClick={stop}
                size="icon"
                className="rounded-full w-11 h-11"
                aria-label="Stop generation"
              >
                <XOctagon className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button
              type="submit"
              size="icon"
              className="rounded-full w-11 h-11 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!input.trim() || status !== 'ready'}
            >
              {status === 'submitted' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
