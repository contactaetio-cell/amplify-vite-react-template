import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, MessageCircle, Send, Sparkles, User } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  streamDiveDeeper,
  type DiveDeeperStatusStage,
} from '../api/insights';

type DiveDeeperMessage = {
  id: string;
  role: 'user' | 'ai';
  content: string;
};

interface DiveDeeperChatProps {
  displayedQuery: string;
  aiSummary: string;
  selectedInsightIds: string[];
  totalInsightCount: number;
  onBack: () => void;
}

const MAX_SELECTED_INSIGHTS = 8;

const STATUS_LABELS: Partial<Record<DiveDeeperStatusStage, string>> = {
  loading_selected: 'Loading selected insights',
  expanding_graph: 'Expanding related context',
  building_context: 'Building context',
  calling_openai: 'Calling AI model',
  streaming_response: 'Streaming response',
  complete: 'Complete',
};

export function DiveDeeperChat({
  displayedQuery,
  aiSummary,
  selectedInsightIds,
  totalInsightCount,
  onBack,
}: DiveDeeperChatProps) {
  const [messages, setMessages] = useState<DiveDeeperMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [statusStage, setStatusStage] = useState<DiveDeeperStatusStage | undefined>(undefined);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const selectedIds = useMemo(
    () =>
      Array.from(
        new Set(
          selectedInsightIds
            .map((id) => id.trim())
            .filter(Boolean),
        ),
      ).slice(0, MAX_SELECTED_INSIGHTS),
    [selectedInsightIds],
  );
  const hasSelectionOverflow = totalInsightCount > selectedIds.length;

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isStreaming]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleBack = () => {
    abortControllerRef.current?.abort();
    onBack();
  };

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isStreaming || selectedIds.length === 0) return;

    const userMessageId = crypto.randomUUID();
    const aiMessageId = crypto.randomUUID();
    const query = buildQueryWithHistory(messages, question);
    setStreamError(null);
    setStatusStage(undefined);
    setInput('');
    setIsStreaming(true);
    setMessages((prev) => [
      ...prev,
      { id: userMessageId, role: 'user', content: question },
      { id: aiMessageId, role: 'ai', content: '' },
    ]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const finalEvent = await streamDiveDeeper({
        selectedInsightIds: selectedIds,
        query,
        signal: controller.signal,
        onStatus: (event) => {
          setStatusStage(event.stage);
        },
        onToken: (event) => {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === aiMessageId
                ? { ...message, content: message.content + event.text }
                : message,
            ),
          );
        },
        onFinal: (event) => {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === aiMessageId && message.content.trim().length === 0
                ? { ...message, content: event.answer }
                : message,
            ),
          );
        },
      });

      setMessages((prev) =>
        prev.map((message) =>
          message.id === aiMessageId && message.content.trim().length === 0
            ? { ...message, content: finalEvent.answer }
            : message,
        ),
      );
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      const message =
        error instanceof Error
          ? error.message
          : 'Unable to complete the deep dive request.';
      setStreamError(message);
      setMessages((prev) =>
        prev.map((entry) =>
          entry.id === aiMessageId
            ? { ...entry, content: `Sorry, I ran into an error: ${message}` }
            : entry,
        ),
      );
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">AI Deep Dive</h2>
              <p className="text-xs text-gray-500">Exploring: {displayedQuery}</p>
            </div>
          </div>
          <Button
            onClick={handleBack}
            variant="outline"
            size="sm"
            className="text-gray-600"
          >
            Back to results
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
          <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/60 to-purple-50/40 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">Context from your search</span>
              <Badge
                variant="outline"
                className="text-xs bg-white/70 border-blue-200 text-blue-700 ml-auto"
              >
                {selectedIds.length} selected of {totalInsightCount}
              </Badge>
            </div>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {aiSummary
                .split('\n')
                .slice(0, 4)
                .map(renderMarkdownLine)}
            </div>
            {hasSelectionOverflow && (
              <p className="text-xs text-gray-500 mt-3">
                Using the first {MAX_SELECTED_INSIGHTS} insights for deterministic deep dive context.
              </p>
            )}
          </div>

          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Ask me anything about these insights</h3>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
            >
              {message.role === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`rounded-2xl px-5 py-4 max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 shadow-sm'
                }`}
              >
                <div
                  className={`text-sm leading-relaxed whitespace-pre-line ${
                    message.role === 'ai' ? 'text-gray-800' : ''
                  }`}
                >
                  {message.role === 'ai'
                    ? message.content.split('\n').map(renderMarkdownLine)
                    : message.content}
                </div>
                {message.role === 'ai' &&
                  message.content.trim().length === 0 &&
                  isStreaming && (
                    <div className="flex items-center gap-2 mt-2">
                      <div
                        className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      />
                      <div
                        className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      />
                      <div
                        className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                  )}
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {isStreaming && statusStage && (
            <p className="text-xs text-gray-500">
              {STATUS_LABELS[statusStage] ?? statusStage}...
            </p>
          )}

          {streamError && (
            <p className="text-xs text-red-600">{streamError}</p>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !isStreaming) {
                    void handleSend();
                  }
                }}
                placeholder={
                  selectedIds.length > 0
                    ? 'Ask a follow-up question...'
                    : 'No insight IDs available for deep dive'
                }
                disabled={isStreaming || selectedIds.length === 0}
                className="pr-14 h-12 rounded-full border-gray-300 shadow-sm focus:shadow-md transition-shadow"
              />
              <Button
                onClick={() => {
                  void handleSend();
                }}
                disabled={!input.trim() || isStreaming || selectedIds.length === 0}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 h-9 w-9 rounded-full p-0"
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const buildQueryWithHistory = (messages: DiveDeeperMessage[], prompt: string): string => {
  const recentTurns = messages.slice(-4);
  if (recentTurns.length === 0) {
    return prompt;
  }

  const lines = recentTurns.map((message) =>
    `${message.role === 'user' ? 'User' : 'Assistant'}: ${message.content}`,
  );

  return [
    'Conversation context:',
    ...lines,
    `Current user question: ${prompt}`,
  ].join('\n');
};

const renderMarkdownLine = (line: string, index: number) => {
  if (line.startsWith('**') && line.endsWith('**')) {
    const text = line.replace(/\*\*/g, '');
    return (
      <h4 key={index} className="font-semibold text-gray-900 mt-3 mb-1 first:mt-0">
        {text}
      </h4>
    );
  }

  if (line.startsWith('• ')) {
    return (
      <li key={index} className="ml-4 text-gray-700 mb-0.5">
        {line.slice(2)}
      </li>
    );
  }

  const parts = line.split(/\*\*(.*?)\*\*/g);
  if (parts.length > 1) {
    return (
      <p key={index} className="mb-1">
        {parts.map((part, partIndex) =>
          partIndex % 2 === 1 ? (
            <strong key={partIndex} className="text-gray-900">
              {part}
            </strong>
          ) : (
            <span key={partIndex}>{part}</span>
          ),
        )}
      </p>
    );
  }

  if (line.trim() === '') {
    return <div key={index} className="h-2" />;
  }

  return <p key={index} className="mb-1">{line}</p>;
};
