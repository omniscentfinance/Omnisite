import "@/App.css";
import { LangProvider } from "@/context/LangContext";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import About from "@/components/About";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

function App() {
  return (
    <LangProvider>
      <div className="min-h-screen bg-[#09090B]" data-testid="app-root">
        <Header />
        <main>
          <Hero />
          <Services />
          <Stats />
          <Testimonials />
          <About />
          <FAQ />
        </main>
        <Footer />
      </div>
    </LangProvider>
  );
}

export default App;
