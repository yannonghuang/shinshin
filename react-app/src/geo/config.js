import { BrowserView, MobileView, isBrowser, isMobile } from 'react-device-detect';

export const chinaMapConfig = (configData) => {
  const { data, max, min, total, region } = configData;

  return {
    title: {
      // 标题组件
      text: (region ? region : '全国') + "欣欣学校分布图(总数：" + total + ")",
      // subtext: '数据来源于 xx平台',
      // sublink: 'http://www.census.gov/popest/data/datasets.html',
      left: "center",
      textStyle: {
        color: "#000"
      }
    },
    tooltip: {
      // 提示框
      trigger: "item",
      showDelay: 0,
      transitionDuration: 0.2,
      formatter: function (params) {
        let { data = {} } = params;
        let { value = 0 } = data;
        if (!params.name) return;
        return `${params.name}<br/>
                  学校数: ${value}`;
      }
    },
    visualMap: {
      // 视觉映射组件
      type: "continuous",
      left: "left",
      min: 0,
      max: max,
      inRange: {
        color: [
          "#e5f7ff",
          "#096dd9"
          // "#fedeb5",
          // "#f96a35",
          // "#c3380e",
          // "#942005"
          // '#5b1305'
        ]
      },
      text: [`最大值：${max}`, 0],
      textStyle: {
        color: "#000",
        fontSize: isMobile ? 9 : 12,
      },
      // calculable: true
      top: isMobile ? "30%" : "50%" // 距离顶部距离
    },
    toolbox: {
      // 工具导航
      show: true,
      left: "left",
      top: "top",
      feature: {
        // dataView: { readOnly: false },
        //restore: {},
        saveAsImage: isMobile ? null : {}
      }
    },
    dataset: {
      source: data
    },
    series: {
      // 地图,可以是数组，多个
      label: {
        show: true, //显示省市名称
        position: [1, 100], // 相对的百分比
        fontSize: isMobile ? 9 : 12,
        offset: [2, 0],
        align: "center",
        formatter: function (params) {
          let { data = {} } = params;
          let { value = 0 } = data;
          if (!params.name || !value) return isMobile ? '' : null;
          return isMobile ? `${value}` : `${params.name}-${value}`;
        }
      },
      itemStyle: {
        areaColor: "#fff" // 地图图形颜色
      },
      type: "map",
      //roam: true,
      map: region ? region : "china", //"china",
      zoom: 1.2, // 当前视角的缩放比例
      scaleLimit: {
        max: 2,
        min: 1 // 设置默认缩放效果
      },
      top: "10%" // 距离顶部距离

    }
  };
};
