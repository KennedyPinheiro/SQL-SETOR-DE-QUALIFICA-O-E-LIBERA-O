import Box from '@mui/material/Box';

export default function ScreenFrame({ component = 'main', className = '', children, ...props }) {
  return (
    <Box component={component} className={className} {...props}>
      {children}
    </Box>
  );
}
