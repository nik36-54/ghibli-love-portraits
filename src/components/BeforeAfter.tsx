
import { useEffect, useRef } from 'react';

const BeforeAfter = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftImageRef = useRef<HTMLDivElement>(null);
  const rightImageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (leftImageRef.current) {
            leftImageRef.current.classList.add('animate-slide-in-left');
            leftImageRef.current.classList.remove('opacity-0');
          }
          if (rightImageRef.current) {
            rightImageRef.current.classList.add('animate-slide-in-right');
            rightImageRef.current.classList.remove('opacity-0');
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
    <section ref={sectionRef} className="py-16 px-4 bg-ghibli-light/50">
      <div className="container mx-auto">
        <h2 className="section-title text-center mx-auto">Before and After Ghibli Portrait</h2>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-12">
          <div 
            ref={leftImageRef}
            className="opacity-0 flex-1 max-w-md ghibli-card p-4 flex flex-col items-center"
          >
            <div className="rounded-lg overflow-hidden shadow-lg mb-4 w-full aspect-[4/5]">
              <img 
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80" 
                alt="Original portrait" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-lg font-medium text-foreground">Original Photo</span>
          </div>
          
          <div className="hidden md:flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ghibli-deep">
              <path d="m5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </div>
          
          <div 
            ref={rightImageRef}
            className="opacity-0 flex-1 max-w-md ghibli-card p-4 flex flex-col items-center"
          >
            <div className="rounded-lg overflow-hidden shadow-lg mb-4 w-full aspect-[4/5]">
              <img 
                src="https://images.pexels.com/photos/10757598/pexels-photo-10757598.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Ghibli style portrait" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-lg font-medium text-foreground">Ghibli Portrait</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BeforeAfter;
