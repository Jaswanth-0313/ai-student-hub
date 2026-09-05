const { extractStudyMaterial } = require('../services/studyDocumentService');
const { askStudyAI } = require('../services/studyAIService');

function badRequest(message) { return { status: 400, message }; }

async function extract(req, res) {
  try {
    const result = await extractStudyMaterial(req.body || {});
    return res.json(result);
  } catch (error) {
    const status = /configured|AI/i.test(error.message) ? 422 : 400;
    return res.status(status).json({ message: error.message });
  }
}

async function summarize(req, res) {
  try {
    const { text } = await extractStudyMaterial(req.body || {});
    const result = await askStudyAI({
      material: text,
      instruction: 'Create faithful exam revision notes from this material. Include a quick summary, detailed notes organized by topic or slide context, key points, important definitions, important formulas only when present, exam-focused notes, and last-minute revision points.',
      responseShape: { quickSummary: 'string', detailedNotes: ['string'], keyPoints: ['string'], definitions: [{ term: 'string', meaning: 'string' }], formulas: ['string'], examNotes: ['string'], revision: ['string'] }
    });
    return res.json({ ...result, sourceTextLength: text.length });
  } catch (error) { return res.status(/configured|AI request|AI returned/i.test(error.message) ? 502 : 400).json({ message: error.message }); }
}

async function questions(req, res) {
  try {
    const { text } = await extractStudyMaterial(req.body || {});
    const { questionType = 'Mixed Quiz', difficulty = 'Medium', count = 5 } = req.body || {};
    const safeCount = Math.min(Math.max(Number(count) || 5, 1), 20);
    const result = await askStudyAI({
      material: text,
      instruction: `Generate exactly ${safeCount} ${questionType} questions at ${difficulty} difficulty. For each question include four options for MCQ or an empty options array otherwise, the zero-based correctOption for MCQ, an expectedAnswer for non-MCQ, a clear explanation, and a topic.`,
      responseShape: { questions: [{ question: 'string', options: ['string'], correctOption: 0, expectedAnswer: 'string', explanation: 'string', topic: 'string' }] }
    });
    return res.json({ questions: result.questions || [], sourceTextLength: text.length });
  } catch (error) { return res.status(/configured|AI request|AI returned/i.test(error.message) ? 502 : 400).json({ message: error.message }); }
}

async function explain(req, res) {
  try {
    const { topic, mode = 'Simple Explanation', followUp = '', material = '' } = req.body || {};
    if (!topic || !String(topic).trim()) return res.status(400).json({ message: 'A concept is required.' });
    const result = await askStudyAI({
      material: material || 'No uploaded material. Explain the concept accurately from general knowledge.',
      instruction: `Explain "${topic}" using ${mode}. ${followUp ? `Answer this follow-up question: ${followUp}` : ''} Include a beginner explanation, step-by-step explanation, real-world example, analogy, exam-oriented explanation, key points, and one possible exam question.`,
      responseShape: { simpleExplanation: 'string', steps: ['string'], example: 'string', analogy: 'string', examExplanation: 'string', keyPoints: ['string'], examQuestion: 'string', followUpAnswer: 'string' }
    });
    return res.json(result);
  } catch (error) { return res.status(/configured|AI request|AI returned/i.test(error.message) ? 502 : 400).json({ message: error.message }); }
}

async function plan(req, res) {
  try {
    const { subjects, topics, examDate, hoursPerDay, studyDays, preparationLevel, strongSubjects, weakSubjects, prioritySubjects, preferredTime } = req.body || {};
    if (!subjects || !examDate || !hoursPerDay) return res.status(400).json({ message: 'Subjects, exam date, and available hours are required.' });
    const result = await askStudyAI({
      instruction: `Create a realistic personalized study plan. Inputs: subjects=${subjects}; topics=${topics || 'not specified'}; exam date=${examDate}; hours/day=${hoursPerDay}; study days=${studyDays || 'until exam'}; preparation level=${preparationLevel || 'unknown'}; strong subjects=${strongSubjects || 'none'}; weak subjects=${weakSubjects || 'none'}; priority subjects=${prioritySubjects || 'none'}; preferred time=${preferredTime || 'flexible'}. Allocate weak and priority areas more time, include revision, practice quizzes, and rest.`,
      responseShape: { overview: 'string', days: [{ date: 'YYYY-MM-DD', tasks: [{ subject: 'string', topic: 'string', minutes: 60, kind: 'study|revision|quiz' }] }], todayTasks: ['string'], upcomingTopics: ['string'], revision: ['string'] }
    });
    return res.json(result);
  } catch (error) { return res.status(/configured|AI request|AI returned/i.test(error.message) ? 502 : 400).json({ message: error.message }); }
}

function evaluateQuiz(req, res) {
  const { questions = [], answers = [] } = req.body || {};
  if (!Array.isArray(questions) || !Array.isArray(answers)) return res.status(400).json({ message: 'Questions and answers are required.' });
  const results = questions.map((question, index) => {
    const answer = answers[index];
    const correct = question.correctOption !== undefined ? Number(answer) === Number(question.correctOption) : String(answer || '').trim().toLowerCase() === String(question.expectedAnswer || '').trim().toLowerCase();
    return { question: question.question, correct, selectedAnswer: answer, correctAnswer: question.correctOption !== undefined ? question.options?.[question.correctOption] : question.expectedAnswer, explanation: question.explanation, topic: question.topic };
  });
  return res.json({ score: results.filter(item => item.correct).length, total: results.length, results, weakTopics: [...new Set(results.filter(item => !item.correct).map(item => item.topic).filter(Boolean))] });
}

module.exports = { extract, summarize, questions, explain, plan, evaluateQuiz };
