import SubmissionHistory from "../SubmissionHistory";
import ChatAi from "../ChatAi";
import Editorial from "../Editorial";
import { scrollbarStyle } from "../../constants/theme";

/**
 * Left panel content for ProblemPage — tabs for description, editorial, solutions, etc.
 */
const ProblemLeftPanel = ({ problem, problemId, activeTab, onTabChange }) => {
    const tabs = ["description", "editorial", "solutions", "submissions", "chatAI"];

    return (
        <div
            style={{
                backgroundColor: "#181C1F",
                border: "0.1px solid oklch(1 0 0 / 0.3)",
            }}
            className="flex flex-col mr-1 overflow-hidden rounded-l-lg"
        >
            {/* Tab Buttons */}
            <div
                className="flex gap-2 p-4 overflow-x-auto whitespace-nowrap items-center shadow-sm"
                style={{
                    backgroundColor: "#181C1F",
                    borderBottom: "0.1px solid oklch(1 0 0 / 0.3)",
                }}
            >
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        className={`text-sm px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeTab === tab
                                ? "bg-blue-600 text-white shadow-lg transform scale-105"
                                : "text-gray-300 hover:text-white hover:bg-gray-800"
                            }`}
                        onClick={() => onTabChange(tab)}
                    >
                        {tab.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div
                className="flex-1 overflow-y-auto p-6"
                style={{ ...scrollbarStyle, color: "oklch(0.8 0 0)" }}
            >
                {problem && (
                    <>
                        {activeTab === "description" && (
                            <DescriptionTab problem={problem} />
                        )}
                        {activeTab === "editorial" && (
                            <EditorialTab problem={problem} />
                        )}
                        {activeTab === "solutions" && (
                            <SolutionsTab problem={problem} />
                        )}
                        {activeTab === "submissions" && (
                            <div className="space-y-6">
                                <div className="border-b border-gray-700 pb-4">
                                    <h2 className="text-2xl font-bold text-orange-400 mb-2">
                                        My Submissions
                                    </h2>
                                    <p className="text-gray-400">Your submission history</p>
                                </div>
                                <div className="text-gray-300">
                                    <SubmissionHistory problemId={problemId} />
                                </div>
                            </div>
                        )}
                        {activeTab === "chatAI" && (
                            <div className="space-y-6">
                                <div className="border-b border-gray-700 pb-4">
                                    <h2 className="text-2xl font-bold text-cyan-400 mb-2 flex items-center gap-2">
                                        <span>🤖</span>
                                        CHAT with AI
                                    </h2>
                                    <p className="text-gray-400">
                                        Get help and hints from AI assistant
                                    </p>
                                </div>
                                <div className="prose max-w-none">
                                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                                        <ChatAi problem={problem} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

/* ───────── Sub-tab components ───────── */

const DescriptionTab = ({ problem }) => (
    <div className="space-y-6">
        <div className="border-b border-gray-700 pb-4">
            <h1 className="text-3xl font-bold text-blue-400 mb-2">{problem.title}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="px-2 py-1 bg-gray-800 rounded-md">Problem</span>
            </div>
        </div>
        <div className="prose max-w-none">
            <p className="text-gray-300 leading-relaxed text-lg">
                {problem.description}
            </p>
        </div>

        {/* Example Test Cases */}
        <div className="mt-8">
            <h3 className="font-semibold mb-6 text-lg text-yellow-400 flex items-center gap-2">
                <span>🧪</span>
                Example Test Cases
            </h3>

            {problem.visibleTestCases?.map((testCase, index) => (
                <div
                    key={index}
                    className="mb-6 p-6 rounded-xl border shadow-lg"
                    style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}
                >
                    <div className="mb-4">
                        <span className="text-sm font-medium text-blue-400 mb-2 block">
                            Input:
                        </span>
                        <pre
                            className="p-4 text-sm mt-1 overflow-x-auto rounded-lg border"
                            style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}
                        >
                            <code className="text-gray-300">{testCase.input}</code>
                        </pre>
                    </div>

                    <div className="mb-4">
                        <span className="text-sm font-medium text-green-400 mb-2 block">
                            Expected Output:
                        </span>
                        <pre
                            className="p-4 text-sm mt-1 overflow-x-auto rounded-lg border"
                            style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}
                        >
                            <code className="text-gray-300">{testCase.output}</code>
                        </pre>
                    </div>

                    {testCase.explanation && (
                        <div>
                            <span className="text-sm font-medium text-purple-400 mb-2 block">
                                Explanation:
                            </span>
                            <pre
                                className="p-4 text-sm mt-1 overflow-x-auto rounded-lg border"
                                style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}
                            >
                                <code className="text-gray-300">{testCase.explanation}</code>
                            </pre>
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
);

const EditorialTab = ({ problem }) => (
    <div className="space-y-6">
        <div className="border-b border-gray-700 pb-4">
            <h2 className="text-2xl font-bold text-purple-400 mb-2">
                Solution Video
            </h2>
            <p className="text-gray-400">Watch the solution explanation</p>
        </div>

        {problem?.solutionVideo ? (
            <div className="space-y-4">
                <Editorial
                    secureUrl={problem.solutionVideo.videoUrl}
                    thumbnailUrl={problem.solutionVideo.thumbnailUrl}
                    duration={problem.solutionVideo.duration}
                />
                <div className="text-sm text-gray-400 text-center">
                    Duration:{" "}
                    {Math.floor(problem.solutionVideo.duration / 60)}:
                    {String(Math.floor(problem.solutionVideo.duration % 60)).padStart(
                        2,
                        "0"
                    )}
                </div>
            </div>
        ) : (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">🎥</div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                    No Solution Video Available
                </h3>
                <p className="text-gray-500">
                    The solution video for this problem hasn't been uploaded yet.
                </p>
            </div>
        )}
    </div>
);

const SolutionsTab = ({ problem }) => (
    <div className="space-y-6">
        <div className="border-b border-gray-700 pb-4">
            <h2 className="text-2xl font-bold text-green-400 mb-2">Solutions</h2>
            <p className="text-gray-400">Reference implementations</p>
        </div>
        <div className="space-y-6">
            {problem.referenceSolution?.map((solution, index) => (
                <div
                    key={index}
                    className="border rounded-xl overflow-hidden shadow-lg"
                    style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}
                >
                    <div
                        className="px-6 py-4 border-b"
                        style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}
                    >
                        <h3 className="font-semibold text-white flex items-center gap-2">
                            <span className="text-blue-400">💻</span>
                            {problem?.title} - {solution?.language}
                        </h3>
                    </div>
                    <div className="p-6">
                        <pre
                            className="p-4 rounded-lg text-sm overflow-x-auto border"
                            style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}
                        >
                            <code className="text-gray-300">{solution?.completeCode}</code>
                        </pre>
                    </div>
                </div>
            )) || (
                    <div
                        className="text-center py-8 text-gray-400 border-2 border-dashed rounded-xl"
                        style={{ borderColor: "#374151" }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 mx-auto mb-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                        <p>Solutions will be available after you solve the problem</p>
                    </div>
                )}
        </div>
    </div>
);

export default ProblemLeftPanel;
