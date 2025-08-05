import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import GlassButton from "./HelperComponent/GlassButton.jsx";

// Core colors for yes/no, etc.
const YES_COLOR = "#34d399";
const NO_COLOR = "#fb7185";
const BASE_COLORS = {
  low: "#22d3ee",
  medium: "#fbbf24",
  critical: "#ef4444",
};

const baseScoreMap = {
  low: 2,
  medium: 3,
  critical: 5,
};

const questions = [
  {
    label: "How important was the lesson?",
    type: "importance",
    options: [
      { label: "Low", value: "low", color: BASE_COLORS.low },
      { label: "Medium", value: "medium", color: BASE_COLORS.medium },
      { label: "Critical", value: "critical", color: BASE_COLORS.critical },
    ],
  },
  {
    label: "Is it an older lesson you are revising?",
    type: "older",
    yesText: "Yes",
    noText: "No",
    multiplier: 2,
  },
  {
    label: "Did you make a video explaining the concept?",
    type: "video",
    yesText: "Yes",
    noText: "No",
    multiplier: 3,
  },
  {
    label: "Did you create any diagrams or charts?",
    type: "diagrams",
    yesText: "Yes",
    noText: "No",
    multiplier: 3,
  },
  {
    label: "Any practical implementation?",
    type: "practical",
    yesText: "Yes",
    noText: "No",
    multiplier: 5,
  },
  {
    label: "How many times did you watch the video?",
    type: "watched",
    options: Array.from({ length: 10 }, (_, i) => i + 1),
  },
];

// Helper: Find current level based on total XP (like in Dashboard)
function getLevelFromXP(xpTable, startingLevel, currentXP) {
  let totalXP = (xpTable[startingLevel - 1] || 0) + (currentXP || 0);
  let currentLevel = startingLevel;
  const maxLevel = xpTable.length;
  while (currentLevel < maxLevel && totalXP >= xpTable[currentLevel]) {
    currentLevel++;
  }
  return currentLevel;
}

function AddPoints() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);

  // Form state for each answer
  const [form, setForm] = useState({
    importance: "",
    older: "",
    video: "",
    diagrams: "",
    practical: "",
    watched: 1,
  });

  // Score calculation
  const [calculated, setCalculated] = useState(0);

  // On mount, get course data
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("courses") || "[]");
    const found = stored.find((c) => c.id === Number(courseId));
    if (found) setCourse(found);
    else navigate("/");
  }, [courseId, navigate]);

  // Calculate score
  useEffect(() => {
    let total = 0;
    const baseScore = baseScoreMap[form.importance] || 0;

    if (baseScore === 0) {
      setCalculated(0);
      return;
    }

    // Each question (except last) adds (baseScore * multiplier) if yes
    if (form.older === "yes") total += baseScore * 2;
    if (form.video === "yes") total += baseScore * 3;
    if (form.diagrams === "yes") total += baseScore * 3;
    if (form.practical === "yes") total += baseScore * 5;

    // Always add base score and watched video count
    total += baseScore + (parseInt(form.watched, 10) || 0);

    setCalculated(total);
  }, [form]);

  // Save points on submit
  function handleSubmit(e) {
    e.preventDefault();
    if (!course) return;

    const prevXP = course.currentXP || 0;
    const prevLevel = getLevelFromXP(
      course.xpTable,
      course.startingLevel,
      prevXP
    );

    // Add points to course.currentXP
    const newXP = prevXP + calculated;
    const updated = {
      ...course,
      currentXP: newXP,
    };

    // Calculate new level after XP
    const newLevel = getLevelFromXP(
      course.xpTable,
      course.startingLevel,
      newXP
    );

    // Replace in local storage
    const stored = JSON.parse(localStorage.getItem("courses") || "[]");
    const newList = stored.map((c) => (c.id === updated.id ? updated : c));
    localStorage.setItem("courses", JSON.stringify(newList));

    // Save summary to sessionStorage for Dashboard congratulation modal
    sessionStorage.setItem(
      "courseUpdate",
      JSON.stringify({
        courseName: course.courseName,
        prevXP,
        newXP,
        gainedXP: calculated,
        prevLevel,
        newLevel,
      })
    );

    // Navigate back to dashboard
    navigate("/");
  }

  // Render radio or dropdowns based on question
  function renderQuestion(q) {
    if (q.type === "importance") {
      return (
        <div className="flex gap-8 mt-2 mb-2">
          {q.options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 cursor-pointer"
              style={{ fontWeight: 500, fontSize: "1.13rem", color: opt.color }}
            >
              <input
                type="radio"
                name={q.type}
                value={opt.value}
                checked={form.importance === opt.value}
                onChange={(e) =>
                  setForm((f) => ({ ...f, importance: e.target.value }))
                }
                className="accent-slate-400 w-5 h-5"
              />
              {opt.label}
            </label>
          ))}
        </div>
      );
    }
    if (["older", "video", "diagrams", "practical"].includes(q.type)) {
      return (
        <div className="flex gap-7 mt-2 mb-2 items-center">
          <label
            className="flex items-center gap-2 cursor-pointer"
            style={{ color: YES_COLOR, fontWeight: 500 }}
          >
            <input
              type="radio"
              name={q.type}
              value="yes"
              checked={form[q.type] === "yes"}
              onChange={() => setForm((f) => ({ ...f, [q.type]: "yes" }))}
              className="accent-green-400 w-5 h-5"
            />
            Yes
          </label>
          <label
            className="flex items-center gap-2 cursor-pointer"
            style={{ color: NO_COLOR, fontWeight: 500 }}
          >
            <input
              type="radio"
              name={q.type}
              value="no"
              checked={form[q.type] === "no"}
              onChange={() => setForm((f) => ({ ...f, [q.type]: "no" }))}
              className="accent-rose-400 w-5 h-5"
            />
            No
          </label>
        </div>
      );
    }
    if (q.type === "watched") {
      return (
        <div className="flex gap-5 mt-3 mb-2 items-center">
          <select
            value={form.watched}
            onChange={(e) =>
              setForm((f) => ({ ...f, watched: e.target.value }))
            }
            className="px-4 py-2 rounded-lg bg-white/20 text-slate-900 font-bold focus:outline-none"
          >
            {q.options.map((num) => (
              <option value={num} key={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
      );
    }
    return null;
  }

  if (!course) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#151a25] via-[#222b3a] to-[#314055] px-4 py-10">
      {/* Back Button */}
      <GlassButton
        color="sky"
        onClick={() => navigate("/")}
        className="
        absolute
        -top-100
        right-130
        z-50
        text-[1.13rem]
        px-6
        py-2
        font-semibold
        min-w-[92px]
        tracking-wide
        shadow-lg
        transition
        focus:outline-none"
        type="button"
      >
        ← Back
      </GlassButton>

      <form
        className="bg-white/10 rounded-2xl px-8 py-10 max-w-2xl w-full shadow-xl border border-white/20 backdrop-blur-sm relative"
        onSubmit={handleSubmit}
        style={{
          boxShadow: "0 6px 32px rgba(0,0,0,0.13)",
          color: "#fff",
        }}
      >
        <h2
          className="text-2xl sm:text-3xl font-extrabold text-center text-sky-300 mb-10"
          style={{ letterSpacing: ".01em" }}
        >
          Add points to{" "}
          <span style={{ color: "#fff", fontWeight: 700 }}>
            {course.courseName}
          </span>
        </h2>

        {questions.map((q, idx) => (
          <div key={q.type} className="mb-8">
            <div
              className="text-xl sm:text-2xl font-bold mb-1"
              style={{
                color: "#fff",
                width: "fit-content",
                fontWeight: 700,
                letterSpacing: "0.01em",
              }}
            >
              {q.label}
            </div>
            {renderQuestion(q)}
          </div>
        ))}

        <div className="flex flex-col items-center gap-2 mt-2">
          <div
            className="text-md text-sky-300 font-bold mb-3"
            style={{ fontFamily: "monospace" }}
          >
            Total XP to add: <span className="text-white">{calculated}</span>
          </div>
          <GlassButton
            type="submit"
            color="sky"
            className="px-8 py-2 rounded-xl font-bold shadow-lg text-lg"
            style={{ minWidth: 110, fontSize: "1.2rem" }}
          >
            Done
          </GlassButton>
        </div>
      </form>
    </div>
  );
}

export default AddPoints;
