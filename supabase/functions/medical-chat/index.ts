import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      message, 
      patientId, 
      sessionId,
      conversationHistory = [],
      medicalRecords = null,
      phase = 'initial' // initial, questioning, analysis
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build system prompt based on phase and medical data
    let systemPrompt = `You are MediAssist, an advanced medical AI assistant integrated into MediLink. 
Your role is to help patients understand their symptoms through intelligent questioning and analysis.

CRITICAL RULES:
1. ALWAYS review the patient's medical history before responding
2. NEVER give direct diagnoses - suggest potential causes and recommend seeing a doctor
3. Use interactive questioning to gather complete information
4. Ask follow-up questions one at a time with severity scales (0-5)
5. Consider past conditions, allergies, and medications in your analysis
6. Be empathetic and reassuring while being thorough

`;

    // Add medical records context if available
    if (medicalRecords) {
      systemPrompt += `\nPATIENT MEDICAL RECORDS:
- Chronic Diseases: ${medicalRecords.chronicDiseases?.join(', ') || 'None reported'}
- Allergies: ${medicalRecords.allergies?.join(', ') || 'None reported'}
- Past Medications: ${medicalRecords.pastMedications?.join(', ') || 'None reported'}
- Previous Scans: ${medicalRecords.scans?.length || 0} scans on file
`;
    }

    // Add phase-specific instructions
    if (phase === 'initial') {
      systemPrompt += `\nCURRENT PHASE: Initial Assessment
- Review the patient's question
- Check their medical history for relevant conditions
- Ask ONE specific follow-up question with a severity scale
- Format: "On a scale of 0-5, where 0 is none and 5 is severe, how would you rate [specific symptom]?"
`;
    } else if (phase === 'questioning') {
      systemPrompt += `\nCURRENT PHASE: Detailed Questioning
- Continue gathering information with ONE question at a time
- Use severity scales for intensity/frequency questions
- After 3-5 questions, move to analysis phase
`;
    } else if (phase === 'analysis') {
      systemPrompt += `\nCURRENT PHASE: Analysis & Recommendations
- Synthesize all gathered information
- Consider medical history in your assessment
- Provide personalized insights
- Give clear recommendations
- Suggest when to see a doctor
- Format response with:
  * Summary of symptoms
  * Possible causes (based on symptoms + history)
  * Recommendations
  * When to seek immediate care
`;
    }

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    console.log('Calling Lovable AI with Gemini model...');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash', // Using Gemini for medical reasoning
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded. Please try again in a moment.',
            isRateLimit: true 
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: 'AI service credits depleted. Please contact support.',
            isPaymentRequired: true 
          }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI Response generated successfully');

    return new Response(
      JSON.stringify({ 
        reply: aiResponse,
        sessionId: sessionId,
        phase: phase
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in medical-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        reply: 'I apologize, but I encountered an error. Please try again.'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});