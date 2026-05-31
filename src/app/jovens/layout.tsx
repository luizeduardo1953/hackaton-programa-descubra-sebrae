'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, Map, Award, Gift, UserCircle2, LogOut, Bell, Search, PanelLeft, Star, Zap
} from 'lucide-react';
import { db } from '../../lib/db';
import type { Youth } from '../../lib/db';

function getTier(pontos: number) {
  if (pontos >= 1000) return { label: 'Diamante', emoji: '💎', color: 'text-cyan-400'   };
  if (pontos >= 500)  return { label: 'Ouro',     emoji: '🥇', color: 'text-amber-400'  };
  if (pontos >= 200)  return { label: 'Prata',    emoji: '🥈', color: 'text-slate-300'  };
  return                     { label: 'Bronze',   emoji: '🥉', color: 'text-orange-400' };
}

export default function JovensLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchVal, setSearchVal] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [jovem, setJovem] = useState<Youth | null>(null);
  const [nome,  setNome]  = useState('Lucas');

  useEffect(() => {
    const list = db.getYouthList();
    const j = list.find(y => y.id === 'y3') || list[0];
    setJovem(j ?? null);

    if (typeof window !== 'undefined') {
      const n = sessionStorage.getItem('descubra_session_nome');
      if (n) setNome(n.split(' ')[0]);
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') sessionStorage.clear();
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: '/jovens/painel',       icon: Home,        label: 'Início'    },
    { href: '/jovens/trajetoria',   icon: Map,         label: 'Trilha'    },
    { href: '/jovens/certificados', icon: Award,       label: 'Conquistas'},
    { href: '/jovens/premiacoes',   icon: Gift,        label: 'Prêmios'   },
    { href: '/jovens/depoimentos',  icon: UserCircle2, label: 'Meu Perfil'},
  ];

  const pontos = jovem?.pontos_gamificacao ?? 0;
  const tier   = getTier(pontos);

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
              <p className="text-[10px] text-violet-400 font-bold uppercase tracking-wider mt-0.5">Portal do Jovem</p>
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="px-5 pb-4 shrink-0">
          <div className="bg-violet-900/50 rounded-2xl p-3 border border-violet-800/40">
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[10px] font-black uppercase ${tier.color}`}>{tier.emoji} {tier.label}</span>
              <span className="text-[10px] font-black text-white">{pontos} XP</span>
            </div>
            <div className="h-1.5 bg-violet-950 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full transition-all"
                style={{ width: `${Math.min((pontos % 200) / 200 * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-0.5">
          {navLinks.map(link => {
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
            
            <div className="search-bar flex items-center px-4 py-2 w-full max-w-sm gap-2.5 hidden sm:flex">
              <Search className="h-4 w-4 text-violet-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Buscar missões, certificados..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="bg-transparent focus:outline-none text-xs w-full text-slate-700 font-semibold placeholder:text-violet-300"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 pl-4">
            {/* XP chip */}
            <div className="hidden sm:flex items-center gap-1.5 bg-violet-50 border border-violet-100 px-3 py-1.5 rounded-full">
              <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span className="text-xs font-black text-[#1e1b4b]">{pontos} pts</span>
            </div>

            <div className="relative cursor-pointer group">
              <div className="p-2 rounded-xl group-hover:bg-violet-50 transition-colors">
                <Bell className="h-5 w-5 text-slate-400" />
              </div>
            </div>

            <div className="flex items-center gap-2.5 pl-4 border-l border-violet-100">
              <div className="h-8 w-8 rounded-full bg-violet-100 border border-violet-200 text-violet-600 flex items-center justify-center font-bold text-sm select-none">
                {nome[0]?.toUpperCase() || 'J'}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-black text-[#1e1b4b]">{nome}</span>
                <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">Jovem Aprendiz</span>
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
