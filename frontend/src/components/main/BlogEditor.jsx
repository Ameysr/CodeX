/**
 * Modal popup for creating a new blog post
 */
const BlogEditor = ({
    show,
    onClose,
    newBlog,
    onBlogChange,
    onPublish,
}) => {
    if (!show) return null;

    return (
        <div
            className="fixed inset-0 bg-[#0A0A0A] backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4"
            onClick={onClose}
        >
            <div
                className="bg-[#0A0A0A] from-gray-800 to-gray-900 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl border border-gray-700/50 animate-slideUp"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-600/50 bg-[#0A0A0A] rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-[#0A0A0A] rounded-lg">
                            <svg
                                className="w-6 h-6 text-gray-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white">Create New Post</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white hover:bg-gray-600/50 p-2 rounded-xl transition-all duration-200 hover:rotate-90"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col space-y-4">
                    <input
                        type="text"
                        name="title"
                        placeholder="Enter your post title..."
                        className="bg-[#0A0A0A] text-white placeholder-gray-400 p-4 rounded-xl border border-gray-500/50 focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:border-gray-400/50 focus:bg-gray-500/50 transition-all duration-200 text-lg font-medium"
                        value={newBlog.title}
                        onChange={onBlogChange}
                    />

                    {/* Anonymous Toggle */}
                    <div className="flex items-center space-x-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="isAnonymous"
                                className="sr-only peer"
                                checked={newBlog.isAnonymous}
                                onChange={onBlogChange}
                            />
                            <div className="w-11 h-6 bg-gray peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                        </label>
                        <span className="text-gray-300 text-base">Post anonymously</span>
                    </div>

                    {/* Category Selector */}
                    <div className="flex items-center space-x-3">
                        <span className="text-gray-300 text-base">Category:</span>
                        <select
                            name="category"
                            className="bg-[#0A0A0A] text-white p-2 rounded-lg border border-gray-500/50 focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:border-gray-400/50 transition-all duration-200"
                            value={newBlog.category}
                            onChange={onBlogChange}
                        >
                            <option value="interview">Interview</option>
                            <option value="contest">Contest</option>
                            <option value="career">Career</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <textarea
                        name="content"
                        className="flex-1 bg-[#0A0A0A] text-white placeholder-gray-400 p-4 rounded-xl border border-gray-500/50 resize-none focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:border-gray-400/50 focus:bg-gray-500/50 transition-all duration-200 leading-relaxed"
                        placeholder="Share your thoughts, code snippets, or insights with the community..."
                        value={newBlog.content}
                        onChange={onBlogChange}
                    />
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center p-6 border-t border-gray-600/50 bg-[#0A0A0A] rounded-b-2xl">
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span>Auto-save enabled</span>
                        </div>
                        <div className="flex items-center space-x-2">
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
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <span>Markdown supported</span>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 text-gray-300 hover:text-white hover:bg-gray-600/50 rounded-xl transition-all duration-200 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onPublish}
                            className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium transform hover:scale-105 disabled:hover:scale-100"
                            disabled={!newBlog.title || !newBlog.content}
                        >
                            Publish Post
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogEditor;
