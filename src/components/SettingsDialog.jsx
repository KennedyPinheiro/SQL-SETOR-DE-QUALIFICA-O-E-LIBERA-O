import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  IconButton,
  Slider,
  Switch
} from '@mui/material';

const preferenceRows = [
  ['sound', 'Efeitos sonoros', 'Ativar sons de interação e eventos.'],
  ['music', 'Música ambiente', 'Preferência para quando a trilha estiver disponível.'],
  ['animations', 'Animações da interface', 'Transições e movimentos visuais.'],
  ['leaves', 'Folhas na tela inicial', 'Efeito visual da Home, quando disponível.']
];

const volumeRows = [
  ['volume', 'Volume dos efeitos'],
  ['musicVolume', 'Volume da música']
];

export default function SettingsDialog({ open, onClose, settings, onChange, onReset }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="settings-title"
      slotProps={{ paper: { className: 'modal settings-modal' } }}
    >
      <Box component="header" className="modal-header">
        <div>
          <small>TERMINAL DE CONTROLE DE ACESSO</small>
          <h2 id="settings-title">CONFIGURAÇÕES</h2>
        </div>
        <IconButton className="modal-close" onClick={onClose} aria-label="Fechar configurações">×</IconButton>
      </Box>
      <DialogContent className="settings-body" sx={{ p: 0 }}>
        <section className="settings-group" aria-labelledby="settings-audio-title">
          <h3 id="settings-audio-title">ÁUDIO</h3>
          {preferenceRows.slice(0, 2).map(([key, title, description]) => (
            <FormControlLabel
              key={key}
              className="settings-row"
              labelPlacement="start"
              label={<span><strong>{title}</strong><small>{description}</small></span>}
              control={<Switch checked={settings[key]} onChange={event => onChange(key, event.target.checked)} />}
            />
          ))}
          {volumeRows.map(([key, title]) => (
            <div className="settings-row settings-volume" key={key}>
              <span><strong>{title}</strong><small><output>{settings[key]}%</output></small></span>
              <Slider
                aria-label={title}
                value={settings[key]}
                min={0}
                max={100}
                step={5}
                onChange={(_, value) => onChange(key, value)}
              />
            </div>
          ))}
        </section>
        <section className="settings-group" aria-labelledby="settings-interface-title">
          <h3 id="settings-interface-title">INTERFACE</h3>
          {preferenceRows.slice(2).map(([key, title, description]) => (
            <FormControlLabel
              key={key}
              className="settings-row"
              labelPlacement="start"
              label={<span><strong>{title}</strong><small>{description}</small></span>}
              control={<Switch checked={settings[key]} onChange={event => onChange(key, event.target.checked)} />}
            />
          ))}
        </section>
      </DialogContent>
      <DialogActions className="modal-footer settings-footer">
        <Button className="button button-quiet" onClick={onReset}>RESTAURAR PADRÕES</Button>
        <Button className="button button-green" onClick={onClose}>CONCLUÍDO</Button>
      </DialogActions>
    </Dialog>
  );
}
