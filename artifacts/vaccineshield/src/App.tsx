import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";

// Pages
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Patients from "@/pages/patients";
import Inventory from "@/pages/inventory";
import ColdChain from "@/pages/cold-chain";
import Scanner from "@/pages/scanner";
import Notifications from "@/pages/notifications";
import Reports from "@/pages/reports";
import Reconciliation from "@/pages/reconciliation";
import Feedback from "@/pages/feedback";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        {() => (
          <Layout>
            <Dashboard />
          </Layout>
        )}
      </Route>
      <Route path="/dashboard">
        {() => (
          <Layout>
            <Dashboard />
          </Layout>
        )}
      </Route>
      <Route path="/patients">
        {() => (
          <Layout>
            <Patients />
          </Layout>
        )}
      </Route>
      <Route path="/inventory">
        {() => (
          <Layout>
            <Inventory />
          </Layout>
        )}
      </Route>
      <Route path="/cold-chain">
        {() => (
          <Layout>
            <ColdChain />
          </Layout>
        )}
      </Route>
      <Route path="/scanner">
        {() => (
          <Layout>
            <Scanner />
          </Layout>
        )}
      </Route>
      <Route path="/notifications">
        {() => (
          <Layout>
            <Notifications />
          </Layout>
        )}
      </Route>
      <Route path="/reports">
        {() => (
          <Layout>
            <Reports />
          </Layout>
        )}
      </Route>
      <Route path="/reconciliation">
        {() => (
          <Layout>
            <Reconciliation />
          </Layout>
        )}
      </Route>
      <Route path="/feedback">
        {() => (
          <Layout>
            <Feedback />
          </Layout>
        )}
      </Route>
      <Route path="/settings">
        {() => (
          <Layout>
            <Settings />
          </Layout>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
