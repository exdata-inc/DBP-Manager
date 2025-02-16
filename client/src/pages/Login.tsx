import React from 'react';
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoginIcon from '@mui/icons-material/Login';

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const { t } = useTranslation();
  const { id } = useParams();

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      spacing={2}
      height='100vh'
      component="form"
    >
      <Typography component="h2" variant="h2" color="primary" align='center' gutterBottom>
        {t("app.title")} 
      </Typography>
      <LoadingButton
        type="submit"
        variant="contained"
        onClick={() => { setLoading(true); navigate("/dashboard") }}
        endIcon={<LoginIcon />}
        loading={loading}
        loadingPosition="end"
      >
        {t("login.login")}
      </LoadingButton>
    </Stack>
  );
}

export default Login;
