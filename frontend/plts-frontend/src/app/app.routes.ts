import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { PublicTraceabilityComponent } from './features/public/public-traceability.component';
import { AuthLoginComponent } from './features/auth/auth-login/auth-login.component';
import { AuthSignupComponent } from './features/auth/auth-signup/auth-signup.component';
import { OrgDashboardComponent } from './features/org/org-dashboard.component';
import { OrgStakeholdersComponent } from './features/org/org-stakeholders.component';
import { OrgOrdersComponent } from './features/org/org-orders.component';
import { OrgDefectsComponent } from './features/org/org-defects.component';
import { OrgInvestigationComponent } from './features/org/org-investigation.component';
import { OrgBacktrackingComponent } from './features/org/org-backtracking.component';
import { OrgRecallsComponent } from './features/org/org-recalls.component';
import { OrgNotificationsComponent } from './features/org/org-notifications.component';
import { StakeholderDashboardComponent } from './features/stakeholder/stakeholder-dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  { path: 'landing', component: LandingComponent },
  { path: 'traceability', component: PublicTraceabilityComponent },
  { path: 'login', component: AuthLoginComponent },
  { path: 'signup', component: AuthSignupComponent },

  // Organization Portal Routes
  { path: 'org/dashboard', component: OrgDashboardComponent },
  { path: 'org/stakeholders', component: OrgStakeholdersComponent },
  { path: 'org/orders', component: OrgOrdersComponent },
  { path: 'org/defects', component: OrgDefectsComponent },
  { path: 'org/investigation', component: OrgInvestigationComponent },
  { path: 'org/investigation/:defectCaseId', component: OrgInvestigationComponent },
  { path: 'org/investigation/:defectCaseId/backtracking', component: OrgBacktrackingComponent },
  { path: 'org/recalls', component: OrgRecallsComponent },
  { path: 'org/notifications', component: OrgNotificationsComponent },

  // Stakeholder Portal Routes
  { path: 'stakeholder/dashboard', component: StakeholderDashboardComponent },

  { path: '**', redirectTo: 'traceability' },
];
