import { Request, Response } from 'express';
import Ponto, { IPonto } from '../models/ponto'; 

const criarPonto = async (req: Request, res: Response): Promise<void> => {
  try {
    const novoPonto: IPonto = await Ponto.create(req.body);
    res.status(201).json(novoPonto);
  } catch (error) {
    console.error('Erro ao criar ponto:', error);
    res.status(500).json({ error: 'Erro ao criar ponto.' });
  }
};

export default criarPonto;
