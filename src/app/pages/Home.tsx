import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Mic,
  Send,
  Plane,
  FileText,
  ReceiptText,
  Image,
  Settings,
  Bot,
} from "lucide-react";
import { VoiceModal } from "../components/VoiceModal";

interface Message {
  id: number;
  role: "ai" | "user";
  text: string;
  actions?: { label: string; path: string }[];
}

const QUICK_FLOWS = [
  {
    label: "出差申请",
    icon: Plane,
    iconBg: "bg-purple-500",
    path: "/business-trip",
  },
  {
    label: "差旅报销",
    icon: ReceiptText,
    iconBg: "bg-pink-400",
    path: "/travel-reimbursement",
  },
  {
    label: "员工报销",
    icon: FileText,
    iconBg: "bg-yellow-400",
    path: "/employee-reimbursement",
  },
];

function analyzeIntent(
  text: string,
): { label: string; path: string } | null {
  const lower = text;
  if (
    lower.includes("出差申请") ||
    (lower.includes("出差") && !lower.includes("报销"))
  )
    return { label: "出差申请", path: "/business-trip" };
  if (lower.includes("差旅报销") || lower.includes("差旅"))
    return { label: "差旅报销", path: "/travel-reimbursement" };
  if (lower.includes("员工报销"))
    return {
      label: "员工报销",
      path: "/employee-reimbursement",
    };
  if (
    lower.includes("报销") &&
    !lower.includes("差旅") &&
    !lower.includes("员工")
  )
    return {
      label: "员工报销",
      path: "/employee-reimbursement",
    };
  if (
    lower.includes("影像") ||
    lower.includes("票据管理") ||
    lower.includes("发票管理")
  )
    return { label: "影像管理", path: "/image-management" };
  if (
    lower.includes("字段") ||
    lower.includes("配置") ||
    lower.includes("规则")
  )
    return { label: "字段配置", path: "/field-config" };
  return null;
}

const HOME_VOICE_TEMPLATE = `我需要办理以下业务：
#[出差申请 / 差旅报销 / 员工报销]
具体描述：... ~`;

export function Home() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "ai",
      text: "您好！我是您的AI智能填单助手，请问需要办理什么业务？您可以选择上方的快捷流程，或直接告诉我您的需求。",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      text: inputText,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      const intent = analyzeIntent(inputText);
      let aiResponse: Message;
      if (intent) {
        aiResponse = {
          id: Date.now() + 1,
          role: "ai",
          text: `我已识别您的需求：${intent.label}。正在为您跳转到对应界面，请稍候...`,
          actions: [
            { label: `前往${intent.label}`, path: intent.path },
          ],
        };
      } else {
        aiResponse = {
          id: Date.now() + 1,
          role: "ai",
          text: "您好！我可以帮您处理以下业务：\n• 出差申请 - 智能录入出差信息\n• 差旅报销 - 上传票据自动报销\n• 员工报销 - 日常费用报销\n请告诉我您需要哪项服务？",
          actions: [
            { label: "出差申请", path: "/business-trip" },
            {
              label: "差旅报销",
              path: "/travel-reimbursement",
            },
            {
              label: "员工报销",
              path: "/employee-reimbursement",
            },
          ],
        };
      }
      setIsTyping(false);
      setMessages((prev) => [...prev, aiResponse]);

      if (intent) {
        setTimeout(() => navigate(intent.path), 1500);
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F0F0F0]">
      {/* Header */}
      <header className="bg-[#8B1450] text-white px-4 sm:px-6 py-3 shadow-md flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-base sm:text-lg font-semibold tracking-wide">
            AI智能填单助手
          </h1>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Desktop buttons */}
            <button
              onClick={() => navigate("/operation-log")}
              className="hidden md:block px-3 py-1.5 border border-white/60 rounded text-sm hover:bg-white/10 transition-colors"
            >
              操作日志
            </button>
            <button
              onClick={() => navigate("/image-management")}
              className="hidden md:block px-3 py-1.5 border border-white/60 rounded text-sm hover:bg-white/10 transition-colors"
            >
              影像管理
            </button>
            <button
              onClick={() => navigate("/field-config")}
              className="hidden md:block px-3 py-1.5 border border-white/60 rounded text-sm hover:bg-white/10 transition-colors"
            >
              字段配置
            </button>
            <button
              onClick={() => window.location.href = '/规则配置.html'}
              className="hidden sm:flex px-2 sm:px-3 py-1.5 bg-white text-[#8B1450] rounded text-xs sm:text-sm font-semibold hover:bg-gray-100 transition-colors items-center gap-1"
            >
              <Settings size={14} className="sm:hidden" />
              <span className="hidden sm:inline">规则配置</span>
            </button>
            {/* Mobile menu button */}
            <button
              onClick={() => window.location.href = '/规则配置.html'}
              className="sm:hidden w-8 h-8 flex items-center justify-center bg-white text-[#8B1450] rounded-full hover:bg-gray-100 transition-colors"
            >
              <Settings size={16} />
            </button>

          </div>
        </div>
      </header>

      {/* Quick flows */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-2 flex-shrink-0">
        <p className="text-xs text-gray-500 mb-3">常用流程</p>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {QUICK_FLOWS.map((flow) => (
            <button
              key={flow.path}
              onClick={() => navigate(flow.path)}
              className="bg-white rounded-xl p-4 sm:p-6 flex flex-col items-center gap-2 sm:gap-3 shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-[#8B1450]/20 group"
            >
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${flow.iconBg}`}
              >
                <flow.icon size={24} className="sm:w-7 sm:h-7 text-white" />
              </div>
              <span className="text-xs sm:text-sm text-gray-700 group-hover:text-[#8B1450] transition-colors">
                {flow.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 sm:gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {msg.role === "ai" && (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-500 flex-shrink-0 flex items-center justify-center">
                <Bot size={14} className="sm:w-4 sm:h-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] sm:max-w-[70%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-2`}
            >
              <div
                className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm whitespace-pre-line ${
                  msg.role === "ai"
                    ? "bg-pink-50 text-gray-700 border border-pink-100"
                    : "bg-[#8B1450] text-white"
                }`}
              >
                {msg.text}
              </div>
              {msg.actions && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {msg.actions.map((action) => (
                    <button
                      key={action.path}
                      onClick={() => navigate(action.path)}
                      className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[#8B1450] text-white text-xs rounded-full hover:bg-[#6e1040] transition-colors shadow-sm"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-500 flex-shrink-0 flex items-center justify-center">
              <Bot size={14} className="sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="bg-pink-50 border border-pink-100 rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 flex gap-1 items-center">
              <span
                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="bg-white border-t border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 bg-white border border-gray-300 rounded-full px-3 sm:px-4 py-2 sm:py-2.5 shadow-sm">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && sendMessage()
            }
            placeholder="请输入您的需求..."
            className="flex-1 bg-transparent text-xs sm:text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
          <button
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-400 hover:text-[#8B1450] transition-colors"
            onClick={() => setVoiceOpen(true)}
          >
            <Mic size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <button
            onClick={sendMessage}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-[#8B1450] rounded-full text-white hover:bg-[#6e1040] transition-colors"
          >
            <Send size={12} className="sm:w-[14px] sm:h-[14px]" />
          </button>
        </div>
      </div>

      <VoiceModal
        isOpen={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        template={HOME_VOICE_TEMPLATE}
        onConfirm={(text) => {
          setVoiceOpen(false);
          setInputText(text);
          setTimeout(() => {
            const userMsg: Message = {
              id: Date.now(),
              role: "user",
              text,
            };
            setMessages((prev) => [...prev, userMsg]);
            setInputText("");
            setIsTyping(true);
            setTimeout(() => {
              const intent = analyzeIntent(text);
              let aiResponse: Message;
              if (intent) {
                aiResponse = {
                  id: Date.now() + 1,
                  role: "ai",
                  text: `我已识别您的需求：${intent.label}。正在为您跳转到对应界面，请稍候...`,
                  actions: [
                    {
                      label: `前往${intent.label}`,
                      path: intent.path,
                    },
                  ],
                };
              } else {
                aiResponse = {
                  id: Date.now() + 1,
                  role: "ai",
                  text: "您好！我可以帮您处理以下业务：\n• 出差申请 - 智能录入出差信息\n• 差旅报销 - 上传票据自动报销\n• 员工报销 - 日常费用报销\n• 影像管理 - 查看管理票据\n• 字段配置 - 自定义表单字段\n\n请告诉我您需要哪项服务？",
                  actions: [
                    {
                      label: "出差申请",
                      path: "/business-trip",
                    },
                    {
                      label: "差旅报销",
                      path: "/travel-reimbursement",
                    },
                    {
                      label: "员工报销",
                      path: "/employee-reimbursement",
                    },
                  ],
                };
              }
              setIsTyping(false);
              setMessages((prev) => [...prev, aiResponse]);
              if (intent)
                setTimeout(() => navigate(intent.path), 1500);
            }, 1000);
          }, 100);
        }}
      />
    </div>
  );
}