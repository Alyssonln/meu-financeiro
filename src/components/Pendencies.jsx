import { useState } from 'react'
import Modal from './Modal'
import styles from './Pendencies.module.css'

const CATS = ['Cartão de crédito','Água','Luz','Internet','Telefone','Aluguel','Condomínio','Outros']

function fmt(v) {
  return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

function statusBadge(due, paid) {
  if (paid) return { label: 'Pago', cls: 'paid' }
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const d = new Date(due + 'T12:00:00'); d.setHours(0, 0, 0, 0)
  const diff = Math.round((d - today) / 86400000)
  if (diff < 0) return { label: `Vencida ${Math.abs(diff)}d atrás`, cls: 'overdue' }
  if (diff === 0) return { label: 'Vence hoje!', cls: 'today' }
  if (diff <= 5) return { label: `${diff}d restantes`, cls: 'soon' }
  return { label: `${diff}d`, cls: 'ok' }
}

export default function Pendencies({ finance }) {
  const { pendencies, loading, addPendency, markPaid, deletePendency } = finance
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ description: '', amount: '', due_date: '', category: 'Outros' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!form.description || !form.amount || !form.due_date) return setError('Preencha todos os campos.')
    setSaving(true); setError('')
    const { error } = await addPendency({ ...form, amount: parseFloat(form.amount), paid: false })
    setSaving(false)
    if (error) return setError(error.message)
    setOpen(false)
    setForm({ description: '', amount: '', due_date: '', category: 'Outros' })
  }

  const unpaid = pendencies.filter(p => !p.paid)
  const paid = pendencies.filter(p => p.paid)
  const totalPending = unpaid.reduce((a, p) => a + Number(p.amount), 0)

  if (loading) return <div className={styles.loading}>Carregando...</div>

  return (
    <div>
      <div className={styles.toolbar}>
        {unpaid.length > 0 && (
          <div className={styles.alert}>
            <span>⚠️</span>
            <span>{unpaid.length} pendência{unpaid.length > 1 ? 's' : ''} em aberto · Total: <strong>{fmt(totalPending)}</strong></span>
          </div>
        )}
        <button className={styles.addBtn} onClick={() => setOpen(true)}>+ Nova</button>
      </div>

      <div className={styles.section}>
        <div className={styles.secHeader}>Em aberto</div>
        {unpaid.length === 0
          ? <p className={styles.empty}>Nenhuma pendência em aberto. 🎉</p>
          : unpaid.map(p => {
            const { label, cls } = statusBadge(p.due_date, false)
            return (
              <div key={p.id} className={styles.row}>
                <div className={styles.rowLeft}>
                  <div>
                    <div className={styles.name}>{p.description}</div>
                    <div className={styles.meta}>
                      {p.category} · {new Date(p.due_date + 'T12:00:00').toLocaleDateString('pt-BR')} · {fmt(p.amount)}
                    </div>
                  </div>
                </div>
                <div className={styles.rowRight}>
                  <span className={`${styles.badge} ${styles[cls]}`}>{label}</span>
                  <button className={styles.payBtn} onClick={() => markPaid(p.id)} title="Marcar como pago">✓</button>
                  <button className={styles.delBtn} onClick={() => deletePendency(p.id)} title="Remover">✕</button>
                </div>
              </div>
            )
          })
        }
      </div>

      {paid.length > 0 && (
        <div className={`${styles.section} ${styles.paidSection}`}>
          <div className={styles.secHeader}>Pagos</div>
          {paid.map(p => (
            <div key={p.id} className={`${styles.row} ${styles.paidRow}`}>
              <div>
                <div className={styles.paidName}>{p.description}</div>
                <div className={styles.meta}>{p.category} · {new Date(p.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}</div>
              </div>
              <div className={styles.rowRight}>
                <span className={`${styles.badge} ${styles.paid}`}>Pago</span>
                <button className={styles.delBtn} onClick={() => deletePendency(p.id)} title="Remover">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Nova Pendência" onSave={handleSave} saving={saving}>
        <div className={styles.formGrid}>
          <div className={`${styles.field} ${styles.full}`}>
            <label>Descrição</label>
            <input placeholder="Ex: Fatura Nubank, Conta de luz..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className={styles.field}>
            <label>Valor (R$)</label>
            <input type="number" placeholder="0,00" step="0.01" min="0" inputMode="decimal" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
          </div>
          <div className={styles.field}>
            <label>Vencimento</label>
            <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
          </div>
          <div className={`${styles.field} ${styles.full}`}>
            <label>Categoria</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        {error && <div className={styles.error}>{error}</div>}
      </Modal>
    </div>
  )
}
