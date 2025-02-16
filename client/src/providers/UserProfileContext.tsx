import React from "react";
// import { useLocation } from 'react-router-dom';
import { UserProfile } from "../types";

export type UserProfileContextType = {
  userProfile: UserProfile | undefined;
  setUserProfile: (userProfile: UserProfile | undefined) => void;
}
const UserProfileContext = React.createContext<UserProfileContextType>({} as UserProfileContextType);

export const useUserProfileStateContext = ():UserProfileContextType => {
  return React.useContext<UserProfileContextType>(UserProfileContext);
}

type Props = {
  children: React.ReactNode
}

export const UserProfileStateProvider = (props:Props) => {
  // const location = useLocation();
  const [userProfile, setUserProfile] = React.useState<UserProfile | undefined>(void 0);

  const value: UserProfileContextType = { userProfile, setUserProfile };
  return (
    <UserProfileContext.Provider value={value}>
      {props.children}
    </UserProfileContext.Provider>
  );
}
