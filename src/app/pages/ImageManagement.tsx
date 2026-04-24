import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Search,
  Upload,
  Download,
  Trash2,
  X,
  RefreshCw,
  CheckSquare,
  FileImage,
} from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  "全部票据",
  "增值税普通发票",
  "增值税专用发票",
  "通用机打发票",
  "卷式发票",
  "定额发票",
  "地铁票",
  "出租发票",
  "动车/高铁票",
  "过路费发票",
  "客运汽车发票",
  "二手车销售统一发票表",
  "机动车销售发票表",
  "国际小票",
  "航空运输电子客票行程单",
  "增值税电子发票",
  "增值税普通发票（卷票）",
  "可报销其他发票",
  "完税证明",
  "区块链发票",
  "增值税电子票（通行费）20",
  "电子发票（增值税专用发票）",
  "电子发票（普通发票）",
  "火车电子票",
];

const STATUS_OPTIONS = [
  "全部状态",
  "未关联",
  "已关联"
];

const STATUS_COLORS: Record<string, string> = {
  已审核: "bg-green-100 text-green-700",
  待审核: "bg-yellow-100 text-yellow-700",
  审核不通过: "bg-red-100 text-red-700",
};

const TICKET_COLORS: Record<string, string> = {
  增值税普通发票: "bg-[#8B1450]",
  增值税专用发票: "bg-[#A61C5D]",
  通用机打发票: "bg-green-600",
  卷式发票: "bg-green-500",
  定额发票: "bg-green-400",
  地铁票: "bg-blue-500",
  出租发票: "bg-yellow-500",
  "动车/高铁票": "bg-red-500",
  过路费发票: "bg-orange-500",
  客运汽车发票: "bg-teal-500",
  "二手车销售统一发票表": "bg-blue-600",
  "机动车销售发票表": "bg-blue-700",
  国际小票: "bg-purple-500",
  航空运输电子客票行程单: "bg-teal-600",
  增值税电子发票: "bg-pink-500",
  "增值税普通发票（卷票）": "bg-[#C41F7B]",
  可报销其他发票: "bg-gray-600",
  完税证明: "bg-indigo-500",
  区块链发票: "bg-purple-600",
  "增值税电子票（通行费）20": "bg-orange-600",
  "电子发票（增值税专用发票）": "bg-[#8B1450]",
  "电子发票（普通发票）": "bg-[#A61C5D]",
  火车电子票: "bg-red-600",
};

interface Ticket {
  id: number;
  name: string;
  type: string;
  size: string;
  date: string;
  status: "已审核" | "待审核" | "审核不通过" | "未关联" | "已关联";
  imgSeed: string;
}

const TICKETS: Ticket[] = [
  {
    id: 1,
    name: "增值税专用发票_20260310.pdf",
    type: "增值税专用发票",
    size: "2.3 MB",
    date: "2026-03-10",
    status: "未关联",
    imgSeed: "invoice1",
  },
  {
    id: 2,
    name: "火车票_上海-北京_20260309.xml",
    type: "火车电子票",
    size: "1.8 MB",
    date: "2026-03-09",
    status: "未关联",
    imgSeed: "train",
  },
  {
    id: 3,
    name: "酒店账单_北京希尔顿_20260308.pdf",
    type: "可报销其他发票",
    size: "3.2 MB",
    date: "2026-03-08",
    status: "已关联",
    imgSeed: "hotel",
  },
  {
    id: 4,
    name: "电子发票_餐饮_20260307.ofd",
    type: "电子发票（普通发票）",
    size: "1.5 MB",
    date: "2026-03-07",
    status: "未关联",
    imgSeed: "food",
  },
  {
    id: 5,
    name: "机票_北京-上海_20260306.pdf",
    type: "航空运输电子客票行程单",
    size: "2.8 MB",
    date: "2026-03-06",
    status: "未关联",
    imgSeed: "airplane",
  },
  {
    id: 6,
    name: "普通发票_办公用品_20260305.ofd",
    type: "定额发票",
    size: "1.2 MB",
    date: "2026-03-05",
    status: "未关联",
    imgSeed: "office",
  },
  {
    id: 7,
    name: "增值税普通发票_20260304.pdf",
    type: "增值税普通发票",
    size: "2.1 MB",
    date: "2026-03-04",
    status: "未关联",
    imgSeed: "paper",
  },
  {
    id: 8,
    name: "高铁票_广州-深圳_20260303.ofd",
    type: "动车/高铁票",
    size: "0.9 MB",
    date: "2026-03-03",
    status: "未关联",
    imgSeed: "train2",
  },
];

const COLORS = [
  "bg-blue-100",
  "bg-green-100",
  "bg-purple-100",
  "bg-pink-100",
  "bg-yellow-100",
  "bg-teal-100",
  "bg-orange-100",
  "bg-indigo-100",
];

export function ImageManagement() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] =
    useState("全部票据");
  const [activeStatus, setActiveStatus] =
    useState("全部状态");
  const [searchText, setSearchText] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [previewTicket, setPreviewTicket] =
    useState<Ticket | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const filtered = TICKETS.filter((t) => {
    const matchCat =
      activeCategory === "全部票据" ||
      t.type === activeCategory;
    const matchStatus =
      activeStatus === "全部状态" ||
      t.status === activeStatus;
    const matchSearch = t.name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    return matchCat && matchStatus && matchSearch;
  });

  const toggleSelect = (id: number) => {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  };

  return (
    <div className="flex flex-col h-screen bg-[#F0F0F0]">
      {/* Header */}
      <header className="bg-[#8B1450] text-white px-4 py-3 shadow-md flex-shrink-0">
        <div className="flex items-center gap-3 mb-2 sm:mb-0">
          <button
            onClick={() => navigate("/")}
            className="hover:bg-white/10 rounded-full p-1.5"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold">影像管理</h1>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
            共 {TICKETS.length} 张票据
          </span>
          <div className="flex-1" />
          {/* Desktop-only actions */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="relative max-w-xs">
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 border border-gray-200 rounded text-sm text-gray-700 focus:outline-none focus:border-[#8B1450] appearance-none bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </div>
            <div className="relative max-w-xs">
              <select
                value={activeStatus}
                onChange={(e) => setActiveStatus(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 border border-gray-200 rounded text-sm text-gray-700 focus:outline-none focus:border-[#8B1450] appearance-none bg-white"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </div>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="搜索票据..."
                className="pl-8 pr-3 py-1.5 text-sm text-gray-700 rounded border-0 outline-none w-48 bg-white"
              />
            </div>
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-1.5 bg-white text-[#8B1450] px-3 py-1.5 rounded text-sm hover:bg-gray-100"
            >
              <Upload size={14} /> 上传票据
            </button>
          </div>
          {/* Mobile-only upload button */}
          <button
            onClick={() => setShowUpload(true)}
            className="lg:hidden flex items-center justify-center bg-white text-[#8B1450] p-2 rounded hover:bg-gray-100"
          >
            <Upload size={18} />
          </button>
        </div>
        {/* Mobile search bar */}
        <div className="lg:hidden mt-2 space-y-2">
          <div className="relative">
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="w-full pl-3 pr-8 py-1.5 border border-gray-200 rounded text-sm text-gray-700 focus:outline-none focus:border-[#8B1450] appearance-none bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>
          </div>
          <div className="relative">
            <select
              value={activeStatus}
              onChange={(e) => setActiveStatus(e.target.value)}
              className="w-full pl-3 pr-8 py-1.5 border border-gray-200 rounded text-sm text-gray-700 focus:outline-none focus:border-[#8B1450] appearance-none bg-white"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>
          </div>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="搜索票据..."
              className="w-full pl-8 pr-3 py-1.5 text-sm text-gray-700 rounded border-0 outline-none bg-white"
            />
          </div>
        </div>
      </header>

      {/* Batch action bar */}
      {selected.length > 0 && (
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-gray-700">
              已选择{" "}
              <span className="font-semibold text-[#8B1450]">
                {selected.length}
              </span>{" "}
              张票据
            </span>
            <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#8B1450]">
              <Download size={14} /> <span className="hidden sm:inline">批量下载</span>
            </button>
            <button className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600">
              <Trash2 size={14} /> <span className="hidden sm:inline">批量删除</span>
            </button>
            <button
              onClick={() => setSelected([])}
              className="ml-auto text-sm text-gray-500 hover:text-gray-700"
            >
              取消选择
            </button>
          </div>
        </div>
      )}

      {/* Ticket grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((ticket, idx) => (
            <div
              key={ticket.id}
              onClick={() => setPreviewTicket(ticket)}
              className={`bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all border-2 ${
                selected.includes(ticket.id)
                  ? "border-[#8B1450]"
                  : "border-transparent"
              }`}
            >
              {/* Preview area */}
              <div
                className={`h-40 ${COLORS[idx % COLORS.length]} flex items-center justify-center relative`}
              >
                <FileImage
                  size={48}
                  className="text-gray-400"
                />
                {/* Type badge */}
                <div
                  className={`absolute bottom-2 left-2 ${TICKET_COLORS[ticket.type] || "bg-gray-600"} text-white text-xs px-2 py-0.5 rounded`}
                >
                  {ticket.type}
                </div>
                {/* Action buttons */}
                <div
                  className="absolute top-2 right-2 flex gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button className="bg-white/80 rounded-full p-1 text-gray-600 hover:text-[#8B1450]">
                    <Download size={14} />
                  </button>
                  <button className="bg-white/80 rounded-full p-1 text-gray-600 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-xs text-gray-700 mb-1 line-clamp-1">
                  {ticket.name}
                </h3>
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>{ticket.size}</span>
                  <span>{ticket.date}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[ticket.status]}`}
                  >
                    {ticket.status}
                  </span>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(ticket.id);
                    }}
                    className={`w-5 h-5 border rounded flex items-center justify-center cursor-pointer transition-colors ${
                      selected.includes(ticket.id)
                        ? "bg-[#8B1450] border-[#8B1450]"
                        : "border-gray-300 hover:border-[#8B1450]"
                    }`}
                  >
                    {selected.includes(ticket.id) && (
                      <CheckSquare
                        size={12}
                        className="text-white"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <FileImage size={48} className="mb-3" />
            <p className="text-sm">暂无相关票据</p>
          </div>
        )}

        <div className="text-center mt-6">
          <button className="px-6 py-2 border border-gray-300 rounded text-gray-600 text-sm hover:bg-gray-50 flex items-center gap-2 mx-auto">
            <RefreshCw size={14} /> 加载更多
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {previewTicket && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 line-clamp-1 flex-1 mr-3">
                {previewTicket.name}
              </h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button className="text-gray-500 hover:text-[#8B1450] p-1">
                  <Download size={18} />
                </button>
                <button className="text-gray-500 hover:text-red-500 p-1">
                  <Trash2 size={18} />
                </button>
                <button
                  onClick={() => setPreviewTicket(null)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
              <div className="flex-1 bg-gray-100 flex items-center justify-center min-h-64">
                <FileImage
                  size={80}
                  className="text-gray-400"
                />
              </div>
              <div className="w-full sm:w-72 bg-gray-50 p-5 overflow-y-auto">
                <h4 className="text-sm font-semibold text-gray-800 mb-4">
                  票据信息
                </h4>
                <div className="space-y-3 text-sm">
                  {[
                    ["票据名称", previewTicket.name],
                    ["票据类型", previewTicket.type],
                    ["文件大小", previewTicket.size],
                    [
                      "上传时间",
                      `${previewTicket.date} 14:30:22`,
                    ],
                    ["状态", previewTicket.status],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-xs text-gray-400">
                        {label}
                      </p>
                      <p className="text-gray-700">{value}</p>
                    </div>
                  ))}
                </div>

                {previewTicket.status !== "未提交" && (
                  <div className="mt-5">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">
                      关联报销单
                    </h4>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm">
                      <p className="text-gray-700 mb-0.5">
                        报销单编号：BX2026031001
                      </p>
                      <p className="text-xs text-gray-400">
                        差旅报销-张三-2026-03-05
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">
                上传票据
              </h3>
              <button onClick={() => setShowUpload(false)}>
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#8B1450] cursor-pointer transition-colors">
              <Upload
                size={36}
                className="text-gray-400 mx-auto mb-2"
              />
              <p className="text-sm text-gray-600 mb-1">
                拖拽文件到此处或点击上传
              </p>
              <p className="text-xs text-gray-400">
                支持 XML、PDF、OFD 格式，单文件不超过 10MB
              </p>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowUpload(false)}
                className="flex-1 py-2 border border-gray-300 rounded text-gray-600 text-sm hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setShowUpload(false);
                  toast.success("票据上传成功！");
                }}
                className="flex-1 py-2 bg-[#8B1450] text-white rounded text-sm hover:bg-[#6e1040]"
              >
                确认上传
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}