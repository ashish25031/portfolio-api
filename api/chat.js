import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, history = [] } = req.body;

    const completion = await client.chat.completions.create({
      model: "nvidia/nemotron-3-ultra-550b-a55b",
      messages: [
        {
          role: "system",
          content:
            "You are Ashish Kumar's AI portfolio assistant. Answer only questions about Ashish, his skills, projects, certifications, education, and experience.",
        },
        ...history,
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 1,
      top_p: 0.95,
      max_tokens: 4096,
      extra_body: {
        chat_template_kwargs: {
          enable_thinking: true,
        },
        reasoning_budget: 4096,
      },
    });

    res.status(200).json({
      reply: completion.choices[0].message.content,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
}