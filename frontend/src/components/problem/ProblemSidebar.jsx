import { useState } from "react";
import { X } from "lucide-react";
import { BeatLoader } from "react-spinners";
import { getDifficultyColor, scrollbarStyle } from "../../constants/theme";

/**
 * Full-screen sidebar overlay showing all problems with search
 */
const ProblemSidebar = ({
    show,
    onClose,
    sidebarProblems,
    currentProblemId,
    onSelectProblem,
}) => {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredProblems = sidebarProblems.filter(
        (p) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.tags && p.tags.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div
            className={`fixed inset-0 z-50 flex transition-opacity duration-300 ease-in-out ${show
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none"
                }`}
        >
            <div
                className={`absolute inset-0 bg-black transition-opacity duration-300 ${show ? "opacity-50" : "opacity-0"
                    }`}
                onClick={onClose}
            />

            <div
                className={`relative z-50 w-80 bg-gray-900 shadow-xl overflow-y-auto transform transition-transform duration-300 ease-in-out ${show ? "translate-x-0" : "-translate-x-full"
                    }`}
                style={scrollbarStyle}
            >
                <div
                    className="p-4 border-b border-gray-700 flex justify-between items-center"
                    style={{ backgroundColor: "#181C1F" }}
                >
                    <h2 className="text-xl font-bold text-blue-400">Problem List</h2>
                    <button
                        className="text-gray-400 hover:text-white transition-colors duration-200"
                        onClick={onClose}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-4" style={{ backgroundColor: "#181C1F" }}>
                    <input
                        type="text"
                        placeholder="Search problems..."
                        className="w-full p-2 mb-4 bg-gray-800 text-white rounded border border-gray-700"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <div className="flex justify-between mb-2 text-sm text-gray-400">
                        <span>Total: {sidebarProblems.length} problems</span>
                    </div>

                    {sidebarProblems.length === 0 ? (
                        <div className="flex justify-center py-8">
                            <BeatLoader color="#1D4ED8" size={12} />
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredProblems.map((p) => (
                                <button
                                    key={p._id}
                                    className={`w-full text-left p-3 rounded-lg transition-all ${p._id === currentProblemId
                                            ? "bg-blue-600 text-white shadow-lg"
                                            : "text-gray-300 hover:bg-gray-800"
                                        }`}
                                    onClick={() => onSelectProblem(p._id)}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">{p.title}</span>
                                        <span
                                            className={`text-xs px-2 py-1 rounded ${getDifficultyColor(
                                                p.difficulty
                                            )}`}
                                        >
                                            {p.difficulty}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 truncate">
                                        {p.tags || "No tags"}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProblemSidebar;
