import { withAuthenticationRequired } from "@auth0/auth0-react";
import { useTranslation } from 'react-i18next';
import React, { ComponentType } from "react";
import { PageLoader } from "./PageLoader";

interface RouteAuthGuardProps {
  component: ComponentType;
}

export const RouteAuthGuard: React.FC<RouteAuthGuardProps> = ({
  component,
}) => {
  const { t } = useTranslation();
  const Component = withAuthenticationRequired(component, {
    onRedirecting: () => (
      <PageLoader title={t("app.title")} message={t("app.status.authenticating")} />
    ),
  });

  return <Component />;
};
