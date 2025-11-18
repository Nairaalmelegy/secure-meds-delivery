-- Create chat sessions table to store patient conversations
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id TEXT NOT NULL,
  patient_name TEXT,
  patient_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'question', 'scale_response')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medical analysis table to store AI's analysis
CREATE TABLE IF NOT EXISTS public.medical_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL,
  symptoms TEXT[],
  severity_scores JSONB DEFAULT '{}'::jsonb,
  medical_history_reviewed JSONB DEFAULT '{}'::jsonb,
  questions_asked JSONB DEFAULT '{}'::jsonb,
  analysis_result TEXT,
  recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_sessions
CREATE POLICY "Users can view their own chat sessions"
  ON public.chat_sessions FOR SELECT
  USING (auth.uid()::text = patient_id);

CREATE POLICY "Users can create their own chat sessions"
  ON public.chat_sessions FOR INSERT
  WITH CHECK (auth.uid()::text = patient_id);

CREATE POLICY "Doctors and admins can view all chat sessions"
  ON public.chat_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id 
      AND raw_user_meta_data->>'role' IN ('doctor', 'admin')
    )
  );

-- RLS Policies for chat_messages
CREATE POLICY "Users can view their session messages"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND (chat_sessions.patient_id = auth.uid()::text)
    )
  );

CREATE POLICY "Users can create messages in their sessions"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.patient_id = auth.uid()::text
    )
  );

CREATE POLICY "Doctors and admins can view all messages"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id 
      AND raw_user_meta_data->>'role' IN ('doctor', 'admin')
    )
  );

-- RLS Policies for medical_analyses
CREATE POLICY "Users can view their own analyses"
  ON public.medical_analyses FOR SELECT
  USING (auth.uid()::text = patient_id);

CREATE POLICY "System can create analyses"
  ON public.medical_analyses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Doctors and admins can view all analyses"
  ON public.medical_analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id 
      AND raw_user_meta_data->>'role' IN ('doctor', 'admin')
    )
  );

-- Create indexes for better query performance
CREATE INDEX idx_chat_sessions_patient_id ON public.chat_sessions(patient_id);
CREATE INDEX idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX idx_medical_analyses_patient_id ON public.medical_analyses(patient_id);
CREATE INDEX idx_medical_analyses_session_id ON public.medical_analyses(session_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_chat_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_chat_session_updated_at();