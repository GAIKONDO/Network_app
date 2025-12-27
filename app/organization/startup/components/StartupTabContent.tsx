'use client';

import React from 'react';
import OverviewTab from './tabs/OverviewTab';
import DetailsTab from './tabs/DetailsTab';
import PeriodsTab from './tabs/PeriodsTab';
import RelationsTab from './tabs/RelationsTab';
import MonetizationTab from './tabs/MonetizationTab';
import RelationTab from './tabs/RelationTab';
import type { StartupTab } from './StartupTabBar';
import type { Startup } from '@/lib/orgApi';

interface StartupTabContentProps {
  activeTab: StartupTab;
  organizationId: string;
  startup: Startup | null;
  startupId: string;
  // Overview Tab
  localAssignee: string[];
  setLocalAssignee: (assignee: string[]) => void;
  assigneeInputRef: React.RefObject<HTMLInputElement>;
  assigneeDropdownRef: React.RefObject<HTMLDivElement>;
  assigneeSearchQuery: string;
  setAssigneeSearchQuery: (query: string) => void;
  isAssigneeDropdownOpen: boolean;
  setIsAssigneeDropdownOpen: (open: boolean) => void;
  orgMembers: Array<{ id: string; name: string; position?: string }>;
  allOrgMembers: Array<{ id: string; name: string; position?: string; organizationId?: string }>;
  manualAssigneeInput: string;
  setManualAssigneeInput: (input: string) => void;
  localDescription: string;
  setLocalDescription: (description: string) => void;
  descriptionTextareaId: string;
  isEditingDescription: boolean;
  setIsEditingDescription: (editing: boolean) => void;
  setAIGenerationTarget: (target: 'description' | 'objective' | 'evaluation' | null) => void;
  setAIGenerationInput: (input: string) => void;
  setSelectedTopicIdsForAI: (ids: string[]) => void;
  setAiSummaryFormat: (format: 'auto' | 'bullet' | 'paragraph' | 'custom') => void;
  setAiSummaryLength: (length: number) => void;
  setAiCustomPrompt: (prompt: string) => void;
  setIsAIGenerationModalOpen: (open: boolean) => void;
  isAIGenerationModalOpen: boolean;
  aiGeneratedTarget: 'description' | 'objective' | 'evaluation' | null;
  aiGeneratedContent: string | null;
  originalContent: string | null;
  setAiGeneratedContent: (content: string | null) => void;
  setAiGeneratedTarget: (target: 'description' | 'objective' | 'evaluation' | null) => void;
  setOriginalContent: (content: string | null) => void;
  localObjective: string;
  setLocalObjective: (objective: string) => void;
  objectiveTextareaId: string;
  isEditingObjective: boolean;
  setIsEditingObjective: (editing: boolean) => void;
  localEvaluation: string;
  setLocalEvaluation: (evaluation: string) => void;
  evaluationTextareaId: string;
  isEditingEvaluation: boolean;
  setIsEditingEvaluation: (editing: boolean) => void;
  localEvaluationChart: any;
  setLocalEvaluationChart: (chart: any) => void;
  localEvaluationChartSnapshots: any[];
  setLocalEvaluationChartSnapshots: (snapshots: any[]) => void;
  isEditingChart: boolean;
  setIsEditingChart: (editing: boolean) => void;
  // Details Tab
  methodOptions: string[];
  localMethod: string[];
  setLocalMethod: (method: string[] | ((prev: string[]) => string[])) => void;
  localMethodOther: string;
  setLocalMethodOther: (methodOther: string) => void;
  meansOptions: string[];
  localMeans: string[];
  setLocalMeans: (means: string[] | ((prev: string[]) => string[])) => void;
  localMeansOther: string;
  setLocalMeansOther: (meansOther: string) => void;
  isEditing: boolean;
  editingContent: string;
  setEditingContent: (content: string) => void;
  // Periods Tab
  localConsiderationPeriod: string;
  setLocalConsiderationPeriod: (period: string) => void;
  localExecutionPeriod: string;
  setLocalExecutionPeriod: (period: string) => void;
  localMonetizationPeriod: string;
  setLocalMonetizationPeriod: (period: string) => void;
  // Relations Tab
  localCauseEffectCode: string;
  setLocalCauseEffectCode: (code: string) => void;
  localMethodForDiagram: string[];
  localMeansForDiagram: string[];
  localObjectiveForDiagram: string;
  isEditingCauseEffect: boolean;
  setIsEditingCauseEffect: (editing: boolean) => void;
  setIsUpdateModalOpen: (open: boolean) => void;
  // Monetization Tab
  setStartup: (startup: Startup) => void;
  localMonetizationDiagram: string;
  setLocalMonetizationDiagram: (diagram: string) => void;
  isEditingMonetization: boolean;
  setIsEditingMonetization: (editing: boolean) => void;
  setIsMonetizationUpdateModalOpen: (open: boolean) => void;
  // Relation Tab
  localRelationDiagram: string;
  setLocalRelationDiagram: (diagram: string) => void;
  isEditingRelation: boolean;
  setIsEditingRelation: (editing: boolean) => void;
  setIsRelationUpdateModalOpen: (open: boolean) => void;
}

export default function StartupTabContent({
  activeTab,
  organizationId,
  startup,
  startupId,
  localAssignee,
  setLocalAssignee,
  assigneeInputRef,
  assigneeDropdownRef,
  assigneeSearchQuery,
  setAssigneeSearchQuery,
  isAssigneeDropdownOpen,
  setIsAssigneeDropdownOpen,
  orgMembers,
  allOrgMembers,
  manualAssigneeInput,
  setManualAssigneeInput,
  localDescription,
  setLocalDescription,
  descriptionTextareaId,
  isEditingDescription,
  setIsEditingDescription,
  setAIGenerationTarget,
  setAIGenerationInput,
  setSelectedTopicIdsForAI,
  setAiSummaryFormat,
  setAiSummaryLength,
  setAiCustomPrompt,
  setIsAIGenerationModalOpen,
  isAIGenerationModalOpen,
  aiGeneratedTarget,
  aiGeneratedContent,
  originalContent,
  setAiGeneratedContent,
  setAiGeneratedTarget,
  setOriginalContent,
  localObjective,
  setLocalObjective,
  objectiveTextareaId,
  isEditingObjective,
  setIsEditingObjective,
  localEvaluation,
  setLocalEvaluation,
  evaluationTextareaId,
  isEditingEvaluation,
  setIsEditingEvaluation,
  localEvaluationChart,
  setLocalEvaluationChart,
  localEvaluationChartSnapshots,
  setLocalEvaluationChartSnapshots,
  isEditingChart,
  setIsEditingChart,
  methodOptions,
  localMethod,
  handleMethodToggle,
  localMethodOther,
  setLocalMethodOther,
  meansOptions,
  localMeans,
  handleMeansToggle,
  localMeansOther,
  setLocalMeansOther,
  isEditing,
  editingContent,
  setEditingContent,
  localConsiderationPeriod,
  setLocalConsiderationPeriod,
  localExecutionPeriod,
  setLocalExecutionPeriod,
  localMonetizationPeriod,
  setLocalMonetizationPeriod,
  localCauseEffectCode,
  setLocalCauseEffectCode,
  localMethodForDiagram,
  localMeansForDiagram,
  localObjectiveForDiagram,
  isEditingCauseEffect,
  setIsEditingCauseEffect,
  setIsUpdateModalOpen,
  setStartup,
  localMonetizationDiagram,
  setLocalMonetizationDiagram,
  isEditingMonetization,
  setIsEditingMonetization,
  setIsMonetizationUpdateModalOpen,
  localRelationDiagram,
  setLocalRelationDiagram,
  isEditingRelation,
  setIsEditingRelation,
  setIsRelationUpdateModalOpen,
}: StartupTabContentProps) {
  switch (activeTab) {
    case 'overview':
      return (
        <OverviewTab
          organizationId={organizationId}
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
        />
      );
      
    case 'details':
      return (
        <DetailsTab
          methodOptions={methodOptions}
          localMethod={localMethod}
          handleMethodToggle={(method: string) => {
            setLocalMethod(prev => 
              prev.includes(method) 
                ? prev.filter(m => m !== method)
                : [...prev, method]
            );
          }}
          localMethodOther={localMethodOther}
          setLocalMethodOther={setLocalMethodOther}
          meansOptions={meansOptions}
          localMeans={localMeans}
          handleMeansToggle={(means: string) => {
            setLocalMeans(prev => 
              prev.includes(means) 
                ? prev.filter(m => m !== means)
                : [...prev, means]
            );
          }}
          localMeansOther={localMeansOther}
          setLocalMeansOther={setLocalMeansOther}
          isEditing={isEditing}
          editingContent={editingContent}
          setEditingContent={setEditingContent}
        />
      );
      
    case 'periods':
      return (
        <PeriodsTab
          localConsiderationPeriod={localConsiderationPeriod}
          setLocalConsiderationPeriod={setLocalConsiderationPeriod}
          localExecutionPeriod={localExecutionPeriod}
          setLocalExecutionPeriod={setLocalExecutionPeriod}
          localMonetizationPeriod={localMonetizationPeriod}
          setLocalMonetizationPeriod={setLocalMonetizationPeriod}
        />
      );
      
    case 'relations':
      if (!startup) return null;
      return (
        <RelationsTab
          startup={startup}
          localCauseEffectCode={localCauseEffectCode}
          setLocalCauseEffectCode={setLocalCauseEffectCode}
          localMethod={localMethodForDiagram}
          localMeans={localMeansForDiagram}
          localObjective={localObjectiveForDiagram}
          isEditingCauseEffect={isEditingCauseEffect}
          setIsEditingCauseEffect={setIsEditingCauseEffect}
          setIsUpdateModalOpen={setIsUpdateModalOpen}
        />
      );
      
    case 'monetization':
      return (
        <MonetizationTab
          startup={startup}
          setStartup={setStartup}
          startupId={startupId}
          localMonetizationDiagram={localMonetizationDiagram}
          setLocalMonetizationDiagram={setLocalMonetizationDiagram}
          isEditingMonetization={isEditingMonetization}
          setIsEditingMonetization={setIsEditingMonetization}
          setIsMonetizationUpdateModalOpen={setIsMonetizationUpdateModalOpen}
        />
      );
      
    case 'relation':
      return (
        <RelationTab
          startup={startup}
          setStartup={setStartup}
          startupId={startupId}
          localRelationDiagram={localRelationDiagram}
          setLocalRelationDiagram={setLocalRelationDiagram}
          isEditingRelation={isEditingRelation}
          setIsEditingRelation={setIsEditingRelation}
          setIsRelationUpdateModalOpen={setIsRelationUpdateModalOpen}
        />
      );
      
    default:
      return null;
  }
}

