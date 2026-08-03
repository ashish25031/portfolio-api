import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, history = [] } = req.body;

    // Convert frontend history to OpenAI/NVIDIA format
    const formattedHistory = history.map((msg) => ({
      role: msg.role === "model" ? "assistant" : msg.role,
      content: msg.text || msg.content,
    }));

    const completion = await client.chat.completions.create({
      model: "nvidia/nemotron-3-ultra-550b-a55b",
      messages: [
        {
          role: "system",
          content:
            "You are Ashish Kumar's AI portfolio assistant. Answer only questions about Ashish's projects, skills, education, certifications, and experience.",
        },
        ...formattedHistory,
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 1,
      top_p: 0.95,
      max_tokens: 4096,
    });

    return res.status(200).json({
      reply: completion.choices[0].message.content,
    });
  } catch (err) {
    console.error("FULL ERROR:", err);

    return res.status(500).json({
      message: err.message,
      error: err.error || err,
    });
  }
}