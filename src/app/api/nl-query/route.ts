// app/api/nl-query/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  const { question, data } = await req.json();

  const prompt = `
You are a smart assistant that receives a JSON dataset and a natural language filter request.
Return ONLY the filtered JSON array of matching objects. No explanations. Output must be valid JSON.

Query: ${question}
Data: ${JSON.stringify(data).slice(0, 3000)}
`;

  try {
    const groqRes = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "distil-whisper-large-v3-en", 
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = groqRes.data.choices?.[0]?.message?.content || "[]";

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("GROQ error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
