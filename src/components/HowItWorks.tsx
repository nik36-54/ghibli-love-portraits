
import { useEffect, useRef } from 'react';

interface StepProps {
  number: number;
  title: string;
  description: string;
  delay: string;
}

const Step = ({ number, title, description, delay }: StepProps) => {
  return (
    <div 
      className="how-it-works-step" 
      style={{ animationDelay: delay }}
    >
      <div className="absolute -top-4 -left-4 w-10 h-10 bg-ghibli-gradient rounded-full flex items-center justify-center text-white font-bold shadow-md">
        {number}
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2 pt-2">{title}</h3>
      <p className="text-foreground/80">{description}</p>
    </div>
  );
};

const HowItWorks = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (stepsRef.current) {
            stepsRef.current.classList.add('stagger-animation');
          }
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  return (
    <section id="how-it-works" ref={sectionRef} className="py-16 px-4 bg-ghibli-light/50">
      <div className="container mx-auto">
        <h2 className="section-title text-center mx-auto">How It Works</h2>
        
        <div 
          ref={stepsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto"
        >
          <Step 
            number={1} 
            title="Upload a Photo" 
            description="Pick a clear, high-quality image of yourself or your loved ones."
            delay="0.1s"
          />
          
          <Step 
            number={2} 
            title="We Transform It" 
            description="Our artists create a beautiful Ghibli-style masterpiece with care and attention to detail."
            delay="0.3s"
          />
          
          <Step 
            number={3} 
            title="Get It Delivered" 
            description="Receive your portrait digitally or as a framed print, ready to gift or display."
            delay="0.5s"
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
