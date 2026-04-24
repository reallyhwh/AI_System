import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Download,
  Upload,
  Plus,
  Search,
  ArrowUpDown,
  RefreshCw,
  Pencil,
  Copy,
  Ban,
  History,
  CheckCircle,
  Trash2,
  X,
  PlusCircle,
  MinusCircle,
  ChevronLeft,
  ChevronRight,
  Mic,
} from "lucide-react";

type RuleType = "fee-standard" | "approve" | "validate" | "permission" | "warn";
type RuleStatus = "enable" | "disable" | "draft";
type RuleScope = "all" | "dept" | "level";
type TabType = "business-trip" | "travel-reimburse" | "employee-reimburse";

interface Rule {
  id: string;
  name: string;
  code: string;
  type: RuleType;
  scope: string;
  priority: number;
  status: RuleStatus;
  updateTime: string;
  version: number;
}

const MOCK_RULES: Rule[] = [
  {
    id: "1",
    name: "国内出差城市住宿标准规则",
    code: "RULE-BUSINESS-001",
    type: "fee-standard",
    scope: "全公司",
    priority: 1,
    status: "enable",
    updateTime: "2026-03-01 14:30",
    version: 2,
  },
  {
    id: "2",
    name: "国内出差城市住宿标准规则",
    code: "RULE-BUSINESS-001",
    type: "fee-standard",
    scope: "全公司",
    priority: 1,
    status: "disable",
    updateTime: "2026-02-15 10:00",
    version: 1,
  },
  {
    id: "3",
    name: "出差交通工具等级限制规则",
    code: "RULE-BUSINESS-002",
    type: "fee-standard",
    scope: "按职级生效",
    priority: 2,
    status: "enable",
    updateTime: "2026-02-28 09:15",
    version: 1,
  },
  {
    id: "4",
    name: "出差天数超7天审批升级规则",
    code: "RULE-BUSINESS-003",
    type: "approve",
    scope: "全公司",
    priority: 3,
    status: "enable",
    updateTime: "2026-02-25 16:40",
    version: 1,
  },
  {
    id: "5",
    name: "出差申请必填字段校验规则",
    code: "RULE-BUSINESS-004",
    type: "validate",
    scope: "全公司",
    priority: 4,
    status: "enable",
    updateTime: "2026-02-20 11:20",
    version: 1,
  },
  {
    id: "6",
    name: "预借款金额上限规则",
    code: "RULE-BUSINESS-005",
    type: "fee-standard",
    scope: "按部门职级生效",
    priority: 5,
    status: "draft",
    updateTime: "2026-03-08 10:00",
    version: 1,
  },
];

const RULE_TYPE_MAP: Record<RuleType, { label: string; color: string }> = {
  "fee-standard": { label: "费用标准规则", color: "bg-blue-50 text-blue-600" },
  approve: { label: "审批流程规则", color: "bg-purple-50 text-purple-600" },
  validate: { label: "表单校验规则", color: "bg-orange-50 text-orange-600" },
  permission: { label: "权限控制规则", color: "bg-indigo-50 text-indigo-600" },
  warn: { label: "异常预警规则", color: "bg-red-50 text-red-600" },
};

const RULE_STATUS_MAP: Record<RuleStatus, { label: string; color: string }> = {
  enable: { label: "已启用", color: "bg-green-50 text-green-600" },
  disable: { label: "已禁用", color: "bg-gray-50 text-gray-600" },
  draft: { label: "草稿", color: "bg-yellow-50 text-yellow-600" },
};

export function RuleConfig() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("business-trip");
  const [showDrawer, setShowDrawer] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterScope, setFilterScope] = useState("");
  const [searchText, setSearchText] = useState("");
  const [rules, setRules] = useState<Rule[]>(MOCK_RULES);

  const openDrawer = () => {
    setShowDrawer(true);
    document.body.style.overflow = "hidden";
  };

  const closeDrawer = () => {
    setShowDrawer(false);
    document.body.style.overflow = "auto";
  };

  const handleRuleToggle = (ruleId: string, currentStatus: RuleStatus) => {
    if (currentStatus === 'enable') {
      // 禁用规则
      setRules(rules.map(rule => 
        rule.id === ruleId ? { ...rule, status: 'disable' as RuleStatus } : rule
      ));
    } else if (currentStatus === 'disable' || currentStatus === 'draft') {
      // 启用规则，同时禁用同一规则的其他版本
      const ruleToEnable = rules.find(rule => rule.id === ruleId);
      if (ruleToEnable) {
        setRules(rules.map(rule => {
          // 找到同一规则（相同code）的其他版本
          if (rule.code === ruleToEnable.code && rule.id !== ruleId) {
            return { ...rule, status: 'disable' as RuleStatus };
          }
          // 启用当前规则
          if (rule.id === ruleId) {
            return { ...rule, status: 'enable' as RuleStatus };
          }
          return rule;
        }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/")}
              className="text-gray-500 hover:text-[#7B2CBF] transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">规则管理配置</h1>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              企业费控规则引擎
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button className="border border-gray-300 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-50 text-sm flex items-center gap-1">
              <Download size={16} />
              <span>导入规则</span>
            </button>
            <button className="border border-gray-300 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-50 text-sm flex items-center gap-1">
              <Upload size={16} />
              <span>导出规则</span>
            </button>
            <button
              onClick={openDrawer}
              className="bg-[#7B2CBF] text-white px-4 py-1.5 rounded-md hover:bg-[#7B2CBF]/90 transition-colors text-sm flex items-center gap-1"
            >
              <Plus size={16} />
              <span>新增规则</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex">
            <button
              onClick={() => setActiveTab("business-trip")}
              className={`px-6 py-3 border-b-2 font-medium transition-colors ${
                activeTab === "business-trip"
                  ? "text-[#7B2CBF] border-[#7B2CBF]"
                  : "text-gray-500 hover:text-gray-700 border-transparent"
              }`}
            >
              出差申请规则
            </button>
            <button
              onClick={() => setActiveTab("travel-reimburse")}
              className={`px-6 py-3 border-b-2 font-medium transition-colors ${
                activeTab === "travel-reimburse"
                  ? "text-[#7B2CBF] border-[#7B2CBF]"
                  : "text-gray-500 hover:text-gray-700 border-transparent"
              }`}
            >
              差旅报销规则
            </button>
            <button
              onClick={() => setActiveTab("employee-reimburse")}
              className={`px-6 py-3 border-b-2 font-medium transition-colors ${
                activeTab === "employee-reimburse"
                  ? "text-[#7B2CBF] border-[#7B2CBF]"
                  : "text-gray-500 hover:text-gray-700 border-transparent"
              }`}
            >
              员工报销规则
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              <div>
                <label className="text-sm text-gray-600 mr-2">规则类型</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/50 focus:border-[#7B2CBF] w-40"
                >
                  <option value="">全部类型</option>
                  <option value="fee-standard">费用标准规则</option>
                  <option value="approve">审批流程规则</option>
                  <option value="validate">表单校验规则</option>
                  <option value="permission">权限控制规则</option>
                  <option value="warn">异常预警规则</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mr-2">启用状态</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/50 focus:border-[#7B2CBF] w-32"
                >
                  <option value="">全部状态</option>
                  <option value="enable">已启用</option>
                  <option value="disable">已禁用</option>
                  <option value="draft">草稿</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mr-2">适用范围</label>
                <select
                  value={filterScope}
                  onChange={(e) => setFilterScope(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/50 focus:border-[#7B2CBF] w-36"
                >
                  <option value="">全部范围</option>
                  <option value="all">全公司</option>
                  <option value="dept">指定部门</option>
                  <option value="level">指定职级</option>
                </select>
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="搜索规则名称/编码..."
                className="pl-9 pr-12 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/50 focus:border-[#7B2CBF] w-64"
              />
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <button
                onClick={() => setShowVoiceModal(true)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#7B2CBF] transition-colors"
                title="语音输入"
              >
                <Mic size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* List Actions */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-500">
            共 <span className="text-[#7B2CBF] font-medium">18</span> 条规则
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate("/")}
              className="text-sm text-gray-600 hover:text-[#7B2CBF] flex items-center gap-1"
            >
              <ArrowLeft size={16} />
              <span>返回首页</span>
            </button>
            <button className="text-sm text-gray-600 hover:text-[#7B2CBF] flex items-center gap-1">
              <ArrowUpDown size={16} />
              <span>调整优先级</span>
            </button>
            <button className="text-sm text-gray-600 hover:text-[#7B2CBF] flex items-center gap-1">
              <RefreshCw size={16} />
              <span>刷新</span>
            </button>
          </div>
        </div>

        {/* Rules Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600 w-6">
                  <input
                    type="checkbox"
                    className="rounded text-[#7B2CBF] focus:ring-[#7B2CBF]/50"
                  />
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  规则名称
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  规则类型
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  适用范围
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  优先级
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  版本
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  状态
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  更新时间
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      className="rounded text-[#7B2CBF] focus:ring-[#7B2CBF]/50"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{rule.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{rule.code}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${RULE_TYPE_MAP[rule.type].color}`}
                    >
                      {RULE_TYPE_MAP[rule.type].label}
                    </span>
                  </td>
                  <td className="py-3 px-4">{rule.scope}</td>
                  <td className="py-3 px-4">
                    <span className="text-[#7B2CBF] font-medium">{rule.priority}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">v{rule.version}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${RULE_STATUS_MAP[rule.status].color}`}
                    >
                      {RULE_STATUS_MAP[rule.status].label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{rule.updateTime}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button className="text-gray-500 hover:text-[#7B2CBF]" title="编辑">
                        <Pencil size={16} />
                      </button>
                      <button className="text-gray-500 hover:text-[#FFB020]" title="复制">
                        <Copy size={16} />
                      </button>
                      {rule.status === "draft" ? (
                        <>
                          <button
                            className="text-gray-500 hover:text-[#00D4AA]"
                            title="启用"
                            onClick={() => handleRuleToggle(rule.id, rule.status)}
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            className="text-gray-500 hover:text-[#F53F3F]"
                            title="删除"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="text-gray-500 hover:text-[#F53F3F]"
                            title="禁用"
                            onClick={() => handleRuleToggle(rule.id, rule.status)}
                          >
                            <Ban size={16} />
                          </button>
                          <button
                            className="text-gray-500 hover:text-[#7B2CBF]"
                            title="查看日志"
                          >
                            <History size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-500">显示 1-5 条，共 18 条</div>
            <div className="flex items-center gap-1">
              <button
                disabled
                className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-[#7B2CBF] text-white">
                1
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:border-[#7B2CBF] hover:text-[#7B2CBF]">
                2
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:border-[#7B2CBF] hover:text-[#7B2CBF]">
                3
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:border-[#7B2CBF] hover:text-[#7B2CBF]">
                4
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:border-[#7B2CBF] hover:text-[#7B2CBF]">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={closeDrawer}
          />
          {/* Drawer Content */}
          <div className="absolute right-0 top-0 bottom-0 w-[900px] max-w-full bg-white shadow-xl flex flex-col">
            {/* Drawer Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">新增规则</h2>
              <button
                onClick={closeDrawer}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <form className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <span className="w-1 h-4 bg-[#7B2CBF] rounded-sm"></span>
                    基础信息
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        规则名称 <span className="text-[#F53F3F]">*</span>
                      </label>
                      <input
                        type="text"
                        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/50 focus:border-[#7B2CBF] w-full"
                        placeholder="请输入规则名称"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        规则编码 <span className="text-[#F53F3F]">*</span>
                      </label>
                      <input
                        type="text"
                        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/50 focus:border-[#7B2CBF] w-full"
                        placeholder="系统自动生成，可修改"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        所属业务模块 <span className="text-[#F53F3F]">*</span>
                      </label>
                      <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/50 focus:border-[#7B2CBF] w-full">
                        <option value="business-trip">出差申请</option>
                        <option value="travel-reimburse">差旅报销</option>
                        <option value="employee-reimburse">员工报销</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        规则类型 <span className="text-[#F53F3F]">*</span>
                      </label>
                      <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/50 focus:border-[#7B2CBF] w-full">
                        <option value="">请选择规则类型</option>
                        <option value="fee-standard">费用标准规则</option>
                        <option value="approve">审批流程规则</option>
                        <option value="validate">表单校验规则</option>
                        <option value="permission">权限控制规则</option>
                        <option value="warn">异常预警规则</option>
                        <option value="calculate">自动计算规则</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        规则优先级 <span className="text-[#F53F3F]">*</span>
                      </label>
                      <input
                        type="number"
                        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/50 focus:border-[#7B2CBF] w-full"
                        defaultValue={10}
                        min={1}
                        max={999}
                        placeholder="数字越小，优先级越高"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        优先级1为最高，冲突时优先执行高优先级规则
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        规则状态
                      </label>
                      <div className="flex items-center gap-4 mt-1.5">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="status"
                            value="draft"
                            className="text-[#7B2CBF] focus:ring-[#7B2CBF]/50"
                            defaultChecked
                          />
                          <span className="ml-2 text-sm">草稿</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="status"
                            value="enable"
                            className="text-[#7B2CBF] focus:ring-[#7B2CBF]/50"
                          />
                          <span className="ml-2 text-sm">立即启用</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      规则描述
                    </label>
                    <textarea
                      className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/50 focus:border-[#7B2CBF] w-full"
                      rows={2}
                      placeholder="请描述规则的用途、适用场景等说明信息"
                    />
                  </div>
                </div>

                {/* Scope Config */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <span className="w-1 h-4 bg-[#7B2CBF] rounded-sm"></span>
                    生效范围配置
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        生效人员范围
                      </label>
                      <div className="flex items-center gap-4 mb-3">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="scope"
                            value="all"
                            className="text-[#7B2CBF] focus:ring-[#7B2CBF]/50"
                            defaultChecked
                          />
                          <span className="ml-2 text-sm">全公司生效</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="scope"
                            value="custom"
                            className="text-[#7B2CBF] focus:ring-[#7B2CBF]/50"
                          />
                          <span className="ml-2 text-sm">指定范围生效</span>
                        </label>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">所属部门</label>
                        <select
                          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/50 focus:border-[#7B2CBF] w-full"
                          disabled
                          multiple
                        >
                          <option>全部部门</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">人员职级</label>
                        <select
                          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/50 focus:border-[#7B2CBF] w-full"
                          disabled
                          multiple
                        >
                          <option>全部职级</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">人员岗位</label>
                        <select
                          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/50 focus:border-[#7B2CBF] w-full"
                          disabled
                          multiple
                        >
                          <option>全部岗位</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                        生效时间 <span className="text-[#F53F3F]">*</span>
                      </label>
                        <input
                          type="date"
                          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/50 focus:border-[#7B2CBF] w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">不填则永久生效</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          失效时间
                        </label>
                        <input
                          type="date"
                          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/50 focus:border-[#7B2CBF] w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">不填则永久生效</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Condition Config */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-1 h-4 bg-[#7B2CBF] rounded-sm"></span>
                      规则触发条件配置
                    </span>
                    <button
                      type="button"
                      className="text-sm text-[#7B2CBF] hover:text-[#7B2CBF]/80 flex items-center gap-1"
                    >
                      <PlusCircle size={16} />
                      <span>添加条件组</span>
                    </button>
                  </h3>
                  <div className="text-sm text-gray-500">
                    当满足以下条件时，触发执行规则动作；无任何条件则全局生效
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">条件组 1</span>
                        <select className="border border-gray-300 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/50 focus:border-[#7B2CBF]">
                          <option value="and">满足以下所有条件</option>
                          <option value="or">满足以下任意条件</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        className="text-sm text-gray-500 hover:text-[#F53F3F]"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/50 focus:border-[#7B2CBF] w-48">
                          <option value="">选择条件字段 *</option>
                          <option value="user_level">用户职级</option>
                          <option value="user_dept">所属部门</option>
                          <option value="trip_city">出差城市</option>
                          <option value="trip_days">出差天数</option>
                          <option value="fee_type">费用类型</option>
                          <option value="fee_amount">费用金额</option>
                        </select>
                        <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/50 focus:border-[#7B2CBF] w-32">
                          <option value="eq">等于</option>
                          <option value="ne">不等于</option>
                          <option value="gt">大于</option>
                          <option value="gte">大于等于</option>
                          <option value="lt">小于</option>
                          <option value="lte">小于等于</option>
                          <option value="in">属于</option>
                          <option value="not_in">不属于</option>
                          <option value="contains">包含</option>
                        </select>
                        <input
                          type="text"
                          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/50 focus:border-[#7B2CBF] w-40"
                          placeholder="请输入条件值 *"
                        />
                        <button
                          type="button"
                          className="text-[#7B2CBF] hover:text-[#7B2CBF]/80"
                        >
                          <PlusCircle size={20} />
                        </button>
                        <button type="button" className="text-gray-500 hover:text-[#F53F3F]">
                          <MinusCircle size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Config */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-1 h-4 bg-[#7B2CBF] rounded-sm"></span>
                      规则执行动作配置
                    </span>
                    <button
                      type="button"
                      className="text-sm text-[#7B2CBF] hover:text-[#7B2CBF]/80 flex items-center gap-1"
                    >
                      <PlusCircle size={16} />
                      <span>添加执行动作</span>
                    </button>
                  </h3>
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">动作 1</span>
                        <button
                          type="button"
                          className="text-sm text-gray-500 hover:text-[#F53F3F]"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            动作类型 <span className="text-[#F53F3F]">*</span>
                          </label>
                          <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/50 focus:border-[#7B2CBF] w-full">
                            <option value="">请选择执行动作</option>
                            <option value="fee_limit">设置费用上限标准</option>
                            <option value="field_required">设置字段必填</option>
                            <option value="field_disable">设置字段禁用/隐藏</option>
                            <option value="approve_add">增加审批节点</option>
                            <option value="submit_block">拦截表单提交</option>
                            <option value="warn_tip">弹出提示预警</option>
                            <option value="auto_calc">自动计算数值</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Other Config */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <span className="w-1 h-4 bg-[#7B2CBF] rounded-sm"></span>
                    其他配置
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      异常处理
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="error"
                          value="skip"
                          className="text-[#7B2CBF] focus:ring-[#7B2CBF]/50"
                          defaultChecked
                        />
                        <span className="ml-2 text-sm">
                          规则执行异常时，跳过规则，允许提交
                        </span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="error"
                          value="block"
                          className="text-[#7B2CBF] focus:ring-[#7B2CBF]/50"
                        />
                        <span className="ml-2 text-sm">规则执行异常时，拦截提交</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      操作日志
                    </label>
                    <div className="text-sm text-gray-500">
                      规则创建、修改、启用/禁用均会自动记录操作日志，可在规则列表查看
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Drawer Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={closeDrawer}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
              >
                取消
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm">
                保存为草稿
              </button>
              <button className="px-6 py-2 bg-[#7B2CBF] text-white rounded-md hover:bg-[#7B2CBF]/90 text-sm">
                保存并启用
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Input Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowVoiceModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">语音输入</h3>
                <button
                  onClick={() => setShowVoiceModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">标准化话术模板：</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
                  我需要申请一次出差，出差类型为#出差类型#，出发地是：...，目的地是：...，出差公司为：...，出差原因是：...，交通工具为：...，出差日期从...到...。#是/否#需要第三方承担费用（若是为，费用承担单位为：...）#是/否#通过携程预定酒店，#是/否#可以通过邮件、电话、teams沟通解决，帮忙处理下申请流程～
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-[#7B2CBF]/10 flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-[#7B2CBF] flex items-center justify-center">
                    <Mic size={32} className="text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-500">点击麦克风开始语音输入</p>
              </div>
              
              <div className="mb-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
                  我需要申请一次出差，出差类型为#出差类型#，出发地是：...，目的地是：...，出差公司为：...，出差原因是：...，交通工具为：...，出差日期从...到...。#是/否#需要第三方承担费用（若是为，费用承担单位为：...）#是/否#通过携程预定酒店，#是/否#可以通过邮件、电话、teams沟通解决，帮忙处理下申请流程～
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowVoiceModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
                >
                  取消
                </button>
                <button className="flex-1 px-4 py-2 bg-[#7B2CBF] text-white rounded-md hover:bg-[#7B2CBF]/90 text-sm">
                  确认录入
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
