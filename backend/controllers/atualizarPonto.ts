import { Request, Response } from 'express';
import Ponto, { IPonto } from '../models/ponto';

const atualizarPonto = async (req: Request, res: Response): Promise<void> => {
  try {
    const pontoAtualizado: IPonto | null = await Ponto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Retorna o documento atualizado e roda as validações
    );
    if (!pontoAtualizado) {
      res.status(404).json({ error: 'Ponto não encontrado para atualização.' });
      return;
    }
    res.status(200).json(pontoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar ponto:', error);
    res.status(500).json({ error: 'Erro ao atualizar ponto.' });
  }
};

export default atualizarPonto;
