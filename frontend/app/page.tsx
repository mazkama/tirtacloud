"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AppIcon } from '@/components/shared/AppIcon';
import { AnimatedButton } from '@/components/shared/AnimatedButton';
import { GlassCard } from '@/components/shared/GlassCard';
import { TypingText } from '@/components/landing/TypingText';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white overflow-hidden selection:bg-purple-500/30 selection:text-purple-200 font-sans">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="px-6 lg:px-8 h-20 flex items-center justify-between border-b border-white/5 backdrop-blur-xl sticky top-0 z-50 bg-black/50">
        <Link className="flex items-center gap-2 group" href="#">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
            <AppIcon name="Logo" className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            Tirta<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Cloud</span>
          </span>
        </Link>
        <nav className="flex items-center gap-8">
          <Link className="text-sm font-medium text-gray-400 hover:text-white transition-colors hidden md:block" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium text-gray-400 hover:text-white transition-colors hidden md:block" href="#how-it-works">
            How it Works
          </Link>
          <div className="flex items-center gap-4">
            <Link className="text-sm font-medium text-gray-300 hover:text-white transition-colors" href="/login">
              Sign In
            </Link>
            <Link href="/register">
              <AnimatedButton size="sm" className="bg-white text-black hover:bg-gray-200 font-semibold rounded-full px-6 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]">
                Get Started
              </AnimatedButton>
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1 relative z-10">
        {/* --- Hero Section --- */}
        <section className="w-full pt-32 pb-32 flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 max-w-5xl mx-auto z-10"
          >
            <div className="inline-flex items-center rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-sm font-medium text-purple-300 backdrop-blur-xl mb-4">
              <span className="flex h-2 w-2 rounded-full bg-purple-400 mr-2 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.5)]"></span>
              Enterprise-Grade Virtual Filesystem
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl md:text-8xl leading-[1.1] text-white">
              The Storage Layer <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 animate-gradient-x">
                For the AI Era
              </span>
            </h1>

            <div className="h-20 flex items-center justify-center">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-400">
                <TypingText texts={["Unified.", "Simplified.", "Limitless."]} />
              </h2>
            </div>

            <p className="mx-auto max-w-2xl text-gray-400 md:text-xl font-light leading-relaxed">
              Orchestrate petabytes of data across fragmented providers through a single, high-performance API.
              <span className="text-gray-300 font-medium"> Secure, fast, and engineered for scale.</span>
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6 pt-8">
              <Link href="/register">
                <AnimatedButton size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold px-10 h-14 rounded-full shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)] hover:shadow-[0_0_60px_-10px_rgba(168,85,247,0.7)] text-lg border border-white/10">
                  Start Building Free <AppIcon name="ArrowRight" className="ml-2 h-5 w-5" />
                </AnimatedButton>
              </Link>
              <Link href="/login">
                <AnimatedButton size="lg" variant="outline" className="text-white border-white/10 bg-white/5 hover:bg-white/10 h-14 rounded-full backdrop-blur-md px-10 text-lg">
                  View Documentation
                </AnimatedButton>
              </Link>
            </div>

            <div className="pt-12 flex items-center justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Trust Badges / Tech Stack placeholders */}
              <div className="text-sm font-semibold text-gray-500 tracking-wider uppercase">High Performance Infrastructure</div>
            </div>
          </motion.div>
        </section>

        {/* --- Problem / Solution Section --- */}
        <section className="w-full py-32 bg-black/50 border-t border-white/5 relative">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px]" />
          <div className="container px-4 md:px-6 mx-auto relative z-10">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                  Legacy Storage is <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Fragmented</span>.
                </h2>
                <div className="space-y-6 text-gray-400 text-lg leading-relaxed">
                  <p>
                    Managing multiple storage buckets, juggling APIs, and handling complex permission systems stifles innovation.
                    Data silos prevent your team from moving fast.
                  </p>
                  <p>
                    As your data grows, so does the complexity of your infrastructure. Security risks increase, and visibility decreases.
                  </p>
                </div>
              </div>
              <GlassCard className="from-purple-900/20 to-blue-900/20 p-8 border-l-4 border-l-purple-500">
                <h3 className="text-2xl font-bold mb-4 text-white">The TirtaCloud Solution</h3>
                <p className="text-gray-300 mb-6">
                  A unified virtualization layer that sits above your physical storage.
                  Treat the entire internet as your local filesystem.
                </p>
                <ul className="space-y-3">
                  {[
                    "Single Unified API Endpoint",
                    "Zero-Latency Metadata Caching",
                    "Policy-Based Data Routing",
                    "Automated Redundancy & Failover"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                      <AppIcon name="CheckCircle" className="h-5 w-5 text-green-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* --- Enterprise Features --- */}
        <section id="features" className="w-full py-32 relative overflow-hidden">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-24">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-6 text-white">
                Engineered for <span className="text-purple-400">Hyperscale</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Built on a zero-trust architecture with edge-native performance principles.
                Ready for mission-critical workloads.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <GlassCard hoverEffect className="p-8">
                <div className="h-14 w-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20">
                  <AppIcon name="CloudSync" size={28} className="text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Multi-Cloud Aggregation</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Seamlessly mount Google Drive, AWS S3, and Azure Blob under a single namespace.
                  We handle the protocol translation in real-time.
                </p>
              </GlassCard>

              <GlassCard hoverEffect className="p-8">
                <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
                  <AppIcon name="Storage" size={28} className="text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Virtual Filesystem (VFS)</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Our proprietary VFS indexing engine enables instant directory listing and search across petabytes of data without api-thrashing.
                </p>
              </GlassCard>

              <GlassCard hoverEffect className="p-8">
                <div className="h-14 w-14 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6 border border-green-500/20">
                  <AppIcon name="Security" size={28} className="text-green-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Zero-Trust Security</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  End-to-end encryption for metadata and tokens. Role-Based Access Control (RBAC)
                  that propagates down to the file level.
                </p>
              </GlassCard>

              <GlassCard hoverEffect className="p-8">
                <div className="h-14 w-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20">
                  <AppIcon name="Global" size={28} className="text-orange-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Global Edge Routing</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Uploads and downloads are intelligently routed to the nearest available data center, maximize throughput and minimizing latency.
                </p>
              </GlassCard>

              <GlassCard hoverEffect className="p-8">
                <div className="h-14 w-14 rounded-2xl bg-pink-500/10 flex items-center justify-center mb-6 border border-pink-500/20">
                  <AppIcon name="Lock" size={28} className="text-pink-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Secure Presigned Sharing</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Generate temporary, secure links for external sharing. Control expiration times,
                  password protection, and usage limits programmatically.
                </p>
              </GlassCard>

              <GlassCard hoverEffect className="p-8">
                <div className="h-14 w-14 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-6 border border-teal-500/20">
                  <AppIcon name="Speed" size={28} className="text-teal-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Intellligent Balancing</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Automatically distribute storage load across connected accounts based on
                  available capacity and performance metrics.
                </p>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* --- Final CTA --- */}
        <section className="w-full py-32 relative overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="absolute inset-0 bg-purple-600/5" />
          <div className="relative z-10 max-w-3xl px-6">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Ready to Virtualize Your Cloud?
            </h2>
            <p className="text-xl text-gray-400 mb-10 font-light">
              Join thousands of developers and enterprises building the next generation of data-intensive applications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <AnimatedButton size="lg" className="bg-white text-black hover:bg-gray-200 font-bold px-10 h-14 rounded-full text-lg shadow-xl">
                  Get Started Now
                </AnimatedButton>
              </Link>
              <Link href="#">
                <AnimatedButton size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10 px-10 h-14 rounded-full text-lg">
                  Contact Enterprise Sales
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-16 w-full shrink-0 border-t border-white/5 bg-black z-10">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <Link className="flex items-center gap-2 mb-4 group" href="#">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800">
                  <AppIcon name="Logo" className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <span className="font-bold text-lg text-white">TirtaCloud</span>
              </Link>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                The unified virtual operating system for the world's storage.
                Simplifying data orchestration for modern teams.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="#" className="hover:text-purple-400 transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-purple-400 transition-colors">Integrations</Link></li>
                <li><Link href="#" className="hover:text-purple-400 transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-purple-400 transition-colors">Changelog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-purple-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-purple-400 transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-600">© 2026 TirtaCloud Inc. All rights reserved.</p>
            <div className="flex gap-4">
              {/* Social icons placeholder */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
