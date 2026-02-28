import Editor from "@monaco-editor/react";
import { BeatLoader } from "react-spinners";
import { scrollbarStyle } from "../../constants/theme";
import { getMonacoLanguage, SUPPORTED_LANGUAGES, getLanguageLabel } from "../../constants/languages";
import { getYouTubeId } from "../../utils/formatters";
import RunResults from "./RunResults";
import SubmitResults from "./SubmitResults";

/**
 * Right panel of ProblemPage — code editor + results
 */
const ProblemRightPanel = ({
    selectedLanguage,
    code,
    activeTab,
    onTabChange,
    onLanguageChange,
    onEditorChange,
    onEditorMount,
    onRun,
    onSubmit,
    isRunning,
    isSubmitting,
    runResult,
    submitResult,
    llmFeedback,
    llmLoading,
    llmError,
    studyMaterial,
}) => {
    return (
        <div
            style={{
                backgroundColor: "#181C1F",
                border: "0.1px solid oklch(1 0 0 / 0.3)",
            }}
            className="flex flex-col ml-1 overflow-hidden rounded-r-lg"
        >
            {/* Tab Bar */}
            <div
                className="flex gap-2 p-4 overflow-x-auto whitespace-nowrap items-center shadow-sm"
                style={{
                    backgroundColor: "#181C1F",
                    borderBottom: "0.1px solid oklch(1 0 0 / 0.3)",
                }}
            >
                {/* Language Selection */}
                <div className="flex gap-1 mr-8">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                        <button
                            key={lang}
                            onClick={() => onLanguageChange(lang)}
                            className={`px-4 py-2 font-medium text-sm rounded-lg transition-all duration-200 ${selectedLanguage === lang
                                    ? "text-blue-400 bg-blue-500/20 border-b-2 border-blue-400"
                                    : "text-gray-500 hover:text-white hover:bg-gray-800"
                                }`}
                        >
                            {getLanguageLabel(lang)}
                        </button>
                    ))}
                </div>

                {/* Code / Result tabs */}
                {["code", "result"].map((tab) => (
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

            <div className="flex-1 flex flex-col overflow-hidden">
                {activeTab === "code" && (
                    <div className="flex flex-col h-full overflow-hidden">
                        {/* Scrollable area */}
                        <div className="flex-1 overflow-y-auto" style={scrollbarStyle}>
                            {/* Editor */}
                            <div
                                className="mx-4 mt-4 overflow-hidden border rounded-lg shadow-lg"
                                style={{
                                    boxShadow:
                                        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                    borderColor: "#374151",
                                    backgroundColor: "#181C1F",
                                }}
                            >
                                <Editor
                                    height="50vh"
                                    width="100%"
                                    language={getMonacoLanguage(selectedLanguage)}
                                    value={code}
                                    onChange={onEditorChange}
                                    onMount={onEditorMount}
                                    theme="vs-dark"
                                    options={{
                                        fontSize: 16,
                                        minimap: { enabled: false },
                                        wordWrap: "on",
                                        scrollBeyondLastLine: false,
                                        tabSize: 4,
                                        automaticLayout: true,
                                        cursorBlinking: "smooth",
                                        renderLineHighlight: "line",
                                        cursorStyle: "line",
                                        lineNumbersMinChars: 3,
                                        lineDecorationsWidth: 8,
                                        scrollbar: {
                                            verticalScrollbarSize: 6,
                                            horizontalScrollbarSize: 6,
                                            useShadows: false,
                                            verticalSliderSize: 6,
                                            horizontalSliderSize: 6,
                                        },
                                    }}
                                />
                            </div>

                            {/* Run Results */}
                            {runResult && <RunResults runResult={runResult} />}

                            {isRunning && (
                                <div className="flex justify-center my-6">
                                    <BeatLoader color="#1D4ED8" size={12} />
                                </div>
                            )}
                        </div>

                        {/* Fixed action buttons */}
                        <div
                            className="flex gap-3 p-4 border-t"
                            style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}
                        >
                            <button
                                className="flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
                                style={{
                                    backgroundColor: "#1D4ED8",
                                    color: "white",
                                    minWidth: "100px",
                                }}
                                onClick={onRun}
                                disabled={isRunning}
                            >
                                {isRunning ? (
                                    <span className="loading loading-spinner loading-sm mr-2" />
                                ) : (
                                    <span className="mr-2">▶️</span>
                                )}
                                Run
                            </button>

                            <button
                                className="flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
                                style={{
                                    backgroundColor: "#059669",
                                    color: "white",
                                    minWidth: "100px",
                                }}
                                onClick={onSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <span className="loading loading-spinner loading-sm mr-2" />
                                ) : (
                                    <span className="mr-2">🚀</span>
                                )}
                                Submit
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === "result" && (
                    <SubmitResults
                        submitResult={submitResult}
                        llmFeedback={llmFeedback}
                        llmLoading={llmLoading}
                        llmError={llmError}
                        studyMaterial={studyMaterial}
                    />
                )}
            </div>
        </div>
    );
};

export default ProblemRightPanel;
