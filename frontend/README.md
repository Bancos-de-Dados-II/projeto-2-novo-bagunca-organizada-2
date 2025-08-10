# Frontend - Sistema de Pontos Georreferenciados

Interface web moderna para gerenciamento de pontos georreferenciados, desenvolvida seguindo o padrão arquitetural MVC (Model-View-Controller).

## 🏗️ Arquitetura

### Estrutura de Pastas
```
frontend/
├── models/           # Modelos de dados
│   └── Ponto.js     # Modelo do Ponto
├── views/           # Interface do usuário
│   └── index.html   # Página principal
├── controllers/     # Lógica de controle
│   └── PontoController.js
├── services/        # Comunicação com API
│   └── PontoService.js
└── assets/          # Recursos estáticos
    ├── css/
    │   └── styles.css
    └── js/
        └── utils.js
```

### Padrão MVC

#### **Model** (`models/`)
- **Ponto.js**: Define a estrutura de dados dos pontos georreferenciados
- Validação de dados
- Conversão entre formatos (API ↔ Frontend)
- Manipulação de coordenadas geográficas

#### **View** (`views/`)
- **index.html**: Interface principal da aplicação
- Layout responsivo com Bootstrap 5
- Mapa interativo com Leaflet
- Modais para CRUD de pontos
- Lista lateral de pontos cadastrados

#### **Controller** (`controllers/`)
- **PontoController.js**: Gerencia toda a lógica da aplicação
- Coordena interações entre Model e View
- Gerencia eventos da interface
- Controla estado da aplicação

## 🚀 Funcionalidades

### ✨ Principais
- **Visualização de pontos** em mapa interativo
- **CRUD completo** (Criar, Ler, Atualizar, Deletar)
- **Interface responsiva** para desktop e mobile
- **Seleção visual** de localização no mapa
- **Validação de dados** em tempo real
- **Feedback visual** com alertas e loading

### 🗺️ Mapa
- Mapa principal para visualização geral
- Mini-mapa no modal para seleção precisa
- Markers personalizados por tipo de ponto
- Popups informativos com ações
- Zoom automático para melhor visualização

### 📱 Interface
- Design moderno com Bootstrap 5
- Ícones Font Awesome
- Animações suaves
- Sidebar com lista de pontos
- Modais para formulários
- Sistema de alertas

## 🛠️ Tecnologias

### Frontend
- **HTML5** - Estrutura semântica
- **CSS3** - Estilos customizados
- **JavaScript ES6+** - Lógica da aplicação
- **Bootstrap 5** - Framework CSS
- **Leaflet** - Biblioteca de mapas
- **Font Awesome** - Ícones

### Padrões
- **ES6 Modules** - Modularização
- **MVC Architecture** - Organização do código
- **Responsive Design** - Adaptação a dispositivos
- **Progressive Enhancement** - Funcionalidade progressiva

## 📋 Como Usar

### 1. Configuração
Certifique-se de que o backend está rodando na porta 3000:
```bash
cd backend
npm run dev
```

### 2. Acesso
Abra o arquivo `frontend/views/index.html` em um servidor local:

**Opção 1 - Live Server (VS Code)**
- Instale a extensão Live Server
- Clique direito em `index.html` → "Open with Live Server"

**Opção 2 - Python**
```bash
cd frontend/views
python -m http.server 8000
```

**Opção 3 - Node.js**
```bash
cd frontend/views
npx serve .
```

### 3. Uso da Interface

#### Visualização
- Pontos aparecem automaticamente no mapa e na lista lateral
- Clique em um ponto da lista para centralizar no mapa
- Clique em um marker para ver detalhes

#### Criar Ponto
1. Clique em "Novo Ponto"
2. Preencha os campos obrigatórios (Nome, Tipo, Localização)
3. Clique no mini-mapa para definir localização
4. Salve o ponto

#### Editar Ponto
1. Clique no botão "Editar" (ícone lápis) na lista ou popup
2. Modifique os dados necessários
3. Salve as alterações

#### Excluir Ponto
1. Clique no botão "Excluir" (ícone lixeira)
2. Confirme a exclusão no modal

## 🎨 Personalização

### Estilos
Edite `assets/css/styles.css` para personalizar:
- Cores do tema
- Tamanhos e espaçamentos
- Animações
- Responsividade

### Tipos de Ponto
Adicione novos tipos em:
1. `views/index.html` - Select do formulário
2. `assets/css/styles.css` - Classes de cor
3. `controllers/PontoController.js` - Ícones

### Mapa
Configure em `PontoController.js`:
- Coordenadas iniciais
- Zoom padrão
- Provider de tiles
- Estilos de marker

## 🔧 API Integration

O frontend consome a API REST do backend:

```javascript
// Endpoints utilizados
GET    /api/pontos      # Listar pontos
GET    /api/pontos/:id  # Buscar ponto
POST   /api/pontos      # Criar ponto
PUT    /api/pontos/:id  # Atualizar ponto
DELETE /api/pontos/:id  # Excluir ponto
```

### Formato dos Dados
```javascript
{
  "_id": "string",
  "nome": "string",
  "tipo": "string",
  "descricao": "string",
  "endereco": "string",
  "localizacao": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  },
  "createdAt": "date",
  "updatedAt": "date"
}
```

## 🐛 Troubleshooting

### Problemas Comuns

**Pontos não carregam**
- Verifique se o backend está rodando
- Abra o console do navegador para ver erros
- Confirme se a URL da API está correta

**Mapa não aparece**
- Verifique conexão com internet (Leaflet CDN)
- Confirme se não há erros de JavaScript

**CORS Error**
- Configure CORS no backend
- Use servidor local para servir o frontend

### Debug
Use o console do navegador:
```javascript
// Verificar pontos carregados
console.log(pontoController.pontos);

// Testar API diretamente
pontoService.listarPontos().then(console.log);
```

## 📈 Melhorias Futuras

- [ ] Busca e filtros avançados
- [ ] Importação/exportação de dados
- [ ] Camadas de mapa personalizadas
- [ ] Modo offline com Service Workers
- [ ] Notificações push
- [ ] Compartilhamento de pontos
- [ ] Integração com GPS
- [ ] Relatórios e estatísticas
