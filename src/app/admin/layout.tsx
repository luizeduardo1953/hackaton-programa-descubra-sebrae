'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Users, TrendingUp, HardHat, Building2, Briefcase, MapPin, 
  ShieldAlert, BookOpen, Bell, Search, LogOut, Star, PanelLeft, Trophy
} from 'lucide-react';
import { db } from '../../lib/db';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchVal, setSearchVal] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [alertas, setAlertas] = useState(0);

  useEffect(() => {
    const diag = db.getDiagnostics();
    setAlertas(diag.counters.alertas);
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('descubra_session_role');
    }
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path;

  const navGroups = [
    {
      label: 'Visão Geral',
      links: [
        { href: '/admin/painel', label: 'Painel Estratégico', icon: TrendingUp },
      ]
    },
    {
      label: 'Cadastros',
      links: [
        { href: '/admin/cadastro/jovens',           label: 'Jovens',           icon: Users },
        { href: '/admin/cadastro/tecnicos',        label: 'Técnicos',         icon: HardHat },
        { href: '/admin/cadastro/empresas',        label: 'Empresas',         icon: Building2 },
        { href: '/admin/cadastro/entidades',       label: 'Entidades',        icon: Trophy },
        { href: '/admin/cadastro/unidades',        label: 'Unidades',         icon: MapPin },
        { href: '/admin/cadastro/vulnerabilidades',label: 'Vulnerabilidades', icon: ShieldAlert },
        { href: '/admin/cadastro/cursos',          label: 'Cursos',           icon: BookOpen },
        { href: '/admin/cadastro/parceiros',       label: 'Parceiros',        icon: Briefcase },
      ]
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ background: '#f4f6f9' }}>
      
      {/* SIDEBAR */}
      <aside 
        className={`flex flex-col shrink-0 transition-all duration-300 overflow-hidden ${
          sidebarOpen ? 'w-60' : 'w-0'
        }`}
        style={{ background: '#1B365D' }}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-violet-500 p-2 rounded-xl shadow-lg shadow-violet-500/30">
              <Star className="h-5 w-5 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-white text-base font-black tracking-tight leading-none">Descubra</h1>
              <p className="text-[10px] text-violet-400 font-bold uppercase tracking-wider mt-0.5">Coordenação Geral</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-4">
          {navGroups.map(group => (
            <div key={group.label}>
              <p className="text-[9px] font-black uppercase tracking-widest text-violet-700/70 px-3 mb-1.5">{group.label}</p>
              <div className="flex flex-col gap-0.5">
                {group.links.map(link => {
                  const active = isActive(link.href);
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                        active 
                          ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30' 
                          : 'text-violet-300 hover:bg-violet-500/10 hover:text-white'
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${active ? 'stroke-[2.5]' : 'stroke-2'}`} />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 shrink-0 border-t border-violet-900/60">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-[13px] font-semibold text-violet-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sair da conta
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-[68px] bg-white border-b border-violet-100 flex items-center justify-between px-5 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-3 flex-1">
            <button 
              onClick={() => setSidebarOpen(v => !v)}
              className="p-2 rounded-xl text-violet-400 hover:bg-violet-50 hover:text-violet-600 transition-colors shrink-0"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
            
            <div className="search-bar flex items-center px-4 py-2 w-full max-w-sm gap-2.5">
              <Search className="h-4 w-4 text-violet-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Buscar cadastros, métricas..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="bg-transparent focus:outline-none text-xs w-full text-slate-700 font-semibold placeholder:text-violet-300"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 pl-4">
            <div className="relative cursor-pointer group">
              <div className="p-2 rounded-xl group-hover:bg-violet-50 transition-colors">
                <Bell className="h-5 w-5 text-slate-400" />
              </div>
              {alertas > 0 && (
                <span className="absolute top-1.5 right-1.5 h-3.5 w-3.5 bg-rose-500 rounded-full border-2 border-white text-[8px] font-black text-white flex items-center justify-center">
                  {alertas}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5 pl-4 border-l border-violet-100">
              <div className="h-8 w-8 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-sm select-none">
                A
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-black text-[#1e1b4b]">Coordenação</span>
                <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">Admin • Descubra</span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-7">
          <div className="max-w-7xl mx-auto flex flex-col gap-5">
            {children}
          </div>
        </main>
      </div>
      
    </div>
  );
}