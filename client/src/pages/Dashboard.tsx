import { Box, Typography } from '@mui/material';
import { useTranslation } from "react-i18next";

// https://remix.run/guides/routing#index-routes
export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <Box sx={{ width: '100%', height: '100%', overflowY: 'scroll' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t("app.title")}クライアント
      </Typography>
      <Typography variant='body1'>
        サイドバーの各項目から、実世界データ醸造基盤 DB に保存されている各種 JSON-LD データを確認できます
      </Typography>
    </Box>
  );
}
