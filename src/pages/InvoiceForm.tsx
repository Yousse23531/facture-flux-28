import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { clientsService, productsService, invoicesService, invoiceItemsService } from "@/lib/supabaseStorage";
import type { Tables } from "@/integrations/supabase/types";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  discount_percent: number;
  total: number;
}

const InvoiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Array<Tables<'clients'>>>([]);
  const [products, setProducts] = useState<Array<Tables<'products'>>>([]);
  
  const [formData, setFormData] = useState({
    client_id: "",
    invoice_date: new Date().toISOString().split("T")[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    type: "facture",
    status: "brouillon",
    notes: "",
    payment_conditions: "Paiement à 30 jours",
  });
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, unit_price: 0, tax_rate: 19, discount_percent: 0, total: 0 }
  ]);

  useEffect(() => {
    fetchClientsAndProducts();
    if (id) {
      fetchInvoice();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchClientsAndProducts = async () => {
    try {
      // Fetch clients
      const clientsData = await clientsService.getAll();
      
      // Fetch products
      const productsData = await productsService.getActive();
      
      setClients(clientsData);
      setProducts(productsData);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les clients et produits",
        variant: "destructive",
      });
    }
  };

  const fetchInvoice = async () => {
    if (!id) return;
    
    try {
      const data = await invoicesService.getById(id);
      
      if (data) {
        setFormData({
          client_id: data.client_id,
          invoice_date: data.invoice_date,
          due_date: data.due_date,
          type: data.type,
          status: data.status,
          notes: data.notes || "",
          payment_conditions: data.payment_conditions || "",
        });
        
        if (data.invoice_items && data.invoice_items.length > 0) {
          setItems(data.invoice_items.map((item: any) => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            tax_rate: item.tax_rate,
            discount_percent: item.discount_percent || 0,
            total: item.total,
          })));
        }
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la facture",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateItemTotal = (item: InvoiceItem) => {
    const subtotal = item.quantity * item.unit_price;
    const discountAmount = subtotal * (item.discount_percent / 100);
    const discountedSubtotal = subtotal - discountAmount;
    const taxAmount = discountedSubtotal * (item.tax_rate / 100);
    return discountedSubtotal + taxAmount;
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unit_price;
      const discountAmount = itemSubtotal * (item.discount_percent / 100);
      return sum + (itemSubtotal - discountAmount);
    }, 0);
    
    const taxAmount = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unit_price;
      const discountAmount = itemSubtotal * (item.discount_percent / 100);
      const discountedSubtotal = itemSubtotal - discountAmount;
      return sum + (discountedSubtotal * (item.tax_rate / 100));
    }, 0);
    
    const discountAmount = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unit_price;
      return sum + (itemSubtotal * (item.discount_percent / 100));
    }, 0);
    
    const total = subtotal + taxAmount;
    
    return { subtotal, taxAmount, discountAmount, total };
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price' || field === 'tax_rate' || field === 'discount_percent') {
      newItems[index].total = calculateItemTotal(newItems[index]);
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      { description: "", quantity: 1, unit_price: 0, tax_rate: 19, discount_percent: 0, total: 0 }
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_id) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un client",
        variant: "destructive",
      });
      return;
    }
    
    if (items.some(item => !item.description.trim())) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir toutes les descriptions",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      const { subtotal, taxAmount, discountAmount, total } = calculateTotals();
      
      if (id) {
        // Update existing invoice
        const updatedInvoice = await invoicesService.update(id, {
          client_id: formData.client_id,
          invoice_date: formData.invoice_date,
          due_date: formData.due_date,
          type: formData.type,
          status: formData.status,
          notes: formData.notes,
          payment_conditions: formData.payment_conditions,
          subtotal,
          tax_amount: taxAmount,
          discount_amount: discountAmount,
          total,
        });
        
        // Delete existing items
        await invoiceItemsService.deleteByInvoice(id);
        
        // Insert updated items
        const itemsToInsert = items.map(item => ({
          invoice_id: id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate,
          discount_percent: item.discount_percent,
          total: item.total,
        }));
        
        for (const item of itemsToInsert) {
          await invoiceItemsService.create(item);
        }
        
        toast({
          title: "Succès",
          description: "Facture mise à jour avec succès",
        });
      } else {
        // Create new invoice
        const invoiceNumber = await invoicesService.generateInvoiceNumber();
        
        const newInvoice = await invoicesService.create({
          client_id: formData.client_id,
          invoice_date: formData.invoice_date,
          due_date: formData.due_date,
          type: formData.type,
          status: formData.status,
          notes: formData.notes,
          payment_conditions: formData.payment_conditions,
          subtotal,
          tax_amount: taxAmount,
          discount_amount: discountAmount,
          total,
          invoice_number: invoiceNumber,
        });
        
        // Insert items
        const itemsToInsert = items.map(item => ({
          invoice_id: newInvoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate,
          discount_percent: item.discount_percent,
          total: item.total,
        }));
        
        for (const item of itemsToInsert) {
          await invoiceItemsService.create(item);
        }
        
        toast({
          title: "Succès",
          description: "Facture créée avec succès",
        });
        
        navigate(`/invoices/${newInvoice.id}`);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la facture: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, taxAmount, discountAmount, total } = calculateTotals();

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
          <Button variant="ghost" size="icon" onClick={() => navigate("/invoices")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {id ? "Modifier la facture" : "Nouvelle facture"}
            </h1>
            <p className="text-muted-foreground">
              {id ? "Modifiez les détails de votre facture" : "Créez une nouvelle facture"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Informations de la facture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="client_id">Client *</Label>
                  <Select
                    value={formData.client_id}
                    onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facture">Facture</SelectItem>
                      <SelectItem value="devis">Devis</SelectItem>
                      <SelectItem value="avoir">Avoir</SelectItem>
                      <SelectItem value="complementaire">Facture complémentaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="invoice_date">Date de facture *</Label>
                  <Input
                    id="invoice_date"
                    type="date"
                    value={formData.invoice_date}
                    onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="due_date">Date d'échéance *</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brouillon">Brouillon</SelectItem>
                      <SelectItem value="envoyée">Envoyée</SelectItem>
                      <SelectItem value="payée">Payée</SelectItem>
                      <SelectItem value="en_retard">En retard</SelectItem>
                      <SelectItem value="annulée">Annulée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment_conditions">Conditions de paiement</Label>
                <Textarea
                  id="payment_conditions"
                  value={formData.payment_conditions}
                  onChange={(e) => setFormData({ ...formData, payment_conditions: e.target.value })}
                  placeholder="Conditions de paiement..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lignes de facture</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Ajouter une ligne
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="grid gap-4 p-4 border border-border rounded-lg bg-card">
                    <div className="grid gap-4 md:grid-cols-12">
                      <div className="md:col-span-4 space-y-2">
                        <Label>Description *</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          placeholder="Description du produit/service"
                          required
                        />
                      </div>
                      
                      <div className="md:col-span-2 space-y-2">
                        <Label>Quantité</Label>
                        <Input
                          type="number"
                          step="0.001"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      
                      <div className="md:col-span-2 space-y-2">
                        <Label>Prix unitaire (TND)</Label>
                        <Input
                          type="number"
                          step="0.001"
                          min="0"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      
                      <div className="md:col-span-2 space-y-2">
                        <Label>TVA %</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.tax_rate}
                          onChange={(e) => handleItemChange(index, 'tax_rate', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      
                      <div className="md:col-span-2 space-y-2">
                        <Label>Remise %</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={item.discount_percent}
                          onChange={(e) => handleItemChange(index, 'discount_percent', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Total: {item.total.toLocaleString("fr-FR", {
                          minimumFractionDigits: 3,
                          maximumFractionDigits: 3,
                        })} TND
                      </div>
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-border">
                <div className="grid gap-2 max-w-xs ml-auto">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sous-total HT:</span>
                    <span className="font-semibold">{subtotal.toLocaleString("fr-FR", {
                      minimumFractionDigits: 3,
                      maximumFractionDigits: 3,
                    })} TND</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Remise:</span>
                      <span className="font-semibold text-green-600">-{discountAmount.toLocaleString("fr-FR", {
                        minimumFractionDigits: 3,
                        maximumFractionDigits: 3,
                      })} TND</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Montant TVA:</span>
                    <span className="font-semibold">{taxAmount.toLocaleString("fr-FR", {
                      minimumFractionDigits: 3,
                      maximumFractionDigits: 3,
                    })} TND</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                    <span>Total TTC:</span>
                    <span>{total.toLocaleString("fr-FR", {
                      minimumFractionDigits: 3,
                      maximumFractionDigits: 3,
                    })} TND</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes complémentaires..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/invoices")}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              <Save className="w-4 h-4" />
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default InvoiceForm;