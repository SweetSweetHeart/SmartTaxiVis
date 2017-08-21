/**
 * @author Qiru Wang 689404@swansea.ac.uk
 * 
 * @module Vis/ChordDiagram
 * @requires Initialiser
 */


/**
 * Trigger all necessary functions when data is changed. E.g. Re-render Chord Diagram, Map Diagram and Histogram.
 * Also update the visibility of some HTML elements.
 */
function formatJSON() {
  data = $.extend(true, [], tripT[TIME1]);

  // data = $.extend(true, [], distanceT[TIME1]);

  // data = $.extend(true, [], priceT[TIME1]);

  zones = $.extend(true, [], zoneT[TIME1]);
  spliceMatrix(zones);
  spliceMatrix(data);
  spliceSubTripMatrix(data);

  let dataCount = 0;

  jQuery.each(data, (i, val) => {
    dataCount += getDataCount(val);
  });


  // Assign colors to chords    
  jQuery.each(zones, (i, val) => {
    val.color = generateRainBowColorMap(getDataCount(data[i]), dataCount);
    //console.log(getDataCount(data[i]), dataCount);
  });

  highlightColormap(lowerColor, higherColor);

  // generateChordColorLegend(); /** Not needed for the moment. */
  generateHistogram();

  $('#dataCount').html(dataCount);

  /** 
   * Dataset for AnyMap. 
   * @see {@link https://api.anychart.com/7.14.3/anychart.data.Set} 
   * @type {anychart.data.Set} 
   */
  const dataSet = anychart.data.set(zones);
  connectorData = null;

  if (dataCount > 0) {
    toggleNoMatchMessage(false);
    renderMap();
    updateChordDiagram(data);
  } else {
    toggleNoMatchMessage(true);
  }




  // var colorHTML = "";
  // for (var index = 0; index < 100; index += 3) {
  //   colorHTML += '<font id="color' + index + '" style="color:hsl(' + index + ',90%,53%)">█</font>';

  // }
  // console.log(colorHTML);
}


function highlightColormap(low, high) {

  $('#chordColorLegend font').css({
    "border-style": "none",
    "border-width": "7px"
  });

  $('#color' + Math.ceil(low / 3) * 3).css({
    "border-style": "solid none solid solid"
  });

  $('#color' + Math.ceil(high / 3) * 3).css({
    "border-style": "solid solid solid none"
  });

  for (var index = (Math.ceil(low / 3) + 1) * 3; index < Math.ceil(high / 3) * 3; index += 3) {
    $('#color' + index).css({
      "border-style": "solid none solid none"
    });
  }

  lowerColor = 100;
  higherColor = 0;
}

/**
 * Start the animation for Chord Diagram.
 * 
 */
function chordAnimation() {
  isPaused = false;
  interval = setInterval(() => {
    if (!isPaused) {
      TIME1++;
      if (TIME1 > 23) {
        TIME1 = 0;
      }
      animationSetData();
    }
  }, 3000);
}


/**
 * Update hourSlider and HTML element 'Hour of the day' to the corresponding hour animated.
 * 
 */
function animationSetData() {
  hourSlider.noUiSlider.set(TIME1);
  $('#hour').html(TIME1);
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
 * Calculate the given data count.
 * 
 * @param {string} data - The input data count data in JSON.
 * @returns {number} - The total data count.
 */
function getDataCount(data) {
  let result = 0;
  jQuery.each(data, (i, val) => {
    result += parseInt(val);
  });
  return result;
}


var lowerColor = 100;
var higherColor = 0;

/**
 * Generate a rainbow color map based on the ratio of data count and the total data count.
 * 
 * @param {number} trips  - Trip count of one zone as the dividend.
 * @param {number} totalTrips - Total data count of all zones as the divisor.
 * @returns - A HSL color.
 */
function generateRainBowColorMap(trips, totalTrips) {
  if (trips / totalTrips) {

  }

  const i = Math.round(100 - Math.abs(1 - (trips * TOTALZONENUM / totalTrips * 2.8)));
  console.log(trips / totalTrips, i);

  if (lowerColor > i)
    lowerColor = i;

  if (higherColor < i)
    higherColor = i;

  return `hsl(${i},83%,50%)`;
}


// function generateRainBowColorMap(trips, totalTrips) {
//   var i = trips / totalTrips * 50;

//   console.log(trips, totalTrips, i);

//   var r = Math.sin(0.1 * i + 0) * 127 + 128;
//   var g = Math.sin(0.2 * i + 2) * 127 + 128;
//   var b = Math.sin(0.3 * i + 4) * 127 + 128;


//   return `rgb(${r},${g},${b})`;
// }

/**
 * Generate a legend for Chord Diagram based on the color map used.
 * 
 */
function generateChordColorLegend() {
  $('#chordColorLegend').empty();
  $('#chordColorLegend').append('Legend: &nbsp; &nbsp; &nbsp; Max ');

  chordLegendColor = Array.from(new Set(chordLegendColor));
  chordLegendColor.sort((a, b) => a - b);
  let last;
  jQuery.each(chordLegendColor, (i, val) => {
    if ((last == null) || (last != null && val > (last + 1))) {
      $('#chordColorLegend').append(`<font style=color:hsl(${val},90%,53%)>█</font>`);
    }
    last = val;
  });
  $('#chordColorLegend').append(' Min');
  chordLegendColor = [];
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
  matrix.splice(0, ZONE1);
  matrix.splice(ZONE2 - ZONE1 + 1, TOTALZONENUM - ZONE2);
  return matrix;
}

/**
 * Splice the input nested array based on the zones selected, for data count matrix.
 * 
 * @param {number[]} matrix - The input data matrix.
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
 * @param {Array.<number[]>} matrix - The input data matrix of data
 */
function updateChordDiagram(matrix) {
  // Remove empty svg generated by animation loop.
  $('svg[width=0]').remove();
  layout = getDefaultLayout();
  layout.matrix(matrix);

  // Create/update "group" elements
  const groupG = g.selectAll('g.group')
    .data(layout.groups(), d =>
      d.index

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
      zones[i].ZoneName}`);

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
    .text(d => zones[d.index].ZoneName);

  // Position group labels to match layout
  groupG.select('text')
    .transition()
    .duration(800)
    .text(d => zones[d.index].ZoneName)
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
      if (zones[d.target.index].ZoneName !== zones[d.source.index].ZoneName) {
        return [numberWithCommas(d.source.value),
          ' trips from ',
          zones[d.source.index].ZoneName,
          ' to ',
          zones[d.target.index].ZoneName,
          '\n',
          numberWithCommas(d.target.value),
          ' trips from ',
          zones[d.target.index].ZoneName,
          ' to ',
          zones[d.source.index].ZoneName,
        ].join('');
      }
      return `${numberWithCommas(d.source.value)
        } trips started and ended in ${
        zones[d.source.index].ZoneName}`;
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
    const pointData = getConnector(zones[d.source.index].ZoneId, zones[d.target.index].ZoneId);
    if (zones[d.source.index].ZoneId != zones[d.target.index].ZoneId) {
      /** 
       * Connector dataset for AnyMap.
       * @see {@link https://docs.anychart.com/7.14.3/Maps/Connector_Maps}
       * @type {anychart.data.Set} 
       */
      const connectorData = [{
        points: pointData,
        from: zones[d.source.index].ZoneName,
        to: zones[d.target.index].ZoneName,
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