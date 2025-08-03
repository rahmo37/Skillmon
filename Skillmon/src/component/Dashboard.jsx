import React, { useEffect, useState, useRef } from "react";
import GlassButton from "./HelperComponent/GlassButton.jsx";
import { Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import folder from "../assets/empty-folder.png";

// Map Tailwind color name to actual HEX for style
const COLOR_HEX_MAP = {
  "rose-400": "#EE6352",
  "emerald-400": "#59CD90",
  "amber-400": "#E6C229",
  "blue-400": "#9381FF",
  "orange-400": "#28C2FF",
  "cyan-400": "#FF715B",
};

function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [showDeleteDropdown, setShowDeleteDropdown] = useState(false);
  const [showAddPointsDropdown, setShowAddPointsDropdown] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [showMaxModal, setShowMaxModal] = useState(false);
  const dropdownRef = useRef();
  const addPointsRef = useRef();
  const navigate = useNavigate();

  // Drawer heights for smooth animation
  const drawerListRef = useRef(null);
  const addPointsListRef = useRef(null);
  const [drawerHeight, setDrawerHeight] = useState(0);
  const [addPointsHeight, setAddPointsHeight] = useState(0);

  // Get all courses on mount
  useEffect(() => {
    const stored = localStorage.getItem("courses");
    if (stored) {
      setCourses(JSON.parse(stored));
    }
  }, []);

  // Handle outside click to close either dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      // For Delete drawer
      if (
        showDeleteDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDeleteDropdown(false);
      }
      // For Add Points drawer
      if (
        showAddPointsDropdown &&
        addPointsRef.current &&
        !addPointsRef.current.contains(event.target)
      ) {
        setShowAddPointsDropdown(false);
      }
    }
    if (showDeleteDropdown || showAddPointsDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDeleteDropdown, showAddPointsDropdown]);

  // Dynamic heights for animated drawers
  useEffect(() => {
    if (showDeleteDropdown && drawerListRef.current) {
      setDrawerHeight(drawerListRef.current.scrollHeight);
    } else {
      setDrawerHeight(0);
    }
  }, [showDeleteDropdown, courses.length]);
  useEffect(() => {
    if (showAddPointsDropdown && addPointsListRef.current) {
      setAddPointsHeight(addPointsListRef.current.scrollHeight);
    } else {
      setAddPointsHeight(0);
    }
  }, [showAddPointsDropdown, courses.length]);

  // Calculate current progress
  // Corrected getProgress Function
  function getProgress(course) {
    const xpTable = Array.isArray(course.xpTable) ? course.xpTable : [];
    let totalXP =
      (xpTable[course.startingLevel - 1] || 0) + (course.currentXP || 0);

    let currentLevel = course.startingLevel;
    const maxLevel = xpTable.length;

    // Find the correct level according to totalXP
    while (currentLevel < maxLevel && totalXP >= xpTable[currentLevel]) {
      currentLevel++;
    }

    const xpCurrentLevel = xpTable[currentLevel - 1] || 0;
    const xpNextLevel = xpTable[currentLevel] || xpCurrentLevel + 100;

    const xpIntoCurrentLevel = totalXP - xpCurrentLevel;
    const xpNeededThisLevel = xpNextLevel - xpCurrentLevel;

    const percent = Math.min(
      100,
      Math.max(0, Math.round((xpIntoCurrentLevel / xpNeededThisLevel) * 100))
    );

    const xpNeededForNextLevel = xpNextLevel - totalXP;

    return {
      level: currentLevel,
      percent,
      xpNeededForNextLevel,
    };
  }

  // Handle course deletion with input confirmation
  function handleDeleteCourse() {
    const newCourses = courses.filter((c) => c.id !== selectedCourseId);
    localStorage.setItem("courses", JSON.stringify(newCourses));
    setCourses(newCourses);
    setShowDeleteModal(false);
    setSelectedCourseId(null);
    setDeleteConfirmInput("");
  }

  // The course the user wants to delete (object, not just id)
  const courseToDelete = courses.find((c) => c.id === selectedCourseId);

  // Handler for Add Course (enforce max 3, now shows modal)
  function handleAddCourse() {
    if (courses.length >= 3) {
      setShowMaxModal(true);
      return;
    }
    navigate("/add-course");
  }

  // Handle Add Points: navigates to add-points/:courseId
  function handleAddPoints(course) {
    setShowAddPointsDropdown(false);
    navigate(`/add-points/${course.id}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#151a25] via-[#222b3a] to-[#314055] px-4 py-8 relative overflow-x-hidden">
      {/* Plus icon button at top left */}
      <div className="absolute top-8 left-8 z-10 flex items-center">
        <GlassButton
          color="amber"
          aria-label="Add Course"
          onClick={handleAddCourse}
          style={{ cursor: "pointer" }}
        >
          <Plus size={20} className="pointer-events-none" />
        </GlassButton>
      </div>

      {/* Glassy buttons at top right */}
      <div className="absolute top-8 right-8 flex gap-4 z-20">
        {/* --- Add Points Button with Drawer Dropdown --- */}
        <div className="relative" ref={addPointsRef}>
          <GlassButton
            color="emerald"
            onClick={() => {
              setShowAddPointsDropdown((open) => !open);
              setShowDeleteDropdown(false);
            }}
            aria-haspopup="listbox"
            aria-expanded={showAddPointsDropdown}
          >
            <Plus size={22} />
            Add Points
          </GlassButton>
          <div
            className={`
              absolute top-12 right-1 min-w-[150px] rounded-xl border border-white/10
              z-30 drawer-container
            `}
            style={{
              maxHeight: showAddPointsDropdown ? addPointsHeight : 0,
              opacity: showAddPointsDropdown ? 1 : 0,
              overflow: "hidden",
              transition:
                "max-height 0.44s cubic-bezier(.42,1.7,.32,1), opacity 0.23s cubic-bezier(.2,1.3,.5,1), box-shadow 0.18s, transform 0.18s",
              background: "rgba(17,34,21,0.96)",
              boxShadow: showAddPointsDropdown
                ? "0 8px 36px 0 rgba(16,185,129,0.16), 0 2px 16px 0 rgba(0,0,0,0.25)"
                : "0 2px 8px 0 rgba(0,0,0,0.08)",
              backdropFilter: "blur(13px)",
              pointerEvents: showAddPointsDropdown ? "auto" : "none",
              transform: showAddPointsDropdown
                ? "translateY(0px)"
                : "translateY(-12px) scaleY(0.93)",
              transitionProperty: "max-height, opacity, box-shadow, transform",
            }}
          >
            <div ref={addPointsListRef}>
              {courses.length > 0 &&
                courses.map((course) => (
                  <div
                    key={course.id}
                    className="px-5 py-2 cursor-pointer transition font-semibold text-base text-white hover:bg-emerald-400/25"
                    onClick={() => handleAddPoints(course)}
                    style={{
                      transition: "background 0.2s, color 0.2s",
                    }}
                  >
                    {course.courseName}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* --- Delete Course Button with Drawer Dropdown --- */}
        <div className="relative" ref={dropdownRef}>
          <GlassButton
            color="rose"
            onClick={() => {
              setShowDeleteDropdown((open) => !open);
              setShowAddPointsDropdown(false);
            }}
            aria-haspopup="listbox"
            aria-expanded={showDeleteDropdown}
          >
            <Trash2 size={22} />
            Delete Course
          </GlassButton>
          <div
            className={`
              absolute top-12 right-1 min-w-[170px] rounded-xl border border-white/10
              z-30 drawer-container
            `}
            style={{
              maxHeight: showDeleteDropdown ? drawerHeight : 0,
              opacity: showDeleteDropdown ? 1 : 0,
              overflow: "hidden",
              transition:
                "max-height 0.44s cubic-bezier(.42,1.7,.32,1), opacity 0.23s cubic-bezier(.2,1.3,.5,1), box-shadow 0.18s, transform 0.18s",
              background: "rgba(61, 24, 26, 0.97)",
              boxShadow: showDeleteDropdown
                ? "0 8px 36px 0 rgba(205, 4, 34, 0.13), 0 2px 16px 0 rgba(0,0,0,0.24)"
                : "0 2px 8px 0 rgba(0,0,0,0.06)",
              backdropFilter: "blur(12px)",
              pointerEvents: showDeleteDropdown ? "auto" : "none",
              transform: showDeleteDropdown
                ? "translateY(0px)"
                : "translateY(-14px) scaleY(0.94)",
              transitionProperty: "max-height, opacity, box-shadow, transform",
            }}
          >
            <div ref={drawerListRef}>
              {courses.length > 0 &&
                courses.map((course) => (
                  <div
                    key={course.id}
                    className="px-5 py-2 cursor-pointer transition font-semibold text-base text-white hover:bg-rose-400/25"
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      setShowDeleteDropdown(false);
                      setShowDeleteModal(true);
                      setDeleteConfirmInput("");
                    }}
                    style={{
                      transition: "background 0.2s, color 0.2s",
                    }}
                  >
                    {course.courseName}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Max Courses Message */}
      {showMaxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[3px]">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-2xl border border-amber-200/40 min-w-[350px] animate-modalScaleIn">
            <svg
              width="56"
              height="56"
              viewBox="0 0 20 20"
              fill="none"
              className="mb-2"
            >
              <circle
                cx="10"
                cy="10"
                r="10"
                fill="#fbbf24"
                fillOpacity="0.15"
              />
              <path
                d="M10 6v4m0 4h.01"
                stroke="#fbbf24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-xl font-bold text-amber-600 mb-2 text-center">
              Maximum Courses Reached
            </div>
            <div className="mb-3 text-gray-700 text-base text-center font-medium">
              You’ve reached the limit of{" "}
              <span className="font-bold text-amber-700">3 active courses</span>
              .<br />
              <span className="text-gray-600">
                It’s best to finish what you’ve started before adding more.
                <br />
                Focusing on fewer courses helps you level up faster!
              </span>
            </div>
            <button
              className="px-7 py-2 bg-amber-400 hover:bg-amber-500 text-white font-semibold rounded-xl shadow focus:outline-none transition cursor-pointer"
              onClick={() => setShowMaxModal(false)}
              autoFocus
            >
              Got it!
            </button>
          </div>
          <style>
            {`
              @keyframes modalScaleIn {
                from { opacity: 0; transform: scale(0.93);}
                to   { opacity: 1; transform: scale(1);}
              }
              .animate-modalScaleIn {
                animation: modalScaleIn 0.22s cubic-bezier(.34,1.56,.64,1) both;
              }
            `}
          </style>
        </div>
      )}

      {/* Modal: Delete Course */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-[3px]">
          <div className="bg-white rounded-2xl p-7 flex flex-col items-center shadow-2xl border border-rose-200/40 min-w-[330px] animate-modalScaleIn">
            <svg
              width="50"
              height="50"
              viewBox="0 0 20 20"
              fill="none"
              className="mb-2"
            >
              <circle
                cx="10"
                cy="10"
                r="10"
                fill="#fb7185"
                fillOpacity="0.13"
              />
              <path
                d="M7 7l6 6M13 7l-6 6"
                stroke="#fb7185"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-lg font-bold text-rose-600 mb-2 text-center">
              Are you sure you want to delete this course?
            </div>
            <div className="mb-2 text-base text-center text-slate-500 w-full">
              Please type&nbsp;
              <span className="font-semibold text-rose-500 break-all">
                {courseToDelete?.courseName || ""}
              </span>
              &nbsp;to confirm deletion.
            </div>
            <input
              type="text"
              className={`
                w-full px-4 py-2 mb-3 rounded-md border border-rose-200
                focus:outline-none focus:ring-2 focus:ring-rose-300
                text-gray-700 text-center font-semibold
                cursor-pointer
              `}
              autoFocus
              placeholder="Type course name to confirm"
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
            />
            <div className="flex gap-4 mt-2 w-full">
              <button
                className={`flex-1 px-5 py-2 font-semibold rounded-lg shadow focus:outline-none transition
                  ${
                    deleteConfirmInput.trim().toLowerCase() ===
                    (courseToDelete?.courseName || "").trim().toLowerCase()
                      ? "bg-rose-400 hover:bg-rose-500 text-white cursor-pointer"
                      : "bg-gray-300 text-gray-400 opacity-70 cursor-not-allowed"
                  }
                `}
                onClick={handleDeleteCourse}
                disabled={
                  deleteConfirmInput.trim().toLowerCase() !==
                  (courseToDelete?.courseName || "").trim().toLowerCase()
                }
                style={{
                  cursor:
                    deleteConfirmInput.trim().toLowerCase() ===
                    (courseToDelete?.courseName || "").trim().toLowerCase()
                      ? "pointer"
                      : "not-allowed",
                }}
              >
                Yes, Delete
              </button>
              <button
                className="flex-1 px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg shadow focus:outline-none transition cursor-pointer"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-4xl sm:text-5xl font-extrabold text-sky-300 text-center mt-4 mb-30 tracking-tight drop-shadow-lg [text-shadow:0_4px_24px_rgba(56,189,248,0.35)]">
        Skillmon Dashboard
      </h1>

      <main className="flex flex-col items-center mt-6 w-full">
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[200px]">
            <img
              src={folder}
              alt="No courses"
              className="w-24 h-24 mb-4 opacity-80 drop-shadow-xl"
              draggable="false"
              style={{ userSelect: "none" }}
            />
            <div className="text-2xl font-semibold text-slate-300/90 drop-shadow-sm">
              No Course Yet!
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-10 items-center">
            {courses.map((course) => {
              const { level, percent, xpNeededForNextLevel } =
                getProgress(course);
              const colorHex = COLOR_HEX_MAP[course.color] || "#60a5fa";

              return (
                <div
                  key={course.id}
                  className="w-full max-w-2xl px-8 py-7 rounded-2xl bg-white/5 backdrop-blur-sm shadow-2xl border border-white/10 flex flex-col gap-3"
                  style={{ boxShadow: "0 6px 32px rgba(0,0,0,0.13)" }}
                >
                  <div className="flex items-center mb-2">
                    <span
                      className="text-3xl sm:text-4xl font-extrabold tracking-tight"
                      style={{ color: colorHex }}
                    >
                      {course.courseName}
                    </span>
                    {/* Right: Level */}
                    <div className="ml-auto flex items-center gap-1">
                      <span
                        className="text-2xl font-extrabold tracking-tight"
                        style={{ color: colorHex }}
                      >
                        Lv
                      </span>
                      <span
                        className="text-2xl font-extrabold tracking-tight"
                        style={{ color: colorHex }}
                      >
                        {level}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar with percent in center */}
                  <div className="w-full h-4 rounded-lg bg-[#232c3c] overflow-hidden mt-1 mb-2 flex items-center relative">
                    <div
                      className="h-4 rounded-lg transition-all duration-700"
                      style={{ width: `${percent}%`, background: colorHex }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white pointer-events-none select-none drop-shadow">
                      {percent}%
                    </span>
                  </div>

                  <div className="flex justify-end">
                    <span className="text-md sm:text-lg text-slate-300 font-semibold opacity-80 font-mono pr-2">
                      To next Lv: {xpNeededForNextLevel} xp
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
