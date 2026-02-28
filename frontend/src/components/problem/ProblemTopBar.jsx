import { Link } from "react-router";
import { Clock, Bookmark, ArrowLeft, ArrowRight, Menu } from "lucide-react";
import { formatTime } from "../../utils/formatters";

/**
 * Top bar for ProblemPage with timer, bookmark, and problem navigation
 */
const ProblemTopBar = ({
    timer,
    timerActive,
    toggleTimer,
    bookmarked,
    toggleBookmark,
    onToggleProblemList,
    onPrevProblem,
    onNextProblem,
    canGoPrev,
    canGoNext,
}) => {
    return (
        <div
            className="w-full flex justify-between items-center px-6 py-4 shadow-lg"
            style={{
                backgroundColor: "#181C1F",
                borderBottom: "0.1px solid oklch(1 0 0 / 0.3)",
            }}
        >
            <div className="flex items-center gap-3">
                <button
                    className="text-gray-400 hover:text-white"
                    onClick={onToggleProblemList}
                >
                    <Menu size={24} />
                </button>
                <Link
                    to="/"
                    className="text-2xl tracking-widest font-bold text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                    Codex
                </Link>
            </div>

            <div className="flex gap-3">
                <button
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all duration-200 border"
                    style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}
                    onClick={toggleTimer}
                >
                    <Clock size={16} />
                    <span
                        className={`ml-1 inline-block transition-all duration-300 ${timerActive
                                ? "opacity-100 w-auto"
                                : "opacity-0 w-0 overflow-hidden"
                            }`}
                    >
                        {formatTime(timer)}
                    </span>
                </button>

                <button
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all duration-200 border"
                    style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}
                    onClick={toggleBookmark}
                >
                    <Bookmark size={16} fill={bookmarked ? "currentColor" : "none"} />
                </button>

                <button
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all duration-200 border disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}
                    onClick={onPrevProblem}
                    disabled={!canGoPrev}
                >
                    <ArrowLeft size={16} />
                </button>
                <button
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all duration-200 border disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}
                    onClick={onNextProblem}
                    disabled={!canGoNext}
                >
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default ProblemTopBar;
