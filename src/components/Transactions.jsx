import { useState } from 'react'
import Modal from './Modal'
import styles from './Transactions.module.css'

const CATEGORIES = ['Salário','Freelance','Investimento','Moradia','Alimentação','Transporte','Saúde','Lazer','Educação','Outros']

function fmt(v) {
  return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

export default function Transactions({ finance, month, year }) {
  const { transactions, loading, addTransaction, deleteTransaction } = finance
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ description: '', amount: '', type: 'expense', category: 'Outros', date: new Date().toISOString().split('T')[0] })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const filtered = transactions.filter(t => filter === 'all' || t.type === filter)

  const handleSave = async () => {
    if (!form.description || !form.amount || !form.date) return setError('Preencha todos os campos.')
    setSaving(true); setError('')
    const { error } = await addTransaction({ ...form, amount: parseFloat(form.amount) })
    setSaving(false)
    if (error) return setError(error.message)
    setOpen(false)
    setForm({ description: '', amount: '', type: 'expense', category: 'Outros', date: new Date().toISOString().split('T')[0] })
  }

  if (loading) return <div className={styles.loading}>Carregando...</div>

  return (
    <div>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {[['all','Todas'],['income','Receitas'],['expense','Despesas']].map(([v,l]) => (
            <button key={v} className={`${styles.filterBtn} ${filter===v?styles.active:''}`} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>
        <button className={styles.addBtn} onClick={() => setOpen(true)}>+ Nova</button>
      </div>

      <div className={styles.section}>
        {filtered.length === 0
          ? <p className={styles.empty}>Nenhuma transação encontrada.</p>
          : filtered.map(t => (
            <div key={t.id} className={styles.row}>
              <div className={styles.rowLeft}>
                <div className={`${styles.dot} ${t.type === 'income' ? styles.dotIncome : styles.dotExpense}`} />
                <div>
                  <div className={styles.name}>{t.description}</div>
                  <div className={styles.meta}>{t.category} · {new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR')}</div>
                </div>
              </div>
              <div className={styles.rowRight}>
                <span className={`${styles.amount} ${t.type === 'income' ? styles.green : styles.red}`}>
                  {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                </span>
                <button className={styles.delBtn} onClick={() => deleteTransaction(t.id)} title="Remover">✕</button>
              </div>
            </div>
          ))
        }
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Nova Transação" onSave={handleSave} saving={saving}>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label>Tipo</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>Categoria</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className={`${styles.field} ${styles.full}`}>
            <label>Descrição</label>
            <input placeholder="Ex: Supermercado, Salário..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className={styles.field}>
            <label>Valor (R$)</label>
            <input type="number" placeholder="0,00" step="0.01" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} inputMode="decimal" />
          </div>
          <div className={styles.field}>
            <label>Data</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
        </div>
        {error && <div className={styles.error}>{error}</div>}
      </Modal>
    </div>
  )
}
