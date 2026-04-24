import { Route, Switch } from "wouter";
import AgentPanel from "./pages/AgentPanel";

export default function App() {
  return (
    <Switch>
      <Route path="/" component={AgentPanel} />
      <Route path="/agent" component={AgentPanel} />
      <Route>
        <div className="h-screen flex items-center justify-center">
          <p className="text-gray-500">Page not found</p>
        </div>
      </Route>
    </Switch>
  );
}
