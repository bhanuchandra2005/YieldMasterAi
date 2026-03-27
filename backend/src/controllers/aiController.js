import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "../models/index.js";

// Initialize OpenAI client for OpenAI/Groq
const openaiClient = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY 
  ? new OpenAI({
      apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY,
      baseURL: process.env.GROQ_API_KEY ? "https://api.groq.com/openai/v1" : undefined
    }) 
  : null;

// Initialize Google AI client
const googleClient = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export async function chat(req, res, next) {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array required" });
    }

    let reply = "";
    let usage = {};

    // 1. Prefer Gemini as requested
    if (googleClient) {
      try {
        const model = googleClient.getGenerativeModel({ model: "gemini-pro" });
        const lastUserMessage = messages[messages.length - 1].content;
        const result = await model.generateContent(lastUserMessage);
        const response = await result.response;
        reply = response.text();
        usage = { total_tokens: response.usageMetadata?.totalTokenCount || 0 };
      } catch (geminiError) {
        console.warn("Gemini API failed, falling back to Groq/OpenAI...");
      }
    }

    // 2. Fallback to Groq/OpenAI
    if (!reply && openaiClient) {
      try {
        const modelName = process.env.GROQ_API_KEY ? "llama-3.1-8b-instant" : "gpt-4o-mini";
        const completion = await openaiClient.chat.completions.create({
          model: modelName,
          messages: messages.map((m) => ({ role: m.role || "user", content: m.content })),
          max_tokens: 500,
        });
        reply = completion.choices[0]?.message?.content ?? "";
        usage = completion.usage;
      } catch (openaiError) {
        console.error("All AI services failed:", openaiError.message);
        return res.status(502).json({ error: "All AI services failed", message: openaiError.message });
      }
    } 

    if (!reply) {
      return res.status(511).json({ error: "No AI key provided", message: "Please set an API key in the environment." });
    }

    // Common token logging logic
    if (req.user?.sub && usage.total_tokens) {
      await prisma.apiUsageLog.create({
        data: { userId: req.user.sub, endpoint: "/api/ai/chat", tokens: usage.total_tokens },
      });
    }

    return res.json({ reply, usage });
  } catch (err) {
    next(err);
  }
}

export async function vision(req, res, next) {
  try {
    const { image, mimeType } = req.body;
    if (!image || !mimeType) return res.status(400).json({ error: "Missing image data" });

    const prompt = `Act as an expert agronomist in India. Analyze this crop image. Identify the crop, any visible diseases, pests, or deficiencies. Provide a confident diagnosis, a suggested remedy (both organic and chemical), and the potential yield loss percentage if untreated. Return the response in a structured JSON format with these exact keys: cropName, issueFound (boolean), diagnosisTitle, confidenceScore (0 to 1), organicRemedy, chemicalRemedy, yieldLossImpact (e.g. "15-20%"), detailedExplanation.`;

    let parsed = null;
    let tokens = 0;

    // 1. Try Gemini First
    if (googleClient) {
      try {
        const model = googleClient.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent([
          prompt,
          { inlineData: { data: image, mimeType: mimeType } }
        ]);
        const response = await result.response;
        let text = response.text();
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        parsed = JSON.parse(text);
        tokens = response.usageMetadata?.totalTokenCount || 0;
      } catch (e) {
        console.warn("Gemini vision failed:", e.message);
      }
    }

    // 2. Fallback to OpenAI Vision (gpt-4o-mini)
    if (!parsed && process.env.OPENAI_API_KEY) {
      try {
        console.log("Trying OpenAI vision fallback (gpt-4o-mini)...");
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${image}`
                  }
                }
              ]
            }
          ],
          response_format: { type: "json_object" }
        });
        
        let text = completion.choices[0]?.message?.content ?? "{}";
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        parsed = JSON.parse(text);
        tokens = completion.usage?.total_tokens || 0;
      } catch (e) {
        console.warn("OpenAI vision fallback failed:", e.message);
      }
    }

    // 3. Fallback to Groq Vision (llama-3.2-11b-vision-preview)
    if (!parsed && process.env.GROQ_API_KEY) {
      try {
        console.log("Trying Groq vision fallback...");
        const groq = new OpenAI({ 
          apiKey: process.env.GROQ_API_KEY,
          baseURL: "https://api.groq.com/openai/v1"
        });
        const completion = await groq.chat.completions.create({
          model: "llama-3.2-11b-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${image}`
                  }
                }
              ]
            }
          ]
        });
        
        let text = completion.choices[0]?.message?.content ?? "{}";
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        parsed = JSON.parse(text);
        tokens = completion.usage?.total_tokens || 0;
      } catch (e) {
        console.warn("Groq vision fallback failed:", e.message);
        return res.status(502).json({ error: "Groq Fallback Error", message: e.message });
      }
    }

    if (!parsed) {
      return res.status(502).json({ error: "API Failure", message: "All AI keys failed (Gemini, OpenAI, Groq)." });
    }

    if (req.user?.sub && tokens > 0) {
      await prisma.apiUsageLog.create({
        data: { userId: req.user.sub, endpoint: "/api/ai/vision", tokens: tokens },
      });
    }

    return res.json({ diagnosis: parsed });
  } catch (err) {
    next(err);
  }
}

