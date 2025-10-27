import { ReactNode, useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Users, 
  Package, 
  Settings, 
  LogOut,
  Home,
  Menu,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de se déconnecter",
        variant: "destructive",
      });
    } else {
      navigate("/auth");
    }
  };

  const menuItems = [
    { icon: Home, label: "Tableau de bord", path: "/dashboard" },
    { icon: FileText, label: "Factures", path: "/invoices" },
    { icon: Users, label: "Clients", path: "/clients" },
    { icon: Package, label: "Produits", path: "/products" },
    { icon: Settings, label: "Paramètres", path: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">FacturePro</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>

          <Button variant="outline" onClick={handleLogout} className="hidden md:flex gap-2">
            <LogOut className="w-4 h-4" />
            Déconnexion
          </Button>
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
                onClick={handleLogout}
                className="w-full justify-start gap-3 text-lg py-6 mt-8"
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
