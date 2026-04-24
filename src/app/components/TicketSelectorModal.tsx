import { useState } from "react";
import {
  X,
  CheckSquare,
  Square,
  FileImage,
} from "lucide-react";

interface Ticket {
  id: number;
  name: string;
  type: string;
  size: string;
  date: string;
  status: "已审核" | "待审核" | "审核不通过";
}

interface TicketSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedTickets: Ticket[]) => void;
}

const AVAILABLE_TICKETS: Ticket[] = [
  {
    id: 1,
    name: "增值税专用发票_20260310.xml",
    type: "增值税发票",
    size: "2.3 MB",
    date: "2026-03-10",
    status: "未提交",
  },
  {
    id: 2,
    name: "火车票_上海-北京_20260309.jpg",
    type: "火车票",
    size: "1.8 MB",
    date: "2026-03-09",
    status: "未提交",
  },
  {
    id: 3,
    name: "酒店账单_北京希尔顿_20260308.pdf",
    type: "酒店账单",
    size: "3.2 MB",
    date: "2026-03-08",
    status: "未提交",
  },
  {
    id: 4,
    name: "电子发票_餐饮_20260307.jpg",
    type: "电子发票",
    size: "1.5 MB",
    date: "2026-03-07",
    status: "未提交",
  },
  {
    id: 5,
    name: "机票_北京-上海_20260306.pdf",
    type: "机票",
    size: "2.8 MB",
    date: "2026-03-06",
    status: "未提交",
  },
  {
    id: 6,
    name: "普通发票_办公用品_20260305.jpg",
    type: "普通发票",
    size: "1.2 MB",
    date: "2026-03-05",
    status: "未提交",
  },
  {
    id: 7,
    name: "增值税普通发票_20260304.ofd",
    type: "增值税发票",
    size: "2.1 MB",
    date: "2026-03-04",
    status: "未提交",
  },
  {
    id: 8,
    name: "高铁票_广州-深圳_20260303.jpg",
    type: "火车票",
    size: "0.9 MB",
    date: "2026-03-03",
    status: "未提交",
  },
];

const STATUS_COLORS: Record<string, string> = {
  已审核: "bg-green-100 text-green-700",
  待审核: "bg-yellow-100 text-yellow-700",
  审核不通过: "bg-red-100 text-red-700",
  未提交: "bg-blue-100 text-blue-700",
};

export function TicketSelectorModal({
  isOpen,
  onClose,
  onConfirm,
}: TicketSelectorModalProps) {
  const [selected, setSelected] = useState<number[]>([]);

  const toggleSelect = (id: number) => {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  };

  const handleConfirm = () => {
    const selectedTickets = AVAILABLE_TICKETS.filter((t) =>
      selected.includes(t.id),
    );
    onConfirm(selectedTickets);
    setSelected([]);
  };

  const handleClose = () => {
    setSelected([]);
    onClose();
  };

  if (!isOpen) return null;

  // 过滤只显示XML、PDF或OFD格式的文件
  const filteredTickets = AVAILABLE_TICKETS.filter(ticket => {
    const fileName = ticket.name.toLowerCase();
    return fileName.endsWith('.xml') || fileName.endsWith('.pdf') || fileName.endsWith('.ofd');
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              从票据夹选择
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              已选择 {selected.length} 张票据
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => toggleSelect(ticket.id)}
                className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                  selected.includes(ticket.id)
                    ? "border-[#8B1450] bg-[#8B1450]/5"
                    : "border-gray-200 hover:border-[#8B1450]/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <div className="flex-shrink-0 mt-0.5">
                    {selected.includes(ticket.id) ? (
                      <CheckSquare
                        size={20}
                        className="text-[#8B1450]"
                      />
                    ) : (
                      <Square
                        size={20}
                        className="text-gray-400"
                      />
                    )}
                  </div>

                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                      <FileImage
                        size={20}
                        className="text-blue-600"
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {ticket.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-gray-500">
                        {ticket.type}
                      </span>
                      <span className="text-xs text-gray-400">
                        •
                      </span>
                      <span className="text-xs text-gray-500">
                        {ticket.size}
                      </span>
                      <span className="text-xs text-gray-400">
                        •
                      </span>
                      <span className="text-xs text-gray-500">
                        {ticket.date}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    <span
                      className={`text-xs px-2 py-1 rounded ${STATUS_COLORS[ticket.status]}`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-4 pb-4 pt-3 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-600 text-sm hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={selected.length === 0}
            className="flex-1 py-2.5 bg-[#8B1450] text-white rounded-lg text-sm hover:bg-[#6e1040] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            确认添加 ({selected.length})
          </button>
        </div>
      </div>
    </div>
  );
}