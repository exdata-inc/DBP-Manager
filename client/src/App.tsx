import * as React from 'react';
import {
  Routes,
  Route,
} from "react-router-dom";
import i18n from "i18next";
// import { useAuth0 } from "@auth0/auth0-react";

import PageLayout from './components/PageLayout';
// import { RouteAuthGuard } from './components';
// import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CallbackPage from "./pages/Auth0Callback";
import NotFoundPage from "./pages/NotFound";
import About from './pages/About';
import Editor from './pages/Editor';
import Brewer from './pages/Brewer';
import BrewerArgument from './pages/BrewerArgument';
import BrewerInput from './pages/BrewerInput';
import BrewerOutput from './pages/BrewerOutput';
import BrewingDemands from './pages/BrewingDemands';
import BrewingSupplies from './pages/BrewingSupplies';
import CollectionDemands from './pages/CollectionDemands';
import CollectionInfo from './pages/CollectionInfo';
import CollectionStatus from './pages/CollectionStatus';
import CollectionSupplies from './pages/CollectionSupplies';
import Dataset from './pages/Dataset';
import History from './pages/History';
import How from './pages/How';
import MoveDemands from './pages/MoveDemands';
import MoveSupplies from './pages/MoveSupplies';
import PeriodicBrewingConfigs from './pages/PeriodicBrewingConfigs';
import PeriodicMoveConfigs from './pages/PeriodicMoveConfigs';
import PeriodicRemoveConfigs from './pages/PeriodicRemoveConfigs';
import ReadDemands from './pages/ReadDemands';
import ReadSupplies from './pages/ReadSupplies';
import RegisterDemands from './pages/RegisterDemands';
import RegisterSupplies from './pages/RegisterSupplies';
import RemoveDemands from './pages/RemoveDemands';
import RemoveSupplies from './pages/RemoveSupplies';
import StoringInfo from './pages/StoringInfo';
import StructureInfo from './pages/StructureInfo';
import What from './pages/What';
import Where from './pages/Where';
import Who from './pages/Who';
import Why from './pages/Why';
import Any from './pages/Any';
import WriteDemands from './pages/WriteDemands';
import WriteSupplies from './pages/WriteSupplies';
import HarmowareVISPage from './pages/HarmowareVIS';

import * as C from './etc/consts';

function App() {
  // const { user, getAccessTokenSilently } = useAuth0();
  const [language, setLanguage] = React.useState(localStorage.getItem(C.APP_LANGUAGE) || C.DEFAULT_LANGUAGE);

  React.useEffect(() => {
    i18n.changeLanguage(language);
    localStorage.setItem(C.APP_LANGUAGE, String(language));
  }, [language]);

  return (
    <Routes>
      {/* <Route path="/" element={<RouteAuthGuard component={PageLayout} />}> */}
      <Route path="/" element={<PageLayout language={language} setLanguage={setLanguage} />}>
        <Route path="/brewer/:id" element={<Brewer />} />
        <Route path="/brewer" element={<Brewer />} />
        <Route path="/brewer_argument/:id" element={<BrewerArgument />} />
        <Route path="/brewer_argument" element={<BrewerArgument />} />
        <Route path="/brewer_input/:id" element={<BrewerInput />} />
        <Route path="/brewer_input" element={<BrewerInput />} />
        <Route path="/brewer_output/:id" element={<BrewerOutput />} />
        <Route path="/brewer_output" element={<BrewerOutput />} />
        <Route path="/brewing_demands/:id" element={<BrewingDemands />} />
        <Route path="/brewing_demands" element={<BrewingDemands />} />
        <Route path="/brewing_supplies/:id" element={<BrewingSupplies />} />
        <Route path="/brewing_supplies" element={<BrewingSupplies />} />
        <Route path="/collection_demands/:id" element={<CollectionDemands />} />
        <Route path="/collection_demands" element={<CollectionDemands />} />
        <Route path="/collection_info/:id" element={<CollectionInfo />} />
        <Route path="/collection_info" element={<CollectionInfo />} />
        <Route path="/collection_status/:id" element={<CollectionStatus />} />
        <Route path="/collection_status" element={<CollectionStatus />} />
        <Route path="/collection_supplies/:id" element={<CollectionSupplies />} />
        <Route path="/collection_supplies" element={<CollectionSupplies />} />
        <Route path="/dataset/:id" element={<Dataset />} />
        <Route path="/dataset" element={<Dataset />} />
        <Route path="/editor/:id" element={<Editor />} />
        <Route path="/history/:id" element={<History />} />
        <Route path="/history" element={<History />} />
        <Route path="/how/:id" element={<How />} />
        <Route path="/how" element={<How />} />
        <Route path="/move_demands/:id" element={<MoveDemands />} />
        <Route path="/move_demands" element={<MoveDemands />} />
        <Route path="/move_supplies/:id" element={<MoveSupplies />} />
        <Route path="/move_supplies" element={<MoveSupplies />} />
        <Route path="/periodic_brewing_configs/:id" element={<PeriodicBrewingConfigs />} />
        <Route path="/periodic_brewing_configs" element={<PeriodicBrewingConfigs />} />
        <Route path="/periodic_move_configs/:id" element={<PeriodicMoveConfigs />} />
        <Route path="/periodic_move_configs" element={<PeriodicMoveConfigs />} />
        <Route path="/periodic_remove_configs/:id" element={<PeriodicRemoveConfigs />} />
        <Route path="/periodic_remove_configs" element={<PeriodicRemoveConfigs />} />
        <Route path="/read_demands/:id" element={<ReadDemands />} />
        <Route path="/read_demands" element={<ReadDemands />} />
        <Route path="/read_supplies/:id" element={<ReadSupplies />} />
        <Route path="/read_supplies" element={<ReadSupplies />} />
        <Route path="/register_demands/:id" element={<RegisterDemands />} />
        <Route path="/register_demands" element={<RegisterDemands />} />
        <Route path="/register_supplies/:id" element={<RegisterSupplies />} />
        <Route path="/register_supplies" element={<RegisterSupplies />} />
        <Route path="/remove_demands/:id" element={<RemoveDemands />} />
        <Route path="/remove_demands" element={<RemoveDemands />} />
        <Route path="/remove_supplies/:id" element={<RemoveSupplies />} />
        <Route path="/remove_supplies" element={<RemoveSupplies />} />
        <Route path="/storing_info/:id" element={<StoringInfo />} />
        <Route path="/storing_info" element={<StoringInfo />} />
        <Route path="/structure_info/:id" element={<StructureInfo />} />
        <Route path="/structure_info" element={<StructureInfo />} />
        <Route path="/what/:id" element={<What />} />
        <Route path="/what" element={<What />} />
        <Route path="/where/:id" element={<Where />} />
        <Route path="/where" element={<Where />} />
        <Route path="/who/:id" element={<Who />} />
        <Route path="/who" element={<Who />} />
        <Route path="/why/:id" element={<Why />} />
        <Route path="/why" element={<Why />} />
        <Route path="/any/:id" element={<Any />} />
        <Route path="/any" element={<Any />} />
        <Route path="/write_demands/:id" element={<WriteDemands />} />
        <Route path="/write_demands" element={<WriteDemands />} />
        <Route path="/write_supplies/:id" element={<WriteSupplies />} />
        <Route path="/write_supplies" element={<WriteSupplies />} />
        <Route path="/vis/hvis" element={<HarmowareVISPage />} />
        <Route path="/vis/hvis/:id" element={<HarmowareVISPage />} />
        <Route path="/" element={<Dashboard />} />
      </Route>
      {/* <Route index element={<Login />} /> */}
      <Route path="/about" element={<About />} />
      <Route path="/callback" element={<CallbackPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
