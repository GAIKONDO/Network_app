/**
 * 制度整形MCP Tool
 * 整形されていない制度テキストを、構造化されたマークダウン形式に整形し、個別トピックに分割します
 */

import type { MCPToolImplementation, MCPToolRequest, MCPToolResult } from '../tools';
import { getRegulationById, saveRegulation } from '@/lib/orgApi';
import { callLLMAPI } from '@/lib/agent-system/llmHelper';

/**
 * 制度整形Tool
 */
class FormatRegulationContentTool implements MCPToolImplementation {
  name = 'format_regulation_content';
  description = '整形されていない制度テキストを、読みやすいマークダウン形式に整形します。整形されたコンテンツは指定された制度アイテムに保存されます。トピック分割やエンティティ・リレーション生成は後で行います。';
  arguments = [
    { name: 'rawContent', type: 'string' as const, description: '整形前の制度テキスト（regulationIdと排他的）', required: false },
    { name: 'regulationId', type: 'string' as const, description: '制度ID（制度全体を取得）', required: false },
    { name: 'itemId', type: 'string' as const, description: '個別制度アイテムID（ナビゲーションで追加した制度のID。regulationIdとitemIdの両方が指定された場合、そのアイテムのみを編集）', required: false },
    { name: 'topicId', type: 'string' as const, description: 'トピックID（itemIdとtopicIdの両方が指定された場合、そのトピックのみを編集）', required: false },
    { name: 'options', type: 'object' as const, description: '整形オプション', required: false },
    { name: 'modelType', type: 'string' as const, description: 'モデルタイプ（gpt/local）', required: false, default: 'gpt' },
    { name: 'selectedModel', type: 'string' as const, description: '選択されたモデル名', required: false, default: 'gpt-5-mini' },
    { name: 'save', type: 'boolean' as const, description: '整形結果を制度に保存するかどうか（デフォルト: false。falseの場合は整形結果のみを返し、保存は行わない）', required: false, default: false },
  ];
  returns = {
    type: 'object' as const,
    description: '整形結果（formattedContentとtopics配列を含む）',
  };

  async execute(request: MCPToolRequest): Promise<MCPToolResult> {
    const { rawContent, regulationId, itemId, topicId, options, modelType, selectedModel, save } = request.arguments;
    
    console.log('[FormatRegulationContentTool] 実行開始:', {
      hasRawContent: !!rawContent,
      rawContentLength: rawContent ? (rawContent as string).length : 0,
      hasRegulationId: !!regulationId,
      regulationId: regulationId as string | undefined,
      hasItemId: !!itemId,
      itemId: itemId as string | undefined,
      hasTopicId: !!topicId,
      topicId: topicId as string | undefined,
      save: save === true,
    });
    
    // rawContentまたはregulationIdのどちらかが必要
    if (!rawContent && !regulationId) {
      return {
        success: false,
        error: 'rawContentまたはregulationIdが必要です',
      };
    }
    
    // rawContentが空文字列の場合もエラー
    if (rawContent && typeof rawContent === 'string' && rawContent.trim().length === 0) {
      return {
        success: false,
        error: 'rawContentが空です。整形する内容を指定してください。',
      };
    }
    
    // itemIdが指定されている場合、regulationIdも必要
    if (itemId && !regulationId) {
      return {
        success: false,
        error: 'itemIdを指定する場合、regulationIdも必要です',
      };
    }
    
    // topicIdが指定されている場合、regulationIdとitemIdも必要
    if (topicId && (!regulationId || !itemId)) {
      return {
        success: false,
        error: 'topicIdを指定する場合、regulationIdとitemIdも必要です',
      };
    }

    try {
      let contentToFormat = rawContent as string | undefined;
      let regulation: any = null;
      let targetItemId: string | null = itemId as string | null;
      let targetTabId: string | null = null;
      
      // regulationIdが指定されている場合、制度を取得（save: trueの場合は必ず取得）
      if (regulationId && (!rawContent || save === true)) {
        const regId = regulationId as string;
        console.log('[FormatRegulationContentTool] 制度IDで検索:', regId, itemId ? `itemId: ${itemId}` : '');
        
        regulation = await getRegulationById(regId);
        
        if (!regulation) {
          console.warn('[FormatRegulationContentTool] 制度が見つかりません:', regId);
          
          // デバッグ: 利用可能な制度一覧を取得して表示
          let availableRegulationsInfo = '';
          try {
            const { getAllRegulations } = await import('@/lib/orgApi');
            // getAllRegulationsは存在しないため、getRegulationsを使用
            const { getRegulations } = await import('@/lib/orgApi');
            // organizationIdが必要なので、空の配列を返す
            const allRegulations: any[] = [];
            console.log('[FormatRegulationContentTool] 利用可能な制度数:', allRegulations.length);
            if (allRegulations.length > 0) {
              const regIds = allRegulations.slice(0, 10).map(r => `- ${r.id} (${r.title || 'タイトルなし'})`);
              console.log('[FormatRegulationContentTool] 制度ID一覧:', regIds);
              availableRegulationsInfo = `\n\n利用可能な制度ID（最初の10件）:\n${regIds.join('\n')}`;
            } else {
              availableRegulationsInfo = '\n\n利用可能な制度が見つかりませんでした。';
            }
          } catch (debugError) {
            console.error('[FormatRegulationContentTool] 制度一覧取得エラー:', debugError);
            availableRegulationsInfo = '\n\n制度一覧の取得に失敗しました。';
          }
          
          return {
            success: false,
            error: `制度が見つかりません: ${regId}\n\nヒント: 正しい制度IDを指定してください。制度IDは通常「regulation_」で始まります。${availableRegulationsInfo}`,
          };
        }
        
        console.log('[FormatRegulationContentTool] 制度を取得しました:', {
          specifiedId: regId,
          retrievedId: regulation.id,
          idsMatch: regId === regulation.id,
          title: regulation.title,
          contentLength: regulation.content?.length || 0,
        });
        
        // 取得した制度のIDが指定されたIDと一致しているか確認
        if (regulation.id !== regId) {
          console.error('[FormatRegulationContentTool] ⚠️ 警告: 取得した制度のIDが指定されたIDと一致しません:', {
            specifiedId: regId,
            retrievedId: regulation.id,
          });
          // 警告のみで続行（IDの不一致をログに記録）
        }
        
        // 制度のcontentを取得（JSON形式の場合はパース）
        if (regulation.content) {
          try {
            const parsed = JSON.parse(regulation.content);
            
            // itemIdが指定されている場合、そのアイテムのみを取得
            if (targetItemId) {
              let foundItem: any = null;
              
              // すべてのタブを検索して、指定されたitemIdのアイテムを探す
              for (const [tabId, tabData] of Object.entries(parsed)) {
                if (tabData && typeof tabData === 'object') {
                  const monthContent = tabData as any;
                  if (monthContent.items) {
                    const item = monthContent.items.find((i: any) => i.id === targetItemId);
                    if (item) {
                      foundItem = item;
                      targetTabId = tabId;
                      break;
                    }
                  }
                }
              }
              
              if (!foundItem) {
                return {
                  success: false,
                  error: `制度アイテムが見つかりません: itemId=${targetItemId}, regulationId=${regId}`,
                };
              }
              
              // topicIdが指定されている場合、そのトピックのみを取得
              const targetTopicId = topicId as string | null;
              if (targetTopicId) {
                if (!foundItem.topics || !Array.isArray(foundItem.topics)) {
                  return {
                    success: false,
                    error: `アイテムにトピックがありません: itemId=${targetItemId}, regulationId=${regId}`,
                  };
                }
                
                const foundTopic = foundItem.topics.find((t: any) => t.id === targetTopicId);
                if (!foundTopic) {
                  return {
                    success: false,
                    error: `トピックが見つかりません: topicId=${targetTopicId}, itemId=${targetItemId}, regulationId=${regId}`,
                  };
                }
                
                // 見つかったトピックの内容を整形対象にする
                contentToFormat = foundTopic.content || '';
                console.log('[FormatRegulationContentTool] 個別トピックを取得:', {
                  topicId: targetTopicId,
                  itemId: targetItemId,
                  tabId: targetTabId,
                  title: foundTopic.title,
                  contentLength: contentToFormat.length,
                });
              } else {
                // 見つかったアイテムの内容を整形対象にする
                contentToFormat = foundItem.content || '';
                console.log('[FormatRegulationContentTool] 個別アイテムを取得:', {
                  itemId: targetItemId,
                  tabId: targetTabId,
                  title: foundItem.title,
                  contentLength: contentToFormat.length,
                });
              }
            } else {
              // itemIdが指定されていない場合、すべてのタブの内容を結合
              const allContent: string[] = [];
              for (const [tabId, tabData] of Object.entries(parsed)) {
                if (tabData && typeof tabData === 'object') {
                  const monthContent = tabData as any;
                  if (monthContent.summary) {
                    allContent.push(`## ${tabId}サマリ\n${monthContent.summary}`);
                  }
                  if (monthContent.items) {
                    for (const item of monthContent.items) {
                      if (item.title) {
                        allContent.push(`## ${item.title}\n${item.content || ''}`);
                      } else {
                        allContent.push(item.content || '');
                      }
                    }
                  }
                }
              }
              contentToFormat = allContent.join('\n\n');
            }
          } catch {
            // JSON形式でない場合はそのまま使用
            contentToFormat = regulation.content;
          }
        } else {
          return {
            success: false,
            error: '制度の内容が空です',
          };
        }
      }

      // save: trueの場合、rawContentが空でも制度から内容を取得できるため、エラーにしない
      if ((!contentToFormat || contentToFormat.trim().length === 0) && save !== true) {
        return {
          success: false,
          error: '整形するコンテンツが空です',
        };
      }
      
      // save: trueの場合、rawContentが空でも制度から内容を取得して保存できる
      if (save === true && (!contentToFormat || contentToFormat.trim().length === 0)) {
        console.log('[FormatRegulationContentTool] save=trueですが、contentToFormatが空です。制度から内容を取得します。');
        // contentToFormatは後で制度から取得されるため、ここではエラーにしない
      }

      // save: trueでrawContentが指定されている場合、AI APIを呼び出さずにrawContentをそのまま使用
      let formattedContent: string;
      
      if (save === true && rawContent && typeof rawContent === 'string' && rawContent.trim().length > 0) {
        // save: trueでrawContentが指定されている場合、AI整形をスキップしてrawContentをそのまま使用
        formattedContent = rawContent.trim();
        console.log('[FormatRegulationContentTool] save=true: rawContent（前回の整形結果）を使用します（AI API呼び出しをスキップ）:', {
          formattedContentLength: formattedContent.length,
        });
      } else {
        // 通常の整形処理：AI APIを呼び出して整形
        const opts = (options as any) || {};
        const finalModelType = (modelType || 'gpt') as 'gpt' | 'local';
        const finalSelectedModel = (selectedModel || 'gpt-5-mini') as string;

        // AIプロンプトを作成（シンプルに整形のみ）
        const systemPrompt = `あなたは制度編集専門のAIアシスタントです。
提供された制度テキストを、読みやすいマークダウン形式に整形してください。

**出力形式:**
整形されたマークダウンテキストをそのまま返してください。JSON形式ではなく、整形されたテキストのみを返してください。

**重要な指示:**
1. 整形されたコンテンツは、読みやすいマークダウン形式にしてください
2. 見出しには##を使用してください
3. 箇条書きは適切にフォーマットしてください
4. 段落は適切に区切ってください
5. 元の内容の意味を変えずに、読みやすく整形してください

**制度情報の構造化:**
制度の冒頭に基本情報を以下の形式でまとめてください：

## 基本情報

### 制度名
（制度の名称を記載）

### 適用範囲
（制度が適用される範囲を記載）

### 関連組織
関連組織は「組織名：説明」の形式で記載してください。

**重要：関連組織は個別のトピックにしないでください。全て基本情報セクションにまとめてください。**

整形されたコンテンツを返してください。`;

        const userPrompt = `以下の制度テキストを整形してください：

${contentToFormat}`;

        console.log('[FormatRegulationContentTool] AI APIを呼び出して整形:', {
          modelType: finalModelType,
          selectedModel: finalSelectedModel,
          contentLength: contentToFormat.length,
        });

        const aiResponse = await callLLMAPI(
          finalModelType,
          finalSelectedModel,
          systemPrompt,
          userPrompt
        );

        formattedContent = aiResponse.trim();
        console.log('[FormatRegulationContentTool] AI整形完了:', {
          originalLength: contentToFormat.length,
          formattedLength: formattedContent.length,
        });
      }

      // 整形結果を返す
      const result = {
        formattedContent,
        message: '制度の整形が完了しました。',
      };

      // save: trueの場合、制度を保存
      const shouldSave = save === true;
      if (shouldSave && regulation && targetItemId && targetTabId) {
        try {
          // 制度のcontentを更新
          const parsed = JSON.parse(regulation.content);
          const targetTopicId = topicId as string | null;
          
          if (targetTopicId) {
            // トピックを更新
            const tabData = parsed[targetTabId];
            if (tabData && tabData.items) {
              const item = tabData.items.find((i: any) => i.id === targetItemId);
              if (item && item.topics) {
                const topic = item.topics.find((t: any) => t.id === targetTopicId);
                if (topic) {
                  topic.content = formattedContent;
                }
              }
            }
          } else {
            // アイテムを更新
            const tabData = parsed[targetTabId];
            if (tabData && tabData.items) {
              const item = tabData.items.find((i: any) => i.id === targetItemId);
              if (item) {
                item.content = formattedContent;
              }
            }
          }
          
          const updatedContent = JSON.stringify(parsed);
          
          const targetRegId = regulationId as string;
          console.log('[FormatRegulationContentTool] 制度を保存:', {
            regulationId: targetRegId,
            itemId: targetItemId,
            tabId: targetTabId,
            topicId: targetTopicId,
            contentLength: updatedContent.length,
            idsMatch: (regulationId as string) === regulation.id,
          });
          
          // 指定されたIDを明示的に使用
          await saveRegulation({
            id: targetRegId, // 明示的にIDを指定
            organizationId: regulation.organizationId,
            title: regulation.title,
            description: regulation.description,
            content: updatedContent,
          });
          
          if (targetTopicId) {
            console.log('[FormatRegulationContentTool] トピックを更新しました:', {
              topicId: targetTopicId,
              itemId: targetItemId,
              tabId: targetTabId,
              contentLength: result.formattedContent.length,
            });
          } else {
            console.log('[FormatRegulationContentTool] 制度アイテムを更新しました:', {
              itemId: targetItemId,
              tabId: targetTabId,
              contentLength: result.formattedContent.length,
            });
          }
        } catch (saveError: any) {
          console.error('[FormatRegulationContentTool] 保存エラー:', saveError);
          console.error('[FormatRegulationContentTool] エラー詳細:', {
            message: saveError.message,
            stack: saveError.stack,
            name: saveError.name,
            itemId: targetItemId,
            tabId: targetTabId,
            hasRegulation: !!regulation,
          });
          return {
            success: false,
            error: `制度の保存に失敗しました: ${saveError.message || '不明なエラー'}\n\n詳細:\n- アイテムID: ${targetItemId}\n- タブID: ${targetTabId || '未取得'}\n- 制度ID: ${regulationId}`,
            metadata: {
              source: this.name,
              regulationId: regulationId as string | undefined,
              itemId: targetItemId || undefined,
            },
          };
        }
      } else if (save === true) {
        const missingInfo = [];
        if (!targetItemId) missingInfo.push('アイテムID');
        if (!regulation) missingInfo.push('制度データ');
        if (!targetTabId) missingInfo.push('タブID');
        
        console.warn('[FormatRegulationContentTool] save=trueが指定されましたが、保存に必要な情報が不足しています:', {
          hasItemId: !!targetItemId,
          hasRegulation: !!regulation,
          hasTabId: !!targetTabId,
          missingInfo,
        });
        
        return {
          success: false,
          error: `制度の保存に必要な情報が不足しています: ${missingInfo.join(', ')}\n\n- アイテムID: ${targetItemId || '未指定'}\n- 制度ID: ${regulationId || '未指定'}\n- タブID: ${targetTabId || '未取得'}`,
          metadata: {
            source: this.name,
            regulationId: regulationId as string | undefined,
            itemId: targetItemId || undefined,
          },
        };
      }

      return {
        success: true,
        data: {
          ...result,
          saved: shouldSave,
          message: shouldSave 
            ? '制度の整形と保存が完了しました。' 
            : '制度の整形が完了しました。この内容で登録する場合は、「登録する」または「保存する」と回答してください。',
        },
        metadata: {
          source: this.name,
          regulationId: regulationId as string | undefined,
          itemId: targetItemId || undefined,
          saved: shouldSave,
        },
      };
    } catch (error: any) {
      console.error('[FormatRegulationContentTool] エラー:', error);
      return {
        success: false,
        error: error.message || '制度整形に失敗しました',
        metadata: {
          source: this.name,
        },
      };
    }
  }
}

export const formatRegulationContentTool = new FormatRegulationContentTool();

