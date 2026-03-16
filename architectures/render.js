/* ============================================================
   Architecture Documentation — Generic Rendering Engine
   Consumes JSON-LD from <script id="arch-data"> and renders
   all 12 tabs. Project-specific config (positions, colors,
   connection list) is provided via ARCH_CONFIG in index.html.
   ============================================================ */

// --- Expect ARCH_CONFIG from index.html ---
// ARCH_CONFIG = {
//   NODE_POSITIONS: { 'arch:...': {x, y}, ... },
//   GRAPH_CONNECTIONS: [ {from, to, type, label}, ... ],
//   DOMAIN_MAP: { 'DomainName': 'css-class', ... },
//   DOMAIN_COLORS: { 'css-class': 'var(--domain-N)', ... },
//   CONN_STYLES: { 'type': { stroke, dash?, width? }, ... },
//   FLOW_COLORS: { 'FlowName': 'var(--domain-N)', ... },
// }

(function () {
  'use strict';

  var archData = JSON.parse(document.getElementById('arch-data').textContent);
  var CFG = window.ARCH_CONFIG || {};
  var NODE_POSITIONS = CFG.NODE_POSITIONS || {};
  var GRAPH_CONNECTIONS = CFG.GRAPH_CONNECTIONS || [];
  var DOMAIN_MAP = CFG.DOMAIN_MAP || {};
  var DOMAIN_COLORS = CFG.DOMAIN_COLORS || {};
  var CONN_STYLES = CFG.CONN_STYLES || {};
  var FLOW_COLORS = CFG.FLOW_COLORS || {};

  // === HELPERS ===
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function shortName(id) { if (!id) return ''; var parts = id.split('/'); return parts[parts.length - 1]; }

  function getAllServices(data) {
    var services = [];
    (data['arch:domains'] || []).forEach(function (d) {
      (d['arch:services'] || []).forEach(function (s) {
        s.domain = d.name;
        services.push(s);
      });
    });
    return services;
  }
  function getInfrastructure(data) { return data['arch:infrastructure'] || []; }
  function getDatabases(data) { return getInfrastructure(data).filter(function (i) { return (i['@type'] || '').includes('Database'); }); }
  function getKafkaTopics(data) {
    var topics = [];
    getInfrastructure(data).forEach(function (i) { (i['arch:topics'] || []).forEach(function (t) { topics.push(t); }); });
    return topics;
  }
  function getRedisStreams(data) {
    var streams = [];
    getInfrastructure(data).forEach(function (i) { (i['arch:streams'] || []).forEach(function (s) { streams.push(s); }); });
    return streams;
  }

  function domainClass(domainName) {
    return DOMAIN_MAP[domainName] || domainName.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  function domainColor(domainName) {
    var cls = domainClass(domainName);
    return DOMAIN_COLORS[cls] || 'var(--fg-muted)';
  }

  function statusBadge(status) {
    var cls = status === 'implemented' ? 'badge-implemented' : status === 'planned' ? 'badge-planned' : 'badge-deprecated';
    return '<span class="badge ' + cls + '">' + esc(status) + '</span>';
  }
  function protocolBadges(proto) {
    if (!proto) return '';
    var arr = Array.isArray(proto) ? proto : [proto];
    return arr.map(function (p) {
      var pl = p.toLowerCase();
      if (pl.includes('grpc')) return '<span class="badge" style="background:oklch(0.75 0.18 85/15%);color:oklch(0.75 0.18 85)">gRPC</span>';
      if (pl.includes('websocket') || pl === 'ws') return '<span class="badge" style="background:oklch(0.65 0.20 260/15%);color:oklch(0.65 0.20 260)">WS</span>';
      if (pl.includes('rest') || pl.includes('http')) return '<span class="badge" style="background:oklch(0.70 0.16 165/15%);color:oklch(0.70 0.16 165)">REST</span>';
      if (pl.includes('worker') || pl.includes('background')) return '<span class="badge" style="background:oklch(0.64 0.17 155/15%);color:oklch(0.64 0.17 155)">Worker</span>';
      return '<span class="badge">' + esc(p) + '</span>';
    }).join(' ');
  }

  // === TAB 1: OVERVIEW ===
  function renderOverview(data) {
    var services = getAllServices(data);
    var implServices = services.filter(function (s) { return s['arch:status'] === 'implemented'; });
    var portsCount = services.filter(function (s) { return s['arch:port'] != null; }).length;
    var kafkaTopics = getKafkaTopics(data);
    var redisStreams = getRedisStreams(data);
    var databases = getDatabases(data);
    var testing = data['arch:testing'] || {};
    var totalTests = testing.summary ? testing.summary.total : '0';

    var html = '<div class="stats-grid animate-in">';
    html += '<div class="stat-card"><div class="label">Services</div><div class="value">' + implServices.length + '</div><div class="sub">' + data['arch:domains'].length + ' domains (' + services.length + ' total)</div></div>';
    html += '<div class="stat-card"><div class="label">Exposed Ports</div><div class="value">' + portsCount + '</div><div class="sub">' + (services.length - portsCount) + ' headless workers</div></div>';
    if (kafkaTopics.length) html += '<div class="stat-card"><div class="label">MQ Topics</div><div class="value">' + kafkaTopics.length + '</div><div class="sub">message queue topics</div></div>';
    if (redisStreams.length) html += '<div class="stat-card"><div class="label">Streams</div><div class="value">' + redisStreams.length + '</div><div class="sub">event streams</div></div>';
    html += '<div class="stat-card"><div class="label">Databases</div><div class="value">' + databases.length + '</div><div class="sub">' + databases.map(function (d) { return d.name; }).join(', ') + '</div></div>';
    html += '<div class="stat-card"><div class="label">Tests</div><div class="value">' + esc(String(totalTests)) + '</div><div class="sub">' + esc(testing.summary ? testing.summary.framework : '') + '</div></div>';
    html += '</div>';

    // Topology cards
    html += '<div class="topology-simple"><h2>System Topology</h2>';
    html += '<div class="legend"><div class="legend-section"><span class="legend-title">Domains</span>';
    (data['arch:domains'] || []).forEach(function (d) {
      html += '<div class="legend-item"><span class="dot" style="background:' + domainColor(d.name) + '"></span> ' + esc(d.name) + '</div>';
    });
    html += '<div class="legend-item"><span class="dot" style="background:' + (DOMAIN_COLORS['infra'] || 'var(--fg-dim)') + '"></span> Infrastructure</div>';
    html += '<div class="legend-item"><span class="dot" style="background:' + (DOMAIN_COLORS['external'] || 'var(--fg-dim)') + '"></span> External</div>';
    if (data['arch:frontend']) html += '<div class="legend-item"><span class="dot" style="background:' + (DOMAIN_COLORS['frontend'] || 'var(--fg-dim)') + '"></span> Frontend</div>';
    html += '</div></div>';

    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px;margin-top:16px;">';
    (data['arch:domains'] || []).forEach(function (d) {
      var color = domainColor(d.name);
      html += '<div style="background:var(--bg-elevated);border-radius:8px;padding:16px;border-left:3px solid ' + color + ';">';
      html += '<div style="font-size:14px;font-weight:600;color:' + color + ';">' + esc(d.name) + '</div>';
      html += '<div style="font-size:12px;color:var(--fg-dim);margin-bottom:8px;">' + esc(d.description) + '</div>';
      (d['arch:services'] || []).forEach(function (s) {
        html += '<div style="font-size:12px;color:var(--fg-muted);padding:2px 0;">' + esc(s.name) + (s['arch:port'] ? ' :' + s['arch:port'] : '') + '</div>';
      });
      html += '</div>';
    });
    // Infrastructure card
    var infraColor = DOMAIN_COLORS['infra'] || 'var(--fg-dim)';
    html += '<div style="background:var(--bg-elevated);border-radius:8px;padding:16px;border-left:3px solid ' + infraColor + ';">';
    html += '<div style="font-size:14px;font-weight:600;color:' + infraColor + ';">Infrastructure</div>';
    getInfrastructure(data).forEach(function (i) {
      html += '<div style="font-size:12px;color:var(--fg-muted);padding:2px 0;">' + esc(i.name) + (i['arch:port'] ? ' :' + i['arch:port'] : '') + '</div>';
    });
    html += '</div>';
    // External card
    var extColor = DOMAIN_COLORS['external'] || 'var(--fg-dim)';
    html += '<div style="background:var(--bg-elevated);border-radius:8px;padding:16px;border-left:3px solid ' + extColor + ';">';
    html += '<div style="font-size:14px;font-weight:600;color:' + extColor + ';">External Systems</div>';
    (data['arch:externalSystems'] || []).forEach(function (e) {
      html += '<div style="font-size:12px;color:var(--fg-muted);padding:2px 0;">' + esc(e.name) + '</div>';
    });
    html += '</div>';
    if (data['arch:frontend']) {
      var feColor = DOMAIN_COLORS['frontend'] || 'var(--fg-dim)';
      html += '<div style="background:var(--bg-elevated);border-radius:8px;padding:16px;border-left:3px solid ' + feColor + ';">';
      html += '<div style="font-size:14px;font-weight:600;color:' + feColor + ';">Frontend</div>';
      var fe = data['arch:frontend'];
      html += '<div style="font-size:12px;color:var(--fg-muted);padding:2px 0;">' + esc(fe.name) + (fe['arch:port'] ? ' :' + fe['arch:port'] : '') + '</div>';
      html += '</div>';
    }
    html += '</div></div>';
    document.getElementById('overview-content').innerHTML = html;
  }

  // === TAB 2: ARCHITECTURE GRAPH ===
  var graphStatusFilter = 'all';

  function renderGraph(data, containerId) {
    var container = document.getElementById(containerId);
    var services = getAllServices(data);
    var infra = getInfrastructure(data);
    var external = data['arch:externalSystems'] || [];
    var frontend = data['arch:frontend'];

    var nodes = {};
    external.forEach(function (e) { nodes[e['@id']] = { id: e['@id'], name: e.name, domain: 'external', type: 'external', port: null, status: 'implemented', nodeData: e }; });
    services.forEach(function (s) {
      if (graphStatusFilter !== 'all' && s['arch:status'] !== graphStatusFilter) return;
      nodes[s['@id']] = { id: s['@id'], name: s.name, domain: domainClass(s.domain), type: s['@type'] === 'arch:Worker' ? 'worker' : 'service', port: s['arch:port'], status: s['arch:status'], nodeData: s };
    });
    infra.forEach(function (i) {
      if (graphStatusFilter !== 'all' && i['arch:status'] !== graphStatusFilter) return;
      nodes[i['@id']] = { id: i['@id'], name: i.name, domain: 'infra', type: 'infra', port: i['arch:port'], status: i['arch:status'], nodeData: i };
    });
    if (frontend) {
      nodes[frontend['@id']] = { id: frontend['@id'], name: frontend.name, domain: 'frontend', type: 'frontend', port: frontend['arch:port'], status: 'implemented', nodeData: frontend };
    }

    var positions = {};
    Object.keys(nodes).forEach(function (id) {
      var pos = NODE_POSITIONS[id];
      if (pos) positions[id] = { x: pos.x, y: pos.y, node: nodes[id] };
    });

    var posValues = Object.values(positions);
    var maxY = posValues.length ? Math.max.apply(null, posValues.map(function (p) { return p.y; })) + 100 : 400;
    var maxX = posValues.length ? Math.max.apply(null, posValues.map(function (p) { return p.x + 190; })) + 40 : 800;

    var uniqueConns = GRAPH_CONNECTIONS.filter(function (c) { return positions[c.from] && positions[c.to]; });

    // Filter bar
    var html = '<div class="filter-bar"><label>Status Filter:</label>';
    html += '<select id="graph-status-filter"><option value="all"' + (graphStatusFilter === 'all' ? ' selected' : '') + '>All</option>';
    html += '<option value="implemented"' + (graphStatusFilter === 'implemented' ? ' selected' : '') + '>Implemented</option>';
    html += '<option value="planned"' + (graphStatusFilter === 'planned' ? ' selected' : '') + '>Planned</option></select></div>';

    // Legend
    html += '<div class="legend"><div class="legend-section"><span class="legend-title">Domains</span>';
    (data['arch:domains'] || []).forEach(function (d) {
      html += '<div class="legend-item"><span class="dot" style="background:' + domainColor(d.name) + '"></span> ' + esc(d.name) + '</div>';
    });
    html += '<div class="legend-item"><span class="dot" style="background:' + (DOMAIN_COLORS['infra'] || 'var(--fg-dim)') + '"></span> Infrastructure</div>';
    html += '<div class="legend-item"><span class="dot" style="background:' + (DOMAIN_COLORS['external'] || 'var(--fg-dim)') + '"></span> External</div>';
    if (frontend) html += '<div class="legend-item"><span class="dot" style="background:' + (DOMAIN_COLORS['frontend'] || 'var(--fg-dim)') + '"></span> Frontend</div>';
    html += '</div><div class="legend-section"><span class="legend-title">Connections</span>';
    Object.keys(CONN_STYLES).forEach(function (type) {
      var s = CONN_STYLES[type];
      html += '<div class="legend-item"><span class="line-sample" style="background:' + s.stroke + '"></span> ' + esc(type) + '</div>';
    });
    html += '</div></div>';

    html += '<div class="graph-container" style="min-height:' + (maxY + 40) + 'px;"><div class="graph-canvas" id="graph-canvas" style="height:' + (maxY + 40) + 'px;width:' + maxX + 'px;"></div></div>';
    html += '<div class="detail-panel" id="graph-detail-panel"><h3 id="graph-detail-name"></h3><div class="detail-subtitle" id="graph-detail-subtitle"></div><div class="detail-grid" id="graph-detail-content"></div></div>';
    container.innerHTML = html;

    document.getElementById('graph-status-filter').addEventListener('change', function () {
      graphStatusFilter = this.value;
      renderGraph(data, containerId);
    });

    var canvas = document.getElementById('graph-canvas');
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('connections-svg');
    svg.setAttribute('width', maxX); svg.setAttribute('height', maxY + 40);
    svg.style.width = maxX + 'px'; svg.style.height = (maxY + 40) + 'px';

    var defs = createArrowDefs('main');
    svg.appendChild(defs);
    canvas.appendChild(svg);

    var nodeElements = {};
    Object.entries(positions).forEach(function (entry) {
      var id = entry[0], pos = entry[1];
      var n = pos.node; var nd = n.nodeData || {};
      var div = document.createElement('div');
      div.className = 'node domain-' + n.domain + (n.status === 'planned' ? ' planned' : '');
      div.style.left = pos.x + 'px'; div.style.top = pos.y + 'px';
      div.dataset.id = id;
      div.title = n.name + (n.port ? ' :' + n.port : '') + (nd.description ? '\n' + nd.description : '');
      div.innerHTML = '<div class="node-header"><div class="node-icon">' + esc(n.name.charAt(0).toUpperCase()) + '</div><div><div class="node-name">' + esc(n.name) + '</div><div class="node-port">' + (n.port ? ':' + n.port : (n.type || '')) + '</div></div></div>';
      div.addEventListener('mouseenter', function () { highlightConnections(id, svg); });
      div.addEventListener('mouseleave', function () { clearHighlights(svg); });
      div.addEventListener('click', function () { showGraphDetail(n); });
      canvas.appendChild(div);
      nodeElements[id] = div;
    });

    requestAnimationFrame(function () {
      uniqueConns.forEach(function (conn) {
        var fromEl = nodeElements[conn.from], toEl = nodeElements[conn.to];
        if (!fromEl || !toEl) return;
        var cr = canvas.getBoundingClientRect();
        var fr = fromEl.getBoundingClientRect(), tr = toEl.getBoundingClientRect();
        var x1 = fr.left + fr.width / 2 - cr.left, y1 = fr.top + fr.height / 2 - cr.top;
        var x2 = tr.left + tr.width / 2 - cr.left, y2 = tr.top + tr.height / 2 - cr.top;
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M' + x1 + ',' + y1 + ' C' + x1 + ',' + ((y1 + y2) / 2) + ' ' + x2 + ',' + ((y1 + y2) / 2) + ' ' + x2 + ',' + y2);
        applyConnStyle(path, conn.type, 'main');
        path.dataset.from = conn.from; path.dataset.to = conn.to;
        svg.appendChild(path);
      });
    });
  }

  function createArrowDefs(prefix) {
    var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    Object.keys(CONN_STYLES).forEach(function (type) {
      var s = CONN_STYLES[type];
      var marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
      marker.setAttribute('id', prefix + '-arrow-' + type);
      marker.setAttribute('markerWidth', '8'); marker.setAttribute('markerHeight', '6');
      marker.setAttribute('refX', '8'); marker.setAttribute('refY', '3');
      marker.setAttribute('orient', 'auto');
      var polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      polygon.setAttribute('points', '0 0, 8 3, 0 6');
      polygon.setAttribute('fill', s.stroke);
      marker.appendChild(polygon);
      defs.appendChild(marker);
    });
    return defs;
  }

  function applyConnStyle(path, type, prefix) {
    var s = CONN_STYLES[type] || CONN_STYLES['http'] || { stroke: 'var(--fg-dim)' };
    path.classList.add('connection');
    path.setAttribute('stroke', s.stroke);
    if (s.dash) path.setAttribute('stroke-dasharray', s.dash);
    if (s.width) path.setAttribute('stroke-width', s.width);
    path.setAttribute('marker-end', 'url(#' + prefix + '-arrow-' + type + ')');
  }

  function highlightConnections(nodeId, svg) {
    svg.querySelectorAll('.connection').forEach(function (c) {
      if (c.dataset.from === nodeId || c.dataset.to === nodeId) { c.classList.add('highlight', 'animated'); }
      else { c.style.opacity = '0.1'; }
    });
    svg.querySelectorAll('.flow-label').forEach(function (lbl) {
      if (lbl.dataset.from === nodeId || lbl.dataset.to === nodeId) lbl.classList.add('visible');
    });
  }
  function clearHighlights(svg) {
    svg.querySelectorAll('.connection').forEach(function (c) { c.classList.remove('highlight', 'animated'); c.style.opacity = ''; });
    svg.querySelectorAll('.flow-label').forEach(function (lbl) { lbl.classList.remove('visible'); });
  }

  function showGraphDetail(n) {
    var panel = document.getElementById('graph-detail-panel');
    var nd = n.nodeData || n;
    document.getElementById('graph-detail-name').innerHTML = esc(nd.name || '') + (n.port ? ' <span class="port-badge">:' + n.port + '</span>' : '') + ' ' + statusBadge(n.status || nd['arch:status'] || 'implemented');
    document.getElementById('graph-detail-subtitle').textContent = nd.description || '';
    var html = '';
    if (nd['arch:protocol']) html += '<div class="detail-section"><h4>Protocol</h4><div>' + protocolBadges(nd['arch:protocol']) + '</div></div>';
    if (nd['arch:technology']) {
      var tech = Array.isArray(nd['arch:technology']) ? nd['arch:technology'] : [nd['arch:technology']];
      html += '<div class="detail-section"><h4>Technology</h4><ul>' + tech.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></div>';
    }
    if (nd['arch:endpoints']) html += '<div class="detail-section"><h4>Endpoints</h4><ul>' + nd['arch:endpoints'].map(function (e) { return '<li>' + esc((e.method || e.protocol || '') + ' ' + (e.path || e.service || '')) + '</li>'; }).join('') + '</ul></div>';
    if (nd['arch:dependsOn'] && nd['arch:dependsOn'].length) html += '<div class="detail-section"><h4>Dependencies</h4><ul>' + nd['arch:dependsOn'].map(function (d) { return '<li>' + esc(shortName(d)) + '</li>'; }).join('') + '</ul></div>';
    if (nd['arch:entities']) html += '<div class="detail-section"><h4>Entities</h4><ul>' + nd['arch:entities'].map(function (e) { return '<li>' + esc(e.name) + '</li>'; }).join('') + '</ul></div>';
    if (nd['arch:streams']) html += '<div class="detail-section"><h4>Streams</h4><ul>' + nd['arch:streams'].map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul></div>';
    if (nd['arch:topics']) html += '<div class="detail-section"><h4>Topics</h4><ul>' + nd['arch:topics'].map(function (t) { return '<li>' + esc(t.name) + '</li>'; }).join('') + '</ul></div>';
    if (nd['arch:integrationPoints']) html += '<div class="detail-section"><h4>Integration Points</h4><ul>' + nd['arch:integrationPoints'].map(function (ip) { return '<li>' + esc(ip.direction + ': ' + ip.description) + '</li>'; }).join('') + '</ul></div>';
    if (nd['arch:connects']) html += '<div class="detail-section"><h4>Connects To</h4><ul>' + nd['arch:connects'].map(function (c) { return '<li>' + esc(shortName(c.to) + ' (' + c.protocol + ')') + '</li>'; }).join('') + '</ul></div>';
    document.getElementById('graph-detail-content').innerHTML = html;
    panel.classList.add('visible');
  }

  // === TAB 3: SERVICES ===
  function renderServices(data) {
    var services = getAllServices(data);
    var html = '<div class="filter-bar"><label>Status:</label><select id="services-status-filter"><option value="all">All</option><option value="implemented">Implemented</option><option value="planned">Planned</option></select></div>';
    html += '<table class="services-table"><thead><tr><th>Service</th><th>Port</th><th>Protocol</th><th>Domain</th><th>Status</th><th>Dependencies</th><th>Description</th></tr></thead><tbody id="services-tbody">';
    services.forEach(function (s) {
      var deps = (s['arch:dependsOn'] || []).map(shortName).join(', ');
      html += '<tr data-status="' + (s['arch:status'] || 'implemented') + '">';
      html += '<td><strong>' + esc(s.name) + '</strong></td>';
      html += '<td>' + (s['arch:port'] ? '<span class="port-badge">:' + s['arch:port'] + '</span>' : '<span style="color:var(--fg-dim)">headless</span>') + '</td>';
      html += '<td>' + protocolBadges(s['arch:protocol']) + '</td>';
      html += '<td style="color:' + domainColor(s.domain) + '">' + esc(s.domain) + '</td>';
      html += '<td>' + statusBadge(s['arch:status'] || 'implemented') + '</td>';
      html += '<td style="font-size:12px;color:var(--fg-dim)">' + esc(deps) + '</td>';
      html += '<td style="font-size:12px;color:var(--fg-muted)">' + esc(s.description || '') + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table>';
    document.getElementById('services-content').innerHTML = html;
    document.getElementById('services-status-filter').addEventListener('change', function () {
      var val = this.value;
      document.querySelectorAll('#services-tbody tr').forEach(function (tr) {
        tr.style.display = (val === 'all' || tr.dataset.status === val) ? '' : 'none';
      });
    });
  }

  // === TAB 4: DATA FLOWS ===
  function buildNodeLookup(data) {
    var map = {};
    getAllServices(data).forEach(function (s) { map[s['@id']] = { name: s.name, domain: domainClass(s.domain), nodeData: s }; });
    getInfrastructure(data).forEach(function (i) { map[i['@id']] = { name: i.name, domain: 'infra', nodeData: i }; });
    (data['arch:externalSystems'] || []).forEach(function (e) { map[e['@id']] = { name: e.name, domain: 'external', nodeData: e }; });
    if (data['arch:frontend']) { var f = data['arch:frontend']; map[f['@id']] = { name: f.name, domain: 'frontend', nodeData: f }; }
    return map;
  }

  function inferProtoType(protocol) {
    var p = (protocol || '').toLowerCase();
    // Match against CONN_STYLES keys
    var keys = Object.keys(CONN_STYLES);
    for (var i = 0; i < keys.length; i++) {
      if (p.includes(keys[i])) return keys[i];
    }
    // Fallback heuristics
    if (p.includes('kafka') || p.includes('amqp') || p.includes('rabbit') || p.includes('mq')) return keys.find(function (k) { return k.includes('kafka') || k.includes('mq') || k.includes('queue'); }) || 'http';
    if (p.includes('redis') || p.includes('cache')) return keys.find(function (k) { return k.includes('redis') || k.includes('cache'); }) || 'http';
    if (p.includes('websocket') || p === 'ws') return keys.find(function (k) { return k.includes('websocket') || k.includes('ws'); }) || 'http';
    if (p.includes('grpc')) return keys.find(function (k) { return k.includes('grpc'); }) || 'http';
    return keys[0] || 'http';
  }

  function buildFlowGraphConfig(flow, idx) {
    var steps = flow.steps || [];
    var edges = steps.filter(function (s) { return s.from && s.to; });
    var nodeIdSet = new Set();
    edges.forEach(function (e) { nodeIdSet.add(e.from); nodeIdSet.add(e.to); });
    var nodeIds = Array.from(nodeIdSet);
    if (nodeIds.length === 0) return null;

    // First-appearance order for forward/backward classification
    var firstAppear = {}, order = 0;
    steps.forEach(function (s) {
      if (s.from && firstAppear[s.from] === undefined) firstAppear[s.from] = order++;
      if (s.to && firstAppear[s.to] === undefined) firstAppear[s.to] = order++;
    });

    var col = {};
    nodeIds.forEach(function (n) { col[n] = 0; });
    var forwardEdges = edges.filter(function (e) { return firstAppear[e.from] < firstAppear[e.to]; });
    for (var pass = 0; pass < nodeIds.length; pass++) {
      forwardEdges.forEach(function (e) { col[e.to] = Math.max(col[e.to], col[e.from] + 1); });
    }
    // Normalize columns
    var colValues = Array.from(new Set(Object.values(col))).sort(function (a, b) { return a - b; });
    var colRemap = {};
    colValues.forEach(function (v, i) { colRemap[v] = i; });
    nodeIds.forEach(function (n) { col[n] = colRemap[col[n]]; });

    var columns = {};
    nodeIds.forEach(function (id) { var c = col[id] || 0; if (!columns[c]) columns[c] = []; columns[c].push(id); });

    var COL_GAP = 230, ROW_GAP = 70, PAD = 24;
    var maxRows = Math.max.apply(null, Object.values(columns).map(function (arr) { return arr.length; }));
    var numCols = Object.keys(columns).length;

    var positions = {};
    Object.keys(columns).sort(function (a, b) { return a - b; }).forEach(function (c, ci) {
      var nodes = columns[c];
      var totalH = (nodes.length - 1) * ROW_GAP;
      var startY = PAD + (maxRows - 1) * ROW_GAP / 2 - totalH / 2;
      nodes.forEach(function (id, ri) { positions[id] = { x: PAD + ci * COL_GAP, y: Math.max(PAD, startY + ri * ROW_GAP) }; });
    });

    var connections = edges.map(function (s) {
      return { from: s.from, to: s.to, type: inferProtoType(s.protocol), protocol: s.protocol || '', data: s.data || '' };
    });

    return { canvasId: 'flow-canvas-' + idx, detailId: 'flow-detail-' + idx, positions: positions, connections: connections, posIds: Object.keys(positions) };
  }

  function mountFlowGraph(config, nodeLookup) {
    var canvas = document.getElementById(config.canvasId);
    if (!canvas) return;

    var defs = createArrowDefs(config.canvasId);

    var nodeElements = {};
    config.posIds.forEach(function (id) {
      var info = nodeLookup[id] || { name: shortName(id), domain: 'infra', nodeData: {} };
      var pos = config.positions[id];
      var displayName = shortName(id);
      var nd = info.nodeData || {};
      var div = document.createElement('div');
      div.className = 'node domain-' + info.domain;
      div.style.left = pos.x + 'px'; div.style.top = pos.y + 'px';
      div.dataset.id = id;
      div.title = info.name + (nd['arch:port'] ? ' :' + nd['arch:port'] : '') + (nd.description ? '\n' + nd.description : '');
      div.innerHTML = '<div class="node-header"><div class="node-icon">' + esc(displayName.charAt(0).toUpperCase()) + '</div><div><div class="node-name">' + esc(displayName) + '</div>' + (nd['arch:port'] ? '<div class="node-port">:' + nd['arch:port'] + '</div>' : '') + '</div></div>';
      div.addEventListener('mouseenter', function () { highlightConnections(id, svg); });
      div.addEventListener('mouseleave', function () { clearHighlights(svg); });
      div.addEventListener('click', function () {
        var panel = document.getElementById(config.detailId);
        document.getElementById(config.detailId + '-name').innerHTML = esc(info.name) + (nd['arch:port'] ? ' <span class="port-badge">:' + nd['arch:port'] + '</span>' : '') + ' ' + statusBadge(nd['arch:status'] || 'implemented');
        document.getElementById(config.detailId + '-sub').textContent = nd.description || '';
        var dhtml = '';
        var related = config.connections.filter(function (c) { return c.from === id || c.to === id; });
        if (related.length) {
          dhtml += '<div class="detail-section"><h4>Flow Connections</h4><ul>';
          related.forEach(function (c) {
            var arrow = c.from === id ? '→ ' + shortName(c.to) : shortName(c.from) + ' →';
            dhtml += '<li><strong>' + esc(arrow) + '</strong> ' + esc(c.protocol) + (c.data ? ' — <em>' + esc(c.data) + '</em>' : '') + '</li>';
          });
          dhtml += '</ul></div>';
        }
        if (nd['arch:technology']) {
          var tech = Array.isArray(nd['arch:technology']) ? nd['arch:technology'] : [nd['arch:technology']];
          dhtml += '<div class="detail-section"><h4>Technology</h4><ul>' + tech.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></div>';
        }
        document.getElementById(config.detailId + '-grid').innerHTML = dhtml;
        panel.classList.add('visible');
      });
      canvas.appendChild(div);
      nodeElements[id] = div;
    });

    // Auto-size canvas
    var canvasRect = canvas.getBoundingClientRect();
    var maxRight = 0, maxBottom = 0;
    Object.values(nodeElements).forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.right - canvasRect.left > maxRight) maxRight = r.right - canvasRect.left;
      if (r.bottom - canvasRect.top > maxBottom) maxBottom = r.bottom - canvasRect.top;
    });
    var hasBackward = config.connections.some(function (c) {
      var fe = nodeElements[c.from], te = nodeElements[c.to];
      return fe && te && fe.getBoundingClientRect().left >= te.getBoundingClientRect().left;
    });
    var realW = maxRight + 24, realH = maxBottom + (hasBackward ? 60 : 24);
    canvas.style.width = realW + 'px'; canvas.style.height = realH + 'px';
    canvas.parentElement.style.minHeight = realH + 'px';

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('connections-svg', 'flow-svg');
    svg.setAttribute('width', realW); svg.setAttribute('height', realH);
    svg.style.width = realW + 'px'; svg.style.height = realH + 'px';
    svg.appendChild(defs);
    canvas.appendChild(svg);

    requestAnimationFrame(function () {
      var edgeCounts = {}, edgeSeenCount = {};
      config.connections.forEach(function (conn) { var key = conn.from + '|' + conn.to; edgeCounts[key] = (edgeCounts[key] || 0) + 1; });

      config.connections.forEach(function (conn) {
        var fromEl = nodeElements[conn.from], toEl = nodeElements[conn.to];
        if (!fromEl || !toEl) return;
        var cr = canvas.getBoundingClientRect();
        var fr = fromEl.getBoundingClientRect(), tr = toEl.getBoundingClientRect();
        var goesForward = fr.left < tr.left;
        var x1, y1, x2, y2;
        if (goesForward) { x1 = fr.right - cr.left; y1 = fr.top + fr.height / 2 - cr.top; x2 = tr.left - cr.left; y2 = tr.top + tr.height / 2 - cr.top; }
        else { x1 = fr.left + fr.width / 2 - cr.left; y1 = fr.bottom - cr.top; x2 = tr.left + tr.width / 2 - cr.left; y2 = tr.bottom - cr.top; }

        var key = conn.from + '|' + conn.to;
        var pairCount = edgeCounts[key] || 1;
        edgeSeenCount[key] = (edgeSeenCount[key] || 0) + 1;
        var jitter = pairCount > 1 ? ((edgeSeenCount[key] - 1) - (pairCount - 1) / 2) * 16 : 0;

        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        var d;
        if (goesForward) { var cpx = (x2 - x1) * 0.4; d = 'M' + x1 + ',' + (y1 + jitter) + ' C' + (x1 + cpx) + ',' + (y1 + jitter) + ' ' + (x2 - cpx) + ',' + (y2 + jitter) + ' ' + x2 + ',' + (y2 + jitter); }
        else { var belowY = Math.max(y1, y2) + 30 + Math.abs(jitter); d = 'M' + x1 + ',' + y1 + ' C' + x1 + ',' + belowY + ' ' + x2 + ',' + belowY + ' ' + x2 + ',' + y2; }
        path.setAttribute('d', d);
        applyConnStyle(path, conn.type, config.canvasId);
        path.dataset.from = conn.from; path.dataset.to = conn.to;
        path.style.pointerEvents = 'stroke'; path.style.cursor = 'default';
        path.addEventListener('mouseenter', function () {
          svg.querySelectorAll('.flow-label').forEach(function (lbl) { if (lbl.dataset.from === conn.from && lbl.dataset.to === conn.to) lbl.classList.add('visible'); });
          path.classList.add('highlight');
        });
        path.addEventListener('mouseleave', function () {
          svg.querySelectorAll('.flow-label').forEach(function (lbl) { if (lbl.dataset.from === conn.from && lbl.dataset.to === conn.to) lbl.classList.remove('visible'); });
          path.classList.remove('highlight');
        });
        svg.appendChild(path);

        // Labels (hidden, shown on hover)
        if (conn.protocol) {
          var midX = (x1 + x2) / 2;
          var labelY = goesForward ? Math.min(y1, y2) + jitter - 10 : Math.max(y1, y2) + 30 + Math.abs(jitter) + 4;
          var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', midX); text.setAttribute('y', labelY); text.setAttribute('text-anchor', 'middle');
          text.classList.add('connection-label', 'flow-label');
          text.dataset.from = conn.from; text.dataset.to = conn.to;
          text.textContent = conn.protocol;
          svg.appendChild(text);
        }
        if (conn.data) {
          var dMidX = (x1 + x2) / 2;
          var dLabelY = goesForward ? Math.max(y1, y2) + jitter + 16 : Math.max(y1, y2) + 30 + Math.abs(jitter) + 16;
          var dt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          dt.setAttribute('x', dMidX); dt.setAttribute('y', dLabelY); dt.setAttribute('text-anchor', 'middle');
          dt.classList.add('connection-label', 'flow-label');
          dt.dataset.from = conn.from; dt.dataset.to = conn.to;
          dt.style.fontSize = '9px';
          dt.textContent = conn.data.length > 50 ? conn.data.substring(0, 47) + '...' : conn.data;
          svg.appendChild(dt);
        }
      });
    });
  }

  function renderFlows(data) {
    var flows = data['arch:dataFlows'] || [];
    var nodeLookup = buildNodeLookup(data);
    var configs = [];
    var html = '';

    flows.forEach(function (f, idx) {
      var colorCSS = FLOW_COLORS[f.name] || 'var(--accent)';
      var config = buildFlowGraphConfig(f, idx);
      configs.push(config);

      html += '<div class="flow-card"><h3 style="color:' + colorCSS + '">' + esc(f.name) + '</h3>';
      html += '<div class="flow-desc">' + esc(f.description) + '</div>';
      if (config) {
        html += '<div class="graph-container" style="margin-top:16px;"><div class="graph-canvas" id="' + config.canvasId + '"></div></div>';
        html += '<div class="detail-panel" id="' + config.detailId + '"><h3 id="' + config.detailId + '-name"></h3><div class="detail-subtitle" id="' + config.detailId + '-sub"></div><div class="detail-grid" id="' + config.detailId + '-grid"></div></div>';
      }

      var internals = (f.steps || []).filter(function (s) { return s.component && !s.to; });
      if (internals.length) {
        html += '<div class="flow-internal-actions" style="margin-top:8px;">';
        internals.forEach(function (a) {
          html += '<div class="flow-internal-action" style="border-left-color:' + colorCSS + ';"><strong>' + esc(a.component) + '</strong>';
          if (a.action) html += ' — ' + esc(a.action);
          html += '</div>';
        });
        html += '</div>';
      }

      html += '<details style="margin-top:12px;"><summary style="cursor:pointer;font-size:12px;color:var(--fg-dim);padding:4px 0;">Step-by-step details</summary>';
      html += '<div class="flow-steps" style="margin-top:8px;">';
      (f.steps || []).forEach(function (step) {
        html += '<div class="flow-step"><div class="step-connector"><div class="step-dot" style="background:' + colorCSS + '"></div><div class="step-line"></div></div><div class="step-content">';
        if (step.from && step.to) html += '<div class="step-from-to">' + esc(shortName(step.from)) + '<span class="arrow">&rarr;</span>' + esc(shortName(step.to)) + '</div>';
        else if (step.from && step.component) html += '<div class="step-from-to">' + esc(shortName(step.from)) + '<span class="arrow">&rarr;</span>' + esc(step.component) + '</div>';
        if (step.protocol) html += '<div class="step-protocol">' + esc(step.protocol) + '</div>';
        if (step.data) html += '<div class="step-data">' + esc(step.data) + '</div>';
        if (step.action) html += '<div class="step-data">' + esc(step.action) + '</div>';
        html += '</div></div>';
      });
      html += '</div></details></div>';
    });

    document.getElementById('flows-content').innerHTML = html;
    window._flowGraphConfigs = configs;
    window._flowGraphNodeLookup = nodeLookup;
    window._flowGraphsMounted = false;
  }

  function mountAllFlowGraphs() {
    if (window._flowGraphsMounted) return;
    requestAnimationFrame(function () {
      (window._flowGraphConfigs || []).forEach(function (config) { if (config) mountFlowGraph(config, window._flowGraphNodeLookup || {}); });
      window._flowGraphsMounted = true;
    });
  }

  // === TAB 5: DEPLOY ===
  function renderDeploy(data) {
    var dep = data['arch:deploymentConsiderations'] || {};
    var html = '<div class="deploy-grid">';
    if (dep.stateless) {
      html += '<div class="deploy-card"><h3><div class="deploy-icon" style="background:oklch(0.64 0.17 155/20%);color:oklch(0.64 0.17 155)">S</div>Stateless</h3><div class="deploy-items">';
      dep.stateless.forEach(function (s) { html += '<div class="deploy-item"><span class="name">' + esc(s) + '</span><span class="note">Scale freely</span></div>'; });
      html += '</div></div>';
    }
    if (dep.stateful_inmemory) {
      html += '<div class="deploy-card"><h3><div class="deploy-icon" style="background:oklch(0.75 0.18 85/20%);color:oklch(0.75 0.18 85)">M</div>Stateful In-Memory</h3><div class="deploy-items">';
      dep.stateful_inmemory.forEach(function (s) { html += '<div class="deploy-item"><span class="name">' + esc(s) + '</span><span class="note">Sticky sessions</span></div>'; });
      html += '</div></div>';
    }
    if (dep.stateful_db) {
      html += '<div class="deploy-card"><h3><div class="deploy-icon" style="background:oklch(0.63 0.21 25/20%);color:oklch(0.63 0.21 25)">D</div>Stateful DB</h3><div class="deploy-items">';
      dep.stateful_db.forEach(function (s) { html += '<div class="deploy-item"><span class="name">' + esc(s) + '</span><span class="note">Single instance</span></div>'; });
      html += '</div></div>';
    }
    if (dep.horizontalScaling) {
      html += '<div class="deploy-card"><h3><div class="deploy-icon" style="background:oklch(0.70 0.16 165/20%);color:oklch(0.70 0.16 165)">H</div>Horizontal Scaling</h3><div class="deploy-items">';
      Object.entries(dep.horizontalScaling).forEach(function (e) { html += '<div class="deploy-item"><span class="name">' + esc(e[0]) + '</span><span class="note">' + esc(e[1]) + '</span></div>'; });
      html += '</div></div>';
    }
    html += '</div>';
    document.getElementById('deploy-content').innerHTML = html;
  }

  // === TAB 6: DECISIONS ===
  function renderDecisions(data) {
    var decisions = data['arch:decisions'] || [];
    var html = '';
    decisions.forEach(function (d) {
      var cls = d.status === 'accepted' ? 'badge-accepted' : d.status === 'superseded' ? 'badge-superseded' : 'badge-deprecated';
      html += '<div class="adr-card" onclick="this.classList.toggle(\'expanded\')">';
      html += '<div class="adr-header"><div class="adr-title">' + esc(d.title) + '</div><div><span class="badge ' + cls + '">' + esc(d.status) + '</span> <span class="adr-meta">' + esc(d.date || '') + '</span></div></div>';
      html += '<div class="adr-body">';
      if (d.context) html += '<div class="adr-section"><h4>Context</h4><p>' + esc(d.context) + '</p></div>';
      if (d.decision) html += '<div class="adr-section"><h4>Decision</h4><p>' + esc(d.decision) + '</p></div>';
      if (d.consequences) html += '<div class="adr-section"><h4>Consequences</h4><p>' + esc(d.consequences) + '</p></div>';
      if (d.alternatives && d.alternatives.length) {
        html += '<div class="adr-section"><h4>Alternatives</h4><ul style="list-style:none;padding:0;">';
        d.alternatives.forEach(function (a) { html += '<li style="font-size:13px;color:var(--fg-dim);padding:2px 0;">&bull; ' + esc(a) + '</li>'; });
        html += '</ul></div>';
      }
      html += '</div></div>';
    });
    document.getElementById('decisions-content').innerHTML = html;
  }

  // === TAB 7: SLAs ===
  function renderSLAs(data) {
    var sla = data['arch:sla'] || {};
    var html = '';
    ['latency', 'throughput'].forEach(function (key) {
      if (!sla[key]) return;
      html += '<div class="sla-section"><h3>' + key.charAt(0).toUpperCase() + key.slice(1) + '</h3><div class="sla-grid">';
      Object.entries(sla[key]).forEach(function (e) {
        html += '<div class="sla-card"><h4>' + esc(e[0]) + '</h4>';
        if (e[1].target) html += '<div class="sla-target">Target: ' + esc(e[1].target) + '</div>';
        if (e[1].measured) html += '<div class="sla-measured">Measured: ' + esc(e[1].measured) + '</div>';
        if (e[1].notes) html += '<div class="sla-notes">' + esc(e[1].notes) + '</div>';
        html += '</div>';
      });
      html += '</div></div>';
    });
    if (sla.availability) {
      html += '<div class="sla-section"><h3>Availability</h3><div class="sla-grid"><div class="sla-card"><h4>Current</h4>';
      if (sla.availability.target) html += '<div class="sla-target">Target: ' + esc(sla.availability.target) + '</div>';
      if (sla.availability.current) html += '<div class="sla-measured">Current: ' + esc(sla.availability.current) + '</div>';
      if (sla.availability.notes) html += '<div class="sla-notes">' + esc(sla.availability.notes) + '</div>';
      html += '</div></div></div>';
    }
    document.getElementById('slas-content').innerHTML = html;
  }

  // === TAB 8: SECURITY ===
  function renderSecurity(data) {
    var sec = data['arch:security'] || {};
    var html = '<div class="security-grid">';
    Object.entries(sec).forEach(function (e) {
      html += '<div class="security-card"><h4>' + esc(e[0]) + '</h4><div class="sec-row">';
      html += '<div class="sec-current"><div class="sec-label">Current State</div><div class="sec-text">' + esc(e[1].current || 'N/A') + '</div></div>';
      html += '<div class="sec-planned"><div class="sec-label">Planned</div><div class="sec-text">' + esc(e[1].planned || 'N/A') + '</div></div>';
      html += '</div></div>';
    });
    html += '</div>';
    document.getElementById('security-content').innerHTML = html;
  }

  // === TAB 9: OBSERVABILITY ===
  function renderObservability(data) {
    var obs = data['arch:observability'] || {};
    var html = '<div class="obs-grid">';
    Object.entries(obs).forEach(function (e) {
      html += '<div class="obs-card"><h4>' + esc(e[0]) + '</h4>';
      if (typeof e[1] === 'object' && !Array.isArray(e[1])) {
        Object.entries(e[1]).forEach(function (kv) {
          if (kv[0] === 'endpoints' && Array.isArray(kv[1])) { html += '<div class="obs-detail"><strong>Endpoints:</strong></div>'; kv[1].forEach(function (ep) { html += '<div class="obs-detail" style="padding-left:12px;font-family:monospace;font-size:12px;">' + esc(ep) + '</div>'; }); }
          else if (typeof kv[1] === 'boolean') { html += '<div class="obs-detail"><strong>' + esc(kv[0]) + ':</strong> ' + (kv[1] ? '<span style="color:oklch(0.64 0.17 155)">Yes</span>' : '<span style="color:oklch(0.63 0.21 25)">No</span>') + '</div>'; }
          else { html += '<div class="obs-detail"><strong>' + esc(kv[0]) + ':</strong> ' + esc(String(kv[1])) + '</div>'; }
        });
      } else { html += '<div class="obs-detail">' + esc(String(e[1])) + '</div>'; }
      html += '</div>';
    });
    html += '</div>';
    document.getElementById('observability-content').innerHTML = html;
  }

  // === TAB 10: RESILIENCE ===
  function renderResilience(data) {
    var patterns = (data['arch:resilience'] || {}).patterns || [];
    var html = '<div class="resilience-grid">';
    patterns.forEach(function (p) {
      html += '<div class="resilience-card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;"><h4>' + esc(p.name) + '</h4>' + statusBadge(p.status) + '</div>';
      html += '<div class="res-service">' + esc(p.service) + '</div>';
      html += '<div class="res-detail">' + esc(p.details) + '</div></div>';
    });
    html += '</div>';
    document.getElementById('resilience-content').innerHTML = html;
  }

  // === TAB 11: DEV SETUP ===
  function renderDevSetup(data) {
    var dev = data['arch:localDev'] || {};
    var html = '';
    if (dev.prerequisites) { html += '<div class="devsetup-card"><h4>Prerequisites</h4><ul>'; dev.prerequisites.forEach(function (p) { html += '<li>' + esc(p) + '</li>'; }); html += '</ul></div>'; }
    if (dev.infrastructure) {
      html += '<div class="devsetup-card"><h4>Infrastructure</h4>';
      if (dev.infrastructure.command) html += '<pre>' + esc(dev.infrastructure.command) + '</pre>';
      if (dev.infrastructure.services) { html += '<ul style="margin-top:12px;">'; dev.infrastructure.services.forEach(function (s) { html += '<li>' + esc(s) + '</li>'; }); html += '</ul>'; }
      if (dev.infrastructure.notes) html += '<div style="font-size:12px;color:var(--fg-dim);margin-top:8px;">' + esc(dev.infrastructure.notes) + '</div>';
      html += '</div>';
    }
    if (dev.startupOrder) { html += '<div class="devsetup-card"><h4>Startup Order</h4><ol>'; dev.startupOrder.forEach(function (s) { html += '<li>' + esc(s) + '</li>'; }); html += '</ol></div>'; }
    if (dev.migrations) {
      html += '<div class="devsetup-card"><h4>Migrations</h4>';
      Object.entries(dev.migrations).forEach(function (e) { html += '<div style="margin-bottom:8px;"><strong style="font-size:13px;">' + esc(e[0]) + ':</strong> <span style="font-size:13px;color:var(--fg-muted);">' + esc(e[1]) + '</span></div>'; });
      html += '</div>';
    }
    if (dev.envVars) { html += '<div class="devsetup-card"><h4>Environment Variables</h4><pre>'; Object.entries(dev.envVars).forEach(function (e) { html += esc(e[0]) + '=' + esc(e[1]) + '\n'; }); html += '</pre></div>'; }
    if (dev.seedData) html += '<div class="devsetup-card"><h4>Seed Data</h4><div style="font-size:13px;color:var(--fg-muted);">' + esc(dev.seedData) + '</div></div>';
    if (dev.notes) html += '<div class="devsetup-card"><h4>Notes</h4><div style="font-size:13px;color:var(--fg-muted);">' + esc(dev.notes) + '</div></div>';
    document.getElementById('devsetup-content').innerHTML = html;
  }

  // === TAB 12: TESTING ===
  function renderTesting(data) {
    var testing = data['arch:testing'] || {};
    var summary = testing.summary || {};
    var html = '<div class="testing-stats">';
    html += '<div class="stat-card"><div class="label">Total Tests</div><div class="value">' + esc(String(summary.total || '0')) + '</div></div>';
    html += '<div class="stat-card"><div class="label">Coverage</div><div class="value">' + esc(summary.coverage || 'N/A') + '</div></div>';
    html += '<div class="stat-card"><div class="label">Framework</div><div class="value" style="font-size:16px;">' + esc(summary.framework || 'N/A') + '</div></div>';
    html += '</div>';
    if (testing.byService) {
      html += '<table class="testing-table"><thead><tr><th>Service</th><th>Tests</th><th>Coverage</th><th>Types</th><th>Notes</th></tr></thead><tbody>';
      testing.byService.forEach(function (s) {
        html += '<tr><td><strong>' + esc(s.service) + '</strong></td><td>' + s.tests + '</td><td>' + esc(s.coverage || 'N/A') + '</td>';
        html += '<td>' + (s.types || []).map(function (t) { return '<span class="badge badge-implemented">' + esc(t) + '</span> '; }).join('') + '</td>';
        html += '<td style="font-size:12px;color:var(--fg-dim)">' + esc(s.notes || '') + '</td></tr>';
      });
      html += '</tbody></table>';
    }
    if (testing.gaps) { html += '<div class="gap-list"><h4>Testing Gaps</h4><ul>'; testing.gaps.forEach(function (g) { html += '<li>' + esc(g) + '</li>'; }); html += '</ul></div>'; }
    if (testing.contractTests) {
      html += '<div style="margin-top:16px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:20px;">';
      html += '<h4 style="font-size:14px;font-weight:600;margin-bottom:8px;">Contract Testing</h4>';
      html += '<div style="font-size:13px;color:var(--fg-muted);">' + statusBadge(testing.contractTests.status) + ' ' + esc(testing.contractTests.approach || '') + '</div></div>';
    }
    document.getElementById('testing-content').innerHTML = html;
  }

  // === TAB NAVIGATION ===
  function switchTab(viewId) {
    document.querySelectorAll('.nav-tab').forEach(function (t) { t.classList.remove('active'); });
    document.querySelectorAll('.view').forEach(function (v) { v.classList.remove('active'); });
    document.querySelector('.nav-tab[data-view="' + viewId + '"]').classList.add('active');
    document.getElementById('view-' + viewId).classList.add('active');
    if (viewId === 'graph') renderGraph(archData, 'graph-content');
    if (viewId === 'flows') mountAllFlowGraphs();
  }
  document.querySelectorAll('.nav-tab').forEach(function (tab) {
    tab.addEventListener('click', function () { switchTab(this.dataset.view); });
  });

  // === THEME TOGGLE ===
  var themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var html = document.documentElement;
      var isDark = html.classList.contains('dark') || !html.classList.contains('light');
      html.classList.toggle('dark', !isDark);
      html.classList.toggle('light', isDark);
      themeBtn.textContent = isDark ? '☀ Light' : '☾ Dark';
    });
  }

  // === INIT ===
  // Version is available in archData.version if needed
  renderOverview(archData);
  renderServices(archData);
  renderFlows(archData);
  renderDeploy(archData);
  renderDecisions(archData);
  renderSLAs(archData);
  renderSecurity(archData);
  renderObservability(archData);
  renderResilience(archData);
  renderDevSetup(archData);
  renderTesting(archData);
})();
