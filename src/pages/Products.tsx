import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productsService } from "@/lib/supabaseStorage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Tables } from "@/integrations/supabase/types";

interface Product extends Tables<'products'> {}

const Products = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productsService.getAll();
      const filtered = data.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.reference && product.reference.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setProducts(filtered);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Produits</h1>
            <p className="text-muted-foreground">Gérez votre catalogue de produits et services</p>
          </div>
          <Button onClick={() => navigate("/products/new")} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouveau produit
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher par nom ou référence..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    fetchProducts();
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
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun produit</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "Aucun produit ne correspond à votre recherche" : "Commencez par créer votre premier produit"}
                </p>
                {!searchTerm && (
                  <Button onClick={() => navigate("/products/new")}>
                    Créer un produit
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="p-4 border border-border rounded-lg hover:bg-card/50 cursor-pointer transition-all hover:shadow-glow"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-foreground">{product.name}</h3>
                      {!product.is_active && (
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                          Inactif
                        </span>
                      )}
                    </div>
                    {product.reference && (
                      <p className="text-sm text-muted-foreground mb-2">
                        Réf: {product.reference}
                      </p>
                    )}
                    <p className="text-sm font-semibold">
                      {product.unit_price.toLocaleString("fr-FR", {
                        minimumFractionDigits: 3,
                        maximumFractionDigits: 3,
                      })} TND
                    </p>
                    {product.unit && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Unité: {product.unit}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      TVA: {product.tax_rate}%
                    </p>
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

export default Products;