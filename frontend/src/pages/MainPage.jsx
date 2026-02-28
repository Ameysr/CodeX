import { useSelector } from "react-redux";

// Hooks
import useBlogs from "../hooks/useBlogs";

// Components
import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";
import BlogFeed from "../components/main/BlogFeed";
import BlogEditor from "../components/main/BlogEditor";
import PromoSidebar from "../components/main/PromoSidebar";

const MainPage = () => {
  const { user } = useSelector((state) => state.auth);

  const {
    blogs,
    filteredBlogs,
    blogLoading,
    showEditor,
    setShowEditor,
    newBlog,
    handleBlogChange,
    commentInputs,
    handleCommentChange,
    showComments,
    toggleCommentSection,
    searchTerm,
    setSearchTerm,
    activeFilter,
    setActiveFilter,
    createBlogPost,
    addCommentToBlog,
    toggleLikeBlog,
    hasLiked,
  } = useBlogs(user?._id);

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row">
        <BlogFeed
          blogs={blogs}
          filteredBlogs={filteredBlogs}
          blogLoading={blogLoading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          user={user}
          hasLiked={hasLiked}
          showComments={showComments}
          commentInputs={commentInputs}
          onToggleLike={toggleLikeBlog}
          onToggleComments={toggleCommentSection}
          onCommentChange={handleCommentChange}
          onAddComment={addCommentToBlog}
        />

        <PromoSidebar />
      </div>

      {/* Floating Create Blog Button */}
      <button
        onClick={() => setShowEditor(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-110 z-50 group"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 mx-auto group-hover:rotate-90 transition-transform duration-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      <BlogEditor
        show={showEditor}
        onClose={() => setShowEditor(false)}
        newBlog={newBlog}
        onBlogChange={handleBlogChange}
        onPublish={createBlogPost}
      />

      <style>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #6b7280; }
        * { scrollbar-width: thin; scrollbar-color: #4b5563 transparent; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>

      <Footer />
    </div>
  );
};

export default MainPage;