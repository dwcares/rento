var socket = io()
const GAUGE_MIN = 650;
const GAUGE_MAX = 2580;

var opts = {
    angle: -0.1, /// The span of the gauge arc
    radiusScale: 0.5, // Relative radius
    lineWidth: 0.01, // The line thickness
    pointer: {
      length: .58, // Relative to gauge radius
      strokeWidth: 0.015, // The thickness
      color: '#ff000099'
    },
    colorStart: '#6FADCF00',   // Colors
    colorStop: '#8FC0DA00',    // just experiment with them
    strokeColor: '#8FC0DA00'   // to see which ones work best for you
};

var target = document.getElementById('gaugeCanvas'); // your canvas element
var gauge = new Gauge(target).setOptions(opts); // create sexy gauge!
gauge.maxValue = GAUGE_MAX; // set max gauge value
gauge.setMinValue(GAUGE_MIN);  // set min value

socket.on('probeTempF', (e) => {
  updateGaugeValue(e)
})

function updateGaugeValue(e) {
  document.querySelector('.dispValue').innerHTML = pad(parseFloat(e).toFixed(1)) + ' F'
  gauge.set(Math.min(Math.max(e*10, GAUGE_MIN), GAUGE_MAX))
}

function pad(e) {
  return String(e).padStart(5, ' ')
}

