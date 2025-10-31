import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { clientsService } from "@/lib/supabaseStorage";
import type { Tables } from "@/integrations/supabase/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ClientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Omit<Tables<'clients'>, 'id' | 'user_id' | 'created_at' | 'updated_at'>>({
    name: "",
    email: "",
    phone: null,
    address: null,
    city: null,
    postal_code: null,
    country: "Tunisie",
    siret: null,
    tva_number: null,
    notes: null,
  });

  useEffect(() => {
    if (id) {
      fetchClient();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchClient = async () => {
    if (!id) return;
    
    try {
      const data = await clientsService.getById(id);
      if (data) {
        setFormData({
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          postal_code: data.postal_code,
          country: data.country,
          siret: data.siret,
          tva_number: data.tva_number,
          notes: data.notes,
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger le client",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: "Erreur",
        description: "Le nom et l'email sont requis",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      if (id) {
        // Update existing client
        await clientsService.update(id, formData);
        toast({
          title: "Succès",
          description: "Client mis à jour avec succès",
        });
      } else {
        // Create new client
        await clientsService.create(formData);
        toast({
          title: "Succès",
          description: "Client créé avec succès",
        });
      }
      
      navigate("/clients");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le client: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await clientsService.delete(id);
      toast({
        title: "Succès",
        description: "Client supprimé avec succès",
      });
      navigate("/clients");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le client",
        variant: "destructive",
      });
    }
  };

  if (loading && id) {
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/clients")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {id ? "Modifier le client" : "Nouveau client"}
            </h1>
            <p className="text-muted-foreground">
              {id ? "Modifiez les informations du client" : "Ajoutez un nouveau client"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Informations du client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom / Raison sociale *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Nom du client"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="client@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ""}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+216 XX XXX XXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={formData.city || ""}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="Ville"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_code">Code postal</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code || ""}
                    onChange={(e) => handleChange("postal_code", e.target.value)}
                    placeholder="Code postal"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Pays</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    placeholder="Pays"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Textarea
                  id="address"
                  value={formData.address || ""}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Adresse complète"
                  rows={3}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siret">Matricule fiscal</Label>
                  <Input
                    id="siret"
                    value={formData.siret || ""}
                    onChange={(e) => handleChange("siret", e.target.value)}
                    placeholder="Matricule fiscal"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tva_number">Numéro TVA</Label>
                  <Input
                    id="tva_number"
                    value={formData.tva_number || ""}
                    onChange={(e) => handleChange("tva_number", e.target.value)}
                    placeholder="Numéro TVA"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Notes complémentaires..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                {id && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="button" variant="destructive" className="gap-2">
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible et supprimera également toutes les factures associées.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive">
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                <Button type="button" variant="outline" onClick={() => navigate("/clients")}>
                  Annuler
                </Button>
                <Button type="submit" disabled={loading} className="gap-2">
                  <Save className="w-4 h-4" />
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ClientForm;