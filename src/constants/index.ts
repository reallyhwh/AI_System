/**
 * 常量定义集中管理
 */

// 路由路径
export const ROUTES = {
  HOME: '/',
  BUSINESS_TRIP: '/business-trip',
  TRAVEL_REIMBURSEMENT: '/travel-reimbursement',
  EMPLOYEE_REIMBURSEMENT: '/employee-reimbursement',
  IMAGE_MANAGEMENT: '/image-management',
  FIELD_CONFIG: '/field-config',
  RULE_CONFIG: '/rule-config',
  OPERATION_LOG: '/operation-log',
} as const;

// 意图代码映射
export const INTENT_CODES = {
  BUSINESS_TRIP: '0',
  TRAVEL_REIMBURSEMENT: '1',
  EMPLOYEE_REIMBURSEMENT: '2',
  UNKNOWN: 'unknown',
} as const;

// 出差类型
export const TRIP_TYPES = [
  '国内出差',
  '国际出差',
] as const;

// 交通工具类型
export const TRANSPORT_TYPES = [
  '飞机',
  '高铁',
  '火车',
  '汽车',
  '自驾',
] as const;

// 报销类型
export const REIMBURSEMENT_TYPES = [
  '差旅报销',
  '员工报销',
  '日常费用',
] as const;

// 票据类型
export const TICKET_TYPES = [
  '交通发票',
  '住宿发票',
  '餐饮发票',
  '其他发票',
] as const;

// 表单状态
export const FORM_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

// 日期格式
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';

// 本地存储键名
export const STORAGE_KEYS = {
  TRAVEL_REQUESTS: 'travel_requests',
  REIMBURSEMENTS: 'reimbursements',
  USER_PREFERENCES: 'user_preferences',
} as const;

// 默认公司代码
export const DEFAULT_COMPANY_CODE = '10';
