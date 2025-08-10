import { Router } from 'express';
// O caminho foi corrigido de '../controller' para '../controllers'.
// É possível que o seu sistema de arquivos ou cache tenha mantido a versão antiga.
import criarPonto from '../controllers/criarPonto';
import listarPontos from '../controllers/listarPontos';
import buscarPonto from '../controllers/buscarPonto';
import atualizarPonto from '../controllers/atualizarPonto';
import deletarPonto from '../controllers/deletarPonto';
import buscarTexto from '../controllers/buscarTexto';
import obterEstatisticas from '../controllers/estatisticas';

const router = Router();

router.post('/pontos', criarPonto);

router.get('/pontos', listarPontos);

router.get('/pontos/:id', buscarPonto);

router.put('/pontos/:id', atualizarPonto);

router.delete('/pontos/:id', deletarPonto);

router.get('/buscar', buscarTexto);

router.get('/estatisticas', obterEstatisticas);

export default router;
