/**
 * Displays the results of running code against visible test cases
 */
const RunResults = ({ runResult }) => {
    if (!runResult) return null;

    return (
        <div
            className={`p-6 rounded-xl border shadow-lg mx-4 my-4 ${runResult.success ? "border-green-500/30" : "border-red-500/30"
                }`}
            style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}
        >
            <h4 className="font-bold mb-4 text-lg flex items-center gap-2">
                {runResult.success ? (
                    <>
                        <span className="text-green-400">✅</span> Test results
                    </>
                ) : (
                    <>
                        <span className="text-red-400">❌</span> Test failed
                    </>
                )}
            </h4>

            {runResult.testCases?.map((tc, i) => (
                <div
                    key={i}
                    className="mb-4 p-4 rounded-lg border"
                    style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}
                >
                    <div className="flex items-center mb-3">
                        <span
                            className={`mr-2 text-lg ${tc.status_id === 3 ? "text-green-400" : "text-red-400"
                                }`}
                        >
                            {tc.status_id === 3 ? "✓" : "✗"}
                        </span>
                        <span className="font-medium">Test Case {i + 1}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div
                            className="p-3 rounded-lg border"
                            style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}
                        >
                            <span className="text-blue-400 font-medium block mb-1">
                                Input:
                            </span>
                            <div className="text-gray-300 font-mono text-xs break-all">
                                {tc.stdin}
                            </div>
                        </div>
                        <div
                            className="p-3 rounded-lg border"
                            style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}
                        >
                            <span className="text-green-400 font-medium block mb-1">
                                Expected:
                            </span>
                            <div className="text-gray-300 font-mono text-xs">
                                {tc.expected_output}
                            </div>
                        </div>
                        <div
                            className="p-3 rounded-lg border"
                            style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}
                        >
                            <span className="text-purple-400 font-medium block mb-1">
                                Output:
                            </span>
                            <div className="text-gray-300 font-mono text-xs">
                                {tc.stdout || "No output"}
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {runResult.success && (
                <div
                    className="mt-4 p-4 rounded-lg border"
                    style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}
                >
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-yellow-400">
                            <span className="font-medium">Runtime:</span>
                            <span className="ml-2 font-mono">{runResult.runtime} sec</span>
                        </div>
                        <div className="text-cyan-400">
                            <span className="font-medium">Memory:</span>
                            <span className="ml-2 font-mono">{runResult.memory} KB</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RunResults;
