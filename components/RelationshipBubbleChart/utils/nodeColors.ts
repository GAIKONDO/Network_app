// ノードタイプごとの色設定
export const NODE_COLORS = {
  theme: '#1A1A1A',
  category: '#8B5CF6', // カテゴリー用の色（紫）
  startup: '#EC4899', // スタートアップ用の色（ピンク）
  organization: '#10B981',
  company: '#10B981', // 事業会社は組織と同じ色を使用
  initiative: '#4262FF',
  topic: '#F59E0B',
};

// 深さに応じた色を取得
export const getColorByDepth = (depth: number, nodeType: string): string => {
  if (nodeType === 'theme') {
    return NODE_COLORS.theme;
  } else if (nodeType === 'category') {
    return NODE_COLORS.category;
  } else if (nodeType === 'startup') {
    return NODE_COLORS.startup;
  } else if (nodeType === 'organization' || nodeType === 'company') {
    return NODE_COLORS.organization;
  } else if (nodeType === 'initiative') {
    return NODE_COLORS.initiative;
  } else if (nodeType === 'topic') {
    return NODE_COLORS.topic;
  }
  return '#808080';
};

