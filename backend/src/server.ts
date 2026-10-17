import { criarApp } from './app.js';

const porta = Number(process.env.PORT ?? 3333);

criarApp().listen(porta, () => {
  console.log(`API do Agro Sense rodando em http://localhost:${porta}/api`);
});
