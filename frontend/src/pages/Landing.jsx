import { Link } from "react-router-dom";
import { BookOpen, Camera, Users } from "lucide-react"; // Lucide icons

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
      {/* Hero Section */}
      <div className="w-full max-w-5xl px-6 py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight drop-shadow-md">
          Streamline Collaboration with Channels
        </h1>
        <p className="text-lg md:text-xl mb-10 opacity-90 max-w-2xl mx-auto font-light">
          Organize, discuss, and resolve programming challenges in structured channels with screenshots and real-time feedback.
        </p>
        <div className="flex justify-center space-x-6">
          <Link
            to="/register"
            className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-full shadow-lg hover:bg-gray-100 hover:shadow-xl transition-all duration-300 text-sm md:text-base"
          >
            Register
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 bg-white-500 text-blue font-semibold rounded-full shadow-lg hover:bg-indigo-600 hover:shadow-xl transition-all duration-300 text-sm md:text-base"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full max-w-6xl px-6 py-16 bg-white text-gray-900 rounded-t-3xl shadow-inner">
        <h2 className="text-3xl md:text-4xl font-semibold mb-12 text-center text-gray-800">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center group">
            <BookOpen
              size={48}
              className="text-indigo-600 mb-4 group-hover:scale-110 transition-transform duration-300"
            />
            <h3 className="text-xl font-bold text-gray-800 mb-3">Join or Create Channels</h3>
            <p className="text-gray-600 text-sm text-center leading-relaxed">
              Engage in focused discussions within dedicated programming channels tailored to your needs.
            </p>
          </div>
          <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center group">
            <Camera
              size={48}
              className="text-indigo-600 mb-4 group-hover:scale-110 transition-transform duration-300"
            />
            <h3 className="text-xl font-bold text-gray-800 mb-3">Upload Screenshots</h3>
            <p className="text-gray-600 text-sm text-center leading-relaxed">
              Share detailed visuals to clarify issues and enhance communication.
            </p>
          </div>
          <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center group">
            <Users
              size={48}
              className="text-indigo-600 mb-4 group-hover:scale-110 transition-transform duration-300"
            />
            <h3 className="text-xl font-bold text-gray-800 mb-3">Collaborate & Resolve</h3>
            <p className="text-gray-600 text-sm text-center leading-relaxed">
              Work seamlessly with peers to troubleshoot and solve problems efficiently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}