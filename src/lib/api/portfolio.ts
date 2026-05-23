/**
 * User-scoped data access for the rental-portfolio table.
 */
import type { AppSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';
import type { RentalProperty } from '@/lib/types';

type Row = Database['public']['Tables']['rental_properties']['Row'];

function rowToProperty(row: Row): RentalProperty {
  return {
    id: row.id,
    name: row.name ?? undefined,
    type: row.type ?? undefined,
    purchasePrice: row.purchase_price ?? undefined,
    currentValue: row.current_value ?? undefined,
    monthlyRent: row.monthly_rent ?? undefined,
    monthlyExpenses: row.monthly_expenses ?? undefined,
    purchaseDate: row.purchase_date ?? undefined,
  };
}

export async function fetchPortfolio(
  client: AppSupabaseClient,
): Promise<RentalProperty[]> {
  const { data, error } = await client
    .from('rental_properties')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data.map(rowToProperty);
}

export async function createProperty(
  client: AppSupabaseClient,
  userId: string,
  prop: RentalProperty,
): Promise<RentalProperty> {
  const { data, error } = await client
    .from('rental_properties')
    .insert({
      user_id: userId,
      name: prop.name ?? null,
      type: prop.type ?? null,
      purchase_price: prop.purchasePrice ?? null,
      current_value: prop.currentValue ?? null,
      monthly_rent: prop.monthlyRent ?? null,
      monthly_expenses: prop.monthlyExpenses ?? null,
      purchase_date: prop.purchaseDate ?? null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return rowToProperty(data);
}

export async function updateProperty(
  client: AppSupabaseClient,
  userId: string,
  id: string | number,
  patch: Partial<RentalProperty>,
): Promise<void> {
  const { error } = await client
    .from('rental_properties')
    .update({
      ...(patch.name !== undefined && { name: patch.name ?? null }),
      ...(patch.type !== undefined && { type: patch.type ?? null }),
      ...(patch.purchasePrice !== undefined && {
        purchase_price: patch.purchasePrice ?? null,
      }),
      ...(patch.currentValue !== undefined && {
        current_value: patch.currentValue ?? null,
      }),
      ...(patch.monthlyRent !== undefined && {
        monthly_rent: patch.monthlyRent ?? null,
      }),
      ...(patch.monthlyExpenses !== undefined && {
        monthly_expenses: patch.monthlyExpenses ?? null,
      }),
      ...(patch.purchaseDate !== undefined && {
        purchase_date: patch.purchaseDate ?? null,
      }),
    })
    .eq('user_id', userId)
    .eq('id', String(id));
  if (error) throw error;
}

export async function deleteProperty(
  client: AppSupabaseClient,
  userId: string,
  id: string | number,
): Promise<void> {
  const { error } = await client
    .from('rental_properties')
    .delete()
    .eq('user_id', userId)
    .eq('id', String(id));
  if (error) throw error;
}

export async function bulkImportPortfolio(
  client: AppSupabaseClient,
  userId: string,
  properties: RentalProperty[],
): Promise<void> {
  if (properties.length === 0) return;
  const { error } = await client.from('rental_properties').insert(
    properties.map((p) => ({
      user_id: userId,
      name: p.name ?? null,
      type: p.type ?? null,
      purchase_price: p.purchasePrice ?? null,
      current_value: p.currentValue ?? null,
      monthly_rent: p.monthlyRent ?? null,
      monthly_expenses: p.monthlyExpenses ?? null,
      purchase_date: p.purchaseDate ?? null,
    })),
  );
  if (error) throw error;
}
