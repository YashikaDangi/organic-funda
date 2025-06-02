import Dashboard from "@/components/Dashboard";
import Footer from "@/components/Footer";
import Hero from "@/components/HeroSection";
import MushroomSlider from "@/components/MushroomSlider";
import RecipeSection from "@/components/RecipeSection";
export default function Home() {
  return (
    <div className="">
      <Hero/>
      <Dashboard/>
      <MushroomSlider/>
      <RecipeSection/>
      <Footer/>
    </div>
  );
}
