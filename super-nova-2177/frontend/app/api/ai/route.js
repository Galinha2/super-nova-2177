import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const reply = completion.choices[0].message.content;
    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json(
      { reply: "OpenAI API error: " + error.message },
      { status: 500 }
    );
  }
}