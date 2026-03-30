class Timeline {
    constructor(sliderId, displayId, eraId, data, onYearUpdate) {
        this.slider = d3.select(sliderId);
        this.display = d3.select(displayId);
        this.eraLabel = d3.select(eraId);
        this.fill = d3.select('#timeline-fill');
        this.data = data;
        this.onYearUpdate = onYearUpdate;

        this.init();
    }

    init() {
        this.slider.on('input', (event) => {
            const year = +event.target.value;
            this.update(year);
        });

        // Initial update
        this.update(this.slider.property('value'));
    }

    update(year) {
        this.display.text(`${year} AD`);

        // Update ERA
        const era = this.data.ERAS.find(e => year >= e.min && year <= e.max);
        if (era) {
            this.eraLabel.text(era.label);
        }

        // Update Fill
        const pct = (year - this.data.START_YEAR) / (this.data.END_YEAR - this.data.START_YEAR) * 100;
        this.fill.style('width', `${pct}%`);

        if (this.onYearUpdate) {
            this.onYearUpdate(year);
        }
    }
}
