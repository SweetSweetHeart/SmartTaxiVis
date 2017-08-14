/**
 * @author Qiru Wang 689404@swansea.ac.uk
 * 
 * @module ChordDiagram
 */

/**
 * Start the animation for Chord Diagram.
 * 
 */
function chordAnimation() {
    isPaused = false;
    interval = setInterval(function () {
        if (!isPaused) {
            time1++;
            if (time1 > 23)
                time1 = 0;
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
    // tripMatrix = countT[time1];
    hourSlider.noUiSlider.set(time1);
    $("#hour").html(time1);
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
    } else {
        if (!isPaused) {
            isPaused = true;
            $('#btn_pause').html("<i class='fa fa-play' aria-hidden='true'></i>&nbsp;&nbsp;Animation");
        } else {
            isPaused = false;
            $('#btn_pause').html("<i class='fa fa-pause' aria-hidden='true'></i>&nbsp;&nbsp;Animation");
        }
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
    var result = 0;
    jQuery.each(data, function (i, val) {
        result += parseInt(val);
    });
    return result;
}


/**
 * Generate a rainbow color map based on the ratio of trips and the total trip count.
 * 
 * @param {number} trips  - Trip count of one zone as the dividend.
 * @param {number} totalTrips - Total trip count of all zones as the divisor.
 * @returns - A HSL color.
 */
function generateRainBowColorMap(trips, totalTrips) {
    var i = Math.round(200 - Math.abs(1 - (trips * 800 / totalTrips)));
    chordLegendColor.push(i);
    return 'hsl(' + i + ',83%,50%)';
}


/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param {number}  h      - The hue.
 * @param {number}  s      - The saturation.
 * @param {number}  l      - The lightness.
 * @return {string}  - A RGB color.
 */
function hslToRgb(h, s, l) {
    var r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return 'rgb(' + r * 255 + ',' + g * 255 + ',' + b * 255 + ')';
}

/**
 * Generate a legend for Chord Diagram based on the color map used.
 * 
 */
function generateChordColorLegend() {
    $("#chordColorLegend").empty();
    $("#chordColorLegend").append("Legend: &nbsp; &nbsp; &nbsp; Max ");

    chordLegendColor = Array.from(new Set(chordLegendColor));
    chordLegendColor.sort(function (a, b) {
        return a - b;
    });
    var last;
    jQuery.each(chordLegendColor, function (i, val) {
        if ((last == null) || (last != null && val > (last + 3)))
            $("#chordColorLegend").append("<font style=color:hsl(" + val + ",80%,53%)>█</font>");
        last = val;
    });
    $("#chordColorLegend").append(" Min");
    chordLegendColor = [];
}

/**
 * Trigger all necessary functions when data is changed. E.g. Re-render Chord Diagram, Map Diagram and Histogram.
 * Also update the visibility of some HTML elements.
 */
function formatJSON() {
    trips = $.extend(true, [], countT[time1]);
    zones = $.extend(true, [], zoneT[time1]);
    spliceMatrix(zones);
    spliceMatrix(trips);
    spliceSubTripMatrix(trips);

    var tripCount = 0;

    jQuery.each(trips, function (i, val) {
        tripCount += getTripCount(val);
    });

    // Assign random colors to chords    
    jQuery.each(zones, function (i, val) {
        val.color = generateRainBowColorMap(val.Pickup, tripCount);
    });

    generateChordColorLegend();
    generateHistogram();

    $("#tripCount").html(tripCount);

    /** 
     * Dataset for AnyMap. 
     * @see {@link https://api.anychart.com/7.14.3/anychart.data.Set} 
     * @type {anychart.data.Set} 
     */
    var dataSet = anychart.data.set(zones);
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
        $(".visualisationRow:hidden").show();
        $(".controlRow:hidden").show();
        $("#nomatch:visible").hide();
    } else {
        $(".visualisationRow:visible").hide();
        $(".controlRow:visible").hide();
        $("#nomatch:hidden").show();
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
    jQuery.each(matrix, function (i, val) {
        spliceMatrix(val);
    });
    return matrix;
}

/**
 * Initialise a Chord Diagram.
 * 
 */
function initChordDiagram() {
    var targetSize = $("#chordDiagram").width() * .85;
    var marginSide = $("#chordDiagram").width() * .075;

    $(window).resize(function () {
        var svg = d3.select("#chordDiagram")
            .attr("width", targetSize)
            .attr("height", targetSize);

        outerRadius = Math.min(targetSize, targetSize) / 2 - 50;
        innerRadius = outerRadius - 18;

        arc = d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        path = d3.svg.chord()
            .radius(innerRadius);

        $('#circle').attr("r", outerRadius);
        $('[data-toggle="popover"]').popover('show');

    });

    outerRadius = Math.min(targetSize, targetSize) / 2 - 50;
    innerRadius = outerRadius - 18;

    viewBoxDimensions = "0 0 " + targetSize + " " + targetSize;

    // Create the arc path data generator for the groups
    arc = d3.svg.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    // Create the chord path data generator for the chords
    path = d3.svg.chord()
        .radius(innerRadius);

    lastLayout = getDefaultLayout(); // store layout between updates

    // Create number formatting functions
    var formatPercent = d3.format("%");
    numberWithCommas = d3.format("0,f");

    // Initialize the visualization
    g = d3.select("#chordDiagram").append("svg")
        .attr("viewBox", viewBoxDimensions)
        .attr("preserveAspectRatio", "xMinYMid")
        .append("g")
        .attr("id", "circle")
        .attr("overflow-x", "visible")
        .attr("transform",
            "translate(" + targetSize / 2 + "," + targetSize / 2 + ")");

    g.append("circle")
        .attr("r", outerRadius);
}

/**
 * Update the chords for Chord Diagram. Add event listeners, transition effects and many minor tweaks to Chord Diagram.
 * 
 * @param {Array.<number[]>} matrix - The input data matrix of trips
 */
function updateChordDiagram(matrix) {
    // Remove empty svg generated by animation loop.
    $("svg[width=0]").remove();
    layout = getDefaultLayout();
    layout.matrix(matrix);

    // Create/update "group" elements
    var groupG = g.selectAll("g.group")
        .data(layout.groups(), function (d) {
            return d.index;
            //use a key function in case the
            //groups are sorted differently between updates
        });

    groupG.exit()
        .transition()
        .duration(800)
        .attr("opacity", 0.5)
        .remove(); // Remove after transitions are complete

    var newGroups = groupG.enter().append("g")
        .attr("class", "group");
    // The enter selection is stored in a variable so we can
    // Enter the <path>, <text>, and <title> elements as well

    // Create the title tooltip for the new groups
    newGroups.append("title");

    // Update the (tooltip) title text based on the data
    groupG.select("title")
        .text(function (d, i) {
            return numberWithCommas(d.value) +
                " trips started in " +
                zones[i].name;
        });

    // create the arc paths and set the constant attributes
    // (those based on the group index, not on the value)
    newGroups.append("path")
        .attr("id", function (d) {
            return "group" + d.index;
        })
        .style("fill", function (d) {
            return zones[d.index].color;
        });

    // Update the paths to match the layout and color
    groupG.select("path")
        .transition()
        .duration(800)
        .attr("opacity", 0.5)
        .attr("d", arc)
        .attrTween("d", arcTween(lastLayout))
        .style("fill", function (d) {
            return zones[d.index].color;
        })
        .transition().duration(10).attr("opacity", 1) //reset opacity
    ;

    newGroups.append("svg:text")
        .attr("xlink:href", function (d) {
            return "#group" + d.index;
        })
        .attr("dy", ".35em")
        .attr("color", "#fff")
        .text(function (d) {
            return zones[d.index].name;
        });

    // Position group labels to match layout
    groupG.select("text")
        .transition()
        .duration(800)
        .text(function (d) {
            return zones[d.index].name;
        })
        .attr("transform", function (d) {
            d.angle = (d.startAngle + d.endAngle) / 2;
            // Store the midpoint angle in the data object

            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
                " translate(" + (innerRadius + 26) + ")" +
                (d.angle > Math.PI ? " rotate(180)" : " rotate(0)");
            // Include the rotate zero so that transforms can be interpolated
        })
        .attr("text-anchor", function (d) {
            return d.angle > Math.PI ? "end" : "begin";
        });

    var chordPaths = g.selectAll("path.chord")
        .data(layout.chords(), chordKey);

    var newChords = chordPaths.enter()
        .append("path")
        .attr("class", "chord");

    newChords.append("title");

    chordPaths.select("title")
        .text(function (d) {
            if (zones[d.target.index].name !== zones[d.source.index].name) {
                return [numberWithCommas(d.source.value),
                    " trips from ",
                    zones[d.source.index].name,
                    " to ",
                    zones[d.target.index].name,
                    "\n",
                    numberWithCommas(d.target.value),
                    " trips from ",
                    zones[d.target.index].name,
                    " to ",
                    zones[d.source.index].name
                ].join("");
            } else {
                return numberWithCommas(d.source.value) +
                    " trips started and ended in " +
                    zones[d.source.index].name;
            }
        });

    chordPaths.exit().transition()
        .duration(800)
        .attr("opacity", 0)
        .remove();

    chordPaths.transition()
        .duration(800)
        .attr("opacity", 0.5)
        .style("fill", function (d) {
            return zones[d.source.index].color;
        })
        .attrTween("d", chordTween(lastLayout))
        .attr("d", path)
        .transition().duration(10).attr("opacity", 1);

    groupG.on("mouseover", function (d) {
        toggleAnimation(true);
        chordPaths.classed("fade", function (p) {
            return ((p.source.index != d.index) && (p.target.index != d.index));
        });
    });

    chordPaths.on("mouseover", function (d) {
        toggleAnimation(true);
        chordPaths.attr("opacity", 0.2);
        $(this).attr("opacity", 1);
    });

    chordPaths.on("click", function (d) {
        var pointData = getConnector(zones[d.source.index].id, zones[d.target.index].id);
        if (zones[d.source.index].id != zones[d.target.index].id) {

            /** 
             * Connector dataset for AnyMap.
             * @see {@link https://docs.anychart.com/7.14.3/Maps/Connector_Maps}
             * @type {anychart.data.Set} 
             */
            var connectorData = [{
                points: pointData,
                from: zones[d.source.index].name,
                to: zones[d.target.index].name
            }];
            addConnectorSeries(connectorData);
            highlightPoint(zones[d.source.index]);
        } else {
            removeMapSeries('connector');
            highlightPoint(zones[d.source.index]);
        }
        toggleAnimation(true);
    });
    chordPaths.on("mouseout", function () {
        chordPaths.attr("opacity", 0.5);
        //toggleAnimation(false);
    });
    g.on("mouseout", function () {
        if (this == g.node()) {
            // Only respond to mouseout of the entire circle not mouseout events for sub-components
            chordPaths.classed("fade", false);
        }
    });
    lastLayout = layout;
}

function arcTween(oldLayout) {
    var oldGroups = {};
    if (oldLayout) {
        oldLayout.groups().forEach(function (groupData) {
            oldGroups[groupData.index] = groupData;
        });
    }
    return function (d, i) {
        var tween;
        var old = oldGroups[d.index];
        if (old) { // There's a matching old group
            tween = d3.interpolate(old, d);
        } else {
            // Create a zero- width arc object
            var emptyArc = {
                startAngle: d.startAngle,
                endAngle: d.startAngle
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
        data.source.index + "-" + data.target.index :
        data.target.index + "-" + data.source.index;
}

function chordTween(oldLayout) {
    var oldChords = {};
    if (oldLayout) {
        oldLayout.chords().forEach(function (chordData) {
            oldChords[chordKey(chordData)] = chordData;
        });
    }
    return function (d, i) {
        var tween;
        var old = oldChords[chordKey(d)];
        if (old) {
            if (d.source.index != old.source.index) {
                old = {
                    source: old.target,
                    target: old.source
                };
            }
            tween = d3.interpolate(old, d);
        } else {
            // Create a zero- width chord object
            var emptyChord = {
                source: {
                    startAngle: d.source.startAngle,
                    endAngle: d.source.startAngle
                },
                target: {
                    startAngle: d.target.startAngle,
                    endAngle: d.target.startAngle
                }
            };
            tween = d3.interpolate(emptyChord, d);
        }
        return function (t) {
            return path(tween(t));
        };
    };
}