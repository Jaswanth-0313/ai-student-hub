const DEFAULT_MODEL = process.env.STUDY_AI_MODEL || 'gpt-4o-mini';

function configurationError() {
  return new Error('Study AI is not configured. Set STUDY_AI_API_KEY (OpenAI-compatible) on the backend.');
}

function parseJson(content) {
  const cleaned = String(content || '').replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try { return JSON.parse(cleaned); } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error('The AI returned an invalid structured response. Please try again.');
  }
}

async function askStudyAI({ instruction, material = '', responseShape }) {
  const apiKey = process.env.STUDY_AI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) throw configurationError();
  const baseUrl = (process.env.STUDY_AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are a precise study assistant. Use only the supplied material when material is provided. Return valid JSON matching the requested shape. Do not invent facts or cite information absent from the material.' },
        { role: 'user', content: `${instruction}\n\nRequired JSON shape:\n${JSON.stringify(responseShape)}\n\nStudy material:\n${material}` }
      ]
    })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error?.message || `Study AI request failed (${response.status}).`);
  return parseJson(payload.choices?.[0]?.message?.content);
}

module.exports = { askStudyAI };
