/**
 * Dify API 服务
 * 用于对接 Dify 智能体
 */

// Dify API 配置
const DIFY_CONFIG = {
  // 使用代理地址，避免 CORS 问题
  baseUrl: '/api/dify/v1',
  intentAgentApiKey: 'app-9VsEeoY9i7DLEneo9FJWhk6P',
  businessTripApiKey: 'app-pHgS4VMnbFonk61nWg7yixx8',
  travelReimbursementApiKey: 'app-lARYf6JXa7mlBMpwlnJ5jT8R',
};

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

/**
 * 调用智能体1 - 意图识别
 */
export async function recognizeIntent(userInput: string): Promise<IntentResult> {
  try {
    const response = await fetch(`${DIFY_CONFIG.baseUrl}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_CONFIG.intentAgentApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {},
        query: userInput,
        response_mode: 'blocking',
        user: 'user-' + Date.now(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dify API error:', response.status, errorText);
      throw new Error(`Dify API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Dify response:', result);

    const answer = result.answer || '';

    if (answer.includes('localhost:5173') || answer.includes('/business-trip') || answer.includes('/travel-reimbursement') || answer.includes('/employee-reimbursement')) {
      const urlMatch = answer.match(/https?:\/\/[^\s]+/);
      const url = urlMatch ? urlMatch[0] : answer.trim();

      let intentCode = 'unknown';
      if (url.includes('/business-trip')) intentCode = '0';
      else if (url.includes('/travel-reimbursement')) intentCode = '1';
      else if (url.includes('/employee-reimbursement')) intentCode = '2';

      return { url, intentCode, success: true };
    }

    return { url: '', intentCode: 'unknown', success: false };
  } catch (error) {
    console.error('Intent recognition error:', error);
    return { url: '', intentCode: 'unknown', success: false };
  }
}

/**
 * 调用出差申请智能体（阻塞模式）
 */
export async function businessTripApplyStream(
  userInput: string,
  onChunk: (text: string) => void
): Promise<AgentResult> {
  try {
    console.log('Calling business trip agent with input:', userInput);

    const response = await fetch(`${DIFY_CONFIG.baseUrl}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_CONFIG.businessTripApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {},
        query: userInput,
        response_mode: 'blocking',
        user: 'user-' + Date.now(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Business trip API error:', response.status, errorText);
      throw new Error(`Dify API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Business trip agent FULL response:', result);

    const answer = result.answer || '';
    console.log('Answer:', answer);

    if (answer) {
      onChunk(answer);
    }

    // 提取结构化数据用于表单填充
    const formData: Record<string, any> = {};

    // 实际出差人
    const travelerMatch = answer.match(/实际出差人　　：(.+?)(?:\s|★)/);
    if (travelerMatch && travelerMatch[1] !== '❌ 未填写') {
      formData.traveler_name = travelerMatch[1].trim();
    }

    // 成本中心
    const costCenterMatch = answer.match(/成本中心　　　：(.+?)(?:\s|★|$)/);
    if (costCenterMatch && costCenterMatch[1] !== '❌ 未填写') {
      formData.cost_center = costCenterMatch[1].trim();
    }

    // 费用承担成本中心
    const costCenterCodeMatch = answer.match(/费用承担成本中心：(.+?)(?:\s|★)/);
    if (costCenterCodeMatch && costCenterCodeMatch[1] !== '❌ 未填写') {
      formData.cost_center_code = costCenterCodeMatch[1].trim();
    }

    // 出差类型
    const typeMatch = answer.match(/出差类型　　　：(.+?)(?:\s|★)/);
    if (typeMatch) formData.travel_type = typeMatch[1].trim();

    // 出发地
    const originMatch = answer.match(/出 发 地　：(.+?)(?:\s|★)/);
    if (originMatch && originMatch[1] !== '❌ 未填写') {
      formData.origin = originMatch[1].trim();
    }

    // 目的地
    const destMatch = answer.match(/目 的 地　：(.+?)(?:\s|★)/);
    if (destMatch && destMatch[1] !== '❌ 未填写') {
      formData.destination = destMatch[1].trim();
    }

    // 出差原因
    const reasonMatch = answer.match(/出差原因　：(.+?)(?:\s|★)/);
    if (reasonMatch && reasonMatch[1] !== '❌ 未填写') {
      formData.travel_reason = reasonMatch[1].trim();
    }

    // 交通工具
    const transportMatch = answer.match(/交通工具　：(.+?)(?:\s|★)/);
    if (transportMatch && transportMatch[1] !== '❌ 未填写') {
      formData.transport = transportMatch[1].trim();
    }

    // 开始日期
    const startDateMatch = answer.match(/开始日期　：(.+?)(?:\s|★)/);
    if (startDateMatch && startDateMatch[1] !== '❌ 未填写') {
      formData.start_date = startDateMatch[1].trim();
    }

    // 结束日期
    const endDateMatch = answer.match(/结束日期　：(.+?)(?:\s|★)/);
    if (endDateMatch && endDateMatch[1] !== '❌ 未填写') {
      formData.end_date = endDateMatch[1].trim();
    }

    // 出差天数
    const daysMatch = answer.match(/出差天数　：(\d+)/);
    if (daysMatch) formData.days = parseInt(daysMatch[1]);

    // 往返公里
    const kmMatch = answer.match(/往返公里　：(\d+)/);
    if (kmMatch) formData.round_trip_km = parseInt(kmMatch[1]);

    // 是否享受补贴
    const subsidyMatch = answer.match(/是否享受补贴　：(.+?)(?:\s|$)/);
    if (subsidyMatch) formData.is_subsidy = subsidyMatch[1].trim();

    // 是否第三方承担
    const thirdPartyMatch = answer.match(/是否第三方承担：(.+?)(?:\s|$)/);
    if (thirdPartyMatch) formData.third_party_bear = thirdPartyMatch[1].trim();

    // 携程预订酒店
    const ctripMatch = answer.match(/携程预订酒店　：(.+?)(?:\s|$)/);
    if (ctripMatch) formData.book_via_ctrip = ctripMatch[1].trim();

    // 长途交通费
    const transportCostMatch = answer.match(/长途交通费　：¥ ([\d,.]+)/);
    if (transportCostMatch) formData.transport_cost = parseFloat(transportCostMatch[1].replace(',', ''));

    // 住宿费
    const hotelCostMatch = answer.match(/住 宿 费　：¥ ([\d,.]+)/);
    if (hotelCostMatch) formData.hotel_cost = parseFloat(hotelCostMatch[1].replace(',', ''));

    // 补贴
    const allowanceMatch = answer.match(/出差补贴　　：¥ ([\d,.]+)/);
    if (allowanceMatch) formData.allowance = parseFloat(allowanceMatch[1].replace(',', ''));

    // 预计总费用
    const totalCostMatch = answer.match(/预计总费用　：¥ ([\d,.]+)/);
    if (totalCostMatch) formData.total_cost = parseFloat(totalCostMatch[1].replace(',', ''));

    console.log('Extracted form data:', formData);

    return {
      success: answer.length > 0,
      formText: answer,
      formData,
      canSubmit: answer.includes('✅') || answer.includes('可以提交'),
    };
  } catch (error) {
    console.error('Business trip apply error:', error);
    return {
      success: false,
      formText: '',
      formData: {},
      canSubmit: false,
    };
  }
}

/**
 * 调用差旅报销智能体（阻塞模式）
 */
export async function travelReimbursementStream(
  userInput: string,
  onChunk: (text: string) => void
): Promise<AgentResult> {
  try {
    console.log('Calling travel reimbursement agent with input:', userInput);

    const response = await fetch(`${DIFY_CONFIG.baseUrl}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_CONFIG.travelReimbursementApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {},
        query: userInput,
        response_mode: 'blocking',
        user: 'user-' + Date.now(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Travel reimbursement API error:', response.status, errorText);
      throw new Error(`Dify API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Travel reimbursement agent FULL response:', result);

    const answer = result.answer || '';
    console.log('Answer:', answer);

    if (answer) {
      onChunk(answer);
    }

    // 提取结构化数据用于表单填充
    const formData: Record<string, any> = {};

    // 报销类型
    const typeMatch = answer.match(/报销类型\s*：(.+)/);
    if (typeMatch) formData.reimbursement_type = typeMatch[1].trim();

    // 实际报销人
    const reimburserMatch = answer.match(/实际报销人\s*：(.+?)(?:\s|★)/);
    if (reimburserMatch && reimburserMatch[1] !== '❌ 未填写') {
      formData.reimbursment_person = reimburserMatch[1].trim();
    }

    // 成本中心
    const costCenterMatch = answer.match(/成本中心\s*：(.+?)(?:\s|★|$)/);
    if (costCenterMatch && costCenterMatch[1] !== '❌ 未填写') {
      formData.cost_center = costCenterMatch[1].trim();
    }

    // 出差申请单号
    const tripAppMatch = answer.match(/出差申请单号\s*：(.+?)(?:\s|★|$)/);
    if (tripAppMatch && tripAppMatch[1] !== '❌ 未填写') {
      formData.trip_application_no = tripAppMatch[1].trim();
    }

    // 出发地 - 匹配 "出 发 地" 或 "出发地"
    const originMatch = answer.match(/出\s*发\s*地\s*：(.+?)(?:\s|★|$)/);
    if (originMatch && originMatch[1] !== '❌ 未填写') {
      formData.origin = originMatch[1].trim();
    }

    // 目的地 - 匹配 "目 的 地" 或 "目的地"
    const destMatch = answer.match(/目\s*的\s*地\s*：(.+?)(?:\s|★|$)/);
    if (destMatch && destMatch[1] !== '❌ 未填写') {
      formData.destination = destMatch[1].trim();
    }

    // 申请出发日
    const applyStartMatch = answer.match(/申请出发日\s*：(.+?)(?:\s|★|$)/);
    if (applyStartMatch && applyStartMatch[1] !== '❌ 未填写') {
      formData.apply_start_date = applyStartMatch[1].trim();
    }

    // 申请返程日
    const applyEndMatch = answer.match(/申请返程日\s*：(.+?)(?:\s|★|$)/);
    if (applyEndMatch && applyEndMatch[1] !== '❌ 未填写') {
      formData.apply_end_date = applyEndMatch[1].trim();
    }

    // 申请天数
    const applyDaysMatch = answer.match(/申请天数\s*：(\d+)/);
    if (applyDaysMatch) formData.apply_days = parseInt(applyDaysMatch[1]);

    // 实际出发日
    const actualStartMatch = answer.match(/实际出发日\s*：(.+?)(?:\s|★|$)/);
    if (actualStartMatch && actualStartMatch[1] !== '❌ 未填写') {
      formData.actual_start_date = actualStartMatch[1].trim();
    }

    // 实际返程日
    const actualEndMatch = answer.match(/实际返程日\s*：(.+?)(?:\s|★|$)/);
    if (actualEndMatch && actualEndMatch[1] !== '❌ 未填写') {
      formData.actual_end_date = actualEndMatch[1].trim();
    }

    // 实际天数
    const actualDaysMatch = answer.match(/实际天数\s*：(\d+)/);
    if (actualDaysMatch) formData.actual_days = parseInt(actualDaysMatch[1]);

    // 交通工具
    const transportMatch = answer.match(/交通工具\s*：(.+?)(?:\s|★|$)/);
    if (transportMatch && transportMatch[1] !== '❌ 未填写') {
      formData.transport = transportMatch[1].trim();
    }

    // 早餐次数
    const breakfastMatch = answer.match(/早\s*餐\s*次\s*数\s*：(\d+)/);
    if (breakfastMatch) formData.breakfast_count = parseInt(breakfastMatch[1]);

    // 午餐次数
    const lunchMatch = answer.match(/午\s*餐\s*次\s*数\s*：(\d+)/);
    if (lunchMatch) formData.lunch_count = parseInt(lunchMatch[1]);

    // 晚餐次数
    const dinnerMatch = answer.match(/晚\s*餐\s*次\s*数\s*：(\d+)/);
    if (dinnerMatch) formData.dinner_count = parseInt(dinnerMatch[1]);

    // 交通费合计
    const transportTotalMatch = answer.match(/交通费合计\s*：¥\s*([\d,.]+)/);
    if (transportTotalMatch) formData.transport_total = parseFloat(transportTotalMatch[1].replace(',', ''));

    // 住宿费合计
    const hotelTotalMatch = answer.match(/住宿费合计\s*：¥\s*([\d,.]+)/);
    if (hotelTotalMatch) formData.hotel_total = parseFloat(hotelTotalMatch[1].replace(',', ''));

    // 差旅补贴
    const subsidyMatch = answer.match(/实际补贴金额\s*：¥\s*([\d,.]+)/);
    if (subsidyMatch) formData.subsidy = parseFloat(subsidyMatch[1].replace(',', ''));

    // 申请金额合计
    const totalMatch = answer.match(/申请金额合计\s*：¥\s*([\d,.]+)/);
    if (totalMatch) formData.total_amount = parseFloat(totalMatch[1].replace(',', ''));

    // 是否第三方承担
    const thirdPartyMatch = answer.match(/是否第三方承担\s*：(.+?)(?:\s|$)/);
    if (thirdPartyMatch) formData.third_party_bear = thirdPartyMatch[1].trim();

    // 是否通过携程预订
    const ctripMatch = answer.match(/携程预订酒店\s*：(.+?)(?:\s|$)/);
    if (ctripMatch) formData.book_via_ctrip = ctripMatch[1].trim();

    console.log('Extracted form data:', formData);

    return {
      success: answer.length > 0,
      formText: answer,
      formData,
      canSubmit: answer.includes('✅') || answer.includes('可以提交'),
    };
  } catch (error) {
    console.error('Travel reimbursement error:', error);
    return {
      success: false,
      formText: '',
      formData: {},
      canSubmit: false,
    };
  }
}

// 导出配置更新函数
export function updateDifyConfig(config: Partial<typeof DIFY_CONFIG>) {
  Object.assign(DIFY_CONFIG, config);
}
