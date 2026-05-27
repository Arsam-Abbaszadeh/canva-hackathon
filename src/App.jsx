import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  Check,
  CircleUserRound,
  Compass,
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  MessageCircle,
  Rocket,
  Send,
  Sparkles,
  Trophy,
  UsersRound,
} from 'lucide-react'
import './App.css'

const flow = [
  {
    id: 'study',
    question:
      "Hey, welcome to Forge. Let's explore how an education at Monash could help you build the future you want.\n\nWhat are you hoping to study, and why? If you're not sure yet, tell me your interests instead.",
    answer:
      "I want to become a doctor, but I'm also interested in business and entrepreneurship.",
    choices: [
      "I want to become a doctor, but I'm also interested in business and entrepreneurship.",
      'I like health, science, and building something meaningful.',
      'I am not sure yet, but I care about impact and leadership.',
    ],
    profile: {
      Career: ['Medicine'],
      Exploration: ['Business', 'Entrepreneurship'],
      Signals: ['Ambitious', 'Exploratory'],
    },
    response:
      'Interesting combination. Medicine and business often suggests someone who enjoys impact, leadership, or building things.\n\nWhat attracts you to those areas? Is it helping people, leadership, innovation, financial goals, running something one day, or something else?',
  },
  {
    id: 'motivation',
    answer:
      'I like helping people, but I also think building a company one day sounds exciting.',
    choices: [
      'I like helping people, but I also think building a company one day sounds exciting.',
      'I want work that feels useful and still gives me room to create.',
      'Helping people matters most, but I am drawn to innovation too.',
    ],
    profile: {
      Values: ['Impact', 'Innovation', 'Ambition'],
      Motivation: ['Helping people', 'Building something'],
    },
    response:
      "Based on that, Monash could support both sides of your goals.\n\nFor medicine, you could explore pathways through biomedical and health-related studies while building strong academic foundations.\n\nFor entrepreneurship, Monash also offers startup communities, competitions, and innovation experiences so you don't have to leave that interest behind.\n\nYou may not need to choose between doctor and builder immediately.",
    nextQuestion:
      'Outside academics, what kind of university experience do you imagine?\n\nFor example: leadership, sport, making close friends, internships, travel, clubs, research, or startups.',
  },
  {
    id: 'lifestyle',
    answer: 'Definitely friends, leadership and staying involved in sport.',
    choices: [
      'Definitely friends, leadership and staying involved in sport.',
      'I want a balance of friends, clubs, sport, and serious study.',
      'Leadership, close friends, and opportunities beyond class.',
    ],
    profile: {
      'Social goals': ['Belonging', 'Leadership', 'Sport'],
      Identity: ['Balanced achiever'],
    },
    response:
      'Great. Your ideal Monash experience looks broader than academics.\n\nAlongside study, you might benefit from joining student communities early, maintaining sport and wellbeing routines, taking leadership opportunities over time, and exploring entrepreneurial groups.\n\nYour pathway currently looks like: Medicine + Entrepreneurship + Leadership + Social connection.',
    nextQuestion:
      'What worries you most about university right now?\n\nA lot of students mention losing work-life balance, not making friends, choosing the wrong path, missing opportunities, or pressure.',
  },
  {
    id: 'fear',
    answer:
      "I'm worried medicine could become my entire identity and I won't get to explore anything else.",
    choices: [
      "I'm worried medicine could become my entire identity and I won't get to explore anything else.",
      'I am worried about choosing one path too early.',
      'I want to work hard without losing my other interests.',
    ],
    profile: {
      Fears: ['One-dimensional pathway', 'Missing exploration'],
      Needs: ['Flexibility', 'Balance'],
    },
    response:
      "That's a useful insight.\n\nOne opportunity at Monash is intentionally designing experiences outside your degree:\n\nAcademic pathway -> medicine\nExploration pathway -> business/startups\nPersonal pathway -> sport + friendships + leadership\n\nYour university experience does not have to be one-dimensional.",
    nextQuestion:
      'If you arrived at Monash tomorrow, which experience sounds most exciting?\n\nA) Meeting ambitious students\nB) Startup events and innovation\nC) Leadership programs\nD) Research and medicine experiences\nE) Sport and community',
  },
  {
    id: 'monash',
    answer: 'Probably B and A.',
    choices: [
      'Probably B and A.',
      'A, B, and C feel most exciting.',
      'Startup events first, then meeting ambitious students.',
    ],
    profile: {
      'Monash interests': ['Startup events', 'Ambitious students'],
      'Suggested rhythm': ['Friends first', 'Projects next', 'Decide later'],
    },
    response:
      'Then part of your Monash journey could include:\n\nYear 1: Build friendships and explore entrepreneurship communities.\n\nYear 2: Try leadership, projects, and competitions.\n\nLater: Decide whether business remains an interest or becomes something bigger.',
    nextQuestion:
      'Imagine graduation day.\n\nWhat would make you think: "I used my Monash experience well."',
  },
  {
    id: 'aspiration',
    answer:
      'I became a doctor, made great friends, stayed active and explored entrepreneurship.',
    choices: [
      'I became a doctor, made great friends, stayed active and explored entrepreneurship.',
      'I built a health career and still tested business ideas.',
      'I grew into someone confident, connected, and ready for medicine.',
    ],
    profile: {
      Aspirations: ['Doctor', 'Great friends', 'Active lifestyle', 'Entrepreneurship'],
      Outcome: ['Confident direction'],
    },
    response:
      "That gives us a clear picture. I can now summarise the student's goals, the profile we built, and a longer Monash journey recommendation.",
  },
]

const starterMessages = [
  {
    id: 'bot-study',
    author: 'bot',
    kind: 'question',
    text: flow[0].question,
  },
]

const summaryRows = [
  {
    icon: GraduationCap,
    label: 'Career',
    value: 'Medicine',
  },
  {
    icon: BriefcaseBusiness,
    label: 'Exploration',
    value: 'Business / Entrepreneurship',
  },
  {
    icon: HeartHandshake,
    label: 'Values',
    value: 'Impact, ambition, community',
  },
  {
    icon: Trophy,
    label: 'Experience',
    value: 'Leadership, friends, sport, exploration',
  },
]

const journeyCards = [
  {
    icon: BookOpen,
    title: 'Academic path',
    text: 'Use biomedical, health, and medicine-related pathways to build strong foundations.',
  },
  {
    icon: Rocket,
    title: 'Growth path',
    text: 'Keep entrepreneurship alive through startup communities, competitions, and projects.',
  },
  {
    icon: UsersRound,
    title: 'Community path',
    text: 'Join clubs, sport, and leadership opportunities so university feels connected and balanced.',
  },
]

function mergeProfile(profile, update) {
  return Object.entries(update).reduce(
    (next, [group, values]) => ({
      ...next,
      [group]: Array.from(new Set([...(next[group] || []), ...values])),
    }),
    profile,
  )
}

function App() {
  const [messages, setMessages] = useState(starterMessages)
  const [stepIndex, setStepIndex] = useState(0)
  const [profile, setProfile] = useState({})
  const [answerDraft, setAnswerDraft] = useState(flow[0].answer)
  const [typing, setTyping] = useState(false)
  const [isFinal, setIsFinal] = useState(false)
  const scrollRef = useRef(null)

  const activeStep = flow[stepIndex]
  const progress = Math.min((stepIndex / flow.length) * 100, 100)

  const nextFocus = useMemo(() => {
    if (isFinal) return 'Final recommendation ready'
    if (!activeStep) return 'Summary ready'
    const labels = ['Career', 'Motivation', 'Lifestyle', 'Fears', 'Monash fit', 'Aspirations']
    return labels[stepIndex] || 'Profile'
  }, [activeStep, isFinal, stepIndex])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, typing, isFinal])

  const sendAnswer = (event) => {
    event.preventDefault()
    if (!activeStep || typing || isFinal) return

    const current = activeStep
    const currentIndex = stepIndex
    const answer = answerDraft.trim() || current.answer

    setMessages((existing) => [
      ...existing,
      {
        id: `student-${current.id}`,
        author: 'student',
        text: answer,
      },
    ])
    setProfile((existing) => mergeProfile(existing, current.profile))
    setTyping(true)

    window.setTimeout(() => {
      setMessages((existing) => {
        const reply = [
          ...existing,
          {
            id: `bot-${current.id}-advice`,
            author: 'bot',
            kind: current.nextQuestion ? 'advice' : 'wrap',
            text: current.response,
          },
        ]

        if (current.nextQuestion) {
          reply.push({
            id: `bot-${flow[currentIndex + 1]?.id || 'next'}-question`,
            author: 'bot',
            kind: 'question',
            text: current.nextQuestion,
          })
        }

        return reply
      })
      setStepIndex((index) => index + 1)
      setAnswerDraft(flow[currentIndex + 1]?.answer || '')
      setTyping(false)
    }, 650)
  }

  const finalize = () => {
    setIsFinal(true)
    setMessages((existing) => [
      ...existing,
      {
        id: 'bot-final',
        author: 'bot',
        kind: 'final',
        text: 'Summary generated. The recommendation is ready to share.',
      },
    ])
  }

  const resetDemo = () => {
    setMessages(starterMessages)
    setStepIndex(0)
    setProfile({})
    setAnswerDraft(flow[0].answer)
    setTyping(false)
    setIsFinal(false)
  }

  return (
    <main className="app-shell">
      <section className="left-rail" aria-label="Forge overview">
        <div className="brand-block">
          <div className="brand-mark" aria-hidden="true">
            <Compass size={30} />
          </div>
          <div>
            <p className="eyebrow">Student pathway guide</p>
            <h1>Forge</h1>
          </div>
        </div>

        <div className="compass-visual" aria-hidden="true">
          <div className="orbit orbit-one"></div>
          <div className="orbit orbit-two"></div>
          <div className="needle"></div>
          <div className="visual-core">
            <GraduationCap size={34} />
          </div>
          <span className="pin pin-a">Med</span>
          <span className="pin pin-b">Startups</span>
          <span className="pin pin-c">Sport</span>
        </div>

        <div className="progress-card">
          <div className="progress-head">
            <span>Profile depth</span>
            <strong>{Math.round(progress)}%</strong>
          </div>
          <div className="meter" aria-hidden="true">
            <span style={{ width: `${progress}%` }}></span>
          </div>
          <p>{nextFocus}</p>
        </div>

        <div className="pathway-mini">
          <span>
            <BookOpen size={16} /> Academic path
          </span>
          <span>
            <Rocket size={16} /> Growth path
          </span>
          <span>
            <Activity size={16} /> Community path
          </span>
        </div>
      </section>

      <section className="chat-panel" aria-label="Guided chatbot conversation">
        <header className="chat-header">
          <div>
            <p className="eyebrow">Guided conversation</p>
            <h2>Advice that builds as the student talks</h2>
          </div>
          <button className="ghost-button" type="button" onClick={resetDemo}>
            Reset chat
          </button>
        </header>

        <div className="chat-window">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {typing && (
            <div className="message-row bot-row" aria-live="polite">
              <div className="avatar bot-avatar">
                <Sparkles size={17} />
              </div>
              <div className="typing-bubble">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          {isFinal && <FinalSummary />}
          <div ref={scrollRef}></div>
        </div>

        {!isFinal && activeStep && (
          <form className="composer" onSubmit={sendAnswer}>
            <label className="answer-label" htmlFor="answer-draft">
              Your answer
            </label>
            <div className="chat-input">
              <textarea
                id="answer-draft"
                value={answerDraft}
                onChange={(event) => setAnswerDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    event.currentTarget.form?.requestSubmit()
                  }
                }}
                placeholder="Type your answer..."
                disabled={typing}
                rows={2}
              />
              <button type="submit" aria-label="Send answer" disabled={typing}>
                <Send size={17} />
              </button>
            </div>
          </form>
        )}

        {!isFinal && stepIndex >= flow.length && (
          <div className="composer final-composer">
            <button className="finalise-button" type="button" onClick={finalize}>
              Summarise and finalise
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </section>

      <aside className="profile-panel" aria-label="Student profile">
        <div className="panel-header">
          <div className="profile-icon">
            <CircleUserRound size={22} />
          </div>
          <div>
            <p className="eyebrow">Live student profile</p>
            <h2>Signals captured</h2>
          </div>
        </div>

        <ProfilePanel profile={profile} />

        <div className="monash-fit">
          <div className="fit-score">
            <span>Monash fit</span>
            <strong>{isFinal ? 'Strong' : stepIndex > 2 ? 'Emerging' : 'Building'}</strong>
          </div>
          <p>
            The conversation steers from career goals to motivations, lifestyle, identity, fears,
            and aspirations before generating a final recommendation.
          </p>
        </div>
      </aside>
    </main>
  )
}

function ChatMessage({ message }) {
  const isBot = message.author === 'bot'

  return (
    <article className={`message-row ${isBot ? 'bot-row' : 'student-row'}`}>
      {isBot && (
        <div className="avatar bot-avatar" aria-hidden="true">
          {message.kind === 'advice' ? <Lightbulb size={17} /> : <MessageCircle size={17} />}
        </div>
      )}
      <div className={`message-bubble ${isBot ? 'bot-bubble' : 'student-bubble'} ${message.kind || ''}`}>
        {message.text.split('\n').map((line, index) =>
          line ? <p key={`${message.id}-${index}`}>{line}</p> : <span className="line-break" key={`${message.id}-${index}`} />,
        )}
      </div>
      {!isBot && (
        <div className="avatar student-avatar" aria-hidden="true">
          <CircleUserRound size={17} />
        </div>
      )}
    </article>
  )
}

function ProfilePanel({ profile }) {
  const entries = Object.entries(profile)

  if (entries.length === 0) {
    return (
      <div className="empty-profile">
        <Brain size={30} />
        <p>Profile signals will appear here as the student answers.</p>
      </div>
    )
  }

  return (
    <div className="profile-stack">
      {entries.map(([group, values]) => (
        <section className="signal-group" key={group}>
          <h3>{group}</h3>
          <div className="chip-list">
            {values.map((value) => (
              <span className="chip" key={value}>
                <Check size={13} />
                {value}
              </span>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function FinalSummary() {
  return (
    <section className="final-summary" aria-label="Final student profile summary">
      <div className="summary-kicker">
        <BadgeCheck size={18} />
        Final profile summary
      </div>
      <h2>A Monash journey for a future doctor, builder, and balanced achiever</h2>
      <p>
        This student wants a pathway into medicine without giving up curiosity about business,
        entrepreneurship, leadership, sport, and friendships. The strongest advice is to treat
        university as three connected paths rather than one narrow track.
      </p>

      <div className="summary-grid">
        {summaryRows.map(({ icon: Icon, label, value }) => (
          <div className="summary-row" key={label}>
            <Icon size={20} />
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <div className="journey-grid">
        {journeyCards.map(({ icon: Icon, title, text }) => (
          <article className="journey-card" key={title}>
            <Icon size={24} />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>

      <div className="long-answer">
        <h3>Recommended conclusion</h3>
        <p>
          Your goals suggest that Monash could help you build a future in medicine while still
          exploring the parts of you that are entrepreneurial, social, active, and leadership
          focused. In your first year, the priority would be building strong academic habits and
          making friends early. From there, you could add startup events, clubs, sport, and
          leadership experiences so that medicine becomes your career direction, not your entire
          identity. By graduation, success would mean being closer to becoming a doctor while
          also having tested business ideas, stayed active, and built a community around you.
        </p>
      </div>
    </section>
  )
}

export default App
