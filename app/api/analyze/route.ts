import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a senior business intelligence analyst. Given a company name and optional URL, you produce a structured, accurate company profile for sales professionals and investors.

You MUST respond with exactly 7 JSON objects, one per line (newline-delimited JSON). Each object has a "section" key and a "data" key. Output them in this exact order:

1. {"section":"snapshot","data":{"paragraph":"..."}}
   - One crisp paragraph: what they do, for whom, and why it matters. 2-4 sentences.

2. {"section":"business_model","data":{"description":"...","model_type":"...","market_position":"..."}}
   - How they make money, their revenue model, and where they sit in the competitive landscape.

3. {"section":"challenges","data":{"items":[{"title":"...","detail":"..."},...]}}
   - 3 specific, current challenges this company likely faces. Be specific to their situation.

4. {"section":"tech_stack","data":{"items":[{"name":"...","category":"...","confidence":"high|medium|low"},...]}}
   - 5-8 tools/technologies they likely use based on their profile. Categories: CRM, Analytics, Infrastructure, Marketing, Product, etc.

5. {"section":"growth_signals","data":{"signals":[{"type":"...","detail":"...","sentiment":"positive|neutral|negative"},...],"funding_stage":"...","team_size_estimate":"..."}}
   - 3-5 growth/hiring/expansion signals. Include funding stage and estimated team size.

6. {"section":"conversation_starters","data":{"questions":[{"question":"...","rationale":"..."},{"question":"...","rationale":"..."},{"question":"...","rationale":"..."}]}}
   - Exactly 3 smart, specific questions a sales rep or investor would ask. Include brief rationale for each.

7. {"section":"opportunity_score","data":{"score":7,"rationale":"...","factors":["...","...","..."]}}
   - Score 1-10. Rationale is one sentence. 3 key factors (positive or negative) that drove the score.

Use the web_search tool to find real, current information about the company before generating each section. Search for their website, recent news, LinkedIn, Crunchbase, etc.

Output ONLY the 7 JSON lines. No markdown, no preamble, no explanation. Just the JSON objects separated by newlines.`;

export async function POST(req: NextRequest) {
  const { company, url } = await req.json();

  if (!company) {
    return new Response("Company name required", { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const userMessage = url
          ? `Company: ${company}\nWebsite: ${url}\n\nGenerate the full 7-section company intelligence profile.`
          : `Company: ${company}\n\nGenerate the full 7-section company intelligence profile. Search the web to find accurate, current information about this company.`;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await (client.messages.create as any)({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: SYSTEM_PROMPT,
          tools: [
            {
              type: "web_search_20250305",
              name: "web_search",
              max_uses: 6,
            },
          ],
          messages: [{ role: "user", content: userMessage }],
        });

        // Extract text content from response
        let fullText = "";
        for (const block of response.content) {
          if (block.type === "text") {
            fullText += block.text;
          }
        }

        // Parse and stream each JSON line
        const lines = fullText.split("\n").filter((line) => line.trim());
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("{")) {
            try {
              JSON.parse(trimmed); // validate
              controller.enqueue(encoder.encode(trimmed + "\n"));
              // Small delay for progressive reveal effect
              await new Promise((r) => setTimeout(r, 150));
            } catch {
              // skip malformed lines
            }
          }
        }

        controller.close();
      } catch (error) {
        console.error("API error:", error);
        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              section: "error",
              data: { message: "Failed to generate intelligence. Please try again." },
            }) + "\n"
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    },
  });
}
