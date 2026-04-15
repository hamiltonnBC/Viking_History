class VikingMap {
    constructor(elementId, data) {
        this.svg = d3.select(elementId);
        this.data = data;
        this.width = this.svg.node().getBoundingClientRect().width;
        this.height = this.svg.node().getBoundingClientRect().height;

        this.projection = d3.geoMercator()
            .center([0, 58]) // Centered around North Atlantic
            .scale(500)
            .translate([this.width / 2, this.height / 2]);

        this.path = d3.geoPath().projection(this.projection);

        this.g = this.svg.append('g'); // Container for zoomable elements

        this.zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on('zoom', (event) => {
                this.g.attr('transform', event.transform);
            });

        this.svg.call(this.zoom);
        this.init();
    }

    async init() {
        try {
            const world = await d3.json('data/world.geojson');
            this.renderLand(world);
            this.renderRoutes();
            this.renderHotspots();
            this.setupControls();
        } catch (error) {
            console.error('Error loading GeoJSON:', error);
        }
    }

    renderLand(world) {
        this.g.append('g')
            .attr('class', 'land-group')
            .selectAll('path')
            .data(world.features)
            .enter()
            .append('path')
            .attr('d', this.path)
            .attr('class', 'land');
    }

    renderRoutes() {
        this.routeGroup = this.g.append('g').attr('class', 'routes-group');
        this.ROUTES = this.data.ROUTES;

        this.routeGroup.selectAll('path')
            .data(this.ROUTES)
            .enter()
            .append('path')
            .attr('id', d => d.id)
            .attr('class', d => `route ${d.type}`)
            .attr('d', d => {
                const lineData = d.points.map(p => this.projection(p));
                return d3.line()(lineData);
            })
            .style('stroke', d => {
                if (d.type === 'raid') return 'var(--blood-bright)';
                if (d.type === 'trade') return 'var(--gold)';
                return 'var(--sea-light)';
            });
    }

    renderHotspots() {
        this.hotspotGroup = this.g.append('g').attr('class', 'hotspots-group');
        this.EVENTS = this.data.EVENTS;

        const spots = this.hotspotGroup.selectAll('g')
            .data(this.EVENTS)
            .enter()
            .append('g')
            .attr('id', d => d.id)
            .attr('class', 'hotspot hidden')
            .attr('transform', d => {
                const p = this.projection(d.coords);
                return `translate(${p[0]}, ${p[1]})`;
            })
            .on('click', (event, d) => this.showInfo(d));

        spots.append('circle')
            .attr('r', 8)
            .attr('fill', d => {
                if (d.type === 'raid' || d.type === 'battle' || d.type === 'conquest') return 'var(--blood-bright)';
                if (d.type === 'trade') return 'var(--gold)';
                if (d.type === 'origin') return 'var(--gold-bright)';
                return 'var(--parchment)';
            });

        spots.append('text')
            .attr('y', 15)
            .attr('text-anchor', 'middle')
            .attr('font-family', 'var(--font-subheading)')
            .attr('font-size', '10px')
            .attr('fill', 'var(--parchment-light)')
            .text(d => d.title.split(' — ')[0].toUpperCase());
    }

    updateYear(year) {
        // Update hotspots visibility
        this.EVENTS.forEach(e => {
            const el = d3.select(`#${e.id}`);
            if (year >= e.year) {
                el.classed('hidden', false);
            } else {
                el.classed('hidden', true);
            }
        });

        // Update routes visibility
        this.ROUTES.forEach(r => {
            const el = d3.select(`#${r.id}`);
            // A route is visible if its year (based on the first event that triggers it) is passed
            // In our simple data, we'll just check if any active event uses it
            const isActive = this.EVENTS.some(e => year >= e.year && e.routes && e.routes.includes(r.id));
            el.classed('active', isActive);
        });
    }

    showInfo(d) {
        const panel = d3.select('#info-panel');
        panel.select('#panel-title').text(d.title);
        panel.select('#panel-date').text(d.date);
        panel.select('#panel-tag').text(d.tag);
        panel.select('#panel-body').html(d.body.split('<br><br>').map(p => `<p>${p}</p>`).join(''));
        panel.classed('open', true);
    }

    setupControls() {
        d3.select('#zoom-in').on('click', () => this.svg.transition().call(this.zoom.scaleBy, 1.5));
        d3.select('#zoom-out').on('click', () => this.svg.transition().call(this.zoom.scaleBy, 0.6));
        d3.select('#zoom-reset').on('click', () => this.svg.transition().call(this.zoom.transform, d3.zoomIdentity));
        d3.select('#panel-close').on('click', () => d3.select('#info-panel').classed('open', false));
    }
}
