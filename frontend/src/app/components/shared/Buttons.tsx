import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { icone?: ReactNode };

/** Botão verde de ação principal (ex.: "Novo Talhão"). */
export function PrimaryButton({ icone, children, className = '', ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`flex items-center gap-2 px-4 py-2 bg-[#4CAF50] hover:bg-[#43A047] text-white rounded-lg text-sm font-medium transition-colors cursor-pointer shadow disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {icone}
      {children}
    </button>
  );
}

/** Botão escuro de ação secundária (ex.: "Filtrar", "Exportar PDF"). */
export function SecondaryButton({ icone, children, className = '', ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`flex items-center gap-2 px-4 py-2 bg-[#0C170F] border border-[#1A2E20] rounded-lg text-sm text-gray-300 hover:bg-[#122216] transition-colors cursor-pointer font-mono ${className}`}
      {...props}
    >
      {icone}
      {children}
    </button>
  );
}
