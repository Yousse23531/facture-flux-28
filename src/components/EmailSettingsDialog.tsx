import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface EmailSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (settings: EmailSettings) => Promise<void>;
  defaultRecipient?: string;
  defaultSubject?: string;
  defaultBody?: string;
}

interface EmailSettings {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
  toEmail: string;
  subject: string;
  body: string;
}

export function EmailSettingsDialog({
  open,
  onOpenChange,
  onSend,
  defaultRecipient = "",
  defaultSubject = "",
  defaultBody = "",
}: EmailSettingsDialogProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<EmailSettings>({
    smtpHost: "",
    smtpPort: "587",
    smtpUser: "",
    smtpPass: "",
    fromEmail: "",
    toEmail: defaultRecipient,
    subject: defaultSubject,
    body: defaultBody,
  });
  const [sending, setSending] = useState(false);

  const handleChange = (field: keyof EmailSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    
    try {
      await onSend(settings);
      toast({
        title: "Succès",
        description: "Email envoyé avec succès",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'email: " + (error.message || ""),
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Paramètres d'email</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">Serveur SMTP *</Label>
              <Input
                id="smtpHost"
                required
                value={settings.smtpHost}
                onChange={(e) => handleChange("smtpHost", e.target.value)}
                placeholder="smtp.gmail.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort">Port SMTP *</Label>
              <Input
                id="smtpPort"
                type="number"
                required
                value={settings.smtpPort}
                onChange={(e) => handleChange("smtpPort", e.target.value)}
                placeholder="587"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtpUser">Nom d'utilisateur *</Label>
              <Input
                id="smtpUser"
                required
                value={settings.smtpUser}
                onChange={(e) => handleChange("smtpUser", e.target.value)}
                placeholder="votre@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPass">Mot de passe *</Label>
              <Input
                id="smtpPass"
                type="password"
                required
                value={settings.smtpPass}
                onChange={(e) => handleChange("smtpPass", e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fromEmail">Email expéditeur *</Label>
            <Input
              id="fromEmail"
              type="email"
              required
              value={settings.fromEmail}
              onChange={(e) => handleChange("fromEmail", e.target.value)}
              placeholder="votre@email.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="toEmail">Email destinataire *</Label>
            <Input
              id="toEmail"
              type="email"
              required
              value={settings.toEmail}
              onChange={(e) => handleChange("toEmail", e.target.value)}
              placeholder="client@email.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Sujet *</Label>
            <Input
              id="subject"
              required
              value={settings.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
              placeholder="Facture FACT-2025-01-001"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              rows={5}
              value={settings.body}
              onChange={(e) => handleChange("body", e.target.value)}
              placeholder="Bonjour, veuillez trouver ci-joint la facture..."
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={sending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={sending}>
              {sending ? "Envoi en cours..." : "Envoyer l'email"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}