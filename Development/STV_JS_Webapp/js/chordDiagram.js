/**
 * @author Qiru Wang 689404@swansea.ac.uk
 * 
 * @module Vis/ChordDiagram
 * @requires Helper
 */
function generateChordDiagram() {
  if ($('#chordTrip').is(':checked')) {
    data = $.extend(true, [], TRIPMATRIX[TIME1]);
    zoneT = $.extend(true, [], ZONE_PUMATRIX);
  } else if ($('#chordPrice').is(':checked')) {
    data = $.extend(true, [], PRICEMATRIX[TIME1]);
    zoneT = $.extend(true, [], ZONE_AVG_PRICEMATRIX);
  } else if ($('#chordDistance').is(':checked')) {
    data = $.extend(true, [], DISTANCEMATRIX[TIME1]);
    zoneT = $.extend(true, [], ZONE_AVG_DISTANCEMATRIX);
  }

  TOTALZONENUM = data.length;

  ZONESLIDER.noUiSlider.updateOptions({
    range: {
      'min': 1,
      'max': data.length
    }
  });

  ZONES = $.extend(true, [], zoneT[TIME1]);
  spliceMatrix(ZONES);
  spliceMatrix(data);
  spliceSubTripMatrix(data);
  var counts = getTotalDataCount(data);
  $('#dataCount').html(counts[0]);
  generateColorForZone(ZONES, counts[1], counts[2]);
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
  const dataSet = anychart.data.set(ZONES);
  connectorData = null;

  updateChordDiagram(data);

}


/**
 * Highlight the current range of colors used on the colormap legend. Also reset global variables: lowerColor and higherColor.
 * @deprecated since issue #12 Dynamic ranged colormap.
 * @param {number} low - The hue of the color for the largest data value.
 * @param {number} high - The hud of the color for the smallest data value.
 */
function highlightColormapLegend(low, high) {
  $('#chordColorLegend font').css({
    "border-style": "none ",
    "border-width": "7px"
  });

  $('#color' + Math.ceil(low / 3) * 3).css({
    "border-style": "solid none solid solid"
  });

  $('#color' + Math.ceil((high / 3) - 1) * 3).css({
    "border-style": "solid solid solid none"
  });

  for (var index = (Math.ceil(low / 3) + 1) * 3; index < Math.ceil((high / 3) - 1) * 3; index += 3) {
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
 * Generate a legend for Chord Diagram based on the color map used.
 * @deprecated since issue #13 Dynamically update zoneSlider's range. 
 */
function generateChordColorLegend() {
  $('#chordColorLegend').empty();
  $('#chordColorLegend').append('Legend: &nbsp; &nbsp; &nbsp; Max ');

  m_chordLegendColor = Array.from(new Set(m_chordLegendColor));
  m_chordLegendColor.sort((a, b) => a - b);
  let m_last;
  jQuery.each(m_chordLegendColor, (i, val) => {
    if ((m_last == null) || (m_last != null && val > (m_last + 1))) {
      $('#chordColorLegend').append(`<font style=color:hsl(${val},90%,53%)>█</font>`);
    }
    m_last = val;
  });
  $('#chordColorLegend').append(' Min');
  m_chordLegendColor = [];
}



/**
 * Initialise a Chord Diagram.
 * 
 */
function initChordDiagram() {
  const m_targetSize = $('#chordDiagram').width() * 0.85;
  const m_marginSide = $('#chordDiagram').width() * 0.075;

  $(window).resize(() => {
    const svg = d3.select('#chordDiagram')
      .attr('width', m_targetSize)
      .attr('height', m_targetSize);

    outerRadius = Math.min(m_targetSize, m_targetSize) / 2 - 50;
    innerRadius = outerRadius - 18;

    arc = d3.svg.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    path = d3.svg.chord()
      .radius(innerRadius);

    $('#circle').attr('r', outerRadius);
    $('[data-toggle="popover"]').popover('show');
  });

  outerRadius = Math.min(m_targetSize, m_targetSize) / 2 - 50;
  innerRadius = outerRadius - 18;

  viewBoxDimensions = `0 0 ${m_targetSize} ${m_targetSize}`;

  // Create the arc path data generator for the groups
  arc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

  // Create the chord path data generator for the chords
  path = d3.svg.chord()
    .radius(innerRadius);

  LASTLAYOUT = getDefaultLayout(); // store layout between updates

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
      `translate(${m_targetSize / 2},${m_targetSize / 2})`);

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
function formatPathTitle(path, innerZone) {
  var m_label = "";
  var m_prefix = "";
  var m_suffix = "";
  var m_dataFixer = 100;
  var m_formatNumber = d3.format('.2f');
  var m_dimension = getDataDimension();

  /** For inner zone trip, source and target are referenced, multiply by 100 to avoid double division later */
  if (innerZone && m_dimension !== 'trip')
    path.source.value = path.source.value * m_dataFixer;

  if (m_dimension === 'trip') {
    m_formatNumber = d3.format('2,f');
    path.source.value = m_formatNumber(path.source.value);
    path.target.value = m_formatNumber(path.target.value);
    m_label = " trips from ";
  } else if (m_dimension === 'price') {
    path.source.value = m_formatNumber(path.source.value / m_dataFixer);
    path.target.value = m_formatNumber(path.target.value / m_dataFixer);
    m_label = " from ";
    m_prefix = "$";
    m_suffix = " for ";
  } else if (m_dimension === 'distance') {
    path.source.value = m_formatNumber(path.source.value / m_dataFixer);
    path.target.value = m_formatNumber(path.target.value / m_dataFixer);
    m_label = " km from ";
    m_suffix = " km for ";
  }
  if (!innerZone) {
    return [m_prefix, path.source.value,
      m_label,
      ZONES[path.source.index].ZoneName,
      ' to ',
      ZONES[path.target.index].ZoneName,
      '\n',
      m_prefix, path.target.value,
      m_label,
      ZONES[path.target.index].ZoneName,
      ' to ',
      ZONES[path.source.index].ZoneName,
    ].join('');
  } else {
    return m_prefix + path.source.value +
      m_suffix + " inner zone trips within " +
      ZONES[path.source.index].ZoneName;
  }
}

/** 
 * Format the text appeared when mouse hover the chord. 
 *  
 * @param {string} chord - A JSON string that contains the chord. 
 * @param {any} index - The index of the taxi zone represented by the chord. 
 * @returns {string} - The text appeared when mouse hover the chord. 
 */
function formatChordTitle(chord, index) {
  var m_label = "";
  var m_prefix = "";
  var m_formatNumber = d3.format('.2f');
  var m_dataFixer = 100;

  var m_dimension = getDataDimension();
  if (m_dimension === 'trip') {
    m_formatNumber = d3.format('2,f');
    chord.value = m_formatNumber(chord.value);
    m_label = " trips ";
  } else if (m_dimension === 'price') {
    chord.value = m_formatNumber(chord.value / m_dataFixer);
    m_label = " sum of average fare ";
    m_prefix = "$";
  } else if (m_dimension === 'distance') {
    chord.value = m_formatNumber(chord.value / m_dataFixer);
    m_label = " sum of average distance ";
  }

  return m_prefix + chord.value + m_label + `for ${
    ZONES[index].ZoneName}`;
}

/**
 * Update the chords for Chord Diagram. Add event listeners, transition effects and many minor tweaks to Chord Diagram.
 * 
 * @param {Array.<number[]>} matrix - A matrix that contains the input data.
 */
function updateChordDiagram(matrix) {

  var m_durationLong = 800;
  var m_durationShort = 10;
  var m_opacity = .5;
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
    .duration(m_durationLong)
    .attr('opacity', m_opacity)
    .remove(); // Remove after transitions are complete

  const newGroups = groupG.enter().append('g')
    .attr('class', 'group');

  // The enter selection is stored in a variable so we can
  // Enter the <path>, <text>, and <title> elements as well

  // Create the title tooltip for the new groups
  newGroups.append('title');

  // Update the (tooltip) title text based on the data
  groupG.select('title')
    .text((d, i) => formatChordTitle(d, i));

  // create the arc paths and set the constant attributes
  // (those based on the group index, not on the value)
  newGroups.append('path')
    .attr('id', d => `group${d.index}`)
    .style('fill', d => ZONES[d.index].color);

  // Update the paths to match the layout and color
  groupG.select('path')
    .transition()
    .duration(m_durationLong)
    .attr('opacity', m_opacity)
    .attr('d', arc)
    .attrTween('d', arcTween(LASTLAYOUT))
    .style('fill', d => ZONES[d.index].color)
    .transition().duration(m_durationShort).attr('opacity', 1) // reset opacity
  ;

  newGroups.append('svg:text')
    .attr('xlink:href', d => `#group${d.index}`)
    .attr('dy', '.35em')
    .attr('color', '#fff')
    .text(d => ZONES[d.index].ZoneName);

  // Position group labels to match layout
  groupG.select('text')
    .transition()
    .duration(m_durationLong)
    .text(d => ZONES[d.index].ZoneName)
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
      if (ZONES[d.target.index].ZoneName !== ZONES[d.source.index].ZoneName)
        return formatPathTitle(d, false);
      else
        return formatPathTitle(d, true);
    });

  chordPaths.exit().transition()
    .duration(m_durationLong)
    .attr('opacity', 0)
    .remove();

  chordPaths.transition()
    .duration(m_durationLong)
    .attr('opacity', m_opacity)
    .style('fill', d => ZONES[d.source.index].color)
    .attrTween('d', chordTween(LASTLAYOUT))
    .attr('d', path)
    .transition().duration(m_durationShort).attr('opacity', 1);

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
    const pointData = getConnector(ZONES[d.source.index].ZoneId, ZONES[d.target.index].ZoneId);
    if (ZONES[d.source.index].ZoneId != ZONES[d.target.index].ZoneId) {
      /** 
       * Connector dataset for AnyMap.
       * @see {@link https://docs.anychart.com/7.14.3/Maps/Connector_Maps}
       * @type {anychart.data.Set} 
       */
      const connectorData = [{
        points: pointData,
        from: ZONES[d.source.index].ZoneName,
        to: ZONES[d.target.index].ZoneName,
      }];
      addConnectorSeries(connectorData);
      highlightPoint(ZONES[d.source.index]);
    } else {
      removeMapSeries('connector');
      highlightPoint(ZONES[d.source.index]);
    }
    toggleAnimation(true);
  });
  chordPaths.on('mouseout', () => {
    chordPaths.attr('opacity', m_opacity);

    // toggleAnimation(false);
  });
  g.on('mouseout', function () {
    if (this == g.node()) {
      // Only respond to mouseout of the entire circle not mouseout events for sub-components
      chordPaths.classed('fade', false);
    }
  });
  LASTLAYOUT = layout;
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