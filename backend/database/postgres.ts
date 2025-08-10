import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const {
  POSTGRES_DB,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_HOST,
  POSTGRES_PORT
} = process.env;

if (!POSTGRES_DB || !POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_HOST || !POSTGRES_PORT) {
  throw new Error('❌ As variáveis de ambiente do PostgreSQL não foram definidas no arquivo .env');
}

const sequelize = new Sequelize(POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, {
  host: POSTGRES_HOST,
  port: parseInt(POSTGRES_PORT, 10),
  dialect: 'postgres',
  logging: false,
});

async function conectarPostgres() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco de dados PostgreSQL (Sequelize) estabelecida com sucesso');

    // Habilita a extensão PostGIS após a conexão
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    console.log('✅ Extensão PostGIS habilitada no banco de dados.');

  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados PostgreSQL (Sequelize):', error);
    throw error;
  }
}

export {
  conectarPostgres,
  sequelize
};