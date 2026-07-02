import "@/App.css";
import { HashRouter, Routes, Route } from "react-router-dom";
import { LangProvider } from "@/context/LangContext";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";
import TickerBanner from "@/components/TickerBanner";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import About from "@/components/About";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";

function MainSite() {
  return (
    <LangProvider>
      <div className="min-h-screen bg-[#09090B]" data-testid="app-root">
        <Header />
        <main>
          <Hero />
          <TickerBanner />
          <Services />
          <Stats />
          <Testimonials />
          <About />
          <FAQ />
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
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
