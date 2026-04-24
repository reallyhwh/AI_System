import { useState } from "react";
import {
  X,
  Search,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

interface HRSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (employee: {
    name: string;
    employeeId: string;
  }) => void;
}

type TabType =
  | "recent"
  | "department"
  | "subordinate"
  | "organization"
  | "common";

interface Employee {
  id: string;
  name: string;
  department: string;
  position?: string;
}

interface OrgNode {
  id: string;
  name: string;
  children?: OrgNode[];
  employees?: Employee[];
}

export function HRSearchModal({
  isOpen,
  onClose,
  onSelect,
}: HRSearchModalProps) {
  const [activeTab, setActiveTab] =
    useState<TabType>("organization");
  const [searchText, setSearchText] = useState("");
  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<
    Set<string>
  >(new Set(["root"]));

  // Mock organization data
  const organizationData: OrgNode = {
    id: "root",
    name: "林德(中国)叉车有限公司",
    children: [
      {
        id: "dept1",
        name: "行政组织",
        children: [
          {
            id: "dept1-1",
            name: "财务部",
            employees: [
              {
                id: "1001",
                name: "李明",
                department: "财务部",
                position: "财务经理",
              },
              {
                id: "1002",
                name: "王芳",
                department: "财务部",
                position: "会计",
              },
            ],
          },
          {
            id: "dept1-2",
            name: "人力资源部",
            employees: [
              {
                id: "1003",
                name: "张三",
                department: "人力资源部",
                position: "HR经理",
              },
              {
                id: "1004",
                name: "李四",
                department: "人力资源部",
                position: "招聘专员",
              },
            ],
          },
        ],
      },
      {
        id: "dept2",
        name: "技术部",
        children: [
          {
            id: "dept2-1",
            name: "研发中心",
            employees: [
              {
                id: "1005",
                name: "赵六",
                department: "研发中心",
                position: "技术总监",
              },
              {
                id: "1006",
                name: "钱七",
                department: "研发中心",
                position: "高级工程师",
              },
            ],
          },
        ],
      },
    ],
  };

  // Mock recent employees
  const recentEmployees: Employee[] = [
    { id: "1311", name: "张三", department: "FSS3" },
    { id: "1002", name: "王芳", department: "财务部" },
  ];

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderOrgNode = (node: OrgNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren =
      node.children && node.children.length > 0;

    return (
      <div key={node.id} className="text-sm">
        <div
          className={`flex items-center gap-1 py-1.5 px-2 hover:bg-gray-100 cursor-pointer ${
            level > 0 ? "ml-" + level * 4 : ""
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown
                size={14}
                className="text-gray-500 flex-shrink-0"
              />
            ) : (
              <ChevronRight
                size={14}
                className="text-gray-500 flex-shrink-0"
              />
            )
          ) : (
            <span className="w-3.5"></span>
          )}
          <span className="text-gray-700">{node.name}</span>
        </div>

        {isExpanded && node.children && (
          <div>
            {node.children.map((child) =>
              renderOrgNode(child, level + 1),
            )}
          </div>
        )}

        {isExpanded && node.employees && (
          <div
            style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}
          >
            {node.employees.map((emp) => (
              <div
                key={emp.id}
                className={`flex items-center gap-2 py-1.5 px-2 hover:bg-blue-50 cursor-pointer ${
                  selectedEmployee?.id === emp.id
                    ? "bg-blue-100"
                    : ""
                }`}
                onClick={() => setSelectedEmployee(emp)}
              >
                <div className="w-6 h-6 rounded-full bg-[#8B1450] text-white flex items-center justify-center text-xs flex-shrink-0">
                  {emp.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-800">
                    {emp.name}
                  </div>
                  {emp.position && (
                    <div className="text-xs text-gray-500">
                      {emp.position}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "recent":
        return (
          <div className="space-y-1">
            {recentEmployees.map((emp) => (
              <div
                key={emp.id}
                className={`flex items-center gap-2 py-2 px-3 hover:bg-blue-50 cursor-pointer rounded ${
                  selectedEmployee?.id === emp.id
                    ? "bg-blue-100"
                    : ""
                }`}
                onClick={() => setSelectedEmployee(emp)}
              >
                <div className="w-8 h-8 rounded-full bg-[#8B1450] text-white flex items-center justify-center text-sm flex-shrink-0">
                  {emp.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-800">
                    {emp.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {emp.department}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case "organization":
        return (
          <div className="border border-gray-200 rounded bg-white">
            <div className="p-2 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>行政组织</span>
                <ChevronDown size={14} />
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {renderOrgNode(organizationData)}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-500 text-sm py-8">
            暂无数据
          </div>
        );
    }
  };

  const handleConfirm = () => {
    if (selectedEmployee) {
      onSelect({
        name: selectedEmployee.name,
        employeeId: selectedEmployee.id,
      });
      onClose();
      setSelectedEmployee(null);
    }
  };

  const handleClear = () => {
    setSelectedEmployee(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#8B1450] text-white flex items-center justify-center">
              <span className="text-sm">👤</span>
            </div>
            <h2 className="text-base font-semibold text-gray-800">
              人力资源
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 px-5 pt-3 border-b border-gray-200">
          <button
            className={`pb-2 text-sm transition-colors ${
              activeTab === "recent"
                ? "text-[#8B1450] border-b-2 border-[#8B1450] font-medium"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("recent")}
          >
            最近
          </button>
          <button
            className={`pb-2 text-sm transition-colors ${
              activeTab === "department"
                ? "text-[#8B1450] border-b-2 border-[#8B1450] font-medium"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("department")}
          >
            同部门
          </button>
          <button
            className={`pb-2 text-sm transition-colors ${
              activeTab === "subordinate"
                ? "text-[#8B1450] border-b-2 border-[#8B1450] font-medium"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("subordinate")}
          >
            我的下属
          </button>
          <button
            className={`pb-2 text-sm transition-colors ${
              activeTab === "organization"
                ? "text-[#8B1450] border-b-2 border-[#8B1450] font-medium"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("organization")}
          >
            组织架构
          </button>
          <button
            className={`pb-2 text-sm transition-colors ${
              activeTab === "common"
                ? "text-[#8B1450] border-b-2 border-[#8B1450] font-medium"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("common")}
          >
            常用组
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {renderTabContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClear}
            className="px-6 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            清除
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedEmployee}
            className={`px-6 py-2 rounded text-sm transition-colors ${
              selectedEmployee
                ? "bg-[#8B1450] text-white hover:bg-[#6e1040]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}