import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Users, Package, TrendingUp } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-10"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-primary mb-6 shadow-glow">
              <FileText className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              FacturePro
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              La solution complète pour gérer vos factures, clients et produits. 
              Simple, rapide et conforme aux normes françaises.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8">
                Commencer gratuitement
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="text-lg px-8">
                Se connecter
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Fonctionnalités principales
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-card mb-4">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Gestion des factures
              </h3>
              <p className="text-muted-foreground">
                Créez, modifiez et suivez vos factures en quelques clics. 
                Génération automatique des numéros et calcul des montants.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-card mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Base clients
              </h3>
              <p className="text-muted-foreground">
                Gérez facilement tous vos clients avec leurs coordonnées 
                complètes et historique de facturation.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-card mb-4">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Catalogue produits
              </h3>
              <p className="text-muted-foreground">
                Créez votre catalogue de produits et services avec prix, 
                TVA et descriptions détaillées.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <p className="text-muted-foreground">Conforme RGPD</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <p className="text-muted-foreground">Accessible</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">Multi</div>
              <p className="text-muted-foreground">Paiements</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">Auto</div>
              <p className="text-muted-foreground">Calculs</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Prêt à simplifier votre facturation ?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Rejoignez les entreprises qui ont déjà choisi FacturePro pour 
            gérer leur facturation efficacement.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={() => navigate("/auth")}
            className="text-lg px-8"
          >
            Démarrer maintenant
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
