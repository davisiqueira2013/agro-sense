import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { ApiError } from '../../../services/api';
import { talhoesService } from '../../../services/talhoesService';
import { lerNumero } from '../../lib/formatar';
import { nomeDoStatusTalhao } from '../../lib/tones';
import type { StatusTalhao, Talhao, TalhaoEntrada } from '../../types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';

const UFS = ['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'];
const CULTURAS = ['Soja', 'Milho', 'Trigo', 'Café', 'Feijão', 'Algodão', 'Cana-de-açúcar', 'Arroz'];

/** Valores do formulário: tudo texto, convertido antes de enviar. */
type Campos = {
  nome: string;
  municipio: string;
  uf: string;
  cultura: string;
  areaHa: string;
  status: StatusTalhao;
  latitude: string;
  longitude: string;
};

const vazio: Campos = { nome: '', municipio: '', uf: 'PR', cultura: '', areaHa: '', status: 'EM_PREPARO', latitude: '', longitude: '' };

const doTalhao = (t: Talhao): Campos => ({
  nome: t.nome,
  municipio: t.municipio,
  uf: t.uf,
  cultura: t.cultura,
  areaHa: String(t.areaHa).replace('.', ','),
  status: t.status,
  latitude: t.latitude === null ? '' : String(t.latitude),
  longitude: t.longitude === null ? '' : String(t.longitude),
});

const numeroValido = (texto: string) => texto.trim() === '' || !Number.isNaN(lerNumero(texto)) || 'Número inválido';

type Props = {
  aberto: boolean;
  /** Talhão em edição; ausente = cadastro novo. */
  talhao?: Talhao;
  onFechar: () => void;
  onSalvo: (talhao: Talhao, novo: boolean) => void;
};

const inputClass =
  'w-full bg-[#08100A] border border-[#1A2E20] text-gray-200 text-sm rounded-lg p-2.5 focus:outline-none focus:border-green-500 transition-colors font-mono placeholder-[#3E5A45]';
const labelClass = 'block text-xs font-mono text-[#5C8065] mb-1.5 uppercase tracking-wider';

export function TalhaoFormDialog({ aberto, talhao, onFechar, onSalvo }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Campos>({ defaultValues: vazio });
  const [erroGeral, setErroGeral] = useState('');

  // Preenche o formulário sempre que abre (vazio ou com o talhão em edição).
  useEffect(() => {
    if (aberto) {
      reset(talhao ? doTalhao(talhao) : vazio);
      setErroGeral('');
    }
  }, [aberto, talhao, reset]);

  const salvar = async (campos: Campos) => {
    setErroGeral('');
    const dados: TalhaoEntrada = {
      nome: campos.nome.trim(),
      municipio: campos.municipio.trim(),
      uf: campos.uf,
      cultura: campos.cultura.trim(),
      areaHa: lerNumero(campos.areaHa),
      status: campos.status,
      ...(campos.latitude.trim() && { latitude: lerNumero(campos.latitude) }),
      ...(campos.longitude.trim() && { longitude: lerNumero(campos.longitude) }),
    };

    try {
      const salvo = talhao ? await talhoesService.atualizar(talhao.id, dados) : await talhoesService.criar(dados);
      onSalvo(salvo, !talhao);
    } catch (erro) {
      if (!(erro instanceof ApiError)) {
        setErroGeral('Erro inesperado ao salvar.');
        return;
      }
      // 400: marca cada campo recusado pela API; 409 (nome duplicado): marca o nome.
      if (Array.isArray(erro.detalhes)) {
        for (const { campo, mensagem } of erro.detalhes as { campo: keyof Campos; mensagem: string }[]) {
          setError(campo, { message: mensagem });
        }
      } else if (erro.codigo === 'TALHAO_DUPLICADO') {
        setError('nome', { message: erro.message });
      } else {
        setErroGeral(erro.message);
      }
    }
  };

  const erroDe = (campo: keyof Campos) =>
    errors[campo] && <p className="text-xs font-mono text-red-400 mt-1">{errors[campo]?.message}</p>;

  return (
    <Dialog open={aberto} onOpenChange={(abrir) => !abrir && !isSubmitting && onFechar()}>
      <DialogContent className="bg-[#0C170F] border-[#1A2E20] text-gray-200 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">{talhao ? `Editar ${talhao.nome}` : 'Novo talhão'}</DialogTitle>
          <DialogDescription className="text-[#5C8065] font-mono text-xs">
            {talhao ? 'Altere os dados e salve.' : 'Cadastre uma nova área de cultivo da fazenda.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(salvar)} noValidate className="space-y-4">
          {/* Grade de 6 colunas: nome | cultura · município | UF | área · status | latitude | longitude */}
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="nome" className={labelClass}>Nome *</label>
              <input id="nome" placeholder="Talhão G7" className={inputClass} {...register('nome', { required: 'Informe o nome do talhão' })} />
              {erroDe('nome')}
            </div>
            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="cultura" className={labelClass}>Cultura *</label>
              <input id="cultura" list="culturas" placeholder="Soja" className={inputClass} {...register('cultura', { required: 'Informe a cultura' })} />
              <datalist id="culturas">
                {CULTURAS.map((c) => <option key={c} value={c} />)}
              </datalist>
              {erroDe('cultura')}
            </div>
            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="municipio" className={labelClass}>Município *</label>
              <input id="municipio" placeholder="Londrina" className={inputClass} {...register('municipio', { required: 'Informe o município' })} />
              {erroDe('municipio')}
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="uf" className={labelClass}>UF *</label>
              <select id="uf" className={inputClass} {...register('uf')}>
                {UFS.map((uf) => <option key={uf}>{uf}</option>)}
              </select>
            </div>
            <div className="col-span-4 sm:col-span-2">
              <label htmlFor="areaHa" className={labelClass}>Área (ha) *</label>
              <input
                id="areaHa"
                inputMode="decimal"
                placeholder="22,5"
                className={inputClass}
                {...register('areaHa', {
                  required: 'Informe a área',
                  validate: (v) => lerNumero(v) > 0 || 'A área deve ser maior que zero',
                })}
              />
              {erroDe('areaHa')}
            </div>
            <div className="col-span-6 sm:col-span-2">
              <label htmlFor="status" className={labelClass}>Status</label>
              <select id="status" className={inputClass} {...register('status')}>
                {(Object.keys(nomeDoStatusTalhao) as StatusTalhao[]).map((s) => (
                  <option key={s} value={s}>{nomeDoStatusTalhao[s]}</option>
                ))}
              </select>
            </div>
            <div className="col-span-3 sm:col-span-2">
              <label htmlFor="latitude" className={labelClass}>Latitude</label>
              <input id="latitude" inputMode="decimal" placeholder="-23,3045" className={inputClass} {...register('latitude', { validate: numeroValido })} />
              {erroDe('latitude')}
            </div>
            <div className="col-span-3 sm:col-span-2">
              <label htmlFor="longitude" className={labelClass}>Longitude</label>
              <input id="longitude" inputMode="decimal" placeholder="-51,1696" className={inputClass} {...register('longitude', { validate: numeroValido })} />
              {erroDe('longitude')}
            </div>
            <p className="col-span-6 text-[11px] font-mono text-[#5C8065] -mt-2">
              As coordenadas serão usadas para buscar a previsão do tempo do talhão.
            </p>
          </div>

          {erroGeral && <p role="alert" className="text-sm font-mono text-red-400">{erroGeral}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onFechar}
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#08100A] border border-[#1A2E20] rounded-lg text-sm text-gray-300 hover:bg-[#122216] cursor-pointer font-mono"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-[#4CAF50] hover:bg-[#43A047] text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-70"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {talhao ? 'Salvar alterações' : 'Cadastrar talhão'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
