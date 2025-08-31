import { Star, Clock, Smartphone, Users } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: Star,
      title: "Premium Quality",
      description: "Expertly crafted notes by experienced educators",
      color: "text-primary"
    },
    {
      icon: Clock,
      title: "Save Time",
      description: "Quick access to organized, comprehensive study materials",
      color: "text-secondary"
    },
    {
      icon: Smartphone,
      title: "Mobile Friendly",
      description: "Study anywhere, anytime with our responsive platform",
      color: "text-accent"
    },
    {
      icon: Users,
      title: "Community",
      description: "Join thousands of successful students",
      color: "text-primary"
    }
  ];

  return (
    <section className="py-16 bg-muted/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-4xl font-bold mb-4 gradient-text">Why Choose Notes Bro?</h2>
          <p className="text-lg text-muted-foreground">Discover what makes us the best study companion</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center hover-lift" data-testid={`feature-${index}`}>
              <div className={`bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <feature.icon className={`text-2xl ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold mb-2" data-testid={`text-feature-title-${index}`}>
                {feature.title}
              </h3>
              <p className="text-muted-foreground" data-testid={`text-feature-description-${index}`}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
