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

    const nodes = payload.nodes;
    const links = Array.isArray(payload.edges) ? payload.edges : [];

    const hasCurrent = Boolean(currentId);
    const isMobile = detectMobile();

    let filteredNodes = nodes.slice();
    let filteredLinks = links.slice();
    let neighborIds = new Set();

    if (hasCurrent) {
      neighborIds = new Set([currentId]);
      links.forEach(function (link) {
        const src = typeof link.source === 'object' ? link.source.id : link.source;
        const tgt = typeof link.target === 'object' ? link.target.id : link.target;
        if (src === currentId) neighborIds.add(tgt);
        if (tgt === currentId) neighborIds.add(src);
      });

      if (neighborIds.size > 1) {
        filteredNodes = nodes.filter(function (node) { return neighborIds.has(node.id); });
        const allowedIds = new Set(filteredNodes.map(function (node) { return node.id; }));
        filteredLinks = links.filter(function (link) {
          const src = typeof link.source === 'object' ? link.source.id : link.source;
          const tgt = typeof link.target === 'object' ? link.target.id : link.target;
          return allowedIds.has(src) && allowedIds.has(tgt);
        });
      }
    }

    const layout = (function () {
      if (hasCurrent) {
        return {
          minHeight: '320px',
          holderHeight: '260px',
          chargeStrength: -70,
          chargeMax: 360,
          chargeMin: 40,
          linkDistance: 60,
          linkStrength: null,
          velocityDecay: 0.3,
          collisionRadius: 0,
          radialStrength: 0,
          zoomDelay: 750,
          zoomPadding: 48,
          zoomK: null
        };
      }

      if (isMobile) {
        return {
          minHeight: '340px',
          holderHeight: '280px',
          chargeStrength: -420,
          chargeMax: 1500,
          chargeMin: 80,
          linkDistance: 200,
          linkStrength: 0.045,
          velocityDecay: 0.16,
          collisionRadius: 42,
          radialStrength: 0,
          zoomDelay: 650,
          zoomPadding: 90,
          zoomK: null
        };
      }

      return {
        minHeight: '460px',
        holderHeight: '380px',
        chargeStrength: -900,
        chargeMax: 2400,
        chargeMin: 160,
        linkDistance: 360,
        linkStrength: 0.03,
        velocityDecay: 0.12,
        collisionRadius: 52,
        radialStrength: 0.005,
        zoomDelay: 900,
        zoomPadding: 160,
        zoomK: null
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
    const totalLabel = hasCurrent && neighborIds.size > 1
      ? filteredNodes.length
      : nodes.length;
    badge.textContent = (hasCurrent && neighborIds.size > 1)
      ? totalLabel + ' notas conectadas'
      : totalLabel + ' notas en el grafo';
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
      .graphData({ nodes: filteredNodes, links: filteredLinks })
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
        if (!hasCurrent) return 6;
        return node && node.id === currentId ? 12 : 6;
      })
      .linkColor(function (link) {
        if (!hasCurrent) return 'rgba(148, 163, 184, 0.24)';
        return linkTouchesCurrent(link, currentId)
          ? 'rgba(251, 146, 60, 0.9)'
          : 'rgba(148, 163, 184, 0.24)';
      })
      .linkWidth(function (link) {
        if (!hasCurrent) return 0.5;
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

    if (!hasCurrent) {
      if (layout.collisionRadius && typeof ForceGraph === 'function' && ForceGraph.d3ForceCollide) {
        graph.d3Force('collide', ForceGraph.d3ForceCollide(layout.collisionRadius));
      }
      if (layout.radialStrength && typeof ForceGraph === 'function' && ForceGraph.d3ForceRadial) {
        graph.d3Force('radial', ForceGraph.d3ForceRadial(0).strength(layout.radialStrength));
      }
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
        if (layout.zoomK) {
          graph.zoom(layout.zoomK, 0);
        }
        graph.zoomToFit(layout.zoomDelay, layout.zoomPadding);
      } catch (err) {
        /* noop */
      }
    }, layout.zoomDelay);
  });
})();
