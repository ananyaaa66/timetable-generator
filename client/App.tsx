import "./global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Home from "@/pages/Home";
import TimetableGenerator from "@/pages/TimetableGenerator";
import About from "@/pages/About";
import NotFound from "@/pages/NotFound";
import { RootLayout } from "@/components/layout/RootLayout";

const queryClient = new QueryClient();

const LayoutShell = () => (
  <RootLayout>
    <Outlet />
  </RootLayout>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<LayoutShell />}>
            <Route index element={<Home />} />
            <Route path="generator" element={<TimetableGenerator />} />
            <Route path="about" element={<About />} />
          </Route>
          <Route path="*" element={<RootLayout><NotFound /></RootLayout>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
