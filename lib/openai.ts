import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

export async function getPartSuggestions(
  item: {
    partNumber: string;
    description: string;
    manufacturer?: string;
    mpn?: string;
  },
  userMessage: string
): Promise<string> {
  try {
    const client = getOpenAIClient();

    const systemPrompt = `You are an electronics parts sourcing assistant. You help users identify and source electronic components for their Bill of Materials (BOM).

Given a component from a BOM, you help:
1. Identify the exact part based on partial information
2. Suggest equivalent or compatible alternatives
3. Explain part specifications and parameters
4. Recommend sourcing strategies

Current BOM item:
- Part Number: ${item.partNumber || "Not specified"}
- Description: ${item.description || "Not specified"}
- Manufacturer: ${item.manufacturer || "Not specified"}
- MPN: ${item.mpn || "Not specified"}

Be concise and practical in your responses.`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "No response generated.";
  } catch (error) {
    console.error("OpenAI error:", error);
    throw error;
  }
}

export async function identifyPart(
  partInfo: string
): Promise<{ mpn?: string; manufacturer?: string; description?: string }> {
  try {
    const client = getOpenAIClient();

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an electronics parts identification expert. Given partial information about a component, identify the most likely:
1. Manufacturer Part Number (MPN)
2. Manufacturer name
3. Component description

Respond in JSON format:
{
  "mpn": "exact MPN if identifiable",
  "manufacturer": "manufacturer name",
  "description": "brief component description"
}

If you cannot identify something with confidence, omit that field.`,
        },
        {
          role: "user",
          content: partInfo,
        },
      ],
      max_tokens: 200,
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content || "{}";
    return JSON.parse(content);
  } catch (error) {
    console.error("Part identification error:", error);
    return {};
  }
}
