
const Footer = () => {
  return (
    <footer className="py-10 px-4 border-t border-ghibli-pink/30">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <a 
              href="/" 
              className="text-xl font-display font-bold text-ghibli-deep"
            >
              <span className="text-ghibli-deep">Ghibli</span>
              <span className="text-ghibli-rose">Magic</span>
            </a>
            <p className="text-sm text-foreground/70 mt-2">
              Bringing warmth to your memories
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            <a href="#upload" className="text-foreground hover:text-ghibli-deep transition-colors">
              Get Started
            </a>
            <a href="#how-it-works" className="text-foreground hover:text-ghibli-deep transition-colors">
              How It Works
            </a>
            <a href="#testimonials" className="text-foreground hover:text-ghibli-deep transition-colors">
              Testimonials
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-ghibli-pink/20 text-center">
          <p className="text-sm text-foreground/60">
            © 2025 GhibliMagic. Bringing warmth to your memories.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <a href="#" className="text-foreground/60 hover:text-ghibli-deep transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-foreground/60 hover:text-ghibli-deep transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
