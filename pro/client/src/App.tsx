import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import ProjectDetail from "@/pages/project-detail";
import Calendar from "@/pages/calendar";
import Team from "@/pages/team";
import Reports from "@/pages/reports";
import { ProjectProvider } from "./context/project-context";
import Sidebar from "./components/layout/sidebar";
import MobileNav from "./components/layout/mobile-nav";

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col md:ml-64 flex-1 overflow-hidden">
        {children}
      </div>
      <MobileNav />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        {() => (
          <MainLayout>
            <Dashboard />
          </MainLayout>
        )}
      </Route>
      <Route path="/projects">
        {() => (
          <MainLayout>
            <Projects />
          </MainLayout>
        )}
      </Route>
      <Route path="/projects/:id">
        {(params) => (
          <MainLayout>
            <ProjectDetail id={parseInt(params.id)} />
          </MainLayout>
        )}
      </Route>
      <Route path="/calendar">
        {() => (
          <MainLayout>
            <Calendar />
          </MainLayout>
        )}
      </Route>
      <Route path="/team">
        {() => (
          <MainLayout>
            <Team />
          </MainLayout>
        )}
      </Route>
      <Route path="/reports">
        {() => (
          <MainLayout>
            <Reports />
          </MainLayout>
        )}
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <TooltipProvider>
          <ProjectProvider>
            <Toaster />
            <Router />
          </ProjectProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
