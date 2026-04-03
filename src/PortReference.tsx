import { useState, useEffect, useMemo } from 'react'
import { Search, Sun, Moon, Languages, Server, X, ChevronDown, ChevronUp } from 'lucide-react'

// ── i18n ─────────────────────────────────────────────────────────────────────
const translations = {
  en: {
    title: 'Well-Known Port Reference',
    subtitle: 'Interactive reference for top 100 well-known TCP/UDP port numbers. Search by port number or service name. Everything runs client-side.',
    searchPlaceholder: 'Search port, service, or description...',
    port: 'Port',
    service: 'Service',
    protocol: 'Protocol',
    description: 'Description',
    noResults: 'No ports match your search.',
    builtBy: 'Built by',
    filterAll: 'All',
    filterTcp: 'TCP',
    filterUdp: 'UDP',
    filterBoth: 'TCP+UDP',
    ports: 'ports',
    rfc: 'RFC / Standard',
    category: 'Category',
    encrypted: 'Encrypted',
    cleartext: 'Cleartext',
    tls: 'TLS',
  },
  pt: {
    title: 'Referencia de Portas Conhecidas',
    subtitle: 'Referencia interativa para as 100 principais portas TCP/UDP conhecidas. Busque por numero de porta ou nome de servico. Tudo roda no navegador.',
    searchPlaceholder: 'Buscar porta, servico ou descricao...',
    port: 'Porta',
    service: 'Servico',
    protocol: 'Protocolo',
    description: 'Descricao',
    noResults: 'Nenhuma porta encontrada para sua busca.',
    builtBy: 'Criado por',
    filterAll: 'Todas',
    filterTcp: 'TCP',
    filterUdp: 'UDP',
    filterBoth: 'TCP+UDP',
    ports: 'portas',
    rfc: 'RFC / Padrao',
    category: 'Categoria',
    encrypted: 'Criptografado',
    cleartext: 'Texto plano',
    tls: 'TLS',
  }
} as const

type Lang = keyof typeof translations

// ── Port Data ─────────────────────────────────────────────────────────────────
type Proto = 'tcp' | 'udp' | 'both'
type Category = 'file-transfer' | 'email' | 'web' | 'remote' | 'dns-dhcp' | 'database' | 'monitoring' | 'messaging' | 'security' | 'other'

interface PortEntry {
  port: number
  service: string
  proto: Proto
  category: Category
  encrypted: boolean | 'tls'
  description: { en: string; pt: string }
  rfc?: string
}

const PORTS: PortEntry[] = [
  { port: 20, service: 'FTP-DATA', proto: 'tcp', category: 'file-transfer', encrypted: false, description: { en: 'FTP data transfer (active mode)', pt: 'Transferencia de dados FTP (modo ativo)' }, rfc: 'RFC 959' },
  { port: 21, service: 'FTP', proto: 'tcp', category: 'file-transfer', encrypted: false, description: { en: 'FTP control (command) channel', pt: 'Canal de controle FTP (comandos)' }, rfc: 'RFC 959' },
  { port: 22, service: 'SSH', proto: 'tcp', category: 'remote', encrypted: true, description: { en: 'Secure Shell — encrypted remote login, file transfers, tunneling', pt: 'Shell Seguro — login remoto criptografado, transferencia de arquivos, tunelamento' }, rfc: 'RFC 4253' },
  { port: 23, service: 'Telnet', proto: 'tcp', category: 'remote', encrypted: false, description: { en: 'Unencrypted remote terminal access (deprecated — use SSH)', pt: 'Acesso remoto a terminal sem criptografia (obsoleto — use SSH)' }, rfc: 'RFC 854' },
  { port: 25, service: 'SMTP', proto: 'tcp', category: 'email', encrypted: false, description: { en: 'Simple Mail Transfer Protocol — server-to-server email delivery', pt: 'Protocolo de Transferencia de E-mail — entrega de e-mail entre servidores' }, rfc: 'RFC 5321' },
  { port: 53, service: 'DNS', proto: 'both', category: 'dns-dhcp', encrypted: false, description: { en: 'Domain Name System — name-to-IP resolution (UDP for queries, TCP for zone transfers)', pt: 'Sistema de Nomes de Dominio — resolucao de nomes para IP (UDP para consultas, TCP para transferencias de zona)' }, rfc: 'RFC 1035' },
  { port: 67, service: 'DHCP', proto: 'udp', category: 'dns-dhcp', encrypted: false, description: { en: 'DHCP server — assigns IP addresses to clients automatically', pt: 'Servidor DHCP — atribui enderecos IP aos clientes automaticamente' }, rfc: 'RFC 2131' },
  { port: 68, service: 'DHCP', proto: 'udp', category: 'dns-dhcp', encrypted: false, description: { en: 'DHCP client — receives IP configuration from DHCP server', pt: 'Cliente DHCP — recebe configuracao IP do servidor DHCP' }, rfc: 'RFC 2131' },
  { port: 80, service: 'HTTP', proto: 'tcp', category: 'web', encrypted: false, description: { en: 'Hypertext Transfer Protocol — unencrypted web traffic', pt: 'Protocolo de Transferencia de Hipertexto — trafego web sem criptografia' }, rfc: 'RFC 9110' },
  { port: 110, service: 'POP3', proto: 'tcp', category: 'email', encrypted: false, description: { en: 'Post Office Protocol v3 — email retrieval from server (downloads and optionally deletes)', pt: 'Protocolo de Post Office v3 — recuperacao de e-mail do servidor (baixa e opcionalmente apaga)' }, rfc: 'RFC 1939' },
  { port: 119, service: 'NNTP', proto: 'tcp', category: 'messaging', encrypted: false, description: { en: 'Network News Transfer Protocol — Usenet newsgroup access', pt: 'Protocolo de Transferencia de Noticias de Rede — acesso a newsgroups Usenet' }, rfc: 'RFC 3977' },
  { port: 123, service: 'NTP', proto: 'udp', category: 'other', encrypted: false, description: { en: 'Network Time Protocol — clock synchronization', pt: 'Protocolo de Tempo de Rede — sincronizacao de relogio' }, rfc: 'RFC 5905' },
  { port: 135, service: 'MS-RPC', proto: 'both', category: 'other', encrypted: false, description: { en: 'Microsoft Remote Procedure Call endpoint mapper', pt: 'Mapeador de endpoints Microsoft RPC' } },
  { port: 137, service: 'NetBIOS-NS', proto: 'udp', category: 'other', encrypted: false, description: { en: 'NetBIOS Name Service — Windows name resolution', pt: 'Servico de Nomes NetBIOS — resolucao de nomes Windows' }, rfc: 'RFC 1001' },
  { port: 139, service: 'NetBIOS-SSN', proto: 'tcp', category: 'file-transfer', encrypted: false, description: { en: 'NetBIOS Session Service — Windows file/printer sharing (SMB over NetBIOS)', pt: 'Servico de Sessao NetBIOS — compartilhamento de arquivos/impressoras Windows (SMB sobre NetBIOS)' } },
  { port: 143, service: 'IMAP', proto: 'tcp', category: 'email', encrypted: false, description: { en: 'Internet Message Access Protocol — email access (keeps messages on server)', pt: 'Protocolo de Acesso a Mensagens Internet — acesso a e-mail (mantém mensagens no servidor)' }, rfc: 'RFC 9051' },
  { port: 161, service: 'SNMP', proto: 'udp', category: 'monitoring', encrypted: false, description: { en: 'Simple Network Management Protocol — network device monitoring and management', pt: 'Protocolo Simples de Gerenciamento de Rede — monitoramento e gerenciamento de dispositivos de rede' }, rfc: 'RFC 3411' },
  { port: 162, service: 'SNMP-Trap', proto: 'udp', category: 'monitoring', encrypted: false, description: { en: 'SNMP Trap — unsolicited alerts from managed devices to manager', pt: 'SNMP Trap — alertas nao solicitados de dispositivos gerenciados para o gerenciador' }, rfc: 'RFC 3413' },
  { port: 179, service: 'BGP', proto: 'tcp', category: 'other', encrypted: false, description: { en: 'Border Gateway Protocol — internet routing between autonomous systems', pt: 'Protocolo de Gateway de Borda — roteamento de internet entre sistemas autonomos' }, rfc: 'RFC 4271' },
  { port: 389, service: 'LDAP', proto: 'both', category: 'security', encrypted: false, description: { en: 'Lightweight Directory Access Protocol — directory services (Active Directory, OpenLDAP)', pt: 'Protocolo Leve de Acesso a Diretorio — servicos de diretorio (Active Directory, OpenLDAP)' }, rfc: 'RFC 4511' },
  { port: 443, service: 'HTTPS', proto: 'tcp', category: 'web', encrypted: true, description: { en: 'HTTP over TLS/SSL — encrypted web traffic', pt: 'HTTP sobre TLS/SSL — trafego web criptografado' }, rfc: 'RFC 9110' },
  { port: 445, service: 'SMB', proto: 'tcp', category: 'file-transfer', encrypted: false, description: { en: 'Server Message Block — Windows file/printer sharing (direct, without NetBIOS)', pt: 'Server Message Block — compartilhamento de arquivos/impressoras Windows (direto, sem NetBIOS)' } },
  { port: 465, service: 'SMTPS', proto: 'tcp', category: 'email', encrypted: true, description: { en: 'SMTP over TLS — encrypted email submission (legacy; prefer 587)', pt: 'SMTP sobre TLS — envio de e-mail criptografado (legado; prefira 587)' } },
  { port: 514, service: 'Syslog', proto: 'udp', category: 'monitoring', encrypted: false, description: { en: 'Syslog — standard log message transport for network devices', pt: 'Syslog — transporte padrao de mensagens de log para dispositivos de rede' }, rfc: 'RFC 5424' },
  { port: 515, service: 'LPD', proto: 'tcp', category: 'other', encrypted: false, description: { en: 'Line Printer Daemon — network printing protocol', pt: 'Daemon de Impressora de Linha — protocolo de impressao em rede' }, rfc: 'RFC 1179' },
  { port: 587, service: 'SMTP/TLS', proto: 'tcp', category: 'email', encrypted: 'tls', description: { en: 'SMTP with STARTTLS — recommended port for mail client submission', pt: 'SMTP com STARTTLS — porta recomendada para envio por cliente de e-mail' }, rfc: 'RFC 6409' },
  { port: 636, service: 'LDAPS', proto: 'both', category: 'security', encrypted: true, description: { en: 'LDAP over TLS/SSL — encrypted directory services', pt: 'LDAP sobre TLS/SSL — servicos de diretorio criptografados' } },
  { port: 993, service: 'IMAPS', proto: 'tcp', category: 'email', encrypted: true, description: { en: 'IMAP over TLS/SSL — encrypted email access', pt: 'IMAP sobre TLS/SSL — acesso a e-mail criptografado' } },
  { port: 995, service: 'POP3S', proto: 'tcp', category: 'email', encrypted: true, description: { en: 'POP3 over TLS/SSL — encrypted email retrieval', pt: 'POP3 sobre TLS/SSL — recuperacao de e-mail criptografada' } },
  { port: 1080, service: 'SOCKS', proto: 'tcp', category: 'security', encrypted: false, description: { en: 'SOCKS proxy protocol — general-purpose proxy/tunneling', pt: 'Protocolo de proxy SOCKS — proxy/tunelamento de uso geral' }, rfc: 'RFC 1928' },
  { port: 1433, service: 'MS-SQL', proto: 'tcp', category: 'database', encrypted: false, description: { en: 'Microsoft SQL Server — default database port', pt: 'Microsoft SQL Server — porta padrao de banco de dados' } },
  { port: 1434, service: 'MS-SQL-M', proto: 'udp', category: 'database', encrypted: false, description: { en: 'Microsoft SQL Server Browser — instance discovery', pt: 'Navegador SQL Server da Microsoft — descoberta de instancias' } },
  { port: 1521, service: 'Oracle', proto: 'tcp', category: 'database', encrypted: false, description: { en: 'Oracle Database default listener port', pt: 'Porta de listener padrao do Oracle Database' } },
  { port: 1723, service: 'PPTP', proto: 'tcp', category: 'security', encrypted: 'tls', description: { en: 'Point-to-Point Tunneling Protocol — VPN (outdated; use WireGuard or OpenVPN)', pt: 'Protocolo de Tunelamento Ponto-a-Ponto — VPN (obsoleto; use WireGuard ou OpenVPN)' } },
  { port: 2049, service: 'NFS', proto: 'both', category: 'file-transfer', encrypted: false, description: { en: 'Network File System — remote file access (Linux/Unix)', pt: 'Sistema de Arquivos de Rede — acesso remoto a arquivos (Linux/Unix)' }, rfc: 'RFC 7530' },
  { port: 2082, service: 'cPanel', proto: 'tcp', category: 'web', encrypted: false, description: { en: 'cPanel web hosting control panel (HTTP)', pt: 'Painel de controle de hospedagem cPanel (HTTP)' } },
  { port: 2083, service: 'cPanel-SSL', proto: 'tcp', category: 'web', encrypted: true, description: { en: 'cPanel web hosting control panel (HTTPS)', pt: 'Painel de controle de hospedagem cPanel (HTTPS)' } },
  { port: 2086, service: 'WHM', proto: 'tcp', category: 'web', encrypted: false, description: { en: 'WHM (WebHost Manager) control panel (HTTP)', pt: 'Painel de controle WHM (WebHost Manager) (HTTP)' } },
  { port: 2087, service: 'WHM-SSL', proto: 'tcp', category: 'web', encrypted: true, description: { en: 'WHM (WebHost Manager) control panel (HTTPS)', pt: 'Painel de controle WHM (WebHost Manager) (HTTPS)' } },
  { port: 3306, service: 'MySQL', proto: 'tcp', category: 'database', encrypted: false, description: { en: 'MySQL / MariaDB database server', pt: 'Servidor de banco de dados MySQL / MariaDB' } },
  { port: 3389, service: 'RDP', proto: 'both', category: 'remote', encrypted: true, description: { en: 'Remote Desktop Protocol — Windows remote desktop access', pt: 'Protocolo de Desktop Remoto — acesso remoto ao desktop Windows' } },
  { port: 4443, service: 'Alt-HTTPS', proto: 'tcp', category: 'web', encrypted: true, description: { en: 'Alternative HTTPS port — used by some proxies and web UIs', pt: 'Porta HTTPS alternativa — usada por alguns proxies e interfaces web' } },
  { port: 5060, service: 'SIP', proto: 'both', category: 'messaging', encrypted: false, description: { en: 'Session Initiation Protocol — VoIP call signaling (unencrypted)', pt: 'Protocolo de Iniciacao de Sessao — sinalizacao de chamadas VoIP (sem criptografia)' }, rfc: 'RFC 3261' },
  { port: 5061, service: 'SIPS', proto: 'tcp', category: 'messaging', encrypted: true, description: { en: 'SIP over TLS — encrypted VoIP signaling', pt: 'SIP sobre TLS — sinalizacao VoIP criptografada' }, rfc: 'RFC 3261' },
  { port: 5432, service: 'PostgreSQL', proto: 'tcp', category: 'database', encrypted: false, description: { en: 'PostgreSQL database server', pt: 'Servidor de banco de dados PostgreSQL' } },
  { port: 5900, service: 'VNC', proto: 'tcp', category: 'remote', encrypted: false, description: { en: 'Virtual Network Computing — remote desktop (RFB protocol)', pt: 'VNC — desktop remoto (protocolo RFB)' }, rfc: 'RFC 6143' },
  { port: 5938, service: 'TeamViewer', proto: 'both', category: 'remote', encrypted: true, description: { en: 'TeamViewer remote access and support', pt: 'Acesso remoto e suporte TeamViewer' } },
  { port: 6379, service: 'Redis', proto: 'tcp', category: 'database', encrypted: false, description: { en: 'Redis in-memory data store', pt: 'Armazenamento de dados em memoria Redis' } },
  { port: 6443, service: 'K8s-API', proto: 'tcp', category: 'other', encrypted: true, description: { en: 'Kubernetes API server — HTTPS endpoint for cluster management', pt: 'Servidor de API Kubernetes — endpoint HTTPS para gerenciamento de cluster' } },
  { port: 8080, service: 'HTTP-Alt', proto: 'tcp', category: 'web', encrypted: false, description: { en: 'Alternative HTTP port — commonly used for dev servers, proxies, and web UIs', pt: 'Porta HTTP alternativa — comumente usada para servidores de desenvolvimento, proxies e interfaces web' } },
  { port: 8443, service: 'HTTPS-Alt', proto: 'tcp', category: 'web', encrypted: true, description: { en: 'Alternative HTTPS port — used by Tomcat, Kubernetes webhooks, and web UIs', pt: 'Porta HTTPS alternativa — usada por Tomcat, webhooks Kubernetes e interfaces web' } },
  { port: 8888, service: 'Jupyter', proto: 'tcp', category: 'web', encrypted: false, description: { en: 'Jupyter Notebook default port — data science web interface', pt: 'Porta padrao do Jupyter Notebook — interface web de ciencia de dados' } },
  { port: 9090, service: 'Prometheus', proto: 'tcp', category: 'monitoring', encrypted: false, description: { en: 'Prometheus metrics scraping and web UI', pt: 'Coleta de metricas e interface web do Prometheus' } },
  { port: 9200, service: 'Elasticsearch', proto: 'tcp', category: 'database', encrypted: false, description: { en: 'Elasticsearch REST API — search and analytics engine', pt: 'API REST do Elasticsearch — mecanismo de busca e analitica' } },
  { port: 9300, service: 'Elasticsearch-T', proto: 'tcp', category: 'database', encrypted: false, description: { en: 'Elasticsearch inter-node transport communication', pt: 'Comunicacao de transporte entre nos do Elasticsearch' } },
  { port: 11211, service: 'Memcached', proto: 'both', category: 'database', encrypted: false, description: { en: 'Memcached distributed memory caching', pt: 'Cache de memoria distribuido Memcached' } },
  { port: 27017, service: 'MongoDB', proto: 'tcp', category: 'database', encrypted: false, description: { en: 'MongoDB document database server', pt: 'Servidor de banco de dados de documentos MongoDB' } },
  { port: 27018, service: 'MongoDB-S', proto: 'tcp', category: 'database', encrypted: false, description: { en: 'MongoDB shard server port', pt: 'Porta do servidor de shard MongoDB' } },
]

const CATEGORIES: { key: 'all' | Category; label: { en: string; pt: string }; color: string }[] = [
  { key: 'all', label: { en: 'All', pt: 'Todas' }, color: '#f97316' },
  { key: 'web', label: { en: 'Web', pt: 'Web' }, color: '#3b82f6' },
  { key: 'email', label: { en: 'Email', pt: 'E-mail' }, color: '#f59e0b' },
  { key: 'database', label: { en: 'Database', pt: 'Banco' }, color: '#8b5cf6' },
  { key: 'remote', label: { en: 'Remote', pt: 'Remoto' }, color: '#10b981' },
  { key: 'security', label: { en: 'Security', pt: 'Seguranca' }, color: '#ef4444' },
  { key: 'dns-dhcp', label: { en: 'DNS/DHCP', pt: 'DNS/DHCP' }, color: '#06b6d4' },
  { key: 'monitoring', label: { en: 'Monitoring', pt: 'Monitor' }, color: '#ec4899' },
  { key: 'file-transfer', label: { en: 'Files', pt: 'Arquivos' }, color: '#84cc16' },
  { key: 'messaging', label: { en: 'Messaging', pt: 'Mensagens' }, color: '#a16207' },
  { key: 'other', label: { en: 'Other', pt: 'Outros' }, color: '#64748b' },
]

const ACCENT = '#f97316'

function getCategoryColor(cat: Category): string {
  return CATEGORIES.find(c => c.key === cat)?.color ?? '#64748b'
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function PortReference() {
  const [lang, setLang] = useState<Lang>(() => (navigator.language.startsWith('pt') ? 'pt' : 'en'))
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<'all' | Category>('all')
  const [protoFilter, setProtoFilter] = useState<'all' | Proto>('all')
  const [expanded, setExpanded] = useState<number | null>(null)

  const t = translations[lang]

  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return PORTS.filter(p => {
      const matchCat = category === 'all' || p.category === category
      const matchProto = protoFilter === 'all' || p.proto === protoFilter || (protoFilter === 'both' && p.proto === 'both')
      const matchSearch = !q ||
        String(p.port).includes(q) ||
        p.service.toLowerCase().includes(q) ||
        p.description[lang].toLowerCase().includes(q) ||
        (p.rfc?.toLowerCase().includes(q) ?? false)
      return matchCat && matchProto && matchSearch
    })
  }, [search, category, protoFilter, lang])

  const toggleExpand = (port: number) => setExpanded(e => e === port ? null : port)

  const encLabel = (enc: boolean | 'tls') => {
    if (enc === true) return t.encrypted
    if (enc === 'tls') return t.tls
    return t.cleartext
  }

  const encColor = (enc: boolean | 'tls') => {
    if (enc === true) return '#22c55e'
    if (enc === 'tls') return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: ACCENT }}>
              <Server size={18} className="text-white" />
            </div>
            <span className="font-semibold">Port Reference</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Languages size={14} />{lang.toUpperCase()}
            </button>
            <button onClick={() => setDark(d => !d)} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="https://github.com/gmowses/port-reference" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
            </a>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
          </div>

          {/* Search + Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-9 pr-8 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 transition-colors"
                style={{ '--tw-ring-color': ACCENT } as React.CSSProperties}
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Protocol Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-zinc-400">{t.protocol}:</span>
              {(['all', 'tcp', 'udp', 'both'] as const).map(proto => (
                <button
                  key={proto}
                  onClick={() => setProtoFilter(proto)}
                  className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${protoFilter === proto ? 'text-white border-transparent' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                  style={protoFilter === proto ? { backgroundColor: ACCENT, borderColor: ACCENT } : {}}
                >
                  {proto === 'all' ? t.filterAll : proto === 'both' ? 'TCP+UDP' : proto.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${category === cat.key ? 'text-white border-transparent' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                  style={category === cat.key ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
                >
                  {cat.label[lang]}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-zinc-400">{filtered.length} {t.ports}</p>

          {/* Port List */}
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-zinc-400">
              <Server size={32} className="mx-auto mb-3 opacity-30" />
              <p>{t.noResults}</p>
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.map(entry => {
                const isExpanded = expanded === entry.port
                const catColor = getCategoryColor(entry.category)
                const catLabel = CATEGORIES.find(c => c.key === entry.category)?.label[lang] ?? entry.category

                return (
                  <div key={entry.port}>
                    <button
                      onClick={() => toggleExpand(entry.port)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      {/* Port number */}
                      <span
                        className="shrink-0 w-14 text-center font-mono font-bold text-sm rounded-md py-0.5"
                        style={{ backgroundColor: `${ACCENT}20`, color: ACCENT }}
                      >
                        {entry.port}
                      </span>

                      {/* Service name */}
                      <span className="shrink-0 w-28 font-mono text-sm font-medium truncate">{entry.service}</span>

                      {/* Description */}
                      <span className="flex-1 text-sm text-zinc-500 dark:text-zinc-400 truncate">{entry.description[lang]}</span>

                      {/* Badges */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                          style={{ backgroundColor: `${catColor}20`, color: catColor }}
                        >
                          {catLabel}
                        </span>
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium uppercase"
                          style={{
                            backgroundColor: entry.proto === 'both' ? '#a855f720' : entry.proto === 'tcp' ? '#3b82f620' : '#10b98120',
                            color: entry.proto === 'both' ? '#a855f7' : entry.proto === 'tcp' ? '#3b82f6' : '#10b981',
                          }}
                        >
                          {entry.proto === 'both' ? 'TCP+UDP' : entry.proto.toUpperCase()}
                        </span>
                        {isExpanded ? <ChevronUp size={14} className="text-zinc-400" /> : <ChevronDown size={14} className="text-zinc-400" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-3 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                        <p className="text-sm text-zinc-600 dark:text-zinc-300">{entry.description[lang]}</p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { label: t.port, value: String(entry.port) },
                            { label: t.protocol, value: entry.proto === 'both' ? 'TCP + UDP' : entry.proto.toUpperCase() },
                            { label: t.category, value: catLabel },
                            { label: 'Security', value: encLabel(entry.encrypted) },
                          ].map(item => (
                            <div key={item.label} className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2">
                              <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-0.5">{item.label}</p>
                              <p
                                className="text-sm font-mono font-medium"
                                style={item.label === 'Security' ? { color: encColor(entry.encrypted) } : {}}
                              >
                                {item.value}
                              </p>
                            </div>
                          ))}
                        </div>

                        {entry.rfc && (
                          <div className="rounded-lg px-3 py-2 text-xs" style={{ backgroundColor: `${ACCENT}10`, borderLeft: `3px solid ${ACCENT}` }}>
                            <p className="text-zinc-500 dark:text-zinc-400">{t.rfc}: <span className="font-medium text-zinc-700 dark:text-zinc-200">{entry.rfc}</span></p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-zinc-400">
          <span>{t.builtBy} <a href="https://github.com/gmowses" className="text-zinc-600 dark:text-zinc-300 hover:underline transition-colors">Gabriel Mowses</a></span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  )
}
