// modules.js
function frame() {
    // 你的代码
    
    function draw() {
      // 绘制散点图
      const svg = d3.select('.module1')
        .append('svg')
        .attr('width', 400)
        .attr('height', 300);
      
      const margin = { top: 20, right: 20, bottom: 30, left: 30 };
      const width = +svg.attr('width') - margin.left - margin.right;
      const height = +svg.attr('height') - margin.top - margin.bottom;
      
      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
      
      g.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height)
        .attr('rx', 10) // 设置圆角的半径
        .attr('ry', 10) // 设置圆角的半径
        .style('fill', 'lightblue')
        .style('stroke', 'blue')
        .style('stroke-width', 2);
    }
  
    return {
      draw: draw
    };
  }
// d3.export("frame",frame);
