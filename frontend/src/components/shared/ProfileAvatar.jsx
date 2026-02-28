import { useState, useEffect } from "react";

/**
 * Shared profile avatar component with image fallback
 * Displays user profile picture or letter avatar
 */
const ProfileAvatar = ({
    user,
    isAnonymous = false,
    size = "w-12 h-12",
    className = "",
}) => {
    const [imageError, setImageError] = useState(false);

    // Reset image error when user changes
    useEffect(() => {
        setImageError(false);
    }, [user?.profilePicture?.url]);

    if (isAnonymous) {
        return (
            <div
                className={`${size} ${className} rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white font-semibold shadow-lg`}
            >
                A
            </div>
        );
    }

    // Handle both object format (profilePicture.url) and direct string
    const profilePic = user?.profilePicture?.url || user?.profilePicture;

    if (profilePic && !imageError) {
        return (
            <div
                className={`${size} ${className} rounded-full overflow-hidden shadow-lg border-2 border-gray-600 relative`}
            >
                <img
                    src={profilePic}
                    alt={`${user.firstName || "User"}'s profile`}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                />
            </div>
        );
    }

    // Default letter avatar
    return (
        <div
            className={`${size} ${className} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg`}
        >
            {user?.firstName?.charAt(0)?.toUpperCase() || "U"}
        </div>
    );
};

export default ProfileAvatar;
