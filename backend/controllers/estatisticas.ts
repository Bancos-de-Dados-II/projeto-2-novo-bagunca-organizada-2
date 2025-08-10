import { Request, Response } from 'express';
import Ponto from '../models/ponto';

/**
 * Retorna estatísticas dos pontos para gráficos
 */
async function obterEstatisticas(req: Request, res: Response) {
  try {
    // Estatísticas por tipo
    const pontosPorTipo = await Ponto.aggregate([
      {
        $group: {
          _id: '$tipo',
          total: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    // Estatísticas por mês de criação
    const pontosPorMes = await Ponto.aggregate([
      {
        $group: {
          _id: {
            ano: { $year: '$createdAt' },
            mes: { $month: '$createdAt' }
          },
          total: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.ano': -1, '_id.mes': -1 }
      },
      {
        $limit: 12
      }
    ]);

    // Distribuição geográfica (por região aproximada)
    const distribuicaoGeografica = await Ponto.aggregate([
      {
        $addFields: {
          regiao: {
            $switch: {
              branches: [
                {
                  case: {
                    $and: [
                      { $gte: [{ $arrayElemAt: ['$localizacao.coordinates', 1] }, -5] },
                      { $lte: [{ $arrayElemAt: ['$localizacao.coordinates', 1] }, 5] },
                      { $gte: [{ $arrayElemAt: ['$localizacao.coordinates', 0] }, -75] },
                      { $lte: [{ $arrayElemAt: ['$localizacao.coordinates', 0] }, -35] }
                    ]
                  },
                  then: 'Norte'
                },
                {
                  case: {
                    $and: [
                      { $gte: [{ $arrayElemAt: ['$localizacao.coordinates', 1] }, -16] },
                      { $lte: [{ $arrayElemAt: ['$localizacao.coordinates', 1] }, -2] },
                      { $gte: [{ $arrayElemAt: ['$localizacao.coordinates', 0] }, -60] },
                      { $lte: [{ $arrayElemAt: ['$localizacao.coordinates', 0] }, -35] }
                    ]
                  },
                  then: 'Nordeste'
                },
                {
                  case: {
                    $and: [
                      { $gte: [{ $arrayElemAt: ['$localizacao.coordinates', 1] }, -25] },
                      { $lte: [{ $arrayElemAt: ['$localizacao.coordinates', 1] }, -5] },
                      { $gte: [{ $arrayElemAt: ['$localizacao.coordinates', 0] }, -60] },
                      { $lte: [{ $arrayElemAt: ['$localizacao.coordinates', 0] }, -35] }
                    ]
                  },
                  then: 'Centro-Oeste'
                },
                {
                  case: {
                    $and: [
                      { $gte: [{ $arrayElemAt: ['$localizacao.coordinates', 1] }, -25] },
                      { $lte: [{ $arrayElemAt: ['$localizacao.coordinates', 1] }, -14] },
                      { $gte: [{ $arrayElemAt: ['$localizacao.coordinates', 0] }, -50] },
                      { $lte: [{ $arrayElemAt: ['$localizacao.coordinates', 0] }, -39] }
                    ]
                  },
                  then: 'Sudeste'
                }
              ],
              default: 'Sul'
            }
          }
        }
      },
      {
        $group: {
          _id: '$regiao',
          total: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    // Total geral
    const totalPontos = await Ponto.countDocuments();

    // Pontos mais recentes
    const pontosRecentes = await Ponto.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('nome tipo createdAt');

    res.json({
      success: true,
      data: {
        pontosPorTipo,
        pontosPorMes,
        distribuicaoGeografica,
        totalPontos,
        pontosRecentes
      }
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao obter estatísticas',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export default obterEstatisticas;
