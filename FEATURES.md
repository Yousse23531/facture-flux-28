# FacturePro - Guide des Fonctionnalités

## 📋 Vue d'ensemble

Application web complète de facturation adaptée au contexte tunisien avec support natif du Dinar Tunisien (TND) et conformité aux normes fiscales tunisiennes.

---

## 🎯 Fonctionnalités Implémentées

### 1. 👥 Gestion des Clients

**Page : `/clients`**

#### Fonctionnalités
- ✅ Liste complète des clients avec recherche en temps réel
- ✅ Affichage en grille avec informations clés (nom, email, téléphone, ville)
- ✅ Navigation vers les détails client au clic

**Page : `/clients/:id` (Formulaire client)**

#### Champs disponibles
- Nom / Raison sociale (requis)
- Email (requis)
- Téléphone (format tunisien : +216 XX XXX XXX)
- Matricule fiscal (format tunisien : XXXXXXX/X/X/XXX)
- Numéro TVA (format : TN XXXXXXXX)
- Adresse complète
- Ville
- Code postal
- Pays (par défaut : Tunisie)
- Notes

#### Actions
- ✅ Créer un nouveau client
- ✅ Modifier un client existant
- ✅ Supprimer un client (avec confirmation)
- ✅ Validation des données en temps réel
- ✅ Messages de succès/erreur

---

### 2. 📦 Gestion des Produits & Services

**Page : `/products`**

#### Fonctionnalités
- ✅ Catalogue de produits en grille
- ✅ Recherche par nom de produit
- ✅ Badge actif/inactif
- ✅ Affichage du prix HT en TND
- ✅ Taux de TVA visible

**Page : `/products/:id` (Formulaire produit)**

#### Champs disponibles
- Nom du produit/service (requis)
- Référence (ex: REF-001)
- Description détaillée
- Prix unitaire HT en TND (requis, 3 décimales)
- Taux de TVA (sélection) :
  - 0% - Exonéré
  - 7% - Taux réduit
  - 13% - Taux intermédiaire
  - 19% - Taux normal (par défaut)
- Unité (sélection) :
  - Unité
  - Heure
  - Jour
  - Mois
  - Kilogramme
  - Litre
  - Mètre carré
  - Forfait
- Statut actif/inactif (switch)

#### Actions
- ✅ Créer un nouveau produit
- ✅ Modifier un produit existant
- ✅ Supprimer un produit (avec confirmation)
- ✅ Activer/désactiver un produit

---

### 3. 📄 Gestion des Factures

**Page : `/invoices`**

#### Fonctionnalités
- ✅ Liste complète des factures
- ✅ Recherche par numéro de facture ou nom de client
- ✅ Badges de statut colorés (brouillon, envoyée, payée, en retard, annulée)
- ✅ Affichage du montant total en TND
- ✅ Date de facture formatée
- ✅ Tri par date décroissante

**Page : `/invoices/new` ou `/invoices/:id/edit` (Formulaire facture)**

#### Informations générales
- Client (sélection depuis la liste) - requis
- Type de facture :
  - Facture (standard)
  - Avoir (note de crédit)
  - Complémentaire
- Statut :
  - Brouillon
  - Envoyée
  - Payée
  - En retard
  - Annulée
- Date de facture (requis)
- Date d'échéance (requis)
- Conditions de paiement (ex: "Paiement à 30 jours")

#### Lignes de facture
Tableau dynamique avec colonnes :
- Produit (sélection depuis le catalogue)
- Description (modifiable)
- Quantité (3 décimales)
- Prix unitaire HT (3 décimales)
- Taux TVA (%)
- Remise (%)
- Total ligne (calculé automatiquement)
- Action supprimer

**Boutons d'action :**
- ✅ Ajouter une ligne
- ✅ Supprimer une ligne
- ✅ Sélection produit avec pré-remplissage automatique

#### Calculs automatiques
- Sous-total HT
- Montant TVA
- Total TTC
- Application des remises ligne par ligne

#### Numérotation automatique
Format : `FACT-YYYY-XXXX`
- Exemple : FACT-2025-0001, FACT-2025-0002, etc.
- Séquence par année
- Génération automatique via fonction SQL

**Page : `/invoices/:id` (Détails facture)**

#### Sections

**1. Informations client**
- Nom
- Email
- Téléphone
- Adresse
- Matricule fiscal

**2. Détails facture**
- Numéro de facture
- Type et statut
- Date de facture
- Date d'échéance
- Conditions de paiement

**3. Montants**
- Total TTC
- Montant payé (en vert)
- Reste à payer (en orange si > 0, vert si = 0)

**4. Lignes de facture**
Tableau détaillé avec :
- Description
- Quantité
- Prix HT
- TVA %
- Remise %
- Total

Récapitulatif :
- Sous-total HT
- Remise globale (si applicable)
- Montant TVA
- Total TTC

**5. Gestion des paiements**

Dialog "Ajouter un paiement" :
- Montant (TND, 3 décimales)
- Date de paiement
- Mode de paiement :
  - Espèces
  - Chèque
  - Virement bancaire
  - Carte bancaire
  - Prélèvement
  - Autre
- Référence (numéro de chèque, référence virement, etc.)
- Notes

Tableau des paiements :
- Date
- Mode de paiement
- Référence
- Montant
- Action supprimer (avec confirmation)

**6. Notes**
Affichage des notes de la facture (si présentes)

#### Actions principales
- ✅ Modifier la facture
- ✅ Supprimer la facture (avec confirmation)
- ✅ Ajouter un paiement
- ✅ Supprimer un paiement

---

### 4. 📊 Rapports et Statistiques

**Page : `/reports`**

#### Filtrage par période
- Date de début (sélecteur)
- Date de fin (sélecteur)
- Bouton "Générer le rapport"

#### Indicateurs clés (KPIs)
Trois cartes affichant :
1. **Chiffre d'affaires total** (sur la période)
2. **Montant encaissé** (paiements reçus, en vert)
3. **Montant en attente** (reste à payer, en orange)

#### Analyses détaillées

**1. Factures par statut**
Tableau :
- Statut
- Nombre de factures
- Total TND

**2. Paiements par méthode**
Tableau :
- Mode de paiement
- Nombre de paiements
- Total TND

**3. Dernières factures**
Liste des 10 dernières factures avec :
- Numéro
- Client
- Date
- Statut
- Montant
- Cliquable pour voir les détails

---

### 5. 🏠 Tableau de bord

**Page : `/dashboard`**

#### Statistiques en temps réel
Quatre cartes :
1. **Factures** - Nombre total
2. **Clients** - Nombre total
3. **Produits** - Nombre total
4. **Chiffre d'affaires** - Total en TND

---

### 6. 📄 Gestion des Bons de Commande

**Page : `/purchase-orders`**

#### Fonctionnalités
- ✅ Liste complète des bons de commande
- ✅ Recherche par numéro de bon de commande ou nom de client
- ✅ Badges de statut colorés (brouillon, envoyé, confirmé, livré, annulé)
- ✅ Affichage du montant total en TND
- ✅ Date de bon de commande formatée
- ✅ Tri par date décroissante

**Page : `/purchase-orders/new` ou `/purchase-orders/:id/edit` (Formulaire bon de commande)**

#### Informations générales
- Client (sélection depuis la liste) - requis
- Date de bon de commande (requis)
- Date de livraison prévue (requis)
- Statut :
  - Brouillon
  - Envoyé
  - Confirmé
  - Livré
  - Annulé
- Conditions de livraison (ex: "Livraison dans les 30 jours")

#### Lignes de bon de commande
Tableau dynamique avec colonnes :
- Produit (sélection depuis le catalogue)
- Description (modifiable)
- Quantité (3 décimales)
- Prix unitaire HT (3 décimales)
- Taux TVA (%)
- Remise (%)
- Total ligne (calculé automatiquement)
- Action supprimer

**Boutons d'action :**
- ✅ Ajouter une ligne
- ✅ Supprimer une ligne
- ✅ Sélection produit avec pré-remplissage automatique

#### Calculs automatiques
- Sous-total HT
- Montant TVA
- Total TTC
- Application des remises ligne par ligne

#### Numérotation automatique
Format : `BC-YYYY-XXXX`
- Exemple : BC-2025-0001, BC-2025-0002, etc.
- Séquence par année
- Génération automatique via fonction SQL

**Page : `/purchase-orders/:id` (Détails bon de commande)**

#### Sections

**1. Informations client**
- Nom
- Email
- Téléphone
- Adresse
- Matricule fiscal

**2. Détails bon de commande**
- Numéro de bon de commande
- Statut
- Date de bon de commande
- Date de livraison prévue
- Conditions de livraison

**3. Montants**
- Total TTC

**4. Lignes de bon de commande**
Tableau détaillé avec :
- Description
- Quantité
- Prix HT
- TVA %
- Remise %
- Total

Récapitulatif :
- Sous-total HT
- Remise globale (si applicable)
- Montant TVA
- Total TTC

**5. Notes**
Affichage des notes du bon de commande (si présentes)

#### Actions principales
- ✅ Modifier le bon de commande
- ✅ Supprimer le bon de commande (avec confirmation)
- ✅ Changer le statut

---

### 7. 🔐 Authentification et Sécurité

**Page : `/auth`**

#### Fonctionnalités
- ✅ Connexion par email/mot de passe
- ✅ Inscription de nouveaux utilisateurs
- ✅ Réinitialisation de mot de passe
- ✅ Session persistante

#### Sécurité
- ✅ Row Level Security (RLS) sur toutes les tables
- ✅ Isolation des données par utilisateur (user_id)
- ✅ Politiques de sécurité strictes :
  - Un utilisateur ne peut voir que ses propres données
  - CRUD limité aux ressources possédées
- ✅ Authentification via Supabase Auth
- ✅ Tokens JWT sécurisés

---

## 💰 Format Monétaire TND

### Spécificités tunisiennes
- **Symbole** : DT (Dinar Tunisien)
- **Format** : `X XXX,XXX DT`
- **Décimales** : 3 (millimes)
- **Exemples** :
  - 1 234,567 DT
  - 50,000 DT
  - 999 999,999 DT

### Utilitaires disponibles (`/src/lib/currency.ts`)

```typescript
formatTND(amount)              // Formatte en TND avec symbole
formatNumber(amount, decimals) // Formatte sans symbole
parseTND(formatted)            // Parse une chaîne TND en nombre
calculateTax(amount, rate)     // Calcule la TVA
calculateWithTax(amount, rate) // Montant TTC
calculateDiscount(amount, %)   // Calcule une remise
calculateLineTotal(...)        // Total ligne avec remise
calculateInvoiceTotals(...)    // Totaux facture complets
```

---

## 🗄️ Structure de la Base de Données

### Tables principales

**1. clients**
- id (UUID)
- user_id (UUID) - Propriétaire
- name (TEXT) - Nom/Raison sociale
- email (TEXT)
- phone (TEXT)
- address (TEXT)
- city (TEXT)
- postal_code (TEXT)
- country (TEXT) - Défaut: "Tunisie"
- tax_id (TEXT) - Matricule fiscal
- tva_number (TEXT)
- notes (TEXT)
- created_at, updated_at

**2. products**
- id (UUID)
- user_id (UUID)
- name (TEXT)
- description (TEXT)
- unit_price (DECIMAL 10,2)
- tax_rate (DECIMAL 5,2) - Défaut: 19%
- unit (TEXT) - Défaut: "unité"
- reference (TEXT)
- is_active (BOOLEAN) - Défaut: true
- created_at, updated_at

**3. invoices**
- id (UUID)
- user_id (UUID)
- invoice_number (TEXT) - Unique par utilisateur
- client_id (UUID) - FK vers clients
- invoice_date (DATE)
- due_date (DATE)
- status (TEXT) - brouillon|envoyée|payée|en_retard|annulée
- type (TEXT) - facture|avoir|complementaire
- currency (TEXT) - Défaut: "TND"
- subtotal (DECIMAL 10,2)
- tax_amount (DECIMAL 10,2)
- discount_amount (DECIMAL 10,2)
- total (DECIMAL 10,2)
- notes (TEXT)
- payment_conditions (TEXT)
- created_at, updated_at

**4. invoice_items**
- id (UUID)
- invoice_id (UUID) - FK vers invoices
- product_id (UUID) - FK vers products (nullable)
- description (TEXT)
- quantity (DECIMAL 10,2)
- unit_price (DECIMAL 10,2)
- tax_rate (DECIMAL 5,2)
- discount_percent (DECIMAL 5,2)
- total (DECIMAL 10,2)
- created_at

**5. payments**
- id (UUID)
- invoice_id (UUID) - FK vers invoices
- amount (DECIMAL 10,2)
- payment_date (DATE)
- payment_method (TEXT) - especes|cheque|virement|carte|prelevement|autre
- reference (TEXT)
- notes (TEXT)
- created_at

**6. purchase_orders**
- id (UUID)
- user_id (UUID)
- order_number (TEXT) - Unique par utilisateur
- client_id (UUID) - FK vers clients
- order_date (DATE)
- delivery_date (DATE)
- status (TEXT) - draft|sent|confirmed|delivered|cancelled
- currency (TEXT) - Défaut: "TND"
- subtotal (DECIMAL 10,2)
- tax_amount (DECIMAL 10,2)
- discount_amount (DECIMAL 10,2)
- total (DECIMAL 10,2)
- notes (TEXT)
- delivery_conditions (TEXT)
- created_at, updated_at

**7. purchase_order_items**
- id (UUID)
- purchase_order_id (UUID) - FK vers purchase_orders
- product_id (UUID) - FK vers products (nullable)
- description (TEXT)
- quantity (DECIMAL 10,2)
- unit_price (DECIMAL 10,2)
- tax_rate (DECIMAL 5,2)
- discount_percent (DECIMAL 5,2)
- total (DECIMAL 10,2)
- created_at

### Fonctions SQL

**generate_invoice_number()**
Génère automatiquement un numéro de facture séquentiel par année.
Format: FACT-YYYY-XXXX

**generate_order_number()**
Génère automatiquement un numéro de bon de commande séquentiel par année.
Format: BC-YYYY-XXXX

---

## 🚀 Navigation et Routing

### Routes principales

```
/                    → Page d'accueil
/auth                → Authentification
/dashboard           → Tableau de bord

/clients             → Liste des clients
/clients/new         → Nouveau client
/clients/:id         → Modifier client

/products            → Liste des produits
/products/new        → Nouveau produit
/products/:id        → Modifier produit

/invoices            → Liste des factures
/invoices/new        → Nouvelle facture
/invoices/:id        → Détails facture + paiements
/invoices/:id/edit   → Modifier facture

/purchase-orders     → Liste des bons de commande
/purchase-orders/new → Nouveau bon de commande
/purchase-orders/:id → Détails bon de commande
/purchase-orders/:id/edit → Modifier bon de commande

/reports             → Rapports et statistiques
```

### Navigation latérale

Menu disponible sur toutes les pages :
- 🏠 Tableau de bord
- 📄 Factures
- 📄 Bons de commande
- 👥 Clients
- 📦 Produits
- 📊 Rapports

---

## 🎨 Interface Utilisateur

### Design System
- **Framework** : Shadcn-ui + Radix UI
- **Styling** : Tailwind CSS
- **Thème** : Dark mode compatible
- **Responsive** : Mobile-first design
- **Accessibilité** : ARIA compliant

### Composants principaux
- Cards avec bordures et ombres
- Tables responsives
- Formulaires avec validation
- Dialogs modaux
- Badges de statut colorés
- Boutons avec icônes
- Inputs avec labels
- Selects personnalisés
- Toasts pour notifications

---

## ✅ Conformité et Normes

### Normes fiscales tunisiennes
- ✅ Taux de TVA tunisiens (0%, 7%, 13%, 19%)
- ✅ Format matricule fiscal tunisien
- ✅ Numérotation factures conforme
- ✅ Mentions légales (à personnaliser)

### RGPD et Protection des données
- ✅ Isolation des données par utilisateur
- ✅ Cryptage des données en transit (HTTPS)
- ✅ Authentification sécurisée
- ✅ Pas de partage de données entre utilisateurs

### Archivage
- ✅ Conservation illimitée des factures
- ✅ Historique complet des modifications (updated_at)
- ✅ Traçabilité des paiements
- ✅ Recherche rapide

---

## 📱 Compatibilité

### Navigateurs supportés
- Chrome/Edge (dernières versions)
- Firefox (dernières versions)
- Safari (dernières versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Appareils
- ✅ Desktop (optimisé)
- ✅ Tablette (responsive)
- ✅ Mobile (menu adaptatif)

---

## 🔄 Flux de travail typique

### Scénario : Créer et encaisser une facture

1. **Créer le client** (si nouveau)
   - `/clients/new`
   - Remplir les informations
   - Enregistrer

2. **Créer les produits** (si nouveaux)
   - `/products/new`
   - Définir prix et TVA
   - Enregistrer

3. **Créer la facture**
   - `/invoices/new`
   - Sélectionner le client
   - Ajouter des lignes de produits
   - Ajuster quantités/remises
   - Statut : "Envoyée"
   - Enregistrer

4. **Envoyer la facture au client**
   - Consulter `/invoices/:id`
   - Imprimer/Exporter (à implémenter)

5. **Enregistrer le paiement**
   - Sur `/invoices/:id`
   - Cliquer "Ajouter un paiement"
   - Saisir montant et mode
   - Enregistrer

6. **Suivre les encaissements**
   - Consulter le tableau de bord
   - Ou générer un rapport `/reports`

---

## 🎯 Prochaines évolutions possibles

### Fonctionnalités suggérées
- 📄 Export PDF des factures
- 📧 Envoi par email
- 📊 Graphiques avancés dans les rapports
- 💼 Gestion multi-entreprises
- 🔔 Notifications de relance
- 📱 Application mobile
- 🌍 Multi-devises
- 📦 Gestion de stock
- 🧾 Devis/Proformas
- 🔗 Intégration ERP/comptabilité

---

## 📞 Support

Pour toute question sur l'utilisation de l'application, consultez ce guide ou contactez l'équipe de développement.

**Version** : 1.0.0  
**Date** : Octobre 2025  
**Devise** : TND (Dinar Tunisien)  
**Pays** : Tunisie 🇹🇳
