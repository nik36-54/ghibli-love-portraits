
import { Github, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-10 px-4 border-t border-[#ee2a7b]/30">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <a 
              href="/" 
              className="text-xl font-display font-bold"
            >
              <span className="text-[#ee2a7b]">Ghibli</span>
              <span className="text-[#6228d7]">Snap</span>
            </a>
            <p className="text-sm text-foreground/70 mt-2">
              Bringing warmth to your memories
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            <a href="#upload" className="text-foreground hover:text-[#ee2a7b] transition-colors">
              Get Started
            </a>
            <a href="#how-it-works" className="text-foreground hover:text-[#ee2a7b] transition-colors">
              How It Works
            </a>
            <a href="#testimonials" className="text-foreground hover:text-[#ee2a7b] transition-colors">
              Testimonials
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-[#ee2a7b]/20 text-center">
          <div className="flex justify-center gap-6 mb-4">
            <a href="#" className="text-foreground/70 hover:text-[#ee2a7b] transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-foreground/70 hover:text-[#ee2a7b] transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-foreground/70 hover:text-[#ee2a7b] transition-colors">
              <Github size={20} />
            </a>
          </div>
          
          <p className="text-sm text-foreground/60">
            © 2025 GhibliSnap. Bringing warmth to your memories.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <a href="#" className="text-foreground/60 hover:text-[#ee2a7b] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-foreground/60 hover:text-[#ee2a7b] transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
