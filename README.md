# 🗺️ Sistema de Pontos Georreferenciados Re.Ciclo

[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/-TpqR4IR)

Sistema completo para gerenciamento de pontos georreferenciados com interface web moderna e API REST robusta.

## 🏗️ Arquitetura

### Backend (API REST)
- **Node.js + TypeScript** - Runtime e tipagem estática
- **Express.js** - Framework web minimalista
- **MongoDB + Mongoose** - Banco NoSQL para dados dos pontos
- **PostgreSQL + PostGIS** - Banco relacional com extensão geoespacial
- **Sequelize** - ORM para PostgreSQL

### Frontend (SPA)
- **Vanilla JavaScript ES6+** - Sem frameworks, máxima performance
- **Padrão MVC** - Arquitetura organizada e escalável
- **Bootstrap 5** - Framework CSS responsivo
- **Leaflet** - Biblioteca de mapas interativos
- **Font Awesome** - Ícones modernos

## 🚀 Funcionalidades

### ✨ Principais
- **CRUD Completo** de pontos georreferenciados
- **Visualização interativa** em mapa com Leaflet
- **Geolocalização automática** do usuário
- **Interface responsiva** para desktop e mobile
- **Dual Database** - MongoDB e PostgreSQL com PostGIS
- **API REST** completa com validações
- **Dashboard** com estatísticas e gráficos


### 🗺️ Recursos de Mapa
- Mapa principal para visualização geral
- Mini-mapa no modal para seleção precisa
- Markers personalizados por tipo de ponto
- Geolocalização automática com fallback
- Popups informativos com ações CRUD
- Zoom automático inteligente

### 📊 Dashboard
- Gráfico de distribuição por tipo
- Mapa de calor geográfico
- Análise de crescimento temporal
- Estatísticas em tempo real
- Exportação de relatórios

## 🛠️ Tecnologias

### Backend
- **Runtime**: Node.js 18+
- **Linguagem**: TypeScript 5+
- **Framework**: Express.js
- **Bancos de Dados**: 
  - MongoDB 6+ (Mongoose ODM)
  - PostgreSQL 14+ (PostGIS, Sequelize ORM)
- **Validação**: Joi
- **CORS**: Configurado para desenvolvimento
- **Ambiente**: dotenv para variáveis

### Frontend
- **HTML5** - Estrutura semântica moderna
- **CSS3** - Estilos customizados com variáveis CSS
- **JavaScript ES6+** - Módulos, async/await, classes
- **Bootstrap 5** - Sistema de grid e componentes
- **Leaflet 1.9+** - Mapas interativos
- **Font Awesome 6** - Ícones vetoriais

## 📋 Pré-requisitos

### Banco de Dados
1. **MongoDB** (local ou Atlas)
2. **PostgreSQL** com extensão **PostGIS**

### Node.js
- **Versão**: 18.0.0 ou superior
- **NPM**: 8.0.0 ou superior

## 🚀 Instalação

### 1. Clone o Repositório
```bash
git clone <repository-url>
cd projeto-2-novo-bagunca-organizada-2
```

### 2. Instale as Dependências
```bash
npm install
```

### 3. Configure as Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
# Banco MongoDB
MONGODB_URI=mongodb://localhost:27017/pontos_geo
# ou para MongoDB Atlas:
# MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/pontos_geo

# Banco PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=pontos_geo
POSTGRES_USER=seu_usuario
POSTGRES_PASSWORD=sua_senha

# Servidor
PORT=3000
NODE_ENV=development
```

### 4. Configure o PostgreSQL + PostGIS

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib postgis postgresql-14-postgis-3
```

#### Windows:
1. Instale PostgreSQL do site oficial
2. Use Stack Builder para instalar PostGIS

#### macOS:
```bash
brew install postgresql postgis
```

#### Configuração do Banco:
```sql
-- Conecte como superuser
sudo -u postgres psql

-- Crie o banco
CREATE DATABASE pontos_geo;

-- Conecte ao banco
\c pontos_geo

-- Habilite PostGIS
CREATE EXTENSION postgis;

-- Crie usuário (opcional)
CREATE USER seu_usuario WITH PASSWORD 'sua_senha';
GRANT ALL PRIVILEGES ON DATABASE pontos_geo TO seu_usuario;
```

### 5. Inicie o Servidor
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

## 🎯 Como Usar

### Acesso à Aplicação
1. Abra `http://localhost:3000` no navegador
2. A aplicação carregará automaticamente os pontos existentes
3. Permita acesso à localização para melhor experiência

### Gerenciamento de Pontos

#### ➕ Criar Ponto
1. Clique em "Novo Ponto"
2. Preencha os campos obrigatórios:
   - **Nome**: Identificação do ponto
   - **Tipo**: Categoria (escola, hospital, etc.)
   - **Descrição**: Detalhes adicionais
   - **Endereço**: Localização textual
3. Clique no mini-mapa para definir coordenadas
4. Salve o ponto

#### ✏️ Editar Ponto
1. Clique no ícone "Editar" na lista ou popup
2. Modifique os campos desejados
3. Atualize a localização se necessário
4. Salve as alterações

#### 🗑️ Excluir Ponto
1. Clique no ícone "Excluir"
2. Confirme a exclusão no modal

#### 📊 Dashboard
1. Clique em "Dashboard"
2. Visualize estatísticas e gráficos
3. Use "Atualizar Dashboard" para dados em tempo real

## 🔌 API Endpoints

### Pontos
```
GET    /api/pontos          # Listar todos os pontos
GET    /api/pontos/:id      # Buscar ponto por ID
POST   /api/pontos          # Criar novo ponto
PUT    /api/pontos/:id      # Atualizar ponto
DELETE /api/pontos/:id      # Excluir ponto
```

### Busca
```
GET    /api/buscar/:texto   # Buscar pontos por texto
```

### Estatísticas
```
GET    /api/estatisticas    # Obter estatísticas gerais
```

### Formato de Dados
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

## 📁 Estrutura do Projeto

```
projeto-2-novo-bagunca-organizada-2/
├── backend/                 # API REST
│   ├── controllers/         # Lógica de negócio
│   ├── database/           # Conexões com bancos
│   ├── models/             # Modelos de dados
│   ├── routes/             # Definição de rotas
│   └── index.ts            # Servidor principal
├── frontend/               # Interface web
│   ├── assets/             # Recursos estáticos
│   │   ├── css/           # Estilos
│   │   ├── images/        # Imagens
│   │   └── js/            # Utilitários
│   ├── controllers/        # Controladores MVC
│   ├── models/            # Modelos de dados
│   ├── services/          # Comunicação com API
│   └── views/             # Interface HTML
├── .env                   # Variáveis de ambiente
├── package.json          # Dependências
├── tsconfig.json         # Configuração TypeScript
└── docker-compose.yml    # Containers (opcional)
```

## 🐛 Troubleshooting

### Problemas Comuns

#### Backend não inicia
```bash
# Verifique as variáveis de ambiente
cat .env

# Teste conexão MongoDB
mongosh "mongodb://localhost:27017/pontos_geo"

# Teste conexão PostgreSQL  
psql -h localhost -U seu_usuario -d pontos_geo
```

#### Frontend não carrega pontos
1. Verifique se o backend está rodando na porta 3000
2. Abra o console do navegador (F12)
3. Verifique erros de CORS ou rede
4. Confirme se a URL da API está correta

#### Geolocalização não funciona
1. Use HTTPS em produção (HTTP só funciona em localhost)
2. Permita acesso à localização no navegador
3. Verifique se o GPS está ativado

#### Problemas com PostGIS
```sql
-- Verifique se PostGIS está instalado
SELECT PostGIS_version();

-- Recriar extensão se necessário
DROP EXTENSION postgis;
CREATE EXTENSION postgis;
```

## 🔒 Segurança

### Desenvolvimento
- CORS configurado para localhost
- Validação de entrada com Joi
- Sanitização de dados

### Produção (Recomendações)
- Use HTTPS
- Configure CORS para domínios específicos
- Implemente autenticação/autorização
- Use variáveis de ambiente seguras
- Configure rate limiting
- Monitore logs de segurança

## 🚀 Deploy

### Opção 1: Heroku
```bash
# Configure variáveis de ambiente no Heroku
heroku config:set MONGODB_URI=sua_mongodb_uri
heroku config:set POSTGRES_HOST=seu_postgres_host
# ... outras variáveis

# Deploy
git push heroku main
```

### Opção 2: Docker
```bash
# Build e execução
docker-compose up -d
```

### Opção 3: VPS
1. Configure Node.js 18+
2. Instale PM2 para gerenciamento de processos
3. Configure proxy reverso (Nginx)
4. Configure SSL (Let's Encrypt)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para detalhes.

## 👥 Autores

- **Alyce** - Interface e UX/UI
- **Matheus** - Geolocalização e integração
- **Carvalho** - Padronização e refinamentos

## 🆕 Changelog

### v1.0.0 (2025-08-11)
- ✅ Sistema completo de CRUD
- ✅ Dual database (MongoDB + PostgreSQL)
- ✅ Geolocalização automática
- ✅ Interface responsiva
- ✅ Dashboard com estatísticas
- ✅ API REST completa
- ✅ Documentação abrangente
