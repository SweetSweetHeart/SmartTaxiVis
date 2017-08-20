﻿/**
 * @author Qiru Wang 689404@swansea.ac.uk
 * 
 * @module Vis/ChordDiagram
 * @requires Initialiser
 */

/**
 * Start the animation for Chord Diagram.
 * 
 */
function chordAnimation() {
  isPaused = false;
  interval = setInterval(() => {
    if (!isPaused) {
      time1++;
      if (time1 > 23) {
        time1 = 0;
      }
      animationSetData();
    }
  }, 3000);
}


/**
 * Update variables zoneMatrix ,tripMatrix, and HTML element 'Hour of the day' to the corresponding hour animated.
 * 
 */
function animationSetData() {
  // zoneMatrix = zoneT[time1];
  // tripMatrix = tripT[time1];
  hourSlider.noUiSlider.set(time1);
  $('#hour').html(time1);
  formatJSON();
}


/**
 * Toggle the animation state based on the input boolean value.
 * @param {boolean} pausing - The input boolean value.
 */
function toggleAnimation(pausing) {
  if (pausing) {
    isPaused = true;
    $('#btn_pause').html("<i class='fa fa-play' aria-hidden='true'></i>&nbsp;&nbsp;Animation");
  } else if (!isPaused) {
    isPaused = true;
    $('#btn_pause').html("<i class='fa fa-play' aria-hidden='true'></i>&nbsp;&nbsp;Animation");
  } else {
    isPaused = false;
    $('#btn_pause').html("<i class='fa fa-pause' aria-hidden='true'></i>&nbsp;&nbsp;Animation");
  }
}


/**
 * Sort the Chord Diagram.
 * @see {@link https://github.com/d3/d3-3.x-api-reference/blob/master/Chord-Layout.md#chord}
 * @returns {d3.layout} - The sorted D3 Chord Diagram layout.
 */
function getDefaultLayout() {
  return d3.layout.chord()
    .padding(0.03)
    .sortSubgroups(d3.descending)
    .sortChords(d3.ascending);
}

/**
 * Calculate the given trip count.
 * 
 * @param {string} data - The input trip count data in JSON.
 * @returns {number} - The total trip count.
 */
function getTripCount(data) {
  let result = 0;
  jQuery.each(data, (i, val) => {
    result += parseInt(val);
  });
  return result;
}


/**
 * Generate a rainbow color map based on the ratio of trips and the total trip count.
 * 
 * @param {number} trips  - Trip count of one zone as the dividend.
 * @param {number} totalTrips - Total trip count of all zones as the divisor.
 * @returns - A RGB color.
 */
function generateRainBowColorMap(trips, totalTrips) {
  const i = Math.round(100 - Math.abs(1 - (trips * totalZoneNum / 5000)));
  // chordLegendColor.push(i);
  return `hsl(${i},83%,50%)`;
}


/**
 * Generate a legend for Chord Diagram based on the color map used.
 * 
 */
function generateChordColorLegend() {
  $('#chordColorLegend').empty();
  $('#chordColorLegend').append('Legend: &nbsp; &nbsp; &nbsp; Max ');

  console.log(chordLegendColor);

  chordLegendColor = Array.from(new Set(chordLegendColor));
  chordLegendColor.sort((a, b) => a - b);
  let last;
  jQuery.each(chordLegendColor, (i, val) => {
    if ((last == null) || (last != null && val > (last + 1))) {
      $('#chordColorLegend').append(`<font style=color:hsl(${val},80%,53%)>█</font>`);
    }
    last = val;
  });
  $('#chordColorLegend').append(' Min');
  chordLegendColor = [];
}

/**
 * Trigger all necessary functions when data is changed. E.g. Re-render Chord Diagram, Map Diagram and Histogram.
 * Also update the visibility of some HTML elements.
 */
function formatJSON() {
  trips = $.extend(true, [], tripT[time1]);
  zones = $.extend(true, [], zoneT[time1]);
  spliceMatrix(zones);
  spliceMatrix(trips);
  spliceSubTripMatrix(trips);

  let tripCount = 0;

  jQuery.each(trips, (i, val) => {
    tripCount += getTripCount(val);
  });

  // Assign random colors to chords    
  jQuery.each(zones, (i, val) => {
    val.color = generateRainBowColorMap(val.Pickup, tripCount);
  });

  // generateChordColorLegend(); /** Not needed for the moment. */
  generateHistogram();

  $('#tripCount').html(tripCount);

  /** 
     * Dataset for AnyMap. 
     * @see {@link https://api.anychart.com/7.14.3/anychart.data.Set} 
     * @type {anychart.data.Set} 
     */
  const dataSet = anychart.data.set(zones);
  connectorData = null;

  if (tripCount > 0) {
    toggleNoMatchMessage(false);
    renderMap();
    updateChordDiagram(trips);
  } else {
    toggleNoMatchMessage(true);
  }
}


/**
 * Toggle the display of 'No Match' message, visulisations and controls.
 * 
 * @param {boolean} toggle - If True: displays the message.
 */
function toggleNoMatchMessage(toggle) {
  if (!toggle) {
    $('.visualisationRow:hidden').show();
    $('.controlRow:hidden').show();
    $('#nomatch:visible').hide();
  } else {
    $('.visualisationRow:visible').hide();
    $('.controlRow:visible').hide();
    $('#nomatch:hidden').show();
  }
}


/**
 * Splice the input array based on the zones selected.
 * 
 * @param {number[]|string[]} matrix - The input array with all zones.
 * @returns {number[]|string[]} - The spliced array with the selected zones only.
 */
function spliceMatrix(matrix) {
  matrix.splice(0, zone1);
  matrix.splice(zone2 - zone1 + 1, totalZoneNum - zone2);
  return matrix;
}

/**
 * Splice the input nested array based on the zones selected, for trip count matrix.
 * 
 * @param {number[]} matrix - The input trip matrix.
 * @returns  {number[]} - The spliced array with the selected zones only.
 */

function spliceSubTripMatrix(matrix) {
  jQuery.each(matrix, (i, val) => {
    spliceMatrix(val);
  });
  return matrix;
}

/**
 * Initialise a Chord Diagram.
 * 
 */
function initChordDiagram() {
  const targetSize = $('#chordDiagram').width() * 0.85;
  const marginSide = $('#chordDiagram').width() * 0.075;

  $(window).resize(() => {
    const svg = d3.select('#chordDiagram')
      .attr('width', targetSize)
      .attr('height', targetSize);

    outerRadius = Math.min(targetSize, targetSize) / 2 - 50;
    innerRadius = outerRadius - 18;

    arc = d3.svg.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    path = d3.svg.chord()
      .radius(innerRadius);

    $('#circle').attr('r', outerRadius);
    $('[data-toggle="popover"]').popover('show');
  });

  outerRadius = Math.min(targetSize, targetSize) / 2 - 50;
  innerRadius = outerRadius - 18;

  viewBoxDimensions = `0 0 ${targetSize} ${targetSize}`;

  // Create the arc path data generator for the groups
  arc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

  // Create the chord path data generator for the chords
  path = d3.svg.chord()
    .radius(innerRadius);

  lastLayout = getDefaultLayout(); // store layout between updates

  // Create number formatting functions
  const formatPercent = d3.format('%');
  numberWithCommas = d3.format('0,f');

  // Initialize the visualization
  g = d3.select('#chordDiagram').append('svg')
    .attr('viewBox', viewBoxDimensions)
    .attr('preserveAspectRatio', 'xMinYMid')
    .append('g')
    .attr('id', 'circle')
    .attr('overflow-x', 'visible')
    .attr('transform',
      `translate(${targetSize / 2},${targetSize / 2})`);

  g.append('circle')
    .attr('r', outerRadius);
}

/**
 * Update the chords for Chord Diagram. Add event listeners, transition effects and many minor tweaks to Chord Diagram.
 * 
 * @param {Array.<number[]>} matrix - The input data matrix of trips
 */
function updateChordDiagram(matrix) {
  // Remove empty svg generated by animation loop.
  $('svg[width=0]').remove();
  layout = getDefaultLayout();
  layout.matrix(matrix);

  // Create/update "group" elements
  const groupG = g.selectAll('g.group')
    .data(layout.groups(), d =>
      d.index,

      // use a key function in case the
      // groups are sorted differently between updates
    );

  groupG.exit()
    .transition()
    .duration(800)
    .attr('opacity', 0.5)
    .remove(); // Remove after transitions are complete

  const newGroups = groupG.enter().append('g')
    .attr('class', 'group');

    // The enter selection is stored in a variable so we can
    // Enter the <path>, <text>, and <title> elements as well

    // Create the title tooltip for the new groups
  newGroups.append('title');

  // Update the (tooltip) title text based on the data
  groupG.select('title')
    .text((d, i) => `${numberWithCommas(d.value)
    } trips started in ${
      zones[i].name}`);

  // create the arc paths and set the constant attributes
  // (those based on the group index, not on the value)
  newGroups.append('path')
    .attr('id', d => `group${d.index}`)
    .style('fill', d => zones[d.index].color);

  // Update the paths to match the layout and color
  groupG.select('path')
    .transition()
    .duration(800)
    .attr('opacity', 0.5)
    .attr('d', arc)
    .attrTween('d', arcTween(lastLayout))
    .style('fill', d => zones[d.index].color)
    .transition().duration(10).attr('opacity', 1) // reset opacity
  ;

  newGroups.append('svg:text')
    .attr('xlink:href', d => `#group${d.index}`)
    .attr('dy', '.35em')
    .attr('color', '#fff')
    .text(d => zones[d.index].name);

  // Position group labels to match layout
  groupG.select('text')
    .transition()
    .duration(800)
    .text(d => zones[d.index].name)
    .attr('transform', (d) => {
      d.angle = (d.startAngle + d.endAngle) / 2;

      // Store the midpoint angle in the data object

      return `rotate(${d.angle * 180 / Math.PI - 90})` +
                ` translate(${innerRadius + 26})${
                  d.angle > Math.PI ? ' rotate(180)' : ' rotate(0)'}`;

      // Include the rotate zero so that transforms can be interpolated
    })
    .attr('text-anchor', d => (d.angle > Math.PI ? 'end' : 'begin'));

  const chordPaths = g.selectAll('path.chord')
    .data(layout.chords(), chordKey);

  const newChords = chordPaths.enter()
    .append('path')
    .attr('class', 'chord');

  newChords.append('title');

  chordPaths.select('title')
    .text((d) => {
      if (zones[d.target.index].name !== zones[d.source.index].name) {
        return [numberWithCommas(d.source.value),
          ' trips from ',
          zones[d.source.index].name,
          ' to ',
          zones[d.target.index].name,
          '\n',
          numberWithCommas(d.target.value),
          ' trips from ',
          zones[d.target.index].name,
          ' to ',
          zones[d.source.index].name,
        ].join('');
      }
      return `${numberWithCommas(d.source.value)
      } trips started and ended in ${
        zones[d.source.index].name}`;
    });

  chordPaths.exit().transition()
    .duration(800)
    .attr('opacity', 0)
    .remove();

  chordPaths.transition()
    .duration(800)
    .attr('opacity', 0.5)
    .style('fill', d => zones[d.source.index].color)
    .attrTween('d', chordTween(lastLayout))
    .attr('d', path)
    .transition().duration(10).attr('opacity', 1);

  groupG.on('mouseover', (d) => {
    toggleAnimation(true);
    chordPaths.classed('fade', p => ((p.source.index != d.index) && (p.target.index != d.index)));
  });

  chordPaths.on('mouseover', function (d) {
    toggleAnimation(true);
    chordPaths.attr('opacity', 0.2);
    $(this).attr('opacity', 1);
  });

  chordPaths.on('click', (d) => {
    const pointData = getConnector(zones[d.source.index].id, zones[d.target.index].id);
    if (zones[d.source.index].id != zones[d.target.index].id) {
      /** 
             * Connector dataset for AnyMap.
             * @see {@link https://docs.anychart.com/7.14.3/Maps/Connector_Maps}
             * @type {anychart.data.Set} 
             */
      const connectorData = [{
        points: pointData,
        from: zones[d.source.index].name,
        to: zones[d.target.index].name,
      }];
      addConnectorSeries(connectorData);
      highlightPoint(zones[d.source.index]);
    } else {
      removeMapSeries('connector');
      highlightPoint(zones[d.source.index]);
    }
    toggleAnimation(true);
  });
  chordPaths.on('mouseout', () => {
    chordPaths.attr('opacity', 0.5);

    // toggleAnimation(false);
  });
  g.on('mouseout', function () {
    if (this == g.node()) {
      // Only respond to mouseout of the entire circle not mouseout events for sub-components
      chordPaths.classed('fade', false);
    }
  });
  lastLayout = layout;
}

function arcTween(oldLayout) {
  const oldGroups = {};
  if (oldLayout) {
    oldLayout.groups().forEach((groupData) => {
      oldGroups[groupData.index] = groupData;
    });
  }
  return function (d, i) {
    let tween;
    const old = oldGroups[d.index];
    if (old) { // There's a matching old group
      tween = d3.interpolate(old, d);
    } else {
      // Create a zero- width arc object
      const emptyArc = {
        startAngle: d.startAngle,
        endAngle: d.startAngle,
      };
      tween = d3.interpolate(emptyArc, d);
    }
    return function (t) {
      return arc(tween(t));
    };
  };
}

function chordKey(data) {
  return (data.source.index < data.target.index) ?
    `${data.source.index}-${data.target.index}` :
    `${data.target.index}-${data.source.index}`;
}

function chordTween(oldLayout) {
  const oldChords = {};
  if (oldLayout) {
    oldLayout.chords().forEach((chordData) => {
      oldChords[chordKey(chordData)] = chordData;
    });
  }
  return function (d, i) {
    let tween;
    let old = oldChords[chordKey(d)];
    if (old) {
      if (d.source.index != old.source.index) {
        old = {
          source: old.target,
          target: old.source,
        };
      }
      tween = d3.interpolate(old, d);
    } else {
      // Create a zero- width chord object
      const emptyChord = {
        source: {
          startAngle: d.source.startAngle,
          endAngle: d.source.startAngle,
        },
        target: {
          startAngle: d.target.startAngle,
          endAngle: d.target.startAngle,
        },
      };
      tween = d3.interpolate(emptyChord, d);
    }
    return function (t) {
      return path(tween(t));
    };
  };
}