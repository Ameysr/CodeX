import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { debounce } from "lodash";
import { saveCode } from "../store/slices/codeSlice";
import { langMap } from "../constants/languages";
import * as problemService from "../services/problemService";

/**
 * Custom hook that manages code editor state, code save/restore,
 * and language switching for the problem page.
 */
const useCodeEditor = (problemId) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const codeStore = useSelector((state) => state.code.codeStore);

    const [problem, setProblem] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState("cpp");
    const [code, setCode] = useState("");
    const [runResult, setRunResult] = useState(null);
    const [submitResult, setSubmitResult] = useState(null);
    const [llmFeedback, setLlmFeedback] = useState(null);
    const [llmLoading, setLlmLoading] = useState(false);
    const [llmError, setLlmError] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [studyMaterial, setStudyMaterial] = useState([]);

    const editorRef = useRef(null);
    const lastSavedCode = useRef("");

    // Debounced save to Redux store
    const debouncedSave = useCallback(
        debounce((pid, language, newCode) => {
            if (newCode !== lastSavedCode.current) {
                dispatch(saveCode({ problemId: pid, language, code: newCode }));
                lastSavedCode.current = newCode;
            }
        }, 2000),
        [dispatch]
    );

    // Cleanup debounced save on unmount
    useEffect(() => {
        return () => debouncedSave.cancel();
    }, [debouncedSave]);

    // Reset states when problem changes
    useEffect(() => {
        setSelectedLanguage("cpp");
        setRunResult(null);
        setSubmitResult(null);
        setLlmFeedback(null);
        setLlmError(false);
    }, [problemId]);

    // Fetch problem data
    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const data = await problemService.fetchProblemById(problemId);
                const savedCode = codeStore[problemId]?.[selectedLanguage];
                const initialCodeObj = data.startCode?.find(
                    (sc) => sc.language === langMap[selectedLanguage]
                );

                if (!initialCodeObj) {
                    throw new Error(`Initial code not found for language: ${selectedLanguage}`);
                }

                const newCode = savedCode || initialCodeObj.initialCode;
                setProblem(data);
                setCode(newCode);
                lastSavedCode.current = newCode;

                if (data.studyMaterial) {
                    setStudyMaterial([
                        {
                            url: data.studyMaterial,
                            title: "Study Material",
                            description: "Resource related to this problem",
                        },
                    ]);
                }
            } catch (error) {
                console.error("Error fetching problem:", error);
            }
        };

        fetchProblem();
    }, [problemId, codeStore, selectedLanguage]);

    const handleEditorChange = useCallback(
        (value) => {
            const newCode = value || "";
            setCode(newCode);
            debouncedSave(problemId, selectedLanguage, newCode);
        },
        [problemId, selectedLanguage, debouncedSave]
    );

    const handleEditorDidMount = useCallback((editor, monaco) => {
        editorRef.current = editor;
        monaco.editor.defineTheme("custom-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [],
            colors: { "editor.background": "#181C1F" },
        });
        monaco.editor.setTheme("custom-dark");
    }, []);

    const handleLanguageChange = useCallback(
        (language) => {
            // Save current code before switching
            dispatch(saveCode({ problemId, language: selectedLanguage, code }));

            const savedCode = codeStore[problemId]?.[language];
            if (savedCode) {
                setCode(savedCode);
                lastSavedCode.current = savedCode;
            } else if (problem) {
                const initialCodeObj = problem.startCode?.find(
                    (sc) => sc.language === langMap[language]
                );
                if (initialCodeObj) {
                    setCode(initialCodeObj.initialCode);
                    lastSavedCode.current = initialCodeObj.initialCode;
                } else {
                    setCode("");
                    lastSavedCode.current = "";
                }
            }

            setSelectedLanguage(language);
        },
        [dispatch, problemId, selectedLanguage, code, codeStore, problem]
    );

    const handleSubmissionResult = useCallback(
        (result) => {
            if (result.status === "accepted" && problem) {
                const solvedProblems = JSON.parse(localStorage.getItem("solvedProblems")) || [];
                solvedProblems.push({
                    id: problemId,
                    date: new Date().toISOString().split("T")[0],
                    difficulty: problem.difficulty,
                    tags: problem.tags || "",
                    title: problem.title,
                });
                localStorage.setItem("solvedProblems", JSON.stringify(solvedProblems));
                window.dispatchEvent(new CustomEvent("problemSolved"));
            }
        },
        [problem, problemId]
    );

    const handleRun = useCallback(async () => {
        setIsRunning(true);
        setRunResult(null);
        try {
            const data = await problemService.runCode(problemId, code, selectedLanguage);
            setRunResult(data);
        } catch (error) {
            console.error("Error running code:", error);
            setRunResult({ success: false, error: "Internal server error" });
        } finally {
            setIsRunning(false);
        }
    }, [problemId, code, selectedLanguage]);

    const handleSubmitCode = useCallback(async () => {
        setIsSubmitting(true);
        setSubmitResult(null);
        setLlmFeedback(null);
        setLlmError(false);

        try {
            const data = await problemService.submitCode(problemId, code, selectedLanguage);
            setSubmitResult(data);

            if (data.accepted) {
                handleSubmissionResult({ status: "accepted" });

                // Try LLM feedback (non-blocking)
                setLlmLoading(true);
                try {
                    const llmData = await problemService.getAIAnalysis(code, selectedLanguage);
                    setLlmFeedback(llmData);
                } catch {
                    setLlmError(true);
                } finally {
                    setLlmLoading(false);
                }
            }
        } catch (error) {
            console.error("Error:", error);
            setSubmitResult({ accepted: false, error: "Submission failed" });
        } finally {
            setIsSubmitting(false);
        }
    }, [problemId, code, selectedLanguage, handleSubmissionResult]);

    // Save code before navigating to another problem
    const saveAndNavigate = useCallback(
        (targetProblemId) => {
            dispatch(saveCode({ problemId, language: selectedLanguage, code }));
            navigate(`/problem/${targetProblemId}`);
        },
        [dispatch, problemId, selectedLanguage, code, navigate]
    );

    return {
        problem,
        selectedLanguage,
        code,
        runResult,
        submitResult,
        llmFeedback,
        llmLoading,
        llmError,
        isRunning,
        isSubmitting,
        studyMaterial,
        editorRef,
        handleEditorChange,
        handleEditorDidMount,
        handleLanguageChange,
        handleRun,
        handleSubmitCode,
        saveAndNavigate,
    };
};

export default useCodeEditor;
