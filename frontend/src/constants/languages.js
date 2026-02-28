export const langMap = {
    cpp: "C++",
    java: "Java",
    javascript: "JavaScript",
};

export const SUPPORTED_LANGUAGES = ["cpp", "java", "javascript"];

export const getLanguageLabel = (lang) => {
    switch (lang) {
        case "cpp": return "C++";
        case "javascript": return "JavaScript";
        case "java": return "Java";
        default: return lang;
    }
};

export const getMonacoLanguage = (lang) => {
    switch (lang) {
        case "javascript": return "javascript";
        case "java": return "java";
        case "cpp": return "cpp";
        default: return "javascript";
    }
};
