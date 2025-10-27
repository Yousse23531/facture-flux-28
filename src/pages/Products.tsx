import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  description: string | null;
  unit_price: number;
  tax_rate: number;
  is_active: boolean;
}

const Products = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
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
    fetchProducts();
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, description, unit_price, tax_rate, is_active")
        .order("name");

      if (error) throw error;
      setProducts(data || []);
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

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Produits & Services</h1>
            <p className="text-muted-foreground">Gérez votre catalogue de produits</p>
          </div>
          <Button onClick={() => navigate("/products/new")} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouveau produit
          </Button>
        </div>

        <Card className="border-border">
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Chargement...</p>
            ) : filteredProducts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {searchTerm ? "Aucun produit trouvé" : "Aucun produit enregistré"}
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-4 border border-border rounded-lg hover:bg-card/50 cursor-pointer transition-all hover:shadow-glow"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-foreground flex-1">{product.name}</h3>
                      <Badge variant={product.is_active ? "secondary" : "outline"}>
                        {product.is_active ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                    {product.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Prix HT</span>
                      <span className="font-bold text-foreground">{product.unit_price.toFixed(2)} €</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground">TVA</span>
                      <span className="text-foreground">{product.tax_rate}%</span>
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

export default Products;
