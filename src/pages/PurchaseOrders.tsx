import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, FileCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

interface PurchaseOrder extends Tables<'purchase_orders'> {
  client_name?: string;
}

const PurchaseOrders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          client:clients(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedOrders = data?.map(order => ({
        ...order,
        client_name: (order as any).client?.name || 'Client inconnu'
      })) || [];

      setPurchaseOrders(formattedOrders);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les bons de commande",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPurchaseOrders = purchaseOrders.filter(
    (order) =>
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.client_name && order.client_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any, label: string }> = {
      draft: { variant: "outline", label: "Brouillon" },
      sent: { variant: "default", label: "Envoyé" },
      confirmed: { variant: "secondary", label: "Confirmé" },
      delivered: { variant: "secondary", label: "Livré" },
      cancelled: { variant: "destructive", label: "Annulé" },
    };
    const config = variants[status] || variants.draft;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      config.variant === "outline" ? "bg-gray-100 text-gray-800" :
      config.variant === "default" ? "bg-blue-100 text-blue-800" :
      config.variant === "secondary" ? "bg-green-100 text-green-800" :
      "bg-red-100 text-red-800"
    }`}>{config.label}</span>;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bons de commande</h1>
            <p className="text-muted-foreground">Gérez vos bons de commande clients</p>
          </div>
          <Button onClick={() => navigate("/purchase-orders/new")} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouveau bon de commande
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher par numéro ou client..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredPurchaseOrders.length === 0 ? (
              <div className="text-center py-12">
                <FileCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun bon de commande</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "Aucun bon de commande ne correspond à votre recherche" : "Commencez par créer votre premier bon de commande"}
                </p>
                {!searchTerm && (
                  <Button onClick={() => navigate("/purchase-orders/new")}>
                    Créer un bon de commande
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredPurchaseOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 border border-border rounded-lg hover:bg-card/50 cursor-pointer transition-all hover:shadow-glow"
                    onClick={() => navigate(`/purchase-orders/${order.id}`)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">{order.order_number}</h3>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Client: {order.client_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Date: {new Date(order.order_date).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {order.total.toLocaleString("fr-FR", {
                            minimumFractionDigits: 3,
                            maximumFractionDigits: 3,
                          })} TND
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PurchaseOrders;