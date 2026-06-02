import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";

import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import Residents from "./pages/Residents";
import Members from "./pages/Members";
import Rooms from "./pages/Rooms";
import Parents from "./pages/Parents";

import AcademicInfo from "./pages/AcademicInfo";
import AcademicEvaluations from "./pages/AcademicEvaluations";

import LiturgySchedule from "./pages/LiturgySchedule";
import LiturgyAttendance from "./pages/LiturgyAttendance";
import LiturgyAssignments from "./pages/LiturgyAssignments";

import Skills from "./pages/Skills";
import SkillClasses from "./pages/SkillClasses";
import SkillResults from "./pages/SkillResults";

import ActivityPlans from "./pages/ActivityPlans";
import Clubs from "./pages/Clubs";

import OrganizationTerms from "./pages/OrganizationTerms";
import OrganizationRoles from "./pages/OrganizationRoles";
import OrganizationStructure from "./pages/OrganizationStructure";

import DisciplineRules from "./pages/DisciplineRules";
import DisciplineCases from "./pages/DisciplineCases";

import Attendance from "./pages/Attendance";
import Tasks from "./pages/Tasks";
import Schedule from "./pages/Schedule";
import Activities from "./pages/Activities";
import DutiesPage from "./pages/Duties";
import MyDuties from "./pages/MyDuties";
import Financial from "./pages/Financial";
import Fees from "./pages/Fees";
import Reports from "./pages/Reports";
import OrganizationUnits from "@/pages/OrganizationUnits";
import DailyRoutine from "@/pages/DailyRoutine";



function Router() {
      return (
            <Switch>
                  <Route path="/" component={Home} />
                  <Route path="/login" component={Login} />
                  <Route path="/dashboard" component={Dashboard} />

                  {/* Quản lý lưu trú */}
                  <Route path="/residents" component={Residents} />
                  <Route path="/members" component={Members} />
                  <Route path="/rooms" component={Rooms} />
                  <Route path="/parents" component={Parents} />

                  {/* Học vụ */}
                  <Route path="/academic-info" component={AcademicInfo} />
                  <Route path="/academic-evaluations" component={AcademicEvaluations} />

                  {/* Phụng vụ & Cộng đoàn */}
                  <Route path="/liturgy-schedule" component={LiturgySchedule} />
                  <Route path="/liturgy-attendance" component={LiturgyAttendance} />
                  <Route path="/liturgy-assignments" component={LiturgyAssignments} />

                  {/* Đào tạo & Kỹ năng */}
                  <Route path="/skills" component={Skills} />
                  <Route path="/skill-classes" component={SkillClasses} />
                  <Route path="/skill-results" component={SkillResults} />

                  {/* Hoạt động & Sự kiện */}
                  <Route path="/activity-plans" component={ActivityPlans} />
                  <Route path="/clubs" component={Clubs} />

                  {/* Tổ chức lưu xá */}
                  <Route path="/organization-terms" component={OrganizationTerms} />
                  <Route path="/organization-roles" component={OrganizationRoles} />
                  <Route path="/organization-units" component={OrganizationUnits} />
                  <Route path="/organization-structure" component={OrganizationStructure} />

                  {/* Nội quy & Kỷ luật */}
                  <Route path="/discipline-rules" component={DisciplineRules} />
                  <Route path="/discipline-cases" component={DisciplineCases} />

                  {/* Các route cũ đang có trong dự án */}
                  <Route path="/attendance" component={Attendance} />
                  <Route path="/tasks" component={Tasks} />
                  <Route path="/schedule" component={Schedule} />
                  <Route path="/activities" component={Activities} />
                  <Route path="/duties" component={DutiesPage} />
                  <Route path="/financial" component={Financial} />
                  <Route path="/fees" component={Fees} />
                  <Route path="/reports" component={Reports} />

                  <Route path="/daily-routine" component={DailyRoutine} />
                  <Route path="/my-duties" component={MyDuties} />

                  {/* Final fallback route */}
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