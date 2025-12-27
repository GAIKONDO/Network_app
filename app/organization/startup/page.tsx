'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import type { Startup } from '@/lib/orgApi';
import MermaidLoader from '@/components/MermaidLoader';
import { generateUniqueId } from '@/lib/orgApi';
import { StartupTabBar } from './components/StartupTabBar';
import AIGenerationModal from './components/modals/AIGenerationModal';
import { useStartupData } from './hooks/useStartupData';
import StartupPageHeader from './components/StartupPageHeader';
import ThemeSelectionSection from './components/ThemeSelectionSection';
import TopicSelectionSection from './components/TopicSelectionSection';
import StartupIdLinks from './components/StartupIdLinks';
import TopicSelectModal from './components/modals/TopicSelectModal';
import { useStartupSave } from './hooks/useStartupSave';
import StartupTabContent from './components/StartupTabContent';
import StartupModals from './components/StartupModals';
import { LoadingState, ErrorState } from './components/LoadingAndErrorStates';

import type { StartupTab } from './components/StartupTabBar';

function StartupDetailPageContent() {
  const searchParams = useSearchParams();
  const organizationId = searchParams?.get('organizationId') as string;
  const startupId = searchParams?.get('startupId') as string;
  
  // データ取得カスタムフック
  const {
    startup,
    orgData,
    themes,
    topics,
    orgMembers,
    allOrgMembers,
    allOrganizations,
    allMeetingNotes,
    orgTreeForModal,
    loading,
    error,
    initialLocalState,
    setStartup,
    setOrgData,
    setThemes,
    setTopics,
    setOrgMembers,
    setAllOrgMembers,
    setAllOrganizations,
    setAllMeetingNotes,
    setOrgTreeForModal,
    setError,
  } = useStartupData(organizationId, startupId);
  
  const [activeTab, setActiveTab] = useState<StartupTab>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editingContent, setEditingContent] = useState(initialLocalState.content);
  
  // 編集用のローカル状態（初期値はカスタムフックから取得）
  const [localAssignee, setLocalAssignee] = useState<string[]>(initialLocalState.assignee);
  const [localDescription, setLocalDescription] = useState(initialLocalState.description);
  const [localMethod, setLocalMethod] = useState<string[]>(initialLocalState.method);
  const [localMethodOther, setLocalMethodOther] = useState(initialLocalState.methodOther);
  const [localMeans, setLocalMeans] = useState<string[]>(initialLocalState.means);
  const [localMeansOther, setLocalMeansOther] = useState(initialLocalState.meansOther);
  const [localObjective, setLocalObjective] = useState(initialLocalState.objective);
  const [localEvaluation, setLocalEvaluation] = useState(initialLocalState.evaluation);
  const [localEvaluationChart, setLocalEvaluationChart] = useState<any>(null);
  const [localEvaluationChartSnapshots, setLocalEvaluationChartSnapshots] = useState<any[]>([]);
  const [isEditingChart, setIsEditingChart] = useState(false);
  const [localConsiderationPeriod, setLocalConsiderationPeriod] = useState(initialLocalState.considerationPeriod);
  const [localExecutionPeriod, setLocalExecutionPeriod] = useState(initialLocalState.executionPeriod);
  const [localMonetizationPeriod, setLocalMonetizationPeriod] = useState(initialLocalState.monetizationPeriod);
  const [localRelatedOrganizations, setLocalRelatedOrganizations] = useState<string[]>(initialLocalState.relatedOrganizations);
  const [localRelatedGroupCompanies, setLocalRelatedGroupCompanies] = useState<string[]>(initialLocalState.relatedGroupCompanies);
  const [localMonetizationDiagram, setLocalMonetizationDiagram] = useState(initialLocalState.monetizationDiagram);
  const [localRelationDiagram, setLocalRelationDiagram] = useState(initialLocalState.relationDiagram);
  const [isEditingMonetization, setIsEditingMonetization] = useState(false);
  const [isEditingRelation, setIsEditingRelation] = useState(false);
  const [isEditingCauseEffect, setIsEditingCauseEffect] = useState(false);
  const [localCauseEffectCode, setLocalCauseEffectCode] = useState(initialLocalState.causeEffectCode);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [localThemeIds, setLocalThemeIds] = useState<string[]>(initialLocalState.themeIds);
  const [localTopicIds, setLocalTopicIds] = useState<string[]>(initialLocalState.topicIds);
  const [isTopicsExpanded, setIsTopicsExpanded] = useState(false);
  const [isTopicSelectModalOpen, setIsTopicSelectModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isMonetizationUpdateModalOpen, setIsMonetizationUpdateModalOpen] = useState(false);
  const [isRelationUpdateModalOpen, setIsRelationUpdateModalOpen] = useState(false);
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const [assigneeSearchQuery, setAssigneeSearchQuery] = useState('');
  const [manualAssigneeInput, setManualAssigneeInput] = useState('');
  const assigneeInputRef = useRef<HTMLInputElement>(null);
  const assigneeDropdownRef = useRef<HTMLDivElement>(null);
  
  // initialLocalStateが更新されたらローカル状態を更新
  useEffect(() => {
    setEditingContent(initialLocalState.content || '');
    setLocalAssignee(initialLocalState.assignee);
    setLocalDescription(initialLocalState.description);
    setLocalMethod(initialLocalState.method);
    setLocalMethodOther(initialLocalState.methodOther);
    setLocalMeans(initialLocalState.means);
    setLocalMeansOther(initialLocalState.meansOther);
    setLocalObjective(initialLocalState.objective);
    setLocalEvaluation(initialLocalState.evaluation);
    if (initialLocalState.evaluationChart) {
      setLocalEvaluationChart(initialLocalState.evaluationChart);
    } else {
      setLocalEvaluationChart(null);
    }
    if (initialLocalState.evaluationChartSnapshots && initialLocalState.evaluationChartSnapshots.length > 0) {
      setLocalEvaluationChartSnapshots(initialLocalState.evaluationChartSnapshots);
    } else {
      setLocalEvaluationChartSnapshots([]);
    }
    setLocalConsiderationPeriod(initialLocalState.considerationPeriod);
    setLocalExecutionPeriod(initialLocalState.executionPeriod);
    setLocalMonetizationPeriod(initialLocalState.monetizationPeriod);
    setLocalRelatedOrganizations(initialLocalState.relatedOrganizations);
    setLocalRelatedGroupCompanies(initialLocalState.relatedGroupCompanies);
    setLocalMonetizationDiagram(initialLocalState.monetizationDiagram);
    setLocalRelationDiagram(initialLocalState.relationDiagram);
    setLocalCauseEffectCode(initialLocalState.causeEffectCode);
    setLocalThemeIds(initialLocalState.themeIds);
    setLocalTopicIds(initialLocalState.topicIds);
  }, [initialLocalState]);
  
  // AI作文モーダル関連
  const [isAIGenerationModalOpen, setIsAIGenerationModalOpen] = useState(false);
  const [aiGenerationTarget, setAIGenerationTarget] = useState<'description' | 'objective' | 'evaluation' | null>(null);
  const [aiGenerationInput, setAIGenerationInput] = useState('');
  const [selectedTopicIdsForAI, setSelectedTopicIdsForAI] = useState<string[]>([]);
  const [aiSummaryFormat, setAiSummaryFormat] = useState<'auto' | 'bullet' | 'paragraph' | 'custom'>('auto');
  const [aiSummaryLength, setAiSummaryLength] = useState<number>(500);
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [descriptionTextareaId] = useState(() => generateUniqueId());
  const [objectiveTextareaId] = useState(() => generateUniqueId());
  const [evaluationTextareaId] = useState(() => generateUniqueId());
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingObjective, setIsEditingObjective] = useState(false);
  const [isEditingEvaluation, setIsEditingEvaluation] = useState(false);
  
  // AI生成結果の比較用
  const [aiGeneratedContent, setAiGeneratedContent] = useState<string | null>(null);
  const [aiGeneratedTarget, setAiGeneratedTarget] = useState<'description' | 'objective' | 'evaluation' | null>(null);
  const [originalContent, setOriginalContent] = useState<string | null>(null);
  
  // 保存とダウンロードのカスタムフック
  const { handleManualSave, handleDownloadJson } = useStartupSave({
    startup,
    startupId,
    editingContent,
    localAssignee,
    localDescription,
    localMethod,
    localMethodOther,
    localMeans,
    localMeansOther,
    localObjective,
    localEvaluation,
    localEvaluationChart,
    localEvaluationChartSnapshots,
    localConsiderationPeriod,
    localExecutionPeriod,
    localMonetizationPeriod,
    localRelatedOrganizations,
    localRelatedGroupCompanies,
    localMonetizationDiagram,
    localRelationDiagram,
    localCauseEffectCode,
    localThemeIds,
    localTopicIds,
    setStartup,
    setEditingContent,
    setLocalAssignee,
    setLocalDescription,
    setLocalMethod,
    setLocalMethodOther,
    setLocalMeans,
    setLocalMeansOther,
    setLocalObjective,
    setLocalEvaluation,
    setLocalEvaluationChart,
    setLocalEvaluationChartSnapshots,
    setLocalConsiderationPeriod,
    setLocalExecutionPeriod,
    setLocalMonetizationPeriod,
    setLocalRelatedOrganizations,
    setLocalRelatedGroupCompanies,
    setLocalMonetizationDiagram,
    setLocalRelationDiagram,
    setLocalThemeIds,
    setLocalTopicIds,
    setSavingStatus,
  });
  
  // 選択肢のマスターデータ（デフォルト値）
  const [methodOptions] = useState(['協業・連携', 'ベンチャー投資', '一般投資', '投資・関連会社化', '投資・子会社化', '投資・完全子会社化', 'JV設立', '組織再編', '人材育成', '新会社設立', 'その他']);
  const [meansOptions] = useState(['技術開発', '事業開発', 'マーケティング', '営業', 'その他']);

  
  // 担当者ドロップダウンの外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        assigneeDropdownRef.current &&
        assigneeInputRef.current &&
        !assigneeDropdownRef.current.contains(event.target as Node) &&
        !assigneeInputRef.current.contains(event.target as Node)
      ) {
        setIsAssigneeDropdownOpen(false);
        setAssigneeSearchQuery('');
      }
    };

    if (isAssigneeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAssigneeDropdownOpen]);
  

  if (loading) {
    return <LoadingState />;
  }

  const shouldShowError = error || !startup || !orgData;
  
  if (shouldShowError) {
    return <ErrorState error={error} organizationId={organizationId} />;
  }


  return (
    <Layout>
      <MermaidLoader />
      <div className="card" style={{ padding: '24px' }}>
        <StartupPageHeader
          orgData={orgData}
          startup={startup}
          organizationId={organizationId}
          savingStatus={savingStatus}
          onSave={handleManualSave}
          onDownloadJson={handleDownloadJson}
          activeTab={activeTab}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          editingContent={editingContent}
          setEditingContent={setEditingContent}
        />

        {/* 関連テーマセクション（タイトルの下に常に表示） */}
        <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
          <ThemeSelectionSection
            themes={themes}
            localThemeIds={localThemeIds}
            setLocalThemeIds={setLocalThemeIds}
          />
          
          {/* 個別トピックセクション */}
          <TopicSelectionSection
            localTopicIds={localTopicIds}
            setLocalTopicIds={setLocalTopicIds}
            topics={topics}
            organizationId={organizationId}
            orgData={orgData}
            isTopicsExpanded={isTopicsExpanded}
            setIsTopicsExpanded={setIsTopicsExpanded}
            onOpenModal={() => setIsTopicSelectModalOpen(true)}
          />
          
          {/* スタートアップIDと特性要因図IDのリンク */}
          <StartupIdLinks
            startup={startup}
            organizationId={organizationId}
            startupId={startupId}
          />
        </div>

        {/* タブナビゲーション */}
        <StartupTabBar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* タブコンテンツ */}
        <StartupTabContent
          activeTab={activeTab}
          organizationId={organizationId}
          startup={startup}
          startupId={startupId}
          localAssignee={localAssignee}
          setLocalAssignee={setLocalAssignee}
          assigneeInputRef={assigneeInputRef}
          assigneeDropdownRef={assigneeDropdownRef}
          assigneeSearchQuery={assigneeSearchQuery}
          setAssigneeSearchQuery={setAssigneeSearchQuery}
          isAssigneeDropdownOpen={isAssigneeDropdownOpen}
          setIsAssigneeDropdownOpen={setIsAssigneeDropdownOpen}
          orgMembers={orgMembers}
          allOrgMembers={allOrgMembers}
          manualAssigneeInput={manualAssigneeInput}
          setManualAssigneeInput={setManualAssigneeInput}
          localDescription={localDescription}
          setLocalDescription={setLocalDescription}
          descriptionTextareaId={descriptionTextareaId}
          isEditingDescription={isEditingDescription}
          setIsEditingDescription={setIsEditingDescription}
          setAIGenerationTarget={setAIGenerationTarget}
          setAIGenerationInput={setAIGenerationInput}
          setSelectedTopicIdsForAI={setSelectedTopicIdsForAI}
          setAiSummaryFormat={setAiSummaryFormat}
          setAiSummaryLength={setAiSummaryLength}
          setAiCustomPrompt={setAiCustomPrompt}
          setIsAIGenerationModalOpen={setIsAIGenerationModalOpen}
          isAIGenerationModalOpen={isAIGenerationModalOpen}
          aiGeneratedTarget={aiGeneratedTarget}
          aiGeneratedContent={aiGeneratedContent}
          originalContent={originalContent}
          setAiGeneratedContent={setAiGeneratedContent}
          setAiGeneratedTarget={setAiGeneratedTarget}
          setOriginalContent={setOriginalContent}
          localObjective={localObjective}
          setLocalObjective={setLocalObjective}
          objectiveTextareaId={objectiveTextareaId}
          isEditingObjective={isEditingObjective}
          setIsEditingObjective={setIsEditingObjective}
          localEvaluation={localEvaluation}
          setLocalEvaluation={setLocalEvaluation}
          evaluationTextareaId={evaluationTextareaId}
          isEditingEvaluation={isEditingEvaluation}
          setIsEditingEvaluation={setIsEditingEvaluation}
          localEvaluationChart={localEvaluationChart}
          setLocalEvaluationChart={setLocalEvaluationChart}
          localEvaluationChartSnapshots={localEvaluationChartSnapshots}
          setLocalEvaluationChartSnapshots={setLocalEvaluationChartSnapshots}
          isEditingChart={isEditingChart}
          setIsEditingChart={setIsEditingChart}
          methodOptions={methodOptions}
          localMethod={localMethod}
          setLocalMethod={setLocalMethod}
          localMethodOther={localMethodOther}
          setLocalMethodOther={setLocalMethodOther}
          meansOptions={meansOptions}
          localMeans={localMeans}
          setLocalMeans={setLocalMeans}
          localMeansOther={localMeansOther}
          setLocalMeansOther={setLocalMeansOther}
          isEditing={isEditing}
          editingContent={editingContent}
          setEditingContent={setEditingContent}
          localConsiderationPeriod={localConsiderationPeriod}
          setLocalConsiderationPeriod={setLocalConsiderationPeriod}
          localExecutionPeriod={localExecutionPeriod}
          setLocalExecutionPeriod={setLocalExecutionPeriod}
          localMonetizationPeriod={localMonetizationPeriod}
          setLocalMonetizationPeriod={setLocalMonetizationPeriod}
          localCauseEffectCode={localCauseEffectCode}
          setLocalCauseEffectCode={setLocalCauseEffectCode}
          localMethodForDiagram={localMethod}
          localMeansForDiagram={localMeans}
          localObjectiveForDiagram={localObjective}
          isEditingCauseEffect={isEditingCauseEffect}
          setIsEditingCauseEffect={setIsEditingCauseEffect}
          setIsUpdateModalOpen={setIsUpdateModalOpen}
          setStartup={setStartup}
          localMonetizationDiagram={localMonetizationDiagram}
          setLocalMonetizationDiagram={setLocalMonetizationDiagram}
          isEditingMonetization={isEditingMonetization}
          setIsEditingMonetization={setIsEditingMonetization}
          setIsMonetizationUpdateModalOpen={setIsMonetizationUpdateModalOpen}
          localRelationDiagram={localRelationDiagram}
          setLocalRelationDiagram={setLocalRelationDiagram}
          isEditingRelation={isEditingRelation}
          setIsEditingRelation={setIsEditingRelation}
          setIsRelationUpdateModalOpen={setIsRelationUpdateModalOpen}
        />
      </div>

      {/* モーダル群 */}
      <StartupModals
        startup={startup}
        startupId={startupId}
        isUpdateModalOpen={isUpdateModalOpen}
        setIsUpdateModalOpen={setIsUpdateModalOpen}
        isMonetizationUpdateModalOpen={isMonetizationUpdateModalOpen}
        setIsMonetizationUpdateModalOpen={setIsMonetizationUpdateModalOpen}
        isRelationUpdateModalOpen={isRelationUpdateModalOpen}
        setIsRelationUpdateModalOpen={setIsRelationUpdateModalOpen}
        setStartup={setStartup}
        setLocalMethod={setLocalMethod}
        setLocalMeans={setLocalMeans}
        setLocalObjective={setLocalObjective}
        setLocalMonetizationDiagram={setLocalMonetizationDiagram}
        setLocalRelationDiagram={setLocalRelationDiagram}
      />

      {/* 個別トピック選択モーダル */}
      <TopicSelectModal
        isOpen={isTopicSelectModalOpen}
        onClose={() => setIsTopicSelectModalOpen(false)}
        localTopicIds={localTopicIds}
        setLocalTopicIds={setLocalTopicIds}
        organizationId={organizationId}
        startupId={startupId}
        allOrganizations={allOrganizations}
        allMeetingNotes={allMeetingNotes}
        orgTreeForModal={orgTreeForModal}
        onSave={handleManualSave}
        savingStatus={savingStatus}
        setSavingStatus={setSavingStatus}
        setStartup={setStartup}
      />
      
      {/* AI作文モーダル */}
      <AIGenerationModal
        isOpen={isAIGenerationModalOpen}
        onClose={() => setIsAIGenerationModalOpen(false)}
        target={aiGenerationTarget}
        topics={topics}
        localTopicIds={localTopicIds}
        selectedTopicIdsForAI={selectedTopicIdsForAI}
        setSelectedTopicIdsForAI={setSelectedTopicIdsForAI}
        aiGenerationInput={aiGenerationInput}
        setAIGenerationInput={setAIGenerationInput}
        aiSummaryFormat={aiSummaryFormat}
        setAiSummaryFormat={setAiSummaryFormat}
        aiSummaryLength={aiSummaryLength}
        setAiSummaryLength={setAiSummaryLength}
        aiCustomPrompt={aiCustomPrompt}
        setAiCustomPrompt={setAiCustomPrompt}
        aiGeneratedContent={aiGeneratedContent}
        originalContent={originalContent}
        setAiGeneratedContent={setAiGeneratedContent}
        setAiGeneratedTarget={setAiGeneratedTarget}
        setOriginalContent={setOriginalContent}
        localDescription={localDescription}
        localObjective={localObjective}
        localEvaluation={localEvaluation}
        setLocalDescription={setLocalDescription}
        setLocalObjective={setLocalObjective}
        setLocalEvaluation={setLocalEvaluation}
        setIsEditingDescription={setIsEditingDescription}
        setIsEditingObjective={setIsEditingObjective}
        setIsEditingEvaluation={setIsEditingEvaluation}
      />
    </Layout>
  );
}

export default function StartupDetailPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <p>データを読み込み中...</p>
        </div>
      </Layout>
    }>
      <StartupDetailPageContent />
    </Suspense>
  );
}
