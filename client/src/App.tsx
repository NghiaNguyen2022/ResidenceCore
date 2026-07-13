import { lazy, Suspense, useDeferredValue } from "react";
import { LoaderCircle } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";

import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Members = lazy(() => import("./pages/Members"));
const Rooms = lazy(() => import("./pages/Rooms"));
const OrganizationSimple = lazy(() => import("@/pages/OrganizationSimple"));
const DailyRoutine = lazy(() => import("@/pages/DailyRoutine"));
const DutiesPage = lazy(() => import("./pages/Duties"));
const MyDuties = lazy(() => import("./pages/MyDuties"));
const Activities = lazy(() => import("./pages/Activities"));
const DisciplineRules = lazy(() => import("./pages/DisciplineRules"));
const UserManagement = lazy(() => import("@/pages/UserManagement"));
const MyProfile = lazy(() => import("./pages/MyProfile"));
const ResidentToday = lazy(() => import("@/pages/ResidentToday"));
const ResidentInformation = lazy(() => import("@/pages/ResidentInformation"));
const ResidentFinance = lazy(() => import("@/pages/ResidentFinance"));
const ResidentRules = lazy(() => import("@/pages/ResidentRules"));
const ResidentNotifications = lazy(() => import("@/pages/ResidentNotifications"));
const ResidentActivities = lazy(() => import("@/pages/ResidentActivities"));
const ResidentRoleOverview = lazy(() => import("@/pages/ResidentRoleOverview"));
const ResidentLeadershipOrganization = lazy(() => import("@/pages/ResidentLeadershipOrganization"));
const ResidentLeadershipDuties = lazy(() => import("@/pages/ResidentLeadershipDuties"));
const ResidentTeamMembers = lazy(() => import("@/pages/ResidentTeamMembers"));
const ResidentTeamDuties = lazy(() => import("@/pages/ResidentTeamDuties"));
const ResidentCommitteeMembers = lazy(() => import("@/pages/ResidentCommitteeMembers"));
const ResidentCommitteeDuties = lazy(() => import("@/pages/ResidentCommitteeDuties"));
const FinanceLite = lazy(() => import("@/pages/FinanceLite"));
const StoreLedger = lazy(() => import("@/pages/StoreLedger"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function RouteFallback() {
      return (
            <div
                  className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#fffdf8_0%,#ffffff_55%,#fff7ed_100%)]"
                  aria-busy="true"
                  aria-label="Đang tải nội dung"
            >
                  <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-white/90 px-5 py-3 text-sm font-semibold text-slate-700 shadow-lg shadow-amber-950/5">
                        <LoaderCircle className="h-5 w-5 animate-spin text-amber-600" />
                        Đang tải...
                  </div>
            </div>
      );
}

function Router() {
      const [location] = useLocation();
      const deferredLocation = useDeferredValue(location);
      const isNavigating = location !== deferredLocation;

      return (
            <>
            <Switch location={deferredLocation}>
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
                  <Route path="/store-ledger" component={StoreLedger} />
                  <Route path="/store-products" component={StoreLedger} />
                  <Route path="/store-purchase" component={StoreLedger} />
                  <Route path="/store-sales" component={StoreLedger} />
                  <Route path="/store-cashflow" component={StoreLedger} />
                  <Route path="/discipline-rules" component={DisciplineRules} />
                  <Route path="/settings/users" component={UserManagement} />
                  <Route path="/my-profile" component={MyProfile} />

                  {/* Resident portal */}
                  <Route path="/resident/today" component={ResidentToday} />
                  <Route path="/resident/information" component={ResidentInformation} />
                  <Route path="/resident/rules" component={ResidentRules} />
                  <Route path="/resident/notifications" component={ResidentNotifications} />
                  <Route path="/resident/finance" component={ResidentFinance} />
                  <Route path="/resident/activities" component={ResidentActivities} />
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
            {isNavigating && (
                  <div
                        className="fixed inset-0 z-[9998] cursor-progress bg-white/10 backdrop-blur-[1px]"
                        aria-busy="true"
                        aria-live="polite"
                        aria-label="Đang chuyển trang"
                  >
                        <div className="absolute inset-x-0 top-0 h-1 overflow-hidden bg-amber-100/80">
                              <div className="h-full w-1/3 animate-pulse rounded-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.7)]" />
                        </div>
                        <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full border border-amber-100 bg-white/95 px-3 py-2 text-xs font-bold text-slate-700 shadow-lg shadow-slate-900/10">
                              <LoaderCircle className="h-4 w-4 animate-spin text-amber-600" />
                              Đang tải
                        </div>
                  </div>
            )}
            </>
      );
}

function App() {
      return (
            <ErrorBoundary>
                  <ThemeProvider>
                        <TooltipProvider>
                              <Suspense fallback={<RouteFallback />}>
                                    <Router />
                              </Suspense>
                              <Toaster />
                        </TooltipProvider>
                  </ThemeProvider>
            </ErrorBoundary>
      );
}

export default App;
