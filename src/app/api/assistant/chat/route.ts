import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

const SYSTEM_INSTRUCTION = `
You are Evolve AI Assistant, the core Automated Studio Management & Client Inquiry Intelligence Engine for Evolve Pole Fitness and Aerial Arts Studio (Davao City, Philippines). Your role is to function as a deterministic, helpful, and premium Q&A and booking support agent that processes client inquiries, schedules, and studio rules to provide precise and friendly assistance.

### CORE OBJECTIVES
1. ACCURATE STUDIO Q&A: Interpret client questions regarding class details, location, operating hours, class pricing, and check-in procedures.
2. BOOKING LOGIC SUPPORT: Guide users on booking policies, waitlist rules, and how to register multiple participants under standard reservation constraints.

### OPERATIONAL CONSTRAINTS & BEHAVIOR
- DATA GROUNDING: Rely strictly on the context, active schedule logs, and user profile data provided in the prompt. If you cannot answer a question based on the provided logs/context, respond exactly with: {"error": "Insufficient class and scheduling details available for this request."}. Never make up classes or coach rosters.
- TONE: Warm, professional, welcoming, and analytical. Eliminate generic conversational filler (e.g., "Sure, I can help you with that") while maintaining the premium, supportive vibe of a fitness/wellness studio.
- STUDIO RULES & CONSTANTS:
  * Class Size Limits: Regular classes have a strict maximum capacity of 5 mountable rig points. Special Masterclasses require a minimum of 3 participants and a maximum of 5.
  * Waitlist Limits: The waitlist queue is capped at a maximum of 2 slots.
  * Class Pricing: Group classes cost ₱1,000 per session, and private 1-on-1 classes are ₱1,800 per session.
  * Location: 3F Sunscor Bldg., corner Arroyo St., along R Castillo highway, Davao City, 8000.
  * Hours: Monday to Friday 9:00 AM - 9:00 PM (Closed on Tuesdays), Saturdays 9:00 AM - 5:00 PM, Closed on Sundays.
- OUTPUT FORMAT: You must always output valid, minified JSON matching the requested schema. No markdown wrappers (like \`\`\`json), no trailing text.
`;

const assistantResponseSchema = {
  type: Type.OBJECT,
  properties: {
    status: {
      type: Type.STRING,
      enum: ["success", "action_required", "error"]
    },
    category: {
      type: Type.STRING,
      enum: ["scheduling", "booking_rules", "pricing_inquiry", "location_hours", "general"]
    },
    answer: { type: Type.STRING },
    auto_reply: { type: Type.STRING },
    flagged_warnings: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ["status", "category", "answer", "auto_reply", "flagged_warnings"],
};

export async function POST(request: Request) {
  try {
    const { message, userProfile } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        status: "success",
        category: "general",
        answer: "Welcome to Evolve Pole Fitness & Aerial Arts! I can help you with class schedules, booking rules, pricing, or location information.",
        auto_reply: "Assistant fallback response.",
        flagged_warnings: []
      });
    }

    // Initialize Google Gen AI
    const ai = new GoogleGenAI({ apiKey });

    // Fetch classes context from Supabase if configured, otherwise fallback to empty array
    let activeClasses: any[] = [];
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        const { data } = await supabaseAdmin
          .from("class_availability")
          .select("*")
          .gte("starts_at", new Date().toISOString())
          .eq("status", "scheduled")
          .order("starts_at", { ascending: true })
          .limit(10);
        
        if (data) {
          activeClasses = data;
        }
      } catch (dbErr) {
        console.warn("Supabase fetch inside AI assistant API failed, using fallback empty context:", dbErr);
      }
    }

    const promptContent = `
      ### USER PROFILE CONTEXT
      ${JSON.stringify(userProfile || { full_name: "Guest Student", available_credits: 0 }, null, 2)}

      ### ACTIVE CLASS SCHEDULE LOGS
      ${JSON.stringify(activeClasses, null, 2)}

      ### USER QUERY
      ${message}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: promptContent,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: assistantResponseSchema,
        temperature: 0.2,
      }
    });

    const resultData = JSON.parse(response.text || '{}');
    return NextResponse.json(resultData);
  } catch (err: any) {
    console.error("AI Assistant API Error:", err);
    return NextResponse.json(
      { 
        status: "error", 
        answer: "I encountered a technical issue while processing your message. Please try again shortly.",
        auto_reply: "Technical error in assistant API.",
        flagged_warnings: ["API_ERROR"] 
      },
      { status: 500 }
    );
  }
}
