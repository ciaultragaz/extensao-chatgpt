import React, { useState } from 'react';

type Comando = 'continue' | 'stop';

/**
 * ID da extensão, necessário apenas quando esta página roda FORA do popup
 * (ex.: `next dev` em http://localhost:3002). Configure em `.env.local` como
 * NEXT_PUBLIC_EXTENSION_ID e libere a origem no manifest (`externally_connectable`).
 */
const EXTENSION_ID: string | undefined = process.env.NEXT_PUBLIC_EXTENSION_ID;

/** Verdadeiro quando o código roda dentro da própria extensão (popup/background). */
const estaDentroDaExtensao = (): boolean =>
  typeof chrome !== 'undefined' && typeof chrome.runtime?.id === 'string';

/** Verdadeiro quando a API de mensagens do Chrome existe nesta página. */
const temApiDeMensagens = (): boolean =>
  typeof chrome !== 'undefined' && typeof chrome.runtime?.sendMessage === 'function';

/** Registra falhas apenas em desenvolvimento (nada de console em produção). */
const registrarFalha = (contexto: string, erro: unknown): void => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(`❌ ${contexto}`, erro);
  }
};

/** Em navegadores recentes o sendMessage devolve uma Promise; evita rejeição não tratada. */
const tratarRetorno = (retorno: unknown): void => {
  if (retorno instanceof Promise) {
    retorno.catch((erro: unknown) => registrarFalha('Extensão não respondeu ao comando:', erro));
  }
};

/**
 * Envia o comando ao background da extensão sem derrubar a interface.
 * - Dentro da extensão: mensagem interna, sem ID.
 * - Em página web (dev no localhost): exige o Extension ID + `externally_connectable`.
 * - Caso contrário: apenas avisa em desenvolvimento e segue.
 */
const enviarComando = (comando: Comando): void => {
  const mensagem = { command: comando };

  try {
    if (estaDentroDaExtensao()) {
      tratarRetorno(chrome.runtime.sendMessage(mensagem));
      return;
    }

    if (temApiDeMensagens() && EXTENSION_ID) {
      tratarRetorno(chrome.runtime.sendMessage(EXTENSION_ID, mensagem));
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `⚠️ Comando "${comando}" não enviado: a página não está rodando dentro da extensão e NEXT_PUBLIC_EXTENSION_ID não está definido.`
      );
    }
  } catch (erro) {
    registrarFalha('Falha ao enviar comando para a extensão:', erro);
  }
};

const ToggleButton = () => {
  const [isOn, setIsOn] = useState(false);

  const handleClick = () => {
    const proximoEstado = !isOn;
    setIsOn(proximoEstado);
    enviarComando(proximoEstado ? 'continue' : 'stop');
  };

  return (
    <div className="flex items-center justify-center">
      <button onClick={handleClick} className="p-2 bg-blue-500 text-white rounded">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
          className={isOn ? 'rotate-0' : '-rotate-180'}
        >
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M4.472 2.5a1 1 0 0 1 1 1v1.572a9.5 9.5 0 1 1 6.5 16.428c-4.87 0-8.882-3.663-9.435-8.384a1 1 0 0 1 1.986-.232A7.501 7.501 0 0 0 19.472 12a7.5 7.5 0 0 0-13.09-5H9a1 1 0 0 1 0 2H4.472a1 1 0 0 1-1-1.024V3.5a1 1 0 0 1 1-1"
            clipRule="evenodd"
          />
        </svg>
        {isOn ? 'Parar de Gerar' : 'Continuar Gerando'}
      </button>
    </div>
  );
};

export default ToggleButton;
