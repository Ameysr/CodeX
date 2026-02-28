import { NavLink, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../store/slices/authSlice";
import ProfileAvatar from "./ProfileAvatar";

/**
 * Shared top navigation bar used across authenticated pages
 */
const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate("/login");
    };

    return (
        <nav className="flex justify-between items-center p-4 border-b border-gray-700 bg-[#131516]">
            <NavLink to="/" className="text-3xl font-bold text-white">
                CodeX
            </NavLink>

            <div className="flex items-center gap-4">
                <NavLink
                    to="/home"
                    className="px-4 py-2 rounded-lg font-medium text-white text-x transition-all duration-200 hover:scale-105"
                >
                    Problems
                </NavLink>

                <NavLink
                    to="/interview"
                    className="px-4 py-2 rounded-lg font-medium text-white text-x transition-all duration-200 hover:scale-105"
                >
                    Virtual Interview
                </NavLink>

                <NavLink
                    to="/resume"
                    className="px-4 py-2 rounded-lg font-medium text-white text-x transition-all duration-200 hover:scale-105"
                >
                    Resume Building
                </NavLink>

                <NavLink
                    to="/dashboard"
                    className="px-4 py-2 rounded-lg font-medium text-white text-x transition-all duration-200 hover:scale-105"
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/promote"
                    className="px-4 py-2 rounded-lg font-medium text-white text-x transition-all duration-200 hover:scale-105"
                >
                    Promote
                </NavLink>

                {/* User Dropdown */}
                {user && (
                    <div className="relative group">
                        <div
                            tabIndex={0}
                            className="px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-gray-600/50 transition-all duration-200 flex items-center space-x-2"
                            style={{ color: "oklch(0.8 0 0)" }}
                        >
                            <ProfileAvatar user={user} size="w-8 h-8" className="mr-2" />
                            <span>{user?.firstName || "User"} ▾</span>
                        </div>
                        <ul
                            className="absolute right-0 mt-2 w-48 py-2 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
                            style={{
                                backgroundColor: "#131516",
                                border: "0.1px solid oklch(1 0 0 / 0.3)",
                            }}
                        >
                            <li>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-600/50 transition-colors"
                                    style={{ color: "oklch(0.8 0 0)" }}
                                >
                                    Logout
                                </button>
                            </li>
                            {user?.role === "admin" && (
                                <li>
                                    <NavLink
                                        to="/admin"
                                        className="block px-4 py-2 hover:bg-gray-600/50 transition-colors"
                                        style={{ color: "oklch(0.8 0 0)" }}
                                    >
                                        Admin
                                    </NavLink>
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
