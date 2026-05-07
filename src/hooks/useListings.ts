import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Listing, ListingFormData } from '@/types';

export function useListings(userId: string | null) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    if (!supabase || !userId) return;
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setListings((data as Listing[]) ?? []);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const createListing = async (formData: ListingFormData): Promise<string | null> => {
    if (!supabase || !userId) return 'Not authenticated';
    const payload = {
      user_id: userId,
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price) || 0,
      category: formData.category.trim(),
      status: formData.status,
    };
    const { error: insertError } = await supabase.from('listings').insert([payload]);
    if (insertError) return insertError.message;
    await fetchListings();
    return null;
  };

  const updateListing = async (id: string, formData: ListingFormData): Promise<string | null> => {
    if (!supabase || !userId) return 'Not authenticated';
    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price) || 0,
      category: formData.category.trim(),
      status: formData.status,
      updated_at: new Date().toISOString(),
    };
    const { error: updateError } = await supabase
      .from('listings')
      .update(payload)
      .eq('id', id)
      .eq('user_id', userId);
    if (updateError) return updateError.message;
    await fetchListings();
    return null;
  };

  const deleteListing = async (id: string): Promise<string | null> => {
    if (!supabase || !userId) return 'Not authenticated';
    const { error: deleteError } = await supabase
      .from('listings')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (deleteError) return deleteError.message;
    await fetchListings();
    return null;
  };

  return { listings, loading, error, createListing, updateListing, deleteListing, refetch: fetchListings };
}
