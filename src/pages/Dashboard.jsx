import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFinance } from '../hooks/useFinance'
import Summary from '../components/Summary'
import Transactions from '../components/Transactions'
import Pendencies from '../components/Pendencies'
import styles from './Dashboard.module.css'

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const MONTHS_FULL = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [tab, setTab] = useState('resumo')
  const today = new Date()
  const [month, setMonth] = useState(today.getMonth())
  const [year, setYear] = useState(today.getFullYear())

  const finance = useFinance(month, year)

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="10" fill="var(--accent)"/>
            <path d="M8 22L14 10L18 17L21 14L24 22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className={styles.appName}>FinançasPro</span>
        </div>
        <div className={styles.monthNav}>
          <button onClick={prevMonth}>&#8249;</button>
          <span>{MONTHS_FULL[month]} {year}</span>
          <button onClick={nextMonth}>&#8250;</button>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.userEmail}>{user?.email}</span>
          <button className={styles.signOut} onClick={signOut}>Sair</button>
        </div>
      </header>

      <nav className={styles.tabs}>
        {['resumo','transacoes','pendencias'].map(t => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.active : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'resumo' ? 'Resumo' : t === 'transacoes' ? 'Transações' : 'Pendências'}
          </button>
        ))}
      </nav>

      <main className={styles.main}>
        {tab === 'resumo' && <Summary finance={finance} month={month} year={year} />}
        {tab === 'transacoes' && <Transactions finance={finance} month={month} year={year} />}
        {tab === 'pendencias' && <Pendencies finance={finance} />}
      </main>

      <nav className={styles.bottomNav}>
        {[
          { key:'resumo', label:'Resumo', icon:'🏠' },
          { key:'transacoes', label:'Transações', icon:'↕️' },
          { key:'pendencias', label:'Pendências', icon:'📅' },
        ].map(t => (
          <button
            key={t.key}
            className={`${styles.bnav} ${tab === t.key ? styles.bnavActive : ''}`}
            onClick={() => setTab(t.key)}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
