import { useState } from "react";
import { Link } from "wouter";
import { GraduationCap, Menu, X, ChevronDown, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
            <GraduationCap className="text-xl sm:text-2xl text-primary" />
            <span className="text-xl sm:text-2xl font-bold gradient-text break-words" data-testid="logo-admin-trigger">Notes Bro</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-foreground hover:text-primary transition-colors" data-testid="link-home-nav">
              Home
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-foreground hover:text-primary transition-colors" data-testid="dropdown-contact">
                Contact
                <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem className="cursor-pointer" onClick={() => window.location.href = 'mailto:notesbro34@gmail.com'} data-testid="contact-email">
                  <Mail className="mr-2 h-4 w-4" />
                  notesbro34@gmail.com
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            data-testid="button-menu-toggle"
          >
            {isMenuOpen ? <X className="text-xl" /> : <Menu className="text-xl" />}
          </Button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 animate-fade-in">
            <Link href="/" className="block text-foreground hover:text-primary transition-colors" data-testid="link-home-mobile">
              Home
            </Link>
            <button 
              onClick={() => window.location.href = 'mailto:notesbro34@gmail.com'} 
              className="flex items-center w-full text-left text-foreground hover:text-primary transition-colors" 
              data-testid="contact-email-mobile"
            >
              <Mail className="mr-2 h-4 w-4" />
              Contact - notesbro34@gmail.com
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
