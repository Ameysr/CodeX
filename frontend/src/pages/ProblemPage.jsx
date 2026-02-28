import { useState } from "react";
import { useParams } from "react-router";
import Split from "react-split";

// Hooks
import useTimer from "../hooks/useTimer";
import useProblems from "../hooks/useProblems";
import useCodeEditor from "../hooks/useCodeEditor";

// Components
import FundingBanner from "../components/problem/FundingBanner";
import ProblemSidebar from "../components/problem/ProblemSidebar";
import ProblemTopBar from "../components/problem/ProblemTopBar";
import ProblemLeftPanel from "../components/problem/ProblemLeftPanel";
import ProblemRightPanel from "../components/problem/ProblemRightPanel";

const ProblemPage = () => {
  const { problemId } = useParams();

  // Custom hooks
  const { timer, timerActive, toggleTimer } = useTimer(true);
  const {
    problems,
    currentPage,
    setCurrentPage,
    totalPages,
    sidebarProblems,
    fetchAllForSidebar,
  } = useProblems(7);

  const {
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
    handleEditorChange,
    handleEditorDidMount,
    handleLanguageChange,
    handleRun,
    handleSubmitCode,
    saveAndNavigate,
  } = useCodeEditor(problemId);

  // Local UI state
  const [bookmarked, setBookmarked] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState("description");
  const [activeRightTab, setActiveRightTab] = useState("code");
  const [showProblemList, setShowProblemList] = useState(false);

  // Problem navigation
  const currentIndex = problems.findIndex((p) => p._id === problemId);

  const toggleProblemList = () => {
    setShowProblemList((prev) => !prev);
    fetchAllForSidebar();
  };

  const goToNextProblem = () => {
    if (currentIndex < problems.length - 1) {
      saveAndNavigate(problems[currentIndex + 1]._id);
    } else if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevProblem = () => {
    if (currentIndex > 0) {
      saveAndNavigate(problems[currentIndex - 1]._id);
    } else if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSelectProblem = (targetId) => {
    saveAndNavigate(targetId);
    setShowProblemList(false);
  };

  // Loading state
  if (!problem) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  const canGoPrev = problems.length > 0 && (currentIndex > 0 || currentPage > 1);
  const canGoNext =
    problems.length > 0 &&
    (currentIndex < problems.length - 1 || currentPage < totalPages);

  // Gutter factory for react-split
  const createGutter = (index, direction) => {
    const gutter = document.createElement("div");
    gutter.className = direction === "horizontal" ? "cursor-col-resize" : "cursor-row-resize";
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
      if (direction === "horizontal") gutter.style.height = "100%";
      else gutter.style.width = "100%";
    };

    gutter.onmouseout = () => {
      gutter.style.backgroundColor = "#374151";
      if (direction === "horizontal") gutter.style.height = "40px";
      else gutter.style.width = "40px";
    };

    return gutter;
  };

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: "#181C1F" }}
    >
      <FundingBanner />

      <ProblemSidebar
        show={showProblemList}
        onClose={() => setShowProblemList(false)}
        sidebarProblems={sidebarProblems}
        currentProblemId={problemId}
        onSelectProblem={handleSelectProblem}
      />

      <ProblemTopBar
        timer={timer}
        timerActive={timerActive}
        toggleTimer={toggleTimer}
        bookmarked={bookmarked}
        toggleBookmark={() => setBookmarked(!bookmarked)}
        onToggleProblemList={toggleProblemList}
        onPrevProblem={goToPrevProblem}
        onNextProblem={goToNextProblem}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
      />

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
        gutter={createGutter}
      >
        <ProblemLeftPanel
          problem={problem}
          problemId={problemId}
          activeTab={activeLeftTab}
          onTabChange={setActiveLeftTab}
        />

        <ProblemRightPanel
          selectedLanguage={selectedLanguage}
          code={code}
          activeTab={activeRightTab}
          onTabChange={setActiveRightTab}
          onLanguageChange={handleLanguageChange}
          onEditorChange={handleEditorChange}
          onEditorMount={handleEditorDidMount}
          onRun={handleRun}
          onSubmit={handleSubmitCode}
          isRunning={isRunning}
          isSubmitting={isSubmitting}
          runResult={runResult}
          submitResult={submitResult}
          llmFeedback={llmFeedback}
          llmLoading={llmLoading}
          llmError={llmError}
          studyMaterial={studyMaterial}
        />
      </Split>
    </div>
  );
};

export default ProblemPage;