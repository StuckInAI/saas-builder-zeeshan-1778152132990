import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Todo } from '@/types';

export function useTodos(userId: string | null) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = useCallback(async () => {
    if (!supabase || !userId) return;
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setTodos((data as Todo[]) ?? []);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const createTodo = async (text: string): Promise<string | null> => {
    if (!supabase || !userId) return 'Not authenticated';
    const payload = {
      user_id: userId,
      text: text.trim(),
      completed: false,
    };
    const { error: insertError } = await supabase.from('todos').insert([payload]);
    if (insertError) return insertError.message;
    await fetchTodos();
    return null;
  };

  const toggleTodo = async (id: string, completed: boolean): Promise<string | null> => {
    if (!supabase || !userId) return 'Not authenticated';
    const { error: updateError } = await supabase
      .from('todos')
      .update({ completed })
      .eq('id', id)
      .eq('user_id', userId);
    if (updateError) return updateError.message;
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed } : t));
    return null;
  };

  const updateTodo = async (id: string, text: string): Promise<string | null> => {
    if (!supabase || !userId) return 'Not authenticated';
    const { error: updateError } = await supabase
      .from('todos')
      .update({ text: text.trim() })
      .eq('id', id)
      .eq('user_id', userId);
    if (updateError) return updateError.message;
    setTodos(prev => prev.map(t => t.id === id ? { ...t, text: text.trim() } : t));
    return null;
  };

  const deleteTodo = async (id: string): Promise<string | null> => {
    if (!supabase || !userId) return 'Not authenticated';
    const { error: deleteError } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (deleteError) return deleteError.message;
    setTodos(prev => prev.filter(t => t.id !== id));
    return null;
  };

  const clearCompleted = async (): Promise<string | null> => {
    if (!supabase || !userId) return 'Not authenticated';
    const completedIds = todos.filter(t => t.completed).map(t => t.id);
    if (completedIds.length === 0) return null;
    const { error: deleteError } = await supabase
      .from('todos')
      .delete()
      .in('id', completedIds)
      .eq('user_id', userId);
    if (deleteError) return deleteError.message;
    setTodos(prev => prev.filter(t => !t.completed));
    return null;
  };

  return { todos, loading, error, createTodo, toggleTodo, updateTodo, deleteTodo, clearCompleted, refetch: fetchTodos };
}
