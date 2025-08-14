import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import pontoRoutes from './routes/routes';
import { conectarMongoDB } from './database/mongodb';
import { conectarPostgres } from './database/postgres';

dotenv.config();

export const app = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// Emular __dirname com ES Modules para garantir o caminho correto
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());

const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Rotas da API
app.use('/api', pontoRoutes);
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(frontendPath, 'views', 'index.html'));
});


// Inicia o servidor e conecta a todos os bancos de dados.
async function iniciarServidor() {
  try {
    await conectarMongoDB();
    await conectarPostgres();

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Falha ao iniciar o servidor:', error);
    process.exit(1);
  }
}

// Condição para iniciar o servidor apenas em ambiente de não-teste
if (process.env.NODE_ENV !== 'test') {
  iniciarServidor();
}

// A linha mais importante para os testes:
export default app;