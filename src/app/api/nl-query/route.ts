import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { question, data } = await req.json();

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`, // Ensure this is in .env.local
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // 👈 The correct model
        messages: [
          {
            role: "system",
            content:
              "You're a helpful assistant. Given a user's question and a list of JSON objects, return ONLY a filtered JSON array that matches the query. Do NOT explain or add anything extra.",
          },
          {
            role: "user",
            content: `Filter the following data based on this question:\n\nQuestion: ${question}\n\nData:\n${JSON.stringify(data).slice(0, 12000)}`,
          },
        ],
        temperature: 0.2,
      }),
    });

    const json = await response.json();

    const content = json.choices?.[0]?.message?.content || "";

    // 🧠 Extract the array from the model output
    const jsonStart = content.indexOf("[");
    const jsonEnd = content.lastIndexOf("]") + 1;

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("JSON array not found in model response");
    }

    const filteredData = JSON.parse(content.slice(jsonStart, jsonEnd));

    return NextResponse.json(filteredData);
  } catch (err) {
    console.error("❌ Error in /api/nl-query:", err);
    return NextResponse.json({ error: "Failed to filter data" }, { status: 500 });
  }
}
