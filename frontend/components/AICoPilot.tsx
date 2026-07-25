'use client';

import React, { useState } from 'react';
import api from '../lib/api';
import {
  BrainCircuit,
  X,
  Send,
  Bot,
  User as UserIcon,
  RefreshCw
} from 'lucide-react';

interface Message {
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

interface AICoPilotProps {
  isOpen: boolean;
  onClose: () => void;
}

const AICoPilot: React.FC<AICoPilotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Hello! I am your SupplySense AI Co-Pilot. Ask me about stock levels, demand predictions, supplier ratings, or reorder points!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestionPrompts = [
    "Which products require urgent reordering?",
    "What is the best performing warehouse by revenue?",
    "Analyze supplier reliability and lead times",
    "How is Economic Order Quantity (EOQ) calculated?"
  ];

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      let aiReply = "";
      const q = textToSend.toLowerCase();

      if (q.includes('reorder') || q.includes('urgent') || q.includes('low stock')) {
        const res = await api.get('/ai/low-stock-predict/');
        const lowItems = res.data.filter((i: any) => i.is_low_stock);
        if (lowItems.length > 0) {
          aiReply = `⚠️ Found ${lowItems.length} products needing reorder:\n` +
            lowItems.map((i: any) => `• ${i.product_name} (Current: ${i.current_stock} ${i.unit}, Recommended Order: +${i.recommended_reorder_qty} ${i.unit})`).join('\n');
        } else {
          aiReply = "✅ All warehouse stock levels are currently healthy! No urgent reorders required.";
        }
      } else if (q.includes('warehouse') || q.includes('revenue') || q.includes('best')) {
        const res = await api.get('/ai/business-insights/');
        aiReply = `🏆 Best Warehouse: ${res.data.best_warehouse?.name} with $${res.data.best_warehouse?.revenue?.toLocaleString()} revenue!\n` +
          `🔥 Most Sold Product: ${res.data.most_sold_product?.name} (${res.data.most_sold_product?.qty} units sold)\n` +
          `💰 Total Revenue: $${res.data.total_company_revenue?.toLocaleString()}`;
      } else if (q.includes('supplier') || q.includes('reliability') || q.includes('lead time')) {
        const res = await api.get('/suppliers/');
        const topSup = res.data.sort((a: any, b: any) => b.reliability_score - a.reliability_score)[0];
        aiReply = `📊 Highest Reliability Supplier: ${topSup?.name} (${topSup?.reliability_score}% Reliability Score).\n` +
          `• Average Lead Time: ${topSup?.lead_time_days} days\n` +
          `• Fulfillment Rate: ${(topSup?.fulfillment_rate * 100).toFixed(1)}%\n` +
          `• Defect Rate: ${(topSup?.defect_rate * 100).toFixed(1)}%`;
      } else if (q.includes('eoq') || q.includes('formula') || q.includes('safety stock')) {
        aiReply = `💡 EOQ & Safety Stock Formula in SupplySense AI:\n` +
          `1. EOQ = √((2 × Annual Demand × Ordering Cost) / Holding Cost)\n` +
          `2. Safety Stock = Z × StdDev(Demand) × √(Lead Time)\n` +
          `3. Reorder Point (ROP) = (Daily Demand × Lead Time) + Safety Stock`;
      } else {
        const res = await api.get('/ai/business-insights/');
        aiReply = `🤖 SupplySense AI System Telemetry Summary:\n` +
          `• Total Orders Processed: ${res.data.total_orders}\n` +
          `• Total Revenue: $${res.data.total_company_revenue?.toLocaleString()}\n` +
          `• Fast Moving Category: ${res.data.fast_moving_category}\n` +
          `You can navigate to the AI Analytics tab to view Random Forest demand forecasting and Scikit-learn confusion matrices!`;
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: aiReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: "I am having trouble connecting to the analytics engine right now. Please verify backend API status.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] h-[540px] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 text-slate-100">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30">
            <BrainCircuit className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white tracking-tight flex items-center gap-1.5">
              SupplySense <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">AI Assistant</span>
            </h3>
            <p className="text-[10px] text-slate-400">Live Supply Chain Intelligence</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5 shadow-md shadow-blue-600/20">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`max-w-[82%] p-3 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/20'
                  : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
              <span className="text-[9px] opacity-60 block mt-1 text-right">{msg.timestamp}</span>
            </div>
            {msg.sender === 'user' && (
              <div className="w-6 h-6 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                <UserIcon className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
            <span>Analyzing supply chain data...</span>
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-800/80 flex gap-1.5 overflow-x-auto no-scrollbar">
        {suggestionPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-blue-600/30 hover:border-blue-500/50 text-slate-300 hover:text-white rounded-full text-[10px] whitespace-nowrap border border-slate-700/60 transition-all cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask SupplySense AI..."
          className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-600/20 disabled:opacity-40 transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default AICoPilot;
