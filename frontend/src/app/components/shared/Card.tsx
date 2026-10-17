import type { HTMLAttributes } from 'react';

/** Painel escuro com borda usado em todas as telas. */
export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`bg-[#0A140D] border border-[#1A2E20] rounded-xl shadow-lg ${className}`} {...props} />;
}
