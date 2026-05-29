import { useEffect, useState } from 'react'
import styles from './Summary.module.css'

const MONTHS_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

function fmt(v) {
  return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

export default function Summary({ finance, month, year }) {
  const { transactions, pendencies, loading, fetchLast6Months } = finance
  const [chartData, setChartData] = useState([])

  const income = transactions.filter(t => t.type === 'income').reduce((a, t) => a + Number(t.amount), 0)
  const expense = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + Number(t.amount), 0)
  const balance = income - expense
  const pendAmt = pendencies.filter(p => !p.paid).reduce((a, p) => a + Number(p.amount), 0)

  useEffect(() => {
    fetchLast6Months().then(data => {
      const months = []
      for (let i = 5; i >= 0; i--) {
        let m = month - i, y = year
        if (m < 0) { m += 12; y-- }
        const txns = data.filter(t => {
          const d = new Date(t.date)
          return d.getMonth() === m && d.getFullYear() === y
        })
        months.push({
          label: MONTHS_SHORT[m],
          inc: txns.filter(t => t.type === 'income').reduce((a, t) => a + Number(t.amount), 0),
          exp: txns.filter(t => t.type === 'expense').reduce((a, t) => a + Number(t.amount), 0),
        })
      }
      setChartData(months)
    })
  }, [month, year, fetchLast6Months])

  const maxVal = Math.max(...chartData.map(b => Math.max(b.inc, b.exp)), 1)

  const recent = [...transactions].slice(0, 5)

  if (loading) return <div className={styles.loading}>Carregando...</div>

  return (
    <div>
      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Receita</div>
          <div className={`${styles.cardValue} ${styles.green}`}>{fmt(income)}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Despesa</div>
          <div className={`${styles.cardValue} ${styles.red}`}>{fmt(expense)}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Saldo</div>
          <div className={`${styles.cardValue} ${balance >= 0 ? styles.green : styles.red}`}>{fmt(balance)}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Pendências</div>
          <div className={`${styles.cardValue} ${styles.amber}`}>{fmt(pendAmt)}</div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.secTitle}>Últimos 6 meses</h3>
        <div className={styles.chart}>
          {chartData.map((b, i) => (
            <div key={i} className={styles.barCol}>
              <div className={styles.bars}>
                <div className={styles.barIncome} style={{ height: `${(b.inc / maxVal) * 80}px` }} title={fmt(b.inc)} />
                <div className={styles.barExpense} style={{ height: `${(b.exp / maxVal) * 80}px` }} title={fmt(b.exp)} />
              </div>
              <div className={styles.barLabel}>{b.label}</div>
            </div>
          ))}
        </div>
        <div className={styles.legend}>
          <span><span className={styles.dotGreen}></span>Receita</span>
          <span><span className={styles.dotRed}></span>Despesa</span>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.secTitle}>Transações recentes</h3>
        {recent.length === 0
          ? <p className={styles.empty}>Nenhuma transação este mês.</p>
          : recent.map(t => (
            <div key={t.id} className={styles.txnRow}>
              <div>
                <div className={styles.txnName}>{t.description}</div>
                <div className={styles.txnMeta}>{t.category} · {new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR')}</div>
              </div>
              <div className={`${styles.txnAmt} ${t.type === 'income' ? styles.green : styles.red}`}>
                {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
