import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import moment from 'moment';

import styles from './styles.module.scss';

const NftStatsChart = ({ showLabel = true, data }) => {
  const [label, setLabel] = useState({});

  useEffect(() => {
    if (data) setLabel({ value: data[data?.length - 1], time: moment(data[data?.length - 1]?.periodTime).format('MMM Do YY') });
  }, [data]);

  const option = {
    grid: {
      width: '100%',
      height: 'auto',
      left: 0,
      bottom: 40,
    },
    dataZoom: {
      start: 0,
      end: 100,
      type: 'inside',
    },
    tooltip: {
      show: true,
      trigger: 'axis',
      alwaysShowContent: true,
      showContent: true,
      position: [5, 0],
      formatter(params) {
        if (showLabel) {
          const param = params[0];
          const info = { value: param.value, time: moment(param.axisValue).format('MMM Do YY') };
          // console.warn(info);
          return `<div><div class="chart-first-info">$${info.value}</div> <div class="chart-second-info">${info.time}</div></div>`;
        }
        return null;
      },
      className: 'echart-tooltip',
    },
    xAxis: {
      data: data?.map((i) => i?.periodTime),
      type: 'category',
      boundaryGap: true,
      splitLine: {
        show: false,
      },
      axisLabel: {
        formatter(value) {
          return moment(value).format('DD');
        },
      },
      axisLine: {
        show: false,
        lineStyle: {
          color: '#656872',
        },
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: {
      show: false,
      type: 'value',
    },
    series: [
      {
        name: 'Liquidity',
        type: 'line',
        symbol: 'none',
        sampling: 'lttb',
        itemStyle: {
          color: '#0e41f5',
        },
        lineStyle: { backgroundColor: '#0e41f5' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: '#aab6cc',
            },
            {
              offset: 1,
              color: '#e8f0fe',
            },
          ]),
        },
        data: data?.map((i) => i.tradeAmount),
      },
    ],
  };

  return (
    <div className={styles.echart}>
      {showLabel
      && (
      <div className={styles.default}>
        <div className="chart-first-info">${label.value}</div>
        <div className="chart-second-info">{label.time}</div>
      </div>
      )}
      <ReactECharts
        option={option}
        notMerge
        lazyUpdate
      />
    </div>
  );
};

export default NftStatsChart;
