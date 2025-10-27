import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  total: number;
  status: string;
  clients: {
    name: string;
  };
}

const Invoices = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    fetchInvoices();
  };

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          id,
          invoice_number,
          invoice_date,
          total,
          status,
          clients (name)
        `)
        .order("invoice_date", { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les factures",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      brouillon: { variant: "outline", label: "Brouillon" },
      envoyée: { variant: "default", label: "Envoyée" },
      payée: { variant: "secondary", label: "Payée" },
      en_retard: { variant: "destructive", label: "En retard" },
      annulée: { variant: "destructive", label: "Annulée" },
    };
    const config = variants[status] || variants.brouillon;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clients.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Factures</h1>
            <p className="text-muted-foreground">Gérez vos factures et suivez les paiements</p>
          </div>
          <Button onClick={() => navigate("/invoices/new")} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle facture
          </Button>
        </div>

        <Card className="border-border">
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher une facture..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Chargement...</p>
            ) : filteredInvoices.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {searchTerm ? "Aucune facture trouvée" : "Aucune facture créée"}
              </p>
            ) : (
              <div className="space-y-3">
                {filteredInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-card/50 cursor-pointer transition-all"
                    onClick={() => navigate(`/invoices/${invoice.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-foreground">{invoice.invoice_number}</span>
                        {getStatusBadge(invoice.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{invoice.clients.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{invoice.total.toFixed(2)} €</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.invoice_date).toLocaleDateString("fr-FR")}
                      </p>
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

export default Invoices;
