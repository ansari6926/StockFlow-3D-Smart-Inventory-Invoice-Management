import Link from 'next/link';
import {
  ArrowRight,
  Boxes,
  ShieldCheck,
  Zap,
  TrendingUp,
  Package,
  FileText,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary selection:text-primary-foreground">
      {/* HEADER NAVIGATION */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 shadow-lg shadow-indigo-500/20">
              <Boxes className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">StockFlow 3D</p>
              <p className="text-[10px] text-muted-foreground font-medium">Smart Inventory</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login" id="nav-signin-btn">
                Sign In
              </Link>
            </Button>
            <Button variant="gradient" size="sm" asChild>
              <Link href="/signup" id="nav-getstarted-btn">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="flex-1 flex flex-col items-center justify-center pt-28 pb-16 px-6 relative overflow-hidden">
        {/* Ambient glow backgrounds */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-indigo-500/15 via-purple-500/15 to-pink-500/15 blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-cyan-500/10 via-blue-500/10 to-indigo-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center space-y-8">
          {/* Subtle Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary shadow-sm">
            <Zap className="h-3.5 w-3.5" />
            <span>Next-Gen Inventory & Invoice Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="block text-foreground">Stop Overselling.</span>
            <span className="block gradient-text mt-1">Start Flowing.</span>
          </h1>

          {/* Product Description */}
          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed font-normal">
            StockFlow 3D provides real-time stock tracking and atomic invoice processing to eliminate
            inventory discrepancies and guarantee complete financial accuracy.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button size="xl" variant="gradient" asChild>
              <Link href="/signup" id="hero-get-started">
                Get Started Free <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link href="/dashboard" id="hero-launch-dashboard">
                Launch Dashboard
              </Link>
            </Button>
          </div>

          {/* 3D PRODUCT VISUAL PREVIEW CARD */}
          <div className="pt-8 mx-auto max-w-3xl">
            <div className="relative rounded-2xl border border-border/80 bg-card/60 p-6 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-primary/40 group">
              {/* Top Card Bar */}
              <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  <span className="ml-2 text-xs font-mono text-muted-foreground">stockflow-3d // live console</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="h-3.5 w-3.5" /> Synchronized
                </div>
              </div>

              {/* Grid Preview Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <div className="rounded-xl border border-border bg-background/50 p-4 transition-transform duration-300 group-hover:translate-y-[-2px]">
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-xs font-medium">Catalog Stock</span>
                    <Package className="h-4 w-4 text-indigo-400" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">1,482 Units</p>
                  <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Real-time active
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-background/50 p-4 transition-transform duration-300 group-hover:translate-y-[-2px]">
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-xs font-medium">Atomic Checkout</span>
                    <FileText className="h-4 w-4 text-purple-400" />
                  </div>
                  <p className="text-2xl font-bold gradient-text-blue">100% Protection</p>
                  <p className="text-[11px] text-muted-foreground mt-1">FOR UPDATE row locks</p>
                </div>

                <div className="rounded-xl border border-border bg-background/50 p-4 transition-transform duration-300 group-hover:translate-y-[-2px]">
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-xs font-medium">Stock Deductions</span>
                    <Check className="h-4 w-4 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">Instant</p>
                  <p className="text-[11px] text-emerald-400 mt-1">Verified PostgreSQL RPC</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border/60 py-6 px-6 bg-card/30">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Boxes className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">StockFlow 3D</span>
            <span className="text-xs text-muted-foreground">• Smart Inventory & Invoice Management</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} StockFlow 3D. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
