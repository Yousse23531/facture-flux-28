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
import { Switch } from "@/components/ui/switch";
import { productsService } from "@/lib/supabaseStorage";
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

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Omit<Tables<'products'>, 'id' | 'user_id' | 'created_at' | 'updated_at'>>({
    name: "",
    description: null,
    unit_price: 0,
    tax_rate: 19,
    unit: "unité",
    reference: null,
    is_active: true,
  });

  useEffect(() => {
    if (id) {
      fetchProduct();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;
    
    try {
      const data = await productsService.getById(id);
      if (data) {
        setFormData({
          name: data.name,
          description: data.description,
          unit_price: data.unit_price,
          tax_rate: data.tax_rate,
          unit: data.unit,
          reference: data.reference,
          is_active: data.is_active,
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger le produit",
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
    
    if (!formData.name) {
      toast({
        title: "Erreur",
        description: "Le nom du produit est requis",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      if (id) {
        // Update existing product
        await productsService.update(id, formData);
        toast({
          title: "Succès",
          description: "Produit mis à jour avec succès",
        });
      } else {
        // Create new product
        await productsService.create(formData);
        toast({
          title: "Succès",
          description: "Produit créé avec succès",
        });
      }
      
      navigate("/products");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le produit: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await productsService.delete(id);
      toast({
        title: "Succès",
        description: "Produit supprimé avec succès",
      });
      navigate("/products");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit",
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
          <Button variant="ghost" size="icon" onClick={() => navigate("/products")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {id ? "Modifier le produit" : "Nouveau produit"}
            </h1>
            <p className="text-muted-foreground">
              {id ? "Modifiez les informations du produit" : "Ajoutez un nouveau produit"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Informations du produit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du produit *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Nom du produit"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Description du produit"
                  rows={3}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="unit_price">Prix unitaire (TND) *</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    step="0.001"
                    min="0"
                    required
                    value={formData.unit_price}
                    onChange={(e) => handleChange("unit_price", parseFloat(e.target.value) || 0)}
                    placeholder="0.000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax_rate">Taux de TVA (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.tax_rate}
                    onChange={(e) => handleChange("tax_rate", parseFloat(e.target.value) || 0)}
                    placeholder="19"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unité</Label>
                  <Input
                    id="unit"
                    value={formData.unit || ""}
                    onChange={(e) => handleChange("unit", e.target.value)}
                    placeholder="unité"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference">Référence</Label>
                  <Input
                    id="reference"
                    value={formData.reference || ""}
                    onChange={(e) => handleChange("reference", e.target.value)}
                    placeholder="Référence du produit"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_active">Produit actif</Label>
                  <p className="text-sm text-muted-foreground">
                    Les produits inactifs ne seront pas disponibles lors de la création de factures
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleChange("is_active", checked)}
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
                          Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
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
                <Button type="button" variant="outline" onClick={() => navigate("/products")}>
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

export default ProductForm;