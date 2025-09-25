Documentação Técnica: Sistema de Orçamento Anual - "FinançaFlex"
1. Visão Geral
O FinançaFlex é um aplicativo web (PWA - Progressive Web App) projetado para ajudar usuários a gerenciar seu orçamento anual de forma intuitiva. O sistema permitirá o lançamento de despesas, a visualização do progresso financeiro através de gráficos e planilhas, e o recebimento de notificações para manter o controle dos gastos.

2. Tecnologias e Arquitetura
Frontend: React.js

Backend & Banco de Dados: Google Firebase

Autenticação: Firebase Authentication (e-mail/senha)

Banco de Dados: Cloud Firestore (NoSQL)

Hospedagem: Firebase Hosting (para o PWA)

Notificações: Firebase Cloud Messaging (FCM) para push notifications

Hospedagem: Firebase Hosting (pode ser usado um serviço de CDN gratuito como Vercel ou Netlify)

PWA: Utilização de um Service Worker e manifest.json para permitir a instalação na tela inicial dos dispositivos móveis e habilitar notificações push.

3. Estrutura de Dados (Cloud Firestore)
O banco de dados será estruturado em coleções para armazenar as informações dos usuários, categorias e despesas.

Coleção users

userId (ID do documento)

email: string

createdAt: timestamp

lastLogin: timestamp

Coleção categories

userId (ID do documento, igual ao userId do usuário, para garantir a propriedade)

categories: array de objetos

id: string (gerado automaticamente)

name: string (ex: "Alimentação", "Transporte")

description: string (ex: "Gastos com mercado e restaurantes")

monthlyLimit: number (valor estimado mensal)

annualLimit: number (valor estimado anual)

isVariable: boolean (variável/fixa)

Coleção expenses

userId (ID do documento, igual ao userId do usuário)

expenses: array de objetos

id: string (gerado automaticamente)

date: timestamp

value: number

categoryId: string

description: string

installments: number (número total de parcelas)

currentInstallment: number (parcela atual, para replicador de despesa)

isFixed: boolean (indica se é uma despesa fixa)

4. Telas e Componentes (Frontend)
4.1. Dashboard (Rota: /dashboard)
Layout:

Barra Superior: Título do mês/ano atual, ícones para "Adicionar Despesa" e "Configurações".

Card de Resumo: Exibe "Gasto Total do Mês", "Orçamento Restante", e "Gastos Variáveis".

Gráfico 1 (Pizza): "Distribuição de Gastos do Mês", mostrando a proporção de cada categoria.

Gráfico 2 (Barras): "Progresso Mensal das Categorias", comparando o gasto atual com o limite mensal de cada categoria.

Card de Alertas: Mostra categorias que estão acima ou perto do limite.

4.2. Adicionar/Editar Despesa (Rota: /add-expense ou /edit-expense/:id)
Formulário:

Campo "Data": Data da despesa.

Campo "Valor": Valor numérico.

Campo "Categoria": Dropdown com as categorias cadastradas.

Campo "Descrição": Texto para a descrição da despesa.

Checkbox "Despesa Fixa": Se marcado, habilita o campo de parcelas.

Campo "Parcelas": Input numérico.

Lógica:

Botão "Salvar": Adiciona ou atualiza a despesa no Firestore.

Botão "Replicar": Se a despesa for fixa, permite replicá-la para os próximos meses (baseado no número de parcelas).

4.3. Planilha Financeira Anual (Rota: /spreadsheet)
Tabela:

Colunas: Categorias, Meses (Janeiro a Dezembro), Total Anual.

Linhas: Gastos de cada categoria por mês, Total Mensal, Total Anual, Limite Mensal, etc.

Interatividade:

Edição: Valores de "Limite Mensal" devem ser editáveis diretamente na célula da tabela.

Clique: Ao clicar em um valor de gasto mensal, o usuário será redirecionado para a tela de despesas, filtrada pelo mês e categoria.

4.4. Edição de Categorias (Rota: /categories)
Tabela: Lista todas as categorias cadastradas com opções para editar e excluir.

Formulário: Adicionar/Editar Nome, Descrição, Limite Mensal e Anual.

4.5. Lista de Despesas (Rota: /expenses)
Tabela: Lista todas as despesas do usuário.

Funcionalidades:

Filtros: Mês, Trimestre, Ano, Categoria, Tipo (fixa/variável).

Ordenação: Por data, valor, categoria.

Ações: Botões para editar e excluir cada despesa.

4.6. Autenticação (Rotas: /login e /register)
Gerencia o acesso ao sistema e a criação de contas, ligando o usuário à sua família/grupo.

Layout:
Tela de Login (/login)

Campos para Email e Senha.

Botão "Entrar".

Links para recuperação de senha e para a tela de registro.

Tela de Registro (/register)

Campos para Nome, Email e Senha.

Campo opcional para inserir o ID de uma Família/Grupo existente.

Botão "Registrar".

Link para a tela de login.

Lógica:
Registro: Cria o usuário no Firebase Auth e um documento na coleção users.

Criação de Família: Se o usuário se registrar sem um ID de Família, o sistema cria uma nova Família na coleção households e associa o usuário a ela.

Login: Após a autenticação bem-sucedida, redireciona o usuário para o /dashboard.

5. Lógica de Negócio e Funcionalidades
Cálculos Automáticos: O frontend deve calcular e atualizar dinamicamente:

Soma de gastos mensais e anuais.

Gasto total por categoria.

Valor restante em cada categoria (limite - gasto).

Status do orçamento geral (limite - gasto).

Replicador de Despesa: Ao salvar uma despesa fixa com parcelas, a lógica deve criar novas entradas no banco de dados para os meses subsequentes, ajustando a data e a parcela atual.

Notificações Push (Firebase Cloud Messaging):

Disparo da Notificação: O backend (uma Cloud Function do Firebase) ou a lógica do frontend deve verificar periodicamente (ou no momento de adicionar uma despesa) se o gasto de uma categoria se aproxima do seu limite mensal.

Conteúdo da Notificação:

"Alerta de Gastos: Você já usou 80% do seu orçamento para 'Alimentação' este mês."

"Lembrete: A próxima parcela da despesa 'Aluguel' vence amanhã."

Autenticação: O sistema só será acessível por usuários autenticados. As rotas devem ser protegidas.