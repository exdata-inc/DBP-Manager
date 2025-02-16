import React from "react";

export type AppTitleContextType = {
  appTitle: string;
  setAppTitle: (appTitle: string) => void;
}
const AppTitleStateContext = React.createContext<AppTitleContextType>({} as AppTitleContextType);

export const useAppTitleStateContext = ():AppTitleContextType => {
  return React.useContext<AppTitleContextType>(AppTitleStateContext);
}

type Props = {
  children: React.ReactNode
}

export const AppTitleStateProvider = (props:Props) => {
  // const location = useLocation();
  const [appTitle, setAppTitle] = React.useState<string>('');

  const value: AppTitleContextType = { appTitle, setAppTitle };
  return (
    <AppTitleStateContext.Provider value={value}>
      {props.children}
    </AppTitleStateContext.Provider>
  );
}
