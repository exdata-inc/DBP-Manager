// ------------------------------------------------------ //
// File Explorer Context (written by teru) //
// ------------------------------------------------------ //

import { Card, Dialog, DialogContent, DialogTitle, IconButton, Paper, Stack } from "@mui/material";
import { CardProps } from '@mui/material/Card';
import { Close as CloseIcon } from '@mui/icons-material';
import Draggable from 'react-draggable';
import React from "react";
import axios from "axios";
import { linkStyle } from "../components";

export type FileExplorerContextType = {
  explorerDialogs: Map<string, any>;
  setExplorerDialogs: Function;
  addExplorerDialog: (url: string) => void;
  removeExplorerDialog: (url: string) => void;
  baseZIndex: number;
  setBaseZIndex: (idx: number) => void;
}
const FileExplorerContext = React.createContext<FileExplorerContextType>({} as FileExplorerContextType);

export const useFileExplorerContext = (): FileExplorerContextType => {
  return React.useContext<FileExplorerContextType>(FileExplorerContext);
}

type Props = {
  children: React.ReactNode,
}

type FileInfo = {
  name: string;
  type: string;
}

function CardComponent(props: CardProps & { url: string, }) {
  const nodeRef = React.useRef(null);
  const { removeExplorerDialog } = useFileExplorerContext();
  const [files, setFiles] = React.useState<FileInfo[]>([]);
  const [url, setUrl] = React.useState<string>(props.url);

  React.useEffect(() => {
    const getFileList = async () => {
      const response = await axios.get(`${import.meta.env.VITE_RWDB_URL_PREFIX}/api/v0/files/?path=${encodeURIComponent(url)}`);
      const data = response.data as FileInfo[];
      console.log(response.status, data);
      data.sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
    });
      setFiles(data);
    };
    getFileList();
    return () => { setFiles([]); };
  }, [url]);

  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
      nodeRef={nodeRef}
    >
      <Card {...props} ref={nodeRef}>
        <DialogTitle sx={{ fontFamily: 'Consolas, "BIZ UDPGothic", Roboto, "Helvetica Neue", Arial, sans-serif', cursor: 'move', fontSize: 'inherit' }} id="draggable-dialog-title">
          {url}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => removeExplorerDialog(props.url)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent sx={{ overflowY: 'scroll', height: '540px' }}>
          <span style={{ fontWeight: 'bolder', color: 'red' }}>【ベータ版】ディレクトリ内の一覧表示のみ対応</span>
          <Stack direction='column'>
            {files.map((v) => {
              if (v.type === 'dir') {
                return <a onClick={() => setUrl(url + v.name + '/')} style={linkStyle}>{v.name}</a>;
              } else {
                return <span style={{ fontFamily: 'Consolas, "BIZ UDPGothic", Roboto, "Helvetica Neue", Arial, sans-serif' }}>{v.name}</span>;
              }
            })}
          </Stack>
        </DialogContent>
      </Card>
    </Draggable>
  );
}

export const FileExplorerStateProvider = (props: Props) => {
  const [explorerDialogs, setExplorerDialogs] = React.useState<Map<string, any>>(new Map());
  const [baseZIndex, setBaseZIndex] = React.useState<number>(1000);

  const addExplorerDialog = (url: string) => {
    const dialog =
      <CardComponent url={url} key={url} style={{ zIndex: baseZIndex, position: 'fixed', bottom: 0, right: 0, width: '800px', height: '600px' }} />
      ;
    setExplorerDialogs((prevDialogs: Map<string, any>) => new Map(prevDialogs).set(url, dialog));
  };

  const removeExplorerDialog = (url: string) => {
    setExplorerDialogs((prevDialogs: Map<string, any>) => {
      const newDialogs = new Map(prevDialogs);
      newDialogs.delete(url);
      return newDialogs;
    });
  }

  const value: FileExplorerContextType = { explorerDialogs, setExplorerDialogs, addExplorerDialog, removeExplorerDialog, baseZIndex, setBaseZIndex };
  return (
    <FileExplorerContext.Provider value={value}>
      {props.children}
    </FileExplorerContext.Provider>
  );
}
