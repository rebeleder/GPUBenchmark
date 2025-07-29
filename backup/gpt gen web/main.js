fetch('data.json')
    .then(response => response.json())
    .then(data => {
        const chartDom = document.getElementById('main');

        // 根据数据条目数计算合适的图表高度
        const itemCount = Object.keys(data).length;
        const itemHeight = 30; // 每个条目的最小高度
        const minHeight = 400; // 最小图表高度
        const calculatedHeight = Math.max(minHeight, itemCount * itemHeight);

        // 设置容器高度
        chartDom.style.height = calculatedHeight + 'px';

        const myChart = echarts.init(chartDom);

        // 让图表自适应窗口大小
        window.addEventListener('resize', () => myChart.resize());

        const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
        const names = entries.map(e => e[0]);
        const scores = entries.map(e => e[1]);

        // 创建可搜索的列表
        const searchableList = document.getElementById('searchable-list');
        searchableList.innerHTML = names.map(name => `<div>${name}</div>`).join('');

        // 计算基准分数（GTX 1060 6GB的分数）
        const baseScore = 4203; // GTX 1060 6GB的固定分数

        const option = {
            backgroundColor: 'transparent',
            // tooltip: {
            //     trigger: 'axis',
            //     axisPointer: {
            //         type: 'shadow',
            //         shadowStyle: {
            //             color: 'rgba(255, 235, 113, 0.1)'  // 淡黄色的阴影，对应标题颜色
            //         }
            //     },
            //     backgroundColor: 'rgba(0, 0, 0, 0.85)',  // 深色半透明背景
            //     borderColor: '#fdeb71',  // 淡黄色边框
            //     borderWidth: 1,
            //     textStyle: {
            //         color: '#fdeb71',  // 淡黄色文字
            //         fontSize: 14
            //     },
            //     padding: [10, 15]  // 增加内边距使显示更清晰
            // },
            grid: {
                left: '8%',
                right: '8%',
                top: '40',     // 为顶部刻度留出空间
                bottom: '20',   // 为底部留出空间
                containLabel: true
            },
            xAxis: {
                type: 'value',
                min: 0,
                max: 50000,
                splitNumber: 8,
                position: 'top',      // 将坐标轴移到顶部
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: '#888888'
                    }
                },
                axisLabel: {
                    color: '#fdeb71',
                    fontSize: 12
                },
                axisLine: {
                    lineStyle: { color: '#fdeb71' }
                }
            },
            yAxis: {
                type: 'category',
                data: names,
                inverse: true,
                axisLabel: {
                    color: '#ffffffff',
                    fontSize: 13,
                    lineHeight: 0,
                    margin: 2
                },
                axisTick: { show: false },
                axisLine: { show: false },
                boundaryGap: true,  // 边界间隙
                splitArea: { show: false },  // 不显示分隔区域
                splitLine: { show: false }   // 不显示分隔线
            },
            series: [
                {
                    type: 'bar',
                    data: scores.map((score, index) => ({
                        value: score,
                        name: names[index]
                    })),
                    barWidth: 18,               // 稍微加宽条形以容纳标签
                    barCategoryGap: '0%',       // 移除条目间距
                    large: true,                // 启用大数据优化
                    largeThreshold: 50,         // 超过100个数据项时启用优化
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                            { offset: 0, color: '#a8e063' },
                            { offset: 1, color: '#fdeb71' }
                        ])
                    },
                    label: {
                        show: true,
                        position: ['50%', '50%'],  // 将标签位置设置在柱状图中间
                        distance: 0,               // 距离图形元素的距离
                        formatter: '{c}',
                        color: '#000000',         // 修改为黑色以增加可读性
                        fontWeight: 'bold',
                        fontSize: 12,             // 增大字体大小
                        textAlign: 'center',      // 文本居中对齐
                        textBorderColor: '#ffffff', // 添加白色描边
                        textBorderWidth: 2,        // 描边宽度
                    }
                }
            ]
        };

        myChart.setOption(option);
    });
