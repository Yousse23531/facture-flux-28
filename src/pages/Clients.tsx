import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clientsService } from "@/lib/supabaseStorage";
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
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      if (searchTerm) {
        const data = await clientsService.search(searchTerm);
        setClients(data);
      } else {
        const data = await clientsService.getAll();
        setClients(data);
      }
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Clients</h1>
            <p className="text-muted-foreground">Gérez votre base de clients</p>
          </div>
          <Button onClick={() => navigate("/clients/new")} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouveau client
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher par nom ou email..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    // Debounce search
                    setTimeout(fetchClients, 300);
                  }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Chargement...</p>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">Aucun client</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "Aucun client ne correspond à votre recherche" : "Commencez par créer votre premier client"}
                </p>
                {!searchTerm && (
                  <Button onClick={() => navigate("/clients/new")}>
                    Créer un client
                  </Button>
                )}
              </div>
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
                      {client.city && (
                        <div className="text-muted-foreground">
                          {client.city}
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