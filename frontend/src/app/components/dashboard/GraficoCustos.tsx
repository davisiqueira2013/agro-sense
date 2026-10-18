import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipProps } from 'recharts';
import { formatarMoeda, formatarMoedaCompacta } from '../../lib/formatar';
import { nomeDaCategoria } from '../../lib/tones';
import type { CategoriaInsumo, CustoMensal } from '../../types';

// Ordem de empilhamento (de baixo para cima) e cores da paleta categórica
// validada para o fundo escuro (vizinhos com separação adequada para daltonismo).
const SERIES: { categoria: CategoriaInsumo; cor: string }[] = [
  { categoria: 'DEFENSIVOS', cor: '#3987e5' },
  { categoria: 'FERTILIZANTES', cor: '#d95926' },
  { categoria: 'SEMENTES', cor: '#199e70' },
  { categoria: 'COMBUSTIVEL', cor: '#c98500' },
];

const SUPERFICIE = '#0A140D';
const TEXTO_SECUNDARIO = '#5C8065';

function Dica({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload as CustoMensal;
  return (
    <div className="bg-[#08100A] border border-[#1A2E20] rounded-lg p-3 shadow-xl font-mono text-xs min-w-48">
      <p className="text-white font-bold mb-2 capitalize">{label}</p>
      {[...SERIES].reverse().map(({ categoria, cor }) => (
        <p key={categoria} className="flex items-center justify-between gap-4 text-gray-300 py-0.5">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: cor }} />
            {nomeDaCategoria[categoria]}
          </span>
          <span>{formatarMoeda(item[categoria])}</span>
        </p>
      ))}
      <p className="flex justify-between gap-4 text-white border-t border-[#1A2E20] mt-2 pt-2">
        <span>Total</span>
        <span className="font-bold">{formatarMoeda(item.total)}</span>
      </p>
    </div>
  );
}

/** Gráfico de barras empilhadas: custo de compras por mês e categoria (RN08). */
export function GraficoCustos({ dados }: { dados: CustoMensal[] }) {
  const [verTabela, setVerTabela] = useState(false);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Legenda: a identidade de cada série nunca depende só da cor. */}
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-gray-300" aria-label="Legenda">
          {[...SERIES].reverse().map(({ categoria, cor }) => (
            <li key={categoria} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: cor }} />
              {nomeDaCategoria[categoria]}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setVerTabela((v) => !v)}
          className="text-xs font-mono text-[#5C8065] hover:text-green-500 cursor-pointer"
        >
          {verTabela ? 'Ver gráfico' : 'Ver tabela'}
        </button>
      </div>

      {verTabela ? (
        <table className="w-full text-xs font-mono text-right">
          <thead>
            <tr className="text-[#5C8065] border-b border-[#1A2E20]">
              <th className="text-left pb-2 font-medium">MÊS</th>
              {[...SERIES].reverse().map(({ categoria }) => (
                <th key={categoria} className="pb-2 font-medium">{nomeDaCategoria[categoria].toUpperCase()}</th>
              ))}
              <th className="pb-2 font-medium">TOTAL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A2E20]/50 text-gray-300">
            {dados.map((m) => (
              <tr key={m.mes}>
                <td className="text-left py-2 capitalize text-white">{m.rotulo}</td>
                {[...SERIES].reverse().map(({ categoria }) => <td key={categoria} className="py-2">{formatarMoeda(m[categoria])}</td>)}
                <td className="py-2 text-white font-bold">{formatarMoeda(m.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="h-56" role="img" aria-label="Custos de compra por mês e categoria">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dados} margin={{ top: 4, right: 4, left: 4, bottom: 0 }} barCategoryGap="35%">
              <CartesianGrid vertical={false} stroke="#1A2E20" strokeDasharray="3 3" />
              <XAxis dataKey="rotulo" tickLine={false} axisLine={{ stroke: '#1A2E20' }}
                tick={{ fill: TEXTO_SECUNDARIO, fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis width={72} tickLine={false} axisLine={false} tickFormatter={formatarMoedaCompacta}
                tick={{ fill: TEXTO_SECUNDARIO, fontSize: 10, fontFamily: 'monospace' }} />
              <Tooltip content={<Dica />} cursor={{ fill: '#122216', opacity: 0.6 }} />
              {SERIES.map(({ categoria, cor }, i) => (
                <Bar
                  key={categoria}
                  dataKey={categoria}
                  name={nomeDaCategoria[categoria]}
                  stackId="custos"
                  fill={cor}
                  // 2 px de "respiro" entre os segmentos e cantos arredondados no topo.
                  stroke={SUPERFICIE}
                  strokeWidth={2}
                  radius={i === SERIES.length - 1 ? [4, 4, 0, 0] : 0}
                  maxBarSize={36}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
