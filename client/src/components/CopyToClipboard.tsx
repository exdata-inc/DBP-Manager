import React, { useState } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
  Tooltip,
  IconButton
} from '@mui/material';

const CopyToClipboard: React.FC<{ textToCopy: string | number | boolean }> = ({ textToCopy }) => {
  const [status, setStatus] = useState<string>('');
  const [visible, setVisible] = useState<boolean>(false); // メッセージの可視性管理
  const [opacity, setOpacity] = useState<number>(0); // 透明度を管理

  const copyTextToClipboard = async () => {
    // 既にメッセージが表示されている場合は何もしない
    if (visible) return;

    const value = `${textToCopy}`;

    try {
      await navigator.clipboard.writeText(value);
      setStatus('コピー成功');
      setVisible(true); // メッセージを表示
      setOpacity(1); // 透明度を1に設定して表示

      // 3秒後にメッセージを消去する
      setTimeout(() => {
        setOpacity(0); // 透明度を0に設定して非表示に
      }, 2000); // メッセージ表示時間

      // 透明度が0になった後にメッセージを非表示にする
      setTimeout(() => {
        setVisible(false); // メッセージを非表示
        setStatus(''); // メッセージ内容をクリア
      }, 2500); // 透明度を0にした後に非表示にするまでの時間
    } catch (err) {
      setStatus(`コピー失敗: ${err}`);
      setVisible(true); // メッセージを表示
      setOpacity(1); // 透明度を1に設定して表示

      // 3秒後にメッセージを消去する
      setTimeout(() => {
        setOpacity(0); // 透明度を0に設定して非表示に
      }, 2000); // メッセージ表示時間

      // 透明度が0になった後にメッセージを非表示にする
      setTimeout(() => {
        setVisible(false); // メッセージを非表示
        setStatus(''); // メッセージ内容をクリア
      }, 2500); // 透明度を0にした後に非表示にするまでの時間
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div onClick={copyTextToClipboard} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        {/* Material Icons のアイコンを表示 */}
        <Tooltip title="コピー">
          <IconButton><ContentCopyIcon style={{ fontSize: '20px', color: '#4d4d4d' }} />
          </IconButton></Tooltip>
      </div>
      {visible && (
        <div style={{
          position: 'absolute',
          top: '50%', // ボタンの近くに配置
          left: 'calc(60% + 4px)', // ボタンの右側に表示（必要に応じて調整）
          transform: 'translateY(-50%)', // 垂直方向に中央揃え
          backgroundColor: 'rgba(0, 0, 0, 0.7)', // 半透明の背景
          color: 'white',
          padding: '10px 20px',
          borderRadius: '5px',
          opacity: opacity, // 透明度を使用
          transition: 'opacity 0.5s ease-in-out', // アニメーション
          zIndex: 1000, // 他のコンテンツの上に表示
          fontSize: '12px',
          whiteSpace: 'nowrap', // テキストの折り返しを防止
          display: 'inline-block' // 幅を内容に合わせて動的に変化させる
        }}>
          {status}
        </div>
      )}
    </div>
  );
};

export default CopyToClipboard;
