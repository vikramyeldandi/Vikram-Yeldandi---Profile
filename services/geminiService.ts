import { GoogleGenAI, Type } from "@google/genai";
import { PresentationData, SlideType, ChartType } from "../types";

const SYSTEM_INSTRUCTION = `
You are an expert presentation designer and resume consultant. 
Your task is to convert raw resume text into a structured JSON object suitable for generating a professional slide deck.

**Design Principles:**
1. **Title Slide**: Candidate's name and contact info.
2. **Summary Slide**: 3-4 punchy, high-impact bullet points.
3. **Leadership Slide**: A dedicated slide for "Leadership Accomplishments". Extract key leadership achievements.
4. **Experience Slides**: Create a dedicated slide for **EVERY SINGLE ROLE** listed in the resume's work experience section. **DO NOT SKIP** older roles. You must generate a slide for every position found, including early career roles (e.g., Business Analyst, Product Manager). Highlight top 3-4 achievements with metrics for each.
5. **Skills & Education**: Group logically.
6. **Company Branding**: For EXPERIENCE slides, you MUST identify the \`companyName\` and infer the \`companyDomain\` (e.g., "salesforce.com", "wellsfargo.com", "pge.com") so we can fetch logos.
7. **Visualization Slides**: CRITICAL. You MUST extract specific data to create "Visual" slides for the following categories if data is available:
    - **Customer Impact**: Focus on NPS, Satisfaction scores, Adoption rates.
    - **Business Value**: Focus on Revenue ($), Growth (%), Cost Savings.
    - **AI Tools and Architecture**: Create a dedicated slide titled "AI Tools and Architecture". Extract tools and concepts like NotebookLM, GoogleAI Studio, Gemini, ChatGPT, Kimi, Granola, Perplexity, Claude, RAG, Tokens, Vector, Attention, Chunking, Evals. Set type to \`VISUALIZATION\` and chart type to \`BUBBLE_CHART\`.
    - **Cross-functional Collaboration**: List teams managed or partnered with.
    - **Team Building**: Hiring, retention, team size.

**For Visualization Slides:**
- Set \`type\` to \`VISUALIZATION\`.
- Use \`METRIC_GRID\` for emphasizing big numbers (e.g., "$3MM Revenue", "23% Increase").
- Use \`BAR_CHART\` when comparing items or showing a list of performance metrics.
- Use \`BUBBLE_CHART\` for "AI Tools and Architecture" or lists of technologies.
- Ensure the \`chart.items\` array is populated with concise labels. 
- **CRITICAL FOR BUBBLE_CHART**: The \`value\` can be empty or a category name. You **MUST** provide a short, 1-sentence explanation of what the tool or concept does in the \`description\` field (e.g., "RAG: Retrieval-Augmented Generation for grounding LLMs").

The output must be strictly valid JSON.
`;

export const parseResumeToSlides = async (resumeText: string): Promise<PresentationData> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create a professional slide deck from the following resume. Ensure you include a dedicated Leadership Accomplishments slide and the AI Tools slide. IMPORTANT: Generate specific experience slides for the "Product Manager at Pacific Gas and Electric" and "Sr. Business Analyst at Wells Fargo" roles:\n\n${resumeText}`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          theme: { type: Type.STRING },
          author: { type: Type.STRING },
          slides: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                companyName: { type: Type.STRING, description: "The name of the company for this role" },
                companyDomain: { type: Type.STRING, description: "The website domain of the company, e.g., 'netflix.com' or 'google.com'" },
                bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                type: { 
                    type: Type.STRING, 
                    enum: [
                        SlideType.TITLE, 
                        SlideType.SUMMARY, 
                        SlideType.LEADERSHIP,
                        SlideType.EXPERIENCE, 
                        SlideType.SKILLS, 
                        SlideType.EDUCATION, 
                        SlideType.GENERIC,
                        SlideType.VISUALIZATION
                    ] 
                },
                chart: {
                    type: Type.OBJECT,
                    properties: {
                        type: { 
                            type: Type.STRING, 
                            enum: [ChartType.METRIC_GRID, ChartType.BAR_CHART, ChartType.BUBBLE_CHART] 
                        },
                        items: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    label: { type: Type.STRING },
                                    value: { type: Type.STRING, description: "Display value or category" },
                                    description: { type: Type.STRING, description: "Short explanation of the tool/concept" }
                                },
                                required: ["label", "value"]
                            }
                        }
                    },
                    required: ["type", "items"]
                },
                footer: { type: Type.STRING }
              },
              required: ["title", "bullets", "type"]
            }
          }
        },
        required: ["slides", "author"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from Gemini");
  }

  return JSON.parse(text) as PresentationData;
};