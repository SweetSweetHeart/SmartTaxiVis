function initSliders() {
    noUiSlider.create(zoneSlider, {
        tooltips: true,
        format: wNumb({
            decimals: 0
        }),
        start: [1, zone2],
        step: 1,
        behaviour: 'drag-tap',
        connect: true,
        range: {
            'min': 1,
            'max': totalZoneNum
        }
    });

    zoneSlider.noUiSlider.on('change', function (values) {
        zone1 = values[0];
        zone2 = values[1];
        toggleAnimation(true);
        formatJSON();
    });

    noUiSlider.create(hourSlider, {
        tooltips: true,
        animate: true,
        format: wNumb({
            decimals: 0
        }),
        start: time1,
        step: 1,
        range: {
            'min': [0],
            'max': [23]
        }
    });

    hourSlider.noUiSlider.on('change', function (values) {
        time1 = values[0];
        hour = time1;
        animationSetData();
        hour++;
        //time2 = values[1];
        //retrieve(totalZoneNum, type, time1, time2);
        toggleAnimation(true);
        formatJSON();
    });
};