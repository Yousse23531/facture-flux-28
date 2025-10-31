# FacturePro - Application de Facturation Tunisienne

Application web complète de gestion de facturation pour les entreprises tunisiennes, avec support natif du Dinar Tunisien (TND) et conformité aux normes fiscales tunisiennes.

## 🎯 Fonctionnalités principales

### Gestion des Clients
- ✅ Création, modification et suppression de clients
- ✅ Informations complètes : matricule fiscal, TVA, coordonnées
- ✅ Champs spécifiques à la Tunisie (matricule fiscal tunisien)
- ✅ Historique et suivi des clients

### Gestion des Produits & Services  
- ✅ Catalogue de produits avec prix en TND
- ✅ Taux de TVA tunisiens (0%, 7%, 13%, 19%)
- ✅ Gestion des unités (unité, heure, jour, forfait, etc.)
- ✅ Statut actif/inactif
- ✅ Références et descriptions détaillées

### Gestion des Factures
- ✅ Création de factures, avoirs et factures complémentaires
- ✅ Lignes de facture avec quantités, prix, remises et TVA
- ✅ Calcul automatique des montants HT, TVA et TTC
- ✅ Numérotation automatique des factures (FACT-YYYY-XXXX)
- ✅ Statuts : brouillon, envoyée, payée, en retard, annulée
- ✅ Conditions de paiement personnalisables
- ✅ Notes et informations complémentaires

### Gestion des Paiements
- ✅ Enregistrement de paiements multiples par facture
- ✅ Modes de paiement : espèces, chèque, virement, carte, prélèvement
- ✅ Suivi des montants payés et restant à payer
- ✅ Références de paiement (numéro de chèque, référence virement)
- ✅ Historique complet des paiements

### Rapports et Statistiques
- ✅ Chiffre d'affaires par période
- ✅ Montants encaissés et en attente
- ✅ Analyse par statut de facture
- ✅ Répartition par mode de paiement
- ✅ Liste des dernières factures
- ✅ Filtrage par dates personnalisables

### Sécurité et Conformité
- ✅ Authentification sécurisée avec Supabase
- ✅ Row Level Security (RLS) pour l'isolation des données
- ✅ Conformité RGPD
- ✅ Cryptage des données
- ✅ Gestion des rôles et permissions

## 💻 Technologies utilisées

- **Vite** - Build tool rapide pour le développement
- **TypeScript** - Typage statique pour plus de robustesse
- **React** - Interface utilisateur réactive
- **Shadcn-ui** - Composants UI modernes et accessibles
- **Tailwind CSS** - Stylisation utilitaire
- **Supabase** - Backend-as-a-Service (authentification, base de données, stockage)
- **React Router** - Navigation côté client
- **TanStack Query** - Gestion de l'état et cache des données
- **Zod** - Validation de schémas
- **React Hook Form** - Gestion des formulaires

## 🚀 Installation et démarrage

### Prérequis
- Node.js 18+ et npm (recommandé via [nvm](https://github.com/nvm-sh/nvm))
- Compte Supabase (gratuit) pour version cloud

### Utilisation avec Supabase Cloud

```bash
# 1. Cloner le repository
git clone <YOUR_GIT_URL>
cd facture-flux-28

# 2. Installer les dépendances
npm install

# 3. Créer un projet Supabase sur supabase.com

# 4. Configurer les variables d'environnement
# Créer un fichier .env avec vos clés Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# 5. Exécuter les migrations de base de données
# Dans Supabase SQL Editor, exécuter:
# supabase/migrations/20251027183042_efc03275-3921-4e03-9959-9bd8d9be1073.sql

# 6. Démarrer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

```bash
# 1. Cloner le repository
git clone <YOUR_GIT_URL>
cd facture-flux-28

# 2. Installer les dépendances
npm install

# 3. Créer un projet Supabase sur supabase.com

# 4. Configurer les variables d'environnement
# Créer un fichier .env avec vos clés Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# 5. Exécuter les migrations de base de données
# Dans Supabase SQL Editor, exécuter:
# supabase/migrations/20251027183042_efc03275-3921-4e03-9959-9bd8d9be1073.sql

# 6. Démarrer le serveur de développement
npm run dev
```

## 📋 Structure du projet

```
src/
├── components/
│   ├── ui/                 # Composants UI réutilisables (shadcn)
│   └── DashboardLayout.tsx # Layout principal avec navigation
├── pages/
│   ├── Auth.tsx           # Authentification
│   ├── Dashboard.tsx      # Tableau de bord
│   ├── Clients.tsx        # Liste des clients
│   ├── ClientForm.tsx     # Formulaire client (création/édition)
│   ├── Products.tsx       # Liste des produits
│   ├── ProductForm.tsx    # Formulaire produit (création/édition)
│   ├── Invoices.tsx       # Liste des factures
│   ├── InvoiceForm.tsx    # Formulaire facture (création/édition)
│   ├── InvoiceDetail.tsx  # Détails et paiements d'une facture
│   └── Reports.tsx        # Rapports et statistiques
├── lib/
│   ├── currency.ts        # Utilitaires de formatage TND et calculs
│   └── utils.ts           # Utilitaires généraux
├── integrations/supabase/
│   ├── client.ts          # Client Supabase
│   └── types.ts           # Types TypeScript générés
└── hooks/                 # Hooks React personnalisés

supabase/
└── migrations/            # Migrations de base de données SQL
```

## 💰 Format monétaire TND

L'application utilise le format tunisien pour les montants :
- **Format** : `X,XXX DT` (avec 3 décimales)
- **Exemple** : `1 234,567 DT`
- **Utilitaires** : `/src/lib/currency.ts`

## 🗄️ Base de données

### Tables principales

- **clients** - Informations des clients
- **products** - Catalogue de produits/services
- **invoices** - En-têtes des factures
- **invoice_items** - Lignes de facture
- **payments** - Paiements reçus
- **purchase_orders** - Bons de commande
- **purchase_order_items** - Lignes de bons de commande

Tous les utilisateurs ont accès uniquement à leurs propres données grâce aux politiques RLS de Supabase.

## 🔐 Sécurité

- Authentification via Supabase Auth
- Row Level Security (RLS) activé sur toutes les tables
- Données isolées par utilisateur (user_id)
- Protection CSRF et XSS
- HTTPS obligatoire en production

## 📊 Utilisation

### Créer une première facture

1. **Créer un client**
   - Aller dans "Clients" → "Nouveau client"
   - Remplir les informations (nom, email, matricule fiscal, etc.)
   - Enregistrer

2. **Créer des produits**
   - Aller dans "Produits" → "Nouveau produit"
   - Définir le nom, prix HT, taux de TVA
   - Enregistrer

3. **Créer une facture**
   - Aller dans "Factures" → "Nouvelle facture"
   - Sélectionner le client
   - Ajouter des lignes (produits, quantités, remises)
   - Les totaux sont calculés automatiquement
   - Enregistrer

4. **Enregistrer un paiement**
   - Ouvrir la facture
   - Cliquer sur "Ajouter un paiement"
   - Saisir le montant, mode de paiement et référence
   - Enregistrer

## 📈 Scripts disponibles

```bash
npm run dev        # Démarrer le serveur de développement
npm run build      # Build de production
npm run preview    # Prévisualiser le build de production
npm run lint       # Vérifier le code avec ESLint
```

## 🌐 Déploiement

L'application peut être déployée sur plusieurs plateformes :

- **Vercel** (recommandé pour Vite/React)
- **Netlify**
- **Cloudflare Pages**

### Configuration Supabase pour la production

1. Créer un projet Supabase en production
2. Exécuter les migrations SQL
3. Configurer les variables d'environnement sur votre plateforme de déploiement
4. Activer l'authentification et les politiques RLS

## 📝 Licence

Ce projet est développé pour une utilisation professionnelle en Tunisie.

## 🤝 Support

Pour toute question ou assistance, contactez l'équipe de développement.
