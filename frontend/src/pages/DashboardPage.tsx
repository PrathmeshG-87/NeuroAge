import React, { useEffect, useState } from 'react'
import {
  ArrowRight,
  Brain,
  CalendarDays,
  CircleAlert,
  Clock3,
  Database,
  FileText,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import {
  fetchDashboardData,
  type DashboardAssessmentRecord,
  type DashboardData,
  type DashboardScenario,
  type DashboardSummaryCard,
} from '@/data/dashboard'

const scenarioOptions: { value: DashboardScenario; label: string }[] = [
  { value: 'demo', label: 'Demo data' },
  { value: 'empty', label: 'Empty state' },
  { value: 'error', label: 'Error state' },
]

const toneMap: Record<DashboardSummaryCard['tone'], string> = {
  teal: 'bg-[#5eead4]/12 text-[#5eead4] border border-[#5eead4]/30',
  coral: 'bg-[#fb923c]/12 text-[#fb923c] border border-[#fb923c]/30',
  info: 'bg-[#60a5fa]/12 text-[#60a5fa] border border-[#60a5fa]/30',
  neutral: 'bg-white/8 text-[#c6c9d2] border border-white/10',
}

const statusMap = {
  accelerated: 'coral',
  typical: 'neutral',
  resilient: 'teal',
} as const

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/[0.08] bg-[#111217] p-6">
        <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
        <div className="mt-4 h-9 w-80 animate-pulse rounded bg-white/10" />
        <div className="mt-3 h-4 w-96 animate-pulse rounded bg-white/10" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-[24px] border border-white/[0.08] bg-[#111217]"
          />
        ))}
      </div>

      <div className="h-80 animate-pulse rounded-[28px] border border-white/[0.08] bg-[#111217]" />
    </div>
  )
}

function SummaryCard({ item }: { item: DashboardSummaryCard }) {
  const icon =
    item.id === 'predicted-brain-age' ? (
      <Brain className="h-4 w-4" />
    ) : item.id === 'brain-age-difference' ? (
      <Clock3 className="h-4 w-4" />
    ) : item.id === 'total-assessments' ? (
      <FileText className="h-4 w-4" />
    ) : (
      <CalendarDays className="h-4 w-4" />
    )

  return (
    <Card className="flex min-h-[160px] flex-col justify-between rounded-[24px] border border-white/[0.08] bg-[#111217]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#8d909c]">
          {item.label}
        </span>
        <span
          className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${toneMap[item.tone]}`}
        >
          {icon}
        </span>
      </div>

      <div className="mt-5 text-3xl font-semibold tracking-[-0.06em] text-[#ebecef]">
        {item.value}
      </div>
      <div className="mt-3 text-sm text-[#c6c9d2]">{item.footnote}</div>
    </Card>
  )
}

function ComparisonChart({ data }: { data: DashboardData['comparison'] }) {
  if (data.length === 0) {
    return (
      <Card className="rounded-[28px] border border-white/[0.08] bg-[#111217] p-6">
        <div className="flex items-center gap-3 text-[#c6c9d2]">
          <Database className="h-5 w-5 text-[#5eead4]" />
          <span>No comparison data is available for this dataset yet.</span>
        </div>
      </Card>
    )
  }

  return (
    <Card className="rounded-[28px] border border-white/[0.08] bg-[#111217] p-4 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#5eead4]">
            Comparison overview
          </h3>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#ebecef]">
            Chronological vs predicted brain age
          </h3>
        </div>
        <Badge variant="neutral">Demonstration data only</Badge>
      </div>

      <div
        className="h-72 w-full"
        role="img"
        aria-label="Bar chart comparing chronological age and predicted brain age across the selected cohort."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 12, right: 12, left: 0, bottom: 12 }}
          >
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#8d909c', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#8d909c', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              contentStyle={{
                backgroundColor: '#171921',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px',
                color: '#ebecef',
              }}
            />
            <Legend wrapperStyle={{ color: '#c6c9d2', fontSize: '12px' }} />
            <Bar
              dataKey="chronologicalAge"
              name="Chronological age"
              fill="#8d909c"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="predictedBrainAge"
              name="Predicted brain age"
              fill="#5eead4"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <Card className="rounded-[28px] border border-dashed border-white/[0.1] bg-[#111217] p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#5eead4]/25 bg-[#5eead4]/10 text-[#5eead4]">
        <Database className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-[#ebecef]">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-[#c6c9d2]">{detail}</p>
    </Card>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card className="rounded-[28px] border border-[#ef4444]/25 bg-[#ef4444]/8 p-7">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border border-[#ef4444]/25 bg-[#ef4444]/10 text-[#ef4444]">
          <CircleAlert className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-[#ebecef]">
            Unable to load dashboard data
          </h3>
          <p className="mt-2 text-sm leading-7 text-[#c6c9d2]">{message}</p>
        </div>
      </div>
    </Card>
  )
}

export const DashboardPage: React.FC = () => {
  const [scenario, setScenario] = useState<DashboardScenario>('demo')
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleScenarioChange = (nextScenario: DashboardScenario) => {
    setScenario(nextScenario)
    setIsLoading(true)
    setError(null)
  }

  useEffect(() => {
    let active = true

    const request = async () => {
      try {
        const result = await fetchDashboardData(scenario)
        if (!active) return
        setData(result)
      } catch (loadError) {
        if (!active) return
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unknown error loading dashboard data.',
        )
        setData(null)
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    window.setTimeout(request, 350)
    return () => {
      active = false
    }
  }, [scenario])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-[28px] border border-white/[0.08] bg-[#111217] p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#5eead4]">
                Dashboard status
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-[#ebecef]">
                Dashboard load failed
              </h1>
            </div>
            <div className="flex gap-2">
              {scenarioOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleScenarioChange(option.value)}
                  className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5eead4] ${
                    scenario === option.value
                      ? 'border-[#5eead4]/35 bg-[#5eead4]/12 text-[#5eead4]'
                      : 'border-white/10 bg-[#0a0b0e] text-[#c6c9d2]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <ErrorState message={error} />
      </div>
    )
  }

  if (!data) {
    return (
      <EmptyState
        title="No dashboard data"
        detail="A dashboard payload was not returned for the selected scenario."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] border border-white/[0.08] bg-[#111217] p-6 sm:p-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#5eead4]">
              NeuroAge dashboard
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-[#ebecef] sm:text-4xl">
              {data.heading}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#c6c9d2]">
              {data.overview}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {scenarioOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleScenarioChange(option.value)}
                className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5eead4] ${
                  scenario === option.value
                    ? 'border-[#5eead4]/35 bg-[#5eead4]/12 text-[#5eead4]'
                    : 'border-white/10 bg-[#0a0b0e] text-[#c6c9d2]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#fb923c]/25 bg-[#fb923c]/10 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-[#fb923c]">
            <Sparkles className="h-3.5 w-3.5" />
            {data.demoNotice}
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5eead4] px-4 py-2.5 text-sm font-medium text-[#0a0b0e] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#7feee0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5eead4]"
          >
            Start new MRI assessment
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.summary.map((item) => (
          <SummaryCard key={item.id} item={item} />
        ))}
      </div>

      <ComparisonChart data={data.comparison} />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-[28px] border border-white/[0.08] bg-[#111217] p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#5eead4]">
                Assessment history
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#ebecef]">
                Recent records
              </h3>
            </div>
            <Badge variant="neutral">{data.assessments.length} records</Badge>
          </div>

          {data.assessments.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="No assessments yet"
                detail="Once scans are uploaded or imported, their records will appear here with a summary of the predicted and chronological ages."
              />
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm text-[#c6c9d2]">
                <thead className="border-b border-white/[0.08] text-[11px] font-mono uppercase tracking-[0.18em] text-[#8d909c]">
                  <tr>
                    <th className="pb-3 pr-4">ID</th>
                    <th className="pb-3 pr-4">Subject</th>
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Chrono</th>
                    <th className="pb-3 pr-4">Predicted</th>
                    <th className="pb-3 pr-4">Difference</th>
                    <th className="pb-3 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.assessments.map(
                    (assessment: DashboardAssessmentRecord) => (
                      <tr
                        key={assessment.id}
                        className="border-b border-white/[0.04] last:border-b-0"
                      >
                        <td className="py-3 pr-4 font-medium text-[#ebecef]">
                          {assessment.id}
                        </td>
                        <td className="py-3 pr-4">{assessment.subjectId}</td>
                        <td className="py-3 pr-4">
                          {formatDate(assessment.assessmentDate)}
                        </td>
                        <td className="py-3 pr-4">
                          {assessment.chronologicalAge.toFixed(1)} yrs
                        </td>
                        <td className="py-3 pr-4 text-[#5eead4]">
                          {assessment.predictedBrainAge.toFixed(1)} yrs
                        </td>
                        <td className="py-3 pr-4 text-[#fb923c]">
                          {assessment.brainAgeDifference > 0 ? '+' : ''}
                          {assessment.brainAgeDifference.toFixed(1)} yrs
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={statusMap[assessment.status]}>
                            {assessment.status}
                          </Badge>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="rounded-[28px] border border-white/[0.08] bg-[#111217] p-4 sm:p-6">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#5eead4]">
              Model performance
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#ebecef]">
              Evaluation summary
            </h3>
          </div>

          {data.modelMetrics.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/[0.1] bg-[#0a0b0e] p-5 text-sm leading-7 text-[#c6c9d2]">
              No verified evaluation metrics are currently available for this
              dashboard. Connect the evaluation service to populate reported
              metrics and validation notes.
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {data.modelMetrics.map((metric) => (
                <div
                  key={metric.name}
                  className="rounded-2xl border border-white/[0.08] bg-[#0a0b0e] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-[#ebecef]">
                      {metric.name}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-1 text-[10px] font-mono uppercase tracking-[0.14em] ${
                        metric.status === 'good'
                          ? 'border-[#5eead4]/25 bg-[#5eead4]/10 text-[#5eead4]'
                          : metric.status === 'warning'
                            ? 'border-[#fb923c]/25 bg-[#fb923c]/10 text-[#fb923c]'
                            : 'border-white/10 bg-white/5 text-[#c6c9d2]'
                      }`}
                    >
                      {metric.status}
                    </span>
                  </div>
                  <div className="mt-3 text-2xl font-semibold tracking-[-0.06em] text-[#ebecef]">
                    {metric.value}
                  </div>
                  <p className="mt-2 text-sm text-[#8d909c]">{metric.detail}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="rounded-[28px] border border-white/[0.08] bg-[#111217] p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#5eead4]/25 bg-[#5eead4]/10 text-[#5eead4]">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#5eead4]">
              Educational context
            </p>
            <h3 className="mt-1 text-xl font-semibold tracking-[-0.04em] text-[#ebecef]">
              Brain age difference and uncertainty
            </h3>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {data.educationNotes.map((note) => (
            <div
              key={note}
              className="rounded-2xl border border-white/[0.08] bg-[#0a0b0e] p-4 text-sm leading-7 text-[#c6c9d2]"
            >
              {note}
            </div>
          ))}
        </div>
      </Card>

      <div className="rounded-[28px] border border-[#5eead4]/20 bg-[#5eead4]/8 p-5 text-sm leading-7 text-[#c6c9d2]">
        <span className="font-medium text-[#ebecef]">Important:</span> This
        dashboard is for research and educational interpretation only. The
        displayed values are demonstration data and should not be treated as
        personal medical information.
      </div>
    </div>
  )
}
