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
import Rooms from "./pages/Rooms";
import Attendance from "./pages/Attendance";
import Tasks from "./pages/Tasks";
import Fees from "./pages/Fees";
import Reports from "./pages/Reports";
import Members from "./pages/Members";
import Schedule from "./pages/Schedule";
import Activities from "./pages/Activities";
import DutiesPage from "./pages/Duties";
import Financial from "./pages/Financial";


function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/residents" component={Residents} />
      <Route path="/members" component={Members} />
      <Route path="/rooms" component={Rooms} />
      <Route path="/attendance" component={Attendance} />
      <Route path="/duties" component={DutiesPage} />      
      <Route path="/financial" component={Financial} />
      <Route path="/fees" component={Fees} />
      <Route path="/schedule" component={Schedule} />
      <Route path="/activities" component={Activities} />
      <Route path="/reports" component={Reports} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
