/**
 * Dify API 服务
 * 用于对接 Dify 智能体
 */

// Dify API 配置
const DIFY_CONFIG = {
  // 替换为你的 Dify API 地址
  baseUrl: 'https://api.dify.ai/v1',
  // 替换为你的 API Key
  apiKey: 'your-dify-api-key',
  // 对话应用类型
  conversationId: '',
};

// 消息类型
export interface DifyMessage {
  role: 'user' | 'assistant';
  content: string;
}

// 对话响应
export interface DifyChatResponse {
  conversation_id: string;
  message_id: string;
  answer: string;
  metadata?: {
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
}

// 意图识别响应
export interface IntentResult {
  intent: 'business-trip' | 'travel-reimbursement' | 'employee-reimbursement' | 'unknown';
  entities: Record<string, any>;
  confidence: number;
}

// 表单填充数据
export interface FormFillData {
  [key: string]: string | number | boolean;
}

/**
 * 发送对话消息到 Dify
 */
export async function sendChatMessage(
  message: string,
  conversationId?: string
): Promise<DifyChatResponse> {
  const response = await fetch(`${DIFY_CONFIG.baseUrl}/chat-messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DIFY_CONFIG.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: {},
      query: message,
      response_mode: 'blocking',
      conversation_id: conversationId || '',
      user: 'user-' + Date.now(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Dify API error: ${response.status}`);
  }

  return response.json();
}

/**
 * 流式对话（SSE）
 */
export async function streamChatMessage(
  message: string,
  onChunk: (text: string) => void,
  conversationId?: string
): Promise<string> {
  const response = await fetch(`${DIFY_CONFIG.baseUrl}/chat-messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DIFY_CONFIG.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: {},
      query: message,
      response_mode: 'streaming',
      conversation_id: conversationId || '',
      user: 'user-' + Date.now(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Dify API error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullAnswer = '';

  if (!reader) {
    throw new Error('No response body');
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.event === 'message' || data.event === 'agent_message') {
            const text = data.answer || '';
            fullAnswer += text;
            onChunk(text);
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }
  }

  return fullAnswer;
}

/**
 * 意图识别（通过 Dify 工作流）
 */
export async function recognizeIntent(userInput: string): Promise<IntentResult> {
  const response = await fetch(`${DIFY_CONFIG.baseUrl}/workflows/run`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DIFY_CONFIG.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: {
        user_input: userInput,
      },
      response_mode: 'blocking',
      user: 'user-' + Date.now(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Dify API error: ${response.status}`);
  }

  const result = await response.json();

  // 解析 Dify 返回的结构化数据
  return {
    intent: result.data?.outputs?.intent || 'unknown',
    entities: result.data?.outputs?.entities || {},
    confidence: result.data?.outputs?.confidence || 0,
  };
}

/**
 * 表单智能填充
 */
export async function fillForm(
  formType: 'business-trip' | 'travel-reimbursement' | 'employee-reimbursement',
  userInput: string
): Promise<FormFillData> {
  const prompt = `请从以下用户输入中提取表单信息，返回 JSON 格式：
表单类型：${formType}
用户输入：${userInput}

请返回对应表单的字段键值对，例如：
{
  "traveler": "张三",
  "destination": "北京",
  "startDate": "2026-04-25"
}`;

  const response = await sendChatMessage(prompt);

  try {
    // 尝试解析 JSON 响应
    const jsonMatch = response.answer.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse form data:', e);
  }

  return {};
}

/**
 * 语音识别结果处理
 */
export async function processVoiceInput(voiceText: string): Promise<{
  intent: IntentResult;
  formData: FormFillData;
}> {
  // 先识别意图
  const intent = await recognizeIntent(voiceText);

  // 再提取表单数据
  let formData: FormFillData = {};
  if (intent.intent !== 'unknown') {
    formData = await fillForm(intent.intent, voiceText);
  }

  return { intent, formData };
}

/**
 * 票据 OCR 识别（可通过 Dify 调用 OCR 能力）
 */
export async function recognizeInvoice(imageBase64: string): Promise<{
  invoiceNo: string;
  amount: number;
  date: string;
  seller: string;
  [key: string]: any;
}> {
  const response = await fetch(`${DIFY_CONFIG.baseUrl}/chat-messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DIFY_CONFIG.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: {},
      query: '请识别这张票据的信息',
      response_mode: 'blocking',
      files: [
        {
          type: 'image',
          transfer_method: 'local_file',
          upload_file_id: imageBase64,
        },
      ],
      user: 'user-' + Date.now(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Dify API error: ${response.status}`);
  }

  const result = await response.json();

  // 解析返回的票据信息
  try {
    const jsonMatch = result.answer.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse invoice data:', e);
  }

  return {
    invoiceNo: '',
    amount: 0,
    date: '',
    seller: '',
  };
}

/**
 * 合规性检查
 */
export async function checkCompliance(
  formType: string,
  formData: Record<string, any>
): Promise<{
  passed: boolean;
  issues: string[];
  suggestions: string[];
}> {
  const prompt = `请检查以下报销单的合规性：
表单类型：${formType}
表单数据：${JSON.stringify(formData, null, 2)}

请返回 JSON 格式：
{
  "passed": true/false,
  "issues": ["问题1", "问题2"],
  "suggestions": ["建议1", "建议2"]
}`;

  const response = await sendChatMessage(prompt);

  try {
    const jsonMatch = response.answer.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse compliance result:', e);
  }

  return {
    passed: true,
    issues: [],
    suggestions: [],
  };
}

// 导出配置更新函数
export function updateDifyConfig(config: Partial<typeof DIFY_CONFIG>) {
  Object.assign(DIFY_CONFIG, config);
}
