import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Plus, Search, Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
}

const Clients = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
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
    fetchClients();
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, email, phone, city")
        .order("name");

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les clients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Clients</h1>
            <p className="text-muted-foreground">Gérez votre portefeuille clients</p>
          </div>
          <Button onClick={() => navigate("/clients/new")} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouveau client
          </Button>
        </div>

        <Card className="border-border">
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Chargement...</p>
            ) : filteredClients.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {searchTerm ? "Aucun client trouvé" : "Aucun client enregistré"}
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className="p-4 border border-border rounded-lg hover:bg-card/50 cursor-pointer transition-all hover:shadow-glow"
                    onClick={() => navigate(`/clients/${client.id}`)}
                  >
                    <h3 className="font-semibold text-foreground mb-3">{client.name}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span>{client.phone}</span>
                        </div>
                      )}
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

export default Clients;
