 let tInput, aInput, vInput;
let t = 10; // Default time value
let v = 0; // Initial velocity
let a = 0; // Acceleration
let pointX = 0;
let timeElapsed = 0;
let scaleFactor = 50; // Scale factor for converting time to pixels (1cm = 0.5s)
let graphSelect;
let displacementGraph = [];
let velocityGraph = [];
let accelerationGraph = [];
let playing = true;
let playButton, pauseButton, replayButton;
let slowButton, normalButton;
let timeIncrement = 0.02; // Normal speed time increment
let speedFactor = 1; // Factor to adjust speed
let yMaxValue = 0; // Dynamic y-axis scaling

function setup() {
  createCanvas(800, 1000); // Increase canvas height to accommodate shifted graph
  
  // Input box for time 't' with bold label
  createElement('label', 't:').style('font-weight', 'bold').position(50, 25);
  tInput = createInput('10');
  tInput.position(70, 25);
  tInput.size(50);
  tInput.input(updateTime);

  // Input box for acceleration 'a' with bold label
  createElement('label', 'a:').style('font-weight', 'bold').position(150, 25);
  aInput = createInput('0');
  aInput.position(170, 25);
  aInput.size(50);
  aInput.input(updateAcceleration);

  // Input box for initial velocity 'u (m/s)' with label
  createElement('label', 'u (m/s):').style('font-weight', 'bold').position(50, 75);
  vInput = createInput('0');
  vInput.position(120, 75);
  vInput.size(50);
  vInput.input(updateVelocity);

  // Dropdown to choose which graph to show
  graphSelect = createSelect();
  graphSelect.position(50, 125);
  graphSelect.option('Displacement (s)');
  graphSelect.option('Velocity (v)');
  graphSelect.option('Acceleration (a)');

  // Play, Pause, and Replay buttons
  playButton = createButton('Play');
  playButton.position(50, 250);
  playButton.mousePressed(playMotion);

  pauseButton = createButton('Pause');
  pauseButton.position(110, 250);
  pauseButton.mousePressed(pauseMotion);

  replayButton = createButton('Replay');
  replayButton.position(180, 250);
  replayButton.mousePressed(replayMotion);

  // Slow and Normal speed buttons
  slowButton = createButton('Slow');
  slowButton.position(50, 300);
  slowButton.mousePressed(slowMotion);

  normalButton = createButton('Normal');
  normalButton.position(110, 300);
  normalButton.mousePressed(normalMotion);

  // Reset the graph data
  resetGraphs();
}

function draw() {
  background(255);

  // Draw straight line for motion of the point object
  let lineLength = t * scaleFactor;
  stroke(0);
  line(50, height / 5, 50 + lineLength, height / 5); // Line is placed higher, at height / 5
  
  // Draw start and end time markers
  noStroke();
  textAlign(CENTER);
  text('t = 0', 50, height / 5 - 10);
  text(`t = ${t}s`, 50 + lineLength, height / 5 - 10);
  
  // Update point position based on the equations of motion
  if (playing && timeElapsed <= t) {
    let displacement = v * timeElapsed + 0.5 * a * timeElapsed * timeElapsed;
    pointX = map(displacement, 0, v * t + 0.5 * a * t * t, 50, 50 + lineLength);
    
    // Ensure valid values for displacement
    if (!isNaN(pointX)) {
      fill(255, 0, 0);
      ellipse(pointX, height / 5, 20, 20);
    }
    
    // Update graphs based on the timeElapsed
    updateGraphs(timeElapsed);
    timeElapsed += timeIncrement * speedFactor; // Adjust the speed of time increment
  }

  // Draw graph shifted more below the line (lower on the y-axis)
  drawGraph();
}

// Function to update time 't'
function updateTime() {
  t = float(tInput.value());
  if (isNaN(t) || t <= 0) {
    t = 10; // Default value for t if input is invalid
  }
  resetGraphs();
  timeElapsed = 0;
}

// Function to update acceleration 'a'
function updateAcceleration() {
  a = float(aInput.value());
  if (isNaN(a)) {
    a = 0; // Default value for acceleration if input is invalid
  }
  resetGraphs();
  timeElapsed = 0;
}

// Function to update initial velocity 'v'
function updateVelocity() {
  v = float(vInput.value());
  if (isNaN(v)) {
    v = 0; // Default value for velocity if input is invalid
  }
  resetGraphs();
  timeElapsed = 0;
}

// Function to reset graphs when values change
function resetGraphs() {
  displacementGraph = [];
  velocityGraph = [];
  accelerationGraph = [];
}

// Function to update graph data
function updateGraphs(time) {
  let displacement = v * time + 0.5 * a * time * time;
  let velocity = v + a * time;
  displacementGraph.push({x: time, y: displacement});
  velocityGraph.push({x: time, y: velocity});
  accelerationGraph.push({x: time, y: a});
}

// Function to draw the selected graph without y-axis values
function drawGraph() {
  let selectedGraph = graphSelect.value();
  let graphData = [];
  let graphLabel = '';
  let maxValue = 0;

  // Choose which graph to show and dynamically set y-axis limits
  if (selectedGraph === 'Displacement (s)') {
    graphData = displacementGraph;
    graphLabel = 'Displacement (s)';
    maxValue = max(displacementGraph.map(d => abs(d.y))) || 1000; // Dynamically adjust max displacement value
  } else if (selectedGraph === 'Velocity (v)') {
    graphData = velocityGraph;
    graphLabel = 'Velocity (v)';
    maxValue = max(velocityGraph.map(v => abs(v.y))) || 100; // Dynamically adjust max velocity value
  } else if (selectedGraph === 'Acceleration (a)') {
    graphData = accelerationGraph;
    graphLabel = 'Acceleration (a)';
    maxValue = 10; // Acceleration fixed at -10 to 10
  }

  // Draw the graph axes without y-axis labels for a cleaner plot
  strokeWeight(1.5); // Reduced line thickness
  stroke(0);
  line(400, 500, 400, 850); // y-axis
  line(400, 675, 700, 675); // x-axis
  
  // Axis labels moved to the top of the y-axis
  noStroke();
  fill(0);
  textAlign(CENTER);
  text(graphLabel, 390, 490); // Label on top of the y-axis
  text('t (s)', 550, 695); // x-axis label

  // Instantaneous plotting of points
  stroke(0, 0, 255);
  fill(0, 0, 255);
  for (let i = 0; i < graphData.length; i++) {
    let x = map(graphData[i].x, 0, t, 400, 700);
    let y = map(graphData[i].y, -maxValue, maxValue, 850, 500);
    ellipse(x, y, 5, 5); // Draw small circles as the tracing point

    // Check if the mouse is over the point
    if (dist(mouseX, mouseY, x, y) < 10) {
      fill(0); // Black font color for (x, y) values
      textAlign(LEFT);
      textFont('Arial'); // Set font to Arial
      text(`(${nf(graphData[i].x, 1, 2)}, ${nf(graphData[i].y, 1, 2)})`, mouseX + 10, mouseY);
    }
  }
}

// Function to play the motion
function playMotion() {
  playing = true;
}

// Function to pause the motion
function pauseMotion() {
  playing = false;
}

// Function to replay the motion
function replayMotion() {
  playing = true;
  timeElapsed = 0;
  resetGraphs();
}

// Function to set slow motion
function slowMotion() {
  speedFactor = 0.25; // Slow down the speed
}

// Function to set normal speed
function normalMotion() {
  speedFactor = 1; // Reset to normal speed
}
