import { useState, useEffect, useRef, useCallback } from "react";
import { debounce } from "lodash";
import Editor from "@monaco-editor/react";
import { useParams, Link, useNavigate } from "react-router";
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from "../components/SubmissionHistory";
import ChatAi from "../components/ChatAi";
import Editorial from "../components/Editorial";
import { Clock, Bookmark, ArrowLeft, ArrowRight, X, Menu } from "lucide-react";
import Split from "react-split";
import { BeatLoader } from 'react-spinners';
import { useSelector, useDispatch } from 'react-redux';
import { saveCode } from "../codeSlice";

const langMap = {
  cpp: "C++",
  java: "Java",
  javascript: "JavaScript",
};

const ProblemPage = () => {
  const dispatch = useDispatch();
  const codeStore = useSelector(state => state.code.codeStore);
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProblems, setTotalProblems] = useState(0);
  const problemsPerPage = 7;
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [problemLoading, setProblemLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState("description");
  const [activeRightTab, setActiveRightTab] = useState("code");
  const [bookmarked, setBookmarked] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [llmFeedback, setLlmFeedback] = useState(null);
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmError, setLlmError] = useState(false); // New state for LLM errors
  const [studyMaterial, setStudyMaterial] = useState([]); 
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProblemList, setShowProblemList] = useState(false);
  const [sidebarProblems, setSidebarProblems] = useState([]);
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState("");

  const editorRef = useRef(null);
  const lastSavedCode = useRef(""); // Track last saved code to prevent unnecessary saves
  let { problemId } = useParams();

  // Helper function to extract YouTube ID
  function getYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  // Optimized debounced save function with duplicate check
  const debouncedSave = useCallback(
    debounce((problemId, language, code) => {
      // Only save if code has actually changed
      if (code !== lastSavedCode.current) {
        dispatch(saveCode({ problemId, language, code }));
        lastSavedCode.current = code;
      }
    }, 2000), // Increased debounce time to 2 seconds for better performance
    [dispatch]
  );

  useEffect(() => {
    return () => {
      debouncedSave.cancel(); // Cancel any pending saves on unmount
    };
  }, [debouncedSave]);

  useEffect(() => {
    setTimerActive(true);
  }, []);

  useEffect(() => {
    let interval;

    if (timerActive) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [timerActive]);

  // Reset states when problem changes
  useEffect(() => {
    setSelectedLanguage("cpp");
    setActiveRightTab("code");
    setRunResult(null);
    setSubmitResult(null);
    setLlmFeedback(null);
    setLlmError(false); // Reset LLM error state
  }, [problemId]);

  // Fetch problems with pagination
  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/problem/getAllProblem', {
        params: {
          page: currentPage,
          limit: problemsPerPage,
        }
      });
      
      // Ensure response has the expected structure
      if (response.data && Array.isArray(response.data.problems)) {
        setProblems(response.data.problems);
        setTotalPages(response.data.totalPages);
        setTotalProblems(response.data.totalProblems);
      } else {
        console.error("Unexpected response format:", response);
        setProblems([]);
      }
    } catch (error) {
      console.error('Error fetching problems:', error);
      setProblems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [currentPage]);

  useEffect(() => {
    if (problemId && problems.length > 0) {
      const currentIndex = problems.findIndex(p => p._id === problemId);
      if (currentIndex !== -1) {
        // Show surrounding problems (3 before, 3 after)
        const start = Math.max(0, currentIndex - 3);
        const end = Math.min(problems.length, currentIndex + 4);
        setFilteredProblems(problems.slice(start, end));
      } else {
        setFilteredProblems(problems.slice(0, 7));
      }
    } else {
      setFilteredProblems(problems);
    }
  }, [problems, problemId]);

  useEffect(() => {
    const fetchAllProblemsForSidebar = async () => {
      try {
        const response = await axiosClient.get('/problem/getAllProblem', {
          params: {
            page: 1,
            limit: 1000 // Fetch all problems
          }
        });
        
        if (response.data && Array.isArray(response.data.problems)) {
          setSidebarProblems(response.data.problems);
        }
      } catch (error) {
        console.error('Error fetching sidebar problems:', error);
      }
    };

    if (showProblemList && sidebarProblems.length === 0) {
      fetchAllProblemsForSidebar();
    }
  }, [showProblemList]);

  const toggleTimer = () => {
    setTimerActive(!timerActive);
  };

  const toggleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  const toggleProblemList = () => {
    setShowProblemList(!showProblemList);
  };

  const goToProblem = (targetProblemId) => {
    // Save current code immediately
    dispatch(saveCode({
      problemId,
      language: selectedLanguage,
      code: code
    }));

    // Reset timer
    setTimer(0);
    setTimerActive(false);
    setTimeout(() => {
      setTimerActive(true);
    }, 0);

    // Navigate to the problem
    navigate(`/problem/${targetProblemId}`);
    setShowProblemList(false);
  };

  const goToNextProblem = () => {
    const currentIndex = problems.findIndex(p => p._id === problemId);
    if (currentIndex < problems.length - 1) {
      goToProblem(problems[currentIndex + 1]._id);
    } else if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevProblem = () => {
    const currentIndex = problems.findIndex(p => p._id === problemId);
    if (currentIndex > 0) {
      goToProblem(problems[currentIndex - 1]._id);
    } else if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        // setProblemLoading(true);
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        
        // Check if we have saved code for this problem and language
        const savedCode = codeStore[problemId]?.[selectedLanguage];
        const initialCodeObj = response.data.startCode?.find(
          sc => sc.language === langMap[selectedLanguage]
        );
        
        if (!initialCodeObj) {
          throw new Error(`Initial code not found for language: ${selectedLanguage}`);
        }
        
        const newCode = savedCode || initialCodeObj.initialCode;
        
        setProblem(response.data);
        setCode(newCode);
        lastSavedCode.current = newCode; // Update the reference
        
        if (response.data.studyMaterial) {
          setStudyMaterial([{
            url: response.data.studyMaterial,
            title: 'Study Material',
            description: 'Resource related to this problem'
          }]);
        }
        
      } catch (error) {
        console.error("Error fetching problem:", error);
      } finally {
        // setProblemLoading(false);
      }
    };

    fetchProblem();
  }, [problemId, codeStore, selectedLanguage]);

  const handleEditorChange = (value) => {
    const newCode = value || "";
    setCode(newCode);
    
    // Use debounced save instead of immediate dispatch
    debouncedSave(problemId, selectedLanguage, newCode);
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#181C1F',
      },
    });

    monaco.editor.setTheme('custom-dark');
  };

  const handleLanguageChange = (language) => {
    // Save current code before switching languages
    dispatch(saveCode({
      problemId,
      language: selectedLanguage,
      code: code
    }));
    
    // Check if we have saved code for the new language
    const savedCode = codeStore[problemId]?.[language];
    
    if (savedCode) {
      const newCode = savedCode;
      setCode(newCode);
      lastSavedCode.current = newCode;
    } else if (problem) {
      const initialCodeObj = problem.startCode?.find(
        sc => sc.language === langMap[language]
      );
      
      if (initialCodeObj) {
        const newCode = initialCodeObj.initialCode;
        setCode(newCode);
        lastSavedCode.current = newCode;
      } else {
        console.error(`Initial code not found for language: ${language}`);
        setCode("");
        lastSavedCode.current = "";
      }
    }
    
    setSelectedLanguage(language);
  };

const handleRun = async () => {
  setIsRunning(true);
  setRunResult(null);

  try {
    const response = await axiosClient.post(`/submission/run/${problemId}`, {
      code,
      language: selectedLanguage,
    });

    setRunResult(response.data);
  } catch (error) {
    console.error("Error running code:", error);
    setRunResult({
      success: false,
      error: "Internal server error",
    });
  } finally {
    setIsRunning(false);
  }
};

  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    setSubmitResult(null);
    setLlmFeedback(null);
    setLlmError(false);

    try {
      const submitResponse = await axiosClient.post(`/submission/submit/${problemId}`, {
        code: code,
        language: selectedLanguage,
      });

      setSubmitResult(submitResponse.data);
      setActiveRightTab("result");
      
      if (submitResponse.data.accepted) {
        handleSubmissionResult({
          status: 'accepted'
        });
        
        // Try to get LLM feedback, but don't let it fail the submission
        setLlmLoading(true);
        try {
          const llmResponse = await axiosClient.post('/analysis/ai', {
            code: code,
            language: selectedLanguage
          });
          setLlmFeedback(llmResponse.data);
        } catch (llmError) {
          console.error("LLM Analysis failed:", llmError);
          setLlmError(true);
          // Don't throw here - we still want to show the submission result
        } finally {
          setLlmLoading(false);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setSubmitResult({
        accepted: false,
        error: "Submission failed"
      });
      setActiveRightTab("result");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case "javascript":
        return "javascript";
      case "java":
        return "java";
      case "cpp":
        return "cpp";
      default:
        return "javascript";
    }
  };

  const handleSubmissionResult = (result) => {
    if (result.status === 'accepted' && problem) {
      const solvedProblems = JSON.parse(localStorage.getItem('solvedProblems')) || [];
      solvedProblems.push({
        id: problemId,
        date: new Date().toISOString().split('T')[0],
        difficulty: problem.difficulty,
        tags: problem.tags || '',
        title: problem.title
      });
      localStorage.setItem('solvedProblems', JSON.stringify(solvedProblems));
      window.dispatchEvent(new CustomEvent('problemSolved'));
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "text-green-500";
      case "medium":
        return "text-yellow-500";
      case "hard":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!problem) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const currentIndex = problems.findIndex(p => p._id === problemId);

  // Filter sidebar problems for frontend search
  const filteredSidebarProblems = sidebarProblems.filter(p => 
    p.title.toLowerCase().includes(sidebarSearchQuery.toLowerCase()) || 
    (p.tags && p.tags.toLowerCase().includes(sidebarSearchQuery.toLowerCase()))
  );

  // Define scrollbar style
  const scrollbarStyle = { 
    scrollbarWidth: 'thin', 
    scrollbarColor: '#374151 transparent' 
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{backgroundColor:"#181C1F"}}>
      {/* Problem List Sidebar with Transition Effects */}
      <div 
        className={`fixed inset-0 z-50 flex transition-opacity duration-300 ease-in-out ${
          showProblemList ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            showProblemList ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={toggleProblemList}
        ></div>
        
        <div 
          className={`relative z-50 w-80 bg-gray-900 shadow-xl overflow-y-auto transform transition-transform duration-300 ease-in-out ${
            showProblemList ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={scrollbarStyle}
        >
          <div className="p-4 border-b border-gray-700 flex justify-between items-center" style={{ backgroundColor: "#181C1F" }}>
            <h2 className="text-xl font-bold text-blue-400">Problem List</h2>
            <button 
              className="text-gray-400 hover:text-white transition-colors duration-200"
              onClick={toggleProblemList}
            >
              <X size={24} />
            </button>
          </div>
            
            <div className="p-4" style={{ backgroundColor: "#181C1F" }}>
              <input
                type="text"
                placeholder="Search problems..."
                className="w-full p-2 mb-4 bg-gray-800 text-white rounded border border-gray-700"
                value={sidebarSearchQuery}
                onChange={(e) => setSidebarSearchQuery(e.target.value)}
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
                  {filteredSidebarProblems.map((p) => (
                    <button
                      key={p._id}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        p._id === problemId 
                          ? "bg-blue-600 text-white shadow-lg" 
                          : "text-gray-300 hover:bg-gray-800"
                      }`}
                      onClick={() => goToProblem(p._id)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{p.title}</span>
                        <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(p.difficulty)}`}>
                          {p.difficulty}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1 truncate">
                        {p.tags || 'No tags'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      {/* TOP BAR */}
      <div 
        className="w-full flex justify-between items-center px-6 py-4 shadow-lg" 
        style={{ 
          backgroundColor: "#181C1F",
          borderBottom:"0.1px solid oklch(1 0 0 / 0.3)"
        }}
      >
        {problem && (
          <div className="flex items-center gap-3">
            <button
              className="text-gray-400 hover:text-white"
              onClick={toggleProblemList}
            >
              <Menu size={24} />
            </button>
            <Link to="/" className="text-2xl tracking-widest font-bold text-blue-400 hover:text-blue-300 transition-colors duration-200">
              Codex
            </Link>
          </div>
        )}

        <div className="flex gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all duration-200 border"
            style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}
            onClick={toggleTimer}
          >
            <Clock size={16} />
            <span
              className={`ml-1 inline-block transition-all duration-300 ${
                timerActive ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
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
            onClick={goToPrevProblem}
            disabled={!problems.length || (currentIndex <= 0 && currentPage <= 1)}
          >
            <ArrowLeft size={16} />
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all duration-200 border disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}
            onClick={goToNextProblem}
            disabled={!problems.length || (currentIndex >= problems.length - 1 && currentPage >= totalPages)}
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* RESIZABLE SPLIT BELOW */}
      <Split
        className="flex flex-1 overflow-hidden"
        sizes={[50, 50]}
        minSize={200}
        expandToMin={false}
        gutterSize={4}
        gutterAlign="center"
        snapOffset={30}
        dragInterval={2}
        direction="horizontal"
        gutter={(index, direction) => {
          const gutter = document.createElement("div");

          gutter.className = `${
            direction === "horizontal" ? "cursor-col-resize" : "cursor-row-resize"
          }`;
          gutter.style.backgroundColor = "#374151";
          gutter.style.transition = "all 0.2s ease";
          gutter.style.cursor = direction === "horizontal" ? "col-resize" : "row-resize";

          if (direction === "horizontal") {
            gutter.style.width = "4px";
            gutter.style.height = "40px";
            gutter.style.margin = "auto";
          } else {
            gutter.style.height = "4px";
            gutter.style.width = "40px";
            gutter.style.margin = "auto";
          }

          gutter.onmouseover = () => {
            gutter.style.backgroundColor = "#1D4ED8";
            if (direction === "horizontal") {
              gutter.style.height = "100%";
            } else {
              gutter.style.width = "100%";
            }
          };

          gutter.onmouseout = () => {
            gutter.style.backgroundColor = "#374151";
            if (direction === "horizontal") {
              gutter.style.height = "40px";
            } else {
              gutter.style.width = "40px";
            }
          };

          return gutter;
        }}
      >
        {/* LEFT PANEL */}
        <div 
          style={{ 
            backgroundColor: "#181C1F",
            border: "0.1px solid oklch(1 0 0 / 0.3)"
          }} 
          className="flex flex-col mr-1 overflow-hidden rounded-l-lg"
        >
          <div 
            className="flex gap-2 p-4 overflow-x-auto whitespace-nowrap items-center shadow-sm" 
            style={{
              backgroundColor:"#181C1F", 
              borderBottom: "0.1px solid oklch(1 0 0 / 0.3)"
            }}
          >
            {["description", "editorial", "solutions", "submissions", "chatAI"].map((tab) => (
              <button
                key={tab}
                className={`text-sm px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeLeftTab === tab 
                    ? "bg-blue-600 text-white shadow-lg transform scale-105" 
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
                onClick={() => setActiveLeftTab(tab)}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
          <div 
            className="flex-1 overflow-y-auto p-6" 
            style={{ 
              ...scrollbarStyle,
              color: "oklch(0.8 0 0)" 
            }}
          >
            {problem && (
              <>
                {activeLeftTab === "description" && (
                  <div className="space-y-6">
                    <div className="border-b border-gray-700 pb-4">
                      <h1 className="text-3xl font-bold text-blue-400 mb-2">{problem.title}</h1>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="px-2 py-1 bg-gray-800 rounded-md">Problem</span>
                      </div>
                    </div>
                    <div className="prose max-w-none">
                      <p className="text-gray-300 leading-relaxed text-lg">{problem.description}</p>
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
                            <span className="text-sm font-medium text-blue-400 mb-2 block">Input:</span>
                            <pre className="p-4 text-sm mt-1 overflow-x-auto rounded-lg border" style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}>
                              <code className="text-gray-300">{testCase.input}</code>
                            </pre>
                          </div>
                          
                          <div className="mb-4">
                            <span className="text-sm font-medium text-green-400 mb-2 block">Expected Output:</span>
                            <pre className="p-4 text-sm mt-1 overflow-x-auto rounded-lg border" style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}>
                              <code className="text-gray-300">{testCase.output}</code>
                            </pre>
                          </div>
                          
                          {testCase.explanation && (
                            <div>
                              <span className="text-sm font-medium text-purple-400 mb-2 block">Explanation:</span>
                              <pre className="p-4 text-sm mt-1 overflow-x-auto rounded-lg border" style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}>
                                <code className="text-gray-300">{testCase.explanation}</code>
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeLeftTab === "editorial" && (
                  <div className="space-y-6">
                    <div className="border-b border-gray-700 pb-4">
                      <h2 className="text-2xl font-bold text-purple-400 mb-2">Comming soon</h2>
                    </div>
                  </div>
                )}
                {activeLeftTab === 'solutions' && (
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
                          <div className="px-6 py-4 border-b" style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}>
                            <h3 className="font-semibold text-white flex items-center gap-2">
                              <span className="text-blue-400">💻</span>
                              {problem?.title} - {solution?.language}
                            </h3>
                          </div>
                          <div className="p-6">
                            <pre className="p-4 rounded-lg text-sm overflow-x-auto border" style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}>
                              <code className="text-gray-300">{solution?.completeCode}</code>
                            </pre>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-xl" style={{ borderColor: "#374151" }}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <p>Solutions will be available after you solve the problem</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeLeftTab === 'submissions' && (
                  <div className="space-y-6">
                    <div className="border-b border-gray-700 pb-4">
                      <h2 className="text-2xl font-bold text-orange-400 mb-2">My Submissions</h2>
                      <p className="text-gray-400">Your submission history</p>
                    </div>
                    <div className="text-gray-300">
                      <SubmissionHistory problemId={problemId} />
                    </div>
                  </div>
                )}
                {activeLeftTab === 'chatAI' && (
                  <div className="space-y-6">
                    <div className="border-b border-gray-700 pb-4">
                      <h2 className="text-2xl font-bold text-cyan-400 mb-2 flex items-center gap-2">
                        <span>🤖</span>
                        CHAT with AI
                      </h2>
                      <p className="text-gray-400">Get help and hints from AI assistant</p>
                    </div>
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                        <ChatAi problem={problem}></ChatAi>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div 
          style={{ 
            backgroundColor: "#181C1F",
            border: "0.1px solid oklch(1 0 0 / 0.3)"
          }} 
          className="flex flex-col ml-1 overflow-hidden rounded-r-lg"
        >
          <div 
            className="flex gap-2 p-4 overflow-x-auto whitespace-nowrap items-center shadow-sm" 
            style={{
              backgroundColor:"#181C1F",
              borderBottom: "0.1px solid oklch(1 0 0 / 0.3)"
            }}
          >
            {/* Language Selection Tabs */}
            <div className="flex gap-1 mr-8">
              {["cpp", "java", "javascript"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-4 py-2 font-medium text-sm rounded-lg transition-all duration-200 ${
                    selectedLanguage === lang
                      ? "text-blue-400 bg-blue-500/20 border-b-2 border-blue-400"
                      : "text-gray-500 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  {lang === "cpp" 
                    ? "C++" 
                    : lang === "javascript" 
                      ? "JavaScript" 
                      : "Java"}
                </button>
              ))}
            </div>
            
            {/* Tabs */}
            {["code", "result"].map((tab) => (
              <button
                key={tab}
                className={`text-sm px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeRightTab === tab 
                    ? "bg-blue-600 text-white shadow-lg transform scale-105" 
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
                onClick={() => setActiveRightTab(tab)}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            {activeRightTab === "code" && (
              <div className="flex flex-col h-full overflow-hidden">
                {/* Combined scroll container */}
                <div 
                  className="flex-1 overflow-y-auto" 
                  style={scrollbarStyle}
                >
                  {/* Editor */}
                  <div
                    className="mx-4 mt-4 overflow-hidden border rounded-lg shadow-lg"
                    style={{ 
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                      borderColor: "#374151",
                      backgroundColor: "#181C1F"
                    }}
                  >
                    <Editor
                      height="50vh"
                      width="100%"
                      language={getLanguageForMonaco(selectedLanguage)}
                      value={code}
                      onChange={handleEditorChange}
                      onMount={handleEditorDidMount}
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

                  {/* Run results display */}
                  {runResult && (
                    <div className={`p-6 rounded-xl border shadow-lg mx-4 my-4 ${
                      runResult.success 
                        ? 'border-green-500/30' 
                        : 'border-red-500/30'
                    }`}
                    style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}
                    >
                      <h4 className="font-bold mb-4 text-lg flex items-center gap-2">
                        {runResult.success 
                          ? <><span className="text-green-400">✅</span> Test results</>
                          : <><span className="text-red-400">❌</span> Test failed</>
                        }
                      </h4>
                      
                      {runResult.testCases?.map((tc, i) => (
                        <div 
                          key={i} 
                          className="mb-4 p-4 rounded-lg border"
                          style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}
                        >
                          <div className="flex items-center mb-3">
                            <span className={`mr-2 text-lg ${tc.status_id === 3 ? 'text-green-400' : 'text-red-400'}`}>
                              {tc.status_id === 3 ? '✓' : '✗'}
                            </span>
                            <span className="font-medium">Test Case {i+1}</span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="p-3 rounded-lg border" style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}>
                              <span className="text-blue-400 font-medium block mb-1">Input:</span> 
                              <div className="text-gray-300 font-mono text-xs break-all">{tc.stdin}</div>
                            </div>
                            <div className="p-3 rounded-lg border" style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}>
                              <span className="text-green-400 font-medium block mb-1">Expected:</span> 
                              <div className="text-gray-300 font-mono text-xs">{tc.expected_output}</div>
                            </div>
                            <div className="p-3 rounded-lg border" style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}>
                              <span className="text-purple-400 font-medium block mb-1">Output:</span> 
                              <div className="text-gray-300 font-mono text-xs">{tc.stdout || "No output"}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {runResult.success && (
                        <div className="mt-4 p-4 rounded-lg border" style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}>
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
                  )}
                    
                  {isRunning && (
                    <div className="flex justify-center my-6">
                      <BeatLoader color="#1D4ED8" size={12} />
                    </div>
                  )}
                </div>
                
                {/* Fixed buttons at bottom */}
                <div className="flex gap-3 p-4 border-t" style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}>
                  <button
                    className="flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
                    style={{ backgroundColor: "#1D4ED8", color: "white", minWidth: "100px" }}
                    onClick={handleRun}
                    disabled={isRunning}
                  >
                    {isRunning ? (
                      <span className="loading loading-spinner loading-sm mr-2"></span>
                    ) : (
                      <span className="mr-2">▶️</span>
                    )}
                    Run
                  </button>

                  <button
                    className="flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
                    style={{ backgroundColor: "#059669", color: "white", minWidth: "100px" }}
                    onClick={handleSubmitCode}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="loading loading-spinner loading-sm mr-2"></span>
                    ) : (
                      <span className="mr-2">🚀</span>
                    )}
                    Submit
                  </button>
                </div>
              </div>
            )}
            
            {activeRightTab === 'result' && (
            <div 
              className="flex-1 p-6 overflow-y-auto text-white" 
              style={scrollbarStyle}
            >
              <h3 className="font-semibold text-2xl mb-6 border-b pb-3 text-orange-400 flex items-center gap-2" style={{ borderColor: "#374151" }}>
                <span>📊</span>
                Submission Result
              </h3>
              
              {submitResult ? (
                <div className={`rounded-xl p-6 border shadow-lg ${
                  submitResult.accepted 
                    ? 'border-green-500/30' 
                    : 'border-red-500/30'
                }`}
                style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}
                >
                  {submitResult.accepted ? (
                    <div className="space-y-8">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">🎉</div>
                        <div>
                          <h4 className="font-bold text-3xl text-green-400">Accepted</h4>
                          <div className="flex flex-wrap gap-3 mt-3">
                            <div className="px-4 py-2 rounded-lg border" style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}>
                              <span className="text-gray-400">Test Cases: </span>
                              <span className="font-mono text-green-400">{submitResult.passedTestCases}/{submitResult.totalTestCases}</span>
                            </div>
                            <div className="px-4 py-2 rounded-lg border" style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}>
                              <span className="text-gray-400">Runtime: </span>
                              <span className="font-mono text-yellow-400">{submitResult.runtime}s</span>
                            </div>
                            <div className="px-4 py-2 rounded-lg border" style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}>
                              <span className="text-gray-400">Memory: </span>
                              <span className="font-mono text-cyan-400">{submitResult.memory}KB</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Complexity Analysis */}
                      <div className="mt-8">
                        <h5 className="font-bold text-xl mb-4 flex items-center gap-2 text-purple-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Solution Analysis
                        </h5>
                        
                        {llmLoading ? (
                          <div className="flex justify-center my-6">
                            <BeatLoader color="#8B5CF6" size={12} />
                          </div>
                        ) : llmError ? (
                          <div className="p-6 rounded-xl border shadow-lg" style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}>
                            <div className="text-center text-yellow-400">
                              <div className="text-2xl mb-2">⚠️</div>
                              <p className="mb-2">AI Analysis temporarily unavailable</p>
                              <p className="text-sm text-gray-400">Your solution was successfully submitted and accepted!</p>
                            </div>
                          </div>
                        ) : llmFeedback ? (
                          <div className="p-6 rounded-xl border shadow-lg" style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                              <div className="p-4 rounded-lg border" style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}>
                                <div className="text-blue-400 font-medium mb-2">⏱️ Time Complexity</div>
                                <div className="font-mono text-xl text-white">{llmFeedback.analysis.match(/Time Complexity: (.*?)(\n|$)/)?.[1] || 'N/A'}</div>
                              </div>
                              <div className="p-4 rounded-lg border" style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}>
                                <div className="text-blue-400 font-medium mb-2">💾 Space Complexity</div>
                                <div className="font-mono text-xl text-white">{llmFeedback.analysis.match(/Space Complexity: (.*?)(\n|$)/)?.[1] || 'N/A'}</div>
                              </div>
                            </div>
                            
                            {llmFeedback.analysis.includes('\n') && (
                              <div className="pt-4 border-t" style={{ borderColor: "#374151" }}>
                                <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">{llmFeedback.analysis.split('\n').slice(2).join('\n')}</div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-6 rounded-xl border text-gray-400 text-center" style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}>
                            <div className="animate-pulse">
                              <span className="text-2xl mb-2 block">🔄</span>
                              Solution analysis will appear here...
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Study Materials Section */}
                      {studyMaterial.length > 0 && (
                        <div className="mt-8">
                          <h5 className="font-bold text-xl mb-4 flex items-center gap-2 text-cyan-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                            </svg>
                            Recommended Study Materials
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {studyMaterial.map((material, index) => (
                              <a 
                                key={index} 
                                href={material.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="rounded-xl overflow-hidden border hover:border-blue-500 transition-all duration-200 block"
                                style={{ backgroundColor: "#181C1F", borderColor: "#374151" }}
                              >
                                {/* YouTube Thumbnail */}
                                {material.url.includes('youtube.com') && (
                                  <div className="relative aspect-video bg-gray-700">
                                    <img 
                                      src={`https://img.youtube.com/vi/${getYouTubeId(material.url)}/mqdefault.jpg`} 
                                      alt={material.title}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M8 5v14l11-7z" />
                                        </svg>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                <div className="p-4">
                                  <div className="flex items-start gap-3">
                                    {!material.url.includes('youtube.com') && (
                                      <span className="text-2xl mt-1">📚</span>
                                    )}
                                    <div>
                                      <h6 className="font-medium text-blue-400 hover:underline flex items-center">
                                        {material.title}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                        </svg>
                                      </h6>
                                      <p className="text-sm text-gray-300 mt-2">{material.description}</p>
                                    </div>
                                  </div>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-bold text-xl text-red-400 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {submitResult.error}
                      </h4>
                      <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: "#181C1F" }}>
                        <p className="text-gray-300">Test Cases Passed: 
                          <span className="font-mono ml-2">{submitResult.passedTestCases}/{submitResult.totalTestCases}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-xl" style={{ borderColor: "#374151" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Click "Submit" to evaluate your solution
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </Split>
    </div>
  );
};

export default ProblemPage;