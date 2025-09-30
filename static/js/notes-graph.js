(function () {
  function onReady(cb) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', cb, { once: true });
    } else {
      cb();
    }
  }

  function linkTouchesCurrent(link, currentId) {
    if (!link) return false;
    const src = typeof link.source === 'object' ? link.source.id : link.source;
    const tgt = typeof link.target === 'object' ? link.target.id : link.target;
    return src === currentId || tgt === currentId;
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

    const currentId = dataEl.dataset.current;
    if (!payload || !Array.isArray(payload.nodes) || !currentId) {
      return;
    }

    const nodes = payload.nodes;
    const links = Array.isArray(payload.edges) ? payload.edges : [];

    const neighborIds = new Set([currentId]);
    links.forEach(function (link) {
      const src = typeof link.source === 'object' ? link.source.id : link.source;
      const tgt = typeof link.target === 'object' ? link.target.id : link.target;
      if (src === currentId) neighborIds.add(tgt);
      if (tgt === currentId) neighborIds.add(src);
    });

    const hasNeighbor = neighborIds.size > 1;
    const filteredNodes = hasNeighbor
      ? nodes.filter(function (node) { return neighborIds.has(node.id); })
      : nodes.slice();

    const allowedIds = new Set(filteredNodes.map(function (node) { return node.id; }));

    const filteredLinks = hasNeighbor
      ? links.filter(function (link) {
          const src = typeof link.source === 'object' ? link.source.id : link.source;
          const tgt = typeof link.target === 'object' ? link.target.id : link.target;
          return allowedIds.has(src) && allowedIds.has(tgt);
        })
      : links.slice();

    const content = document.querySelector('.content');
    const container = document.createElement('section');
    container.id = 'notes-graph';
    container.setAttribute('aria-label', 'Mapa de notas relacionado');
    container.style.margin = '2.5rem 0';
    container.style.padding = '1.5rem 1rem 1rem';
    container.style.border = '1px solid rgba(148, 163, 184, 0.3)';
    container.style.borderRadius = '1rem';
    container.style.background = 'linear-gradient(0deg, rgba(148,163,184,0.14), rgba(148,163,184,0.06))';
    container.style.backdropFilter = 'blur(4px)';
    container.style.minHeight = '320px';
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
    const totalLabel = hasNeighbor ? filteredNodes.length : nodes.length;
    badge.textContent = hasNeighbor
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
    graphHolder.style.height = '260px';
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
        if (node.id === currentId) return accentColor;
        return neighborIds.has(node.id) ? neighborColor : fallbackColor;
      })
      .nodeVal(function (node) {
        return node && node.id === currentId ? 12 : 6;
      })
      .linkColor(function (link) {
        return linkTouchesCurrent(link, currentId)
          ? 'rgba(251, 146, 60, 0.9)'
          : 'rgba(148, 163, 184, 0.35)';
      })
      .linkWidth(function (link) {
        return linkTouchesCurrent(link, currentId) ? 2 : 1;
      })
      .linkDirectionalParticles(function (link) {
        return linkTouchesCurrent(link, currentId) ? 2 : 0;
      })
      .linkDirectionalParticleSpeed(0.007)
      .width(graphHolder.clientWidth)
      .height(graphHolder.clientHeight);

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
        graph.zoomToFit(600, 48);
      } catch (err) {
        /* noop */
      }
    }, 750);
  });
})();
