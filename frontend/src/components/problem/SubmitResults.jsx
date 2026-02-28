import { BeatLoader } from "react-spinners";
import { scrollbarStyle } from "../../constants/theme";
import { getYouTubeId } from "../../utils/formatters";

/**
 * Displays the submission result, LLM analysis, and study materials
 */
const SubmitResults = ({
    submitResult,
    llmFeedback,
    llmLoading,
    llmError,
    studyMaterial,
}) => {
    return (
        <div
            className="flex-1 p-6 overflow-y-auto text-white"
            style={scrollbarStyle}
        >
            <h3
                className="font-semibold text-2xl mb-6 border-b pb-3 text-orange-400 flex items-center gap-2"
                style={{ borderColor: "#374151" }}
            >
                <span>📊</span>
                Submission Result
            </h3>

            {submitResult ? (
                <div
                    className={`rounded-xl p-6 border shadow-lg ${submitResult.accepted
                            ? "border-green-500/30"
                            : "border-red-500/30"
                        }`}
                    style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}
                >
                    {submitResult.accepted ? (
                        <div className="space-y-8">
                            {/* Accepted header */}
                            <div className="flex items-center gap-4">
                                <div className="text-4xl">🎉</div>
                                <div>
                                    <h4 className="font-bold text-3xl text-green-400">
                                        Accepted
                                    </h4>
                                    <div className="flex flex-wrap gap-3 mt-3">
                                        <div
                                            className="px-4 py-2 rounded-lg border"
                                            style={{
                                                backgroundColor: "#181C1F",
                                                borderColor: "#374151",
                                            }}
                                        >
                                            <span className="text-gray-400">Test Cases: </span>
                                            <span className="font-mono text-green-400">
                                                {submitResult.passedTestCases}/
                                                {submitResult.totalTestCases}
                                            </span>
                                        </div>
                                        <div
                                            className="px-4 py-2 rounded-lg border"
                                            style={{
                                                backgroundColor: "#181C1F",
                                                borderColor: "#374151",
                                            }}
                                        >
                                            <span className="text-gray-400">Runtime: </span>
                                            <span className="font-mono text-yellow-400">
                                                {submitResult.runtime}s
                                            </span>
                                        </div>
                                        <div
                                            className="px-4 py-2 rounded-lg border"
                                            style={{
                                                backgroundColor: "#181C1F",
                                                borderColor: "#374151",
                                            }}
                                        >
                                            <span className="text-gray-400">Memory: </span>
                                            <span className="font-mono text-cyan-400">
                                                {submitResult.memory}KB
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* LLM Analysis */}
                            <LLMAnalysis
                                llmLoading={llmLoading}
                                llmError={llmError}
                                llmFeedback={llmFeedback}
                            />

                            {/* Study Materials */}
                            {studyMaterial.length > 0 && (
                                <StudyMaterials materials={studyMaterial} />
                            )}
                        </div>
                    ) : (
                        <div>
                            <h4 className="font-bold text-xl text-red-400 flex items-center gap-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                {submitResult.error}
                            </h4>
                            <div
                                className="mt-4 p-4 rounded-lg"
                                style={{ backgroundColor: "#181C1F" }}
                            >
                                <p className="text-gray-300">
                                    Test Cases Passed:
                                    <span className="font-mono ml-2">
                                        {submitResult.passedTestCases}/{submitResult.totalTestCases}
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
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
                            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                    </svg>
                    Click "Submit" to evaluate your solution
                </div>
            )}
        </div>
    );
};

/* ─── Sub-components ─── */

const LLMAnalysis = ({ llmLoading, llmError, llmFeedback }) => (
    <div className="mt-8">
        <h5 className="font-bold text-xl mb-4 flex items-center gap-2 text-purple-400">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 20 20"
                fill="currentColor"
            >
                <path
                    fillRule="evenodd"
                    d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                />
            </svg>
            Solution Analysis
        </h5>

        {llmLoading ? (
            <div className="flex justify-center my-6">
                <BeatLoader color="#8B5CF6" size={12} />
            </div>
        ) : llmError ? (
            <div
                className="p-6 rounded-xl border shadow-lg"
                style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}
            >
                <div className="text-center text-yellow-400">
                    <div className="text-2xl mb-2">⚠️</div>
                    <p className="mb-2">AI Analysis temporarily unavailable</p>
                    <p className="text-sm text-gray-400">
                        Your solution was successfully submitted and accepted!
                    </p>
                </div>
            </div>
        ) : llmFeedback ? (
            <div
                className="p-6 rounded-xl border shadow-lg"
                style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div
                        className="p-4 rounded-lg border"
                        style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}
                    >
                        <div className="text-blue-400 font-medium mb-2">
                            ⏱️ Time Complexity
                        </div>
                        <div className="font-mono text-xl text-white">
                            {llmFeedback.analysis.match(
                                /Time Complexity: (.*?)(\n|$)/
                            )?.[1] || "N/A"}
                        </div>
                    </div>
                    <div
                        className="p-4 rounded-lg border"
                        style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}
                    >
                        <div className="text-blue-400 font-medium mb-2">
                            💾 Space Complexity
                        </div>
                        <div className="font-mono text-xl text-white">
                            {llmFeedback.analysis.match(
                                /Space Complexity: (.*?)(\n|$)/
                            )?.[1] || "N/A"}
                        </div>
                    </div>
                </div>

                {llmFeedback.analysis.includes("\n") && (
                    <div className="pt-4 border-t" style={{ borderColor: "#374151" }}>
                        <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {llmFeedback.analysis.split("\n").slice(2).join("\n")}
                        </div>
                    </div>
                )}
            </div>
        ) : (
            <div
                className="p-6 rounded-xl border text-gray-400 text-center"
                style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}
            >
                <div className="animate-pulse">
                    <span className="text-2xl mb-2 block">🔄</span>
                    Solution analysis will appear here...
                </div>
            </div>
        )}
    </div>
);

const StudyMaterials = ({ materials }) => (
    <div className="mt-8">
        <h5 className="font-bold text-xl mb-4 flex items-center gap-2 text-cyan-400">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 20 20"
                fill="currentColor"
            >
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            Recommended Study Materials
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {materials.map((material, index) => (
                <a
                    key={index}
                    href={material.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl overflow-hidden border hover:border-blue-500 transition-all duration-200 block"
                    style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}
                >
                    {material.url.includes("youtube.com") && (
                        <div className="relative aspect-video bg-gray-700">
                            <img
                                src={`https://img.youtube.com/vi/${getYouTubeId(
                                    material.url
                                )}/mqdefault.jpg`}
                                alt={material.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-white"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="p-4">
                        <div className="flex items-start gap-3">
                            {!material.url.includes("youtube.com") && (
                                <span className="text-2xl mt-1">📚</span>
                            )}
                            <div>
                                <h6 className="font-medium text-blue-400 hover:underline flex items-center">
                                    {material.title}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 ml-1"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                    </svg>
                                </h6>
                                <p className="text-sm text-gray-300 mt-2">
                                    {material.description}
                                </p>
                            </div>
                        </div>
                    </div>
                </a>
            ))}
        </div>
    </div>
);

export default SubmitResults;
