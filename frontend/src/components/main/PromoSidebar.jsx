import { useState, useEffect } from "react";
import PromoItem from "./PromoItem";
import * as promoService from "../../services/promoService";

/**
 * Right sidebar showing featured promotions
 */
const PromoSidebar = () => {
    const [promotions, setPromotions] = useState({
        promos: [],
        totalActivePromos: 0,
        availableSlots: 3,
        maxSlots: 3,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPromos = async () => {
            try {
                setLoading(true);
                const data = await promoService.fetchActivePromos();
                setPromotions(data);
            } catch (error) {
                console.error("Failed to fetch promotions:", error);
                setPromotions({
                    promos: [],
                    totalActivePromos: 0,
                    availableSlots: 3,
                    maxSlots: 3,
                });
            } finally {
                setLoading(false);
            }
        };
        loadPromos();
    }, []);

    return (
        <div className="w-full md:w-1/3">
            <div
                className="rounded-xl shadow-2xl top-4 backdrop-blur-sm border border-gray-600/40 overflow-hidden flex flex-col"
                style={{
                    background:
                        "linear-gradient(145deg, #131516 0%, #1a1d1f 50%, #131516 100%)",
                    boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.4)",
                }}
            >
                {/* Header */}
                <div className="backdrop-blur-sm p-6 rounded-t-xl border-b border-gray-600/40">
                    <div className="flex items-center justify-center space-x-3 mb-2">
                        <h2 className="text-xl font-bold text-blue-400">
                            Featured Courses
                        </h2>
                    </div>
                </div>

                <div className="p-4 flex-1">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((index) => (
                                <div
                                    key={index}
                                    className="h-40 rounded-xl bg-gradient-to-br from-gray-700/30 to-gray-800/30 animate-pulse backdrop-blur-sm"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {promotions.promos.map((promo) => (
                                <div
                                    key={promo._id}
                                    className="transform transition-all duration-300"
                                >
                                    <PromoItem promo={promo} />
                                </div>
                            ))}

                            {/* Placeholder slots */}
                            {Array.from(
                                { length: promotions.availableSlots },
                                (_, index) => (
                                    <div
                                        key={`placeholder-${index}`}
                                        className="transform transition-all duration-300"
                                    />
                                )
                            )}

                            {/* Empty state */}
                            {promotions.totalActivePromos === 0 &&
                                promotions.availableSlots === 0 && (
                                    <div className="text-center py-8">
                                        <div className="mb-4">
                                            <svg
                                                className="w-16 h-16 text-gray-600 mx-auto"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1}
                                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                                />
                                            </svg>
                                        </div>
                                        <p className="text-gray-400 font-medium mb-1">
                                            No promotions available
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            Check back later for new courses!
                                        </p>
                                    </div>
                                )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PromoSidebar;
