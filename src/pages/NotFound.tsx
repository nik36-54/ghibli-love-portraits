
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ghibli-light/20 px-4">
      <div className="text-center max-w-md backdrop-blur-card p-8 animate-fade-in">
        <h1 className="text-5xl font-display font-bold text-ghibli-deep mb-4">404</h1>
        <p className="text-xl text-foreground mb-6">Oops! We couldn't find that page</p>
        <p className="text-foreground/70 mb-8">The page you're looking for might have been moved or doesn't exist.</p>
        <a 
          href="/" 
          className="ghibli-btn inline-flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Return Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
