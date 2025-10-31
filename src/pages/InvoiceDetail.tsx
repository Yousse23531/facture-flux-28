import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit, Trash2, Plus, FileText, Download, Printer, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { invoicesService, paymentsService } from "@/lib/supabaseStorage";
import { downloadInvoicePDF, printInvoicePDF } from "@/lib/pdfGenerator";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatTND } from "@/lib/currency";

interface Invoice extends Tables<'invoices'> {
  client?: Tables<'clients'> | null;
  invoice_items?: Array<Tables<'invoice_items'>>;
  payments?: Array<Tables<'payments'>>;
}

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    payment_date: new Date().toISOString().split("T")[0],
    payment_method: "virement",
    reference: "",
    notes: "",
  });

  useEffect(() => {
    if (id) {
      fetchInvoice();
    }
  }, [id]);

  const fetchInvoice = async () => {
    if (!id) return;

    try {
      const data = await invoicesService.getById(id);
      const payments = await paymentsService.getByInvoice(id);
      
      setInvoice({
        ...data,
        payments: payments || [],
      });
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

  const handleDelete = async () => {
    if (!id) return;

    try {
      await invoicesService.delete(id);
      await invoiceItemsService.deleteByInvoice(id);

      toast({
        title: "Succès",
        description: "Facture supprimée avec succès",
      });
      navigate("/invoices");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la facture",
        variant: "destructive",
      });
    }
  };

  const handleAddPayment = async () => {
    if (!id) return;

    try {
      await paymentsService.create({
        invoice_id: id,
        amount: parseFloat(paymentData.amount),
        payment_date: paymentData.payment_date,
        payment_method: paymentData.payment_method,
        reference: paymentData.reference || null,
        notes: paymentData.notes || null,
      });

      toast({
        title: "Succès",
        description: "Paiement enregistré avec succès",
      });

      setShowPaymentDialog(false);
      setPaymentData({
        amount: "",
        payment_date: new Date().toISOString().split("T")[0],
        payment_method: "virement",
        reference: "",
        notes: "",
      });
      fetchInvoice();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le paiement",
        variant: "destructive",
      });
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      await paymentsService.delete(paymentId);

      toast({
        title: "Succès",
        description: "Paiement supprimé avec succès",
      });
      fetchInvoice();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le paiement",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = () => {
    if (!invoice) return;
    
    try {
      downloadInvoicePDF({
        invoice_number: invoice.invoice_number,
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date,
        type: invoice.type,
        status: invoice.status,
        client_name: invoice.client?.name || "",
        client_email: invoice.client?.email || "",
        client_phone: invoice.client?.phone || undefined,
        client_address: invoice.client?.address || undefined,
        client_city: invoice.client?.city || undefined,
        client_tax_id: invoice.client?.siret || undefined,
        invoice_items: invoice.invoice_items || [],
        subtotal: invoice.subtotal,
        tax_amount: invoice.tax_amount,
        discount_amount: invoice.discount_amount || 0,
        total: invoice.total,
        notes: invoice.notes || undefined,
        payment_conditions: invoice.payment_conditions || undefined,
      });
      
      toast({
        title: "Succès",
        description: "PDF téléchargé avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    if (!invoice) return;
    
    try {
      printInvoicePDF({
        invoice_number: invoice.invoice_number,
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date,
        type: invoice.type,
        status: invoice.status,
        client_name: invoice.client?.name || "",
        client_email: invoice.client?.email || "",
        client_phone: invoice.client?.phone || undefined,
        client_address: invoice.client?.address || undefined,
        client_city: invoice.client?.city || undefined,
        client_tax_id: invoice.client?.siret || undefined,
        invoice_items: invoice.invoice_items || [],
        subtotal: invoice.subtotal,
        tax_amount: invoice.tax_amount,
        discount_amount: invoice.discount_amount || 0,
        total: invoice.total,
        notes: invoice.notes || undefined,
        payment_conditions: invoice.payment_conditions || undefined,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible d'imprimer le PDF",
        variant: "destructive",
      });
    }
  };

  const handleSendEmail = () => {
    if (!invoice || !invoice.client?.email) {
      toast({
        title: "Erreur",
        description: "Aucune adresse email pour ce client",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Create mailto link with PDF attachment info
      const docType = invoice.type === 'devis' ? 'Devis' : 'Facture';
      const subject = encodeURIComponent(`${docType} ${invoice.invoice_number}`);
      const body = encodeURIComponent(
        `Bonjour,\n\n` +
        `Veuillez trouver ci-joint ${docType.toLowerCase()} ${invoice.invoice_number}.\n\n` +
        `Montant total: ${formatTND(invoice.total)}\n` +
        `Date d'échéance: ${new Date(invoice.due_date).toLocaleDateString('fr-FR')}\n\n` +
        `Cordialement`
      );
      
      const mailtoLink = `mailto:${invoice.client.email}?subject=${subject}&body=${body}`;
      window.open(mailtoLink, '_blank');
      
      toast({
        title: "Email préparé",
        description: `Email préparé pour ${invoice.client.email}. Téléchargez le PDF et attachez-le manuellement.`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible d'ouvrir le client email",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any, label: string }> = {
      brouillon: { variant: "outline", label: "Brouillon" },
      envoyée: { variant: "default", label: "Envoyée" },
      payée: { variant: "secondary", label: "Payée" },
      en_retard: { variant: "destructive", label: "En retard" },
      annulée: { variant: "destructive", label: "Annulée" },
    };
    const config = variants[status] || variants.brouillon;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      facture: "Facture",
      devis: "Devis",
      avoir: "Avoir",
      complementaire: "Complémentaire",
    };
    return <Badge variant="outline">{labels[type] || type}</Badge>;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      especes: "Espèces",
      cheque: "Chèque",
      virement: "Virement",
      carte: "Carte bancaire",
      prelevement: "Prélèvement",
      autre: "Autre",
    };
    return labels[method] || method;
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

  if (!invoice) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Facture introuvable</p>
        </div>
      </DashboardLayout>
    );
  }

  const totalPaid = invoice.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const remainingAmount = invoice.total - totalPaid;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/invoices")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground">{invoice.invoice_number}</h1>
                {getStatusBadge(invoice.status)}
                {getTypeBadge(invoice.type)}
              </div>
              <p className="text-muted-foreground">Détails de la facture</p>
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
            <Button variant="outline" onClick={handleSendEmail} className="gap-2">
              <Mail className="w-4 h-4" />
              Envoyer par email
            </Button>
            <Button variant="outline" onClick={() => navigate(`/invoices/${id}/edit`)} className="gap-2">
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
                    Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible.
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
                <p className="font-semibold">{invoice.client?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p>{invoice.client?.email}</p>
              </div>
              {invoice.client?.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p>{invoice.client.phone}</p>
                </div>
              )}
              {invoice.client?.address && (
                <div>
                  <p className="text-sm text-muted-foreground">Adresse</p>
                  <p className="text-sm">{invoice.client.address}</p>
                </div>
              )}
              {invoice.client?.tax_id && (
                <div>
                  <p className="text-sm text-muted-foreground">Matricule fiscal</p>
                  <p className="text-sm">{invoice.client.tax_id}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Détails facture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Date de facture</p>
                <p className="font-semibold">
                  {new Date(invoice.invoice_date).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date d'échéance</p>
                <p className="font-semibold">
                  {new Date(invoice.due_date).toLocaleDateString("fr-FR")}
                </p>
              </div>
              {invoice.payment_conditions && (
                <div>
                  <p className="text-sm text-muted-foreground">Conditions de paiement</p>
                  <p className="text-sm">{invoice.payment_conditions}</p>
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
                <span className="font-bold">{formatTND(invoice.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Montant payé</span>
                <span className="font-semibold text-green-600">{formatTND(totalPaid)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-semibold">Reste à payer</span>
                <span className={`font-bold ${remainingAmount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {formatTND(remainingAmount)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lignes de facture</CardTitle>
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
                {invoice.invoice_items?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatTND(item.unit_price)}</TableCell>
                    <TableCell className="text-right">{item.tax_rate}%</TableCell>
                    <TableCell className="text-right">{item.discount_percent}%</TableCell>
                    <TableCell className="text-right font-semibold">{formatTND(item.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-6 flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sous-total HT:</span>
                  <span className="font-semibold">{formatTND(invoice.subtotal)}</span>
                </div>
                {invoice.discount_amount && invoice.discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remise:</span>
                    <span className="font-semibold text-green-600">-{formatTND(invoice.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Montant TVA:</span>
                  <span className="font-semibold">{formatTND(invoice.tax_amount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total TTC:</span>
                  <span>{formatTND(invoice.total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Paiements</CardTitle>
            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Ajouter un paiement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enregistrer un paiement</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Montant (TND)</Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de paiement</Label>
                    <Input
                      type="date"
                      value={paymentData.payment_date}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, payment_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mode de paiement</Label>
                    <Select
                      value={paymentData.payment_method}
                      onValueChange={(value) => setPaymentData(prev => ({ ...prev, payment_method: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="especes">Espèces</SelectItem>
                        <SelectItem value="cheque">Chèque</SelectItem>
                        <SelectItem value="virement">Virement bancaire</SelectItem>
                        <SelectItem value="carte">Carte bancaire</SelectItem>
                        <SelectItem value="prelevement">Prélèvement</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Référence</Label>
                    <Input
                      value={paymentData.reference}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, reference: e.target.value }))}
                      placeholder="Numéro de chèque, référence virement..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={paymentData.notes}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Notes complémentaires..."
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleAddPayment} className="w-full">
                    Enregistrer le paiement
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {invoice.payments && invoice.payments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucun paiement enregistré</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Mode de paiement</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.payments?.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{new Date(payment.payment_date).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell>{getPaymentMethodLabel(payment.payment_method)}</TableCell>
                      <TableCell>{payment.reference || "-"}</TableCell>
                      <TableCell className="text-right font-semibold">{formatTND(payment.amount)}</TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer le paiement</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer ce paiement ?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeletePayment(payment.id)}
                                className="bg-destructive"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {invoice.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
      
    </DashboardLayout>
  );
};

export default InvoiceDetail;