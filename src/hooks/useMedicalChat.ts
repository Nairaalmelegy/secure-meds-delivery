import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  message_type?: 'text' | 'question' | 'scale_response';
  metadata?: any;
  created_at?: string;
};

export type ChatPhase = 'initial' | 'questioning' | 'analysis';

export function useMedicalChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'assistant',
      content: "Hello! I'm MediAssist, your AI medical assistant. I'll help you understand your symptoms by asking some questions. What brings you here today?",
      message_type: 'text'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [phase, setPhase] = useState<ChatPhase>('initial');
  const { toast } = useToast();

  const createSession = useCallback(async (patientId: string, patientName: string, patientEmail: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          patient_id: patientId,
          patient_name: patientName,
          patient_email: patientEmail
        })
        .select()
        .single();

      if (error) throw error;
      setSessionId(data.id);
      return data.id;
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: "Error",
        description: "Failed to create chat session",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  const saveMessage = useCallback(async (
    sessionId: string,
    role: 'user' | 'assistant',
    content: string,
    messageType: 'text' | 'question' | 'scale_response' = 'text',
    metadata: any = {}
  ) => {
    try {
      await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          role,
          content,
          message_type: messageType,
          metadata
        });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }, []);

  const fetchMedicalRecords = useCallback(async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('chronic_diseases, allergies, past_medications, scans')
        .eq('id', patientId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching medical records:', error);
      return null;
    }
  }, []);

  const sendMessage = useCallback(async (
    text: string,
    patientId: string,
    patientName: string,
    patientEmail: string,
    severityScore?: number
  ) => {
    if (!text.trim()) return;

    setLoading(true);

    try {
      // Create session if needed
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        currentSessionId = await createSession(patientId, patientName, patientEmail);
        if (!currentSessionId) return;
      }

      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: text,
        message_type: severityScore !== undefined ? 'scale_response' : 'text',
        metadata: severityScore !== undefined ? { severity: severityScore } : {}
      };
      
      setMessages(prev => [...prev, userMessage]);
      await saveMessage(
        currentSessionId, 
        'user', 
        text, 
        userMessage.message_type,
        userMessage.metadata
      );

      // Fetch medical records
      const medicalRecords = await fetchMedicalRecords(patientId);

      // Determine next phase
      const questionCount = messages.filter(m => m.message_type === 'question').length;
      let nextPhase: ChatPhase = phase;
      
      if (phase === 'initial' && questionCount === 0) {
        nextPhase = 'questioning';
      } else if (phase === 'questioning' && questionCount >= 3) {
        nextPhase = 'analysis';
      }

      // Call edge function
      const { data, error } = await supabase.functions.invoke('medical-chat', {
        body: {
          message: text,
          patientId,
          sessionId: currentSessionId,
          conversationHistory: messages.slice(-10), // Last 10 messages for context
          medicalRecords,
          phase: nextPhase
        }
      });

      if (error) throw error;

      // Add AI response
      const aiMessage: ChatMessage = {
        id: `${Date.now()}-ai`,
        role: 'assistant',
        content: data.reply,
        message_type: nextPhase === 'questioning' ? 'question' : 'text'
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setPhase(nextPhase);
      
      await saveMessage(
        currentSessionId,
        'assistant',
        data.reply,
        aiMessage.message_type
      );

      // If analysis phase completed, save medical analysis
      if (nextPhase === 'analysis') {
        await supabase
          .from('medical_analyses')
          .insert({
            session_id: currentSessionId,
            patient_id: patientId,
            symptoms: messages
              .filter(m => m.role === 'user')
              .map(m => m.content),
            severity_scores: messages
              .filter(m => m.metadata?.severity !== undefined)
              .reduce((acc, m) => ({ ...acc, [m.content]: m.metadata.severity }), {}),
            analysis_result: data.reply,
            medical_history_reviewed: medicalRecords
          });
      }

    } catch (error: any) {
      console.error('Chat error:', error);
      
      const errorMessage: ChatMessage = {
        id: `${Date.now()}-error`,
        role: 'assistant',
        content: error.isRateLimit 
          ? "I'm receiving too many requests right now. Please wait a moment and try again."
          : "I apologize, but I'm having trouble connecting. Please try again.",
        message_type: 'text'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [messages, sessionId, phase, createSession, saveMessage, fetchMedicalRecords, toast]);

  return {
    messages,
    loading,
    sendMessage,
    phase
  };
}