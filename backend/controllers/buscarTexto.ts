import { Request, Response } from 'express';
import Ponto from '../models/ponto';

/**
 * Busca pontos usando full-text search
 */
async function buscarTexto(req: Request, res: Response) {
  try {
    const { q: query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Parâmetro de busca "q" é obrigatório'
      });
    }

    // Busca usando índice de texto completo
    const pontos = await Ponto.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(20);

    res.json({
      success: true,
      data: pontos,
      total: pontos.length,
      query: query
    });

  } catch (error) {
    console.error('Erro ao buscar texto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao buscar texto',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export default buscarTexto;
