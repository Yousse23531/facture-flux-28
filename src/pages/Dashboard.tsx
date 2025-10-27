import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Package, Euro } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

interface Stats {
  totalInvoices: number;
  totalClients: number;
  totalProducts: number;
  totalRevenue: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats>({
    totalInvoices: 0,
    totalClients: 0,
    totalProducts: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      fetchStats();
    };

    checkAuth();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const [invoicesResult, clientsResult, productsResult] = await Promise.all([
        supabase.from("invoices").select("total", { count: "exact" }),
        supabase.from("clients").select("id", { count: "exact" }),
        supabase.from("products").select("id", { count: "exact" }),
      ]);

      const totalRevenue = invoicesResult.data?.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0) || 0;

      setStats({
        totalInvoices: invoicesResult.count || 0,
        totalClients: clientsResult.count || 0,
        totalProducts: productsResult.count || 0,
        totalRevenue,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Factures",
      value: stats.totalInvoices,
      icon: FileText,
      gradient: "bg-gradient-primary",
    },
    {
      title: "Clients",
      value: stats.totalClients,
      icon: Users,
      gradient: "bg-gradient-card",
    },
    {
      title: "Produits",
      value: stats.totalProducts,
      icon: Package,
      gradient: "bg-gradient-card",
    },
    {
      title: "Chiffre d'affaires",
      value: `${stats.totalRevenue.toFixed(2)} €`,
      icon: Euro,
      gradient: "bg-gradient-primary",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Tableau de bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre activité</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="border-border hover:shadow-glow transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.gradient}`}>
                    <Icon className="h-4 w-4 text-primary-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {loading ? "..." : stat.value}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Dernières factures</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Les factures récentes s'afficheront ici</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Paiements en attente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Les paiements en attente s'afficheront ici</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
