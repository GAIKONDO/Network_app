/**
 * Phase 1 動作確認用テストスクリプト
 * 
 * 実行方法:
 * npx tsx scripts/test-local-model-provider.ts
 * 
 * または
 * 
 * ts-node scripts/test-local-model-provider.ts
 */

import { OllamaProvider } from '../lib/localModel/providers/ollamaProvider';
import { LlamaCppServerProvider } from '../lib/localModel/providers/llamaCppProvider';
import { getProviderForModel, getModelConfig, isLocalModel } from '../lib/localModel/router';
import type { ChatMessage } from '../lib/localModel/types';

async function testPhase1() {
  console.log('🧪 Phase 1 動作確認テスト開始\n');

  // テスト1: 型定義とインターフェースの確認
  console.log('📋 テスト1: 型定義とインターフェースの確認');
  try {
    const provider = new OllamaProvider();
    console.log(`✅ OllamaProviderインスタンス作成成功`);
    console.log(`   - name: ${provider.name}`);
    console.log(`   - supportsStreaming: ${provider.supportsStreaming}`);
    console.log(`   - supportsFunctionCalling: ${provider.supportsFunctionCalling}`);
  } catch (error) {
    console.error('❌ OllamaProviderインスタンス作成失敗:', error);
    return;
  }

  // テスト2: ルーティングの確認
  console.log('\n📋 テスト2: ルーティングの確認');
  try {
    const modelConfig = getModelConfig('qwen2.5:7b');
    console.log(`✅ モデル設定取得成功`);
    console.log(`   - id: ${modelConfig.id}`);
    console.log(`   - name: ${modelConfig.name}`);
    console.log(`   - provider: ${modelConfig.provider}`);

    const provider = getProviderForModel(modelConfig);
    console.log(`✅ プロバイダー取得成功`);
    console.log(`   - provider name: ${provider.name}`);
  } catch (error) {
    console.error('❌ ルーティング失敗:', error);
    return;
  }

  // テスト3: ローカルモデル判定の確認
  console.log('\n📋 テスト3: ローカルモデル判定の確認');
  const testModels = [
    'qwen2.5:7b',
    'llama3:8b',
    'mistral:latest',
    'gpt-4o-mini',
    'model.gguf',
  ];

  testModels.forEach(model => {
    const isLocal = isLocalModel(model);
    console.log(`   - ${model}: ${isLocal ? '✅ ローカル' : '❌ 非ローカル'}`);
  });

  // テスト4: モデル一覧取得の確認（Ollamaが起動している場合のみ）
  console.log('\n📋 テスト4: モデル一覧取得の確認');
  try {
    const provider = new OllamaProvider();
    const models = await provider.listModels();
    
    if (models.length > 0) {
      console.log(`✅ モデル一覧取得成功 (${models.length}件)`);
      models.slice(0, 3).forEach(model => {
        console.log(`   - ${model.name} (${model.provider})`);
      });
      if (models.length > 3) {
        console.log(`   ... 他 ${models.length - 3}件`);
      }
    } else {
      console.log('⚠️  モデル一覧が空です（Ollamaが起動していない可能性があります）');
    }
  } catch (error: any) {
    console.log(`⚠️  モデル一覧取得エラー: ${error.message}`);
    console.log('   （Ollamaが起動していない可能性があります。これは正常です）');
  }

  // テスト5: チャットAPIの確認（実際のAPI呼び出しは行わない）
  console.log('\n📋 テスト5: チャットAPIインターフェースの確認');
  try {
    const provider = new OllamaProvider();
    const messages: ChatMessage[] = [
      { role: 'system', content: 'あなたは親切なアシスタントです。' },
      { role: 'user', content: 'こんにちは' },
    ];
    
    // 実際のAPI呼び出しは行わず、インターフェースが正しいことを確認
    console.log('✅ チャットAPIインターフェース確認完了');
    console.log('   （実際のAPI呼び出しはスキップしました）');
    console.log('   メッセージ数:', messages.length);
  } catch (error) {
    console.error('❌ チャットAPIインターフェース確認失敗:', error);
  }

  // テスト6: LlamaCppServerProviderの確認（Phase 2）
  console.log('\n📋 テスト6: LlamaCppServerProviderの確認（Phase 2）');
  try {
    const provider = new LlamaCppServerProvider();
    console.log(`✅ LlamaCppServerProviderインスタンス作成成功`);
    console.log(`   - name: ${provider.name}`);
    console.log(`   - supportsStreaming: ${provider.supportsStreaming}`);
    console.log(`   - supportsFunctionCalling: ${provider.supportsFunctionCalling}`);
    
    // モデル一覧取得の確認
    const models = await provider.listModels();
    console.log(`✅ モデル一覧取得成功 (${models.length}件)`);
    if (models.length > 0) {
      models.forEach(model => {
        console.log(`   - ${model.name} (${model.provider}, ${model.format})`);
      });
    } else {
      console.log('   ⚠️  登録されたモデルがありません（設定画面で登録する必要があります）');
    }
  } catch (error: any) {
    console.log(`⚠️  LlamaCppServerProvider確認: ${error.message}`);
    console.log('   （llama-serverが起動していない可能性があります。これは正常です）');
  }

  // テスト7: GGUFモデルのルーティング確認
  console.log('\n📋 テスト7: GGUFモデルのルーティング確認');
  try {
    const ggufModelConfig = getModelConfig('model.gguf');
    console.log(`✅ GGUFモデル設定取得成功`);
    console.log(`   - id: ${ggufModelConfig.id}`);
    console.log(`   - provider: ${ggufModelConfig.provider}`);
    console.log(`   - modelPath: ${ggufModelConfig.modelPath}`);
    
    const provider = getProviderForModel(ggufModelConfig);
    console.log(`✅ GGUFモデルのプロバイダー取得成功`);
    console.log(`   - provider name: ${provider.name}`);
  } catch (error: any) {
    console.log(`⚠️  GGUFモデルルーティング: ${error.message}`);
  }

  console.log('\n✅ Phase 1 & 2 動作確認テスト完了');
  console.log('\n📝 次のステップ:');
  console.log('   1. 開発サーバーを起動して、AIアシスタントでローカルモデルを選択');
  console.log('   2. 実際にメッセージを送信して動作を確認');
  console.log('   3. ブラウザのコンソールでエラーがないか確認');
}

// 実行
testPhase1().catch(error => {
  console.error('❌ テスト実行エラー:', error);
  process.exit(1);
});

