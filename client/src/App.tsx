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
import SmartAssignment from "./pages/SmartAssignment";
import Financial from "./pages/Financial";
import Fees from "./pages/Fees";
import Reports from "./pages/Reports";
import OrganizationUnits from "@/pages/OrganizationUnits";
import DailyRoutine from "@/pages/DailyRoutine";
import UserManagement from "@/pages/UserManagement";
import MyProfile from "./pages/MyProfile";

import OrganizationSimple from "@/pages/OrganizationSimple";

import ResidentToday from "@/pages/ResidentToday";
import ResidentInformation from "@/pages/ResidentInformation";
import ResidentFinance from "@/pages/ResidentFinance";
import ResidentLeadershipOverview from "@/pages/ResidentLeadershipOverview";
import ResidentLeadershipOrganization from "@/pages/ResidentLeadershipOrganization";
import ResidentLeadershipDuties from "@/pages/ResidentLeadershipDuties";
import ResidentTeamMembers from "@/pages/ResidentTeamMembers";
import ResidentTeamDuties from "@/pages/ResidentTeamDuties";
import ResidentCommitteeMembers from "@/pages/ResidentCommitteeMembers";
import ResidentCommitteeDuties from "@/pages/ResidentCommitteeDuties";


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
                  <Route path="/organization" component={OrganizationSimple} />

                  {/* Nội quy & Kỷ luật */}
                  <Route path="/discipline-rules" component={DisciplineRules} />
                  <Route path="/discipline-cases" component={DisciplineCases} />

                  {/* Các route cũ đang có trong dự án */}
                  <Route path="/attendance" component={Attendance} />
                  <Route path="/tasks" component={Tasks} />
                  <Route path="/schedule" component={Schedule} />
                  <Route path="/activities" component={Activities} />
                  <Route path="/duties" component={DutiesPage} />
                  <Route path="/smart-assignment" component={SmartAssignment} />
                  <Route path="/financial" component={Financial} />
                  <Route path="/fees" component={Fees} />
                  <Route path="/reports" component={Reports} />

                  <Route path="/daily-routine" component={DailyRoutine} />
                  <Route path="/my-duties" component={MyDuties} />

                  <Route path="/settings/users" component={UserManagement} />
                  <Route path="/my-profile" component={MyProfile} />

                  {/* Resident portal */}
                  <Route path="/resident/today" component={ResidentToday} />
                  <Route path="/resident/information" component={ResidentInformation} />
                  <Route path="/resident/finance" component={ResidentFinance} />

                  {/* Vai trò của tôi - Simple Mode paths */}
                  <Route path="/resident/organization" component={ResidentLeadershipOrganization} />
                  <Route path="/resident/role-duties" component={ResidentLeadershipDuties} />
                  <Route path="/resident/my-team" component={ResidentTeamMembers} />
                  <Route path="/resident/team-duties" component={ResidentTeamDuties} />
                  <Route path="/resident/my-committee" component={ResidentCommitteeMembers} />
                  <Route path="/resident/committee-duties" component={ResidentCommitteeDuties} />

                  {/* Vai trò điều hành - old route aliases kept to avoid breaking existing links */}
                  <Route path="/resident/leadership/overview" component={ResidentLeadershipOverview} />
                  <Route path="/resident/leadership/organization" component={ResidentLeadershipOrganization} />
                  <Route path="/resident/leadership/duties" component={ResidentLeadershipDuties} />

                  {/* Vai trò Tổ trưởng - old route aliases kept */}
                  <Route path="/resident/team/members" component={ResidentTeamMembers} />
                  <Route path="/resident/team/duties" component={ResidentTeamDuties} />

                  {/* Vai trò Trưởng ban - old route aliases kept */}
                  <Route path="/resident/committee/members" component={ResidentCommitteeMembers} />
                  <Route path="/resident/committee/duties" component={ResidentCommitteeDuties} />

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