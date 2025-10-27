-- Création des tables pour l'application de facturation

-- Table des clients
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'France',
  siret TEXT,
  tva_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des produits/services
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  unit_price DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  unit TEXT DEFAULT 'unité',
  reference TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des factures
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  invoice_number TEXT NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'brouillon' CHECK (status IN ('brouillon', 'envoyée', 'payée', 'en_retard', 'annulée')),
  type TEXT NOT NULL DEFAULT 'facture' CHECK (type IN ('facture', 'avoir', 'complementaire')),
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  payment_conditions TEXT DEFAULT 'Paiement à 30 jours',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, invoice_number)
);

-- Table des lignes de facture
CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des paiements
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('especes', 'cheque', 'virement', 'carte', 'prelevement', 'autre')),
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour clients
CREATE POLICY "Users can view their own clients"
  ON public.clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clients"
  ON public.clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
  ON public.clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
  ON public.clients FOR DELETE
  USING (auth.uid() = user_id);

-- Politiques RLS pour products
CREATE POLICY "Users can view their own products"
  ON public.products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own products"
  ON public.products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
  ON public.products FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
  ON public.products FOR DELETE
  USING (auth.uid() = user_id);

-- Politiques RLS pour invoices
CREATE POLICY "Users can view their own invoices"
  ON public.invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own invoices"
  ON public.invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices"
  ON public.invoices FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices"
  ON public.invoices FOR DELETE
  USING (auth.uid() = user_id);

-- Politiques RLS pour invoice_items
CREATE POLICY "Users can view invoice items of their invoices"
  ON public.invoice_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.invoices 
    WHERE invoices.id = invoice_items.invoice_id 
    AND invoices.user_id = auth.uid()
  ));

CREATE POLICY "Users can create invoice items for their invoices"
  ON public.invoice_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.invoices 
    WHERE invoices.id = invoice_items.invoice_id 
    AND invoices.user_id = auth.uid()
  ));

CREATE POLICY "Users can update invoice items of their invoices"
  ON public.invoice_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.invoices 
    WHERE invoices.id = invoice_items.invoice_id 
    AND invoices.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete invoice items of their invoices"
  ON public.invoice_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.invoices 
    WHERE invoices.id = invoice_items.invoice_id 
    AND invoices.user_id = auth.uid()
  ));

-- Politiques RLS pour payments
CREATE POLICY "Users can view payments of their invoices"
  ON public.payments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.invoices 
    WHERE invoices.id = payments.invoice_id 
    AND invoices.user_id = auth.uid()
  ));

CREATE POLICY "Users can create payments for their invoices"
  ON public.payments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.invoices 
    WHERE invoices.id = payments.invoice_id 
    AND invoices.user_id = auth.uid()
  ));

CREATE POLICY "Users can update payments of their invoices"
  ON public.payments FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.invoices 
    WHERE invoices.id = payments.invoice_id 
    AND invoices.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete payments of their invoices"
  ON public.payments FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.invoices 
    WHERE invoices.id = payments.invoice_id 
    AND invoices.user_id = auth.uid()
  ));

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Fonction pour générer un numéro de facture unique
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  new_number TEXT;
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '\\d{4}$') AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM public.invoices
  WHERE invoice_number LIKE 'FACT-' || year_part || '-%';
  
  new_number := 'FACT-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;