import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassButton from "./helperComponent/GlassButton.jsx";
import { ArrowLeft } from "lucide-react";

// Color and Difficulty Configurations
const COLORS = [
  { name: "Rose", value: "rose-400", color: "#EE6352" },
  { name: "Emerald", value: "emerald-400", color: "#59CD90" },
  { name: "Amber", value: "amber-400", color: "#E6C229" },
  { name: "Blue", value: "blue-400", color: "#9381FF" },
  { name: "Orange", value: "orange-400", color: "#28C2FF" },
  { name: "Cyan", value: "cyan-400", color: "#C45AB3" },
];
const DIFFICULTY = [
  { name: "Easy", value: "easy", xp: 20000 },
  { name: "Medium", value: "medium", xp: 50000 },
  { name: "Hard", value: "hard", xp: 100000 },
];

// Pokémon-style XP curve
function distributeXP(totalXP, levels = 100) {
  const arr = [];
  const a = 0.12,
    b = 1,
    c = 8;
  let baseSum = 0;
  for (let i = 1; i <= levels; ++i) {
    const xp = Math.round(a * i * i + b * i + c);
    arr.push(xp);
    baseSum += xp;
  }
  const scale = totalXP / baseSum;
  // XP thresholds: [0, ... cumulative sums ...]
  let runningSum = 0;
  const xpTable = [0];
  for (let i = 0; i < arr.length; ++i) {
    runningSum += Math.round(arr[i] * scale);
    xpTable.push(runningSum);
  }
  return xpTable;
}

function AddCourse() {
  const navigate = useNavigate();
  const [courseName, setCourseName] = useState("");
  const [startingLevel, setStartingLevel] = useState("");
  const [color, setColor] = useState(COLORS[0].value);
  const [difficulty, setDifficulty] = useState(DIFFICULTY[0].value);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const getDifficultyXP = () =>
    DIFFICULTY.find((d) => d.value === difficulty).xp;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!courseName.trim()) {
      setError("Course name is required.");
      return;
    }
    const levelNum = Number(startingLevel);
    if (isNaN(levelNum) || levelNum < 1 || levelNum > 80) {
      setError("Starting level must be a number from 1 to 80.");
      return;
    }

    const totalXP = getDifficultyXP();
    const xpTable = distributeXP(totalXP, 100);

    const newCourse = {
      id: Date.now(),
      courseName: courseName.trim(),
      startingLevel: levelNum,
      difficulty,
      totalXP,
      color,
      xpTable,
      currentXP: 0,
      createdAt: new Date().toISOString(),
    };

    const prev = JSON.parse(localStorage.getItem("courses") || "[]");
    localStorage.setItem("courses", JSON.stringify([...prev, newCourse]));

    setShowModal(true);
    setError("");
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#151a25] via-[#222b3a] to-[#314055] flex items-center justify-center px-4 py-12 relative">
      {/* Back Button Top Left */}
      <div className="absolute top-8 left-8 z-10">
        <GlassButton
          color="emerald"
          aria-label="Back"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={22} className="pointer-events-none" />
        </GlassButton>
      </div>
      <div className="w-full max-w-md rounded-2xl px-10 py-10 shadow-xl border border-white/10 backdrop-blur-md bg-white/10 relative">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-sky-300 mb-7 tracking-tight [text-shadow:0_4px_24px_rgba(56,189,248,0.4)]">
          Add a new course
        </h2>
        <form className="space-y-7" onSubmit={handleSubmit} autoComplete="off">
          <div>
            <label className="block text-slate-200 mb-1 font-medium">
              Course Name
            </label>
            <input
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-white/10 border border-sky-700 focus:outline-none focus:border-sky-400 text-slate-100 shadow-sm"
              autoFocus
              maxLength={60}
              placeholder="E.g. CompTIA A+"
              required
            />
          </div>
          <div>
            <label className="block text-slate-200 mb-1 font-medium">
              Starting Level
            </label>
            <input
              value={startingLevel}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9]/g, "");
                setStartingLevel(v);
              }}
              type="number"
              min={1}
              max={80}
              className="w-full px-3 py-2 rounded-md bg-white/10 border border-sky-700 focus:outline-none focus:border-sky-400 text-slate-100 shadow-sm"
              placeholder="1 - 80"
              required
            />
            <div className="text-xs text-slate-400 mt-1">
              Must be a number between 1 and 80.
            </div>
          </div>
          {/* Difficulty */}
          <div>
            <label className="block text-slate-200 mb-2 font-medium">
              Course Difficulty
            </label>
            <div className="flex flex-wrap gap-6 justify-between sm:justify-start">
              {DIFFICULTY.map((d) => (
                <label
                  key={d.value}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer font-medium
                    transition shadow-sm border border-transparent
                    ${
                      difficulty === d.value
                        ? "bg-sky-400/20 text-sky-200 border-sky-400 shadow-md"
                        : "text-slate-300"
                    }
                  `}
                  style={{ minWidth: "90px", justifyContent: "center" }}
                >
                  <input
                    type="radio"
                    name="difficulty"
                    value={d.value}
                    checked={difficulty === d.value}
                    onChange={() => setDifficulty(d.value)}
                    className="accent-sky-400"
                  />
                  {d.name}
                </label>
              ))}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Total XP is based on difficulty. (XP will be split across 100
              levels in a Pokémon-style curve.)
            </div>
          </div>
          <div>
            <label className="block text-slate-200 mb-2 font-medium">
              Pick a course color
            </label>
            <div className="flex gap-4 mt-1">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-7 h-7 cursor-pointer rounded-full border-2 transition-all duration-150
                    ${
                      color === c.value
                        ? "border-white scale-110 shadow-md shadow-white/20"
                        : "border-white/10"
                    }
                  `}
                  style={{ backgroundColor: c.color }}
                  tabIndex={0}
                />
              ))}
            </div>
          </div>
          {error && (
            <div className="text-sm text-red-400 bg-white/10 rounded p-2 px-4 border border-red-400/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-sky-400/70 cursor-pointer hover:bg-sky-400 text-white font-bold rounded-xl shadow-xl mt-2 transition-all duration-150 focus:outline-none"
          >
            Add Course
          </button>
        </form>

        {/* --- Modal with Animation & Glass Effect --- */}
        {showModal && (
          <div
            className="fixed inset-0 z-30 flex items-center justify-center
              bg-black/40 backdrop-blur-[4px] transition-all duration-300"
            style={{
              animation: "modalFadeIn 0.23s cubic-bezier(0.4,0.7,0.5,1) both",
            }}
          >
            <div
              className="bg-white/80 rounded-2xl p-8 flex flex-col items-center shadow-2xl border border-sky-400/30"
              style={{
                animation:
                  "modalScaleIn 0.28s cubic-bezier(0.25,0.8,0.3,1.07) both",
              }}
            >
              <svg
                width="54"
                height="54"
                viewBox="0 0 20 20"
                fill="none"
                className="mb-2"
              >
                <circle
                  cx="10"
                  cy="10"
                  r="10"
                  fill="#38bdf8"
                  fillOpacity="0.19"
                />
                <path
                  d="M7 10.5l2 2 4-4"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-lg font-bold text-sky-700 mb-2">
                Course added!
              </div>
              <button
                onClick={handleModalClose}
                className="px-6 py-2 mt-1 bg-sky-400 hover:bg-sky-500 rounded-xl text-white font-semibold shadow focus:outline-none transition"
                autoFocus
              >
                Go to Dashboard
              </button>
            </div>
            {/* Animation CSS */}
            <style>
              {`
                @keyframes modalFadeIn {
                  from { opacity: 0; }
                  to   { opacity: 1; }
                }
                @keyframes modalScaleIn {
                  from { opacity: 0; transform: scale(0.93) translateY(18px);}
                  to   { opacity: 1; transform: scale(1) translateY(0);}
                }
              `}
            </style>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddCourse;
