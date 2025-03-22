import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <div className="w-full max-w-4xl px-6 py-20 text-center">
        {/* Hero Section */}
        <h1 className="text-5xl font-extrabold mb-6 leading-tight">
          Streamline Collaboration with Channel-Based Issue Tracking
        </h1>
        <p className="text-lg mb-6 opacity-90">
          Organize, discuss, and resolve programming issues effectively in structured channels. 
          Upload screenshots, provide context, and get real-time feedback from your team.
        </p>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Link to="/register" className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-gray-200 transition">
            Register
          </Link>
          <Link to="/login" className="px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:bg-blue-800 transition">
            Sign In
          </Link>
        </div>

        {/* Features Section */}
        <div className="w-full max-w-5xl px-6 py-16 bg-white rounded-lg shadow-lg text-gray-900 text-center mt-10">
          <h2 className="text-3xl font-semibold mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg shadow-sm">
              <h3 className="text-xl font-bold">Join or Create Channels</h3>
              <p className="text-gray-600 mt-2">Engage in discussions within dedicated programming issue channels.</p>
            </div>
            <div className="p-6 border rounded-lg shadow-sm">
              <h3 className="text-xl font-bold">Upload Screenshots & Details</h3>
              <p className="text-gray-600 mt-2">Provide necessary visuals and descriptions to clarify issues.</p>
            </div>
            <div className="p-6 border rounded-lg shadow-sm">
              <h3 className="text-xl font-bold">Collaborate & Resolve</h3>
              <p className="text-gray-600 mt-2">Work with peers and experts to troubleshoot and find solutions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
