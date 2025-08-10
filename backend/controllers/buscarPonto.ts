import { Request, Response } from 'express';
import Ponto, { IPonto } from '../models/ponto'; 

const buscarPonto = async (req: Request, res: Response): Promise<void> => {
  try {
    const ponto: IPonto | null = await Ponto.findById(req.params.id);
    if (!ponto) {
      res.status(404).json({ error: 'Ponto não encontrado.' });
      return;
    }
    res.status(200).json(ponto);
  } catch (error) {
    console.error('Erro ao buscar ponto:', error);
    res.status(500).json({ error: 'Erro ao buscar ponto.' });
  }
};

export default buscarPonto;