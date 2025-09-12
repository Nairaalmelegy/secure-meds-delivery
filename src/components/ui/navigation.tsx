import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Pill, Stethoscope, UserPlus, LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

interface NavigationProps {
  onAuthClick: (type: 'login' | 'register') => void;
}

export function Navigation({ onAuthClick }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <nav className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <Pill className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary">MediLink</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors">
              How it Works
            </a>
            <a href="#for-patients" className="text-foreground hover:text-primary transition-colors">
              For Patients
            </a>
            <a href="#for-doctors" className="text-foreground hover:text-primary transition-colors">
              For Doctors
            </a>
            <a href="#demo" className="text-foreground hover:text-primary transition-colors">
              Tour Guide
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {user.name}
                  </span>
                  <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded-full">
                    {user.role}
                  </span>
                </div>
                <Button 
                  asChild
                  variant="outline"
                  size="sm"
                >
                  <Link to={user.role === 'doctor' ? '/doctor-dashboard' : '/dashboard'}>
                    Dashboard
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={logout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => onAuthClick('login')}
                  className="flex items-center space-x-2"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Button>
                <Button 
                  onClick={() => onAuthClick('register')}
                  className="flex items-center space-x-2 bg-gradient-primary hover:opacity-90"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Sign Up</span>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <a href="#how-it-works" className="block text-foreground hover:text-primary">
              How it Works
            </a>
            <a href="#for-patients" className="block text-foreground hover:text-primary">
              For Patients
            </a>
            <a href="#for-doctors" className="block text-foreground hover:text-primary">
              For Doctors
            </a>
            <a href="#demo" className="block text-foreground hover:text-primary">
              Tour Guide
            </a>
            <div className="flex flex-col space-y-2 pt-4 border-t border-border">
              {user ? (
                <>
                  <div className="flex items-center space-x-2 px-3 py-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-sm text-foreground">
                        {user.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <Button 
                    asChild
                    variant="outline"
                    className="justify-start"
                  >
                    <Link to={user.role === 'doctor' ? '/doctor-dashboard' : '/dashboard'}>
                      Dashboard
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={logout}
                    className="justify-start"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => onAuthClick('login')}
                    className="justify-start"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                  <Button 
                    onClick={() => onAuthClick('register')}
                    className="justify-start bg-gradient-primary"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}