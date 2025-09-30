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

  function buildIncomingCountMap(links) {
    const counts = new Map();
    links.forEach(function (link) {
      const tgt = typeof link.target === 'object' ? link.target.id : link.target;
      counts.set(tgt, (counts.get(tgt) || 0) + 1);
    });
    return counts;
  }

  function themeColors() {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    if (!isDark) {
      return {
        containerBg: 'linear-gradient(0deg, rgba(15, 23, 42, 0.05), rgba(15, 23, 42, 0.12))',
        containerBorder: '1px solid rgba(15, 23, 42, 0.15)',
        nodeFill: '#1f2937',
        nodeStroke: '#0ea5e9',
        textFill: '#f8fafc',
        badgeText: 'rgba(15, 118, 110, 0.95)',
        badgeBg: 'rgba(13, 148, 136, 0.15)',
        badgeBorder: 'rgba(13, 148, 136, 0.35)',
        linkDefault: 'rgba(30, 64, 175, 0.35)',
        linkHighlight: 'rgba(249, 115, 22, 0.95)',
        legend: 'rgba(51, 65, 85, 0.8)',
        currentStroke: '#f97316'
      };
    }

    return {
      containerBg: 'linear-gradient(0deg, rgba(15, 23, 42, 0.65), rgba(15, 23, 42, 0.45))',
      containerBorder: '1px solid rgba(148, 163, 184, 0.35)',
      nodeFill: '#f8fafc',
      nodeStroke: 'rgba(148, 163, 184, 0.55)',
      textFill: '#0f172a',
      badgeText: 'rgba(45, 212, 191, 0.95)',
      badgeBg: 'rgba(45, 212, 191, 0.18)',
      badgeBorder: 'rgba(45, 212, 191, 0.35)',
      linkDefault: 'rgba(148, 163, 184, 0.35)',
      linkHighlight: 'rgba(249, 146, 60, 0.95)',
      legend: 'rgba(203, 213, 225, 0.8)',
      currentStroke: '#f97316'
    };
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

    const nodes = payload.nodes.map(function (node) {
      return Object.assign({}, node);
    });
    const links = Array.isArray(payload.edges) ? payload.edges.map(function (link) {
      return Object.assign({}, link);
    }) : [];

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

    const incomingCounts = buildIncomingCountMap(filteredLinks);
    filteredNodes.forEach(function (node) {
      node.__incoming = incomingCounts.get(node.id) || 0;
      if (node.id === currentId) {
        node.__incoming += 1;
      }
    });

    const scheme = themeColors();

    const content = document.querySelector('.content');
    const container = document.createElement('section');
    container.id = 'notes-graph';
    container.setAttribute('aria-label', 'Mapa de notas relacionado');
    container.style.margin = '2.75rem 0';
    container.style.padding = '1.5rem 1rem 1.25rem';
    container.style.borderRadius = '1.1rem';
    container.style.border = scheme.containerBorder;
    container.style.background = scheme.containerBg;
    container.style.backdropFilter = 'blur(6px)';
    container.style.minHeight = '320px';
    container.style.boxSizing = 'border-box';

    const heading = document.createElement('h2');
    heading.textContent = 'Mapa de notas';
    heading.style.margin = '0 0 0.85rem';
    heading.style.fontSize = '1.15rem';
    heading.style.fontWeight = '600';
    heading.style.display = 'flex';
    heading.style.alignItems = 'center';
    heading.style.gap = '0.65rem';

    const badge = document.createElement('span');
    const totalLabel = hasNeighbor ? filteredNodes.length : nodes.length;
    badge.textContent = hasNeighbor
      ? totalLabel + ' notas conectadas'
      : totalLabel + ' notas en el grafo';
    badge.style.fontSize = '0.75rem';
    badge.style.fontWeight = '500';
    badge.style.color = scheme.badgeText;
    badge.style.background = scheme.badgeBg;
    badge.style.border = '1px solid ' + scheme.badgeBorder;
    badge.style.borderRadius = '999px';
    badge.style.padding = '0.3rem 0.75rem';

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
    legend.style.color = scheme.legend;
    legend.style.margin = '1.1rem 0 0';
    container.appendChild(legend);

    if (content && content.parentNode) {
      content.insertAdjacentElement('afterend', container);
    } else {
      document.body.appendChild(container);
    }

    function nodeRadius(node) {
      const base = 14;
      const scale = 4;
      const bump = node.id === currentId ? 6 : 0;
      return base + (node.__incoming || 0) * scale + bump;
    }

    const graph = ForceGraph()(graphHolder)
      .graphData({ nodes: filteredNodes, links: filteredLinks })
      .nodeId('id')
      .nodeVal(function (node) {
        const r = nodeRadius(node);
        return r * r;
      })
      .nodeLabel(function (node) {
        if (!node) return '';
        var extra = node.trail ? '\n' + node.trail : '';
        return node.title + extra;
      })
      .linkColor(function (link) {
        return linkTouchesCurrent(link, currentId)
          ? scheme.linkHighlight
          : scheme.linkDefault;
      })
      .linkWidth(function (link) {
        return linkTouchesCurrent(link, currentId) ? 2.4 : 1.2;
      })
      .linkDirectionalParticles(function (link) {
        return linkTouchesCurrent(link, currentId) ? 2 : 0;
      })
      .linkDirectionalParticleSpeed(0.007)
      .width(graphHolder.clientWidth)
      .height(graphHolder.clientHeight);

    graph.nodeCanvasObject(function (node, ctx) {
      const radius = nodeRadius(node);

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = scheme.nodeFill;
      ctx.fill();
      ctx.lineWidth = node.id === currentId ? 3 : 1.4;
      ctx.strokeStyle = node.id === currentId ? scheme.currentStroke : scheme.nodeStroke;
      ctx.stroke();

      const label = node.title || '';
      if (!label) return;

      ctx.font = Math.max(10, radius * 0.45) + 'px "Inter", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const textWidth = ctx.measureText(label).width;
      if (textWidth <= radius * 1.75) {
        ctx.fillStyle = scheme.textFill;
        ctx.fillText(label, node.x, node.y);
      }
    });

    graph.nodePointerAreaPaint(function (node, color, ctx) {
      const radius = nodeRadius(node);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
      ctx.fill();
    });

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
