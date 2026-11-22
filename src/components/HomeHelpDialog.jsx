import { Box, Button, Dialog, DialogActions, DialogContent, IconButton } from '@mui/material';

const instructions = [
  ['Observe o solicitante', 'Analise o retrato, ouça a declaração e confira a identidade apresentada.'],
  ['Investigue com SQL', 'No Clássico, consulte militares, lista_hoje, logs_portao, autorizacoes e movimentacoes. Na Prática, explore tabelas próprias e importe seus dados.'],
  ['Procure divergências', 'Compare documento, alojamento, autorização, registros de movimentação e características físicas.'],
  ['Utilize os recursos do quartel', 'Use o rádio para confirmar informações com os alojamentos e consulte o arquivo do efetivo.'],
  ['Tome sua decisão', 'Autorize militares regulares, negue infiltrados com sinais de identidade falsa e encaminhe divergências cadastrais para confirmação. Um erro de cadastro, sozinho, não prova que a pessoa é infiltrada.']
];

export default function HomeHelpDialog({ open, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="home-help-title"
      slotProps={{ paper: { className: 'modal home-help-modal' } }}
    >
      <Box component="header" className="modal-header">
        <div>
          <small>MANUAL DO OPERADOR | S.Q.L. TERMINAL</small>
          <h2 id="home-help-title">COMO O JOGO FUNCIONA</h2>
        </div>
        <IconButton className="modal-close" onClick={onClose} aria-label="Fechar ajuda">×</IconButton>
      </Box>
      <DialogContent className="home-help-body" sx={{ p: 0 }}>
        <p className="rules-intro">Escolha como quer jogar: treine SQL sem pressão, enfrente uma falha permanente no terminal ou faça a inspeção completa no modo clássico.</p>
        <ol className="rules-list">
          {instructions.map(([title, description]) => (
            <li key={title}><strong>{title}</strong><span>{description}</span></li>
          ))}
        </ol>
        <div className="home-help-tip">
          <strong>ATENÇÃO, OPERADOR</strong>
          <span>No modo Falha do Sistema, o evento permanece ativo em todos os turnos e a dificuldade altera somente as vidas. No Clássico, escolha entre Fácil, Normal e Difícil.</span>
        </div>
      </DialogContent>
      <DialogActions className="modal-footer">
        <span>O TERMINAL ACEITA APENAS CONSULTAS SELECT</span>
        <Button className="button button-green" onClick={onClose}>ENTENDI</Button>
      </DialogActions>
    </Dialog>
  );
}
