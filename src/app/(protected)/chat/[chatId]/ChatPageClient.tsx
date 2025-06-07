'use client';

import {
  deleteMessage as deleteMessageAction,
  updateRating,
} from '@/actions/chat.action';
import { DashboardCalendarItem } from '@/components/dashboard/DashboardCalendarItem';
import { DashboardTodoItem } from '@/components/dashboard/DashboardTodoItem';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { AssistantRating } from '@/types/assistant-rating';
import type { Message } from '@ai-sdk/react';
import { useChat } from '@ai-sdk/react';
import type { CalendarEvent, Todo } from '@prisma/client';
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
import type { ComponentRef, FormEvent } from 'react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';

type CreateTodoToolResultItem = Pick<
  Todo,
  'date' | 'description' | 'dueTime' | 'status' | 'title'
>;

interface CreateTodoToolResult {
  success: boolean;
  todo?: CreateTodoToolResultItem;
  error?: string;
}

type CreateCalendarEventToolResultItem = Pick<
  CalendarEvent,
  'title' | 'start' | 'end'
>;

interface CreateCalendarEventToolResult {
  success: boolean;
  event?: CreateCalendarEventToolResultItem;
  error?: string;
}

interface ChatPageClientProps {
  chatId: string;
  initialMessages: Message[];
  initialRatings: Record<string, AssistantRating>;
}

interface ChatMessageItemProps {
  message: Message;
  isUser: boolean;
  textContent: string;
  rating: AssistantRating | null;
  onCopy: (content: string) => void;
  onDelete: (messageId: string) => void;
  onRate: (messageId: string, rating: 'up' | 'down' | null) => void;
}

const ChatMessageItem = memo(
  ({
    message,
    isUser,
    textContent,
    rating,
    onCopy,
    onDelete,
    onRate,
  }: ChatMessageItemProps) => {
    return (
      <div
        className={cn('flex flex-col', isUser ? 'items-end' : 'items-start')}
      >
        <div
          className={cn(
            'group relative max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl p-3 rounded-xl shadow-md text-sm md:text-base',
            isUser
              ? 'bg-blue-600 text-white self-end rounded-br-none'
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 self-start rounded-bl-none'
          )}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none break-words">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {textContent}
            </ReactMarkdown>
          </div>
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-6 w-6 p-0.5 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0',
                    isUser
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
                  onClick={() => onCopy(textContent)}
                  className="cursor-pointer"
                >
                  <Copy className="mr-2 h-3.5 w-3.5" />
                  <span>Copy</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(message.id)}
                  className="cursor-pointer text-red-600 dark:text-red-400 hover:!text-red-600 dark:hover:!text-red-400 focus:!text-red-600 dark:focus:!text-red-400"
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {/* Render Tool Invocations */}
        {message.parts &&
          message.parts.some((f) => f.type === 'tool-invocation') && (
            <div className="mt-2 space-y-2">
              {message.parts
                .filter((f) => f.type === 'tool-invocation')
                .map((part) => {
                  const { toolName, toolCallId, state } = part.toolInvocation;

                  if (toolName === 'create_todo') {
                    if (state === 'result') {
                      const result = part.toolInvocation
                        .result as CreateTodoToolResult;
                      if (result.success && result.todo) {
                        return (
                          <div
                            key={toolCallId}
                            className="p-3 border rounded-lg bg-muted/30 dark:bg-muted/20 shadow-sm"
                          >
                            <p className="text-xs font-semibold text-muted-foreground mb-2">
                              Todo Created:
                            </p>
                            <div className="space-y-2">
                              <DashboardTodoItem todo={result.todo} />
                            </div>
                          </div>
                        );
                      } else if (result.success && result.todo) {
                        return (
                          <div
                            key={toolCallId}
                            className="p-3 border rounded-lg bg-muted/30 dark:bg-muted/20 shadow-sm"
                          >
                            <p className="text-xs font-semibold text-muted-foreground mb-2">
                              Todos Created:
                            </p>
                            <div className="space-y-2">
                              <DashboardTodoItem todo={result.todo} />
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div
                            key={toolCallId}
                            className="mt-2 p-2 text-xs border rounded-md bg-destructive/10 border-destructive/30 text-destructive"
                          >
                            <span className="font-medium">
                              Error creating todo:
                            </span>{' '}
                            {result.error || 'An unknown error occurred.'}
                          </div>
                        );
                      }
                    } else {
                      // 'pending' or other states
                      return (
                        <div
                          key={toolCallId}
                          className="mt-2 flex items-center space-x-2 text-xs p-2 border rounded-md bg-muted/30 dark:bg-muted/20 text-muted-foreground"
                        >
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span>Creating todo(s)...</span>
                        </div>
                      );
                    }
                  } else if (toolName === 'create_calendar_event') {
                    if (state === 'result') {
                      const result = part.toolInvocation
                        .result as CreateCalendarEventToolResult;
                      if (result.success && result.event) {
                        return (
                          <div
                            key={toolCallId}
                            className="p-3 border rounded-lg bg-muted/30 dark:bg-muted/20 shadow-sm"
                          >
                            <p className="text-xs font-semibold text-muted-foreground mb-2">
                              Calendar Event Created:
                            </p>
                            {/* Ensure result.event is compatible with DashboardCalendarItem props */}
                            <DashboardCalendarItem event={result.event} />
                          </div>
                        );
                      } else {
                        return (
                          <div
                            key={toolCallId}
                            className="mt-2 p-2 text-xs border rounded-md bg-destructive/10 border-destructive/30 text-destructive"
                          >
                            <span className="font-medium">
                              Error creating calendar event:
                            </span>{' '}
                            {result.error || 'An unknown error occurred.'}
                          </div>
                        );
                      }
                    } else {
                      // 'pending' or other states
                      return (
                        <div
                          key={toolCallId}
                          className="mt-2 flex items-center space-x-2 text-xs p-2 border rounded-md bg-muted/30 dark:bg-muted/20 text-muted-foreground"
                        >
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span>Creating calendar event...</span>
                        </div>
                      );
                    }
                  }
                  // Add handling for other tools here if needed in the future
                  return null;
                })}
            </div>
          )}
        {message.role === 'assistant' && (
          <div className="mt-1.5 flex space-x-1 self-start">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-7 w-7 rounded-full',
                rating === 'up'
                  ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-700/50'
                  : 'text-gray-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
              onClick={() => onRate(message.id, 'up')}
              aria-label="Rate positive"
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-7 w-7 rounded-full',
                rating === 'down'
                  ? 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-700/50'
                  : 'text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
              onClick={() => onRate(message.id, 'down')}
              aria-label="Rate negative"
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }
);
ChatMessageItem.displayName = 'ChatMessageItem';

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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<ComponentRef<typeof ScrollArea>>(null);
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);
  const [forceScrollToBottom, setForceScrollToBottom] = useState(true);

  // Function to handle copying message content
  const handleCopyMessage = useCallback(async (content: string) => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content.replace(/\n{2,}/g, '\n'));
      console.log('Message copied to clipboard');
      toast.success('Message copied to clipboard');
    } catch (err) {
      console.error('Failed to copy message:', err);
      toast.error('Failed to copy message');
    }
  }, []);

  const handleDeleteMessage = useCallback(
    async (messageId: string) => {
      const originalMessages = [...messages];
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== messageId)
      );
      toast.info('Deleting message...');

      const result = await deleteMessageAction(chatId, messageId);

      if (result.success) {
        toast.success('Message deleted successfully');
      } else {
        setMessages(originalMessages);
        toast.error(result.error || 'Failed to delete message');
        console.error('Failed to delete message:', result.error);
      }
    },
    [chatId, messages, setMessages]
  );

  useEffect(() => {
    const viewportElement = scrollAreaRef.current?.querySelector(
      '[data-radix-scroll-area-viewport]'
    ) as HTMLDivElement | null;
    if (!viewportElement) return;

    const handleScroll = () => {
      const { scrollHeight, scrollTop, clientHeight } = viewportElement;
      const atBottom = scrollHeight - scrollTop - clientHeight < 50;
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
        setForceScrollToBottom(false);
      } else if (isUserAtBottom) {
        messagesEndRef.current.scrollIntoView({
          behavior: status === 'streaming' ? 'auto' : 'smooth',
        });
      }
    }
  }, [messages, status, isUserAtBottom, forceScrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
    setForceScrollToBottom(true);
  }, [chatId]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'; // Reset height
      const scrollHeight = inputRef.current.scrollHeight;
      // Max height for textarea is 200px (from max-h-[200px] class)
      // min-h-[44px] corresponds to roughly one line.
      // We set height directly to scrollHeight, capped by CSS max-height.
      inputRef.current.style.height = `${scrollHeight}px`;
    }
  }, [input]);

  const handleRating = useCallback(
    async (messageId: string, rating: 'up' | 'down' | null) => {
      const currentRating = ratedMessages[messageId];
      const newRating = currentRating === rating ? null : rating;

      setRatedMessages((prev) => ({
        ...prev,
        [messageId]: newRating,
      }));

      const result = await updateRating(chatId, messageId, newRating);
      if (!result?.success) {
        toast.error('Failed to update rating');
        setRatedMessages((prev) => ({
          ...prev,
          [messageId]: currentRating,
        }));
        return;
      }
      console.log(`Rated message ${messageId} as ${newRating}`);
    },
    [chatId, ratedMessages]
  );

  // Wrapped submit handler
  const handleLocalSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() && messages.length > 0 && error) {
      reload();
      return;
    }
    if (!input.trim()) return;

    originalUseChatSubmit(e);

    setForceScrollToBottom(true);
    setIsUserAtBottom(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Section - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full p-4">
          <div className="space-y-4 mx-auto">
            {messages.map((m) => {
              let textContent = m.parts.some((part) => part.type === 'text')
                ? m.parts
                    .filter((part) => part.type === 'text')
                    .map((part) => (part as { text: string }).text)
                    .join('')
                : m.content;

              if (m.role === 'user') {
                textContent = textContent.replace(/\n/g, '\n\n');
              }

              return (
                <ChatMessageItem
                  key={m.id}
                  message={m}
                  isUser={m.role === 'user'}
                  textContent={textContent}
                  rating={ratedMessages[m.id] || null}
                  onCopy={handleCopyMessage}
                  onDelete={handleDeleteMessage}
                  onRate={handleRating}
                />
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
          className="flex items-end space-x-2 sm:space-x-3"
          onSubmit={handleLocalSubmit}
        >
          <Textarea
            ref={inputRef}
            placeholder={
              error ? 'Retry or type a new message...' : 'Send a message...'
            }
            value={input}
            onChange={handleInputChange}
            disabled={status === 'submitted' || status === 'streaming'}
            className="flex-grow text-sm md:text-base rounded-lg px-4 py-2.5 min-h-[44px] max-h-[100px] resize-none overflow-y-hidden focus-visible:ring-1 focus-visible:ring-blue-500 dark:bg-gray-700 dark:text-gray-50 dark:placeholder-gray-400"
            autoFocus
            aria-label="Chat input"
            rows={1}
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
