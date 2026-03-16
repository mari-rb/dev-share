# DevShare

Uma plataforma web para compartilhamento e descoberta de dicas técnicas destinadas a profissionais de tecnologia, incluindo desenvolvedores, designers, DevOps, analistas de dados e especialistas em produtividade.

## Funcionalidades

- **Compartilhamento de Dicas**: Usuários podem criar e publicar dicas em categorias como desenvolvimento, design, DevOps, dados e produtividade.
- **Descoberta de Conteúdo**: Navegação intuitiva para explorar dicas por categoria ou salvar favoritas.
- **Interface Responsiva**: Design otimizado para desktop e dispositivos móveis.
- **Análise de Experiência do Usuário**: Ferramentas integradas para coleta e análise de métricas de QoE (Quality of Experience).

## Tecnologias Utilizadas

- **Frontend**: Next.js 16 com React 19, TypeScript
- **UI/UX**: Tailwind CSS, Radix UI, Lucide Icons
- **Estado e Dados**: Local Storage para persistência simples
- **Build/Deploy**: Yarn, Vercel
- **Análise**: Scripts em TypeScript e Python para processamento de dados

## Instalação

1. Clone o repositório:

   ```bash
   git clone <url-do-repositorio>
   cd dev-share
   ```

2. Instale as dependências:

   ```bash
   yarn install
   ```

3. Execute o servidor de desenvolvimento:

   ```bash
   yarn dev
   ```

4. Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Build para Produção

```bash
yarn build
yarn start
```

## Estrutura do Projeto

- `app/`: Páginas e layouts do Next.js App Router
- `components/`: Componentes reutilizáveis da UI
- `lib/`: Utilitários e dados mock
- `public/`: Assets estáticos
- `tests/`: Scripts para análise de dados e testes

## Scripts Disponíveis

- `yarn dev`: Inicia o servidor de desenvolvimento
- `yarn build`: Compila para produção
- `yarn start`: Inicia o servidor de produção
- `yarn lint`: Executa o linter
- `yarn coletar`: Coleta dados de análise
- `yarn analisar`: Processa dados coletados
- `yarn verificar`: Verifica integridade dos dados

## Contribuição

Contribuições são bem-vindas. Por favor, siga as melhores práticas de desenvolvimento e submeta pull requests para melhorias.

## Licença

Este projeto é distribuído sob a licença MIT.
