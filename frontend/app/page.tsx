"use client";

import Link from 'next/link';
import { ArrowRight, Cloud, HardDrive, Lock, Zap, Shield, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedButton } from '@/components/shared/AnimatedButton';
import { GlassCard } from '@/components/shared/GlassCard';
import { TypingText } from '@/components/landing/TypingText';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden selection:bg-purple-500/30 selection:text-purple-200">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-600/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[150px] opacity-50" />
      </div>

      {/* Header */}
      <header className="px-6 lg:px-8 h-20 flex items-center justify-between border-b border-white/5 backdrop-blur-md sticky top-0 z-50 bg-background/50">
        <Link className="flex items-center justify-center font-bold text-2xl tracking-tighter" href="#">
          <div className="relative mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
            <Cloud className="h-5 w-5 text-white" />
          </div>
          <span>Tirta<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Cloud</span></span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link className="text-sm font-medium text-gray-400 hover:text-white transition-colors hidden sm:block delay-75" href="/login">
            Sign In
          </Link>
          <Link href="/register">
            <AnimatedButton size="sm" className="bg-white text-black hover:bg-gray-200 font-semibold rounded-full px-6">
              Get Started
            </AnimatedButton>
          </Link>
        </nav>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="w-full pt-32 pb-40 flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 max-w-4xl"
          >
            <div className="inline-flex items-center rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-sm font-medium text-purple-300 backdrop-blur-xl mb-4">
              <span className="flex h-2 w-2 rounded-full bg-purple-400 mr-2 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.5)]"></span>
              Enterprise-Grade Multi-Cloud Manager
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl md:text-8xl leading-tight">
              The Cloud, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 type-writer-effect">
                <TypingText texts={["Unified.", "Simplified.", "Limitless."]} />
              </span>
            </h1>

            <p className="mx-auto max-w-[800px] text-gray-400 md:text-xl font-light leading-relaxed">
              Aggregate unlimited Google Drive accounts into a single, high-performance virtual filesystem.
              <br className="hidden md:block" /> Secure, fast, and engineered for the modern power user.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6 pt-8">
              <Link href="/register">
                <AnimatedButton size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-8 h-14 rounded-full shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)] hover:shadow-[0_0_50px_-10px_rgba(168,85,247,0.6)] text-lg">
                  Start for Free <ArrowRight className="ml-2 h-5 w-5" />
                </AnimatedButton>
              </Link>
              <Link href="/login">
                <AnimatedButton size="lg" variant="outline" className="text-white border-white/10 bg-white/5 hover:bg-white/10 h-14 rounded-full backdrop-blur-md px-8 text-lg">
                  Live Demo
                </AnimatedButton>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="w-full py-32 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Engineered for Scale</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Utilizing advanced caching and zero-trust architecture to provide a seamless experience.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <GlassCard hoverEffect>
                <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400">
                  <Cloud className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Multi-Cloud Sync</h3>
                <p className="text-gray-400 leading-relaxed">
                  Connect unlimited accounts. We intelligently route your files to the optimal storage provider instantly.
                </p>
              </GlassCard>

              <GlassCard hoverEffect>
                <div className="h-12 w-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-6 text-pink-400">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Zero Trust Security</h3>
                <p className="text-gray-400 leading-relaxed">
                  Enterprise-grade encryption for your tokens. Your data remains yours, we just provide the bridge.
                </p>
              </GlassCard>

              <GlassCard hoverEffect>
                <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Instant Access</h3>
                <p className="text-gray-400 leading-relaxed">
                  Smart metadata caching ensures browsing terabytes of data feels instantaneous, with no loading lag.
                </p>
              </GlassCard>

              <GlassCard hoverEffect>
                <div className="h-12 w-12 rounded-xl bg-orange-500/20 flex items-center justify-center mb-6 text-orange-400">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Global CDN</h3>
                <p className="text-gray-400 leading-relaxed">
                  Access your files from anywhere with optimized routing and global content delivery network integration.
                </p>
              </GlassCard>

              <GlassCard hoverEffect>
                <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-6 text-green-400">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Secure Sharing</h3>
                <p className="text-gray-400 leading-relaxed">
                  Generate secure, S3-compatible presigned URLs with password protection and expiration controls.
                </p>
              </GlassCard>

              <GlassCard hoverEffect className="flex flex-col items-center justify-center text-center border-dashed border-2 bg-transparent">
                <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-300">And much more...</h3>
              </GlassCard>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 w-full shrink-0 border-t border-white/5 bg-black/50 backdrop-blur-xl relative z-10">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">© 2024 TirtaCloud Inc. All rights reserved.</p>
          <nav className="flex gap-8">
            <Link className="text-sm hover:text-white transition-colors text-gray-600" href="#">Terms</Link>
            <Link className="text-sm hover:text-white transition-colors text-gray-600" href="#">Privacy</Link>
            <Link className="text-sm hover:text-white transition-colors text-gray-600" href="#">Status</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
