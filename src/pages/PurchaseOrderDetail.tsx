import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  FileText, 
  Download, 
  Printer,
  Send,
  CheckCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PurchaseOrder extends Tables<'purchase_orders'> {
  client?: Tables<'clients'> | null;
  purchase_order_items?: Array<Tables<'purchase_order_items'>>;
}

const PurchaseOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (id) {
      fetchPurchaseOrder();
    }
  }, [id]);

  const fetchPurchaseOrder = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          client:clients(*),
          purchase_order_items(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setPurchaseOrder(data);
      setStatus(data.status);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger le bon de commande",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      const { error } = await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Bon de commande supprimé avec succès",
      });
      
      navigate("/purchase-orders");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le bon de commande",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    
    try {
      const { error } = await supabase
        .from('purchase_orders')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      setStatus(newStatus);
      setPurchaseOrder(prev => prev ? { ...prev, status: newStatus } : null);
      
      toast({
        title: "Succès",
        description: "Statut mis à jour avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any, label: string }> = {
      draft: { variant: "outline", label: "Brouillon" },
      sent: { variant: "default", label: "Envoyé" },
      confirmed: { variant: "secondary", label: "Confirmé" },
      delivered: { variant: "secondary", label: "Livré" },
      cancelled: { variant: "destructive", label: "Annulé" },
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleDownloadPDF = () => {
    toast({
      title: "Fonctionnalité non disponible",
      description: "La génération de PDF pour les bons de commande sera implémentée dans une prochaine version.",
    });
  };

  const handlePrint = () => {
    toast({
      title: "Fonctionnalité non disponible",
      description: "L'impression des bons de commande sera implémentée dans une prochaine version.",
    });
  };

  const handleSend = () => {
    toast({
      title: "Fonctionnalité non disponible",
      description: "L'envoi par email des bons de commande sera implémenté dans une prochaine version.",
    });
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

  if (!purchaseOrder) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Bon de commande introuvable</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/purchase-orders")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground">{purchaseOrder.order_number}</h1>
                {getStatusBadge(purchaseOrder.status)}
              </div>
              <p className="text-muted-foreground">Détails du bon de commande</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadPDF} className="gap-2">
              <Download className="w-4 h-4" />
              Télécharger PDF
            </Button>
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              Imprimer
            </Button>
            <Button variant="outline" onClick={handleSend} className="gap-2">
              <Send className="w-4 h-4" />
              Envoyer
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate(`/purchase-orders/${id}/edit`)} 
              className="gap-2"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer ce bon de commande ? Cette action est irréversible.
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
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Informations client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Nom</p>
                <p className="font-semibold">{purchaseOrder.client?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p>{purchaseOrder.client?.email}</p>
              </div>
              {purchaseOrder.client?.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p>{purchaseOrder.client.phone}</p>
                </div>
              )}
              {purchaseOrder.client?.address && (
                <div>
                  <p className="text-sm text-muted-foreground">Adresse</p>
                  <p className="text-sm">{purchaseOrder.client.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Détails du bon de commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Date de commande</p>
                <p className="font-semibold">
                  {new Date(purchaseOrder.order_date).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date de livraison prévue</p>
                <p className="font-semibold">
                  {new Date(purchaseOrder.delivery_date).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Statut</p>
                <Select value={status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="sent">Envoyé</SelectItem>
                    <SelectItem value="confirmed">Confirmé</SelectItem>
                    <SelectItem value="delivered">Livré</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {purchaseOrder.delivery_conditions && (
                <div>
                  <p className="text-sm text-muted-foreground">Conditions de livraison</p>
                  <p className="text-sm">{purchaseOrder.delivery_conditions}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Montants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total TTC</span>
                <span className="font-bold">{purchaseOrder.total.toLocaleString("fr-FR", {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                })} TND</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lignes du bon de commande</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead className="text-right">Prix HT</TableHead>
                  <TableHead className="text-right">TVA %</TableHead>
                  <TableHead className="text-right">Remise %</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrder.purchase_order_items?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{item.unit_price.toLocaleString("fr-FR", {
                      minimumFractionDigits: 3,
                      maximumFractionDigits: 3,
                    })}</TableCell>
                    <TableCell className="text-right">{item.tax_rate}%</TableCell>
                    <TableCell className="text-right">{item.discount_percent}%</TableCell>
                    <TableCell className="text-right font-semibold">{item.total.toLocaleString("fr-FR", {
                      minimumFractionDigits: 3,
                      maximumFractionDigits: 3,
                    })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-6 flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sous-total HT:</span>
                  <span className="font-semibold">{purchaseOrder.subtotal.toLocaleString("fr-FR", {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })} TND</span>
                </div>
                {purchaseOrder.discount_amount && purchaseOrder.discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remise:</span>
                    <span className="font-semibold text-green-600">-{purchaseOrder.discount_amount.toLocaleString("fr-FR", {
                      minimumFractionDigits: 3,
                      maximumFractionDigits: 3,
                    })} TND</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Montant TVA:</span>
                  <span className="font-semibold">{purchaseOrder.tax_amount.toLocaleString("fr-FR", {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })} TND</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                  <span>Total TTC:</span>
                  <span>{purchaseOrder.total.toLocaleString("fr-FR", {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })} TND</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {purchaseOrder.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{purchaseOrder.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PurchaseOrderDetail;