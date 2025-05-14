import Dashboard from "@/components/Dashboard";
import Footer from "@/components/Footer";
import Hero from "@/components/HeroSection";
import MushroomEncyclopedia from "@/components/MushroomEncyclopedia";
import RecipeSection from "@/components/RecipeSection";
export default function Home() {
  return (
    <div className="">
      <Hero/>
      <Dashboard/>
      <MushroomEncyclopedia/>
      <RecipeSection/>
      <Footer/>
    </div>
  );
}
