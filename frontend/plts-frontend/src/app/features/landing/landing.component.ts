import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <!-- Navbar -->
      <nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                <span class="material-symbols-outlined text-xl">inventory_2</span>
              </div>
              <span class="text-xl font-heading font-extrabold text-slate-900 dark:text-white">PLTS</span>
            </div>
            <div class="flex items-center space-x-3">
              <a routerLink="/login" class="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Sign In</a>
              <a routerLink="/signup" class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-brand-500/20 transition-all">Get Started</a>
            </div>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <div class="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div class="max-w-7xl mx-auto">
          <div class="text-center space-y-8">
            <div class="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-sm font-semibold">
              <span class="material-symbols-outlined text-lg">verified</span>
              <span>End-to-End Product Lifecycle Traceability</span>
            </div>
            
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Track Products From
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">Manufacturing to Retail</span>
            </h1>
            
            <p class="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Complete supply chain transparency with blockchain-verified product tracking. 
              Monitor every stage from production to delivery with real-time updates and tamper-proof records.
            </p>
            
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a routerLink="/signup" class="w-full sm:w-auto px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-2xl shadow-xl shadow-brand-500/30 transition-all flex items-center justify-center space-x-2">
                <span class="material-symbols-outlined">rocket_launch</span>
                <span>Start Free Trial</span>
              </a>
              <a routerLink="/traceability" class="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center space-x-2">
                <span class="material-symbols-outlined">qr_code_scanner</span>
                <span>Track Product</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Features Section -->
      <div class="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-900/50">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 dark:text-white mb-4">
              Everything You Need for Complete Traceability
            </h2>
            <p class="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Powerful features designed to give you complete control over your product lifecycle
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Feature 1 -->
            <div class="glass-card p-6 rounded-2xl space-y-4 hover:shadow-xl transition-shadow">
              <div class="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <span class="material-symbols-outlined text-2xl">factory</span>
              </div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Manufacturing Tracking</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400">Monitor production stages, quality checks, and manufacturing timelines with real-time updates.</p>
            </div>
            
            <!-- Feature 2 -->
            <div class="glass-card p-6 rounded-2xl space-y-4 hover:shadow-xl transition-shadow">
              <div class="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <span class="material-symbols-outlined text-2xl">verified</span>
              </div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Quality Assurance</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400">Automated quality checks with detailed reporting and certification management.</p>
            </div>
            
            <!-- Feature 3 -->
            <div class="glass-card p-6 rounded-2xl space-y-4 hover:shadow-xl transition-shadow">
              <div class="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <span class="material-symbols-outlined text-2xl">local_shipping</span>
              </div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Transport Monitoring</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400">Track shipments in real-time with GPS integration and delivery confirmations.</p>
            </div>
            
            <!-- Feature 4 -->
            <div class="glass-card p-6 rounded-2xl space-y-4 hover:shadow-xl transition-shadow">
              <div class="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <span class="material-symbols-outlined text-2xl">storefront</span>
              </div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Retail Integration</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400">Seamless retailer onboarding with automated inventory updates and sales tracking.</p>
            </div>
            
            <!-- Feature 5 -->
            <div class="glass-card p-6 rounded-2xl space-y-4 hover:shadow-xl transition-shadow">
              <div class="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
                <span class="material-symbols-outlined text-2xl">report</span>
              </div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Defect Management</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400">Comprehensive defect reporting with root cause analysis and recall initiation.</p>
            </div>
            
            <!-- Feature 6 -->
            <div class="glass-card p-6 rounded-2xl space-y-4 hover:shadow-xl transition-shadow">
              <div class="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <span class="material-symbols-outlined text-2xl">shield</span>
              </div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Blockchain Security</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400">Tamper-proof records with blockchain verification for complete data integrity.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="py-20 px-4 sm:px-6 lg:px-8">
        <div class="max-w-4xl mx-auto">
          <div class="glass-card p-8 sm:p-12 rounded-3xl text-center space-y-6">
            <h2 class="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 dark:text-white">
              Ready to Transform Your Supply Chain?
            </h2>
            <p class="text-lg text-slate-600 dark:text-slate-400">
              Join thousands of organizations already using PLTS for complete product lifecycle management.
            </p>
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a routerLink="/signup" class="w-full sm:w-auto px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-2xl shadow-xl shadow-brand-500/30 transition-all">
                Create Free Account
              </a>
              <a routerLink="/traceability" class="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                Try Product Tracking
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800">
        <div class="max-w-7xl mx-auto text-center">
          <p class="text-sm text-slate-600 dark:text-slate-400">
            © 2026 PLTS - Product Lifecycle Traceability System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  `
})
export class LandingComponent {}
