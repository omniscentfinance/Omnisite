import "@/App.css";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
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
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import { LAUNCH_MODE } from "@/lib/launch";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Piani from "@/pages/Piani";
import LaunchLanding from "@/pages/LaunchLanding";

/** Il sito completo: torna visibile quando LAUNCH_MODE passa a false. */
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
          {/* In modalità lancio la home è solo l'iscrizione: nessun servizio
              attivo, nessuna recensione, nessun piano in vendita. */}
          <Route path="/" element={LAUNCH_MODE ? <LaunchLanding /> : <MainSite />} />
          <Route path="/piani" element={LAUNCH_MODE ? <Navigate to="/" replace /> : <Piani />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          {/* Rotte vecchie o link esterni: tutto torna alla pagina di lancio. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
