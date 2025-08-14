// Arquivo: backend/__testes__/routes.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index.js';

// --- Mocks ---
vi.mock('../models/ponto.js');
vi.mock('../database/mongodb.js');
vi.mock('../database/postgres.js');

describe('Testes de Integração da API do Re.Ciclo', () => {
    
    beforeEach(async () => {
        vi.clearAllMocks();
        const { conectarMongoDB } = await import('../database/mongodb.js');
        const { conectarPostgres } = await import('../database/postgres.js');
        vi.mocked(conectarMongoDB).mockResolvedValue(undefined);
        vi.mocked(conectarPostgres).mockResolvedValue(undefined);
    });

    it('GET /api/pontos - deve listar todos os pontos', async () => {
        const PontoModel = (await import('../models/ponto.js')).default;
        const listaDePontos = [{ nome: 'Ponto 1' }, { nome: 'Ponto 2' }];
        vi.mocked(PontoModel.find).mockResolvedValue(listaDePontos);

        const response = await request(app).get('/api/pontos');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(listaDePontos);
    });

    it('POST /api/pontos - deve criar um ponto com sucesso', async () => {
        const PontoModel = (await import('../models/ponto.js')).default;
        const novoPonto = { nome: 'Novo Ponto Teste', tipo: 'Cultura' };
        vi.mocked(PontoModel.create).mockResolvedValue({ _id: 'id_mockado_123', ...novoPonto } as any);

        const response = await request(app).post('/api/pontos').send(novoPonto);
        expect(response.status).toBe(201);
        expect(response.body.nome).toBe(novoPonto.nome);
    });
    
    // --- TESTE CORRIGIDO ---
    it('PUT /api/pontos/:id - deve atualizar um ponto existente', async () => {
        const PontoModel = (await import('../models/ponto.js')).default;
        const dadosParaAtualizar = { nome: 'Ponto Atualizado', tipo: 'Cultura' };
        const respostaEsperada = { _id: 'id_valido', ...dadosParaAtualizar };

        // Garantimos que o mock retorna exatamente a estrutura esperada
        vi.mocked(PontoModel.findByIdAndUpdate).mockResolvedValue(respostaEsperada);

        const response = await request(app)
            .put('/api/pontos/id_valido')
            .send(dadosParaAtualizar);

        expect(response.status).toBe(200);
        // A asserção agora compara a resposta da API com a mesma estrutura que o mock retornou
        expect(response.body).toEqual(respostaEsperada);
    });
});