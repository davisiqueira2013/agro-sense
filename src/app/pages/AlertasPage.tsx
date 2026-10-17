import { AlertCircle, CloudLightning, MapPin } from 'lucide-react';
import { Card } from '../components/shared/Card';
import { PageHeader } from '../components/shared/PageHeader';
import { alertas } from '../data/mockData';
import { toneClasses, toneDoAlerta } from '../lib/tones';

export function AlertasPage() {
  return (
    <div className="space-y-6">
      <PageHeader titulo="Alertas Climáticos" subtitulo="Monitoramento meteorológico e riscos" />
      <div className="grid gap-4">
        {alertas.map((alerta) => {
          const tone = toneClasses[toneDoAlerta[alerta.severidade]];
          return (
            <Card key={alerta.titulo} className={`p-6 flex gap-4 ${tone.border}`}>
              <div className={`p-3 rounded-full h-fit border ${tone.iconBox}`}>
                {alerta.severidade === 'Crítico' ? <AlertCircle size={24} /> : <CloudLightning size={24} />}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-white">{alerta.titulo}</h3>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase border bg-[#08100A] ${tone.badge}`}>
                    {alerta.severidade}
                  </span>
                </div>
                <p className="text-xs font-mono text-[#5C8065] mb-3 flex items-center gap-1">
                  <MapPin size={12} /> {alerta.local}
                </p>
                <p className="text-sm text-gray-300 font-mono">{alerta.descricao}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
