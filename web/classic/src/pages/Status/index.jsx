import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Tooltip } from '@douyinfe/semi-ui';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Gauge,
  RefreshCw,
  Server,
  Timer,
  XCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API } from '../../helpers';

const PERIODS = [1, 7, 15, 30];
const REFRESH_INTERVAL = 60_000;
const EMPTY_STATUS_DATA = { models: [], updated_at: null };

const statusMeta = {
  operational: {
    label: '运行正常',
    icon: CheckCircle2,
  },
  degraded: {
    label: '性能下降',
    icon: AlertTriangle,
  },
  incident: {
    label: '服务故障',
    icon: XCircle,
  },
  unknown: {
    label: '数据采集中',
    icon: Clock3,
  },
};

function getProvider(modelName) {
  const value = modelName.toLowerCase();
  if (value.includes('claude')) return { name: 'Anthropic', mark: 'A' };
  if (value.includes('gemini')) return { name: 'Google', mark: 'G' };
  if (value.includes('deepseek')) return { name: 'DeepSeek', mark: 'D' };
  if (value.includes('qwen') || value.includes('qwq')) {
    return { name: 'Qwen', mark: 'Q' };
  }
  if (value.includes('grok')) return { name: 'xAI', mark: 'X' };
  if (value.includes('glm')) return { name: 'Zhipu AI', mark: 'Z' };
  if (value.includes('llama')) return { name: 'Meta', mark: 'M' };
  if (value.includes('gpt') || value.includes('o1') || value.includes('o3')) {
    return { name: 'OpenAI', mark: 'O' };
  }
  return { name: 'Model API', mark: modelName.slice(0, 1).toUpperCase() };
}

function formatLatency(value) {
  if (!Number.isFinite(value)) return '--';
  if (value >= 1000) return `${(value / 1000).toFixed(1)}s`;
  return `${Math.round(value)}ms`;
}

function formatTime(timestamp) {
  if (!timestamp) return '--';
  return new Intl.DateTimeFormat(undefined, {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp * 1000));
}

function barStatus(point) {
  if (!point.has_data) return 'empty';
  if (point.success_rate >= 95) return 'operational';
  if (point.success_rate >= 80) return 'degraded';
  return 'incident';
}

function ModelCard({ model, t }) {
  const meta = statusMeta[model.status] || statusMeta.unknown;
  const StatusIcon = meta.icon;
  const provider = getProvider(model.model_name);

  return (
    <article className='model-status-card'>
      <div className='model-status-card-head'>
        <div className='model-status-identity'>
          <div className='model-status-provider-mark' aria-hidden='true'>
            {provider.mark}
          </div>
          <div className='model-status-name-wrap'>
            <h2 title={model.model_name}>{model.model_name}</h2>
            <span>{provider.name}</span>
          </div>
        </div>
        <div className={`model-status-badge is-${model.status}`}>
          <StatusIcon size={14} />
          <span>{t(meta.label)}</span>
        </div>
      </div>

      <div className='model-status-metrics'>
        <div>
          <span>{t('可用率')}</span>
          <strong>{model.availability.toFixed(2)}%</strong>
        </div>
        <div>
          <span>{t('平均延迟')}</span>
          <strong>{formatLatency(model.avg_latency_ms)}</strong>
        </div>
        <div>
          <span>{t('平均 TPS')}</span>
          <strong>{model.avg_tps.toFixed(2)}</strong>
        </div>
      </div>

      <div className='model-status-bars' aria-label={t('服务可用性')}>
        {model.recent.map((point) => {
          const pointStatus = barStatus(point);
          const title = point.has_data
            ? `${formatTime(point.ts)} · ${point.success_rate.toFixed(2)}%`
            : `${formatTime(point.ts)} · ${t('暂无数据')}`;
          return (
            <span
              key={point.ts}
              className={`model-status-bar is-${pointStatus}`}
              title={title}
            />
          );
        })}
      </div>
      <div className='model-status-range'>
        <span>{formatTime(model.recent[0]?.ts)}</span>
        <span>{formatTime(model.recent[model.recent.length - 1]?.ts)}</span>
      </div>
    </article>
  );
}

function StatusSkeleton() {
  return (
    <div className='model-status-grid' aria-hidden='true'>
      {[0, 1, 2, 3, 4, 5].map((item) => (
        <div className='model-status-card model-status-skeleton' key={item}>
          <span className='status-skeleton-line is-title' />
          <span className='status-skeleton-line is-metric' />
          <span className='status-skeleton-line is-bars' />
        </div>
      ))}
    </div>
  );
}

function InfrastructureStatus({ groups, t }) {
  const visibleGroups = groups.filter((group) => group.monitors?.length > 0);
  if (visibleGroups.length === 0) return null;

  return (
    <section className='infrastructure-status-section'>
      <div className='model-status-section-title'>
        <Server size={18} />
        <h2>{t('基础设施')}</h2>
      </div>
      <div className='infrastructure-status-grid'>
        {visibleGroups.map((group) => (
          <div className='infrastructure-status-group' key={group.categoryName}>
            <h3>{group.categoryName}</h3>
            <div className='infrastructure-status-list'>
              {group.monitors.map((monitor, index) => (
                <div
                  className='infrastructure-status-row'
                  key={`${monitor.name}-${index}`}
                >
                  <span
                    className={`infrastructure-status-dot ${monitor.status === 1 ? 'is-up' : 'is-down'}`}
                  />
                  <span className='infrastructure-status-name'>
                    {monitor.name}
                  </span>
                  <strong>{(monitor.uptime * 100).toFixed(2)}%</strong>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function StatusPage() {
  const { t } = useTranslation();
  const [days, setDays] = useState(1);
  const [data, setData] = useState(null);
  const [uptimeGroups, setUptimeGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [gatewayLatency, setGatewayLatency] = useState(null);
  const hasLoadedAvailabilityRef = useRef(false);

  const loadData = useCallback(
    async (showLoading = false) => {
      if (showLoading) setLoading(true);
      else setRefreshing(true);
      setError(false);
      const startedAt = performance.now();

      const availabilityRequest = API.get('/api/status/availability', {
        params: { days },
        skipErrorHandler: true,
        disableDuplicate: true,
      }).then((response) => ({
        response,
        latency: Math.round(performance.now() - startedAt),
      }));

      const [availabilityResult, uptimeResult] = await Promise.allSettled([
        availabilityRequest,
        API.get('/api/uptime/status', {
          skipErrorHandler: true,
          disableDuplicate: true,
        }),
      ]);

      if (
        availabilityResult.status === 'fulfilled' &&
        availabilityResult.value.response.data?.success
      ) {
        hasLoadedAvailabilityRef.current = true;
        setData(availabilityResult.value.response.data.data || EMPTY_STATUS_DATA);
        setGatewayLatency(availabilityResult.value.latency);
        setError(false);
      } else {
        setError(!hasLoadedAvailabilityRef.current);
      }

      if (
        uptimeResult.status === 'fulfilled' &&
        uptimeResult.value.data?.success
      ) {
        setUptimeGroups(uptimeResult.value.data.data || []);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [days],
  );

  useEffect(() => {
    loadData(true);
    const timer = window.setInterval(() => loadData(false), REFRESH_INTERVAL);
    return () => window.clearInterval(timer);
  }, [loadData]);

  useEffect(() => {
    if (!error) return undefined;
    const retryTimer = window.setTimeout(() => loadData(false), 5_000);
    return () => window.clearTimeout(retryTimer);
  }, [error, loadData]);

  const overallStatus = useMemo(() => {
    if (!data?.models?.length) return 'unknown';
    if (data.models.some((model) => model.status === 'incident')) {
      return 'incident';
    }
    if (data.models.some((model) => model.status === 'degraded')) {
      return 'degraded';
    }
    return 'operational';
  }, [data]);

  const overallLabel = {
    operational: '所有模型运行正常',
    degraded: '部分模型性能下降',
    incident: '模型服务存在故障',
    unknown: '等待监测数据',
  }[overallStatus];
  const OverallIcon = statusMeta[overallStatus].icon;

  return (
    <main className='model-status-page home-hero'>
      <div className='home-hero-orbit home-hero-orbit-left' />
      <div className='home-hero-orbit home-hero-orbit-right' />
      <div className='home-hero-building home-hero-building-left'>
        <span />
        <span />
        <span />
      </div>
      <div className='home-hero-building home-hero-building-right'>
        <span />
        <span />
        <span />
      </div>
      <div className='home-hero-rays' />
      <div className='model-status-page-inner'>
        <section className='model-status-overview'>
          <div className='model-status-overview-main'>
            <div className='model-status-title-row'>
              <Activity size={24} />
              <h1>{t('模型服务状态')}</h1>
            </div>
            <div className={`model-status-overall is-${overallStatus}`}>
              <OverallIcon size={18} />
              <strong>{t(overallLabel)}</strong>
            </div>
          </div>

          <div className='model-status-meta'>
            <span>
              <Timer size={15} />
              {t('网关延迟')}{' '}
              {gatewayLatency === null ? '--' : `${gatewayLatency}ms`}
            </span>
            <span>
              <Clock3 size={15} />
              {t('更新时间')} {formatTime(data?.updated_at)}
            </span>
          </div>
        </section>

        <div className='model-status-toolbar'>
          <div className='model-status-periods' role='group'>
            {PERIODS.map((period) => (
              <button
                type='button'
                key={period}
                className={days === period ? 'is-active' : ''}
                onClick={() => setDays(period)}
                aria-pressed={days === period}
              >
                {period === 1 ? `24 ${t('小时')}` : `${period} ${t('天')}`}
              </button>
            ))}
          </div>
          <Tooltip content={t('刷新')}>
            <Button
              className='model-status-refresh'
              icon={<RefreshCw size={16} />}
              theme='borderless'
              loading={refreshing}
              onClick={() => loadData(false)}
              aria-label={t('刷新')}
            />
          </Tooltip>
        </div>

        {loading ? (
          <StatusSkeleton />
        ) : error && !data ? (
          <div className='model-status-message is-error'>
            <XCircle size={30} />
            <strong>{t('请求状态数据失败')}</strong>
            <Button onClick={() => loadData(true)}>{t('重试')}</Button>
          </div>
        ) : data?.models?.length ? (
          <div className='model-status-grid'>
            {data.models.map((model) => (
              <ModelCard key={model.model_name} model={model} t={t} />
            ))}
          </div>
        ) : (
          <div className='model-status-message'>
            <Gauge size={34} />
            <strong>{t('监测数据正在积累')}</strong>
            <span>{t('暂无数据')}</span>
          </div>
        )}

        <InfrastructureStatus groups={uptimeGroups} t={t} />
      </div>
    </main>
  );
}
