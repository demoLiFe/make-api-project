import React from 'react';
import { Button, Dropdown, Modal, Switch, Typography, Select } from '@douyinfe/semi-ui';
import CompactModeToggle from '../../common/ui/CompactModeToggle';

const ChannelsActions = ({
  enableBatchDelete,
  batchDeleteChannels,
  setShowBatchSetTag,
  testAllChannels,
  fixChannelsAbilities,
  updateAllChannelsBalance,
  deleteAllDisabledChannels,
  applyAllUpstreamUpdates,
  detectAllUpstreamUpdates,
  detectAllUpstreamUpdatesLoading,
  applyAllUpstreamUpdatesLoading,
  compactMode,
  setCompactMode,
  idSort,
  setIdSort,
  setEnableBatchDelete,
  enableTagMode,
  setEnableTagMode,
  statusFilter,
  setStatusFilter,
  getFormValues,
  loadChannels,
  searchChannels,
  activeTypeKey,
  activePage,
  pageSize,
  setActivePage,
}) => {
  const t = (s) => s;

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex flex-col md:flex-row justify-between gap-2'>
        <div className='flex flex-wrap md:flex-nowrap items-center gap-2 w-full md:w-auto order-2 md:order-1'>
          <Button
            size='small'
            disabled={!enableBatchDelete}
            type='danger'
            className='w-full md:w-auto'
            onClick={() =>
              Modal.confirm({
                title: '确认删除所选通道？',
                content: '此操作不可撤销。',
                onOk: () => batchDeleteChannels(),
              })
            }
          >
            删除所选通道
          </Button>

          <Button
            size='small'
            disabled={!enableBatchDelete}
            type='tertiary'
            onClick={() => setShowBatchSetTag(true)}
            className='w-full md:w-auto'
          >
            批量设置标签
          </Button>

          <Dropdown
            size='small'
            trigger='click'
            render={
              <Dropdown.Menu>
                <Dropdown.Item>
                  <Button
                    size='small'
                    type='tertiary'
                    className='w-full'
                    loading={detectAllUpstreamUpdatesLoading}
                    disabled={detectAllUpstreamUpdatesLoading}
                    onClick={() =>
                      Modal.confirm({
                        title: '确认',
                        content: '确认要测试所有未手动禁用通道吗？',
                        onOk: () => testAllChannels(),
                        size: 'small',
                        centered: true,
                      })
                    }
                  >
                    测试所有未手动禁用通道
                  </Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Button
                    size='small'
                    className='w-full'
                    onClick={() =>
                      Modal.confirm({
                        title: '确认是否要修复数据库一致性？',
                        content: '执行该操作时，可能导致通道访问错误，请仅在数据库出现问题时使用。',
                        onOk: () => fixChannelsAbilities(),
                        size: 'sm',
                        centered: true,
                      })
                    }
                  >
                    修复数据库一致性
                  </Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Button
                    size='small'
                    type='secondary'
                    className='w-full'
                    onClick={() =>
                      Modal.confirm({
                        title: '确认',
                        content: '确认要更新所有已启用通道余额吗？',
                        onOk: () => updateAllChannelsBalance(),
                        size: 'sm',
                        centered: true,
                      })
                    }
                  >
                    更新所有已启用通道余额
                  </Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Button
                    size='small'
                    type='tertiary'
                    className='w-full'
                    onClick={() =>
                      Modal.confirm({
                        title: '确认',
                        content: '确认要仅检测全部通道上游模型更新吗？',
                        onOk: () => detectAllUpstreamUpdates(),
                        size: 'sm',
                        centered: true,
                      })
                    }
                  >
                    检测全部通道上游更新
                  </Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Button
                    size='small'
                    type='primary'
                    className='w-full'
                    loading={applyAllUpstreamUpdatesLoading}
                    disabled={applyAllUpstreamUpdatesLoading}
                    onClick={() =>
                      Modal.confirm({
                        title: '确认',
                        content: '确认要对全部通道执行上游模型更新吗？',
                        onOk: () => applyAllUpstreamUpdates(),
                        size: 'sm',
                        centered: true,
                      })
                    }
                  >
                    处理全部通道上游更新
                  </Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Button
                    size='small'
                    type='danger'
                    className='w-full'
                    onClick={() =>
                      Modal.confirm({
                        title: '确认是否要删除禁用通道？',
                        content: '此操作不可撤销。',
                        onOk: () => deleteAllDisabledChannels(),
                        size: 'sm',
                        centered: true,
                      })
                    }
                  >
                    删除禁用通道
                  </Button>
                </Dropdown.Item>
              </Dropdown.Menu>
            }
          >
            <span>
              <Button size='small' theme='light' type='tertiary' className='w-full md:w-auto'>
                批量操作
              </Button>
            </span>
          </Dropdown>

          <CompactModeToggle
            compactMode={compactMode}
            setCompactMode={setCompactMode}
            t={t}
          />
        </div>

        <div className='flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto order-1 md:order-2'>
          <div className='flex items-center justify-between w-full md:w-auto'>
            <Typography.Text strong className='mr-2'>
              使用 ID 排序
            </Typography.Text>
            <Switch
              size='small'
              checked={idSort}
              onChange={(v) => {
                localStorage.setItem('id-sort', v + '');
                setIdSort(v);
                const { searchKeyword, searchGroup, searchModel } = getFormValues();
                if (searchKeyword === '' && searchGroup === '' && searchModel === '') {
                  loadChannels(activePage, pageSize, v, enableTagMode);
                } else {
                  searchChannels(enableTagMode, activeTypeKey, statusFilter, activePage, pageSize, v);
                }
              }}
            />
          </div>

          <div className='flex items-center justify-between w-full md:w-auto'>
            <Typography.Text strong className='mr-2'>
              开启批量操作
            </Typography.Text>
            <Switch
              size='small'
              checked={enableBatchDelete}
              onChange={(v) => {
                localStorage.setItem('enable-batch-delete', v + '');
                setEnableBatchDelete(v);
              }}
            />
          </div>

          <div className='flex items-center justify-between w-full md:w-auto'>
            <Typography.Text strong className='mr-2'>
              标签聚合模式
            </Typography.Text>
            <Switch
              size='small'
              checked={enableTagMode}
              onChange={(v) => {
                localStorage.setItem('enable-tag-mode', v + '');
                setEnableTagMode(v);
                setActivePage(1);
                loadChannels(1, pageSize, idSort, v);
              }}
            />
          </div>

          <div className='flex items-center justify-between w-full md:w-auto'>
            <Typography.Text strong className='mr-2'>
              状态筛选
            </Typography.Text>
            <Select
              size='small'
              value={statusFilter}
              onChange={(v) => {
                localStorage.setItem('channel-status-filter', v);
                setStatusFilter(v);
                setActivePage(1);
                loadChannels(1, pageSize, idSort, enableTagMode, activeTypeKey, v);
              }}
            >
              <Select.Option value='all'>全部</Select.Option>
              <Select.Option value='enabled'>已启用</Select.Option>
              <Select.Option value='disabled'>已禁用</Select.Option>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelsActions;
