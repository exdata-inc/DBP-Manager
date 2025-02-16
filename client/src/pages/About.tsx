import * as React from 'react';
import { Link } from "react-router-dom";
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useTranslation } from "react-i18next";

export default function About() {
  const { t } = useTranslation();
  return (
    <React.Fragment>
      <Typography variant="h4" component="h1" gutterBottom>
        {t("app.title")}
      </Typography>
      <Button variant="contained" component={Link} to="/">
        Go to the main page
      </Button>
    </React.Fragment>
  );
}
