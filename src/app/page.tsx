import Dashboard from "@/components/Dashboard";
import Footer from "@/components/Footer";
import Hero from "@/components/HeroSection";
import MushroomEncyclopedia from "@/components/MushroomEncyclopedia";
export default function Home() {
  return (
    <div className="">
      <Hero/>
      <Dashboard/>
      <MushroomEncyclopedia/>
      <Footer/>
    </div>
  );
}
