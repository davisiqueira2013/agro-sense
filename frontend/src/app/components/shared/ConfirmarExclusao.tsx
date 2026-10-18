import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

type Props = {
  aberto: boolean;
  titulo: string;
  descricao: string;
  onCancelar: () => void;
  /** Executa a exclusão; se lançar erro, o diálogo continua aberto. */
  onConfirmar: () => Promise<void>;
};

/** Pede confirmação antes de excluir um registro. */
export function ConfirmarExclusao({ aberto, titulo, descricao, onCancelar, onConfirmar }: Props) {
  const [excluindo, setExcluindo] = useState(false);

  const confirmar = async () => {
    setExcluindo(true);
    try {
      await onConfirmar();
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <AlertDialog open={aberto} onOpenChange={(abrir) => !abrir && !excluindo && onCancelar()}>
      <AlertDialogContent className="bg-[#0C170F] border-[#1A2E20] text-gray-200">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">{titulo}</AlertDialogTitle>
          <AlertDialogDescription className="text-[#5C8065] font-mono text-sm">{descricao}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={excluindo}
            className="bg-[#08100A] border-[#1A2E20] text-gray-300 hover:bg-[#122216] hover:text-white cursor-pointer font-mono"
          >
            Cancelar
          </AlertDialogCancel>
          <button
            type="button"
            onClick={confirmar}
            disabled={excluindo}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium cursor-pointer disabled:opacity-70"
          >
            {excluindo && <Loader2 size={16} className="animate-spin" />}
            Excluir
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
