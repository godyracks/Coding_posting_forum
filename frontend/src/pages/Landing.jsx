import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      {/* Hero Section */}
      <div className="w-full max-w-4xl px-6 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
          Streamline Collaboration with Channels
        </h1>
        <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
          Organize, discuss, and resolve programming issues in structured channels with screenshots and real-time feedback.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/register"
            className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-md shadow-md hover:bg-gray-200 transition-colors duration-300 text-sm"
          >
            Register
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 bg-blue-700 text-white font-semibold rounded-md shadow-md hover:bg-blue-800 transition-colors duration-300 text-sm"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full max-w-5xl px-6 py-12 bg-white text-gray-900">
        <h2 className="text-3xl font-semibold mb-8 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center">
            <span className="text-3xl mb-4">📚</span>
            <h3 className="text-xl font-bold text-gray-800">Join or Create Channels</h3>
            <p className="text-gray-600 mt-2 text-sm text-center">
              Engage in discussions within dedicated programming channels.
            </p>
          </div>
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center">
            <span className="text-3xl mb-4">📸</span>
            <h3 className="text-xl font-bold text-gray-800">Upload Screenshots</h3>
            <p className="text-gray-600 mt-2 text-sm text-center">
              Share visuals and details to clarify issues.
            </p>
          </div>
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center">
            <span className="text-3xl mb-4">🤝</span>
            <h3 className="text-xl font-bold text-gray-800">Collaborate & Resolve</h3>
            <p className="text-gray-600 mt-2 text-sm text-center">
              Work with peers to troubleshoot and solve problems.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}