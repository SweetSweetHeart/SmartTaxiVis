/**
 * @author Qiru Wang 689404@swansea.ac.uk
 * 
 * @module Vis/ChordDiagram
 * @requires Helper
 */
function generateChordDiagram() {
  if ($('#chordTrip').is(':checked')) {
    DATA_HOLDER = $.extend(true, [], TRIP_MATRIX[TIME1]);
    zoneT = $.extend(true, [], ZONE_PU_MATRIX);
  } else if ($('#chordPrice').is(':checked')) {
    DATA_HOLDER = $.extend(true, [], PRICE_MATRIX[TIME1]);
    zoneT = $.extend(true, [], ZONE_AVG_PRICE_MATRIX);
  } else if ($('#chordDistance').is(':checked')) {
    DATA_HOLDER = $.extend(true, [], DISTANCE_MATRIX[TIME1]);
    zoneT = $.extend(true, [], ZONE_AVG_DISTANCE_MATRIX);
  }

  TOTALZONENUM = DATA_HOLDER.length;

  ZONESLIDER.noUiSlider.updateOptions({
    range: {
      'min': 1,
      'max': DATA_HOLDER.length
    }
  });

  ZONE_HOLDER = $.extend(true, [], zoneT[TIME1]);
  spliceMatrix(ZONE_HOLDER);
  spliceMatrix(DATA_HOLDER);
  spliceSubTripMatrix(DATA_HOLDER);
  var counts = getTotalDataCount(DATA_HOLDER);
  setDataCountHTML(counts[0]);
  generateColorForZone(ZONE_HOLDER, counts[1], counts[2]);
}

/**
 * Trigger all necessary functions when data is changed. E.g. Re-render Chord Diagram, Map Diagram and Histogram.
 * Also update the visibility of some HTML elements.
 */
function formatJSON() {
  generateChordDiagram();
  generateHistogram();
  generateMap();
  /** 
   * Dataset for AnyMap. 
   * @see {@link https://api.anychart.com/7.14.3/anychart.data.Set} 
   * @type {anychart.data.Set} 
   */
  const dataSet = anychart.data.set(ZONE_HOLDER);
  connectorData = null;

  updateChordDiagram(DATA_HOLDER);

}


/**
 * Highlight the current range of colors used on the colormap legend. Also reset global variables: lowerColor and higherColor.
 * @deprecated since issue #12 Dynamic ranged colormap.
 * @param {number} low - The hue of the color for the largest data value.
 * @param {number} high - The hud of the color for the smallest data value.
 */
function highlightColormapLegend(low, high) {
  const colorInterval = 3;

  $('#chordColorLegend font').css({
    "border-style": "none ",
    "border-width": "7px"
  });

  $('#color' + Math.ceil(low / colorInterval) * colorInterval).css({
    "border-style": "solid none solid solid"
  });

  $('#color' + Math.ceil((high / colorInterval) - 1) * colorInterval).css({
    "border-style": "solid solid solid none"
  });

  for (var index = (Math.ceil(low / colorInterval) + 1) * colorInterval; index < Math.ceil((high / colorInterval) - 1) * colorInterval; index += colorInterval) {
    $('#color' + index).css({
      "border-style": "solid none solid none"
    });
  }
}


/**
 * Start the animation for Chord Diagram.
 * 
 */
function chordAnimation() {
  const lastHour = 23;
  const animationInterval = 3000;
  isPaused = false;
  interval = setInterval(() => {
    if (!isPaused) {
      TIME1++;
      if (TIME1 > lastHour) {
        TIME1 = 0;
      }
      animationSetData();
    }
  }, animationInterval);
}


/**
 * Update hourSlider and HTML element 'Hour of the day' to the corresponding hour animated.
 * 
 */
function animationSetData() {
  hourSlider.noUiSlider.set(TIME1);
  setHourHTML(TIME1);
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
 * Generate a legend for Chord Diagram based on the color map used.
 * @deprecated since issue #13 Dynamically update zoneSlider's range. 
 */
function generateChordColorLegend() {
  var text = "";
  for (var index = 0; index < 20; index++) {
    text += `<font id="color${index}" style="color:hsl(${index*11},90%,53%)">█</font>`;
  }
  console.log(text);

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
 * Initialise a Chord Diagram.
 * 
 */
function initChordDiagram() {
  const targetSize = $('#chordDiagram').width() * 0.85;

  const marginBetweenLabelAndChord = 50;
  const chordRadiusWidth = 18;
  const half = 2;

  $(window).resize(() => {
    const svg = d3.select('#chordDiagram')
      .attr('width', targetSize)
      .attr('height', targetSize);

    outerRadius = targetSize / half - marginBetweenLabelAndChord;
    innerRadius = outerRadius - chordRadiusWidth;

    arc = d3.svg.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    path = d3.svg.chord()
      .radius(innerRadius);

    $('#circle').attr('r', outerRadius);
    $('[data-toggle="popover"]').popover('show');
  });

  outerRadius = targetSize / half - marginBetweenLabelAndChord;
  innerRadius = outerRadius - chordRadiusWidth;

  viewBoxDimensions = `0 0 ${targetSize} ${targetSize}`;

  // Create the arc path data generator for the groups
  arc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

  // Create the chord path data generator for the chords
  path = d3.svg.chord()
    .radius(innerRadius);

  LASTLAYOUT = getDefaultLayout(); // store layout between updates


  // Initialize the visualization
  g = d3.select('#chordDiagram').append('svg')
    .attr('viewBox', viewBoxDimensions)
    .attr('preserveAspectRatio', 'xMinYMid')
    .append('g')
    .attr('id', 'circle')
    .attr('overflow-x', 'visible')
    .attr('transform',
      `translate(${targetSize / half},${targetSize / half})`);

  g.append('circle')
    .attr('r', outerRadius);
}

/** 
 * Format the text appeared when mouse hover the path. 
 *  
 * @param {string} path - A JSON string that contains the source and the target chord of the path. 
 * @param {boolean} innerZone - If the path if representing the inner zone trips. 
 * @returns {string} - THe text appeared when mouse hover the path. 
 */
function formatPathTitle(path) {
  var label = "";
  var prefix = "";
  var suffix = "";
  var dataFixer = 100;
  var formatNumber = d3.format('.2f');
  var dimension = getDataDimension();
  var innerZone = ZONE_HOLDER[path.target.index].ZoneName === ZONE_HOLDER[path.source.index].ZoneName;

  /** For inner zone trip, source and target are referenced, multiply by 100 to avoid double division later */
  if (innerZone && dimension !== 'trip')
    path.source.value = path.source.value * dataFixer;

  if (dimension === 'trip') {
    formatNumber = d3.format('2,f');
    path.source.value = formatNumber(path.source.value);
    path.target.value = formatNumber(path.target.value);
    label = " trips from ";
  } else if (dimension === 'price') {
    path.source.value = formatNumber(path.source.value / dataFixer);
    path.target.value = formatNumber(path.target.value / dataFixer);
    label = " from ";
    prefix = "$";
    suffix = " for ";
  } else if (dimension === 'distance') {
    path.source.value = formatNumber(path.source.value / dataFixer);
    path.target.value = formatNumber(path.target.value / dataFixer);
    label = " km from ";
    suffix = " km for ";
  }
  if (!innerZone) {
    return [prefix, path.source.value,
      label,
      ZONE_HOLDER[path.source.index].ZoneName,
      ' to ',
      ZONE_HOLDER[path.target.index].ZoneName,
      '\n',
      prefix, path.target.value,
      label,
      ZONE_HOLDER[path.target.index].ZoneName,
      ' to ',
      ZONE_HOLDER[path.source.index].ZoneName,
    ].join('');
  } else {
    return prefix + path.source.value +
      suffix + " inner zone trips within " +
      ZONE_HOLDER[path.source.index].ZoneName;
  }
}

/** 
 * Format the text appeared when mouse hover the chord. 
 *  
 * @param {string} chord - A JSON string that contains the chord. 
 * @param {number} index - The index of the taxi zone represented by the chord. 
 * @returns {string} - The text appeared when mouse hover the chord. 
 */
function formatChordTitle(chord, index) {
  var label = "";
  var prefix = "";
  var formatNumber = d3.format('.2f');
  var dataFixer = 100;

  var dimension = getDataDimension();
  if (dimension === 'trip') {
    formatNumber = d3.format('2,f');
    chord.value = formatNumber(chord.value);
    label = " trips ";
    return prefix + chord.value + label + `for ${ZONE_HOLDER[index].ZoneName}`;
  }
  // else if (dimension === 'price') {
  //   chord.value = formatNumber(chord.value / dataFixer);
  //   label = " sum of average fare ";
  //   prefix = "$";
  // } else if (dimension === 'distance') {
  //   chord.value = formatNumber(chord.value / dataFixer);
  //   label = " sum of average distance ";
  // }
}

/**
 * Update the chords for Chord Diagram. Add event listeners, transition effects and many minor tweaks to Chord Diagram.
 * 
 * @param {Array.<number[]>} matrix - A matrix that contains the input data.
 */
function updateChordDiagram(matrix) {

  var durationLong = 800;
  var durationShort = 10;
  var opacity = .5;
  // Remove empty svg generated by animation loop.
  $('svg[width=0]').remove();
  layout = getDefaultLayout();
  layout.matrix(matrix);

  // Create/update "group" elements
  const groupG = g.selectAll('g.group')
    .data(layout.groups(), d => d.index);

  groupG.exit().transition().duration(durationLong)
    .attr('opacity', opacity).remove(); // Remove after transitions are complete

  const newGroups = groupG.enter().append('g').attr('class', 'group');

  // Create the title tooltip for the new groups
  newGroups.append('title');

  // Update the (tooltip) title text based on the data
  groupG.select('title').text((d, i) => formatChordTitle(d, i));

  // create the arc paths and set the constant attributes
  // (those based on the group index, not on the value)
  newGroups.append('path').attr('id', d => `group${d.index}`)
    .style('fill', d => ZONE_HOLDER[d.index].color);

  // Update the paths to match the layout and color
  groupG.select('path').transition().duration(durationLong)
    .attr('opacity', opacity).attr('d', arc)
    .attrTween('d', arcTween(LASTLAYOUT))
    .style('fill', d => ZONE_HOLDER[d.index].color)
    .transition().duration(durationShort).attr('opacity', 1) // reset opacity
  ;

  newGroups.append('svg:text').attr('xlink:href', d => `#group${d.index}`)
    .attr('dy', '.35em').attr('color', '#fff')
    .text(d => ZONE_HOLDER[d.index].ZoneName);

  // Position group labels to match layout
  groupG.select('text').transition().duration(durationLong)
    .text(d => ZONE_HOLDER[d.index].ZoneName)
    .attr('transform', (d) => {
      return calculateLabelRotation(d);
    })
    .attr('text-anchor', d => (d.angle > Math.PI ? 'end' : 'begin'));

  const chordPaths = g.selectAll('path.chord')
    .data(layout.chords(), chordKey);

  const newChords = chordPaths.enter()
    .append('path').attr('class', 'chord');

  newChords.append('title');

  chordPaths.select('title')
    .text((d) => {
      return formatPathTitle(d);
    });

  chordPaths.exit().transition()
    .duration(durationLong)
    .attr('opacity', 0).remove();

  chordPaths.transition().duration(durationLong)
    .attr('opacity', opacity)
    .style('fill', d => ZONE_HOLDER[d.source.index].color)
    .attrTween('d', chordTween(LASTLAYOUT)).attr('d', path)
    .transition().duration(durationShort).attr('opacity', 1);

  groupG.on('mouseover', (d) => {
    toggleAnimation(true);
    chordPaths.classed('fade', p => ((p.source.index != d.index) && (p.target.index != d.index)));
  });

  chordPaths.on('mouseover', function (d) {
    toggleAnimation(true);
    chordPaths.attr('opacity', 0.2);
    $(this).attr('opacity', 1);
  });

  groupG.on('click', (d) => {
    chordToConnector(d.index);
  });

  chordPaths.on('click', (d) => {
    pathToConnector(ZONE_HOLDER[d.source.index], ZONE_HOLDER[d.target.index]);
  });

  chordPaths.on('mouseout', () => {
    chordPaths.attr('opacity', opacity);
  });
  g.on('mouseout', function () {
    if (this == g.node()) {
      // Only respond to mouseout of the entire circle not mouseout events for sub-components
      chordPaths.classed('fade', false);
    }
  });
  LASTLAYOUT = layout;
}

/**
 * Calculate the rotation angle for label of the chord.
 * 
 * @param {string} input - Contains the JSON data for a chord
 * @returns The rotation and translation angles for the label.
 */
function calculateLabelRotation(input) {
  input.angle = (input.startAngle + input.endAngle) / 2;
  return `rotate(${input.angle * 180 / Math.PI - 90})` +
    ` translate(${innerRadius + 26})${
      input.angle > Math.PI ? ' rotate(180)' : ' rotate(0)'}`;
}

/**
 * Format the data from the clicked paht on Chord Diagram, and display the connector on Map.
 * 
 * @param {string} source - The origination taxi zone.
 * @param {string} target - The destination taxi zone.
 */
function pathToConnector(source, target) {
  const pointData = getConnector(source.ZoneId, target.ZoneId);
  if (source.ZoneId != target.ZoneId) {
    /** 
     * Connector dataset for AnyMap.
     * @see {@link https://docs.anychart.com/7.14.3/Maps/Connector_Maps}
     * @type {anychart.data.Set} 
     */
    const connectorData = [{
      points: pointData,
      from: source.ZoneName,
      to: target.ZoneName,
      data: source.Data,
      color: source.color,
      weight: 0
    }];
    addConnectorSeries(connectorData);
  } else {
    removeMapSeries('connector');
  }

  highlightPoint(source, true);
  toggleAnimation(true);
}

function chordToConnector(index) {
  var source = ZONE_HOLDER[index];
  var connectorData = [];
  jQuery.each(DATA_HOLDER[index], (i, val) => {
    if (index !== i && val !== 0) {
      var pointData = getConnector(source.ZoneId, ZONE_HOLDER[i].ZoneId);
      var connector = {};
      connector.points = pointData;
      connector.from = source.ZoneName;
      connector.to = ZONE_HOLDER[i].ZoneName;
      connector.data = val;
      connector.weight = val / source.Data;
      connector.color = ZONE_HOLDER[i].color;
      connectorData.push(connector);
    }
  });
  addConnectorSeries(connectorData);
  highlightPoint(source, false);
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