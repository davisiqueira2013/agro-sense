import { AlertTriangle, Inbox, RotateCw } from 'lucide-react';
import { Card } from './Card';

/** Placeholder animado enquanto a API não responde. */
export function Carregando({ linhas = 4 }: { linhas?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-busy="true" aria-label="Carregando">
      {Array.from({ length: linhas }, (_, i) => (
        <Card key={i} className="p-6 h-52 animate-pulse">
          <div className="h-5 w-32 bg-[#122216] rounded mb-3" />
          <div className="h-3 w-24 bg-[#122216] rounded mb-8" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-14 bg-[#08100A] rounded-lg" />
            <div className="h-14 bg-[#08100A] rounded-lg" />
          </div>
        </Card>
      ))}
    </div>
  );
}

/** Falha ao carregar, com botão para tentar de novo. */
export function ErroCarregamento({ mensagem, onTentarNovamente }: { mensagem: string; onTentarNovamente: () => void }) {
  return (
    <Card className="p-8 flex flex-col items-center text-center gap-3 border-red-900/50">
      <AlertTriangle className="text-red-500" size={28} />
      <p className="text-white font-semibold">Não foi possível carregar os dados</p>
      <p className="text-sm font-mono text-[#5C8065]">{mensagem}</p>
      <button
        type="button"
        onClick={onTentarNovamente}
        className="mt-2 flex items-center gap-2 px-4 py-2 bg-[#0C170F] border border-[#1A2E20] rounded-lg text-sm text-gray-300 hover:bg-[#122216] cursor-pointer font-mono"
      >
        <RotateCw size={14} /> Tentar novamente
      </button>
    </Card>
  );
}

/** Lista vazia. */
export function Vazio({ mensagem }: { mensagem: string }) {
  return (
    <Card className="p-8 flex flex-col items-center text-center gap-3 shadow-none">
      <Inbox className="text-[#5C8065]" size={28} />
      <p className="text-sm font-mono text-[#5C8065]">{mensagem}</p>
    </Card>
  );
}
