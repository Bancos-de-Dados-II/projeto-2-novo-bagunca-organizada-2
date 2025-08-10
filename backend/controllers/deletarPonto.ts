import { Request, Response } from 'express';
import Ponto, { IPonto } from '../models/ponto'; 

const deletarPonto = async (req: Request, res: Response): Promise<void> => {
  try {
    const pontoDeletado: IPonto | null = await Ponto.findByIdAndDelete(req.params.id);
    if (!pontoDeletado) {
      res.status(404).json({ error: 'Ponto não encontrado para exclusão.' });
      return;
    }
    res.status(200).json({ message: 'Ponto deletado com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar ponto:', error);
    res.status(500).json({ error: 'Erro ao deletar ponto.' });
  }
};

export default deletarPonto;
