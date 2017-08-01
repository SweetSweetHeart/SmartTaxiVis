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
            'max': limit
        }
    });

    zoneSlider.noUiSlider.on('change', function (values) {
        zone1 = values[0];
        zone2 = values[1];
        isPaused = false;
        toggleAnimation();
        formatJSON();
    });

    noUiSlider.create(timeSlider, {
        tooltips: true,
        format: wNumb({
            decimals: 0
        }),
        start: [time1, time2],
        step: 1,
        behaviour: 'drag-tap',
        connect: true,
        range: {
            'min': 0,
            '50%': 12,
            'max': 23
        },
        pips: {
            mode: 'range',
            density: 4
        }
    });
    timeSlider.noUiSlider.on('change', function (values) {
        time1 = values[0];
        time2 = values[1];
        //retrieve(limit, type, time1, time2);
        formatJSON();
    });
};