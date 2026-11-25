import "@/App.css";
import { HashRouter, Routes, Route } from "react-router-dom";
import { LangProvider } from "@/context/LangContext";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Method from "@/components/Method";
import Services from "@/components/Services";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import About from "@/components/About";
import FAQ from "@/components/FAQ";
import Launch from "@/components/Launch";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import { LAUNCH_MODE } from "@/lib/launch";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Piani from "@/pages/Piani";

function MainSite() {
  return (
    <LangProvider>
      <div className="min-h-screen bg-[var(--bg-base)] grain" data-testid="app-root">
        <Header />
        <main>
          <Hero />
          <Method />
          <Services />
          <Stats />
          <Testimonials />
          <About />
          <FAQ />
          {LAUNCH_MODE && <Launch />}
        </main>
        <Footer />
        <Chatbot />
      </div>
    </LangProvider>
  );
}

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainSite />} />
          <Route path="/piani" element={<Piani />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
