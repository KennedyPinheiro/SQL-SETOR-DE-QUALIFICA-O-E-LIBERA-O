import Paper from '@mui/material/Paper';

export default function TacticalPanel({ component = 'section', className = '', children, ...props }) {
  return (
    <Paper component={component} className={className} {...props}>
      {children}
    </Paper>
  );
}
