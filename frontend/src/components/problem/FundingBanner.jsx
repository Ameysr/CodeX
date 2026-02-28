import { useState } from "react";
import { X } from "lucide-react";

/**
 * Blue funding banner that appears at the top of ProblemPage
 */
const FundingBanner = () => {
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    return (
        <div
            className="text-white px-6 py-2 flex items-center justify-between relative shadow-lg z-[60]"
            style={{ backgroundColor: "#4C99EF" }}
        >
            <div className="flex-1 flex items-center justify-center font-medium text-sm md:text-base">
                <span className="flex items-center gap-2">
                    <span>
                        📢 The free tier of the code execution judge0 api is finished fund
                        me to run your code
                    </span>
                </span>
            </div>
            <button
                onClick={() => setVisible(false)}
                className="text-white/80 hover:text-white p-1.5 rounded-full transition-colors absolute right-4"
            >
                <X size={18} />
            </button>
        </div>
    );
};

export default FundingBanner;
