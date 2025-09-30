# Estrutura de Estilos - EasyMoney

Esta pasta contém todos os arquivos CSS modulares do projeto, organizados por funcionalidade.

## Arquivos

### `layout.css`
Estilos de estrutura e layout da aplicação:
- Containers (`.container`, `.container-sm`, `.container-lg`)
- Wrappers de página (`.page-wrapper`, `.page-header`)
- Sistema de grid (`.grid`, `.grid-2`, `.grid-3`, `.grid-4`)
- Utilitários Flexbox (`.flex`, `.flex-col`, `.flex-between`, `.flex-center`)
- Espaçamento (`.gap-sm`, `.gap-md`, `.gap-lg`)

### `components.css`
Componentes reutilizáveis:
- Cards (`.card`, `.card-header`, `.card-body`, `.card-footer`)
- Badges (`.badge`, `.badge-success`, `.badge-danger`, `.badge-primary`)
- Alertas (`.alert`, `.alert-success`, `.alert-danger`, `.alert-info`)
- Loading (`.loading`, `.loading-spinner`)
- Empty States (`.empty-state`)
- Modais (`.modal`, `.modal-overlay`)

### `forms.css`
Estilos de formulários:
- Estrutura de formulários (`.form`, `.form-group`, `.form-row`)
- Labels e mensagens (`.form-label`, `.form-help`, `.form-error`)
- Ações de formulário (`.form-actions`)
- Variações de inputs (`.input-sm`, `.input-lg`)
- Grupos de botões (`.btn-group`)
- Variações de botões (`.btn-block`, `.btn-sm`, `.btn-lg`, `.btn-outline`, `.btn-text`)

### `navigation.css`
Navegação e menu:
- Nav principal (`.nav`, `.nav-container`)
- Items de navegação (`.nav-item`, `.nav-link`)
- Brand (`.nav-brand`)
- Menu mobile (`.nav-toggle`, `.nav-menu`)

### `transactions.css`
Componentes específicos de transações:
- Lista de transações (`.transaction-list`, `.transaction-item`)
- Detalhes de transação (`.transaction-item-header`, `.transaction-item-amount`)
- Filtros (`.transaction-filter`)
- Sumários de balanço (`.balance-summary`, `.balance-card`)

### `auth.css`
Páginas de autenticação:
- Layout de autenticação (`.auth-page`, `.auth-container`)
- Card de autenticação (`.auth-card`)
- Formulários de auth (`.auth-form`)
- Mensagens (`.auth-error`, `.auth-success`)

### `utilities.css`
Classes utilitárias:
- Espaçamento (`.m-*`, `.p-*`, `.mt-*`, `.mb-*`, etc.)
- Alinhamento de texto (`.text-left`, `.text-center`, `.text-right`)
- Cores de texto (`.text-primary`, `.text-success`, `.text-danger`, `.text-muted`)
- Backgrounds (`.bg-primary`, `.bg-success`, `.bg-danger`)
- Tamanhos de fonte (`.text-xs`, `.text-sm`, `.text-lg`, etc.)
- Display (`.d-none`, `.d-block`, `.d-flex`, `.d-grid`)
- Bordas e shadows
- Utilitários responsivos (`.d-mobile-*`, `.d-desktop-*`)

## Como Usar

### 1. Importação
Todos os arquivos são importados automaticamente no `src/index.css`:

```css
@import './styles/layout.css';
@import './styles/components.css';
@import './styles/forms.css';
@import './styles/navigation.css';
@import './styles/transactions.css';
@import './styles/auth.css';
@import './styles/utilities.css';
```

### 2. Aplicação nos Componentes

#### Exemplo de Layout:
```jsx
<div className="container">
  <div className="page-header">
    <h1 className="page-title">Título da Página</h1>
  </div>
  <div className="card">
    Conteúdo do card
  </div>
</div>
```

#### Exemplo de Formulário:
```jsx
<form className="form">
  <div className="form-group">
    <label className="form-label">Nome</label>
    <input type="text" placeholder="Digite seu nome" />
  </div>
  <button type="submit" className="primary btn-block">
    Enviar
  </button>
</form>
```

#### Exemplo de Grid:
```jsx
<div className="grid grid-2">
  <div className="card">Card 1</div>
  <div className="card">Card 2</div>
</div>
```

## Variáveis CSS

Todas as variáveis de design estão definidas no `src/index.css`:

### Cores
- `--color-primary`: Cor principal (turquesa)
- `--color-success`: Verde para valores positivos
- `--color-danger`: Vermelho para alertas
- `--color-bg`: Fundo neutro
- `--color-surface`: Superfícies (cards, etc.)

### Espaçamento
- `--spacing-xs`: 0.25rem
- `--spacing-sm`: 0.5rem
- `--spacing-md`: 1rem
- `--spacing-lg`: 1.5rem
- `--spacing-xl`: 2rem

### Bordas
- `--radius-sm`: 4px
- `--radius-md`: 8px
- `--radius-lg`: 12px

## Responsividade

Todos os arquivos incluem breakpoints para dispositivos móveis:

```css
@media (max-width: 768px) {
  /* Estilos para mobile */
}
```

O layout é mobile-first, com ajustes automáticos para:
- Grids se tornam colunas únicas
- Navegação vira menu hambúrguer
- Botões ocupam largura total
- Espaçamentos reduzidos

## Modo Escuro

O projeto suporta modo escuro automático através de:

```css
@media (prefers-color-scheme: dark) {
  /* Cores ajustadas para modo escuro */
}
```

## Boas Práticas

1. **Use classes existentes**: Antes de criar novos estilos, verifique se já existe uma classe utilitária
2. **Combine classes**: Use múltiplas classes para compor estilos (`className="card mb-lg p-xl"`)
3. **Evite inline styles**: Use sempre classes CSS
4. **Mantenha a consistência**: Use as variáveis CSS definidas no `:root`
5. **Mobile-first**: Teste sempre em dispositivos móveis

## Exemplo Completo

```jsx
<div className="container">
  <div className="page-header">
    <h1 className="page-title">Transações</h1>
    <p className="text-muted">Gerencie suas transações</p>
  </div>

  <div className="card mb-lg">
    <form className="form">
      <div className="form-row">
        <div className="form-col">
          <label className="form-label">Descrição</label>
          <input type="text" placeholder="Ex: Aluguel" />
        </div>
        <div className="form-col">
          <label className="form-label">Valor</label>
          <input type="number" placeholder="0.00" />
        </div>
      </div>
      <div className="form-actions">
        <button className="secondary">Cancelar</button>
        <button className="primary">Salvar</button>
      </div>
    </form>
  </div>

  <div className="transaction-list">
    <div className="transaction-item">
      <div className="transaction-item-header">
        <span className="transaction-item-description">Aluguel</span>
        <span className="transaction-item-amount negative">-R$ 1.500,00</span>
      </div>
    </div>
  </div>
</div>
```
