import React, { useMemo, useState } from 'react'
import { BookOpen, Brain, CalendarDays, CheckCircle2, ClipboardList, Lightbulb, RefreshCw, Sparkles } from 'lucide-react'
import { PageContainer } from '../components/ui/PageContainer'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

const MODES = [
  { id: 'summary', label: 'Summarize', icon: ClipboardList, description: 'Turn notes into revision-ready material.' },
  { id: 'quiz', label: 'Practice quiz', icon: Brain, description: 'Create questions from a chapter or topic.' },
  { id: 'explain', label: 'Explain concept', icon: Lightbulb, description: 'Make a difficult idea easier to understand.' },
  { id: 'plan', label: 'Study plan', icon: CalendarDays, description: 'Build a realistic plan around your exam date.' }
]

const splitSentences = (text) => text.split(/[.!?]+/).map(item => item.trim()).filter(Boolean)

function SummaryResult({ material }) {
  const sentences = splitSentences(material)
  const points = sentences.slice(0, 5)
  return (
    <div className="space-y-6">
      <div><p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Short summary</p><p className="leading-7 text-gray-200">{sentences.slice(0, 3).join('. ')}{sentences.length ? '.' : 'Add a few sentences to generate a summary.'}</p></div>
      <div><p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">Key points</p><ul className="space-y-3">{points.map((point, index) => <li key={index} className="flex gap-3 text-gray-300"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-secondary" />{point}</li>)}</ul></div>
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4"><p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Quick revision</p><p className="text-sm leading-6 text-gray-300">Review the key terms in each point, then explain the topic aloud without looking at your notes.</p></div>
    </div>
  )
}

function QuizResult({ topic, difficulty }) {
  const questions = [
    `What is the central idea of ${topic || 'this topic'}?`,
    `Which example best demonstrates ${topic || 'the concept'}?`,
    `How would you apply ${topic || 'this topic'} in an exam answer?`
  ]
  return <div className="space-y-4">{questions.map((question, index) => <div key={question} className="rounded-xl border border-white/10 bg-white/[0.03] p-4"><p className="mb-3 font-medium text-white">{index + 1}. {question}</p><div className="grid gap-2 sm:grid-cols-2">{['It describes the main principle', 'It is unrelated to the topic', 'It is a practical application', 'It only applies in theory'].map(answer => <button key={answer} type="button" className="rounded-lg border border-white/10 px-3 py-2 text-left text-sm text-gray-400 transition hover:border-primary/50 hover:text-white">{answer}</button>)}</div></div>)}<p className="text-xs text-gray-500">Difficulty: {difficulty}. Select an answer to practice, then review the explanation with your notes.</p></div>
}

function ExplainResult({ topic, mode }) {
  return <div className="space-y-5"><div><p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">{mode} explanation</p><p className="text-lg leading-8 text-gray-200">{topic || 'Your concept'} becomes easier when you connect its definition, mechanism, and a concrete example.</p></div><ol className="space-y-4">{['Start with the plain-language idea and identify what problem it solves.', 'Break the process into the smallest sequence of cause and effect.', 'Test your understanding with one example and one counterexample.'].map((step, index) => <li key={step} className="flex gap-4"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">{index + 1}</span><span className="leading-7 text-gray-300">{step}</span></li>)}</ol></div>
}

function PlanResult({ subjects, examDate, hours }) {
  const days = examDate ? Math.max(1, Math.ceil((new Date(examDate) - new Date()) / 86400000)) : 14
  const subjectList = subjects.split(',').map(item => item.trim()).filter(Boolean)
  return <div className="space-y-4"><div className="flex flex-wrap gap-3"><span className="rounded-full bg-primary/15 px-3 py-1 text-sm text-primary">{days} days remaining</span><span className="rounded-full bg-secondary/15 px-3 py-1 text-sm text-secondary">{hours || 2}h per day</span></div><div className="grid gap-3 sm:grid-cols-3">{['Understand', 'Practice', 'Revise'].map((label, index) => <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4"><p className="text-xs font-bold uppercase tracking-widest text-gray-500">Day {index + 1}</p><p className="mt-2 font-semibold text-white">{label}</p><p className="mt-1 text-sm text-gray-400">{subjectList[index % Math.max(subjectList.length, 1)] || 'Priority topic'}</p></div>)}</div><p className="text-sm leading-6 text-gray-400">Repeat this cycle weekly. Reserve the final two days for mixed quizzes and weak topics.</p></div>
}

export default function StudyAssistant() {
  const [mode, setMode] = useState('summary')
  const [material, setMaterial] = useState('')
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState('Medium')
  const [explainMode, setExplainMode] = useState('Simple')
  const [subjects, setSubjects] = useState('')
  const [examDate, setExamDate] = useState('')
  const [hours, setHours] = useState('2')
  const [submitted, setSubmitted] = useState(false)

  const current = useMemo(() => MODES.find(item => item.id === mode), [mode])
  const submitLabel = mode === 'summary' ? 'Create revision notes' : mode === 'quiz' ? 'Generate practice quiz' : mode === 'explain' ? 'Explain this concept' : 'Build my study plan'

  const handleSubmit = (event) => { event.preventDefault(); setSubmitted(true) }
  const handleMode = (nextMode) => { setMode(nextMode); setSubmitted(false) }

  return (
    <PageContainer>
      <div className="mb-8 max-w-3xl"><div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary"><Sparkles size={16} /> DISCOVER · UNDERSTAND · PRACTICE · PLAN</div><h1 className="text-4xl font-bold text-white sm:text-5xl">AI Study Assistant</h1><p className="mt-3 text-lg leading-7 text-gray-400">One focused workspace for turning study material into understanding, practice, and a plan you can follow.</p></div>
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <nav className="space-y-2" aria-label="Study assistant modes">{MODES.map(item => { const Icon = item.icon; return <button key={item.id} type="button" onClick={() => handleMode(item.id)} className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${mode === item.id ? 'border-primary/50 bg-primary/10' : 'border-white/10 bg-white/[0.02] hover:border-white/20'}`}><Icon size={20} className={mode === item.id ? 'text-primary' : 'text-gray-500'} /><span><span className="block font-semibold text-white">{item.label}</span><span className="mt-1 block text-xs leading-5 text-gray-500">{item.description}</span></span></button> })}</nav>
        <div className="space-y-6"><Card><div className="mb-6 flex items-center gap-3"><BookOpen className="text-primary" size={24} /><div><h2 className="text-xl font-bold text-white">{current.label}</h2><p className="text-sm text-gray-500">{current.description}</p></div></div>
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'summary' && <label className="block"><span className="mb-2 block text-sm font-medium text-gray-300">Paste notes or study material</span><textarea required value={material} onChange={event => setMaterial(event.target.value)} rows={8} placeholder="Paste a chapter, lecture notes, or your own study material..." className="w-full resize-y rounded-xl border border-white/10 bg-surface/50 p-4 text-sm leading-6 text-white placeholder-gray-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" /></label>}
            {mode === 'quiz' && <><label className="block"><span className="mb-2 block text-sm font-medium text-gray-300">Subject, chapter, or topic</span><input required value={topic} onChange={event => setTopic(event.target.value)} placeholder="e.g. Operating systems: process scheduling" className="w-full rounded-xl border border-white/10 bg-surface/50 p-3 text-white placeholder-gray-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" /></label><label className="block"><span className="mb-2 block text-sm font-medium text-gray-300">Difficulty</span><select value={difficulty} onChange={event => setDifficulty(event.target.value)} className="w-full rounded-xl border border-white/10 bg-surface/50 p-3 text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"><option>Easy</option><option>Medium</option><option>Hard</option></select></label><label className="block"><span className="mb-2 block text-sm font-medium text-gray-300">Optional study material</span><textarea value={material} onChange={event => setMaterial(event.target.value)} rows={4} placeholder="Add notes to make the questions more relevant..." className="w-full resize-y rounded-xl border border-white/10 bg-surface/50 p-4 text-sm text-white placeholder-gray-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" /></label></>}
            {mode === 'explain' && <><label className="block"><span className="mb-2 block text-sm font-medium text-gray-300">What feels difficult?</span><input required value={topic} onChange={event => setTopic(event.target.value)} placeholder="e.g. recursion, photosynthesis, normalization" className="w-full rounded-xl border border-white/10 bg-surface/50 p-3 text-white placeholder-gray-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" /></label><label className="block"><span className="mb-2 block text-sm font-medium text-gray-300">Explanation style</span><select value={explainMode} onChange={event => setExplainMode(event.target.value)} className="w-full rounded-xl border border-white/10 bg-surface/50 p-3 text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"><option>Simple</option><option>Step-by-step</option><option>Example-based</option><option>Analogy</option><option>Exam-oriented</option></select></label></>}
            {mode === 'plan' && <><label className="block"><span className="mb-2 block text-sm font-medium text-gray-300">Subjects or topics</span><input required value={subjects} onChange={event => setSubjects(event.target.value)} placeholder="Separate subjects with commas" className="w-full rounded-xl border border-white/10 bg-surface/50 p-3 text-white placeholder-gray-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-sm font-medium text-gray-300">Exam date</span><input required type="date" value={examDate} onChange={event => setExamDate(event.target.value)} className="w-full rounded-xl border border-white/10 bg-surface/50 p-3 text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" /></label><label className="block"><span className="mb-2 block text-sm font-medium text-gray-300">Study hours per day</span><input required min="1" max="16" type="number" value={hours} onChange={event => setHours(event.target.value)} className="w-full rounded-xl border border-white/10 bg-surface/50 p-3 text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" /></label></div></>}
            <Button type="submit" className="gap-2"><Sparkles size={16} />{submitLabel}</Button>
          </form>
        </Card>
        {submitted && <Card className="border-secondary/30"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-bold text-white">Your study output</h2><p className="text-sm text-gray-500">Generated from the details you provided.</p></div><button type="button" onClick={() => setSubmitted(false)} className="text-gray-500 transition hover:text-white" title="Reset output"><RefreshCw size={18} /></button></div>{mode === 'summary' && <SummaryResult material={material} />}{mode === 'quiz' && <QuizResult topic={topic} difficulty={difficulty} />}{mode === 'explain' && <ExplainResult topic={topic} mode={explainMode} />}{mode === 'plan' && <PlanResult subjects={subjects} examDate={examDate} hours={hours} />}</Card>}
      </div></div>
    </PageContainer>
  )
}
