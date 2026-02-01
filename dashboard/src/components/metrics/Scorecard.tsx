import type { Metrics } from '../../types';
import { Check, Circle, TrendingUp, Users, FileText, Target } from 'lucide-react';

interface ScorecardProps {
  metrics: Metrics;
  compact?: boolean;
  className?: string;
  bodyClassName?: string;
}

export function Scorecard({ metrics, compact = false, className, bodyClassName }: ScorecardProps) {
  const statusColors = {
    green: { bg: 'bg-emerald-500', ring: '#10b981', text: 'text-emerald-600' },
    yellow: { bg: 'bg-amber-500', ring: '#f59e0b', text: 'text-amber-600' },
    red: { bg: 'bg-red-500', ring: '#ef4444', text: 'text-red-600' },
  };

  const status = statusColors[metrics.status];
  const scorePercentage = (metrics.score / 5) * 100;

  const headerPadding = compact ? 'p-4' : 'p-5';
  const rowPadding = compact ? 'px-4 py-2.5' : 'px-5 py-3.5';
  const progressPadding = compact ? 'px-4 py-2.5' : 'px-5 py-3.5';

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className || ''}`}>
      {/* Header with Score */}
      <div className={`${headerPadding} border-b border-gray-100`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 tracking-tight">Weekly Scorecard</h2>
            <p className="text-xs text-gray-500 mt-0.5">Track your weekly goals</p>
          </div>
          <div className="flex items-center gap-3">
            <ScoreRing score={metrics.score} percentage={scorePercentage} color={status.ring} />
          </div>
        </div>
      </div>

      {/* Metrics List */}
      <div className={`divide-y divide-gray-100 ${bodyClassName || ''}`}>
        <BooleanMetric
          icon={<FileText className="w-4 h-4" />}
          label="Test plan shipped"
          value={metrics.testPlanShipped}
          className={rowPadding}
        />

        <ProgressMetric
          icon={<Target className="w-4 h-4" />}
          label="Targets added"
          current={metrics.targetsAdded}
          goal={metrics.targetGoal}
          className={progressPadding}
        />

        <ProgressMetric
          icon={<TrendingUp className="w-4 h-4" />}
          label="Pipeline state changes"
          current={metrics.pipelineStateChanges}
          goal={metrics.stateChangeGoal}
          className={progressPadding}
        />

        <ProgressMetric
          icon={<Users className="w-4 h-4" />}
          label="Partner conversations"
          current={metrics.partnerConversations}
          goal={metrics.partnerGoal}
          className={progressPadding}
        />

        <BooleanMetric
          icon={<FileText className="w-4 h-4" />}
          label="Exec update shipped"
          value={metrics.execUpdateShipped}
          className={rowPadding}
        />
      </div>
    </div>
  );
}

interface ScoreRingProps {
  score: number;
  percentage: number;
  color: string;
}

function ScoreRing({ score, percentage, color }: ScoreRingProps) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-16 h-16">
      <svg className="w-16 h-16 progress-ring" viewBox="0 0 64 64">
        {/* Background circle */}
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="4"
        />
        {/* Progress circle */}
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="progress-ring-circle"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-gray-900">{score}</span>
        <span className="text-xs text-gray-400">/5</span>
      </div>
    </div>
  );
}

interface BooleanMetricProps {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  className?: string;
}

function BooleanMetric({ icon, label, value, className }: BooleanMetricProps) {
  return (
    <div className={`flex items-center gap-3 ${className || 'px-5 py-3.5'}`}>
      <div className={`
        w-8 h-8 rounded-lg flex items-center justify-center
        ${value ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}
      `}>
        {icon}
      </div>
      <span className="flex-1 text-sm text-gray-700">{label}</span>
      <div className={`
        w-6 h-6 rounded-full flex items-center justify-center
        ${value ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'}
      `}>
        {value ? (
          <Check className="w-3.5 h-3.5" strokeWidth={3} />
        ) : (
          <Circle className="w-3 h-3" />
        )}
      </div>
    </div>
  );
}

interface ProgressMetricProps {
  icon: React.ReactNode;
  label: string;
  current: number;
  goal: number;
  className?: string;
}

function ProgressMetric({ icon, label, current, goal, className }: ProgressMetricProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  const isComplete = current >= goal;

  return (
    <div className={className || 'px-5 py-3.5'}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`
          w-8 h-8 rounded-lg flex items-center justify-center
          ${isComplete ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}
        `}>
          {icon}
        </div>
        <span className="flex-1 text-sm text-gray-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${isComplete ? 'text-emerald-600' : 'text-gray-600'}`}>
            {current}/{goal}
          </span>
          {isComplete && (
            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
              <Check className="w-3 h-3" strokeWidth={3} />
            </div>
          )}
        </div>
      </div>
      <div className="ml-11">
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isComplete ? 'bg-emerald-500' : 'bg-indigo-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
