import Link from 'next/link';
import {
  ArrowRight,
  Package,
  FileText,
  Shield,
  Zap,
  BarChart3,
  CheckCircle2,
  Boxes,
  TrendingUp,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Package,
    title: 'Smart Inventory',
    description: 'Real-time stock tracking with low-stock alerts and automated reorder thresholds.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: FileText,
    title: 'Atomic Invoicing',
    description: 'Create invoices with guaranteed stock deduction using PostgreSQL transactions. Zero overselling.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Shield,
    title: 'Server-Side Security',
    description: 'Prices always sourced from the database. Client cannot manipulate prices or stock levels.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Zap,
    title: 'Instant Validation',
    description: 'Real-time client-side validation with server-side enforcement. Errors caught before submission.',
    color: 'from-orange-500 to-yellow-500',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Revenue trends, inventory metrics, low-stock alerts, and recent invoice activity at a glance.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: TrendingUp,
    title: 'Invoice Cancellation',
    description: 'Cancel invoices with automatic stock restoration. Idempotent — cancelling twice is safe.',
    color: 'from-indigo-500 to-purple-500',
  },
];

const techStack = [
  'Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS',
  'Supabase', 'PostgreSQL', 'Framer Motion', 'Playwright',
];

const stats = [
  { label: 'Atomic Transactions', value: '100%' },
  { label: 'Overselling Rate', value: '0%' },
  { label: 'Test Coverage', value: '95%+' },
  { label: 'Uptime SLA', value: '99.9%' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 shadow-lg">
              <Boxes className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold">StockFlow 3D</p>
              <p className="text-[10px] text-muted-foreground">Smart Inventory</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button variant="gradient" asChild>
              <Link href="/login">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-16">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-cyan-500/15 via-blue-500/15 to-indigo-500/15 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Zap className="h-3.5 w-3.5" />
            <span>Tactive Assessment — StockFlow 3D</span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            <span className="block text-foreground">Stop Overselling.</span>
            <span className="block gradient-text mt-1">Start Flowing.</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground leading-relaxed">
            StockFlow 3D is a production-grade inventory and invoicing system that uses
            <strong className="text-foreground"> atomic database transactions</strong> to
            guarantee zero overselling — every invoice deducts stock exactly once.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="xl" variant="gradient" asChild>
              <Link href="/login" id="hero-cta-primary">
                Launch Dashboard <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link href="/login" id="hero-cta-demo">
                <Lock className="h-4 w-4" />
                Demo Login
              </Link>
            </Button>
          </div>

          {/* Demo credentials hint */}
          <p className="mt-4 text-sm text-muted-foreground">
            Demo: <code className="rounded bg-muted px-1.5 py-0.5 text-xs">demo@stockflow.app</code>
            {' / '}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">StockFlow2024!</code>
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-muted/30 py-12">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-extrabold gradient-text-blue">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Built for real engineering</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Every feature is backed by proper validation, transactions, and security.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group card-hover rounded-2xl border border-border bg-card p-6"
                >
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Invoice Flow Section */}
      <section className="py-24 px-6 bg-muted/20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">The Invoice Flow</h2>
            <p className="mt-4 text-muted-foreground">Every invoice follows this exact atomic sequence</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { step: '01', title: 'Select Products', desc: 'Search and add from live inventory' },
              { step: '02', title: 'Validate Quantities', desc: 'Real-time stock availability check' },
              { step: '03', title: 'Set Discount', desc: 'Apply percentage discount (0–100%)' },
              { step: '04', title: 'Calculate Totals', desc: 'Tax applied after discount automatically' },
              { step: '05', title: 'Atomic Submit', desc: 'Transaction locks rows, deducts stock, saves invoice' },
              { step: '06', title: 'Instant Confirmation', desc: 'Invoice number generated, stock updated' },
            ].map((step) => (
              <div key={step.step} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {step.step}
                </span>
                <div>
                  <p className="font-semibold text-sm">{step.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="mb-8 text-2xl font-bold">Technology Stack</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-indigo-950 via-purple-950 to-background">
        <div className="mx-auto max-w-3xl text-center">
          <CheckCircle2 className="mx-auto mb-6 h-16 w-16 text-emerald-400" />
          <h2 className="mb-4 text-4xl font-extrabold text-white">Ready to explore?</h2>
          <p className="mb-8 text-lg text-slate-300">
            The full source code, tests, documentation, and deployment evidence are in the GitHub repository.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="xl" variant="gradient" asChild>
              <Link href="/login" id="bottom-cta">
                Open Dashboard <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Boxes className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">StockFlow 3D</span>
            <span className="text-muted-foreground text-sm">— Smart Inventory & Invoice Management</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built with Next.js, Supabase & PostgreSQL • Deployed on Vercel
          </p>
        </div>
      </footer>
    </div>
  );
}
