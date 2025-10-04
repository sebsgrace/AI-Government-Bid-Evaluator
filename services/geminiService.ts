
import { GoogleGenAI } from "@google/genai";
import type { Project, Bidder, BACMember } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeBid = async (
  project: Project,
  bidders: Bidder[],
  winningBidderName: string,
  reasoning: string,
  bacMembers: BACMember[]
) => {
  const winningBidder = bidders.find(b => b.name === winningBidderName);

  if (!winningBidder) {
    throw new Error("Winning bidder not found in the list of bidders.");
  }

  const prompt = `
    You are an expert AI agent specializing in procurement fraud detection for government projects. Your task is to analyze the provided bidding information and generate a comprehensive, objective assessment report. Use Google Search to find connections and historical data.

    **Project Details:**
    - Project Name: ${project.name}
    - Location: ${project.location}
    - Approved Budget: PHP ${project.budget.toLocaleString()}
    - Project Description: ${project.description}

    **Bidding Information:**
    - Winning Bidder: ${winningBidder.name}
    - Winning Bid Amount: PHP ${Number(winningBidder.amount).toLocaleString()}
    - Bids and Awards Committee (BAC):
      ${bacMembers.map(m => `- ${m.name}, ${m.designation}`).join('\n')}
    - User's Reasoning for Selection: ${reasoning}

    **All Bidders:**
    ${bidders.map(b => `
    - Bidder Name: ${b.name}
    - Bid Amount: PHP ${Number(b.amount).toLocaleString()}
    - Bid Inclusions: ${b.inclusions}
    `).join('\n')}

    **Your Mandate:**
    Using your advanced search capabilities, investigate the following and consolidate findings into a structured report. Be factual and cite sources.

    1.  **Conflict of Interest Analysis:** Search for connections (familial, business, political) between the BAC members and the winning contractor's key officers. Scan for public information showing relationships between these parties.
    2.  **Bidder Collusion Detection:** Analyze the list of bidders. Do they share board members or addresses? Look for patterns suggesting bid rigging (unusually close bids, consistent winners in a region).
    3.  **Bidder History & Performance Review:** Investigate the winning bidder's history with government projects. Search for news reports or official audits related to their performance on past projects (delays, quality issues, scandals).
    4.  **Financial & Asset Analysis (Simulated):** Based on public information, analyze if the winning bid is reasonable. Describe red flags you would look for in the Statement of Assets, Liabilities, and Net Worth (SALN) of the involved public officials.

    **Final Report Structure (Use Markdown):**
    - **Overall Assessment & Risk Level:** Summarize findings and assign a risk level (Low, Medium, High).
    - **1. Conflict of Interest Findings:** Detail connections found.
    - **2. Bidder Collusion Analysis:** Detail suspicious patterns.
    - **3. Bidder Performance History:** Summarize historical performance.
    - **4. Financial Red Flags & SALN Analysis:** Discuss bid reasonableness and SALN analysis approach.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    return {
      report: response.text,
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
    };
  } catch (error) {
    console.error("Error analyzing bid:", error);
    throw new Error("Failed to get analysis from AI. Please check the console for details.");
  }
};
