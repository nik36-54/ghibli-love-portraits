
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4',
      scrolled ? 'bg-white/80 backdrop-blur-lg shadow-md' : 'bg-transparent'
    )}>
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <a 
            href="/" 
            className="text-2xl font-display font-bold text-ghibli-deep"
          >
            <span className="text-[#ee2a7b]">Anime</span>
            <span className="text-[#6228d7]">Vista</span>
          </a>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-foreground hover:text-ghibli-deep transition-colors">How It Works</a>
            <a href="#testimonials" className="text-foreground hover:text-ghibli-deep transition-colors">Testimonials</a>
            <a href="#upload" className="ghibli-btn">Animify Now</a>
          </nav>
          
          <button className="md:hidden text-ghibli-deep">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
