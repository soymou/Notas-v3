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

    const currentId = dataEl.dataset.current || null;

    if (!payload || !Array.isArray(payload.nodes)) {
      return;
    }

    const nodes = payload.nodes.map(function (node) {
      return Object.assign({}, node);
    });
    const links = Array.isArray(payload.edges)
      ? payload.edges.map(function (link) { return Object.assign({}, link); })
      : [];

    const incomingCounts = buildIncomingCountMap(links);
    nodes.forEach(function (node) {
      node.__incoming = incomingCounts.get(node.id) || 0;
      if (currentId && node.id === currentId) {
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
    container.style.minHeight = '360px';
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
    badge.textContent = nodes.length + ' notas en el grafo';
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
    graphHolder.style.height = '360px';
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
      const scale = 6;
      const bump = currentId && node.id === currentId ? 10 : 0;
      return base + (node.__incoming || 0) * scale + bump;
    }

    const graph = ForceGraph()(graphHolder)
      .graphData({ nodes: nodes, links: links })
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
      .linkDirectionalParticleSpeed(0.0065)
      .d3VelocityDecay(0.18)
      .width(graphHolder.clientWidth)
      .height(graphHolder.clientHeight);

    const chargeForce = graph.d3Force('charge');
    if (chargeForce) {
      chargeForce.strength(-360).distanceMax(900).distanceMin(90);
    }

    const linkForce = graph.d3Force('link');
    if (linkForce) {
      linkForce.distance(function (link) {
        const srcId = typeof link.source === 'object' ? link.source.id : link.source;
        const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
        const srcNode = nodes.find(function (node) { return node.id === srcId; });
        const tgtNode = nodes.find(function (node) { return node.id === tgtId; });
        const srcRadius = srcNode ? nodeRadius(srcNode) : 14;
        const tgtRadius = tgtNode ? nodeRadius(tgtNode) : 14;
        return 180 + srcRadius + tgtRadius;
      });
      linkForce.strength(0.2);
    }

    graph.nodeCanvasObject(function (node, ctx) {
      const radius = Math.max(14, nodeRadius(node));

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = scheme.nodeFill;
      ctx.fill();
      ctx.lineWidth = currentId && node.id === currentId ? 3 : 1.6;
      ctx.strokeStyle = currentId && node.id === currentId ? scheme.currentStroke : scheme.nodeStroke;
      ctx.stroke();

      const label = node.title || '';
      if (!label) return;

      ctx.font = Math.max(11, radius * 0.4) + 'px "Inter", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const textWidth = ctx.measureText(label).width;
      if (textWidth <= radius * 2.1) {
        ctx.fillStyle = scheme.textFill;
        ctx.fillText(label, node.x, node.y);
      }
    });

    graph.nodePointerAreaPaint(function (node, color, ctx) {
      const radius = Math.max(14, nodeRadius(node));
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

    graph.cooldownTicks(320);
    graph.cooldownTime(20000);
    setTimeout(function () {
      try {
        graph.zoomToFit(900, 96);
      } catch (err) {
        /* noop */
      }
    }, 1000);
  });
})();
