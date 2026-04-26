/**
 * 类型定义集中管理
 */

// 出差申请数据结构
export interface TravelRequest {
  id: number;
  processNo: string;       // 流程编号
  applicant: string;       // 申请人
  traveler: string;        // 出差人
  employeeId: string;      // 员工号
  department: string;      // 部门
  origin: string;          // 出发地
  destination: string;     // 目的地
  startDate: string;       // 开始日期
  endDate: string;         // 结束日期
  days: number;            // 天数
  reason: string;          // 出差原因
  transport: string;       // 交通工具
  tripType: string;        // 出差类型
  totalCost: number;       // 预计费用
  status: '待审批' | '已通过' | '已拒绝';  // 状态
  createdAt: string;       // 创建时间
}

// 意图识别结果
export interface IntentResult {
  url: string;
  intentCode: string;
  success: boolean;
}

// 智能体返回结果
export interface AgentResult {
  success: boolean;
  formText: string;
  formData: Record<string, any>;
  canSubmit: boolean;
}

// 票据信息
export interface Ticket {
  id: string;
  type: string;
  amount: number;
  date: string;
  status: 'valid' | 'invalid' | 'pending';
}

// 报销单据信息
export interface ReimbursementForm {
  id: string;
  type: 'travel' | 'employee';
  applicant: string;
  department: string;
  amount: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  tickets: Ticket[];
  createdAt: string;
}

// 操作日志
export interface OperationLog {
  id: string;
  action: string;
  module: string;
  operator: string;
  timestamp: string;
  details: string;
}
