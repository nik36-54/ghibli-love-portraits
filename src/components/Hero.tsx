
import { useEffect, useRef } from 'react';

const Hero = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          entry.target.classList.remove('opacity-0');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    if (titleRef.current) observer.observe(titleRef.current);
    if (subtitleRef.current) observer.observe(subtitleRef.current);
    if (buttonRef.current) observer.observe(buttonRef.current);

    return () => {
      if (titleRef.current) observer.unobserve(titleRef.current);
      if (subtitleRef.current) observer.unobserve(subtitleRef.current);
      if (buttonRef.current) observer.unobserve(buttonRef.current);
    };
  }, []);

  return (
    <section className="relative pt-28 pb-20 overflow-hidden">
      {/* Animated decorative elements */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-ghibli-pink rounded-full filter blur-3xl opacity-30 animate-pulse-soft"></div>
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-ghibli-rose rounded-full filter blur-3xl opacity-20 animate-float"></div>
      
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 
            ref={titleRef}
            className="opacity-0 font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
          >
            Animify Yourself & Your{' '}
            <span className="text-ghibli-deep">Loved Ones</span>
          </h1>
          
          <p 
            ref={subtitleRef}
            className="opacity-0 text-lg md:text-xl text-foreground/80 mb-8 max-w-2xl mx-auto"
          >
            Turn your memories into a timeless Ghibli-style portrait — a perfect gift for someone special.
          </p>
          
          <a 
            href="#upload"
            ref={buttonRef}
            className="opacity-0 ghibli-btn inline-block" 
          >
            Create Your Portrait
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
