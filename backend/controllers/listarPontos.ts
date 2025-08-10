import { Request, Response } from 'express';
import Ponto, { IPonto } from '../models/ponto'; 

const listarPontos = async (req: Request, res: Response): Promise<void> => {
  try {
    const pontos: IPonto[] = await Ponto.find({});
    res.status(200).json(pontos);
  } catch (error) {
    console.error('Erro ao listar pontos:', error);
    res.status(500).json({ error: 'Erro ao listar pontos.' });
  }
};

export default listarPontos;