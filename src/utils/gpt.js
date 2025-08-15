// GPT helper - insert your API key below
import OpenAI from 'openai';

const apiKey = 'YOUR_API_KEY_HERE'; // Replace with your key
export const aiClient = apiKey ? new OpenAI({ apiKey }) : null;

export async function generateSummary(text) {
  if (!aiClient) return '';
  const res = await aiClient.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: `Write a concise resume summary for: ${text}` }],
  });
  return res.choices[0].message.content;
}
