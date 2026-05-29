import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useFinance(month, year) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [pendencies, setPendencies] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTransactions = useCallback(async () => {
    if (!user) return
    const from = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const to = `${year}-${String(month + 1).padStart(2, '0')}-31`
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', from)
      .lte('date', to)
      .order('date', { ascending: false })
    setTransactions(data || [])
  }, [user, month, year])

  const fetchPendencies = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('pendencies')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true })
    setPendencies(data || [])
  }, [user])

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchTransactions(), fetchPendencies()]).finally(() => setLoading(false))
  }, [fetchTransactions, fetchPendencies])

  const addTransaction = async (payload) => {
    const { error } = await supabase
      .from('transactions')
      .insert({ ...payload, user_id: user.id })
    if (!error) fetchTransactions()
    return { error }
  }

  const deleteTransaction = async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (!error) fetchTransactions()
    return { error }
  }

  const addPendency = async (payload) => {
    const { error } = await supabase
      .from('pendencies')
      .insert({ ...payload, user_id: user.id })
    if (!error) fetchPendencies()
    return { error }
  }

  const markPaid = async (id) => {
    const { error } = await supabase
      .from('pendencies')
      .update({ paid: true })
      .eq('id', id)
    if (!error) fetchPendencies()
    return { error }
  }

  const deletePendency = async (id) => {
    const { error } = await supabase.from('pendencies').delete().eq('id', id)
    if (!error) fetchPendencies()
    return { error }
  }

  const fetchLast6Months = useCallback(async () => {
    if (!user) return []
    const from = new Date(year, month - 5, 1).toISOString().split('T')[0]
    const { data } = await supabase
      .from('transactions')
      .select('date, amount, type')
      .eq('user_id', user.id)
      .gte('date', from)
    return data || []
  }, [user, month, year])

  return {
    transactions,
    pendencies,
    loading,
    addTransaction,
    deleteTransaction,
    addPendency,
    markPaid,
    deletePendency,
    fetchLast6Months,
    refresh: () => { fetchTransactions(); fetchPendencies() }
  }
}
