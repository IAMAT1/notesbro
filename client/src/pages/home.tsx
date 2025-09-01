import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import NotesSearch from "@/components/notes-search";
import FeaturesSection from "@/components/features-section";
import Footer from "@/components/footer";
import AdminPanel from "@/components/admin-panel";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import type { LoginRequest } from "@shared/schema";

export default function Home() {
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showAdminAccess, setShowAdminAccess] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();

  // Secret access methods - keyboard for desktop, tap sequence for mobile
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        setShowAdminAccess(true);
        toast({
          title: "Admin Access Enabled",
          description: "Admin controls are now visible.",
        });
      }
    };

    // Mobile: Triple tap on "Notes Bro" logo in navbar
    let tapCount = 0;
    let tapTimer: NodeJS.Timeout;
    
    const handleLogoTap = () => {
      tapCount++;
      clearTimeout(tapTimer);
      
      if (tapCount === 3) {
        setShowAdminAccess(true);
        toast({
          title: "Admin Access Enabled",
          description: "Admin controls are now visible.",
        });
        tapCount = 0;
      } else {
        tapTimer = setTimeout(() => {
          tapCount = 0;
        }, 1000);
      }
    };

    // Add event listeners
    window.addEventListener('keydown', handleKeyPress);
    
    // Find logo and add tap listener
    const logo = document.querySelector('[data-testid="logo-admin-trigger"]');
    if (logo) {
      logo.addEventListener('click', handleLogoTap);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      clearTimeout(tapTimer);
      if (logo) {
        logo.removeEventListener('click', handleLogoTap);
      }
    };
  }, [toast]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.user?.role === "admin" && data.token) {
        login(data.user, data.token);
        setIsAdminLoggedIn(true);
        toast({
          title: "Welcome Admin!",
          description: "You have successfully logged in.",
        });
      } else {
        toast({
          title: "Access Denied",
          description: "Admin privileges required.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Login Failed",
        description: "Invalid username or password.",
        variant: "destructive",
      });
    }
  });

  const handleAdminLogin = (username: string, password: string) => {
    loginMutation.mutate({ username, password });
  };

  const handleAdminPanelClose = () => {
    setIsAdminPanelOpen(false);
    setIsAdminLoggedIn(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <NotesSearch />
      
      <FeaturesSection />
      <Footer />
      
      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={handleAdminPanelClose}
        isLoggedIn={isAdminLoggedIn}
        onLogin={handleAdminLogin}
      />
      
      {/* Hidden Admin Access - Only shows after secret key combination */}
      {showAdminAccess && (
        <button
          onClick={() => setIsAdminPanelOpen(true)}
          className="fixed bottom-6 right-6 bg-primary text-primary-foreground p-2 rounded-lg shadow-lg hover:bg-primary/90 transition-all hover:scale-105 z-40 text-xs opacity-75"
          data-testid="button-floating-admin"
          title="Admin Panel (Ctrl+Shift+A to show)"
        >
          🔧
        </button>
      )}
    </div>
  );
}
