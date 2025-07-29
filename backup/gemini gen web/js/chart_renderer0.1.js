// 这个函数接收参数，为不同页面生成图表
async function renderChart(options) {
    const { chartId, dataUrl, title, baseGpuName, startColor } = options;

    try {
        // 1. 初始化 ECharts 实例
        const myChart = echarts.init(document.getElementById(chartId));
        if (!myChart) {
            console.error(`图表容器 #${chartId} 未找到!`);
            return;
        }
        // 2. 异步加载数据
        const response = await fetch(dataUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        const data = await response.json();

        // (下面的逻辑和您之前的代码基本一致，但更具通用性)

        const brandColors = {
            nvidia: { barEnd: '#76B900', font: '#76B900' },
            amd: { barEnd: '#ED1C24', font: '#ED1C24' },
            intel: { barEnd: '#0071C5', font: '#0071C5' },
            other: { barEnd: '#cccccc', font: '#aaaaaa' }
        };

        const baseScore = data[baseGpuName];
        if (!baseScore) {
            throw new Error(`基准显卡 "${baseGpuName}" 在数据文件中未找到!`);
        }

        let processedData = Object.entries(data).map(([name, score]) => {
            let brand = 'other';
            const lowerCaseName = name.toLowerCase();
            if (lowerCaseName.includes('nvidia') || lowerCaseName.includes('geforce')) {
                brand = 'nvidia';
            } else if (lowerCaseName.includes('amd') || lowerCaseName.includes('radeon')) {
                brand = 'amd';
            } else if (lowerCaseName.includes('intel') || lowerCaseName.includes('arc')) {
                brand = 'intel';
            }
            return { name, value: score, brand };
        });

        processedData.sort((a, b) => a.value - b.value);

        const yAxisData = processedData.map(item => ({
            value: item.name,
            textStyle: {
                color: brandColors[item.brand].font,
                fontWeight: 'bold'
            }
        }));

        const seriesDataWithStyles = processedData.map(item => ({
            value: item.value,
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: startColor },
                    { offset: 1, color: brandColors[item.brand].barEnd }
                ])
            }
        }));

        const seriesScoresOnly = processedData.map(item => item.value);

        const echartOption = {
            title: {
                text: title,
                left: 'center',
                top: '20px',
                textStyle: {
                    color: startColor,
                    fontSize: 24,
                    fontWeight: 'bold'
                }
            },
            graphic: {
                elements: [{
                    type: 'text',
                    right: '50px',
                    bottom: '50px',
                    style: {
                        text: '魔梨沙@bilibili制作\n2025年7月29日',
                        textAlign: 'right',
                        fill: '#ccc',
                        fontSize: 24
                    }
                }]
            },
            backgroundColor: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#2a2a2a' },
                { offset: 1, color: '#000000' }
            ]),
            // tooltip: {
            //     trigger: 'axis',
            //     axisPointer: { type: 'shadow' },
            //     formatter: (params) => {
            //         const data = processedData[params[0].dataIndex];
            //         const percentage = (data.value / baseScore * 100).toFixed(2) + '%';
            //         return `${data.name}<br/>分数: <strong>${data.value}</strong><br/>百分比: <strong>${percentage}</strong>`;
            //     }
            // },
            grid: {
                left: '250px',
                right: '80px',
                top: '100px',
                bottom: '80px',
                containLabel: false
            },
            xAxis: {
                type: 'value',
                position: 'top',
                splitLine: {
                    show: true,
                    lineStyle: { color: '#444', type: 'dashed' }
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                            { offset: 0, color: '#ffff99' },
                            { offset: 1, color: '#76B900' }
                        ])
                    }
                },
                axisLabel: { color: '#ffff99', fontWeight: 'bold' },
                axisTick: { show: true, lineStyle: { color: '#ffff99' } },
                interval: 5000
            },
            yAxis: {
                type: 'category',
                data: yAxisData,
                axisLabel: { align: 'right', padding: [0, 10, 0, 0] },
                axisLine: { show: false },
                axisTick: { show: false }
            },
            series: [
                {
                    name: '分数',
                    type: 'bar',
                    data: seriesDataWithStyles,
                    z: 1,
                    label: {
                        show: true,
                        position: 'insideLeft',
                        formatter: '{c}',
                        color: '#000',
                        fontWeight: 'bold'
                    }
                },
                {
                    name: '百分比',
                    type: 'bar',
                    barGap: '-100%',
                    z: 2,
                    data: seriesScoresOnly,
                    itemStyle: { color: 'transparent' },
                    label: {
                        show: true,
                        position: 'right',
                        formatter: (params) => (params.value / baseScore * 100).toFixed(0) + '%',
                        color: '#fff',
                        fontWeight: 'bold'
                    }
                }
            ]
        };

        myChart.setOption(echartOption);

        // 当窗口大小变化时，让图表自适应
        window.addEventListener('resize', function () {
            myChart.resize();
        });

    } catch (error) {
        console.error('渲染图表时出错:', error);
        document.getElementById(chartId).innerText = `错误: ${error.message}`;
    }
}