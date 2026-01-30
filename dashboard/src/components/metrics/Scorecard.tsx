import type { Metrics } from '../../types';

interface ScorecardProps {
  metrics: Metrics;
}

export function Scorecard({ metrics }: ScorecardProps) {
  const statusColors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Weekly Scorecard</h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${statusColors[metrics.status]}`} />
          <span className="text-2xl font-bold text-gray-900">{metrics.score}/5</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Test Plan Shipped */}
        <MetricRow
          label="Test plan shipped"
          isBoolean
          value={metrics.testPlanShipped}
        />

        {/* Targets Added */}
        <MetricRow
          label="Targets added"
          current={metrics.targetsAdded}
          goal={metrics.targetGoal}
        />

        {/* Pipeline State Changes */}
        <MetricRow
          label="Pipeline state changes"
          current={metrics.pipelineStateChanges}
          goal={metrics.stateChangeGoal}
        />

        {/* Partner Conversations */}
        <MetricRow
          label="Partner conversations"
          current={metrics.partnerConversations}
          goal={metrics.partnerGoal}
        />

        {/* Exec Update Shipped */}
        <MetricRow
          label="Exec update shipped"
          isBoolean
          value={metrics.execUpdateShipped}
        />
      </div>
    </div>
  );
}

interface MetricRowProps {
  label: string;
  isBoolean?: boolean;
  value?: boolean;
  current?: number;
  goal?: number;
}

function MetricRow({ label, isBoolean, value, current, goal }: MetricRowProps) {
  if (isBoolean) {
    return (
      <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
        <span className="text-gray-700">{label}</span>
        <span className={`text-xl ${value ? 'text-green-600' : 'text-gray-300'}`}>
          {value ? '✓' : '○'}
        </span>
      </div>
    );
  }

  const percentage = goal ? Math.min((current || 0) / goal * 100, 100) : 0;
  const isOnTrack = current !== undefined && goal !== undefined && current >= goal;

  return (
    <div className="py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-700">{label}</span>
        <span className={`font-medium ${isOnTrack ? 'text-green-600' : 'text-gray-600'}`}>
          {current}/{goal}
          {isOnTrack && ' ✓'}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isOnTrack ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
