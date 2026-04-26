/**
 * 本地存储工具
 * 用于在演示系统中持久化出差申请数据
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

const STORAGE_KEY = 'travel_requests';

/**
 * 获取所有出差申请
 */
export function getTravelRequests(): TravelRequest[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get travel requests:', error);
    return [];
  }
}

/**
 * 保存出差申请
 */
export function saveTravelRequest(request: TravelRequest): void {
  try {
    const requests = getTravelRequests();
    requests.unshift(request); // 新的放在前面
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    console.log('Travel request saved:', request);
  } catch (error) {
    console.error('Failed to save travel request:', error);
  }
}

/**
 * 生成流程编号
 */
export function generateProcessNo(companyCode: string = '10'): string {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `CCSQ${companyCode.padStart(2, '0')}${yearMonth}${random}`;
}

/**
 * 根据ID获取出差申请
 */
export function getTravelRequestById(id: number): TravelRequest | undefined {
  const requests = getTravelRequests();
  return requests.find(r => r.id === id);
}

/**
 * 更新出差申请状态
 */
export function updateTravelRequestStatus(id: number, status: TravelRequest['status']): void {
  try {
    const requests = getTravelRequests();
    const index = requests.findIndex(r => r.id === id);
    if (index !== -1) {
      requests[index].status = status;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    }
  } catch (error) {
    console.error('Failed to update travel request status:', error);
  }
}

/**
 * 清除所有出差申请（用于测试）
 */
export function clearTravelRequests(): void {
  localStorage.removeItem(STORAGE_KEY);
}
