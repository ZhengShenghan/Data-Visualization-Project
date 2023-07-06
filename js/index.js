/**
 * @name: index
 * @date: 2023/5/5 11:10
 * @description：index
 * @update: 2023/5/5 11:10
 */

// 变量对象
let dataSet = {
    // 所有的数据
    allData: [],
    // 所有博文第一个i地址
    times: [],
    // 总的评论条数
    total: 0,
    // 词云
    cloudList: [],
    // 选中的博文数据
    activeData: {},
    // 时间线图表宽高
    width: window.document.body?.clientWidth,
    height: window.document.body?.clientHeight,
    // 上下左右的边距
    margin: {
        top: sizeRem(30),
        right: sizeRem(30),
        bottom: sizeRem(30),
        left: sizeRem(30)
    },
    // 区域划分
    regionData: {
        // 北方
        North: {
            color: "#33cb40",
            list: ["北京", "天津", "河北", "山西", "内蒙古"]
        },
        // 华东地区
        East: {
            color: "#fff",
            list: ["上海", "江苏", "浙江", "安徽", '山东']
        },
        //东北
        Northeast: {
            color: "#ef5217",
            list: ["辽宁", "吉林", "黑龙江"]
        },
        // 西北地区
        Northwest: {
            color: "#727070",
            list: ["青海", "甘肃", "宁夏", "新疆", "陕西"]
        },
        // 西南
        Southwest: {
            color: "#f63d3d",
            list: ["重庆", "四川", "贵州", "云南", "西藏"]
        },
        // 华南地区
        CentralSouth: {
            color: "#454fc5",
            list: ['广东', '广西', '海南', '福建', '台湾']
        },
        // 华中
        southChina: {
            color: "#20efca",
            list: ['湖北', '湖南', '河南', '江西']
        }
    }
}

let newActiveData = {}
// 监听数据变化
Object.defineProperty(dataSet, "activeData", {
    get() {
        return newActiveData
    },
    set(value) {
        newActiveData = value;
        // 更新词云
        createCloudWithCustomData(JSON.parse(JSON.stringify(dataSet.activeData.cloudList)))
        // 更新情绪分析
        createBar();
        // 更新地图上的圆
        createMapCircle();
        let dom = document.getElementById("input")
        dom.value = value.title
        handlerInputChange();
    }
})

// 词云
let layout = null;
// 地图svg
let svgMap = null;
// 地图数据
let mapData = [];
// 地图上的球
let mapCircle = []


/**
 *  px 转 rem
 * @param size px尺寸
 * @returns {string} rem尺寸
 */
function sizeRem(size) {
    const clientWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    if (!clientWidth) return 0;
    const wW = clientWidth >= 1200 ? clientWidth : 1920; // 窗口宽度
    const fontSize = wW / 1920;
    return size * fontSize;
}

/**
 * 排序的比较
 * @param attr
 * @param rev 升序 true | 降序 false
 * @returns {(function(*, *): (*|number))|*}
 */
function compare(attr, rev = true) {
    if (rev === undefined) {
        rev = 1;
    } else {
        rev = (rev) ? 1 : -1;
    }
    return (a, b) => {
        a = a[attr];
        b = b[attr];
        if (a < b) {
            return rev * -1;
        }
        if (a > b) {
            return rev * 1;
        }
        return 0;
    }
}

/**
 * 读取json数据
 */
const getJSONData = () => {
    // 文件地址
    let url = "../data/data.json"

    // 设置get请求
    let request = new XMLHttpRequest();
    request.open("get", url);
    request.send(null);
    request.onload = function () {
        // 读取成功
        if (request.status === 200) {
            dataSet.total = 0;
            dataSet.allData = JSON.parse(request.responseText);
            dataSet.allData?.sort(compare("time", true))
            // 设置第一条数据为选中的数据
            dataSet.activeData = dataSet.allData[0];
            dataSet.allData.forEach((item, index) => {
                // 设置下标值
                item.index = index
                // 获取所有的评论总数
                dataSet.total += item.total;
                // 所有时间
                dataSet.times.push(item.time)
            })
        }
    }
}
getJSONData()

/**
 * x轴数据的间隔
 */
const xInterval = () => d3.scaleBand().domain(dataSet.times.map((item, index) => item + ' ' + index)).range([0, dataSet.width - dataSet.margin.right * 2 - dataSet.margin.left * 2])

/**
 * xAxis内容
 * @param g
 */
const xAxis = (g) => {
    // 设置x轴坐标位置
    g.attr("transform", `translate(0,${dataSet.height - dataSet.margin.bottom})`)
        .attr("id", "xAxis")
        .call(d3.axisBottom(xInterval()).tickFormat(function (d) {
            // 分割获取下标值
            let strArr = d.split(" ")
            //按索引值重新获取原数据并赋给x轴
            return dataSet.times[strArr[1]];
        }))
        .call(g => g.select(".domain").remove())

}

/**
 * 创建工具提示
 * @param el
 * @returns {*}
 */
const createTooltip = (el) => el
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("top", 0)
    .style("opacity", 0)
    .style("background", "rgba(255,255,255, 0.8)")
    .style("border-radius", "0.05rem")
    .style("box-shadow", "0 0 0.01px rgba(0,0,0,.25)")
    .style("padding", "0.1rem")
    .style("line-height", "1.3")
    .style("font", "11px sans-serif")

/**
 * 设置工具提示的内容
 * @param d
 */
const getTooltipContent = (d) => {
    return `<b style="color: #000">${d.time}</b><br/><b style="color: #000">${d.title}</b>`
}

/**
 * 创建时间线图表
 */
const createTimeView = () => {
    // 获取存放图表的Dom
    let dom = document.getElementById("timeLine")
    dom.style.position = "relative";
    // 设置图表宽高
    dataSet.width = dom.clientWidth - dataSet.margin.left - dataSet.margin.right;
    dataSet.height = dom.clientHeight - dataSet.margin.top - dataSet.margin.bottom;
    // 创建svg并设置宽高
    const svg = d3.select("#timeLine").append("svg").attr("width", dataSet.width).attr("height", dataSet.height)

    // 绘制x轴
    svg.append("g").call(xAxis);
    // 获取坐标, 主要用于居中显示
    let xAxisDom = document.getElementById("xAxis")
    let gList = xAxisDom.getElementsByClassName("tick")
    let arr = Array.from(gList).map(item => {
        return item.attributes.transform.value.split("translate(")[1].split(",")[0]
    })

    // 计算圆的半径
    const setRadius = d3.scaleSqrt([0, dataSet.total], [0, dataSet.width / 10])

    // 创建提示板用于hover
    const tooltip = d3.select(document.createElement("div")).call(createTooltip);
    dom.appendChild(tooltip.node())

    // 创建竖线 用于hover
    const line = svg.append("line").attr("y1", dataSet.margin.top - 10).attr("y2", dataSet.height - dataSet.margin.bottom).attr("stroke", "rgba(255,255,255)").style("pointer-events", "none").style("opacity", 0);

    // 添加svg的事件
    svg.on("mousemove", function (d) {
        // 显示线条
        line.style("opacity", 1);
        // 获取鼠标位置
        let {offsetX: x, offsetY: y} = d;
        line.attr("transform", `translate(${x} 0)`);
        y -= 30
        if (x >= dataSet.width / 2) {
            x -= tooltip._groups[0][0].clientWidth
        } else {
            x += 50
        }
        // 设置提示框位置
        tooltip
            .style("left", x + "px")
            .style("top", y + "px")
    })
    // 鼠标离开时
    svg.on("mouseleave", function (d) {
        // 隐藏提示框和线
        line.style("opacity", 0);
        tooltip.style("opacity", 0)
    })

    // 创建圆
    let circleList = svg.append("g")
        .attr("stroke", "black")
        .selectAll("circle")
        .data(dataSet.allData, d => d.title)
        .join("circle")
        // 获取坐标轴中心点
        .attr("cx", d => arr[d.index])
        .attr("cy", dataSet.height / 2)
        .attr("r", d => setRadius(d.total))
        .attr("fill", d => (d.index === dataSet.activeData.index) ? "red" : "rgba(255,255,255)")
        .attr("opacity", "0.7")
        .on("mouseenter", function (d) {
            // 设置球的透明度
            d.target.setAttribute("opacity", 0.8)
            tooltip.style("opacity", 1).html(getTooltipContent(d.target.__data__))
        })
        .on("mouseleave", function (d) {
            d.target.setAttribute("opacity", 0.7)
            d3.select(this).select("rect").attr("opacity", 0)
            tooltip.style("opacity", 0)
        })
        .on("click", (d) => {
            // 设置
            const isSelected = d.target.getAttribute("fill") === "red";
            // 没有被选中
            if (!isSelected) {
                // 清除原有选中的圆圈
                d3.selectAll(circleList).attr("fill", "rgba(255,255,255)")

                // 设置选中数据下标值
                dataSet.activeData = d.target.__data__;
                // 如果已选中，取消选中；否则，选中圆圈
                d.target.setAttribute("fill", isSelected ? "rgba(255,255,255)" : "red")
            }
        });
    // .on("mouseenter", (e) => {
    //     console.log(e);
    //     // lineDom.setAttribute("opacity", 1)
    //     // lineDom.setAttribute("x1", e.target.cx.animVal.value)
    //     // lineDom.setAttribute("x2", e.target.cx.animVal.value)
    // })
    // .on("mouseleave", (e) => {
    //     //清除之前的词云
    //     // lineDom.setAttribute("opacity", 0)
    // })
    // .on("click", (d) => {
    //     console.log(d.target.getAttribute("fill"));
    //     // 判断圆圈是否已选中
    //     const isSelected = d.target.getAttribute("fill") === "red";
    //     // 已经被选中
    //     if (isSelected) {
    //         createCloudWithCustomData(JSON.parse(JSON.stringify(qc(dataSet.cloudList))));
    //         //去除舆情失控部分红色黄色的选中
    //         unhighlightCircleyellow();
    //         unhighlightCirclered();
    //     } else {
    //         // 清除原有选中的圆圈
    //         d3.selectAll(circleList).attr("fill", "rgba(255,255,255)")
    //         //创建新的词云
    //         createCloudWithCustomData(JSON.parse(JSON.stringify(customData)));
    //         //修改情绪柱状图的值
    //         updateDataset([Math.random() * (150 - 10) + 10, 100, 44, 218]);
    //         //选中红色
    //         highlightCirclered();
    //         // 删除原有的数据
    //         let parent = document.getElementById("mapSvg")
    //         let mapCircle = document.getElementById("mapCircle")
    //         if (mapCircle) {
    //             parent.removeChild(mapCircle)
    //         }
    //         createMapCircle();
    //     }
    //     // 如果已选中，取消选中；否则，选中圆圈
    //     d.target.setAttribute("fill", isSelected ? "rgba(255,255,255)" : "red")
    // })
    // .call(circle => circle.append("title").text(d => [d.time, d.title].join("\n")))
    // .attr("title", d => [d.name, d.type].join("\n"))
    // .on("mouseover", (e) => {
    //     // console.log(e);
    // });

    // 创建参考线
    svg.append("line")
        .attr("y1", dataSet.height / 2)
        .attr("y2", dataSet.height / 2)
        .attr("x1", dataSet.margin.left)
        .attr("x2", dataSet.width)
        .attr("stroke", "currentColor")
        .attr("stroke-opacity", 0.5) // 调小参考线的透明度
}

/**
 *  根据ID修改指定的Dom的文本内容
 * @param elementId DomId
 * @param newText 文本内容
 */
const modifyTitle = (elementId, newText = '') => {
    // 选中指定ID的元素
    const title = document.getElementById(elementId)
    // 修改元素的文本内容
    title.textContent = newText
}

/**
 * 绘制词云
 * @param wordsData 词云数据
 */
const createCloudWithCustomData = (wordsData) => {
    // 排序
    wordsData.sort((a, b) => b.size - a.size)
    // 获取最多的关键字
    let max = JSON.parse(JSON.stringify(wordsData[0]))
    //修改词云左侧的数据显示，NO-1什么的
    modifyTitle("myTitle1", max.text);
    modifyTitle("myTitle2", max.size);
    modifyTitle("myTitle3", max.relations.join(","));


    const draw = (words) => {
        d3.select("#cloud").append("svg")
            .attr("width", layout.size()[0])
            .attr("height", layout.size()[1])
            .attr("text-anchor", "middle")
            .attr("font-family", "Impact")
            .append("g")
            .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", function (d) {
                return d.size / 100 + "rem";
            })
            .style("fill", d => d.text === max.text ? "red" : "#fff")
            .attr("transform", function (d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function (d) {
                return d.text;
            });
    }

    // 获取存放图表的Dom
    let dom = document.getElementById("cloud")
    const fontSize = d3.scaleSqrt([0, max.size], [0, dom.clientWidth / 10])
    // 检查数据是否有效的JSON格式
    layout = d3.layout.cloud()
        .size([dom.clientWidth, dom.clientHeight])
        .padding(5)
        .rotate(() => ~~(Math.random() * 2) * 90)
        .font("Impact")
        .words(wordsData)
        .fontSize(d => fontSize(d.size) * 2)
        .on('end', draw)
    // 删除所有已创建的词云图
    d3.select("#cloud").selectAll("svg").remove();
    layout.start()
}

/**
 * 情绪分析
 */
const createBar = () => {
    // 获取存放图表的Dom
    let dom = document.getElementById("bar")
    let barSvg = document.getElementById("bar-svg")
    // 清除原有的数据
    if (barSvg) {
        dom.removeChild(barSvg)
    }
    let parentDom = document.getElementById("bar-parent")
    // 创建svg并设置宽高
    const svg = d3.select("#bar").append("svg").attr("width", dom.clientWidth).attr("height", parentDom.clientHeight - dataSet.margin.bottom - dataSet.margin.top).style("padding", 0).attr("id", "bar-svg")
    let rectHeight = (parentDom.clientHeight - dataSet.margin.bottom - dataSet.margin.top + sizeRem(10)) / dataSet.activeData?.emotions.length;
    // 创建柱状图
    const groups = svg.selectAll("g")
        .enter()
        .data(dataSet.activeData.emotions)
        .enter()
        .append("g")

    groups.each(function (d, i) {
        let el = d3.select(this);
        el.append("rect")
        .attr('x', sizeRem(45))
        .attr("y", i * rectHeight)
        .attr("width", d.count * (dom.clientWidth - sizeRem(75)))
        .attr("height", rectHeight - sizeRem(10))
        if(i==0){
            el.attr("fill", "#E00D14")
        }
        if(i==1){
            el.attr("fill", "#F55358")
        }
        if(i==2){
            el.attr("fill", "#57CF77")
        }
        if(i==3){
            el.attr("fill", "#21943F")
        }



        el.append("text")
            .attr('x', sizeRem(20))
            .attr("y", i * rectHeight + sizeRem(15))
            .text(d.title)
            .attr("text-anchor", "middle")
            .attr("fill", "#999")

        el.append("text")
            .text(d.count * 100)
            .attr('x', dom.clientWidth - sizeRem(10))
            .attr("y", i * rectHeight + sizeRem(15))
            .attr("text-anchor", "middle")
            .attr("fill", "#999")
    })
}



/**
 * 绘制地图
 */
let mercator = null
const createMap = () => {
    let dom = document.getElementById("map")
    // 创建svg并设置宽高
    svgMap = d3.select("#map").append("svg").attr("width", dom.clientWidth).attr("height", dom.clientHeight - dataSet.margin.bottom).style("padding", 0).attr("id", "mapSvg")
    //创建一 个地图投影
    mercator = d3.geoMercator()
        .center([107, 31])   //设置投影的中心点经纬度
        .scale(sizeRem(550))        //设置缩放因子
        .translate([(dom.clientWidth) / 2, (dom.clientHeight + 80) / 2])//设置平移偏移量
        .translate([(dom.clientWidth) / 2, (dom.clientHeight + 80) / 2])//设置平移偏移量

    //创建一个地理路径生成器
    let geoPath = d3.geoPath()
        .projection(mercator)   //设置地理路径生成器的投影方式

    //获取中国地图的json文件
    d3.json('../data/china.geo.json').then(function (data) {
        mapData = data;
        //绘制区域
        svgMap.append('g')
            .selectAll('path')
            .data(data.features)
            .enter()
            .append('path')
            .attr('stroke', 'gray')
            .attr('stroke-width', sizeRem(3))
            .attr('d', function (d, i) {
                return geoPath(d);
            })
            .attr('fill', function (d, i) {
                    // 根据区域划分设置颜色
                    let color = "";
                    Object.keys(dataSet.regionData).forEach(key => {
                        if (dataSet.regionData[key].list.indexOf(d.properties.name) >= 0) {
                            color = dataSet.regionData[key].color
                        }
                    })
                    return color
                }
            )

        // 创建地图上的圆
        createMapCircle();
    })

}

/**
 * 创建地图上的圆
 */
const createMapCircle = () => {

    let parent = document.getElementById("mapSvg")
    // 清除原有数据
    let mapCircle = document.getElementsByClassName("mapCircle")
    if (mapCircle && mapCircle.length) {
        for (let item of mapCircle) {
            parent.removeChild(item)
        }
    }

    if (!svgMap) return
    // 设置颜色
    const colors = d3.scaleOrdinal(d3.schemeCategory10)

    let total = 0;
    // 获取地图
    dataSet.activeData.mapData.forEach(item => {
        total += item.total
    })
    // 计算圆的半径
    const setRadius = d3.scaleSqrt([0, total], [0, svgMap._groups[0][0].clientWidth / 8])

    let groups = svgMap.selectAll("g")
        .enter()
        .data(dataSet.activeData.mapData)
        .enter()
        .append("g")
        .attr("class", "mapCircle")

    groups.each(function (d, i) {
        let el = d3.select(this);
        // 获取当前地区的数据
        let map = mapData.features.find(item => d.region.indexOf(item.properties.name) >= 0)
        // 获取坐标位置
        let coordinate = mercator(map.properties.cp)
        // 创建球
        el.append("circle")
            .attr("cx", coordinate[0])
            .attr("cy", coordinate[1])
            .attr("r", d => setRadius(d.total))
            .attr("fill", colors(i))
            .attr("opacity", "0.7")
            .call(circle => circle.append("title").text(d => [d.title, `热度: ${d.total}`, `地区: ${d.region}`].join("\n")))
        // 创建热词
        el.append("text")
            .text(d.title)
            .attr('x', coordinate[0])
            .attr("y", coordinate[1] + 5)
            .attr("text-anchor", "middle")
            .attr("fill", "#eee")
    })
}

/**
 * 修改舆情失控风险
 * @param data 博文
 */
const editRank = (data) => {
    // 失控开始时间
    modifyTitle("time", data.startTime);
    // 修改选中的圆
    let domList = document.getElementsByClassName("circular")
    // 获取等级颜色
    let activeCircularClass = data.rank ? ((data.rank == 1) ? "yellow" : "red") : "green"
    // 设置圆圈颜色
    for (let item of domList) {
        // 判断设置选中
        if (item.className.indexOf(activeCircularClass) >= 0) {
            item.classList.add("activeCircular")
        } else {
            item.classList.remove("activeCircular")
        }
    }
    // 修改名称
    let dom = document.getElementById("grade")
    let iconDom = document.getElementById("icon")
    console.log(iconDom);
    let imgName = data.rank ? ((data.rank == 1) ? "warn-yellow.svg" : "warn-red.svg") : "green.svg"
    iconDom.setAttribute("src", "../assets/img/" + imgName)
    dom.style.color = activeCircularClass
    dom.innerText = data.rank ? ((data.rank == 1) ? "中等" : "较高") : "较低"
}

/**
 *
 * @param data
 */
const createDataList = (data) => {
   let dom = document.getElementById("datalist")
    // 删除子元素
    if (dom.children.length) {
        for (let item of dom.children) {
            dom.removeChild(item)
        }
    }
    // 添加子元素
    for (let item of data) {
        let el = document.createElement("option")
        el.setAttribute("value", item.title)
        dom.appendChild(el)
    }
}

/**
 * 处理输入发
 */
const handlerInputChange = () => {
    console.log("111");
    let dom = document.getElementById("input")
    for (let item of dataSet.allData) {
        if (item.title === dom.value) {
            editRank(item);
        }
    }
}

/**
 * 页面加载完毕后执行函数
 */
window.onload = () => {
    // 创建时间线图表
    createTimeView();
    createMap();

    createDataList(dataSet.allData);
}
