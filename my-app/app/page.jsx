import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">

      {/* Navbar */}

      <nav className="flex items-center justify-between px-10 py-6">

        <h1 className="text-3xl font-bold text-cyan-400">
          🔐 PassVault
        </h1>

        <div className="flex items-center gap-6">

          <Link
            href="/login"
            className="hover:text-cyan-400 transition"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="bg-cyan-500 hover:bg-cyan-600 px-5 py-2 rounded-lg transition"
          >
            Sign Up
          </Link>

        </div>

      </nav>

      {/* Hero */}

      <section className="max-w-7xl mx-auto px-10 py-20 flex flex-col lg:flex-row items-center justify-between gap-16">

        {/* Left */}

        <div className="max-w-xl">

          <h1 className="text-6xl font-extrabold leading-tight">

            Keep Your
            <span className="text-cyan-400"> Passwords </span>
            Safe.

          </h1>

          <p className="mt-8 text-lg text-gray-300 leading-8">

            Store, organize and access all your passwords securely.
            Your credentials are protected and available whenever
            you need them.

          </p>

          <div className="mt-10 flex gap-5">

            <Link
              href="/signup"
              className="bg-cyan-500 hover:bg-cyan-600 px-7 py-4 rounded-xl font-semibold transition"
            >
              Get Started
            </Link>

            <Link
              href="/login"
              className="border border-gray-500 hover:border-cyan-400 hover:text-cyan-400 px-7 py-4 rounded-xl transition"
            >
              Login
            </Link>

          </div>

        </div>

        {/* Right */}

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 w-full max-w-md shadow-2xl">

          <h2 className="text-2xl font-bold mb-8 text-cyan-400">
            Password Vault
          </h2>

          <div className="space-y-5">

            <div className="flex justify-between bg-slate-800 rounded-xl p-4">
              <span>🌐 Gmail</span>
              <span>••••••••••</span>
            </div>

            <div className="flex justify-between bg-slate-800 rounded-xl p-4">
              <span>💻 GitHub</span>
              <span>••••••••••</span>
            </div>

            <div className="flex justify-between bg-slate-800 rounded-xl p-4">
              <span>📱 Instagram</span>
              <span>••••••••••</span>
            </div>

          </div>

          <button className="mt-8 w-full bg-cyan-500 hover:bg-cyan-600 py-3 rounded-xl font-semibold transition">

            Open Vault

          </button>

        </div>

      </section>

      {/* Features */}

      <section className="max-w-7xl mx-auto px-10 pb-24">

        <h2 className="text-4xl font-bold text-center mb-14">

          Why Choose PassVault?

        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:scale-105 transition">

            <div className="text-5xl mb-5">🔒</div>

            <h3 className="text-xl font-bold mb-3">
              Secure Storage
            </h3>

            <p className="text-gray-300">
              Store passwords safely using modern encryption.
            </p>

          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:scale-105 transition">

            <div className="text-5xl mb-5">⚡</div>

            <h3 className="text-xl font-bold mb-3">
              Fast Access
            </h3>

            <p className="text-gray-300">
              Retrieve your credentials instantly.
            </p>

          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:scale-105 transition">

            <div className="text-5xl mb-5">📱</div>

            <h3 className="text-xl font-bold mb-3">
              Responsive
            </h3>

            <p className="text-gray-300">
              Works perfectly on desktop, tablet and mobile.
            </p>

          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:scale-105 transition">

            <div className="text-5xl mb-5">🛡️</div>

            <h3 className="text-xl font-bold mb-3">
              Privacy First
            </h3>

            <p className="text-gray-300">
              Your vault is accessible only to you.
            </p>

          </div>

        </div>

      </section>

      {/* Footer */}

      <footer className="border-t border-gray-700 py-8 text-center text-gray-400">

        © 2026 PassVault • Built with Next.js & Tailwind CSS

      </footer>

    </main>
  );
}