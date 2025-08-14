// Arquivo: frontend/models/Ponto.test.js

import { describe, it, expect } from 'vitest';
import Ponto from './Ponto.js'; // Importando a classe que vamos testar

// Suíte de testes principal para a classe Ponto
describe('Classe: Ponto', () => {

  // --- Testes para o CONSTRUCTOR ---
  describe('Constructor', () => {
    it('deve criar um Ponto com valores padrão se nenhum dado for fornecido', () => {
      const ponto = new Ponto();
      
      expect(ponto.nome).toBe('');
      expect(ponto.tipo).toBe('');
      expect(ponto.descricao).toBe('');
      expect(ponto._id).toBeNull();
      expect(ponto.localizacao.coordinates).toEqual([0, 0]);
    });

    it('deve atribuir corretamente os valores fornecidos durante a criação', () => {
      const dados = {
        _id: '123',
        nome: 'Ponto de Teste',
        tipo: 'Cultura',
        localizacao: { type: 'Point', coordinates: [-37.27, -7.21] }
      };
      const ponto = new Ponto(dados);

      expect(ponto._id).toBe('123');
      expect(ponto.nome).toBe('Ponto de Teste');
      expect(ponto.tipo).toBe('Cultura');
      expect(ponto.localizacao.coordinates).toEqual([-37.27, -7.21]);
    });
  });

  // --- Testes para o método VALIDATE ---
  describe('Método: validate()', () => {
    it('deve retornar { valid: true } para um ponto com todos os dados corretos', () => {
      const ponto = new Ponto({
        nome: 'Ponto Válido',
        tipo: 'Doação',
        localizacao: { type: 'Point', coordinates: [-37.27, -7.21] }
      });
      const resultado = ponto.validate();

      expect(resultado.valid).toBe(true);
      expect(resultado.errors).toHaveLength(0);
    });

    it('deve retornar um erro se o nome estiver faltando', () => {
      const ponto = new Ponto({ tipo: 'Doação', localizacao: { type: 'Point', coordinates: [-37.27, -7.21] } });
      const resultado = ponto.validate();

      expect(resultado.valid).toBe(false);
      expect(resultado.errors).toContain('Nome é obrigatório');
    });

    it('deve retornar um erro se o tipo estiver faltando', () => {
      const ponto = new Ponto({ nome: 'Ponto Válido', localizacao: { type: 'Point', coordinates: [-37.27, -7.21] } });
      const resultado = ponto.validate();
      
      expect(resultado.valid).toBe(false);
      expect(resultado.errors).toContain('Tipo é obrigatório');
    });

    it('deve retornar um erro se a localização for padrão [0, 0]', () => {
      const ponto = new Ponto({ nome: 'Ponto Válido', tipo: 'Doação' }); // Localização fica no padrão [0,0]
      const resultado = ponto.validate();

      expect(resultado.valid).toBe(false);
      expect(resultado.errors).toContain('Localização é obrigatória');
    });

    it('deve retornar múltiplos erros se vários campos forem inválidos', () => {
      const ponto = new Ponto(); // Nenhum dado, todos devem falhar na validação
      const resultado = ponto.validate();

      expect(resultado.valid).toBe(false);
      expect(resultado.errors).toHaveLength(3);
      expect(resultado.errors).toContain('Nome é obrigatório');
      expect(resultado.errors).toContain('Tipo é obrigatório');
      expect(resultado.errors).toContain('Localização é obrigatória');
    });
  });

  // --- Testes para o método GETLATLNG e SETLATLNG ---
  describe('Métodos: getLatLng() e setLatLng()', () => {
    it('deve definir e obter as coordenadas na ordem correta [latitude, longitude]', () => {
      const ponto = new Ponto();
      const lat = -7.219;
      const lng = -35.881;

      // 1. Definir as coordenadas
      ponto.setLatLng(lat, lng);

      // 2. Verificar o armazenamento interno (GeoJSON: lng, lat)
      expect(ponto.localizacao.coordinates).toEqual([lng, lat]);

      // 3. Verificar o método get (que deve retornar na ordem lat, lng)
      expect(ponto.getLatLng()).toEqual([lat, lng]);
    });
  });

});