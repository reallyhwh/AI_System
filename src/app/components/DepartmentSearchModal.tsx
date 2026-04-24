import { useState } from "react";
import { X, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface DepartmentSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (department: { name: string; code: string }) => void;
}

interface Department {
  name: string;
  code: string;
}

export function DepartmentSearchModal({ isOpen, onClose, onSelect }: DepartmentSearchModalProps) {
  const [searchText, setSearchText] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock department data
  const allDepartments: Department[] = [
    { name: "COX111", code: "COX111" },
    { name: "CTP11", code: "CTP11" },
    { name: "IT-AP-IS", code: "IT-AP-IS" },
    { name: "ITBS", code: "ITBS" },
    { name: "ITCC", code: "ITCC" },
    { name: "ITDS", code: "ITDS" },
    { name: "ITNC", code: "ITNC" },
    { name: "KDM", code: "KDM" },
    { name: "KDMCS", code: "KDMCS" },
    { name: "财务部", code: "FIN001" },
    { name: "人力资源部", code: "HR001" },
    { name: "技术部", code: "TECH001" },
    { name: "研发中心", code: "RD001" },
    { name: "市场部", code: "MKT001" },
    { name: "销售部", code: "SALES001" },
    { name: "采购部", code: "PURCH001" },
    { name: "生产部", code: "PROD001" },
    { name: "质量部", code: "QA001" },
    { name: "物流部", code: "LOG001" },
    { name: "行政部", code: "ADM001" },
  ];

  const totalItems = 2917; // Mock total count from the image
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const filteredDepartments = allDepartments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchText.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleConfirm = () => {
    if (selectedDepartment) {
      onSelect(selectedDepartment);
      onClose();
      setSelectedDepartment(null);
      setSearchText("");
      setCurrentPage(1);
    }
  };

  const handleClear = () => {
    setSelectedDepartment(null);
  };

  const handleCancel = () => {
    onClose();
    setSelectedDepartment(null);
    setSearchText("");
    setCurrentPage(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#4A90E2] text-white flex items-center justify-center">
              <span className="text-sm">🏢</span>
            </div>
            <h2 className="text-base font-semibold text-gray-800">费用承担部门</h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-5 py-4 border-b border-gray-200">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="搜索"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 pr-10 text-sm focus:outline-none focus:border-[#8B1450] focus:ring-1 focus:ring-[#8B1450]/30"
              />
              <Search
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap">
              高级搜索
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-600">
                    部门名称
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-600">
                    部门编号
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDepartments.map((dept) => (
                  <tr
                    key={dept.code}
                    className={`cursor-pointer hover:bg-blue-50 transition-colors ${
                      selectedDepartment?.code === dept.code ? "bg-blue-100" : ""
                    }`}
                    onClick={() => setSelectedDepartment(dept)}
                  >
                    <td className="px-5 py-3 text-sm text-gray-800">{dept.name}</td>
                    <td className="px-5 py-3 text-sm text-[#4A90E2]">{dept.code}</td>
                  </tr>
                ))}
                {filteredDepartments.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-5 py-8 text-center text-sm text-gray-500">
                      暂无数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 px-5 py-3 border-t border-gray-200 bg-gray-50">
            <span className="text-sm text-gray-600">共{totalItems}条</span>
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronsLeft size={16} className="text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} className="text-gray-600" />
            </button>
            <div className="flex items-center gap-1">
              <span className="text-sm text-[#4A90E2] font-medium">第{currentPage}</span>
              <span className="text-sm text-gray-600">/ {totalPages}页</span>
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} className="text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronsRight size={16} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleClear}
            className="px-6 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            清除
          </button>
          <button
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            取消
          </button>
          
        </div>
      </div>
    </div>
  );
}