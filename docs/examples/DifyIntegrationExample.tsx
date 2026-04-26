/**
 * Dify 集成示例
 *
 * 本文件展示如何在各个页面中集成 Dify 智能体
 * 实际使用时，可以将这些代码复制到对应的页面组件中
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useDifyChat, useDifyIntent, useDifyFormFill, useDifyVoice, useDifyCompliance } from '../hooks/useDify';

// ============================================
// 示例 1: 首页 AI 对话助手集成
// ============================================

export function HomeWithDify() {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const { messages, isLoading, sendMessageStream, clearMessages } = useDifyChat();
  const { recognize, isLoading: intentLoading } = useDifyIntent();

  // 路由映射
  const intentToPath: Record<string, string> = {
    'business-trip': '/business-trip',
    'travel-reimbursement': '/travel-reimbursement',
    'employee-reimbursement': '/employee-reimbursement',
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const text = inputText;
    setInputText('');

    // 先识别意图
    const intent = await recognize(text);

    if (intent.intent !== 'unknown' && intent.confidence > 0.7) {
      // 高置信度意图，直接跳转
      const path = intentToPath[intent.intent];
      if (path) {
        // 发送确认消息
        await sendMessageStream(`正在为您跳转到${intent.intent}页面...`);
        setTimeout(() => navigate(path), 1500);
        return;
      }
    }

    // 否则进行正常对话
    await sendMessageStream(text);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg ${
              msg.role === 'user' ? 'bg-[#8B1450] text-white' : 'bg-gray-100'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {(isLoading || intentLoading) && <div className="text-center">AI 正在思考...</div>}
      </div>

      {/* 输入框 */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="请输入您的需求..."
            className="flex-1 border rounded-lg px-4 py-2"
          />
          <button onClick={handleSend} className="px-6 py-2 bg-[#8B1450] text-white rounded-lg">
            发送
          </button>
        </div>
      </div>
    </div>
  );
}


// ============================================
// 示例 2: 出差申请页面集成（语音填充表单）
// ============================================

export function BusinessTripWithDify() {
  const [formData, setFormData] = useState({
    traveler: '',
    destination: '',
    departure: '',
    startDate: '',
    returnDate: '',
    reason: '',
    // ... 其他字段
  });

  const { process, isProcessing } = useDifyVoice();

  // 处理语音输入
  const handleVoiceInput = async (voiceText: string) => {
    const result = await process(voiceText);

    if (result.intent.intent === 'business-trip') {
      // 自动填充表单
      setFormData(prev => ({
        ...prev,
        ...result.formData,
      }));
    }
  };

  return (
    <div>
      {/* 表单 */}
      <div className="grid grid-cols-4 gap-4 p-4">
        <div>
          <label className="text-xs text-gray-600">出差人</label>
          <input
            value={formData.traveler}
            onChange={e => setFormData({ ...formData, traveler: e.target.value })}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        {/* ... 其他字段 */}
      </div>

      {/* 语音输入按钮 */}
      <button
        onClick={() => {
          // 打开语音弹窗，获取文本后调用 handleVoiceInput
        }}
        disabled={isProcessing}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-[#8B1450] text-white rounded-full"
      >
        {isProcessing ? '处理中...' : '🎤 语音输入'}
      </button>
    </div>
  );
}


// ============================================
// 示例 3: 差旅报销/员工报销页面集成（票据识别）
// ============================================

import { recognizeInvoice } from '../services/dify';

export function ReimbursementWithDify() {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNo: '',
    amount: 0,
    date: '',
    seller: '',
  });

  // 处理票据上传
  const handleInvoiceUpload = async (file: File) => {
    // 将文件转为 base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;

      try {
        const result = await recognizeInvoice(base64);
        setInvoiceData({
          invoiceNo: result.invoiceNo,
          amount: result.amount,
          date: result.date,
          seller: result.seller,
        });
      } catch (error) {
        console.error('票据识别失败:', error);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      {/* 票据上传区 */}
      <div
        className="border-2 border-dashed p-8 text-center"
        onDrop={e => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) handleInvoiceUpload(file);
        }}
      >
        拖拽上传票据或点击上传
      </div>

      {/* 识别结果 */}
      {invoiceData.invoiceNo && (
        <div className="mt-4 p-4 bg-green-50 rounded">
          <p>发票号: {invoiceData.invoiceNo}</p>
          <p>金额: ¥{invoiceData.amount}</p>
          <p>日期: {invoiceData.date}</p>
          <p>销售方: {invoiceData.seller}</p>
        </div>
      )}
    </div>
  );
}


// ============================================
// 示例 4: 合规性检查集成
// ============================================

export function ComplianceCheckWithDify() {
  const [formData, setFormData] = useState({});
  const [complianceResult, setComplianceResult] = useState<{
    passed: boolean;
    issues: string[];
    suggestions: string[];
  } | null>(null);

  const { check, isChecking } = useDifyCompliance();

  // 执行合规检查
  const handleCheck = async () => {
    const result = await check('business-trip', formData);
    setComplianceResult(result);
  };

  return (
    <div>
      {/* 表单内容 */}

      {/* 合规检查结果 */}
      {complianceResult && (
        <div className={`p-4 rounded ${
          complianceResult.passed ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <h4 className="font-semibold">
            {complianceResult.passed ? '✓ 合规检查通过' : '✗ 合规检查未通过'}
          </h4>

          {complianceResult.issues.length > 0 && (
            <div className="mt-2">
              <p className="text-red-600">问题：</p>
              <ul className="list-disc list-inside">
                {complianceResult.issues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {complianceResult.suggestions.length > 0 && (
            <div className="mt-2">
              <p className="text-blue-600">建议：</p>
              <ul className="list-disc list-inside">
                {complianceResult.suggestions.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleCheck}
        disabled={isChecking}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded"
      >
        {isChecking ? '检查中...' : '合规检查'}
      </button>
    </div>
  );
}


// ============================================
// 使用说明
// ============================================

/**
 * Dify 智能体集成步骤：
 *
 * 1. 在 Dify 平台创建智能体
 *    - 创建对话应用或工作流
 *    - 配置意图识别、表单提取、合规检查等能力
 *    - 获取 API Key
 *
 * 2. 配置 API
 *    - 修改 src/app/services/dify.ts 中的 DIFY_CONFIG
 *    - 设置 baseUrl 和 apiKey
 *
 * 3. 在页面中使用
 *    - 导入对应的 Hook: import { useDifyChat, useDifyIntent } from '../hooks/useDify';
 *    - 在组件中调用 Hook 获取方法
 *    - 绑定到 UI 交互事件
 *
 * 4. Dify 智能体配置建议
 *
 *    意图识别 Prompt 示例:
 *    ```
 *    你是一个报销系统意图识别助手。分析用户输入，识别其意图。
 *
 *    意图类型:
 *    - business-trip: 出差申请
 *    - travel-reimbursement: 差旅报销
 *    - employee-reimbursement: 员工报销
 *
 *    返回 JSON:
 *    {
 *      "intent": "意图类型",
 *      "entities": { 提取的实体 },
 *      "confidence": 0.0-1.0
 *    }
 *    ```
 *
 *    表单提取 Prompt 示例:
 *    ```
 *    从用户输入中提取出差申请表单字段:
 *    - traveler: 出差人姓名
 *    - destination: 目的地
 *    - departure: 出发地
 *    - startDate: 出发日期
 *    - returnDate: 返回日期
 *    - reason: 出差原因
 *
 *    返回 JSON 格式的键值对。
 *    ```
 */
