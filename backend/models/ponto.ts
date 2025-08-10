import { Schema, model, Document } from 'mongoose';

export interface IPonto extends Document {
  nome: string;
  tipo: string;
  descricao?: string;
  endereco?: string;
  data_cadastro?: Date;
  localizacao: {
    type: string;
    coordinates: number[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const PontoSchema = new Schema<IPonto>({
  nome: {
    type: String,
    required: true,
    trim: true,
  },
  tipo: {
    type: String,
    required: true,
    trim: true,
  },
  descricao: {
    type: String,
  },
  endereco: {
    type: String,
    trim: true,
  },
  data_cadastro: {
    type: Date,
    default: Date.now,
  },
  localizacao: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
}, {
  timestamps: true, // Adiciona campos createdAt e updatedAt automaticamente
});

const Ponto = model<IPonto>('Ponto', PontoSchema);
export default Ponto;