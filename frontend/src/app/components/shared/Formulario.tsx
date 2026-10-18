import { Loader2 } from 'lucide-react';

// Peças comuns dos formulários em modal.

export const inputClass =
  'w-full bg-[#08100A] border border-[#1A2E20] text-gray-200 text-sm rounded-lg p-2.5 focus:outline-none focus:border-green-500 transition-colors font-mono placeholder-[#3E5A45] [color-scheme:dark] disabled:opacity-60';

export const labelClass = 'block text-xs font-mono text-[#5C8065] mb-1.5 uppercase tracking-wider';

export function ErroCampo({ mensagem }: { mensagem?: string }) {
  return mensagem ? <p className="text-xs font-mono text-red-400 mt-1">{mensagem}</p> : null;
}

export function ErroFormulario({ mensagem }: { mensagem: string }) {
  return mensagem ? (
    <p role="alert" className="p-3 rounded-lg border border-red-900/60 bg-red-950/30 text-sm font-mono text-red-300">
      {mensagem}
    </p>
  ) : null;
}

type BotoesProps = { enviando: boolean; textoConfirmar: string; onCancelar: () => void; perigo?: boolean };

export function BotoesFormulario({ enviando, textoConfirmar, onCancelar, perigo = false }: BotoesProps) {
  return (
    <div className="flex justify-end gap-3 pt-2">
      <button
        type="button"
        onClick={onCancelar}
        disabled={enviando}
        className="px-4 py-2 bg-[#08100A] border border-[#1A2E20] rounded-lg text-sm text-gray-300 hover:bg-[#122216] cursor-pointer font-mono"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={enviando}
        className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-70 ${
          perigo ? 'bg-red-600 hover:bg-red-700' : 'bg-[#4CAF50] hover:bg-[#43A047]'
        }`}
      >
        {enviando && <Loader2 size={16} className="animate-spin" />}
        {textoConfirmar}
      </button>
    </div>
  );
}
