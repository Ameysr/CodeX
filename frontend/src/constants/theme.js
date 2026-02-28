// Shared theme constants used across the app
export const COLORS = {
    bgPrimary: "#181C1F",
    bgSecondary: "#131516",
    bgDark: "#0A0A0A",
    borderLight: "oklch(1 0 0 / 0.3)",
    borderGray: "#374151",
    accentBlue: "#1D4ED8",
    accentBlueBright: "#4C99EF",
};

export const scrollbarStyle = {
    scrollbarWidth: "thin",
    scrollbarColor: "#374151 transparent",
};

export const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
        case "easy": return "text-green-500";
        case "medium": return "text-yellow-500";
        case "hard": return "text-red-500";
        default: return "text-gray-500";
    }
};
