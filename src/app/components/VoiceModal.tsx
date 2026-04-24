import { useState, useEffect } from "react";
import { Mic, X, CheckCircle } from "lucide-react";

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (text: string) => void;
  template?: string;
}

const BUSINESS_TRIP_TEMPLATE = `我需要申请一次出差，出差类型为#[出差类型]，出发地是：...，目的地是：...，出差公司为：...，出差原因是：...，交通工具为：...，出差日期从...到...，#[是/否]需要第三方承担费用（若为是，费用承担单位为：...）,#[是/否]通过携程预定酒店，#[是/否]可以通过邮件、电话、teams沟通解决，帮忙处理下申请流程 ~`;

export function VoiceModal({ isOpen, onClose, onConfirm, template }: VoiceModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState(template || BUSINESS_TRIP_TEMPLATE);
  const [recognized, setRecognized] = useState(false);
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setIsListening(false);
      setRecognized(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isListening) {
      interval = setInterval(() => {
        setDots((d) => (d.length >= 3 ? "" : d + "·"));
      }, 400);
      // Simulate recognition after 3 seconds
      const timeout = setTimeout(() => {
        setIsListening(false);
        setRecognized(true);
      }, 3000);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
    return () => clearInterval(interval);
  }, [isListening]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">语音输入</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-sm text-gray-500 mb-3">标准化话术模板：</p>
          <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-600 whitespace-pre-line border border-gray-200">
            {text}
          </div>

          {/* Listening area */}
          <div className="flex flex-col items-center py-4">
            <button
              onClick={() => {
                setIsListening(true);
                setRecognized(false);
              }}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? "bg-red-500 scale-110 shadow-lg shadow-red-200 animate-pulse"
                  : recognized
                  ? "bg-green-500"
                  : "bg-[#8B1450] hover:bg-[#6e1040]"
              }`}
            >
              {recognized ? (
                <CheckCircle size={30} className="text-white" />
              ) : (
                <Mic size={30} className="text-white" />
              )}
            </button>
            <p className="mt-3 text-sm text-gray-500">
              {isListening
                ? `正在聆听${dots}`
                : recognized
                ? "识别完成，请确认信息"
                : "点击麦克风开始语音输入"}
            </p>
          </div>

          {/* Editable text area */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-[#8B1450]/30"
            placeholder="请按照模板格式输入出差信息..."
          />
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-600 text-sm hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={() => onConfirm(text)}
            className="flex-1 py-2.5 bg-[#8B1450] text-white rounded-lg text-sm hover:bg-[#6e1040]"
          >
            确认录入
          </button>
        </div>
      </div>
    </div>
  );
}
