import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Users, 
  Package, 
  BarChart3, 
  Plus, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { formatTND } from "@/lib/currency";
import { invoicesService, clientsService, productsService } from "@/lib/supabaseStorage";

interface Stat {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color: string;
}

interface RecentInvoice {
  id: string;
  invoice_number: string;
  client_name: string;
  total: number;
  status: string;
  invoice_date: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stat[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch data in parallel
      const [invoices, clients, products] = await Promise.all([
        invoicesService.getAll(),
        clientsService.getAll(),
        productsService.getActive(),
      ]);
      
      // Calculate stats
      const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
      const pendingInvoices = invoices.filter(inv => inv.status === 'brouillon' || inv.status === 'envoyée').length;
      const overdueInvoices = invoices.filter(inv => inv.status === 'en_retard').length;
      
      const statsData: Stat[] = [
        {
          title: "Chiffre d'affaires",
          value: formatTND(totalRevenue),
          icon: <TrendingUp className="w-5 h-5" />,
          color: "text-green-600",
        },
        {
          title: "Clients",
          value: clients.length,
          icon: <Users className="w-5 h-5" />,
          color: "text-blue-600",
        },
        {
          title: "Produits actifs",
          value: products.length,
          icon: <Package className="w-5 h-5" />,
          color: "text-purple-600",
        },
        {
          title: "Factures en attente",
          value: pendingInvoices,
          icon: <Clock className="w-5 h-5" />,
          color: "text-orange-600",
        },
        {
          title: "Factures en retard",
          value: overdueInvoices,
          icon: <AlertCircle className="w-5 h-5" />,
          color: "text-red-600",
        },
        {
          title: "Factures payées",
          value: invoices.filter(inv => inv.status === 'payée').length,
          icon: <CheckCircle className="w-5 h-5" />,
          color: "text-green-600",
        },
      ];
      
      setStats(statsData);
      
      // Get recent invoices (last 5)
      const recent = invoices
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map(invoice => ({
          id: invoice.id,
          invoice_number: invoice.invoice_number,
          client_name: invoice.client_name,
          total: invoice.total,
          status: invoice.status,
          invoice_date: invoice.invoice_date,
        }));
      
      setRecentInvoices(recent);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du tableau de bord",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string, label: string }> = {
      brouillon: { className: "bg-gray-100 text-gray-800", label: "Brouillon" },
      envoyée: { className: "bg-blue-100 text-blue-800", label: "Envoyée" },
      payée: { className: "bg-green-100 text-green-800", label: "Payée" },
      en_retard: { className: "bg-red-100 text-red-800", label: "En retard" },
      annulée: { className: "bg-red-100 text-red-800", label: "Annulée" },
    };
    const config = variants[status] || variants.brouillon;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Chargement du tableau de bord...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
            <p className="text-muted-foreground">Aperçu de vos activités de facturation</p>
          </div>
          <Button onClick={() => navigate("/invoices/new")} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle facture
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${stat.color.replace('text', 'bg').replace('-600', '-100')}`}>
                    {stat.icon}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Factures récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentInvoices.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune facture pour le moment</p>
                  <Button 
                    onClick={() => navigate("/invoices/new")} 
                    className="mt-4"
                    variant="outline"
                  >
                    Créer votre première facture
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentInvoices.map((invoice) => (
                    <div 
                      key={invoice.id} 
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-card/50 cursor-pointer transition-all"
                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                    >
                      <div>
                        <h3 className="font-semibold">{invoice.invoice_number}</h3>
                        <p className="text-sm text-muted-foreground">{invoice.client_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatTND(invoice.total)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(invoice.status)}
                          <span className="text-xs text-muted-foreground">
                            {new Date(invoice.invoice_date).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Activité récente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Graphiques d'analyse</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Consultez les rapports complets pour voir vos tendances de vente
                  </p>
                  <Button onClick={() => navigate("/reports")} variant="outline">
                    Voir les rapports
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => navigate("/invoices/new")}
              >
                <FileText className="w-6 h-6" />
                Nouvelle facture
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => navigate("/clients/new")}
              >
                <Users className="w-6 h-6" />
                Nouveau client
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => navigate("/products/new")}
              >
                <Package className="w-6 h-6" />
                Nouveau produit
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => navigate("/purchase-orders/new")}
              >
                <FileText className="w-6 h-6" />
                Bon de commande
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;