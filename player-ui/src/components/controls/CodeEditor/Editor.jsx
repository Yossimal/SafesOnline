import React, { useState } from 'react';
import Editor from 'react-simple-code-editor';

import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import './dracula-theme.css'
//import './prism-vsc-dark-plus.css';
import './editor.css';
import { asm_syntex } from './asm-highlights';


export default function AsmEditor({codeState}) {
  

  return (
      <div className="window">
        <div className="editor_wrap">
          <Editor
            value={codeState[0]}
            onValueChange={(code) => codeState[1](code)}
            highlight={(code) => highlight(code, asm_syntex)}
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 12,
            }}
          />
        </div>
      </div>
  );
}
