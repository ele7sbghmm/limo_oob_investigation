import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APITester } from "./APITester";
import "./index.css";

import logo from "./logo.svg";
import reactLogo from "./react.svg";

import ThreeScene from "@/components/Three"

export function App() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-4">work'</h1>
      <ThreeScene />
    </main>
  );
}

export default App;
