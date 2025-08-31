import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import AdminPanel from "@/components/admin-panel";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import type { LoginRequest } from "@shared/schema";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, token, login, logout, isAdmin, isLoggedIn } = useAuth();

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.user?.role === "admin" && data.token) {
        login(data.user, data.token);
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
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <AdminPanel
        isOpen={true}
        onClose={handleAdminPanelClose}
        isLoggedIn={isAdmin}
        onLogin={handleAdminLogin}
        onLogout={logout}
      />
    </div>
  );
}
