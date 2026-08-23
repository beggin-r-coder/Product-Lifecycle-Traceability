import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950">
      <!-- Navbar -->
      <nav class="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
                <span class="material-symbols-outlined text-xl">inventory_2</span>
              </div>
              <span class="text-xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">PLTS</span>
            </div>
            <div class="hidden md:flex items-center space-x-8">
              <a href="#features" class="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Features</a>
              <a href="#how-it-works" class="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">How It Works</a>
              <a href="#pricing" class="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Pricing</a>
            </div>
            <div class="flex items-center space-x-3">
              <a routerLink="/login" class="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Sign In</a>
              <a routerLink="/signup" class="px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-brand-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/40">Get Started</a>
            </div>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <div class="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <!-- Background Elements -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="absolute -top-40 -right-40 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl"></div>
          <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div class="max-w-7xl mx-auto relative">
          <div class="text-center space-y-8">
            <div class="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-sm font-semibold animate-fade-in">
              <span class="material-symbols-outlined text-lg">verified</span>
              <span>Trusted by {{ totalOrganizations() || '500+' }} Organizations Worldwide</span>
            </div>
            
            <h1 class="text-4xl sm:text-5xl lg:text-7xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight animate-slide-up">
              Complete Supply Chain
              <span class="block text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600">Transparency</span>
            </h1>
            
            <p class="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed animate-slide-up" style="animation-delay: 0.1s">
              Track every product from manufacturing to retail with blockchain-verified authenticity. 
              Real-time analytics, automated quality checks, and tamper-proof audit trails.
            </p>
            
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style="animation-delay: 0.2s">
              <a routerLink="/signup" class="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-xl shadow-brand-500/30 transition-all duration-300 flex items-center justify-center space-x-2 hover:shadow-2xl hover:shadow-brand-500/40 transform hover:-translate-y-0.5">
                <span class="material-symbols-outlined">rocket_launch</span>
                <span>Start Free Trial</span>
              </a>
              <a routerLink="/traceability" class="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 flex items-center justify-center space-x-2">
                <span class="material-symbols-outlined">qr_code_scanner</span>
                <span>Demo Tracking</span>
              </a>
            </div>

            <!-- Stats Bar -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 animate-slide-up" style="animation-delay: 0.3s">
              <div class="text-center">
                <p class="text-3xl sm:text-4xl font-extrabold text-brand-600 dark:text-brand-400">{{ totalOrganizations() || '500+' }}</p>
                <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">Organizations</p>
              </div>
              <div class="text-center">
                <p class="text-3xl sm:text-4xl font-extrabold text-brand-600 dark:text-brand-400">{{ totalProducts() || '10M+' }}</p>
                <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">Products Tracked</p>
              </div>
              <div class="text-center">
                <p class="text-3xl sm:text-4xl font-extrabold text-brand-600 dark:text-brand-400">{{ uptime() || '99.9%' }}</p>
                <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">Uptime</p>
              </div>
              <div class="text-center">
                <p class="text-3xl sm:text-4xl font-extrabold text-brand-600 dark:text-brand-400">24/7</p>
                <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">Support</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Features Section -->
      <div id="features" class="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 dark:text-white mb-4">
              Enterprise-Grade Features
            </h2>
            <p class="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Comprehensive tools designed for modern supply chain management
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Feature 1 -->
            <div class="group p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/30">
                <span class="material-symbols-outlined text-2xl">factory</span>
              </div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Manufacturing Tracking</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Real-time production monitoring with automated quality checkpoints and timeline analytics.</p>
            </div>
            
            <!-- Feature 2 -->
            <div class="group p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/30">
                <span class="material-symbols-outlined text-2xl">verified</span>
              </div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Quality Assurance</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Automated quality inspections with detailed reporting, certification management, and compliance tracking.</p>
            </div>
            
            <!-- Feature 3 -->
            <div class="group p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-amber-500/30">
                <span class="material-symbols-outlined text-2xl">local_shipping</span>
              </div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Transport Monitoring</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">GPS-enabled shipment tracking with real-time location updates and delivery confirmations.</p>
            </div>
            
            <!-- Feature 4 -->
            <div class="group p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-500/30">
                <span class="material-symbols-outlined text-2xl">storefront</span>
              </div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Retail Integration</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Seamless retailer onboarding with automated inventory updates and sales analytics.</p>
            </div>
            
            <!-- Feature 5 -->
            <div class="group p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-red-500/30">
                <span class="material-symbols-outlined text-2xl">report</span>
              </div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Defect Management</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Comprehensive defect reporting with root cause analysis, automated recall initiation, and resolution tracking.</p>
            </div>
            
            <!-- Feature 6 -->
            <div class="group p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-indigo-500/30">
                <span class="material-symbols-outlined text-2xl">shield</span>
              </div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Blockchain Security</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Tamper-proof records with blockchain verification, immutable audit trails, and enterprise-grade encryption.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- How It Works Section -->
      <div id="how-it-works" class="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 dark:text-white mb-4">
              How PLTS Works
            </h2>
            <p class="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Simple 4-step process to complete supply chain transparency
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <!-- Step 1 -->
            <div class="relative">
              <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
                <div class="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center text-xl font-bold mb-4">1</div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Create Order</h3>
                <p class="text-sm text-slate-600 dark:text-slate-400">Define product specifications and assign stakeholders for the lifecycle journey.</p>
              </div>
              <div class="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-brand-300"></div>
            </div>
            
            <!-- Step 2 -->
            <div class="relative">
              <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
                <div class="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center text-xl font-bold mb-4">2</div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Manufacturing</h3>
                <p class="text-sm text-slate-600 dark:text-slate-400">Production begins with real-time quality checks and progress tracking.</p>
              </div>
              <div class="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-brand-300"></div>
            </div>
            
            <!-- Step 3 -->
            <div class="relative">
              <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
                <div class="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center text-xl font-bold mb-4">3</div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Quality & Transport</h3>
                <p class="text-sm text-slate-600 dark:text-slate-400">Automated QA inspections followed by GPS-tracked shipping to retailers.</p>
              </div>
              <div class="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-brand-300"></div>
            </div>
            
            <!-- Step 4 -->
            <div class="relative">
              <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
                <div class="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center text-xl font-bold mb-4">4</div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Retail & Track</h3>
                <p class="text-sm text-slate-600 dark:text-slate-400">Products reach retail with complete traceability via QR codes and blockchain records.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-brand-600 to-indigo-700">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-3xl sm:text-4xl font-heading font-extrabold text-white mb-4">
            Transform Your Supply Chain Today
          </h2>
          <p class="text-lg text-brand-100 mb-8">
            Join industry leaders in complete product lifecycle transparency
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a routerLink="/signup" class="w-full sm:w-auto px-8 py-4 bg-white text-brand-700 font-semibold rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-0.5">
              Start Free Trial
            </a>
            <a routerLink="/traceability" class="w-full sm:w-auto px-8 py-4 bg-brand-700 text-white font-semibold rounded-2xl border border-brand-500 hover:bg-brand-800 transition-all duration-300">
              View Demo
            </a>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div class="max-w-7xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-white">
                  <span class="material-symbols-outlined text-xl">inventory_2</span>
                </div>
                <span class="text-xl font-heading font-extrabold text-slate-900 dark:text-white">PLTS</span>
              </div>
              <p class="text-sm text-slate-600 dark:text-slate-400">Enterprise-grade product lifecycle traceability for modern supply chains.</p>
            </div>
            <div>
              <h4 class="font-bold text-slate-900 dark:text-white mb-4">Product</h4>
              <ul class="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#features" class="hover:text-brand-600 dark:hover:text-brand-400">Features</a></li>
                <li><a href="#pricing" class="hover:text-brand-600 dark:hover:text-brand-400">Pricing</a></li>
                <li><a href="#" class="hover:text-brand-600 dark:hover:text-brand-400">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 class="font-bold text-slate-900 dark:text-white mb-4">Company</h4>
              <ul class="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" class="hover:text-brand-600 dark:hover:text-brand-400">About</a></li>
                <li><a href="#" class="hover:text-brand-600 dark:hover:text-brand-400">Blog</a></li>
                <li><a href="#" class="hover:text-brand-600 dark:hover:text-brand-400">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 class="font-bold text-slate-900 dark:text-white mb-4">Support</h4>
              <ul class="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" class="hover:text-brand-600 dark:hover:text-brand-400">Help Center</a></li>
                <li><a href="#" class="hover:text-brand-600 dark:hover:text-brand-400">Contact</a></li>
                <li><a href="#" class="hover:text-brand-600 dark:hover:text-brand-400">Status</a></li>
              </ul>
            </div>
          </div>
          <div class="pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
            <p class="text-sm text-slate-600 dark:text-slate-400">
              © 2026 PLTS - Product Lifecycle Traceability System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>

    <style>
      @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slide-up {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in {
        animation: fade-in 0.6s ease-out;
      }
      .animate-slide-up {
        animation: slide-up 0.6s ease-out;
      }
    </style>
  `,
})
export class LandingComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  
  totalOrganizations = signal<string>('500+');
  totalProducts = signal<string>('10M+');
  uptime = signal<string>('99.9%');

  ngOnInit() {
    this.loadPublicStats();
  }

  loadPublicStats() {
    this.analyticsService.getPublicStats().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.totalOrganizations.set(res.data.totalOrganizations || '500+');
          this.totalProducts.set(res.data.totalProducts || '10M+');
          this.uptime.set(res.data.uptime || '99.9%');
        }
      },
      error: () => {
        // Keep default values on error
      }
    });
  }
}
