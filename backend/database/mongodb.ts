import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  throw new Error('❌ A variável de ambiente MONGODB_URI deve ser definida no arquivo .env');
}

async function conectarMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log('✅ Conexão com o banco de dados MongoDB (Mongoose) estabelecida com sucesso');
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados MongoDB (Mongoose):', error);
    throw error;
  }
}

export {
  conectarMongoDB,
  mongoose
};