# Consulta Global

Desenvolvido em [React](https://react.dev/) com [Vite](https://vitejs.dev/) e executado em [Nginx](https://nginx.com/) com [Docker](https://docker.com/), esse projeto tem o objetivo de fornecer uma interface rápida e moderna para consulta de dados.

## Features

- Permite buscas por nome, celular e e-mail.
- Faz requisições para o backend via rotas `/api`.
- Valida todos os formatos numéricos e de email diretamente no input.
- Formata nomes com a primeira letra maiúscula.
- Mostra resultados de busca em tempo real.
- Layout minimalista e responsivo.

## Estrutura

```
/
├── public/           # Arquivos estáticos
├── src/              # Código-fonte React
│   ├── components/   # Componentes reutilizáveis
│   ├── pages/        # Páginas principais
│   └── styles/       # Estilos globais
├── Dockerfile        # Build e deploy com Nginx
├── nginx.conf        # Configuração customizada do Nginx
├── vite.config.js    # Configuração do Vite
└── package.json      # Dependências
```

---

> Projeto para fins de estudo e demonstração.