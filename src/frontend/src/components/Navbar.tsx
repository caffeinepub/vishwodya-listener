import { Button } from "@/components/ui/button";
import { Link, useRouterState } from "@tanstack/react-router";
import { Headphones } from "lucide-react";

export default function Navbar() {
  const router = useRouterState();
  const pathname = router.location.pathname;
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2"
          data-ocid="nav.home_link"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Headphones className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-semibold text-lg text-foreground tracking-tight">
            Vishwodya
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="nav.home_link"
          >
            Home
          </Link>
          <Button asChild size="sm" data-ocid="nav.book_link">
            <Link to="/book">Talk to a Listener</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
