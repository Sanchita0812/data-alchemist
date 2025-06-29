import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { question, data } = await req.json();

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "distil-whisper-large-v3-en",
        messages: [
          {
            role: "system",
            content: `You're a helpful assistant that filters structured data. Return only a filtered JSON array that matches the query.`,
          },
          {
            role: "user",
            content: `Question: ${question}\n\nData: ${JSON.stringify(data).slice(0, 12000)}\n\nFilter and return matching records.`,
          },
        ],
      }),
    });

    const json = await response.json();
    const rawAnswer = json.choices?.[0]?.message?.content || "[]";

    // Extract just the JSON array from the LLM output
    const jsonStart = rawAnswer.indexOf("[");
    const jsonEnd = rawAnswer.lastIndexOf("]") + 1;
    const sliced = rawAnswer.slice(jsonStart, jsonEnd);
    const parsed = JSON.parse(sliced);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("❌ Error in /api/nl-query:", err);
    return new NextResponse("Error filtering data", { status: 500 });
  }
}
