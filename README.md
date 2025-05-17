# Consulta Global

Desenvolvido em [React](https://react.dev/) com [Vite](https://vitejs.dev/) e executado em [Nginx](https://www.nginx.com/) com Docker, esse projeto tem o objetivo de fornecer uma interface rápida e moderna para consultas de dados.

## Features

- **Busca inteligente:** Permite buscas por nome, CPF, CNPJ e celular.
- **Integração com backend:** Faz requisições para o backend via rotas `/api`.
- **Validação de dados:** Valida formatos de CPF e CNPJ diretamente no input.
- **Sugestões automáticas:** Exibe sugestões enquanto o usuário digita.
- **Resultados dinâmicos:** Mostra resultados de busca em tempo real.
- **Interface responsiva:** Layout adaptado para desktop e mobile.

## Estrutura

```
/
├── public/           # Arquivos estáticos (fonts, favicon)
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