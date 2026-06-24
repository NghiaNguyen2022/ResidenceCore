import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";

import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Rooms from "./pages/Rooms";
import OrganizationSimple from "@/pages/OrganizationSimple";
import DailyRoutine from "@/pages/DailyRoutine";
import DutiesPage from "./pages/Duties";
import MyDuties from "./pages/MyDuties";
import Activities from "./pages/Activities";
import DisciplineRules from "./pages/DisciplineRules";
import UserManagement from "@/pages/UserManagement";
import MyProfile from "./pages/MyProfile";

import ResidentToday from "@/pages/ResidentToday";
import ResidentInformation from "@/pages/ResidentInformation";
import ResidentFinance from "@/pages/ResidentFinance";
import ResidentRules from "@/pages/ResidentRules";
import ResidentRoleOverview from "@/pages/ResidentRoleOverview";
import ResidentLeadershipOrganization from "@/pages/ResidentLeadershipOrganization";
import ResidentLeadershipDuties from "@/pages/ResidentLeadershipDuties";
import ResidentTeamMembers from "@/pages/ResidentTeamMembers";
import ResidentTeamDuties from "@/pages/ResidentTeamDuties";
import ResidentCommitteeMembers from "@/pages/ResidentCommitteeMembers";
import ResidentCommitteeDuties from "@/pages/ResidentCommitteeDuties";
import FinanceLite from '@/pages/FinanceLite';

function Router() {
      return (
            <Switch>
                  <Route path="/" component={Home} />
                  <Route path="/login" component={Login} />

                  {/* Manager main flow */}
                  <Route path="/dashboard" component={Dashboard} />
                  <Route path="/members" component={Members} />
                  <Route path="/rooms" component={Rooms} />
                  <Route path="/organization" component={OrganizationSimple} />
                  <Route path="/daily-routine" component={DailyRoutine} />
                  <Route path="/duties" component={DutiesPage} />
                  <Route path="/my-duties" component={MyDuties} />

                  {/* Main-flow adjacent screens kept visible in Simple/Detailed config */}
                  <Route path="/activities" component={Activities} />
                  <Route path="/discipline-rules" component={DisciplineRules} />
                  <Route path="/settings/users" component={UserManagement} />
                  <Route path="/my-profile" component={MyProfile} />

                  {/* Resident portal */}
                  <Route path="/resident/today" component={ResidentToday} />
                  <Route path="/resident/information" component={ResidentInformation} />
                  <Route path="/resident/rules" component={ResidentRules} />
                  <Route path="/resident/finance" component={ResidentFinance} />
                  <Route path="/resident/roles" component={ResidentRoleOverview} />
                  <Route path="/resident/organization" component={ResidentLeadershipOrganization} />
                  <Route path="/resident/role-duties" component={ResidentLeadershipDuties} />
                  <Route path="/resident/my-team" component={ResidentTeamMembers} />
                  <Route path="/resident/team-duties" component={ResidentTeamDuties} />
                  <Route path="/resident/my-committee" component={ResidentCommitteeMembers} />
                  <Route path="/resident/committee-duties" component={ResidentCommitteeDuties} />

                        <Route path="/finance" component={FinanceLite} />
<Route component={NotFound} />
            </Switch>
      );
}

function App() {
      return (
            <ErrorBoundary>
                  <ThemeProvider>
                        <TooltipProvider>
                              <Router />
                              <Toaster />
                        </TooltipProvider>
                  </ThemeProvider>
            </ErrorBoundary>
      );
}

export default App;
