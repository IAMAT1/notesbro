import { Book, Lightbulb, GraduationCap, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const scrollToSubjects = () => {
    const element = document.getElementById("subjects");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden py-20 bg-gradient-to-br from-primary/5 to-secondary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center animate-fade-in px-2">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 break-words">
            Welcome to <span className="gradient-text">Notes Bro</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Your ultimate study companion for premium notes, one-pagers, and animated learning materials. 
            Ace your exams with our comprehensive note collection.
          </p>
          <div className="flex justify-center">
            <Button 
              onClick={scrollToSubjects}
              className="bg-primary text-primary-foreground px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover-lift neon-glow"
              data-testid="button-start-learning"
            >
              <Rocket className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Start Learning
            </Button>
          </div>
        </div>
      </div>
      
      {/* Floating Icons Animation - Hidden on small screens to prevent overlap */}
      <div className="hidden md:block absolute top-20 left-10 text-secondary/30 animate-bounce-subtle">
        <Book className="text-3xl" />
      </div>
      <div className="hidden md:block absolute top-40 right-20 text-accent/30 animate-bounce-subtle" style={{animationDelay: "0.5s"}}>
        <Lightbulb className="text-2xl" />
      </div>
      <div className="hidden md:block absolute bottom-20 left-20 text-primary/30 animate-bounce-subtle" style={{animationDelay: "1s"}}>
        <GraduationCap className="text-4xl" />
      </div>
    </section>
  );
}
