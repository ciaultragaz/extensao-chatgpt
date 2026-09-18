// Polyfill de compatibilidade: o Node 26 removeu `buffer.SlowBuffer` (DEP0030),
// mas o Next 12 ainda depende dele (jsonwebtoken / buffer-equal-constant-time
// empacotados em next/dist/compiled). Sem isso o `next dev` quebra com
// "Cannot read properties of undefined (reading 'prototype')".
// Carregado via `node -r ./node-polyfills.js` nos scripts do package.json.
'use strict';

const buffer = require('buffer');

if (typeof buffer.SlowBuffer === 'undefined') {
  buffer.SlowBuffer = buffer.Buffer;
}
