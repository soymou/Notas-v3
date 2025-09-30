(function () {
  function onReady(cb) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', cb, { once: true });
    } else {
      cb();
    }
  }

  function linkTouchesCurrent(link, currentId) {
    if (!currentId || !link) return false;
    const src = typeof link.source === 'object' ? link.source.id : link.source;
    const tgt = typeof link.target === 'object' ? link.target.id : link.target;
    return src === currentId || tgt === currentId;
  }

  function detectMobile() {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  onReady(function () {
    const dataEl = document.getElementById('notes-graph-data');
    if (!dataEl) return;
    if (typeof ForceGraph !== 'function') {
      console.warn('[notes-graph] ForceGraph library not available.');
      return;
    }

    let payload;
    try {
      payload = JSON.parse(dataEl.textContent || '{}');
    } catch (err) {
      console.warn('[notes-graph] Unable to parse graph payload.', err);
      return;
    }

    const currentId = dataEl.dataset.current || null;
    if (!payload || !Array.isArray(payload.nodes)) {
      return;
    }

    const nodes = payload.nodes.slice();
    const links = Array.isArray(payload.edges) ? payload.edges.slice() : [];

    const hasCurrent = Boolean(currentId);
    const isMobile = detectMobile();

    const neighborIds = new Set();
    if (hasCurrent) {
      neighborIds.add(currentId);
      links.forEach(function (link) {
        const src = typeof link.source === 'object' ? link.source.id : link.source;
        const tgt = typeof link.target === 'object' ? link.target.id : link.target;
        if (src === currentId) neighborIds.add(tgt);
        if (tgt === currentId) neighborIds.add(src);
      });
    }

    const layout = (function () {
      if (hasCurrent) {
        if (isMobile) {
          return {
            minHeight: '320px',
            holderHeight: '260px',
            chargeStrength: -180,
            chargeMax: 900,
            chargeMin: 60,
            linkDistance: 140,
            linkStrength: 0.09,
            velocityDecay: 0.2,
            collisionRadius: 30,
            radialStrength: 0,
            zoomDelay: 650,
            zoomPadding: 72
          };
        }
        return {
          minHeight: '340px',
          holderHeight: '280px',
          chargeStrength: -240,
          chargeMax: 1200,
          chargeMin: 80,
          linkDistance: 160,
          linkStrength: 0.08,
          velocityDecay: 0.18,
          collisionRadius: 32,
          radialStrength: 0,
          zoomDelay: 750,
          zoomPadding: 80
        };
      }

      if (isMobile) {
        return {
          minHeight: '360px',
          holderHeight: '300px',
          chargeStrength: -420,
          chargeMax: 1500,
          chargeMin: 110,
          linkDistance: 180,
          linkStrength: 0.035,
          velocityDecay: 0.14,
          collisionRadius: 44,
          radialStrength: 0.001,
          zoomDelay: 650,
          zoomPadding: 96
        };
      }

      return {
        minHeight: '460px',
        holderHeight: '360px',
        chargeStrength: -650,
        chargeMax: 2100,
        chargeMin: 160,
        linkDistance: 240,
        linkStrength: 0.025,
        velocityDecay: 0.12,
        collisionRadius: 52,
        radialStrength: 0.0015,
        zoomDelay: 800,
        zoomPadding: 110
      };
    })();

    const content = document.querySelector('.content');
    const container = document.createElement('section');
    container.id = 'notes-graph';
    container.setAttribute('aria-label', 'Mapa de notas relacionado');
    container.style.margin = '2.6rem 0';
    container.style.padding = '1.5rem 1rem 1rem';
    container.style.border = '1px solid rgba(148, 163, 184, 0.3)';
    container.style.borderRadius = '1rem';
    container.style.background = 'linear-gradient(0deg, rgba(148,163,184,0.14), rgba(148,163,184,0.06))';
    container.style.backdropFilter = 'blur(4px)';
    container.style.minHeight = layout.minHeight;
    container.style.boxSizing = 'border-box';

    const heading = document.createElement('h2');
    heading.textContent = 'Mapa de notas';
    heading.style.margin = '0 0 0.75rem';
    heading.style.fontSize = '1.1rem';
    heading.style.fontWeight = '600';
    heading.style.display = 'flex';
    heading.style.alignItems = 'center';
    heading.style.gap = '0.5rem';

    const badge = document.createElement('span');
    badge.textContent = nodes.length + ' notas en el grafo';
    badge.style.fontSize = '0.75rem';
    badge.style.fontWeight = '500';
    badge.style.color = 'rgba(15, 118, 110, 0.95)';
    badge.style.background = 'rgba(45, 212, 191, 0.18)';
    badge.style.border = '1px solid rgba(45, 212, 191, 0.35)';
    badge.style.borderRadius = '999px';
    badge.style.padding = '0.25rem 0.65rem';

    heading.appendChild(badge);
    container.appendChild(heading);

    const graphHolder = document.createElement('div');
    graphHolder.id = 'notes-graph-viewport';
    graphHolder.style.height = layout.holderHeight;
    graphHolder.style.width = '100%';
    graphHolder.style.position = 'relative';
    container.appendChild(graphHolder);

    const legend = document.createElement('p');
    legend.textContent = 'Arrastra para mover el grafo y haz clic en una nota para abrirla.';
    legend.style.fontSize = '0.75rem';
    legend.style.color = 'rgba(71, 85, 105, 0.9)';
    legend.style.margin = '1rem 0 0';
    container.appendChild(legend);

    if (content && content.parentNode) {
      content.insertAdjacentElement('afterend', container);
    } else {
      document.body.appendChild(container);
    }

    const accentColor = '#fb923c';
    const neighborColor = '#38bdf8';
    const fallbackColor = '#94a3b8';

    const graph = ForceGraph()(graphHolder)
      .graphData({ nodes: nodes, links: links })
      .nodeId('id')
      .nodeLabel(function (node) {
        if (!node) return '';
        var extra = node.trail ? '\n' + node.trail : '';
        return node.title + extra;
      })
      .nodeColor(function (node) {
        if (!node) return fallbackColor;
        if (!hasCurrent) return fallbackColor;
        if (node.id === currentId) return accentColor;
        return neighborIds.has(node.id) ? neighborColor : fallbackColor;
      })
      .nodeVal(function (node) {
        if (!hasCurrent) return 6.5;
        return node && node.id === currentId ? 12 : 7;
      })
      .linkColor(function (link) {
        if (!hasCurrent) return 'rgba(148, 163, 184, 0.28)';
        return linkTouchesCurrent(link, currentId)
          ? 'rgba(251, 146, 60, 0.9)'
          : 'rgba(148, 163, 184, 0.28)';
      })
      .linkWidth(function (link) {
        if (!hasCurrent) return 0.7;
        return linkTouchesCurrent(link, currentId) ? 2 : 1;
      })
      .linkDirectionalParticles(function (link) {
        if (!hasCurrent) return 0;
        return linkTouchesCurrent(link, currentId) ? 2 : 0;
      })
      .linkDirectionalParticleSpeed(0.0065)
      .d3VelocityDecay(layout.velocityDecay)
      .width(graphHolder.clientWidth)
      .height(graphHolder.clientHeight);

    const chargeForce = graph.d3Force('charge');
    if (chargeForce) {
      chargeForce
        .strength(layout.chargeStrength)
        .distanceMax(layout.chargeMax)
        .distanceMin(layout.chargeMin);
    }

    const linkForce = graph.d3Force('link');
    if (linkForce) {
      linkForce.distance(layout.linkDistance);
      if (layout.linkStrength !== null) {
        linkForce.strength(layout.linkStrength);
      }
    }

    if (layout.collisionRadius && typeof ForceGraph === 'function' && ForceGraph.d3ForceCollide) {
      graph.d3Force('collide', ForceGraph.d3ForceCollide(layout.collisionRadius));
    }
    if (layout.radialStrength && typeof ForceGraph === 'function' && ForceGraph.d3ForceRadial) {
      graph.d3Force('radial', ForceGraph.d3ForceRadial(0).strength(layout.radialStrength));
    }

    graph.onNodeClick(function (node) {
      if (node && node.url) {
        window.location.href = node.url;
      }
    });

    window.addEventListener('resize', function () {
      graph.width(graphHolder.clientWidth);
      graph.height(graphHolder.clientHeight);
    });

    setTimeout(function () {
      try {
        graph.zoomToFit(layout.zoomDelay, layout.zoomPadding);
      } catch (err) {
        /* noop */
      }
    }, layout.zoomDelay);
  });
})();
