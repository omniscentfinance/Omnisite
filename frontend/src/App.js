import "@/App.css";
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
    <div className="min-h-screen bg-white" data-testid="app-root">
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
  );
}

export default App;
