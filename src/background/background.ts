type Comando = 'continue' | 'stop';

interface MensagemComando {
  command?: Comando;
}

/** Trata os comandos vindos do popup (onMessage) ou de páginas liberadas (onMessageExternal). */
const tratarComando = (request: MensagemComando): void => {
  if (request.command === 'continue') {
    console.log('Continuar gerando...');
    // Lógica para enviar comando para o ChatGPT
  } else if (request.command === 'stop') {
    console.log('Parar de gerar...');
    // Lógica para parar de enviar comando para o ChatGPT
  }
};

// Mensagens internas (popup/content script da própria extensão)
chrome.runtime.onMessage.addListener((request: MensagemComando) => {
  tratarComando(request);
});

// Mensagens de páginas web liberadas em `externally_connectable` (ex.: next dev no localhost:3002)
chrome.runtime.onMessageExternal.addListener((request: MensagemComando) => {
  tratarComando(request);
});

// Torna o arquivo um módulo (exigido por isolatedModules); não altera o comportamento em runtime
export {};
