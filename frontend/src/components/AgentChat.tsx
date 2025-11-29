import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { useWallet } from "@solana/wallet-adapter-react";
import { agentApi, Message } from "../api/agent";
import { Grant } from "../data/grants";
import { useTokenGate } from "../hooks/useTokenGate";
import { TOKEN_GATE_CONFIG, formatTokenAmount } from "../config/tokenGate";
import { Lock } from "lucide-react";

interface AgentChatProps {
  grant: Grant | null;
}

export function AgentChat({ grant }: AgentChatProps) {
  const { publicKey } = useWallet();
  const [messages, setMessages] = useState<(Message & { timestamp: Date })[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Token gate check
  const tokenGate = useTokenGate();

  const MAX_CHARS = 500;

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset conversation when grant changes
  useEffect(() => {
    setMessages([]);
    setInput("");
    setError(null);
  }, [grant?.id]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !grant || loading) return;

    // Check token gate access
    if (!tokenGate.hasAccess) {
      setError(
        tokenGate.isConnected
          ? `You need at least ${formatTokenAmount(TOKEN_GATE_CONFIG.REQUIRED_AMOUNT)} ${TOKEN_GATE_CONFIG.TOKEN_NAME} to use the AI Agent.`
          : 'Please connect your Solana wallet to use the AI Agent.'
      );
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setError(null);

    // Add user message to UI
    const newUserMessage: Message & { timestamp: Date } = {
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      setLoading(true);

      // Ensure we have a wallet address
      if (!publicKey) {
        throw new Error('Wallet not connected');
      }

      // Call agent API
      const response = await agentApi.chat({
        grant_id: grant.id,
        user_message: userMessage,
        wallet_address: publicKey.toBase58(),
        conversation_history: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      });

      // Add assistant response to UI
      const assistantMessage: Message & { timestamp: Date } = {
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Agent error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to get response. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const starterPrompts = [
    "Help me understand if my project is a good fit for this grant",
    "What milestones should I propose for a 6-month grant?",
    "What are the key things this grant program looks for?",
    "How should I structure my budget request?",
  ];

  const handleStarterClick = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const clearHistory = () => {
    if (window.confirm("Clear conversation history?")) {
      setMessages([]);
      setError(null);
    }
  };

  if (!grant) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        Select a grant to start chatting
      </div>
    );
  }

  return (
    <>
      {/* Token Gate Status */}
      {tokenGate.loading ? (
        <div className="mb-3 bg-blue-500/10 border border-blue-500/30 rounded-xl px-3 py-2 text-[11px] text-blue-300 flex items-center gap-2">
          <div className="animate-spin h-3 w-3 border-2 border-blue-400 border-t-transparent rounded-full" />
          Checking token balance...
        </div>
      ) : !tokenGate.isConnected ? (
        <div className="mb-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2.5">
          <div className="flex items-start gap-2">
            <Lock className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[11px] text-amber-300 font-medium">Connect Wallet Required</p>
              <p className="text-[10px] text-amber-200/80 mt-1">
                Connect your Solana wallet to use the AI Agent for personalized grant assistance.
              </p>
            </div>
          </div>
        </div>
      ) : !tokenGate.hasAccess ? (
        <div className="mb-3 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2.5">
          <div className="flex items-start gap-2">
            <Lock className="h-4 w-4 text-rose-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-[11px] text-rose-300 font-medium">Insufficient Token Balance</p>
              <p className="text-[10px] text-rose-200/80 mt-1">
                You need at least <strong>{formatTokenAmount(TOKEN_GATE_CONFIG.REQUIRED_AMOUNT)}</strong> {TOKEN_GATE_CONFIG.TOKEN_NAME} to access the AI Agent.
              </p>
              <p className="text-[10px] text-rose-200/60 mt-1">
                Your balance: <strong>{formatTokenAmount(tokenGate.balance)}</strong> {TOKEN_GATE_CONFIG.TOKEN_NAME}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-emerald-400 rounded-full" />
              <p className="text-[10px] text-emerald-300 font-medium">AI Agent Access Granted</p>
            </div>
            <p className="text-[10px] text-emerald-300/80">
              Balance: {formatTokenAmount(tokenGate.balance)} {TOKEN_GATE_CONFIG.TOKEN_NAME}
            </p>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 rounded-xl border border-white/10 bg-black/40 p-3 space-y-3 text-[11px] text-gray-200 overflow-y-auto max-h-[50vh] lg:max-h-[60vh]">
        {messages.length === 0 ? (
          <>
            {/* Welcome Message */}
            <div className="bg-white/5 border border-white/10 rounded-2xl px-3 py-2">
              <p className="text-gray-200 mb-2">
                👋 Hi! I'm your GrantPilot Agent. I'll help you craft a winning application for <strong>{grant.title}</strong>.
              </p>
              <p className="text-gray-400 text-[10px]">
                Tell me about your project and I'll provide personalized guidance.
              </p>
            </div>

            {/* Starter Prompts */}
            {tokenGate.hasAccess && (
              <div className="space-y-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Quick starts:</p>
                {starterPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleStarterClick(prompt)}
                    className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-[11px] text-gray-300 transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`rounded-2xl px-3 py-2 ${
                  msg.role === "user"
                    ? "bg-amber-500/10 border border-amber-500/30 ml-auto max-w-[85%]"
                    : "bg-white/5 border border-white/10 max-w-[90%]"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="text-gray-200 mb-2 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                        ul: ({ children }) => <ul className="list-disc list-inside text-gray-300 space-y-1 my-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside text-gray-300 space-y-1 my-2">{children}</ol>,
                        li: ({ children }) => <li className="text-gray-300">{children}</li>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-amber-100">{msg.content}</p>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="bg-white/5 border border-white/10 rounded-2xl px-3 py-2 max-w-[90%]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-gray-400 text-[10px]">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/40 rounded-xl px-3 py-2 text-[11px] text-rose-300">
          {error}
        </div>
      )}

      {/* Input Area */}
      <div className="mt-3 bg-black/70 border border-white/10 rounded-2xl px-3 py-2">
        <div className="flex items-start gap-2">
          <img src="/small.png" className="h-7 w-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-black font-semibold text-[11px] flex-shrink-0 mt-0.5" />
        
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
            onKeyDown={handleKeyDown}
            placeholder={
              !tokenGate.hasAccess
                ? tokenGate.isConnected
                  ? `Insufficient ${TOKEN_GATE_CONFIG.TOKEN_NAME} balance to use AI Agent`
                  : "Connect Solana wallet to use AI Agent"
                : "Describe your project, ask for guidance, or paste your pitch..."
            }
            className="flex-1 bg-transparent text-[11px] outline-none placeholder:text-gray-500 resize-none min-h-[60px] max-h-[120px]"
            rows={3}
            disabled={loading || !tokenGate.hasAccess}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || !tokenGate.hasAccess}
            className="px-2.5 py-1.5 bg-amber-400 text-black rounded-xl text-[11px] font-medium hover:bg-amber-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            title={!tokenGate.hasAccess ? 'Token gate requirement not met' : ''}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-[10px] text-gray-500">
            {input.length}/{MAX_CHARS} • Press Enter to send
          </p>
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-[10px] text-gray-400 hover:text-gray-300 underline"
            >
              Clear history
            </button>
          )}
        </div>
      </div>

      <p className="text-[10px] text-gray-400 text-right mt-2">
        Powered by Claude AI • Context-aware for {grant.chain}
      </p>
    </>
  );
}
