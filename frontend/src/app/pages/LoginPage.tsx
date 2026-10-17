import { useState, type FormEvent } from 'react';
import { Leaf } from 'lucide-react';

export type Credenciais = { email: string; senha: string };

type LoginPageProps = {
  /** Chamado ao enviar o formulário. Na integração, fará POST /api/auth/login. */
  onLogin: (credenciais: Credenciais) => void;
};

const inputClass =
  'w-full bg-[#08100A] border border-[#1A2E20] text-gray-200 text-sm rounded-lg p-3 focus:outline-none focus:border-green-500 transition-colors font-mono placeholder-[#3E5A45]';

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    if (!email.trim() || !senha) {
      setErro('Informe e-mail e senha.');
      return;
    }
    setErro('');
    onLogin({ email: email.trim(), senha });
  };

  return (
    <div className="min-h-screen bg-[#08100A] flex flex-col items-center justify-center font-sans text-gray-200 px-4">
      <div className="flex flex-col items-center mb-8">
        <div className="p-3 border border-[#1A2E20] rounded-xl bg-[#0C170F] mb-4 shadow-lg">
          <Leaf className="w-8 h-8 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-wide font-mono">Agro Sense</h1>
        <p className="text-[#5C8065] text-sm mt-1 font-mono">Gestão de campo inteligente</p>
      </div>

      <form onSubmit={enviar} noValidate className="bg-[#0C170F] border border-[#1A2E20] rounded-xl p-8 w-full max-w-md shadow-2xl space-y-5">
        <div>
          <label htmlFor="email" className="block text-xs font-mono text-[#5C8065] mb-2 uppercase tracking-wider">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="seu.nome@agrosense.com.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="senha" className="block text-xs font-mono text-[#5C8065] mb-2 uppercase tracking-wider">
            Senha
          </label>
          <input
            id="senha"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className={inputClass}
          />
        </div>

        {erro && (
          <p role="alert" className="text-sm font-mono text-red-400">
            {erro}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-[#4CAF50] hover:bg-[#43A047] text-white font-semibold rounded-lg p-3 mt-4 transition-colors cursor-pointer shadow-lg"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
