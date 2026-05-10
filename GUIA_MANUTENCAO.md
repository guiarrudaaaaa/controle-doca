# Guia de Manutenção — Projeto Controle de Docas DHL

## 1. Estrutura do Projeto

```
controle-doca/
├── index.html              # Painel público de visualização
├── admin.html              # Painel administrativo
├── viewer.css              # Estilos do painel público
├── viewer.js               # Lógica do painel público
├── admin.css               # Estilos do painel administrativo
├── admin.js                # Lógica do painel administrativo
├── firestore.rules         # Regras de segurança do Firestore
├── README.md               # Documentação do projeto
├── ANALISE_E_CORRECOES.md  # Análise completa de problemas e correções
└── GUIA_MANUTENCAO.md      # Este arquivo
```

---

## 2. Convenções de Código

### 2.1 Nomenclatura

#### **CSS**
- Use kebab-case para classes: `.doca-card`, `.patio-list`
- Use BEM para componentes complexos: `.doca__header`, `.doca--active`
- Prefixe variáveis com `--`: `--yellow`, `--surface`

#### **JavaScript**
- Use camelCase para variáveis: `docaId`, `patioList`
- Use PascalCase para constantes: `CACHE_DURATION`, `MAX_DOCAS`
- Use verbos para funções: `renderizarGrid()`, `carregarEstado()`

#### **HTML**
- Use IDs em camelCase para elementos únicos: `id="clk"`, `id="screen-out"`
- Use data attributes para dados dinâmicos: `data-field="dt"`, `data-index="0"`

### 2.2 Comentários

```javascript
// Comentário simples para lógica inline
// Use para explicar "por quê", não "o quê"

/**
 * Função com documentação JSDoc
 * @param {string} lado - 'out' ou 'in'
 * @returns {void}
 */
function renderizarGrid(lado) {
  // ...
}
```

---

## 3. Responsividade

### 3.1 Breakpoints Padrão

```css
/* Desktop (padrão) */
/* Sem media query */

/* Tablets e telas médias */
@media (max-width: 1024px) {
  /* Ajustes para tablets */
}

/* Tablets pequenos e celulares grandes */
@media (max-width: 768px) {
  /* Ajustes para celulares */
}

/* Celulares */
@media (max-width: 480px) {
  /* Ajustes para celulares pequenos */
}

/* Celulares muito pequenos */
@media (max-width: 320px) {
  /* Ajustes extremos */
}
```

### 3.2 Princípios de Design Responsivo

1. **Mobile First**: Escreva CSS para celulares primeiro, depois adicione media queries para telas maiores
2. **Grids Flexíveis**: Use `auto-fit` e `minmax()` em vez de colunas fixas
3. **Tipografia Escalável**: Use `rem` em vez de `px` quando possível
4. **Espaçamento Consistente**: Use múltiplos de 4px ou 8px
5. **Proteção contra Overflow**: Use `white-space: nowrap`, `text-overflow: ellipsis`

### 3.3 Testando Responsividade

```bash
# Abrir DevTools no navegador
F12 ou Ctrl+Shift+I

# Ativar modo responsivo
Ctrl+Shift+M

# Testar em diferentes tamanhos:
# - 1920x1080 (Desktop)
# - 1024x768 (Tablet)
# - 768x1024 (Tablet Portrait)
# - 480x800 (Celular)
# - 320x568 (Celular pequeno)
```

---

## 4. Modificando Estilos

### 4.1 Adicionando Novo Componente

```css
/* 1. Defina o componente base */
.novo-componente {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
}

/* 2. Adicione variantes */
.novo-componente.ativo {
  border-color: var(--yellow);
}

/* 3. Adicione responsividade */
@media (max-width: 768px) {
  .novo-componente {
    padding: 8px;
  }
}

@media (max-width: 480px) {
  .novo-componente {
    padding: 6px;
  }
}
```

### 4.2 Modificando Cores

```css
/* Cores estão definidas em :root */
:root {
  --yellow: #FFCC00;
  --red: #D40511;
  --bg: #0c0d10;
  /* ... */
}

/* Para alterar uma cor, modifique apenas em :root */
:root {
  --yellow: #FFD700; /* Novo amarelo */
}
```

### 4.3 Modificando Tipografia

```css
/* Fontes estão importadas no HTML */
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600;700&display=swap" rel="stylesheet"/>

/* Use no CSS */
.titulo {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 18px;
  font-weight: 800;
}
```

---

## 5. Modificando Funcionalidade

### 5.1 Adicionando Nova Validação

```javascript
// 1. Adicione o tipo de validação
const validators = {
  dt: (val) => /^\d{8}$/.test(val.trim()),
  hora: (val) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(val),
  // Novo validador
  email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
};

// 2. Use na função de validação
function validarCampo(campo, valor, tipo) {
  const valido = validators[tipo] ? validators[tipo](valor) : true;
  // ...
}

// 3. Adicione ao HTML
<input data-validate="email" />
```

### 5.2 Adicionando Novo Campo

```javascript
// 1. Adicione ao estado padrão
const estadoPadrao = {
  out: {
    docas: [
      {
        id: 'OUT-01',
        status: 'livre',
        pct: 0,
        dt: '',
        comp: '',
        hora: '',
        // Novo campo
        observacoes: ''
      }
    ]
  }
};

// 2. Adicione ao formulário
<div class="field">
  <label>Observações</label>
  <input oninput="estado['${lado}'].docas[${indice}].observacoes = this.value"/>
</div>

// 3. Adicione validação se necessário
validarCampo(campo, valor, 'observacoes');
```

### 5.3 Adicionando Nova Funcionalidade

```javascript
// 1. Crie a função
function novaFuncionalidade(lado, indice) {
  const doca = estado[lado].docas[indice];
  // Implemente a lógica
  console.log('Executando nova funcionalidade para', doca.id);
}

// 2. Adicione ao HTML
<button onclick="novaFuncionalidade('out', 0)">Ação</button>

// 3. Se necessário, adicione ao renderizador
function renderizarGrid(lado) {
  // ... código existente ...
  // Adicione a nova funcionalidade ao HTML gerado
}
```

---

## 6. Sincronização com Firestore

### 6.1 Estrutura de Dados

```javascript
// Documento: states/cgs
{
  out: {
    docas: [
      {
        id: "OUT-01",
        status: "livre|oper|stage|bloq",
        pct: 0-100,
        dt: "12345678",
        comp: "simples|bitrem",
        hora: "HH:MM"
      }
    ],
    patio: [
      {
        dt: "12345678",
        comp: "simples|bitrem",
        chegada: "HH:MM",
        urg: "green|amber|red"
      }
    ],
    previsao: [
      {
        nome: "string",
        dt: "12345678",
        tons: "number",
        placa: "string"
      }
    ]
  },
  in: { /* mesma estrutura */ }
}
```

### 6.2 Regras de Segurança

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura e escrita até 6 de junho de 2026
    match /states/{document=**} {
      allow read, write: if request.time < timestamp.date(2026, 6, 6);
    }
  }
}
```

### 6.3 Atualizando Dados

```javascript
// Salvar dados
async function salvarTudo() {
  try {
    const docRef = doc(window.db, 'states', 'cgs');
    await setDoc(docRef, estado);
    console.log('Dados salvos com sucesso');
  } catch (erro) {
    console.error('Erro ao salvar:', erro);
  }
}

// Carregar dados
async function carregarEstado() {
  try {
    const docRef = doc(window.db, 'states', 'cgs');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      estado = docSnap.data();
      renderizarTudo();
    }
  } catch (erro) {
    console.error('Erro ao carregar:', erro);
  }
}
```

---

## 7. Performance

### 7.1 Otimizações Implementadas

- ✅ CSS e JS em arquivos separados (cache do navegador)
- ✅ Re-renders seletivos (não re-renderiza tudo)
- ✅ Cache de 30 segundos para carregamentos do Firestore
- ✅ SVGs inline para ícones (sem requisições HTTP)
- ✅ Validação em tempo real com debounce

### 7.2 Melhorias Futuras

```javascript
// Implementar debounce para validação
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Usar
const validarCampoDebounced = debounce(validarCampo, 300);
```

### 7.3 Monitorando Performance

```javascript
// Medir tempo de renderização
console.time('renderizarGrid');
renderizarGrid('out');
console.timeEnd('renderizarGrid');

// Medir uso de memória
console.log(performance.memory);
```

---

## 8. Segurança

### 8.1 Validações Implementadas

- ✅ Sanitização HTML (`escaparHtml`)
- ✅ Validação de formato (DT, hora, placa, tons)
- ✅ Validação de comprimento (nome, placa)
- ✅ Validação de intervalo (pct, tons)

### 8.2 Melhorias Futuras

```javascript
// Implementar validação no backend
// Usar Content Security Policy (CSP)
// Implementar CORS corretamente
// Adicionar rate limiting
// Usar HTTPS obrigatoriamente
```

---

## 9. Debugging

### 9.1 Ferramentas

```javascript
// Log detalhado
console.log('Estado atual:', estado);
console.table(estado.out.docas);

// Breakpoints
debugger; // Pausa a execução

// Monitorar mudanças
Object.observe(estado, (changes) => {
  console.log('Estado mudou:', changes);
});
```

### 9.2 Problemas Comuns

| Problema | Causa | Solução |
|----------|-------|---------|
| Dados não sincronizam | Firestore offline | Verificar conexão e regras |
| Validação não funciona | Seletor errado | Usar `data-validate` |
| Layout quebrado em celular | Sem media query | Adicionar breakpoint |
| Tremulação ao atualizar | Re-render completo | Usar diffing |

---

## 10. Checklist de Deploy

- [ ] Testar em todos os breakpoints
- [ ] Testar em navegadores diferentes (Chrome, Firefox, Safari, Edge)
- [ ] Testar em dispositivos reais (iOS, Android)
- [ ] Verificar console para erros
- [ ] Verificar performance (Lighthouse)
- [ ] Verificar acessibilidade (WCAG AA)
- [ ] Verificar segurança (OWASP)
- [ ] Backup do banco de dados
- [ ] Atualizar documentação
- [ ] Comunicar mudanças aos usuários

---

## 11. Recursos Úteis

### Documentação
- [MDN Web Docs](https://developer.mozilla.org/)
- [CSS-Tricks](https://css-tricks.com/)
- [Firebase Documentation](https://firebase.google.com/docs)

### Ferramentas
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Can I Use](https://caniuse.com/)

### Comunidades
- [Stack Overflow](https://stackoverflow.com/)
- [CSS-Tricks](https://css-tricks.com/)
- [Dev.to](https://dev.to/)

---

## 12. Contato e Suporte

Para dúvidas ou problemas:
1. Consulte a documentação do projeto
2. Verifique os logs do navegador (F12)
3. Teste em outro navegador
4. Verifique a conexão com Firestore
5. Abra uma issue no repositório

---

**Última Atualização**: 09 de Maio de 2026  
**Versão**: 1.0  
**Mantido por**: Equipe DHL Campina Grande do Sul/PR
