


/**
 * Configuration
 */

// How many images to generate
const EXAMPLES_TO_GENERATE = 100;

// Size of images
const WIDTH = 100;
const HEIGHT = 100;
const PADDING = 10;

// How far are connected points allowed to move
const MOVEMENT_FACTOR = 0.35;

// How many bezier points to add
const POINTS = 4;

// How close to the edge do we allow points
const EDGE_THRESHOLD = 0.1;


// A new folder will be created in /output ever time you run this,
// so that old examples don't get deleted
const OUTPUT_FOLDER = __dirname + '/output/' + (+new Date).toString(36);
const PNG_OUTPUT = OUTPUT_FOLDER + '/png/';



/**
 * Setup
 */
const d3 = require('d3');
const Path = require('svg-path-generator');
const { Noise } = require('noisejs');
const fs = require('fs-extra');
const { convert } = require('convert-svg-to-png');
const D3Node = require('d3-node');


// const pageWidth = window.innerWidth
// || document.documentElement.clientWidth
// || document.body.clientWidth;

// const pageHeight = window.innerHeight
// || document.documentElement.clientHeight
// || document.body.clientHeight;



fs.ensureDirSync(PNG_OUTPUT)

const contentWidth = WIDTH - 2 * PADDING;
const contentHeight = HEIGHT - 2 * PADDING;

const noise = new Noise(Math.random());

const exampleData = [];



/**
 * Code
 *
 */

function tweenDash() {
  var l = this.getTotalLength(),
      i = d3.interpolateString("0," + l, l + "," + l);
  return function(t) { return i(t); };
}

(async function() {


let count = 0;
const generateExample = async () => {

  const d3n = new D3Node();
  const svg = d3n.createSVG(WIDTH, HEIGHT).append('g').attr('transform', `translate(${PADDING, PADDING})`);

  let points = [];
  let controlPoints = [];

  const start = {
    x: 0.4 + 0.2 * Math.random(),
    y: 0.4 + 0.2 * Math.random()
  }

  points.push([contentWidth * start.x, contentHeight * start.y]);

  let d = Path().moveTo(contentWidth * start.x, contentHeight * start.y);
  let currentPoint = start;
  d3.range(POINTS - 1).map((i) => {
    let dx = MOVEMENT_FACTOR * noise.simplex2(2 * i, 2 * count);
    let dy = MOVEMENT_FACTOR * noise.simplex2(2 * i + 0, 2 * count + 1);
    if (currentPoint.x + dx >= 1 - EDGE_THRESHOLD || currentPoint.x + dx <= EDGE_THRESHOLD) {
      dx *= -1;
    }
    if (currentPoint.y + dy >= 1 || currentPoint.y + dy <= 0) {
      dy *= -1;
    }
    let midPoint = {
      x: currentPoint.x + dx,
      y: currentPoint.y + dy
    }
    dx = MOVEMENT_FACTOR * noise.simplex2(2 * i + 1, 2 * count);
    dy = MOVEMENT_FACTOR * noise.simplex2(2 * i + 1, 2 * count + 1);
    if (midPoint.x + dx >= 1 - EDGE_THRESHOLD || midPoint.x + dx <= EDGE_THRESHOLD) {
      dx *= -1;
    }
    if (midPoint.y + dy >= 1 - EDGE_THRESHOLD || midPoint.y + dy <= EDGE_THRESHOLD) {
      dy *= -1;
    }
    currentPoint.x = midPoint.x + dx;
    currentPoint.y = midPoint.y + dy;

    controlPoints.push([contentWidth * midPoint.x, contentHeight * midPoint.y]);
    points.push([contentWidth * currentPoint.x, contentHeight * currentPoint.y]);
    d = d.smoothCurveTo(contentWidth * midPoint.x, contentHeight * midPoint.y, contentWidth * currentPoint.x, contentHeight * currentPoint.y);
  })
  d = d.end();

  svg
  .append('path')
  .attr('d', d)
  .style('stroke', 'black')
  // .style('fill', `rgb(${d3.range(3).map(d => Math.round(255 * Math.random())).join(',')}`))
  .style('fill', 'none')
  .style('stroke-width', 1)

  const png = await convert(d3n.svgString(), { background: '#fff' });
  const pngOutputPath = `${PNG_OUTPUT}/${count}.png`;
  fs.writeFileSync(pngOutputPath, png);

  exampleData.push({
    pngFile: pngOutputPath,
    points: points,
    controlPoints: controlPoints
  })

  count++;
}

for (var i = 0; i < EXAMPLES_TO_GENERATE; i++) {
  await generateExample();
}

fs.writeFileSync(OUTPUT_FOLDER + '/output.json', JSON.stringify(exampleData));

})()