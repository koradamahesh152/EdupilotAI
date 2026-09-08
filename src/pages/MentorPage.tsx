import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Bot, User, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { usePlans, useTopics } from '@/hooks/useData';
import { supabase } from '@/lib/supabase';
import { generateMentorReply } from '@/lib/ai';
import type { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';

const SUGGESTED = [
  'What should I learn today?',
  'Am I on schedule?',
  'What should I learn next?',
  'How can I improve?',
];

export function MentorPage() {
  const { profile } = useAuth();
  const { plans } = usePlans();
  const activePlan = plans.find((p) => p.status === 'active') ?? plans[0] ?? null;
  const { topics } = useTopics(activePlan?.id ?? null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const todayTopics = topics.filter((t) => t.status === 'available' || t.status === 'in_progress').slice(0, 5);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setMessages(data as ChatMessage[]);
        } else {
          setMessages([
            {
              id: 'welcome',
              user_id: profile.id,
              role: 'assistant',
              content: `Hi ${profile.full_name?.split(' ')[0] ?? 'there'}! I'm your AI learning mentor. I can help you with your learning journey. Ask me anything — what to learn today, whether you're on track, or how to improve your study habits.`,
              created_at: new Date().toISOString(),
            },
          ]);
        }
      });
  }, [profile]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const sendMessage = async (text: string) => {
    if (!profile || !text.trim()) return;
    setInput('');
    setLoading(true);
    setThinking(true);

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).slice(2),
      user_id: profile.id,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    await supabase.from('chat_messages').insert({ user_id: profile.id, role: 'user', content: text });

    // Generate reply
    const reply = generateMentorReply(text, { profile, activePlan, topics, todayTopics });

    // Simulate thinking delay
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));

    const assistantMsg: ChatMessage = {
      id: Math.random().toString(36).slice(2),
      user_id: profile.id,
      role: 'assistant',
      content: reply,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, assistantMsg]);
    setThinking(false);
    setLoading(false);

    await supabase.from('chat_messages').insert({ user_id: profile.id, role: 'assistant', content: reply });
  };

  const clearChat = async () => {
    if (!profile) return;
    await supabase.from('chat_messages').delete().eq('user_id', profile.id);
    setMessages([
      {
        id: 'welcome',
        user_id: profile.id,
        role: 'assistant',
        content: `Hi! I'm your AI learning mentor. Ask me anything about your learning journey.`,
        created_at: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-slate-100">AI Mentor</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Your personal learning guide</p>
        </div>
        {messages.length > 1 && (
          <Button variant="ghost" size="sm" onClick={clearChat} className="text-error-500">
            <Trash2 className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}
            >
              <div className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                msg.role === 'assistant' ? 'bg-gradient-to-br from-brand-500 to-accent-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
              )}>
                {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <div className={cn(
                'max-w-[75%] p-3.5 rounded-2xl text-sm',
                msg.role === 'assistant'
                  ? 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 rounded-tl-sm'
                  : 'bg-brand-500 text-white rounded-tr-sm',
              )}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </motion.div>
          ))}

          {thinking && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      className="w-2 h-2 rounded-full bg-slate-400"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Suggested questions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {SUGGESTED.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="px-3 py-2 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 text-xs font-medium hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && sendMessage(input)}
              placeholder="Ask your mentor anything..."
              className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all text-sm"
              disabled={loading}
            />
            <Button onClick={() => sendMessage(input)} disabled={loading || !input.trim()} size="md">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
