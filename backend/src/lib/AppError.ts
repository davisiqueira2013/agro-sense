/**
 * Erro de negócio com status HTTP e código legível.
 * Lançado pelos services; o middleware tratarErros converte em resposta JSON.
 *
 * Exemplo: throw new AppError(422, 'SALDO_INSUFICIENTE', 'Saldo insuficiente para Fertilizante NPK');
 */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly codigo: string,
    mensagem: string,
    public readonly detalhes?: unknown,
  ) {
    super(mensagem);
    this.name = 'AppError';
  }
}
