import { Routes } from '@angular/router';
import { PublicTraceabilityComponent } from './features/public/public-traceability.component';
import { AuthLoginComponent } from './features/auth/auth-login.component';
import { AuthSignupComponent } from './features/auth/auth-signup.component';
import { OrgDashboardComponent } from './features/org/org-dashboard.component';
import { OrgStakeholdersComponent } from './features/org/org-stakeholders.component';
import { OrgOrdersComponent } from './features/org/org-orders.component';
import { StakeholderDashboardComponent } from './features/stakeholder/stakeholder-dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'traceability', pathMatch: 'full' },
  { path: 'traceability', component: PublicTraceabilityComponent },
  { path: 'login', component: AuthLoginComponent },
  { path: 'signup', component: AuthSignupComponent },
  
  // Organization Portal Routes
  { path: 'org/dashboard', component: OrgDashboardComponent },
  { path: 'org/stakeholders', component: OrgStakeholdersComponent },
  { path: 'org/orders', component: OrgOrdersComponent },
  { path: 'org/notifications', component: OrgOrdersComponent },

  // Stakeholder Portal Routes
  { path: 'stakeholder/dashboard', component: StakeholderDashboardComponent },

  { path: '**', redirectTo: 'traceability' }
];
