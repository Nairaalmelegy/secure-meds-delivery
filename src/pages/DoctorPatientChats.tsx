import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { Search } from 'lucide-react';

type ChatSession = {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_email: string;
  created_at: string;
  updated_at: string;
};

type ChatMessage = {
  id: string;
  session_id: string;
  role: string;
  content: string;
  message_type: string;
  metadata: any;
  created_at: string;
};

type MedicalAnalysis = {
  id: string;
  session_id: string;
  patient_id: string;
  symptoms: string[];
  severity_scores: any;
  medical_history_reviewed: any;
  analysis_result: string;
  recommendations: string;
  created_at: string;
};

export default function DoctorPatientChats() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['chat-sessions', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`patient_name.ilike.%${searchQuery}%,patient_email.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ChatSession[];
    },
  });

  const { data: messages } = useQuery({
    queryKey: ['chat-messages', selectedSession],
    queryFn: async () => {
      if (!selectedSession) return [];
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', selectedSession)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!selectedSession,
  });

  const { data: analysis } = useQuery({
    queryKey: ['medical-analysis', selectedSession],
    queryFn: async () => {
      if (!selectedSession) return null;
      const { data, error } = await supabase
        .from('medical_analyses')
        .select('*')
        .eq('session_id', selectedSession)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as MedicalAnalysis | null;
    },
    enabled: !!selectedSession,
  });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Patient Medical Chats</h1>
        <p className="text-muted-foreground">
          Review AI-assisted patient consultations and medical analyses
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Chat Sessions</CardTitle>
            <CardDescription>Select a session to view details</CardDescription>
            <div className="relative mt-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              {sessionsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : sessions?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No chat sessions found
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions?.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => setSelectedSession(session.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedSession === session.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <div className="font-medium">{session.patient_name}</div>
                      <div className="text-sm opacity-80">{session.patient_email}</div>
                      <div className="text-xs mt-1 opacity-70">
                        {new Date(session.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
            <CardDescription>
              {selectedSession
                ? 'Review conversation and AI analysis'
                : 'Select a session to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedSession ? (
              <div className="text-center py-12 text-muted-foreground">
                Select a chat session from the left to view details
              </div>
            ) : (
              <Tabs defaultValue="conversation" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="conversation">Conversation</TabsTrigger>
                  <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="conversation" className="mt-4">
                  <ScrollArea className="h-[550px] pr-4">
                    <div className="space-y-4">
                      {messages?.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.role === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              msg.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {msg.role === 'user' ? 'Patient' : 'AI'}
                              </Badge>
                              {msg.metadata?.severity && (
                                <Badge variant="secondary" className="text-xs">
                                  Severity: {msg.metadata.severity}/5
                                </Badge>
                              )}
                            </div>
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                            <div className="text-xs opacity-70 mt-2">
                              {new Date(msg.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="analysis" className="mt-4">
                  {analysis ? (
                    <ScrollArea className="h-[550px] pr-4">
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-semibold mb-2">Reported Symptoms</h3>
                          <div className="flex flex-wrap gap-2">
                            {analysis.symptoms.map((symptom, i) => (
                              <Badge key={i} variant="outline">
                                {symptom}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Severity Scores</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(analysis.severity_scores || {}).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="p-2 bg-muted rounded flex justify-between"
                                >
                                  <span className="text-sm">{key}</span>
                                  <Badge>{value as number}/5</Badge>
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">
                            Medical History Reviewed
                          </h3>
                          <div className="p-3 bg-muted rounded">
                            <pre className="text-sm whitespace-pre-wrap">
                              {JSON.stringify(
                                analysis.medical_history_reviewed,
                                null,
                                2
                              )}
                            </pre>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">AI Analysis Result</h3>
                          <div className="p-3 bg-muted rounded">
                            <ReactMarkdown>{analysis.analysis_result}</ReactMarkdown>
                          </div>
                        </div>

                        {analysis.recommendations && (
                          <div>
                            <h3 className="font-semibold mb-2">Recommendations</h3>
                            <div className="p-3 bg-primary/10 rounded">
                              <ReactMarkdown>{analysis.recommendations}</ReactMarkdown>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No AI analysis available for this session yet
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}