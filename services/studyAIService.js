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

function prototypeResponse({ instruction, material = '', responseShape }) {
  const source = String(material || '').trim();
  const sentences = source.split(/[.!?]+/).map(item => item.trim()).filter(Boolean);
  const points = (sentences.length ? sentences : ['Add study material to generate content from your notes.']).slice(0, 8);
  const topicMatch = instruction.match(/Explain ["']([^"']+)["']/i);
  const topic = topicMatch?.[1] || 'this topic';

  if (responseShape.quickSummary) return {
    prototype: true,
    quickSummary: points.slice(0, 3).join('. ') + '.',
    detailedNotes: points,
    keyPoints: points.slice(0, 5),
    definitions: [],
    formulas: [],
    examNotes: ['Review each key point and explain it without looking at your notes.'],
    revision: points.slice(0, 3)
  };
  if (responseShape.questions) return {
    prototype: true,
    questions: points.slice(0, 20).map((point, index) => ({
      question: `What is the main idea in this study point: "${point}"?`,
      options: [`It relates to ${point}`, 'It is unrelated to the material', 'It only applies outside the subject', 'The material does not provide enough context'],
      correctOption: 0,
      expectedAnswer: point,
      explanation: 'Prototype mode uses the supplied study point as the answer. Configure an AI key for richer question generation.',
      topic: `Study point ${index + 1}`
    }))
  };
  if (responseShape.simpleExplanation) return {
    prototype: true,
    simpleExplanation: `${topic} is the concept you asked about. In prototype mode, connect its definition to one example from your notes.`,
    steps: ['Identify the definition.', 'Break the process into smaller steps.', 'Check the result against your study material.'],
    example: `Find one example of ${topic} in your supplied notes.`,
    analogy: `Think of ${topic} as a process with an input, a transformation, and an outcome.`,
    examExplanation: `Define ${topic}, describe its steps, and support the answer with an example.`,
    keyPoints: [`Review the definition and mechanism of ${topic}.`],
    examQuestion: `Explain ${topic} with a suitable example.`,
    followUpAnswer: instruction.includes('follow-up') ? 'Prototype mode can accept your follow-up, but detailed conversational answers require an AI key.' : ''
  };
  return {
    prototype: true,
    overview: 'Prototype plan generated from the subjects and schedule you supplied.',
    days: [{ date: new Date().toISOString().slice(0, 10), tasks: [{ subject: 'Priority subject', topic: 'Review supplied topics', minutes: 60, kind: 'study' }, { subject: 'All subjects', topic: 'Practice recall quiz', minutes: 30, kind: 'quiz' }] }],
    todayTasks: ['Review your weakest topic.', 'Create five recall questions.'],
    upcomingTopics: points.slice(0, 3),
    revision: ['Reserve the final study block for revision.']
  };
}

async function askStudyAI({ instruction, material = '', responseShape }) {
  const apiKey = process.env.STUDY_AI_API_KEY || process.env.OPENAI_API_KEY;
  const hasUsableKey = apiKey && !String(apiKey).startsWith('REPLACE_');
  const prototypeMode = String(process.env.STUDY_AI_PROTOTYPE ?? 'true').toLowerCase() === 'true';

  if (!hasUsableKey) {
    if (prototypeMode) return prototypeResponse({ instruction, material, responseShape });
    throw configurationError();
  }
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
