import React from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { ProgressData, FileMoveContextType } from "../types";
import * as C from "../etc/consts";

const FileMoveContext = React.createContext<FileMoveContextType | undefined>(undefined);

export const useFileMoveContext = (): FileMoveContextType => {
  const context = React.useContext(FileMoveContext);
  if (!context) {
    throw new Error("useFileMoveContext must be used within a FileMoveProvider");
  }
  return context;
};

export const FileMoveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // localStorage から初期値を取得
  const [moveLoader, setMoveLoader] = React.useState<boolean>(() => {
    return JSON.parse(localStorage.getItem("moveLoader") || "false");
  });

  const [progressData, setProgressData] = React.useState<ProgressData>(() => {
    const savedProgressData = localStorage.getItem("progressData");
    return savedProgressData
      ? JSON.parse(savedProgressData)
      : {
          all_progress: { uploaded: 0, total: 0, progress: 0 },
          part_progress: { uploaded: 0, total: 0, progress: 0 },
          date_progress: { uploaded: 0, total: 0, progress: 0 },
        };
  });

  const [wsStatus, setWsStatus] = React.useState<Record<string, boolean>>({
    all_progress: false,
    date_progress: false,
    part_progress: false,
  });

  const areAllWsConnected = React.useMemo(() => {
    return Object.values(wsStatus).every((status) => status === true);
  }, [wsStatus]);

  React.useEffect(() => {
    localStorage.setItem("moveLoader", JSON.stringify(moveLoader));
  }, [moveLoader]);

  React.useEffect(() => {
    localStorage.setItem("progressData", JSON.stringify(progressData));
  }, [progressData]);

  React.useEffect(() => {
    let isUnmounted = false;
    const wsConnections: WebSocket[] = [];
    const maxReconnectAttempts = 5;
    const wsUrlPrefix = "ws://" + C.defaultLocalHost.replace(/^http:\/\//, "");
    const groupNames = ["all_progress", "date_progress", "part_progress"];

    const connect = (groupName: string, attempt = 1) => {
      if (isUnmounted) return;
      const wsUrl = `${wsUrlPrefix}/ws/progress/${groupName}/`;
      console.log(`Connecting to WebSocket: ${wsUrl} (attempt ${attempt})`);
      const ws = new WebSocket(wsUrl);

      // 接続成功時に状態を更新
      ws.onopen = () => {
        console.log(`WebSocket for group "${groupName}" opened.`);
        setWsStatus((prev) => ({ ...prev, [groupName]: true }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setProgressData((prev) => ({
            ...prev,
            [groupName]: data,
          }));
        } catch (err) {
          console.error(`Failed to parse WebSocket message for group "${groupName}":`, err);
        }
      };

      ws.onclose = () => {
        console.warn(`WebSocket for group "${groupName}" closed.`);
        setWsStatus((prev) => ({ ...prev, [groupName]: false }));

        if (!isUnmounted && attempt < maxReconnectAttempts) {
          const delay = Math.min(30000, Math.pow(2, attempt) * 1000);
          console.log(`Reconnecting to ${groupName} in ${delay} ms (attempt ${attempt + 1})`);
          setTimeout(() => connect(groupName, attempt + 1), delay);
        } else if (attempt >= maxReconnectAttempts) {
          console.error(`Max reconnect attempts reached for group "${groupName}".`);
        }
      };

      ws.onerror = (error) => {
        console.error(`WebSocket error for group "${groupName}":`, error);
        ws.close();
      };

      wsConnections.push(ws);
    };

    groupNames.forEach((groupName) => {
      connect(groupName);
    });

    return () => {
      isUnmounted = true;
      wsConnections.forEach((ws) => ws.close());
    };
  }, []);

  React.useEffect(() => {
    const allComplete = Object.values(progressData).every(
      (progress) => progress.progress === 100
    );
    if (allComplete) {
      setMoveLoader(false);
      const resetProgressData: ProgressData = {
        all_progress: { uploaded: 0, total: 0, progress: 0 },
        part_progress: { uploaded: 0, total: 0, progress: 0 },
        date_progress: { uploaded: 0, total: 0, progress: 0 },
      };
      setProgressData(resetProgressData);
    }
  }, [progressData]);

  React.useEffect(() => {
    console.log("Updated progressData:", progressData);
  }, [progressData]);

  // MiniProgressWindow コンポーネント
  const MiniProgressWindow = ({
    progressData,
    isVisible,
  }: {
    progressData: ProgressData;
    isVisible: boolean;
  }) => (
    <Box
      sx={{
        position: "fixed",
        bottom: 20,
        right: isVisible ? 20 : -350,
        width: 300,
        bgcolor: "background.paper",
        boxShadow: 3,
        p: 2,
        borderRadius: 2,
        zIndex: 1300,
        transition: "right 0.5s ease",
      }}
    >
      <Typography variant="h6">進捗状況</Typography>
      {Object.entries(progressData).map(([key, data]) => (
        <Box key={key} sx={{ mt: 2 }}>
          <Typography variant="body2">{key.replace("_", " ").toUpperCase()}</Typography>
          <LinearProgress
            variant="determinate"
            value={(data as { progress: number }).progress}
            sx={{ mt: 1 }}
          />
          <Typography variant="caption">
            {(data as { uploaded: number; total: number; progress: number }).uploaded} /{" "}
            {(data as { uploaded: number; total: number; progress: number }).total} (
            {(data as { uploaded: number; total: number; progress: number }).progress.toFixed(2)}%)
          </Typography>
        </Box>
      ))}
    </Box>
  );

  return (
    <FileMoveContext.Provider
      value={{ moveLoader, setMoveLoader, progressData, setProgressData, areAllWsConnected }}
    >
      <MiniProgressWindow progressData={progressData} isVisible={moveLoader} />
      {children}
    </FileMoveContext.Provider>
  );
};
