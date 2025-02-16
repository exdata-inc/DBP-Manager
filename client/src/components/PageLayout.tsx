import * as React from 'react';
import {
  AppBar as MuiAppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Container,
  Drawer as MuiDrawer,
  Divider,
  Link,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  InputBase,
  Button,
  Select,
  MenuItem,
  Dialog,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  Close as CloseIcon,
  Menu as MenuIcon,
  SportsBar as SportsBarIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { styled, alpha } from '@mui/material/styles';
import { useTranslation } from "react-i18next";
import { AppTitleContextType, useAppTitleStateContext } from '../providers';
import useMediaQuery from '@mui/material/useMediaQuery';
import { MainListItems, BrewingListItems, MetadataListItems, LogsListItems } from './MenuItems';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

// to analayze data from api //
import { ALL_PATHS } from '../etc/consts';

import SearchResultAccordions from './SearchResultAccordions';

import * as C from '../etc/consts';
import { PageLoader } from '.';
import { SearchAccordionType } from '../types';
import { useFileExplorerContext } from '../providers/FileExplorerContext';


function Copyright(props: any) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" sx={{ p: 2 }}>
      {'Copyright © '}
      <Link color="inherit" href="https://exdata.co.jp/">
        ExData, Inc.
      </Link>{' '}
      {new Date().getFullYear()}.
    </Typography>
  );
}


const drawerWidth = 240;

// @ts-ignore
const MyMUIAppBar = styled(MuiAppBar, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

// @ts-ignore
const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open, drawerWidth }) => ({
  '& .MuiDrawer-paper': {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: 'border-box',
    ...(!open && {
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9),
      },
    }),
  },
}),
);

export const AppTitle: React.FC = () => {
  const appTitleState: AppTitleContextType = useAppTitleStateContext();
  return (
    <Typography
      component="h1"
      variant="h6"
      color="inherit"
      noWrap
      sx={{ flexGrow: 1 }}
    >
      {appTitleState.appTitle}
    </Typography>
  );
}

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

interface PageLayoutProps {
  language: string;
  setLanguage: Function;
}

const PageLayout: React.FC<PageLayoutProps> = (props: PageLayoutProps) => {
  const matches = useMediaQuery('(min-width:600px)');
  const [drawerOpen, setDrawerOpen] = React.useState(localStorage.getItem(C.APP_NAVIGATION_OPEN) ? localStorage.getItem(C.APP_NAVIGATION_OPEN) === 'true' : matches);
  const location = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { explorerDialogs } = useFileExplorerContext();

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
    localStorage.setItem(C.APP_NAVIGATION_OPEN, String(!drawerOpen));
  };

  // ------------------------------------------------------ //
  // search function (edited by yoshiki, refactord by teru) //
  // ------------------------------------------------------ //
  const [isSearching, setIsSearching] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchParams, setSearchParams] = useSearchParams({ q: "" });
  const [searchDialogOpen, setSearchDialogOpen] = React.useState(false);
  const [searchResultRows, setSearchResultRows] = React.useState<SearchAccordionType[]>([]);

  const handleSearhInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    // console.log(event.target.value);
  }

  const handleSearchAction = () => {
    setSearchParams((prev) => {
      prev.set("q", searchQuery);
      return prev;
    });

    const q = searchParams.get("q");
    if (q != null) {
      handleSearch(q);
    }
  };

  const handleSearchInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearchAction();
    }
  }

  const handleSearch = async (q: string) => {
    setIsSearching(true);
    setSearchDialogOpen(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_RWDB_URL_PREFIX}/api/v0/all/?search=${q}`);
      // console.log("recieve_jsonld");
      const data = response.data;
      console.log(data);
      let api_request_data: SearchAccordionType[] = [];

      ALL_PATHS.forEach(path => {
        if (data.hasOwnProperty(path) && data[path] != "") {
          const existingAccordion = api_request_data.find(accordion => accordion.title === path);
          if (existingAccordion) {
            existingAccordion.content.push(...data[path]);
          } else {
            const accordion: SearchAccordionType = {
              title: path,
              content: data[path],
            };
            api_request_data.push(accordion);
          }
        }
      });
      console.log(api_request_data);
      setSearchResultRows(api_request_data);
      setIsSearching(false);

    } catch (error) {
      console.log('Error fetching data:' + error);
    }
  };

  const handleSearchDialogClose = () => {
    //setSearchQuery("");  // 普通は閉じた後も残っててほしくない？
    setSearchParams("");
    setSearchDialogOpen(false);
  }

  return (
    <Container maxWidth={false} sx={{ display: 'flex', paddingLeft: '0px !important', paddingRight: '0px !important', }}>
      <MyMUIAppBar
        position="absolute"
        // @ts-ignore
        open={drawerOpen}
      >
        <Container maxWidth={false}>
          <Toolbar disableGutters>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: '36px',
                ...(drawerOpen && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <SportsBarIcon sx={{ display: 'flex', mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: 'flex',
                fontWeight: 700,
                letterSpacing: '.1rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              {t(`app.title`)}
            </Typography>
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                value={searchQuery}
                onChange={handleSearhInputChange}
                onKeyDown={handleSearchInputKeyDown}
                inputProps={{ 'aria-label': 'search' }}
              />
            </Search>
            <Button
              variant="contained"
              onClick={handleSearchAction}
              sx={{ mr: 2 }}
            >
              Search
            </Button>
            <Select
              labelId="language-select-label"
              id="language-select"
              value={props.language}
              onChange={(e) => { props.setLanguage(e.target.value); }}
            >
              <MenuItem value={C.LANGUAGE_JA}>日本語</MenuItem>
              <MenuItem value={C.LANGUAGE_EN}>English</MenuItem>
            </Select>
          </Toolbar>
        </Container>
      </MyMUIAppBar>
      <Drawer variant="permanent" open={drawerOpen} sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            px: [1],
          }}
        >
          <IconButton sx={{ pointerEvents: 'auto' }} onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <List component="nav" sx={{ overflowY: 'scroll', flexGrow: 1 }}>
          <ListItemButton sx={{ pointerEvents: 'auto' }} onClick={() => navigate(`/`)} selected={location.pathname === `/`}>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary={t(`app.menu.dashboard`)} />
          </ListItemButton>
          {/* <ListItemButton sx={{ pointerEvents: 'auto' }} onClick={() => navigate(`/vis/hvis`)} selected={location.pathname === `/vis/hvis`}>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary={t(`app.menu.visualize`)} />
          </ListItemButton> */}
          <Divider sx={{ my: 1 }} />
          {MainListItems()}
          <Divider sx={{ my: 1 }} />
          {BrewingListItems()}
          <Divider sx={{ my: 1 }} />
          {MetadataListItems()}
          <Divider sx={{ my: 1 }} />
          {LogsListItems()}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          height: '100vh',
          overflow: 'none',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar />
        <Container maxWidth={false} sx={{
          mt: 4,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'scroll',
          width: '100%',
        }}
        >
          <Outlet />
        </Container>
        <Copyright />
      </Box>
      <Dialog
        maxWidth={"xl"}
        open={searchDialogOpen}
        fullWidth={true}
        onClose={handleSearchDialogClose}
      >
        <DialogTitle sx={{ display: 'flex' }}>
          <span style={{ display: 'flex', alignItems: 'center', fontWeight: 'inherit', flexGrow: 1 }}>
            検索結果 - {searchParams.get("q")}
          </span>
          <IconButton
            aria-label="close"
            onClick={handleSearchDialogClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ whiteSpace: 'pre-line' }}>
            {isSearching ? <Stack spacing={2} justifyContent="center" alignItems="center"><CircularProgress /></Stack> : <SearchResultAccordions accordions={searchResultRows} q={searchParams.get("q")} />}
          </Typography>
        </DialogContent>
      </Dialog>
      {Array.from(explorerDialogs).map(([key, value]) => value)}
    </Container>
  );
}

export default PageLayout;
