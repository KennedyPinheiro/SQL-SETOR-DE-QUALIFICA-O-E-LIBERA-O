import Button from '@mui/material/Button';

export default function LegacyButton({ className = '', children, ...props }) {
  return (
    <Button
      component="button"
      variant="text"
      color="inherit"
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
}
