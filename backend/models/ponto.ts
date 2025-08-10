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

// Índice geoespacial para consultas de localização
PontoSchema.index({ localizacao: '2dsphere' });

// Índice de texto completo para busca textual
PontoSchema.index({ 
  nome: 'text', 
  tipo: 'text', 
  descricao: 'text', 
  endereco: 'text' 
}, {
  weights: {
    nome: 10,      // Nome tem peso maior
    tipo: 5,       // Tipo tem peso médio
    endereco: 3,   // Endereço tem peso médio-baixo
    descricao: 1   // Descrição tem peso menor
  },
  name: 'texto_completo'
});

const Ponto = model<IPonto>('Ponto', PontoSchema);
export default Ponto;