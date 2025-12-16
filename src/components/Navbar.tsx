import { Button } from "@/components/ui/button";
import { MusicWaves } from "./MusicWaves";
import { Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <MusicWaves className="group-hover:scale-110 transition-transform" barCount={4} />
            <span className="font-display font-bold text-xl text-foreground">
              Tune<span className="text-primary">trails</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="/#features" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Features
            </a>
            <a href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              How It Works
            </a>
            <Link to="/teachers" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Find Teachers
            </Link>
            <a href="/#gigs" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Gig Marketplace
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? null : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Log In</Link>
                </Button>
                <Button variant="default" asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-4">
              <a href="/#features" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                Features
              </a>
              <a href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                How It Works
              </a>
              <Link to="/teachers" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2" onClick={() => setIsOpen(false)}>
                Find Teachers
              </Link>
              <a href="/#gigs" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                Gig Marketplace
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                {user ? (
                  <Button variant="ghost" className="w-full" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" className="w-full" asChild>
                      <Link to="/auth" onClick={() => setIsOpen(false)}>Log In</Link>
                    </Button>
                    <Button variant="default" className="w-full" asChild>
                      <Link to="/auth" onClick={() => setIsOpen(false)}>Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
