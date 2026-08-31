import Link from "next/link";

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">

      {/* Navbar */}

      <nav className="flex justify-between items-center px-10 py-6 border-b border-slate-700">

        <h1 className="text-3xl font-bold text-cyan-400">
          🔐 PassVault
        </h1>

        <button className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-lg transition">
          Logout
        </button>

      </nav>

      {/* Welcome */}

      <section className="px-10 py-12">

        <h1 className="text-5xl font-bold">
          Welcome Back 👋
        </h1>

        <p className="text-gray-300 mt-4 text-lg">
          Your passwords are safe. Manage everything from one place.
        </p>

      </section>

      {/* Dashboard Cards */}

      <section className="px-10 pb-16">

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

          <Link href="/vault">

            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 hover:scale-105 hover:border-cyan-400 border border-transparent transition cursor-pointer">

              <div className="text-6xl mb-6">
                🔐
              </div>

              <h2 className="text-2xl font-bold mb-3">
                Password Vault
              </h2>

              <p className="text-gray-300">
                View and manage all your saved passwords securely.
              </p>

            </div>

          </Link>

          <Link href="/save_password">

            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 hover:scale-105 hover:border-green-400 border border-transparent transition cursor-pointer">

              <div className="text-6xl mb-6">
                ➕
              </div>

              <h2 className="text-2xl font-bold mb-3">
                Add Password
              </h2>

              <p className="text-gray-300">
                Save a new website, username and password.
              </p>

            </div>

          </Link>

          <Link href="/favorites">

            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 hover:scale-105 hover:border-yellow-400 border border-transparent transition cursor-pointer">

              <div className="text-6xl mb-6">
                ⭐
              </div>

              <h2 className="text-2xl font-bold mb-3">
                Favorites
              </h2>

              <p className="text-gray-300">
                Quickly access your most-used accounts.
              </p>

            </div>

          </Link>

          <Link href="/weak-passwords">

            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 hover:scale-105 hover:border-red-400 border border-transparent transition cursor-pointer">

              <div className="text-6xl mb-6">
                ⚠️
              </div>

              <h2 className="text-2xl font-bold mb-3">
                Weak Passwords
              </h2>

              <p className="text-gray-300">
                Find passwords that should be changed.
              </p>

            </div>

          </Link>

          <Link href="/statistics">

            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 hover:scale-105 hover:border-purple-400 border border-transparent transition cursor-pointer">

              <div className="text-6xl mb-6">
                📊
              </div>

              <h2 className="text-2xl font-bold mb-3">
                Statistics
              </h2>

              <p className="text-gray-300">
                Track total passwords and security score.
              </p>

            </div>

          </Link>

          <Link href="/settings">

            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 hover:scale-105 hover:border-pink-400 border border-transparent transition cursor-pointer">

              <div className="text-6xl mb-6">
                ⚙️
              </div>

              <h2 className="text-2xl font-bold mb-3">
                Settings
              </h2>

              <p className="text-gray-300">
                Update profile, security and preferences.
              </p>

            </div>

          </Link>

        </div>

      </section>

      {/* Bottom Stats */}

      <section className="px-10 pb-16">

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-cyan-500 rounded-3xl p-8 text-center">

            <h2 className="text-4xl font-bold">
              25
            </h2>

            <p className="mt-2">
              Saved Passwords
            </p>

          </div>

          <div className="bg-green-500 rounded-3xl p-8 text-center">

            <h2 className="text-4xl font-bold">
              92%
            </h2>

            <p className="mt-2">
              Security Score
            </p>

          </div>

          <div className="bg-purple-500 rounded-3xl p-8 text-center">

            <h2 className="text-4xl font-bold">
              5
            </h2>

            <p className="mt-2">
              Weak Passwords
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}