import { ShieldCheck } from 'lucide-react';

export default function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-10">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center text-gray-900">Welcome Back</h2>
          <p className="text-center text-gray-500 mt-2">Sign in to access CrowdGuard</p>

          <div className="mt-10 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input type="email" className="w-full px-5 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500" placeholder="admin@crowdguard.com" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input type="password" className="w-full px-5 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500" placeholder="••••••••" />
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl transition text-lg">
              Login
            </button>

            <div className="text-center text-sm text-gray-500">
              Don't have an account? <span className="text-blue-600 hover:underline cursor-pointer">Sign up</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}