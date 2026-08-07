export interface Env {
  AI: Ai;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { caseTitle, caseContent } = await context.request.json() as {
    caseTitle: string;
    caseContent: string;
  };

  const messages = [
    {
      role: "system",
      content: `You are a startup advisor and entrepreneur. Based on the AI product case study provided, generate 2-3 creative startup ideas that could be built inspired by this product. For each idea, provide:
1. A catchy name
2. One-line description
3. Key differentiator from the original product

Be concise and practical. Focus on adjacent markets or underserved niches. Respond in the same language as the case study content.`
    },
    {
      role: "user",
      content: `Product: ${caseTitle}\n\nCase Study:\n${caseContent.substring(0, 2000)}`
    }
  ];

  try {
    const response = await context.env.AI.run("@cf/meta/llama-3.2-3b-instruct", { messages });
    
    return new Response(JSON.stringify(response), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "AI request failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
};
