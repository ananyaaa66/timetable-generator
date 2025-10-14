import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Compass } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.warn("404 - Route not found:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="glass-panel max-w-xl space-y-6 p-10 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
          <Compass className="size-7" />
        </span>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold">Page not found</h1>
          <p className="text-sm text-foreground/70">
            We could not find the page you were looking for. Explore the Timetable Generator to create a new schedule
            or return to the homepage for more options.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/" className="soft-button-primary">
            Back to Home
          </Link>
          <Link to="/generator" className="soft-button-secondary">
            Build a timetable
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
