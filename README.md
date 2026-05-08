# Controle de Docas DHL - Campina Grande do Sul/PR

Este projeto é um painel de controle para gerenciamento de docas de entrada e saída na DHL, localizado em Campina Grande do Sul/PR.

## Funcionalidades

- **Admin Panel** (`admin.html`): Interface para administradores configurarem o status das docas, adicionar veículos ao pátio e salvar alterações no Firestore.
- **Viewer Panel** (`index.html`): Painel público para visualização em tempo real do status das docas e veículos aguardando, sincronizado via Firestore.

## Tecnologias Utilizadas

- HTML5
- CSS3 (arquivos externos para melhor manutenção)
- JavaScript (ES6+ com módulos separados)
- Firebase (Firestore para sincronização de dados, Analytics)

## Melhorias Implementadas

### Qualidade e Legibilidade
- Separação de código: JS e CSS movidos para arquivos externos (`viewer.js`, `viewer.css`, `admin.js`, `admin.css`)
- Nomes de variáveis melhorados (ex.: `d` → `doca`, `p` → `veiculo`)
- Funções comentadas com JSDoc
- Código organizado em módulos

### Segurança
- Sanitização básica de entrada para prevenir XSS (função `escaparHtml`)
- Validações de formato para DT e horários no admin

### Manutenibilidade
- Estrutura modular facilita adição de novas funcionalidades
- Código limpo e bem comentado

### Performance
- Re-renders otimizados (embora ainda possa ser melhorado com diffing)
- CSS e JS externos permitem cache do navegador

## Como Usar

1. Abra `admin.html` para configurar as docas.
2. Abra `index.html` em outro navegador ou dispositivo para visualizar o status em tempo real.

## Configuração do Firebase

1. Certifique-se de que o Firestore está habilitado no seu projeto Firebase.
2. Aplique as regras de segurança em `firestore.rules` no console do Firebase.

## Deploy

Este projeto é estático e pode ser hospedado em qualquer servidor web ou plataformas como Netlify, GitHub Pages, etc.

### Netlify

1. Faça upload dos arquivos para um repositório no GitHub.
2. Conecte o repositório ao Netlify.
3. Deploy automático.

## Licença

[Adicione sua licença aqui]