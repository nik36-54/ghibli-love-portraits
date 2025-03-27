
import { useEffect, useRef } from 'react';

interface TestimonialProps {
  quote: string;
  author: string;
  delay: string;
}

const Testimonial = ({ quote, author, delay }: TestimonialProps) => {
  return (
    <div 
      className="testimonial-card" 
      style={{ animationDelay: delay }}
    >
      <svg className="h-8 w-8 text-ghibli-rose mb-4 opacity-70" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
      </svg>
      <p className="text-foreground mb-4">{quote}</p>
      <p className="text-ghibli-deep font-medium">- {author}</p>
    </div>
  );
};

const Testimonials = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (testimonialsRef.current) {
            testimonialsRef.current.classList.add('stagger-animation');
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
    <section id="testimonials" ref={sectionRef} className="py-16 px-4">
      <div className="container mx-auto">
        <h2 className="section-title text-center mx-auto">What Our Customers Say</h2>
        
        <div 
          ref={testimonialsRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 max-w-4xl mx-auto"
        >
          <Testimonial 
            quote="A gift filled with love and nostalgia. My wife cried happy tears seeing her Ghibli portrait!"
            author="Alex"
            delay="0.1s"
          />
          
          <Testimonial 
            quote="It's magical! The warmth and detail in my Ghibli portrait are stunning. Best anniversary gift ever!"
            author="Emma"
            delay="0.3s"
          />
          
          <Testimonial
            quote="The transformation was incredible! Our family portrait in Ghibli style is now our favorite wall art."
            author="James"
            delay="0.5s"
          />
          
          <Testimonial
            quote="Such a thoughtful way to preserve our memories. The illustration quality exceeded my expectations!"
            author="Sophia"
            delay="0.7s"
          />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
