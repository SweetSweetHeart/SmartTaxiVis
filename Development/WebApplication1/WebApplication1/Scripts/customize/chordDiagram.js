function chordAnimation() {
    isPaused = false;
    hour = 1;
    interval = setInterval(function () {
        if (!isPaused) {
            if (hour <= 22) {
                taxizones = zoneT[hour];
                tripMatrix = countT[hour];
                formatJSON();
                hour++;
            }
            else {
                hour = 0;
            }
        }
    }, 3000);
}


function toggleAnimation() {
    if (!isPaused) {
        isPaused = true;
        $('#btn_pause').html("<i class='fa fa-play' aria-hidden='true'></i>&nbsp;Animation");
    }
    else {
        isPaused = false;
        $('#btn_pause').html("<i class='fa fa-pause' aria-hidden='true'></i>&nbsp;Animation");
    }
}


function getDefaultLayout() {
    return d3.layout.chord()
        .padding(0.03)
        .sortSubgroups(d3.descending)
        .sortChords(d3.ascending);
}

// Reformat the trip matrix when conditions changes, and update related visualisations
function formatJSON() {
    var trips = $.extend(true, [], tripMatrix);
    zones = $.extend(true, [], taxizones);
    zones.splice(0, zone1 - 1);
    zones.splice(zone2 - zone1 + 1, limit - zone2);
    trips.splice(0, zone1 - 1);
    trips.splice(zone2 - zone1, limit - zone2);
    trips.forEach(function (element, i) {
        element.splice(0, zone1 - 1);
        element.splice(zone2 - zone1, limit - zone2);
    }, this);

    tripCount = 0;

    jQuery.each(trips, function (i, val) {
        jQuery.each(val, function (j, val2) {
            tripCount += parseInt(val2);
        });
    });
    $("#tripCount").html(tripCount);
    dataSet = anychart.data.set(zones);
    connectorData = null;

    if (trips.length != 0) {
        renderMap();
        updateChords(trips);
    }
}

// Create OR update a chord layout from a data matrix
function updateChords(matrix) {
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
        .attr("d", path)
        .transition().duration(10).attr("opacity", 1);

    groupG.on("mouseover", function (d) {
        chordPaths.classed("fade", function (p) {
            return ((p.source.index != d.index) && (p.target.index != d.index));
        });
    });

    chordPaths.on("mouseover", function (d) {
        chordPaths.attr("opacity", 0.2);
        $(this).attr("opacity", 1);
    });


    chordPaths.on("click", function (d) {
        if (zones[d.source.index].id != zones[d.target.index].id) {
            connectorData = [{
                points: getConnector(zones[d.source.index].id, zones[d.target.index].id),
                from: zones[d.source.index].name,
                to: zones[d.target.index].name
            }]
            renderMap();
        }
    });


    chordPaths.on("mouseout", function () {
        chordPaths.attr("opacity", 0.5);
    });

    g.on("mouseout", function () {
        if (this == g.node()) {
            // Only respond to mouseout of the entire circle not mouseout events for sub-components
            chordPaths.classed("fade", false);
        }
    });

    last_layout = layout;



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
            // Create a zero-width arc object
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
            // Create a zero-width chord object
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