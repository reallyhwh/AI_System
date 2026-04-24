import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Save,
  RotateCcw,
  Type,
  AlignLeft,
  Hash,
  Calendar,
  List,
  CheckSquare,
  CircleDot,
  GripVertical,
  Pencil,
  Trash2,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  Search,
  History,
  X,
} from "lucide-react";
import { toast } from "sonner";

type FieldType = "text" | "textarea" | "number" | "date" | "time" | "select" | "checkbox" | "radio" | "query";

interface EventCondition {
  field: string;
  operator: string;
  value: string;
}

interface SectionEvent {
  enabled: boolean;
  conditions: EventCondition[];
  action: string;
}

interface FieldDef {
  id: number;
  label: string;
  type: FieldType;
  required: boolean;
  section: string;
  options?: string[];
  urlEnabled?: boolean;
  url?: string;
  eventEnabled?: boolean;
  eventConditions?: EventCondition[];
  eventAction?: string; // 'show' or 'hide'
}

interface SectionDef {
  name: string;
  event?: SectionEvent;
}

const FIELD_TYPE_ICONS: Record<FieldType, React.ElementType> = {
  text: Type,
  textarea: AlignLeft,
  number: Hash,
  date: Calendar,
  time: Calendar,
  select: List,
  checkbox: CheckSquare,
  radio: CircleDot,
  query: Search,
};

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "单行文本",
  textarea: "多行文本",
  number: "数字",
  date: "日期",
  time: "时间",
  select: "下拉选择",
  checkbox: "复选框",
  radio: "单选框",
  query: "查询",
};

const MODULE_FIELDS: Record<string, FieldDef[]> = {
  "business-trip": [
    // 基本信息
    { id: 1, label: "标题", type: "text", required: false, section: "基本信息" },
    { id: 2, label: "创建日期", type: "date", required: false, section: "基本信息" },
    { id: 3, label: "创建人", type: "text", required: false, section: "基本信息" },
    { id: 4, label: "员工号", type: "text", required: false, section: "基本信息" },
    { id: 5, label: "创建人公司", type: "text", required: false, section: "基本信息" },
    { id: 6, label: "创建人部门", type: "text", required: false, section: "基本信息" },
    
    // 详细信息
    { id: 7, label: "实际出差人", type: "text", required: true, section: "详细信息" },
    { id: 8, label: "实际出差人工号", type: "text", required: false, section: "详细信息" },
    { id: 9, label: "成本中心", type: "text", required: false, section: "详细信息" },
    { id: 10, label: "内部订单号", type: "text", required: false, section: "详细信息" },
    { id: 11, label: "是否第三方承担费用", type: "select", required: false, section: "详细信息" },
    { id: 12, label: "第三方费用承担单位", type: "text", required: false, section: "详细信息" },
    { id: 13, label: "费用承担确认函", type: "text", required: false, section: "详细信息" },
    { id: 14, label: "费用承担部门", type: "text", required: false, section: "详细信息" },
    { id: 15, label: "费用承担成本中心", type: "text", required: false, section: "详细信息" },
    { id: 16, label: "出差类型", type: "select", required: true, section: "详细信息" },
    { id: 17, label: "是否通过携程预订酒店", type: "select", required: true, section: "详细信息" },
    { id: 18, label: "往返公里数", type: "text", required: false, section: "详细信息" },
    { id: 19, label: "是否享受差旅补贴", type: "select", required: true, section: "详细信息" },
    { id: 20, label: "K2系统模块", type: "select", required: false, section: "详细信息" },
    { id: 21, label: "培训申请单号", type: "text", required: false, section: "详细信息" },
    { id: 22, label: "是否可以通过邮件、电话、Teams沟通解决？", type: "select", required: true, section: "详细信息" },
    
    // 出差明细
    { id: 23, label: "出发地", type: "text", required: true, section: "出差明细" },
    { id: 24, label: "目的地", type: "text", required: true, section: "出差明细" },
    { id: 25, label: "出差公司", type: "text", required: false, section: "出差明细" },
    { id: 26, label: "出差原因", type: "text", required: true, section: "出差明细" },
    { id: 27, label: "交通工具", type: "select", required: true, section: "出差明细" },
    { id: 28, label: "出差开始日期", type: "date", required: true, section: "出差明细" },
    { id: 29, label: "出差返回日期", type: "date", required: true, section: "出差明细" },
    { id: 30, label: "出差天数", type: "number", required: false, section: "出差明细" },
    
    // 预借款
    { id: 31, label: "是否需要预借款", type: "select", required: true, section: "预借款" },
    { id: 32, label: "借款金额", type: "number", required: false, section: "预借款" },
    { id: 33, label: "币别（借款）", type: "select", required: false, section: "预借款" },
    
    // 预计费用
    { id: 34, label: "长途交通费(机票、火车等)", type: "number", required: false, section: "预计费用" },
    { id: 35, label: "市内交通费", type: "number", required: false, section: "预计费用" },
    { id: 36, label: "总预计住宿费", type: "number", required: false, section: "预计费用" },
    { id: 37, label: "补贴", type: "number", required: false, section: "预计费用" },
    { id: 38, label: "本次出差预计费用合计", type: "number", required: false, section: "预计费用" },
    
    // 审批意见
    { id: 39, label: "签字意见", type: "textarea", required: false, section: "审批意见" },
  ],
  "travel-reimbursement": [
    // 基本信息
    { id: 1, label: "标题", type: "text", required: false, section: "基本信息" },
    { id: 2, label: "创建日期", type: "date", required: false, section: "基本信息" },
    { id: 3, label: "创建人", type: "text", required: false, section: "基本信息" },
    { id: 4, label: "员工号", type: "text", required: false, section: "基本信息" },
    { id: 5, label: "创建人公司", type: "text", required: false, section: "基本信息" },
    { id: 6, label: "创建人部门", type: "text", required: false, section: "基本信息" },
    
    // 详细信息
    { id: 7, label: "报销类型", type: "select", required: true, section: "详细信息" },
    { id: 8, label: "内部订单号", type: "text", required: false, section: "详细信息" },
    { id: 9, label: "实际报销人", type: "text", required: true, section: "详细信息" },
    { id: 10, label: "实际报销人部门", type: "text", required: false, section: "详细信息" },
    { id: 11, label: "实际报销人工号", type: "text", required: false, section: "详细信息" },
    { id: 12, label: "成本中心", type: "text", required: false, section: "详细信息" },
    { id: 13, label: "出差申请列表", type: "text", required: true, section: "详细信息" },
    { id: 14, label: "是否第三方承担费用", type: "select", required: true, section: "详细信息" },
    { id: 15, label: "第三方费用承担单位", type: "text", required: false, section: "详细信息" },
    { id: 16, label: "费用承担部门", type: "text", required: false, section: "详细信息" },
    { id: 17, label: "费用承担成本中心", type: "text", required: false, section: "详细信息" },
    { id: 18, label: "是否通过携程预订酒店", type: "select", required: false, section: "详细信息" },
    { id: 19, label: "出差类型", type: "text", required: false, section: "详细信息" },
    { id: 20, label: "是否享受差旅补贴", type: "text", required: false, section: "详细信息" },
    { id: 21, label: "报销事由", type: "text", required: false, section: "详细信息" },
    
    // 差旅信息
    { id: 22, label: "出发地", type: "text", required: false, section: "差旅信息" },
    { id: 23, label: "目的地", type: "text", required: false, section: "差旅信息" },
    { id: 24, label: "申请出发日", type: "date", required: false, section: "差旅信息" },
    { id: 25, label: "申请返程日", type: "date", required: false, section: "差旅信息" },
    { id: 26, label: "申请天数", type: "text", required: false, section: "差旅信息" },
    { id: 27, label: "实际出发日", type: "date", required: true, section: "差旅信息" },
    { id: 28, label: "出发时间", type: "text", required: true, section: "差旅信息" },
    { id: 29, label: "实际返程日", type: "date", required: true, section: "差旅信息" },
    { id: 30, label: "返程时间", type: "text", required: true, section: "差旅信息" },
    { id: 31, label: "实际天数", type: "text", required: false, section: "差旅信息" },
    { id: 32, label: "交通工具", type: "select", required: false, section: "差旅信息" },
    { id: 33, label: "早餐", type: "text", required: false, section: "差旅信息" },
    { id: 34, label: "午餐", type: "text", required: false, section: "差旅信息" },
    { id: 35, label: "晚餐", type: "text", required: false, section: "差旅信息" },
    
    // 工单信息
    { id: 36, label: "CRM工单", type: "text", required: true, section: "工单信息" },
    { id: 37, label: "出发日期", type: "date", required: false, section: "工单信息" },
    { id: 38, label: "出发时间", type: "text", required: false, section: "工单信息" },
    { id: 39, label: "返程日期", type: "date", required: false, section: "工单信息" },
    { id: 40, label: "返程时间", type: "text", required: false, section: "工单信息" },
    { id: 41, label: "车牌号", type: "text", required: false, section: "工单信息" },
    { id: 42, label: "客户名称", type: "text", required: false, section: "工单信息" },
    { id: 43, label: "客户地址", type: "text", required: false, section: "工单信息" },
    
    // CRM工单信息
    { id: 44, label: "出发地", type: "text", required: true, section: "CRM工单信息" },
    { id: 45, label: "目的地", type: "text", required: true, section: "CRM工单信息" },
    { id: 46, label: "实际出差天数", type: "text", required: false, section: "CRM工单信息" },
    { id: 47, label: "往返公里数", type: "text", required: true, section: "CRM工单信息" },
    { id: 48, label: "交通工具", type: "select", required: false, section: "CRM工单信息" },
    { id: 49, label: "非自费早餐", type: "text", required: false, section: "CRM工单信息" },
    { id: 50, label: "非自费午餐", type: "text", required: false, section: "CRM工单信息" },
    { id: 51, label: "非自费晚餐", type: "text", required: false, section: "CRM工单信息" },
    
    // 交通费
    { id: 52, label: "日期", type: "date", required: true, section: "交通费" },
    { id: 53, label: "出发地", type: "text", required: true, section: "交通费" },
    { id: 54, label: "目的地", type: "text", required: true, section: "交通费" },
    { id: 55, label: "公务事由", type: "text", required: true, section: "交通费" },
    { id: 56, label: "金额", type: "text", required: false, section: "交通费" },
    { id: 57, label: "币别", type: "select", required: false, section: "交通费" },
    
    // 住宿费
    { id: 58, label: "住宿城市", type: "text", required: true, section: "住宿费" },
    { id: 59, label: "住宿天数", type: "text", required: true, section: "住宿费" },
    { id: 60, label: "不含税金额", type: "text", required: false, section: "住宿费" },
    { id: 61, label: "进项税额", type: "text", required: false, section: "住宿费" },
    { id: 62, label: "总金额", type: "text", required: false, section: "住宿费" },
    { id: 63, label: "币别", type: "select", required: false, section: "住宿费" },
    { id: 64, label: "超标原因", type: "text", required: false, section: "住宿费" },
    
    // 报销合计
    { id: 65, label: "交通费与住宿费合计", type: "text", required: false, section: "报销合计" },
    { id: 66, label: "发票金额", type: "text", required: false, section: "报销合计" },
    { id: 67, label: "是否上传发票", type: "select", required: true, section: "报销合计" },
    
    // 发票信息
    { id: 68, label: "发票号码", type: "text", required: true, section: "发票信息" },
    { id: 69, label: "发票日期", type: "date", required: false, section: "发票信息" },
    { id: 70, label: "税额", type: "text", required: false, section: "发票信息" },
    { id: 71, label: "发票总额", type: "text", required: false, section: "发票信息" },
    { id: 72, label: "购买方", type: "text", required: false, section: "发票信息" },
    { id: 73, label: "购买方识别号", type: "text", required: false, section: "发票信息" },
    { id: 74, label: "销售方", type: "text", required: false, section: "发票信息" },
    { id: 75, label: "销售方识别号", type: "text", required: false, section: "发票信息" },
    { id: 76, label: "发票类型", type: "select", required: false, section: "发票信息" },
    
    // 补贴信息
    { id: 77, label: "差旅补贴", type: "text", required: false, section: "补贴信息" },
    { id: 78, label: "补贴币别", type: "select", required: false, section: "补贴信息" },
    { id: 79, label: "扣除金额", type: "text", required: false, section: "补贴信息" },
    { id: 80, label: "其他补贴", type: "text", required: false, section: "补贴信息" },
    { id: 81, label: "补贴小计", type: "text", required: false, section: "补贴信息" },
    { id: 82, label: "申请金额合计", type: "text", required: false, section: "补贴信息" },
    { id: 83, label: "财务审核调整金额", type: "text", required: false, section: "补贴信息" },
    { id: 84, label: "调整金额说明", type: "text", required: false, section: "补贴信息" },
    { id: 85, label: "户名", type: "text", required: false, section: "补贴信息" },
    { id: 86, label: "收款人账号", type: "text", required: false, section: "补贴信息" },
    { id: 87, label: "收款人开户行", type: "text", required: false, section: "补贴信息" },
    { id: 88, label: "相关附件", type: "text", required: false, section: "补贴信息" },
    
    // 预借款信息
    { id: 89, label: "预借款", type: "text", required: false, section: "预借款信息" },
    { id: 90, label: "已还款", type: "text", required: false, section: "预借款信息" },
    { id: 91, label: "实际还款", type: "text", required: false, section: "预借款信息" },
    { id: 92, label: "借款币别", type: "select", required: false, section: "预借款信息" },
    
    // 审批信息
    { id: 93, label: "签字意见", type: "textarea", required: false, section: "审批信息" },
  ],
  "employee-reimbursement": [
    // 基本信息
    { id: 1, label: "标题", type: "text", required: false, section: "基本信息" },
    { id: 2, label: "创建日期", type: "date", required: false, section: "基本信息" },
    { id: 3, label: "创建人", type: "text", required: false, section: "基本信息" },
    { id: 4, label: "员工号", type: "text", required: false, section: "基本信息" },
    { id: 5, label: "创建人公司", type: "text", required: false, section: "基本信息" },
    { id: 6, label: "创建人部门", type: "text", required: false, section: "基本信息" },
    { id: 7, label: "成本中心", type: "text", required: false, section: "基本信息" },
    { id: 8, label: "内部订单号", type: "text", required: false, section: "基本信息" },
    
    // 详细信息
    { id: 9, label: "实际报销人", type: "text", required: true, section: "详细信息" },
    { id: 10, label: "实际报销人工号", type: "text", required: false, section: "详细信息" },
    { id: 11, label: "员工客户号", type: "text", required: false, section: "详细信息" },
    { id: 12, label: "报销事由", type: "text", required: true, section: "详细信息" },
    
    // 报销信息
    { id: 13, label: "费用成本中心", type: "text", required: true, section: "报销信息" },
    { id: 14, label: "费用分类", type: "select", required: true, section: "报销信息" },
    { id: 15, label: "费用项目", type: "text", required: true, section: "报销信息" },
    { id: 16, label: "支出金额", type: "text", required: true, section: "报销信息" },
    { id: 17, label: "费用归属期间", type: "text", required: true, section: "报销信息" },
    { id: 18, label: "车牌号", type: "text", required: false, section: "报销信息" },
    { id: 19, label: "使用人工号", type: "text", required: false, section: "报销信息" },
    { id: 20, label: "说明一", type: "text", required: true, section: "报销信息" },
    { id: 21, label: "说明二", type: "text", required: false, section: "报销信息" },
    { id: 22, label: "K2系统模块", type: "text", required: false, section: "报销信息" },
    { id: 23, label: "K2系统链接", type: "text", required: false, section: "报销信息" },
    { id: 24, label: "采购订单号(PO)", type: "text", required: false, section: "报销信息" },
    { id: 25, label: "供应商号", type: "text", required: false, section: "报销信息" },
    
    // 发票信息
    { id: 26, label: "发票号码", type: "text", required: true, section: "发票信息" },
    { id: 27, label: "发票日期", type: "date", required: false, section: "发票信息" },
    { id: 28, label: "税额", type: "text", required: false, section: "发票信息" },
    { id: 29, label: "发票总额", type: "text", required: false, section: "发票信息" },
    { id: 30, label: "购买方", type: "text", required: false, section: "发票信息" },
    { id: 31, label: "购买方识别号", type: "text", required: false, section: "发票信息" },
    { id: 32, label: "销售方", type: "text", required: false, section: "发票信息" },
    { id: 33, label: "销售方识别号", type: "text", required: false, section: "发票信息" },
    { id: 34, label: "发票类型", type: "select", required: false, section: "发票信息" },
    
    // 预借款
    { id: 35, label: "借款流程", type: "text", required: false, section: "预借款" },
    { id: 36, label: "借款单号", type: "text", required: false, section: "预借款" },
    { id: 37, label: "单内序号", type: "text", required: true, section: "预借款" },
    { id: 38, label: "借款金额", type: "text", required: false, section: "预借款" },
    { id: 39, label: "已还金额", type: "text", required: false, section: "预借款" },
    { id: 40, label: "审批中待还金额", type: "text", required: false, section: "预借款" },
    { id: 41, label: "未还金额", type: "text", required: false, section: "预借款" },
    { id: 42, label: "本次还款金额", type: "text", required: false, section: "预借款" },
    
    // 报销合计
    { id: 43, label: "结算金额", type: "text", required: false, section: "报销合计" },
    { id: 44, label: "发票金额", type: "text", required: false, section: "报销合计" },
    { id: 45, label: "是否上传发票", type: "select", required: true, section: "报销合计" },
    { id: 46, label: "冲销金额", type: "text", required: false, section: "报销合计" },
    { id: 47, label: "财务审核调整金额", type: "text", required: false, section: "报销合计" },
    { id: 48, label: "调整金额说明", type: "text", required: false, section: "报销合计" },
    { id: 49, label: "相关附件", type: "text", required: false, section: "报销合计" },
    
    // 审批信息
    { id: 50, label: "签字意见", type: "textarea", required: false, section: "审批信息" },
  ],
};

const MODULE_OPTIONS = [
  { value: "business-trip", label: "出差申请" },
  { value: "travel-reimbursement", label: "差旅报销" },
  { value: "employee-reimbursement", label: "员工报销" },
];

const FIELD_TYPES: FieldType[] = ["text", "textarea", "number", "date", "time", "select", "checkbox", "radio", "query"];

interface VersionRecord {
  id: number;
  timestamp: string;
  user: string;
  content: string;
  module: string;
}

const VERSION_HISTORY: VersionRecord[] = [
  {
    id: 1,
    timestamp: "2026-03-30 14:30:45",
    user: "张经理",
    content: "新增出差申请模块的K2系统模块字段",
    module: "business-trip"
  },
  {
    id: 2,
    timestamp: "2026-03-29 10:15:30",
    user: "李主管",
    content: "修改差旅报销模块的发票类型下拉选项",
    module: "travel-reimbursement"
  },
  {
    id: 3,
    timestamp: "2026-03-28 16:45:20",
    user: "王专员",
    content: "添加员工报销模块的员工客户号字段",
    module: "employee-reimbursement"
  },
  {
    id: 4,
    timestamp: "2026-03-27 09:20:10",
    user: "张经理",
    content: "调整出差申请模块的字段顺序",
    module: "business-trip"
  }
];

export function FieldConfig() {
  const navigate = useNavigate();
  const [module, setModule] = useState("business-trip");
  const [fields, setFields] = useState<FieldDef[]>([...MODULE_FIELDS["business-trip"]]);
  const [selectedField, setSelectedField] = useState<FieldDef | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [editingLabel, setEditingLabel] = useState<string>("");
  const [editingType, setEditingType] = useState<FieldType>("text");
  const [editingRequired, setEditingRequired] = useState(false);
  const [editingOptions, setEditingOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");
  const [editingUrlEnabled, setEditingUrlEnabled] = useState(false);
  const [editingUrl, setEditingUrl] = useState("");
  const [editingEventEnabled, setEditingEventEnabled] = useState(false);
  const [editingEventConditions, setEditingEventConditions] = useState<EventCondition[]>([]);
  const [editingEventAction, setEditingEventAction] = useState<string>("show");
  const [sectionEvents, setSectionEvents] = useState<Record<string, SectionEvent>>({});
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);

  const sections = Array.from(new Set(fields.map((f) => f.section)));

  const handleModuleChange = (m: string) => {
    setModule(m);
    setFields([...MODULE_FIELDS[m]]);
    setSelectedField(null);
  };

  const toggleSection = (section: string) => {
    setCollapsedSections((s) => {
      const n = new Set(s);
      n.has(section) ? n.delete(section) : n.add(section);
      return n;
    });
  };

  const selectField = (f: FieldDef) => {
    setSelectedField(f);
    setEditingLabel(f.label);
    setEditingType(f.type);
    setEditingRequired(f.required);
    setEditingOptions(f.options || []);
    setEditingUrlEnabled(f.urlEnabled || false);
    setEditingUrl(f.url || "");
    setEditingEventEnabled(f.eventEnabled || false);
    setEditingEventConditions(f.eventConditions || []);
    setEditingEventAction(f.eventAction || "show");
    setNewOption("");
  };

  const applyEdit = () => {
    if (!selectedField) return;
    setFields((fs) =>
      fs.map((f) =>
        f.id === selectedField.id
          ? { ...f, label: editingLabel, type: editingType, required: editingRequired, options: editingOptions, urlEnabled: editingUrlEnabled, url: editingUrl, eventEnabled: editingEventEnabled, eventConditions: editingEventConditions, eventAction: editingEventAction }
          : f
      )
    );
    setSelectedField((f) => f ? { ...f, label: editingLabel, type: editingType, required: editingRequired, options: editingOptions, urlEnabled: editingUrlEnabled, url: editingUrl, eventEnabled: editingEventEnabled, eventConditions: editingEventConditions, eventAction: editingEventAction } : f);
    toast.success("字段属性已更新");
  };

  const deleteField = (id: number) => {
    setFields((fs) => fs.filter((f) => f.id !== id));
    if (selectedField?.id === id) setSelectedField(null);
  };

  const addField = (type: FieldType, section: string) => {
    const newField: FieldDef = {
      id: Date.now(),
      label: `新${FIELD_TYPE_LABELS[type]}`,
      type,
      required: false,
      section,
    };
    setFields((fs) => [...fs, newField]);
    selectField(newField);
  };

  const moveFieldUp = (id: number) => {
    setFields((fs) => {
      const index = fs.findIndex((f) => f.id === id);
      if (index > 0) {
        const newFields = [...fs];
        [newFields[index], newFields[index - 1]] = [newFields[index - 1], newFields[index]];
        return newFields;
      }
      return fs;
    });
  };

  const moveFieldDown = (id: number) => {
    setFields((fs) => {
      const index = fs.findIndex((f) => f.id === id);
      if (index < fs.length - 1) {
        const newFields = [...fs];
        [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
        return newFields;
      }
      return fs;
    });
  };

  const moveSectionUp = (section: string) => {
    const sectionsArray = [...sections];
    const index = sectionsArray.indexOf(section);
    if (index > 0) {
      [sectionsArray[index], sectionsArray[index - 1]] = [sectionsArray[index - 1], sectionsArray[index]];
      // Reorder fields based on new section order
      const reorderedFields: FieldDef[] = [];
      sectionsArray.forEach((sec) => {
        const sectionFields = fields.filter((f) => f.section === sec);
        reorderedFields.push(...sectionFields);
      });
      setFields(reorderedFields);
    }
  };

  const moveSectionDown = (section: string) => {
    const sectionsArray = [...sections];
    const index = sectionsArray.indexOf(section);
    if (index < sectionsArray.length - 1) {
      [sectionsArray[index], sectionsArray[index + 1]] = [sectionsArray[index + 1], sectionsArray[index]];
      // Reorder fields based on new section order
      const reorderedFields: FieldDef[] = [];
      sectionsArray.forEach((sec) => {
        const sectionFields = fields.filter((f) => f.section === sec);
        reorderedFields.push(...sectionFields);
      });
      setFields(reorderedFields);
    }
  };

  const editSection = (oldSection: string) => {
    const newSection = prompt("请输入新的分组名称：", oldSection);
    if (newSection && newSection !== oldSection) {
      setFields((fs) =>
        fs.map((f) =>
          f.section === oldSection ? { ...f, section: newSection } : f
        )
      );
    }
  };

  const deleteSection = (section: string) => {
    if (window.confirm(`确定要删除分组 "${section}" 及其所有字段吗？`)) {
      setFields((fs) => fs.filter((f) => f.section !== section));
      setSectionEvents((se) => {
        const newSe = { ...se };
        delete newSe[section];
        return newSe;
      });
    }
  };

  const selectSection = (section: string) => {
    setSelectedSection(section);
    const event = sectionEvents[section] || { enabled: false, conditions: [], action: 'show' };
    setEditingEventEnabled(event.enabled);
    setEditingEventConditions(event.conditions);
    setEditingEventAction(event.action);
  };

  const saveSectionEvent = () => {
    if (!selectedSection) return;
    setSectionEvents((se) => ({
      ...se,
      [selectedSection]: {
        enabled: editingEventEnabled,
        conditions: editingEventConditions,
        action: editingEventAction,
      },
    }));
    toast.success("分组事件已更新");
  };

  const addOption = () => {
    if (newOption.trim()) {
      setEditingOptions([...editingOptions, newOption.trim()]);
      setNewOption("");
    }
  };

  const removeOption = (index: number) => {
    setEditingOptions(editingOptions.filter((_, i) => i !== index));
  };

  const clearOptions = () => {
    setEditingOptions([]);
  };

  const addEventCondition = () => {
    setEditingEventConditions([...editingEventConditions, { field: '', operator: 'equals', value: '' }]);
  };

  const updateEventCondition = (index: number, key: keyof EventCondition, value: string) => {
    setEditingEventConditions(editingEventConditions.map((condition, i) => 
      i === index ? { ...condition, [key]: value } : condition
    ));
  };

  const removeEventCondition = (index: number) => {
    setEditingEventConditions(editingEventConditions.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-screen bg-[#F0F0F0]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-gray-500 hover:text-[#8B1450]">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-base font-semibold text-gray-800">字段配置自定义</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setVersionHistoryOpen(true)}
            className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-200"
          >
            <History size={14} /> 版本记录
          </button>
          <select
            value={module}
            onChange={(e) => handleModuleChange(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-[#8B1450]"
          >
            {MODULE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            onClick={() => toast.success("配置已保存")}
            className="flex items-center gap-1.5 bg-[#8B1450] text-white px-3 py-1.5 rounded text-sm hover:bg-[#6e1040]"
          >
            <Save size={14} /> 保存配置
          </button>
          <button
            onClick={() => { setFields([...MODULE_FIELDS[module]]); setSelectedField(null); }}
            className="flex items-center gap-1.5 bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-300"
          >
            <RotateCcw size={14} /> 重置
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden gap-4 p-4">
        {/* Main canvas */}
        <main className="flex-1 bg-white rounded-lg shadow-sm p-5 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">字段配置画布</h2>
            <button
              onClick={() => {
                const name = prompt("请输入分组名称：");
                if (name) {
                  const newField: FieldDef = { id: Date.now(), label: "新字段", type: "text", required: false, section: name };
                  setFields((fs) => [...fs, newField]);
                }
              }}
              className="flex items-center gap-1 text-[#8B1450] hover:text-[#6e1040] text-sm"
            >
              <PlusCircle size={14} /> 新增分组
            </button>
          </div>

          <div className="space-y-6">
            {sections.map((section) => {
              const sectionFields = fields.filter((f) => f.section === section);
              const isCollapsed = collapsedSections.has(section);
              return (
                <div key={section}>
                  <div className="flex items-center justify-between mb-2 pb-1 border-b border-gray-200">
                    <button
                      onClick={() => toggleSection(section)}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-[#8B1450]"
                    >
                      {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                      {section}
                      <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                        {sectionFields.length}
                      </span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => moveSectionUp(section)}
                        className="text-xs text-gray-400 hover:text-[#8B1450]"
                        title="上移"
                      >
                        <ChevronUp size={12} />
                      </button>
                      <button
                        onClick={() => moveSectionDown(section)}
                        className="text-xs text-gray-400 hover:text-[#8B1450]"
                        title="下移"
                      >
                        <ChevronDown size={12} />
                      </button>
                      <button
                        onClick={() => editSection(section)}
                        className="text-xs text-gray-400 hover:text-[#8B1450]"
                        title="编辑分组"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => deleteSection(section)}
                        className="text-xs text-gray-400 hover:text-red-500"
                        title="删除分组"
                      >
                        <Trash2 size={12} />
                      </button>
                      <button
                        onClick={() => selectSection(section)}
                        className={`text-xs flex items-center gap-1 ${selectedSection === section ? "text-[#8B1450]" : "text-gray-400 hover:text-[#8B1450]"}`}
                        title="分组事件"
                      >
                        <Type size={12} /> 事件
                      </button>
                      <button
                        onClick={() => addField("text", section)}
                        className="text-xs text-[#8B1450] hover:text-[#6e1040] flex items-center gap-1"
                      >
                        <PlusCircle size={12} /> 添加字段
                      </button>
                    </div>
                  </div>

                  {!isCollapsed && (
                    <div className="space-y-2">
                      {sectionFields.map((f) => {
                        const Icon = FIELD_TYPE_ICONS[f.type];
                        return (
                          <div
                            key={f.id}
                            onClick={() => selectField(f)}
                            className={`bg-white border rounded-lg p-3 cursor-pointer transition-all hover:shadow-sm ${
                              selectedField?.id === f.id
                                ? "border-[#8B1450] bg-[#8B1450]/5"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <GripVertical size={14} className="text-gray-300" />
                                <span className="text-sm text-gray-700">{f.label}</span>
                                {f.required && (
                                  <span className="text-xs bg-red-100 text-red-500 px-1 rounded">必填</span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                  <Icon size={12} />
                                  <span>{FIELD_TYPE_LABELS[f.type]}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); moveFieldUp(f.id); }}
                                    className="text-gray-400 hover:text-[#8B1450]"
                                  >
                                    <ChevronUp size={13} />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); moveFieldDown(f.id); }}
                                    className="text-gray-400 hover:text-[#8B1450]"
                                  >
                                    <ChevronDown size={13} />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); selectField(f); }}
                                    className="text-gray-400 hover:text-[#8B1450]"
                                  >
                                    <Pencil size={13} />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); deleteField(f.id); }}
                                    className="text-gray-400 hover:text-red-500"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {/* Drop zone */}
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-3 text-center text-xs text-gray-400 hover:border-[#8B1450]/40 transition-colors cursor-pointer"
                        onClick={() => addField("text", section)}>
                        拖拽字段到此处或点击添加
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>

        {/* Right sidebar: Properties */}
        <aside className="w-64 bg-white rounded-lg shadow-sm p-4 flex-shrink-0 overflow-y-auto">
          {selectedSection ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Type size={16} className="text-[#8B1450]" />
                <h2 className="text-sm font-semibold text-gray-700">分组事件</h2>
              </div>

              <div className="space-y-4">
                {/* Group name */}
                <div>
                  <label className="text-xs text-gray-500 block mb-1">分组名称</label>
                  <input
                    value={selectedSection}
                    disabled
                    className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm bg-gray-100 text-gray-500"
                  />
                </div>

                {/* Event */}
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-500">事件</label>
                  <button
                    onClick={() => setEditingEventEnabled(!editingEventEnabled)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${editingEventEnabled ? "bg-[#8B1450]" : "bg-gray-300"}`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${editingEventEnabled ? "translate-x-5" : "translate-x-0.5"}`}
                    />
                  </button>
                </div>

                {editingEventEnabled && (
                  <div className="space-y-3">
                    {/* Event Action */}
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">事件动作</label>
                      <select
                        value={editingEventAction}
                        onChange={(e) => setEditingEventAction(e.target.value)}
                        className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#8B1450] appearance-none"
                      >
                        <option value="show">显示当前分组</option>
                        <option value="hide">隐藏当前分组</option>
                      </select>
                    </div>

                    {/* Event Conditions */}
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">关联条件</label>
                      <div className="space-y-2">
                        {editingEventConditions.length > 0 ? (
                          <div className="space-y-2">
                            {editingEventConditions.map((condition, index) => (
                              <div key={index} className="bg-gray-50 rounded p-2.5 space-y-2">
                                <div className="grid grid-cols-3 gap-2">
                                  <div>
                                    <label className="text-xs text-gray-500 block mb-0.5">关联字段</label>
                                    <select
                                      value={condition.field}
                                      onChange={(e) => updateEventCondition(index, 'field', e.target.value)}
                                      className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#8B1450]"
                                    >
                                      <option value="">选择字段</option>
                                      {fields.map((field) => (
                                        <option key={field.id} value={field.label}>{field.label}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-xs text-gray-500 block mb-0.5">运算符</label>
                                    <select
                                      value={condition.operator}
                                      onChange={(e) => updateEventCondition(index, 'operator', e.target.value)}
                                      className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#8B1450]"
                                    >
                                      <option value="equals">等于</option>
                                      <option value="notEquals">不等于</option>
                                      <option value="contains">包含</option>
                                      <option value="notContains">不包含</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-xs text-gray-500 block mb-0.5">值</label>
                                    <input
                                      value={condition.value}
                                      onChange={(e) => updateEventCondition(index, 'value', e.target.value)}
                                      placeholder="输入值"
                                      className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#8B1450]"
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end">
                                  <button
                                    onClick={() => removeEventCondition(index)}
                                    className="text-xs text-red-500 hover:text-red-600"
                                  >
                                    删除条件
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400">暂无条件</p>
                        )}
                        <button
                          onClick={addEventCondition}
                          className="text-xs text-[#8B1450] hover:text-[#6e1040] flex items-center gap-1"
                        >
                          <PlusCircle size={12} /> 添加条件
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2 space-y-2">
                  <button
                    onClick={saveSectionEvent}
                    className="w-full py-2 bg-[#8B1450] text-white rounded text-sm hover:bg-[#6e1040]"
                  >
                    保存事件
                  </button>
                  <button
                    onClick={() => setSelectedSection(null)}
                    className="w-full py-2 border border-gray-300 text-gray-500 rounded text-sm hover:bg-gray-50"
                  >
                    取消
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <List size={16} className="text-[#8B1450]" />
                <h2 className="text-sm font-semibold text-gray-700">字段属性</h2>
              </div>

              {selectedField ? (
            <div className="space-y-4">
              {/* Label */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">字段名称</label>
                <input
                  value={editingLabel}
                  onChange={(e) => setEditingLabel(e.target.value)}
                  className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#8B1450]"
                />
              </div>

              {/* Type */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">字段类型</label>
                <select
                  value={editingType}
                  onChange={(e) => setEditingType(e.target.value as FieldType)}
                  className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#8B1450] appearance-none"
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t} value={t}>{FIELD_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>

              {/* Section */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">所属分组</label>
                <select
                  defaultValue={selectedField.section}
                  className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#8B1450] appearance-none"
                >
                  {sections.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>

              {/* Required */}
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-500">是否必填</label>
                <button
                  onClick={() => setEditingRequired(!editingRequired)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${editingRequired ? "bg-[#8B1450]" : "bg-gray-300"}`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${editingRequired ? "translate-x-5" : "translate-x-0.5"}`}
                  />
                </button>
              </div>

              {/* Visibility */}
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-500">是否显示</label>
                <button className="w-10 h-5 rounded-full bg-[#8B1450] relative">
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full shadow" />
                </button>
              </div>

              {/* URL */}
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-500">URL</label>
                <button
                  onClick={() => setEditingUrlEnabled(!editingUrlEnabled)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${editingUrlEnabled ? "bg-[#8B1450]" : "bg-gray-300"}`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${editingUrlEnabled ? "translate-x-5" : "translate-x-0.5"}`}
                  />
                </button>
              </div>

              {editingUrlEnabled && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">URL地址</label>
                  <input
                    value={editingUrl}
                    onChange={(e) => setEditingUrl(e.target.value)}
                    placeholder="输入URL地址"
                    className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#8B1450]"
                  />
                </div>
              )}

              {/* Event */}
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-500">事件</label>
                <button
                  onClick={() => setEditingEventEnabled(!editingEventEnabled)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${editingEventEnabled ? "bg-[#8B1450]" : "bg-gray-300"}`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${editingEventEnabled ? "translate-x-5" : "translate-x-0.5"}`}
                  />
                </button>
              </div>

              {editingEventEnabled && (
                <div className="space-y-3">
                  {/* Event Action */}
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">事件动作</label>
                    <select
                      value={editingEventAction}
                      onChange={(e) => setEditingEventAction(e.target.value)}
                      className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#8B1450] appearance-none"
                    >
                      <option value="show">显示当前字段</option>
                      <option value="hide">隐藏当前字段</option>
                      <option value="required">设置为必填</option>
                      <option value="optional">设置为非必填</option>
                      <option value="readonly">设置为只读</option>
                    </select>
                  </div>

                  {/* Event Conditions */}
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">关联条件</label>
                    <div className="space-y-2">
                      {editingEventConditions.length > 0 ? (
                        <div className="space-y-2">
                          {editingEventConditions.map((condition, index) => (
                            <div key={index} className="bg-gray-50 rounded p-2.5 space-y-2">
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="text-xs text-gray-500 block mb-0.5">关联字段</label>
                                  <select
                                    value={condition.field}
                                    onChange={(e) => updateEventCondition(index, 'field', e.target.value)}
                                    className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#8B1450]"
                                  >
                                    <option value="">选择字段</option>
                                    {fields.map((field) => (
                                      <option key={field.id} value={field.label}>{field.label}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500 block mb-0.5">运算符</label>
                                  <select
                                    value={condition.operator}
                                    onChange={(e) => updateEventCondition(index, 'operator', e.target.value)}
                                    className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#8B1450]"
                                  >
                                    <option value="equals">等于</option>
                                    <option value="notEquals">不等于</option>
                                    <option value="contains">包含</option>
                                    <option value="notContains">不包含</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500 block mb-0.5">值</label>
                                  <input
                                    value={condition.value}
                                    onChange={(e) => updateEventCondition(index, 'value', e.target.value)}
                                    placeholder="输入值"
                                    className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#8B1450]"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <button
                                  onClick={() => removeEventCondition(index)}
                                  className="text-xs text-red-500 hover:text-red-600"
                                >
                                  删除条件
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">暂无条件</p>
                      )}
                      <button
                        onClick={addEventCondition}
                        className="text-xs text-[#8B1450] hover:text-[#6e1040] flex items-center gap-1"
                      >
                        <PlusCircle size={12} /> 添加条件
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Width */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">字段宽度</label>
                <select className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#8B1450] appearance-none">
                  <option>1/4 宽</option>
                  <option>1/2 宽</option>
                  <option>1/3 宽</option>
                  <option>全宽</option>
                </select>
              </div>

              {/* Dropdown options */}
              {editingType === "select" && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">字典名称</label>
                  <div className="space-y-2">
                    <div>
                      <input
                        type="text"
                        value={editingOptions.length > 0 ? editingOptions[0] : ""}
                        onChange={(e) => setEditingOptions([e.target.value])}
                        placeholder="输入字典名称"
                        className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#8B1450]"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Checkbox and radio options */}
              {(editingType === "checkbox" || editingType === "radio") && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">下拉选项</label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addOption()}
                        placeholder="输入选项值"
                        className="flex-1 border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#8B1450]"
                      />
                      <button
                        onClick={addOption}
                        className="px-3 py-1.5 bg-[#8B1450] text-white rounded text-sm hover:bg-[#6e1040] whitespace-nowrap"
                      >
                        添加
                      </button>
                    </div>
                    {editingOptions.length > 0 ? (
                      <div className="space-y-1">
                        {editingOptions.map((option, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 rounded px-2.5 py-1.5 text-sm">
                            <span>{option}</span>
                            <button
                              onClick={() => removeOption(index)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={clearOptions}
                          className="text-xs text-gray-500 hover:text-red-500"
                        >
                          清空所有选项
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">暂无选项，请添加</p>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2 space-y-2">
                <button
                  onClick={applyEdit}
                  className="w-full py-2 bg-[#8B1450] text-white rounded text-sm hover:bg-[#6e1040]"
                >
                  应用修改
                </button>
                <button
                  onClick={() => { deleteField(selectedField.id); }}
                  className="w-full py-2 border border-red-300 text-red-500 rounded text-sm hover:bg-red-50"
                >
                  删除字段
                </button>
              </div>
            </div>
            ) : (
              <div className="text-center text-gray-400 py-12">
                <Pencil size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">选择一个字段来编辑属性</p>
              </div>
            )}
            </>
          )}
        </aside>
      </div>

      {/* 版本记录弹窗 */}
      {versionHistoryOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <History size={16} className="text-[#8B1450]" />
                  版本记录
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  展示字段配置的修改历史
                </p>
              </div>
              <button
                onClick={() => setVersionHistoryOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            {/* Version list */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {VERSION_HISTORY.map((record) => (
                  <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-800">
                        {record.module === "business-trip" ? "出差申请" : 
                         record.module === "travel-reimbursement" ? "差旅报销" : "员工报销"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {record.timestamp}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {record.user}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {record.content}
                    </p>
                  </div>
                ))}
              </div>
              {VERSION_HISTORY.length === 0 && (
                <div className="text-center py-12">
                  <History size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-sm text-gray-500">暂无版本记录</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end p-4 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={() => setVersionHistoryOpen(false)}
                className="px-4 py-2 bg-[#8B1450] text-white rounded-lg text-sm hover:bg-[#6e1040]"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
