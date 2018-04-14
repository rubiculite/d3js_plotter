// Scatter Plot Widget
//
// Author: Dr. Michelle M. M. Boyce
// Email: dr_smike@yahoo.ca
// Stardate: -304740.8584157788
//

// Notes: http://bl.ocks.org/peterssonjonas/4a0e7cb8d23231243e0e
//        http://www.dofactory.com/javascript/factory-method-design-pattern
function plotterFactory() {

   var createPlotter = function(element_id,data) {

      var pd = (function(){
         var pData = [];
         for (key in data) {
            if (data.hasOwnProperty(key)) {
               if (key == 'datum') {
                  var points = [];
                  for (i=0;i<data.datum.length;i++) {
                     points.push({x: data.datum[i].x, y: data.datum[i].y});
                  }
                  pData.datum=points;
               } else {
                 pData[key]=data[key];
               }
            }
         }
         return pData;
      })();
   
      // define plot layout
      //axesLength = 400;
      var axesLength = 200;
      var dx= Math.abs(pd.xMax-pd.xMin);
      var dy= Math.abs(pd.yMax-pd.yMin);
      // TA-DO: Temporary fix until with can parameter options...
      dy=dx;
      var xAxisPixelLength = axesLength;
      var yAxisPixelLength = xAxisPixelLength * dy/dx;
      if (dx == dy) {
         xAxisPixelLength = axesLength;
         yAxisPixelLength = axesLength;
      } else if (dx > dy) {
         yAxisPixelLength = axesLength;
         xAxisPixelLength = yAxisPixelLength * dx/dy;
      }
      var border = {top: 50, right: 50, bottom: 75, left: 75};
   
      // define axes
      var xScale = d3.scaleLinear().domain([pd.xMin,pd.xMax]).range([0,xAxisPixelLength]).nice();
      var yScale = d3.scaleLinear().domain([pd.yMin,pd.yMax]).range([yAxisPixelLength,0]).nice();
      var xAxis = d3.axisBottom(xScale).ticks(5);
      var yAxis = d3.axisLeft(yScale).ticks(10);
   
      // create svg container
      var svgContainer = d3.select("#"+element_id).append("svg")
         .attr("width",border.left+xAxisPixelLength+border.right)
         .attr("height",border.top+yAxisPixelLength+border.bottom);
   
      // create plot container
      var gPlotContainer = svgContainer.append("g").attr("class","scatter-plot")
         .attr("transform","translate("+border.left+","+border.top+")");
   
      // add axis ticks and numbers
      gPlotContainer.append("g").attr("class","x-axis")
         .attr("transform","translate(0,"+yAxisPixelLength+")")
         .call(xAxis);
      gPlotContainer.append("g").attr("class","y-axis").call(yAxis);
   
      // add grid lines
      gPlotContainer.append("g").attr("class","grid-lines")
         .attr("transform","translate(0,"+yAxisPixelLength+")")
         .call(xAxis.tickSize(-yAxisPixelLength).tickFormat(""));
      gPlotContainer.append("g").attr("class","grid-lines")
         .call(yAxis.tickSize(-xAxisPixelLength).tickFormat(""));
      gPlotContainer.selectAll(".grid-lines line").style("stroke","lightgrey");
   
      // add plot border (required to cover up grid line overlay)
      gPlotContainer.append("rect")
         .style("fill","none")
         .style("stroke","black")
         .attr("width",xAxisPixelLength)
         .attr("height",yAxisPixelLength);
   
      // axis labels
      svgContainer.append("text")
         .attr("x",border.left+xAxisPixelLength-5*pd.xLabel.length)
         .attr("y",border.top+yAxisPixelLength+border.bottom/2)
         .text(pd.xLabel);
      svgContainer.append("text")
         .attr("transform","translate("+border.left/2+","+(border.top)+") rotate(90)")
         .text(pd.yLabel);
   
      // plot title
      svgContainer.append("text")
         .attr("x",border.left+(xAxisPixelLength-8*pd.title.length)/2)
         .attr("y",3*border.top/4)
         .text(pd.title);
   
      // plot the data
      var idClibPath = "plot-boundary-"+element_id;
      gPlotContainer.append("clipPath")
         .attr("id",idClibPath)
         .append("rect")
         .attr("width",xAxisPixelLength)
         .attr("height",yAxisPixelLength);
      gPlotContainer.selectAll(".point").data(datum).enter()
         .append("circle").attr("class","point")
         .attr("r",3).attr("stroke","black").attr("stroke-width",1.25).attr("fill","none")
         .attr("clip-path","url(#"+idClibPath+")")
         .attr("cx",function(d){return xScale(d.x)})
         .attr("cy",function(d){return yScale(d.y)});
   
      // add x-hairs region
      var ordinats = (function(xScale,yScale){ 
         return function(xPixels,yPixels) {
            return "("
               +(Number(xScale.invert(xPixels)).toFixed(1))+", "
               +(Number(yScale.invert(yPixels)).toFixed(1))+
            ")";
         };
      })(xScale,yScale);
      gPlotContainer.append("line").attr("class","x-xhair")
         .attr("x1",xAxisPixelLength/2).attr("y1",0)
         .attr("x2",xAxisPixelLength/2).attr("y2",yAxisPixelLength)
         .attr("stroke","blue")
         .style("display","none");
      gPlotContainer.append("line").attr("class","y-xhair")
         .attr("x1",0).attr("y1",yAxisPixelLength/2)
         .attr("x2",xAxisPixelLength).attr("y2",yAxisPixelLength/2)
         .attr("stroke","blue")
         .style("display","none");
      gPlotContainer.append("text").attr("class","xhair-annotation")
         .attr("x",xAxisPixelLength/2+5).attr("y",yAxisPixelLength/2-5)
         .text(ordinats(xAxisPixelLength/2,yAxisPixelLength/2))
         .attr("fill","blue")
         .style("display","none");
      gPlotContainer
         .append("rect")
         .style("fill","none")
         .attr("x",0).attr("y",0)
         .attr("width",xAxisPixelLength)
         .attr("height",yAxisPixelLength)
         .style("pointer-events","all")
         .on("mouseover",function(){
            element.selectAll(".x-xhair, .y-xhair, .xhair-annotation").style("display",null);
         })
         .on("mouseout", function(){
            element.selectAll(".x-xhair, .y-xhair, .xhair-annotation").style("display","none");
         })
         .on("mousemove",function(){
            var coords = d3.mouse(this);
            var xPixels = coords[0];
            var yPixels = coords[1];
            var annotation = oridnates(xPixels,yPixels)
            element.select("line.x-xhair").attr("x1",xPixels).attr("x2",xPixels);
            element.select("line.y-xhair").attr("y1",yPixels).attr("y2",yPixels);
            element.select("text.xhair-annotation")
               .attr("x",xPixels-((xPixels<xAxisPixelLength/2)?-5:6.25*annotation.length+5))
               .attr("y",yPixels-((yPixels<yAxisPixelLength/2)?-15:5))
               // TA-DO: make local...
               .attr("clip-path","url(#plot-boundary)")
               .text(annotation);
         });
   };

   return {
      new: function(element_id,data) {

         var this_plotter = new createPlotter(element_id,data);
         
         return {
            update() {
               console.log("Hello world!");
            }
         }
      }
   };
};
