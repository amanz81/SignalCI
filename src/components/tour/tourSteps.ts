import { TourStep } from './types';

export const homeTourSteps: TourStep[] = [
  {
    id: 'home-welcome',
    target: 'home-welcome',
    title: 'Welcome to SignalCI! 🎉',
    content: 'SignalCI is a CI/CD pipeline for trading signals. You can create visual pipelines that trigger from TradingView webhooks and execute step-by-step conditions before alerting you.',
    position: 'center',
    action: 'none',
  },
  {
    id: 'home-builder',
    target: 'home-builder',
    title: 'Pipeline Builder',
    content: 'Click here to create and configure your signal validation pipelines with a visual drag-and-drop editor. This is where you\'ll build your trading logic.',
    position: 'bottom',
    action: 'click',
  },
  {
    id: 'home-dashboard',
    target: 'home-dashboard',
    title: 'Dashboard',
    content: 'The dashboard shows all your pipelines, execution logs, and webhook URLs. You can monitor and manage everything from here.',
    position: 'bottom',
    action: 'click',
  },
];

export const dashboardTourSteps: TourStep[] = [
  {
    id: 'dashboard-header',
    target: 'dashboard-header',
    title: 'Your Pipelines Dashboard',
    content: 'This is where you can see all your pipelines at a glance. Each pipeline has its own webhook URL and execution status.',
    position: 'bottom',
    action: 'none',
  },
  {
    id: 'dashboard-create',
    target: 'dashboard-create',
    title: 'Create New Pipeline',
    content: 'Click this button to start building a new pipeline. You\'ll be taken to the visual builder where you can drag and drop nodes.',
    position: 'left',
    action: 'click',
  },
  {
    id: 'dashboard-pipeline',
    target: 'dashboard-pipeline',
    title: 'Pipeline Card',
    content: 'Each pipeline card shows the name, status (Active/Inactive), creation date, and webhook URL. Click "View Logs" to see execution history.',
    position: 'top',
    action: 'none',
  },
];

export const builderTourSteps: TourStep[] = [
  {
    id: 'builder-header',
    target: 'builder-header',
    title: 'Pipeline Builder',
    content: 'Welcome to the visual pipeline builder! Here you can create complex trading signal validation workflows by connecting different nodes.',
    position: 'bottom',
    action: 'none',
  },
  {
    id: 'builder-toolbar',
    target: 'builder-toolbar',
    title: 'Node Tools',
    content: 'This sidebar contains all available node types. Click on any node type to add it to your canvas. You can add Trigger, Wait, Condition, and Action nodes.',
    position: 'right',
    action: 'click',
  },
  {
    id: 'builder-canvas',
    target: 'builder-canvas',
    title: 'Canvas',
    content: 'This is your workspace. Drag nodes here and connect them by dragging from the bottom handle of one node to the top handle of another. Build your pipeline flow from left to right.',
    position: 'center',
    action: 'none',
  },
  {
    id: 'builder-save',
    target: 'builder-save',
    title: 'Save Pipeline',
    content: 'Once you\'ve built your pipeline, click here to save it. Make sure all nodes are properly connected before saving!',
    position: 'left',
    action: 'click',
  },
];

export const pipelineDetailTourSteps: TourStep[] = [
  {
    id: 'pipeline-info',
    target: 'pipeline-info',
    title: 'Pipeline Information',
    content: 'This section shows your pipeline details including name, status, and the webhook URL. Copy this URL to use in your TradingView alerts.',
    position: 'bottom',
    action: 'none',
  },
  {
    id: 'pipeline-executions',
    target: 'pipeline-executions',
    title: 'Execution Logs',
    content: 'Here you can see all execution logs for this pipeline. Each execution shows the status, current step, and detailed logs of what happened during the run.',
    position: 'top',
    action: 'none',
  },
];

