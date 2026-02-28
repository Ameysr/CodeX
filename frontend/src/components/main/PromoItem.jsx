import { useState } from "react";
import { recordPromoClick } from "../../services/promoService";

/**
 * Individual promotion card with click tracking
 */
const PromoItem = ({ promo }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleClick = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await recordPromoClick(promo._id);
            window.open(data.targetUrl, "_blank");
        } catch (err) {
            console.error("Promo click error:", err);
            setError(err.message || "Failed to record click");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="group cursor-pointer relative rounded-xl overflow-hidden transition-all duration-300 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/40 hover:border-gray-500/60 shadow-xl hover:shadow-2xl transform hover:scale-[1.02]"
            onClick={handleClick}
        >
            {loading && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-20 rounded-xl">
                    <div className="flex flex-col items-center space-y-3">
                        <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                        <span className="text-gray-200 text-sm font-medium">
                            Loading promotion...
                        </span>
                    </div>
                </div>
            )}

            <div className="relative overflow-hidden">
                <div className="aspect-video overflow-hidden">
                    <img
                        src={promo.imageUrl}
                        alt={promo.title}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="bg-gray-800/80 backdrop-blur-sm text-white p-1.5 rounded-lg">
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-gradient-to-b from-gray-800 to-gray-900">
                <h3 className="text-sm font-semibold text-gray-200 mb-2 line-clamp-1">
                    {promo.title}
                </h3>
                <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed mb-3">
                    {promo.description}
                </p>
            </div>

            {error && (
                <div className="absolute bottom-0 left-0 right-0 text-red-300 text-xs p-2 bg-red-900/30 backdrop-blur-sm border-t border-red-700/30">
                    <div className="flex items-center space-x-1">
                        <svg
                            className="w-3 h-3 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span className="truncate">{error}</span>
                    </div>
                </div>
            )}

            {/* Subtle hover effect */}
            <div className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden">
                <div className="absolute -inset-px bg-gray-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
            </div>
        </div>
    );
};

export default PromoItem;
