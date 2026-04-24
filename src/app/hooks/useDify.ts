/**
 * Dify 智能体 React Hook
 * 提供便捷的 AI 能力调用
 */

import { useState, useCallback, useRef } from 'react';
import {
  sendChatMessage,
  streamChatMessage,
  recognizeIntent,
  fillForm,
  processVoiceInput,
  checkCompliance,
  type IntentResult,
  type FormFillData,
} from '../services/dify';

interface UseDifyChatOptions {
  onMessage?: (message: string) => void;
  onError?: (error: Error) => void;
}

export function useDifyChat(options: UseDifyChatOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const conversationIdRef = useRef<string>('');

  // 发送消息
  const sendMessage = useCallback(async (content: string) => {
    setIsLoading(true);

    // 添加用户消息
    setMessages(prev => [...prev, { role: 'user', content }]);

    try {
      const response = await sendChatMessage(content, conversationIdRef.current);

      // 保存会话 ID
      if (response.conversation_id) {
        conversationIdRef.current = response.conversation_id;
      }

      // 添加助手回复
      setMessages(prev => [...prev, { role: 'assistant', content: response.answer }]);

      options.onMessage?.(response.answer);
      return response.answer;
    } catch (error) {
      options.onError?.(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  // 流式发送消息
  const sendMessageStream = useCallback(async (content: string) => {
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content }]);

    let assistantMessage = '';

    try {
      const fullAnswer = await streamChatMessage(
        content,
        (chunk) => {
          assistantMessage += chunk;
          // 实时更新消息
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage?.role === 'assistant') {
              lastMessage.content = assistantMessage;
            } else {
              newMessages.push({ role: 'assistant', content: assistantMessage });
            }
            return newMessages;
          });
        },
        conversationIdRef.current
      );

      options.onMessage?.(fullAnswer);
      return fullAnswer;
    } catch (error) {
      options.onError?.(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  // 清空消息
  const clearMessages = useCallback(() => {
    setMessages([]);
    conversationIdRef.current = '';
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    sendMessageStream,
    clearMessages,
  };
}

export function useDifyIntent() {
  const [isLoading, setIsLoading] = useState(false);

  const recognize = useCallback(async (userInput: string): Promise<IntentResult> => {
    setIsLoading(true);
    try {
      return await recognizeIntent(userInput);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { recognize, isLoading };
}

export function useDifyFormFill() {
  const [isLoading, setIsLoading] = useState(false);

  const fill = useCallback(async (
    formType: 'business-trip' | 'travel-reimbursement' | 'employee-reimbursement',
    userInput: string
  ): Promise<FormFillData> => {
    setIsLoading(true);
    try {
      return await fillForm(formType, userInput);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { fill, isLoading };
}

export function useDifyVoice() {
  const [isProcessing, setIsProcessing] = useState(false);

  const process = useCallback(async (voiceText: string) => {
    setIsProcessing(true);
    try {
      return await processVoiceInput(voiceText);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { process, isProcessing };
}

export function useDifyCompliance() {
  const [isChecking, setIsChecking] = useState(false);

  const check = useCallback(async (formType: string, formData: Record<string, any>) => {
    setIsChecking(true);
    try {
      return await checkCompliance(formType, formData);
    } finally {
      setIsChecking(false);
    }
  }, []);

  return { check, isChecking };
}
