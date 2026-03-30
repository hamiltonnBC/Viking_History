document.addEventListener('DOMContentLoaded', () => {
    // Initialize Map
    const map = new VikingMap('#viking-map', {
        EVENTS,
        ERAS,
        ROUTES,
        START_YEAR,
        END_YEAR
    });

    // Initialize Timeline
    const timeline = new Timeline(
        '#year-slider',
        '#year-display',
        '#era-label',
        { ERAS, START_YEAR, END_YEAR },
        (year) => {
            map.updateYear(year);
        }
    );

    // Initial sync
    setTimeout(() => {
        timeline.update(750);
    }, 500);
});
