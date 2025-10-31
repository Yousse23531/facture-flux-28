import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Calendar, Download, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatTND } from "@/lib/currency";
import { invoicesService, clientsService, productsService } from "@/lib/supabaseStorage";
import type { Tables } from "@/integrations/supabase/types";

interface ReportData {
  period: string;
  revenue: number;
  invoices: number;
}

interface ClientReport {
  name: string;
  total: number;
  count: number;
}

interface ProductReport {
  name: string;
  quantity: number;
  revenue: number;
}

const Reports = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  
  const [revenueData, setRevenueData] = useState<ReportData[]>([]);
  const [clientData, setClientData] = useState<ClientReport[]>([]);
  const [productData, setProductData] = useState<ProductReport[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    pendingRevenue: 0,
  });

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // Fetch invoices in date range
      const invoices = await invoicesService.getByDateRange(dateRange.start, dateRange.end);
      
      // Calculate stats
      const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
      const totalInvoices = invoices.length;
      const paidInvoices = invoices.filter(inv => inv.status === 'payée').length;
      const pendingRevenue = invoices
        .filter(inv => inv.status !== 'payée')
        .reduce((sum, inv) => sum + inv.total, 0);
      
      setStats({
        totalRevenue,
        totalInvoices,
        paidInvoices,
        pendingRevenue,
      });
      
      // Prepare revenue data by month
      const revenueByMonth: Record<string, { revenue: number; invoices: number }> = {};
      
      invoices.forEach(invoice => {
        const month = new Date(invoice.invoice_date).toLocaleDateString("fr-FR", {
          month: "short",
          year: "numeric",
        });
        
        if (!revenueByMonth[month]) {
          revenueByMonth[month] = { revenue: 0, invoices: 0 };
        }
        
        revenueByMonth[month].revenue += invoice.total;
        revenueByMonth[month].invoices += 1;
      });
      
      const revenueDataArray = Object.entries(revenueByMonth).map(([period, data]) => ({
        period,
        revenue: data.revenue,
        invoices: data.invoices,
      }));
      
      setRevenueData(revenueDataArray);
      
      // Prepare client data
      const clientMap: Record<string, { total: number; count: number; name: string }> = {};
      const clientIds = [...new Set(invoices.map(inv => inv.client_id))];
      
      if (clientIds.length > 0) {
        // In a real app, we would batch these requests
        for (const clientId of clientIds) {
          try {
            const client = await clientsService.getById(clientId);
            if (client) {
              clientMap[clientId] = {
                name: client.name,
                total: 0,
                count: 0,
              };
            }
          } catch (error) {
            // Skip if client not found
          }
        }
      }
      
      invoices.forEach(invoice => {
        if (clientMap[invoice.client_id]) {
          clientMap[invoice.client_id].total += invoice.total;
          clientMap[invoice.client_id].count += 1;
        }
      });
      
      const clientDataArray = Object.values(clientMap).map(client => ({
        name: client.name,
        total: client.total,
        count: client.count,
      }));
      
      setClientData(clientDataArray);
      
      // For product data, we would need to fetch invoice items and aggregate
      // This is a simplified version
      setProductData([]);
      
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les rapports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    toast({
      title: "Export en cours",
      description: "L'export des rapports sera disponible dans une prochaine version.",
    });
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Chargement des rapports...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Rapports</h1>
            <p className="text-muted-foreground">Analysez vos performances commerciales</p>
          </div>
          <Button onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Exporter les rapports
          </Button>
        </div>

        {/* Date Range Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Date de début</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="start-date"
                    type="date"
                    className="pl-10"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">Date de fin</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="end-date"
                    type="date"
                    className="pl-10"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Chiffre d'affaires</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {formatTND(stats.totalRevenue)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Sur la période sélectionnée
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Total factures</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {stats.totalInvoices}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Factures créées
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Factures payées</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {stats.paidInvoices}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Sur {stats.totalInvoices} factures
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Encours</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {formatTND(stats.pendingRevenue)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Factures non payées
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Évolution du chiffre d'affaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis tickFormatter={(value) => formatTND(value).replace(' TND', '')} />
                    <Tooltip 
                      formatter={(value) => [formatTND(Number(value)), 'Chiffre d\'affaires']}
                      labelFormatter={(label) => `Période: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="revenue" name="Chiffre d'affaires" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Répartition par client</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {clientData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={clientData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="total"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {clientData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatTND(Number(value))} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Aucune donnée disponible</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle>Meilleurs clients</CardTitle>
          </CardHeader>
          <CardContent>
            {clientData.length > 0 ? (
              <div className="space-y-4">
                {clientData
                  .sort((a, b) => b.total - a.total)
                  .slice(0, 5)
                  .map((client, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{client.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {client.count} facture{client.count > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatTND(client.total)}</p>
                        <p className="text-sm text-muted-foreground">
                          {((client.total / stats.totalRevenue) * 100).toFixed(1)}% du CA
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune donnée disponible</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Reports;