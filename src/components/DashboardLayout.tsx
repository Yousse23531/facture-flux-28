import { ReactNode, useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Users, 
  Package, 
  Settings, 
  LogOut,
  Home,
  Menu,
  X,
  BarChart3,
  FileCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      navigate("/auth");
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur de déconnexion",
        description: "Impossible de se déconnecter. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const menuItems = [
    { icon: Home, label: "Tableau de bord", path: "/dashboard" },
    { icon: FileText, label: "Factures", path: "/invoices" },
    { icon: FileCheck, label: "Bons de commande", path: "/purchase-orders" },
    { icon: Users, label: "Clients", path: "/clients" },
    { icon: Package, label: "Produits", path: "/products" },
    { icon: BarChart3, label: "Rapports", path: "/reports" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-xl font-bold text-foreground">HEKMA-FACTURES</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="hidden md:flex"
            >
              <LogOut className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-24 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            
            <Button
              variant="outline"
              className="w-full justify-start gap-3 mt-4"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              Déconnexion
            </Button>
          </div>
        </aside>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-20 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className="w-full justify-start gap-3 text-lg py-6"
                    >
                      <Icon className="w-6 h-6" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              
              <Button
                variant="outline"
                className="w-full justify-start gap-3 text-lg py-6 mt-8"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
              >
                <LogOut className="w-6 h-6" />
                Déconnexion
              </Button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};