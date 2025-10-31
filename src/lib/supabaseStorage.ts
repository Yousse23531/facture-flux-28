import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

// Helper function to get current user ID
const getCurrentUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
};

// Clients service
export const clientsService = {
  getAll: async () => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    
    if (error) throw error;
    return data;
  },

  getById: async (id: string) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  create: async (client: Omit<TablesInsert<'clients'>, 'user_id'>) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('clients')
      .insert({ ...client, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  update: async (id: string, client: Omit<TablesInsert<'clients'>, 'user_id'>) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('clients')
      .update(client)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) throw error;
    return true;
  },

  search: async (searchTerm: string) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .order('name');
    
    if (error) throw error;
    return data;
  },
};

// Products service
export const productsService = {
  getAll: async () => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    
    if (error) throw error;
    return data;
  },

  getById: async (id: string) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  create: async (product: Omit<TablesInsert<'products'>, 'user_id'>) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('products')
      .insert({ ...product, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  update: async (id: string, product: Omit<TablesInsert<'products'>, 'user_id'>) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) throw error;
    return true;
  },

  getActive: async () => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data;
  },
};

// Invoices service
export const invoicesService = {
  getAll: async () => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data?.map(invoice => ({
      ...invoice,
      client_name: (invoice as any).client?.name || 'Client inconnu'
    })) || [];
  },

  getById: async (id: string) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(*),
        invoice_items(*)
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  create: async (invoice: Omit<TablesInsert<'invoices'>, 'user_id'>) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('invoices')
      .insert({ ...invoice, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  update: async (id: string, invoice: Omit<TablesInsert<'invoices'>, 'user_id'>) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('invoices')
      .update(invoice)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) throw error;
    return true;
  },

  getByClient: async (clientId: string) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('client_id', clientId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  getByStatus: async (status: string) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('status', status)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  getByDateRange: async (startDate: string, endDate: string) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .gte('invoice_date', startDate)
      .lte('invoice_date', endDate)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  generateInvoiceNumber: async () => {
    const { data, error } = await supabase
      .rpc('generate_invoice_number');
    
    if (error) throw error;
    return data;
  },
};

// Invoice items service
export const invoiceItemsService = {
  getByInvoice: async (invoiceId: string) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at');
    
    if (error) throw error;
    return data;
  },

  create: async (item: Omit<TablesInsert<'invoice_items'>, 'user_id'>) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('invoice_items')
      .insert(item)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  update: async (id: string, item: Omit<TablesInsert<'invoice_items'>, 'user_id'>) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('invoice_items')
      .update(item)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { error } = await supabase
      .from('invoice_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  deleteByInvoice: async (invoiceId: string) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { error } = await supabase
      .from('invoice_items')
      .delete()
      .eq('invoice_id', invoiceId);
    
    if (error) throw error;
    return true;
  },
};

// Payments service
export const paymentsService = {
  getByInvoice: async (invoiceId: string) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('payment_date');
    
    if (error) throw error;
    return data;
  },

  create: async (payment: Omit<TablesInsert<'payments'>, 'user_id'>) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  update: async (id: string, payment: Omit<TablesInsert<'payments'>, 'user_id'>) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('payments')
      .update(payment)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  getTotalByInvoice: async (invoiceId: string) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('payments')
      .select('amount')
      .eq('invoice_id', invoiceId);
    
    if (error) throw error;
    
    return data?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  },
};

// Purchase orders service
export const purchaseOrdersService = {
  getAll: async () => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        client:clients(name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data?.map(order => ({
      ...order,
      client_name: (order as any).client?.name || 'Client inconnu'
    })) || [];
  },

  getById: async (id: string) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        client:clients(*),
        purchase_order_items(*)
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  create: async (order: Omit<TablesInsert<'purchase_orders'>, 'user_id'>) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('purchase_orders')
      .insert({ ...order, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  update: async (id: string, order: Omit<TablesInsert<'purchase_orders'>, 'user_id'>) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('purchase_orders')
      .update(order)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { error } = await supabase
      .from('purchase_orders')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) throw error;
    return true;
  },

  getByClient: async (clientId: string) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .eq('client_id', clientId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  getByStatus: async (status: string) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .eq('status', status)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  getByDateRange: async (startDate: string, endDate: string) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .eq('user_id', userId)
      .gte('order_date', startDate)
      .lte('order_date', endDate)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  generateOrderNumber: async () => {
    const { data, error } = await supabase
      .rpc('generate_order_number');
    
    if (error) throw error;
    return data;
  },
};

// Purchase order items service
export const purchaseOrderItemsService = {
  getByPurchaseOrder: async (purchaseOrderId: string) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('purchase_order_items')
      .select('*')
      .eq('purchase_order_id', purchaseOrderId)
      .order('created_at');
    
    if (error) throw error;
    return data;
  },

  create: async (item: Omit<TablesInsert<'purchase_order_items'>, 'user_id'>) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('purchase_order_items')
      .insert(item)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  update: async (id: string, item: Omit<TablesInsert<'purchase_order_items'>, 'user_id'>) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('purchase_order_items')
      .update(item)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { error } = await supabase
      .from('purchase_order_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  deleteByPurchaseOrder: async (purchaseOrderId: string) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const { error } = await supabase
      .from('purchase_order_items')
      .delete()
      .eq('purchase_order_id', purchaseOrderId);
    
    if (error) throw error;
    return true;
  },
};