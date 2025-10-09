import React, { useEffect, useMemo, useState } from "react";

// -------------------- Helpers --------------------
const uid = (prefix = "id") => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

const STORAGE_KEYS = {
  QUIZZES: "iqb_quizzes_v1",
  ATTEMPTS: "iqb_attempts_v1",
};

// Sample quizzes with more questions
const sampleQuizzes = () => [
  {
    id: uid("quiz"),
    title: "General Knowledge - Sample",
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: uid("q"),
        text: "What is the capital of France?",
        options: [
          { id: "o1", text: "Paris" },
          { id: "o2", text: "Berlin" },
          { id: "o3", text: "Madrid" },
          { id: "o4", text: "Rome" },
        ],
        correctOptionId: "o1",
      },
      {
        id: uid("q"),
        text: "Which language runs in a web browser?",
        options: [
          { id: "o1", text: "Python" },
          { id: "o2", text: "JavaScript" },
          { id: "o3", text: "C++" },
          { id: "o4", text: "Java" },
        ],
        correctOptionId: "o2",
      },
      {
        id: uid("q"),
        text: "What planet is known as the Red Planet?",
        options: [
          { id: "o1", text: "Earth" },
          { id: "o2", text: "Mars" },
          { id: "o3", text: "Jupiter" },
          { id: "o4", text: "Venus" },
        ],
        correctOptionId: "o2",
      },
      {
        id: uid("q"),
        text: "Which gas do plants absorb from the atmosphere?",
        options: [
          { id: "o1", text: "Oxygen" },
          { id: "o2", text: "Nitrogen" },
          { id: "o3", text: "Carbon Dioxide" },
          { id: "o4", text: "Hydrogen" },
        ],
        correctOptionId: "o3",
      },
      {
        id: uid("q"),
        text: "Who wrote 'Romeo and Juliet'?",
        options: [
          { id: "o1", text: "William Shakespeare" },
          { id: "o2", text: "Charles Dickens" },
          { id: "o3", text: "Mark Twain" },
          { id: "o4", text: "Jane Austen" },
        ],
        correctOptionId: "o1",
      },
    ],
  },
];

const loadQuizzes = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUIZZES);
    if (!raw) return sampleQuizzes();
    return JSON.parse(raw);
  } catch {
    return sampleQuizzes();
  }
};

const saveQuizzes = (quizzes) => {
  localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
};

const loadAttempts = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const saveAttempts = (attempts) => {
  localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
};

// -------------------- UI Components --------------------
function Small({ children }) {
  return <small className="text-gray-500 dark:text-gray-400">{children}</small>;
}

function Container({ children }) {
  return <div className="max-w-4xl mx-auto p-4">{children}</div>;
}

// -------------------- Quiz Editor --------------------
function QuizEditor({ onSave, initial, onCancel }) {
  const editing = !!initial;
  const [title, setTitle] = useState(initial?.title || "");

  const emptyQuestion = () => ({
    id: uid("q"),
    text: "",
    options: [
      { id: uid("o"), text: "" },
      { id: uid("o"), text: "" },
      { id: uid("o"), text: "" },
      { id: uid("o"), text: "" },
    ],
    correctOptionId: "",
  });

  const [questions, setQuestions] = useState(initial?.questions || [emptyQuestion()]);

  const updateQuestion = (qid, patch) => {
    setQuestions((prev) => prev.map((q) => (q.id === qid ? { ...q, ...patch } : q)));
  };

  const updateOptionText = (qid, oid, text) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qid ? { ...q, options: q.options.map((o) => (o.id === oid ? { ...o, text } : o)) } : q
      )
    );
  };

  const addQuestion = () => setQuestions((p) => [...p, emptyQuestion()]);
  const removeQuestion = (qid) => setQuestions((p) => p.filter((q) => q.id !== qid));

  const validate = () => {
    if (!title.trim()) return "Quiz title is required";
    if (questions.length === 0) return "Please add at least one question";
    for (const q of questions) {
      if (!q.text.trim()) return "Every question needs text";
      if (q.options.length !== 4) return "Each question must have 4 options";
      if (!q.correctOptionId) return "Each question must have a correct answer";
      for (const o of q.options) if (!o.text.trim()) return "Option text cannot be empty";
    }
    return null;
  };

  const handleSave = () => {
    const err = validate();
    if (err) return alert(err);
    const quiz = {
      id: initial?.id || uid("quiz"),
      title: title.trim(),
      questions,
      createdAt: initial?.createdAt || new Date().toISOString(),
    };
    onSave(quiz);
  };

  return (
    <div className="bg-gray-800 dark:bg-gray-800 dark:border-gray-700 border shadow p-4 rounded">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{editing ? "Edit Quiz" : "Create Quiz"}</h3>
        <Small>Local only (localStorage)</Small>
      </div>

      <div className="mb-3">
        <label className="block font-medium">Quiz Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded p-2 mt-1"
          placeholder="e.g. JS Basics Quiz"
        />
      </div>

      {questions.map((q, qi) => (
        <div key={q.id} className="border dark:border-gray-600 rounded p-3 mb-3 bg-gray-800 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="font-medium">Question {qi + 1}</div>
            <button
              className="px-2 py-1 border dark:border-gray-600 rounded text-sm hover:bg-red-100 dark:hover:bg-red-900 active:scale-95 transition-all"
              onClick={() => removeQuestion(q.id)}
            >
              Remove
            </button>
          </div>

          <textarea
            value={q.text}
            onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
            className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded p-2 mt-2"
            placeholder="Type question here"
          />

          <div className="mt-2 grid grid-cols-2 gap-2">
            {q.options.map((o, oi) => (
              <div key={o.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={q.correctOptionId === o.id}
                  onChange={() => updateQuestion(q.id, { correctOptionId: o.id })}
                />
                <input
                  value={o.text}
                  onChange={(e) => updateOptionText(q.id, o.id, e.target.value)}
                  className="flex-1 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded p-2"
                  placeholder={`Option ${oi + 1}`}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex gap-2">
        <button
          className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 active:scale-95 transition-all"
          onClick={addQuestion}
        >
          + Add Question
        </button>
        <button
          className="px-4 py-2 border dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all"
          onClick={handleSave}
        >
          Save Quiz
        </button>
        <button
          className="px-4 py-2 text-red-600 rounded hover:bg-red-100 dark:hover:bg-red-900 active:scale-95 transition-all"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// -------------------- Quiz Player --------------------
function QuizPlayer({ quiz, onFinish }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState({});
  const [startTime] = useState(Date.now());

  const current = quiz.questions[index];
  const total = quiz.questions.length;

  const select = (qid, oid) => setSelected((s) => ({ ...s, [qid]: oid }));
  const next = () => setIndex((i) => Math.min(i + 1, total - 1));
  const prev = () => setIndex((i) => Math.max(i, 0));

  const submit = () => {
    const endTime = Date.now();
    const timeTakenSeconds = Math.floor((endTime - startTime) / 1000);

    const answers = quiz.questions.map((q) => ({
      questionId: q.id,
      selectedOptionId: selected[q.id],
      correctOptionId: q.correctOptionId,
    }));

    const score = answers.reduce(
      (acc, a) => (a.selectedOptionId === a.correctOptionId ? acc + 1 : acc),
      0
    );

    onFinish({
      id: uid("att"),
      quizId: quiz.id,
      takenAt: new Date().toISOString(),
      score,
      total,
      timeTakenSeconds,
      answers,
    });
  };

  return (
    <div className="bg-gray-800 dark:bg-gray-800 border dark:border-gray-700 shadow rounded p-4">
      <h3 className="text-lg font-semibold">{quiz.title}</h3>
      <Small>
        Question {index + 1} / {total}
      </Small>

      {/* Question */}
      <div className="mt-2 text-gray-100 dark:text-gray-100 font-medium">
        {current.text}
      </div>

      {/* Options */}
      <div className="text-gray-100 dark:text-gray-100 grid grid-cols-1 gap-2 my-4">
        {current.options.map((o) => (
          <button
            key={o.id}
            onClick={() => select(current.id, o.id)}
            className={`text-left border dark:border-gray-600 rounded p-3 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all ${
              selected[current.id] === o.id ? "border-blue-600 bg-blue-50 dark:bg-blue-900/40" : ""
            }`}
          >
            {o.text}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between gap-2 mt-4">
        <div className="flex gap-2">
          <button onClick={prev} disabled={index === 0} className="px-3 py-1 border rounded">
            Prev
          </button>
          <button onClick={next} disabled={index === total - 1} className="px-3 py-1 border rounded">
            Next
          </button>
        </div>
        <div>
          <button
            onClick={submit}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 dark:hover:bg-green-600"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------- Quiz Review --------------------
function QuizReview({ attempt, quiz, onClose }) {
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
  };

  return (
    <div className="bg-gray-800 dark:bg-gray-800 border dark:border-gray-700 shadow rounded p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold">Result — {quiz.title}</h3>
          <Small>
            Score: {attempt.score} / {attempt.total} — Time Taken: {formatTime(attempt.timeTakenSeconds)}
          </Small>
        </div>
        <div>
          <button
            className="px-3 py-1 border dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {quiz.questions.map((q, i) => {
          const userAns = attempt.answers.find((a) => a.questionId === q.id);
          const selected = userAns?.selectedOptionId;
          return (
            <div key={q.id} className="border dark:border-gray-600 rounded p-3">
              <div className="font-medium">
                {i + 1}. {q.text}
              </div>
              <div className="mt-2 grid grid-cols-1 gap-2">
                {q.options.map((o) => {
                  const isCorrect = o.id === q.correctOptionId;
                  const isSelected = o.id === selected;
                  return (
                    <div
                      key={o.id}
                      className={`p-2 border dark:border-gray-600 rounded ${
                        isCorrect
                          ? "bg-green-50 dark:bg-green-900/30 border-green-400 dark:border-green-500"
                          : isSelected
                          ? "bg-red-50 dark:bg-red-900/30 border-red-400 dark:border-red-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>{o.text}</div>
                        <div>{isCorrect ? <Small>Correct</Small> : isSelected ? <Small>Your choice</Small> : null}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -------------------- Main App --------------------
export default function App() {
  const [quizzes, setQuizzes] = useState(() => loadQuizzes());
  const [attempts, setAttempts] = useState(() => loadAttempts());

  const [mode, setMode] = useState("list");
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [playingQuiz, setPlayingQuiz] = useState(null);
  const [lastAttempt, setLastAttempt] = useState(null);

  const [dark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    const root = window.document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  useEffect(() => saveQuizzes(quizzes), [quizzes]);
  useEffect(() => saveAttempts(attempts), [attempts]);

  const createNew = () => {
    setEditingQuiz(null);
    setMode("create");
  };

  const handleSaveQuiz = (q) => {
    setQuizzes((prev) => {
      const exists = prev.find((p) => p.id === q.id);
      if (exists) return prev.map((p) => (p.id === q.id ? q : p));
      return [q, ...prev];
    });
    setMode("list");
    setEditingQuiz(null);
  };

  const handleDeleteQuiz = (id) => {
    if (!confirm("Delete quiz? This cannot be undone locally.")) return;
    setQuizzes((p) => p.filter((q) => q.id !== id));
  };

  const handleEditQuiz = (q) => {
    setEditingQuiz(q);
    setMode("edit");
  };

  const handlePlayQuiz = (q) => {
    setPlayingQuiz(q);
    setMode("play");
  };

  const handleFinishAttempt = (attempt) => {
    setAttempts((p) => [attempt, ...p]);
    setLastAttempt(attempt);
    setMode("review");
  };

  const quizzesSorted = useMemo(
    () => [...quizzes].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [quizzes]
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 transition-colors dark">
      <Container>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Interactive Quiz Builder</h2>
        </div>

        {mode === "list" && (
          <>
            <div className="space-y-3">
              <button
                onClick={createNew}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 active:scale-95 transition-all"
              >
                + Create New Quiz
              </button>

              {quizzesSorted.map((q) => (
                <div
                  key={q.id}
                  className="border dark:border-gray-600 rounded p-3 flex items-center justify-between bg-gray-800 dark:bg-gray-800"
                >
                  <div>
                    <div className="font-medium">{q.title}</div>
                    <Small>{new Date(q.createdAt).toLocaleString()}</Small>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePlayQuiz(q)}
                      className="px-3 py-1 bg-green-600 dark:bg-green-500 text-white rounded hover:bg-green-700 dark:hover:bg-green-600 active:scale-95 transition-all"
                    >
                      Play
                    </button>
                    <button
                      onClick={() => handleEditQuiz(q)}
                      className="px-3 py-1 border dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(q.id)}
                      className="px-3 py-1 text-red-600 rounded hover:bg-red-100 dark:hover:bg-red-900 active:scale-95 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Attempt History */}
            {attempts.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Attempt History</h3>
                <div className="space-y-2">
                  {attempts.map((att) => {
                    const quiz = quizzes.find((q) => q.id === att.quizId);
                    if (!quiz) return null;
                    return (
                      <div key={att.id} className="border dark:border-gray-600 rounded p-3 flex justify-between items-center">
                        <div>
                          <div className="font-medium">{quiz.title}</div>
                          <Small>
                            Score: {att.score} / {att.total} — Taken at: {new Date(att.takenAt).toLocaleString()}
                          </Small>
                        </div>
                        <button
                          className="px-3 py-1 border dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all"
                          onClick={() => {
                            setLastAttempt(att);
                            setMode("review");
                          }}
                        >
                          Review
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {(mode === "create" || mode === "edit") && (
          <QuizEditor
            initial={editingQuiz}
            onSave={handleSaveQuiz}
            onCancel={() => setMode("list")}
          />
        )}

        {mode === "play" && playingQuiz && (
          <QuizPlayer
            quiz={playingQuiz}
            onFinish={handleFinishAttempt}
          />
        )}

        {mode === "review" && lastAttempt && (
          <QuizReview
            attempt={lastAttempt}
            quiz={quizzes.find((q) => q.id === lastAttempt.quizId)}
            onClose={() => setMode("list")}
          />
        )}
      </Container>
    </div>
  );
}
