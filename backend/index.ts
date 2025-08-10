import express from 'express';
import { conectarMongoDB } from './database/mongodb';
import { conectarPostgres } from './database/postgres';
import pontosRoutes from './routes/routes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', pontosRoutes);

async function iniciarServidor() {
  try {
    // Conectando todos os bancos de dados
    await conectarMongoDB();
    await conectarPostgres();

    app.get('/', (req, res) => {
      res.send('Servidor rodando e conectado a todos os bancos de dados.');
    });

    app.listen(PORT, () => {
      console.log(`🚀 Servidor iniciado na porta ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Falha ao iniciar o servidor:', error);
    process.exit(1);
  }
}

iniciarServidor();