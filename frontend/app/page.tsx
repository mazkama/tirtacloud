import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Cloud, HardDrive, Lock, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-purple-500 selection:text-white">
      {/* Header */}
      <header className="px-6 lg:px-8 h-16 flex items-center justify-between border-b border-white/10 backdrop-blur-md sticky top-0 z-50 bg-black/50">
        <Link className="flex items-center justify-center font-bold text-xl tracking-tight" href="#">
          <span className="text-purple-500 mr-1">Tirta</span>Cloud
        </Link>
        <nav className="flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-purple-400 transition-colors" href="/login">
            Login
          </Link>
          <Link className="text-sm font-medium hover:text-purple-400 transition-colors" href="/register">
            Register
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-24 md:py-32 lg:py-48 flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

          <div className="space-y-6 max-w-3xl relative z-10">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-medium text-purple-300 backdrop-blur-xl">
              <span className="flex h-2 w-2 rounded-full bg-purple-500 mr-2 animate-pulse"></span>
              v1.0 Public Beta is Live
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Your Cloud, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Unified.</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl font-light">
              Manage multiple Google Drive accounts as a single, limitless virtual filesystem. Secure, fast, and engineered for power users.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link href="/register">
                <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-semibold px-8 h-12 rounded-full">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10 h-12 rounded-full backdrop-blur-sm">
                  Live Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="w-full py-24 bg-white/5 border-t border-white/10">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-start space-y-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-colors duration-300">
                <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
                  <Cloud className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Multi-Cloud Sync</h3>
                <p className="text-gray-400">
                  Connect unlimited Google Drive accounts. We aggregate your storage into one seamless interface.
                </p>
              </div>
              <div className="flex flex-col items-start space-y-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-colors duration-300">
                <div className="p-3 rounded-lg bg-pink-500/10 text-pink-400">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Zero Trust Security</h3>
                <p className="text-gray-400">
                  Built-in encryption for tokens and Zero Trust architecture ready. Your data stays yours.
                </p>
              </div>
              <div className="flex flex-col items-start space-y-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-colors duration-300">
                <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Lightning Fast</h3>
                <p className="text-gray-400">
                  Optimized metadata caching ensures browsing your cloud files feels instantaneous.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 w-full shrink-0 border-t border-white/10 bg-black">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">© 2024 TirtaCloud. All rights reserved.</p>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-xs hover:text-white transition-colors text-gray-500" href="#">Terms of Service</Link>
            <Link className="text-xs hover:text-white transition-colors text-gray-500" href="#">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
