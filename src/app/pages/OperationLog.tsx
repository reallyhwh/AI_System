import { useState } from "react";
import { useNavigate } from "react-router";

export function OperationLog() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([
    {
      id: 1,
      operationTime: "2026-04-01 14:32:21",
      operationType: "差旅报销"
    },
    {
      id: 2,
      operationTime: "2026-04-01 14:32:13",
      operationType: "出差申请"
    }
  ]);

  return (
    <div className="flex flex-col h-screen bg-[#F0F0F0]">
      {/* Header */}
      <header className="bg-[#8B1450] text-white px-4 py-3 shadow-md flex-shrink-0 flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="text-white hover:bg-white/10 rounded-full p-1 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <h1 className="text-base font-semibold tracking-wide flex-1 text-center">
          操作日志
        </h1>
        <div className="w-5"></div> {/* Spacer */}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-sm text-gray-500 mb-1">出差申请</p>
            <p className="text-lg font-semibold text-red-500">1</p>
            <p className="text-xs text-gray-400 mt-1">打开记录</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-sm text-gray-500 mb-1">差旅报销</p>
            <p className="text-lg font-semibold text-red-500">1</p>
            <p className="text-xs text-gray-400 mt-1">打开记录</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-sm text-gray-500 mb-1">员工报销</p>
            <p className="text-lg font-semibold text-red-500">1</p>
            <p className="text-xs text-gray-400 mt-1">打开记录</p>
          </div>
        </div>

        {/* Operation records */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 px-4 py-3">
            <p className="text-sm font-semibold text-gray-700">操作记录</p>
          </div>
          <div className="divide-y divide-gray-200">
            {records.map((record) => (
              <div key={record.id} className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm text-gray-700">{record.operationTime}</span>
                <span className="text-sm text-gray-700">{record.operationType}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-between items-center">
          <span className="text-xs text-gray-500">共2条 / 第1 / 1页</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed" disabled>
              上一页
            </button>
            <button className="px-3 py-1 border border-[#8B1450] rounded text-sm text-white bg-[#8B1450] hover:bg-[#6e1040]">
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
