import { useState, useEffect, useCallback } from "react";
import * as problemService from "../services/problemService";

/**
 * Custom hook for problem list pagination and navigation
 */
const useProblems = (problemsPerPage = 7) => {
    const [problems, setProblems] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProblems, setTotalProblems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [sidebarProblems, setSidebarProblems] = useState([]);

    // Fetch paginated problems
    const fetchProblemsPage = useCallback(async () => {
        try {
            setLoading(true);
            const data = await problemService.fetchProblems(currentPage, problemsPerPage);

            if (data && Array.isArray(data.problems)) {
                setProblems(data.problems);
                setTotalPages(data.totalPages);
                setTotalProblems(data.totalProblems);
            } else {
                setProblems([]);
            }
        } catch (error) {
            console.error("Error fetching problems:", error);
            setProblems([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, problemsPerPage]);

    useEffect(() => {
        fetchProblemsPage();
    }, [fetchProblemsPage]);

    // Fetch all problems for sidebar
    const fetchAllForSidebar = useCallback(async () => {
        if (sidebarProblems.length > 0) return;
        try {
            const data = await problemService.fetchProblems(1, 1000);
            if (data && Array.isArray(data.problems)) {
                setSidebarProblems(data.problems);
            }
        } catch (error) {
            console.error("Error fetching sidebar problems:", error);
        }
    }, [sidebarProblems.length]);

    return {
        problems,
        currentPage,
        setCurrentPage,
        totalPages,
        totalProblems,
        loading,
        sidebarProblems,
        fetchAllForSidebar,
    };
};

export default useProblems;
