import React from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";

interface PageLoaderProps {
  title?: string;
  message?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({title, message}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Stack spacing={2} justifyContent="center" alignItems="center">
        <Typography variant="h2">{title}</Typography>
        <CircularProgress />
        <Typography variant="h5">{message}</Typography>
      </Stack>
    </Box>
  );
};
