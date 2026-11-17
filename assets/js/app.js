/**
 * Tunas Toyota Kiara Condong - Dashboard Supervisor Sales Tim 1 (Pak Ryan)
 * Single Page Application Controller & Interactive Business Logic
 */

(function () {
  'use strict';

  // Global Data Reference
  const data = window.RYAN_DATA || {};

  // Custom Prospects LocalStorage Key
  const LS_CUSTOM_PROSPECTS_KEY = 'ryan_custom_prospects_v1';

  // Load custom prospects from localStorage
  function loadCustomProspects() {
    try {
      const stored = localStorage.getItem(LS_CUSTOM_PROSPECTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load custom prospects from localStorage:', e);
      return [];
    }
  }

  // Save custom prospects to localStorage
  function saveCustomProspects(list) {
    try {
      localStorage.setItem(LS_CUSTOM_PROSPECTS_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save custom prospects to localStorage:', e);
    }
  }

  // Application State
  const state = {
    currentTab: 'overview',
    customProspects: loadCustomProspects(),
    prospek: {
      page: 1,
      pageSize: 15,
      search: '',
      stage: 'all',
      rating: 'all',
      salesman: 'all'
    },
    activity: {
      category: 'all',
      funnel: 'all'
    },
    penjualan: {
      currentSub: 'do-ytd',
      page: 1,
      pageSize: 20,
      search: '',
      month: 'all',
      model: 'all',
      salesman: 'all',
      payment: 'all'
    },
    olx: {
      scope: 'ryan',
      search: '',
      month: 'all',
      status: 'all',
      salesman: 'all'
    },
    wiraniaga: {
      search: ''
    },
    sbi: {
      page: 1,
      pageSize: 20,
      search: '',
      cai: 'all',
      judgement: 'all',
      kedatangan: 'all'
    },
    oneaccount: {
      scope: 'ryan',
      search: '',
      status: 'all',
      consent: 'all',
      salesman: 'all'
    },
    afi: {
      page: 1,
      pageSize: 25,
      search: '',
      month: 'all',
      payment: 'all',
      leasing: 'all',
      pma: 'all',
      sales: 'all'
    },
    charts: {}
  };

  // Utility: Format Number
  function fmtNumber(n) {
    if (n === null || n === undefined || isNaN(n)) return '0';
    return Number(n).toLocaleString('id-ID');
  }

  // Utility: Format Rupiah
  function fmtRupiah(n) {
    if (!n) return 'Rp 0';
    return 'Rp ' + Number(n).toLocaleString('id-ID');
  }

  // Utility: Show Toast Notification
  function showToast(message) {
    const toast = document.getElementById('toastNotice');
    const toastText = document.getElementById('toastText');
    if (!toast) return;
    if (toastText) toastText.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  // Utility: Download CSV file
  function downloadCsv(filename, csvContent) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Topbar Clock
  function startClock() {
    const clockEl = document.getElementById('topbarClock');
    if (!clockEl) return;
    function update() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      clockEl.textContent = `${hours}:${mins}:${secs} WIB`;
    }
    update();
    setInterval(update, 1000);
  }

  // Sidebar Toggle for Mobile / Collapsible
  function initSidebar() {
    const toggleBtn = document.getElementById('btnSidebarToggle');
    const sidebar = document.getElementById('mainSidebar');
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('show');
      });
    }

    // Nav Link Clicks
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const tab = link.getAttribute('data-tab');
        if (tab) {
          switchTab(tab);
          if (window.innerWidth < 992 && sidebar) {
            sidebar.classList.remove('show');
          }
        }
      });
    });
  }

  // View Switching
  function switchTab(tabId) {
    state.currentTab = tabId;
    window.location.hash = tabId;

    // Update active state in sidebar
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
      if (link.getAttribute('data-tab') === tabId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update active tab pane
    document.querySelectorAll('.tab-pane').forEach(pane => {
      if (pane.id === `pane-${tabId}`) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Render tab-specific charts or content
    setTimeout(() => {
      if (tabId === 'overview') {
        renderOverviewCharts();
      } else if (tabId === 'activity') {
        renderActivityCharts();
        renderActivityTable();
      } else if (tabId === 'leasing') {
        renderLeasingCharts();
      } else if (tabId === 'foa') {
        renderFoaChart();
        renderFoaTable();
      } else if (tabId === 'olx') {
        renderOlxCharts();
        renderOlxTable();
      } else if (tabId === 'aoreport') {
        renderAoCharts();
      } else if (tabId === 'afi') {
        renderAfiCharts();
        renderAfiTable();
      } else if (tabId === 'funnel') {
        renderFunnelChart();
      } else if (tabId === 'sbi') {
        renderSbiCharts();
      } else if (tabId === 'oneaccount') {
        renderOneAccountCharts();
        renderOneAccountTable();
      }
    }, 50);
  }

  // Global window function for switchTab (usable from inline onclicks)
  window.switchTab = switchTab;

  // Update Prospect Badges and Counters
  function updateProspectCounters() {
    const initialCount = (data.hotProspects || []).length;
    const customCount = state.customProspects.length;
    const totalCount = initialCount + customCount;

    const navBadge = document.getElementById('navBadgeProspectCount');
    if (navBadge) navBadge.textContent = fmtNumber(totalCount);

    const kpiOverview = document.getElementById('kpiOverviewProspects');
    if (kpiOverview) kpiOverview.textContent = `${fmtNumber(totalCount)} Leads`;

    const kpiOverviewSub = document.getElementById('kpiOverviewProspectsSub');
    if (kpiOverviewSub) {
      if (customCount > 0) {
        kpiOverviewSub.innerHTML = `Termasuk <strong>${customCount}</strong> input mandiri SPV / Sales`;
      } else {
        kpiOverviewSub.textContent = 'Termasuk input mandiri SPV / Sales';
      }
    }

    const customAlert = document.getElementById('customProspectsAlert');
    const customCountEl = document.getElementById('customProspectsCount');
    const btnReset = document.getElementById('btnResetCustomProspects');

    if (customAlert && customCountEl) {
      if (customCount > 0) {
        customAlert.style.display = 'flex';
        customCountEl.textContent = customCount;
        if (btnReset) btnReset.style.display = 'inline-flex';
      } else {
        customAlert.style.display = 'none';
        if (btnReset) btnReset.style.display = 'none';
      }
    }
  }

  // =========================================================================
  // TAB 1: OVERVIEW CONTROLLER
  // =========================================================================
  function initOverview() {
    const kpi = data.kpi || {};
    const elDo = document.getElementById('kpiOverviewTotalDo');
    if (elDo) elDo.textContent = `${fmtNumber(kpi.totalDo || 336)} Unit`;

    const elRev = document.getElementById('kpiOverviewRevenue');
    if (elRev) elRev.textContent = `Rp ${(kpi.totalRevenueM || 124.63).toFixed(2).replace('.', ',')} M`;

    const elRevSub = document.getElementById('kpiOverviewRevenueSub');
    if (elRevSub) elRevSub.innerHTML = `Rata-rata OTR <strong>Rp ${(kpi.avgOtrJt || 370.9).toFixed(1).replace('.', ',')} Jt / Unit</strong>`;

    const elSbi = document.getElementById('kpiOverviewSbi');
    if (elSbi) elSbi.textContent = `${fmtNumber(kpi.totalSbiRecords || 704)} Unit`;

    updateProspectCounters();
    renderTopSalesList();
    renderOverviewCharts();
  }

  function renderTopSalesList() {
    const container = document.getElementById('overviewTopSalesList');
    if (!container) return;

    const salesList = [...(data.salesforce || [])].sort((a, b) => {
      if ((b.actualDo || 0) !== (a.actualDo || 0)) {
        return (b.actualDo || 0) - (a.actualDo || 0);
      }
      return (b.actualSpk || 0) - (a.actualSpk || 0);
    }).slice(0, 5);

    let html = '<div style="display:flex; flex-direction:column; gap:10px;">';
    salesList.forEach((s, idx) => {
      const initials = s.name.split(' ').filter(w => !w.startsWith('(')).map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const badgeColor = idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : '#0284c7';

      html += `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:34px; height:34px; border-radius:50%; background:${badgeColor}; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12px;">
              #${idx + 1}
            </div>
            <div>
              <strong style="font-size:13px; color:var(--slate-800);">${s.name}</strong>
              <div style="font-size:11.5px; color:var(--slate-500);">
                <span>Wiraniaga Tim 1 Pak Ryan</span>
              </div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:20px;">
            <div style="text-align:right;">
              <span style="font-size:11px; color:var(--slate-500);">SPK Bulan Ini</span>
              <div style="font-size:13.5px; font-weight:700; color:#0284c7;">${s.actualSpk || 0} / ${s.targetSpk} SPK</div>
            </div>
            <div style="text-align:right;">
              <span style="font-size:11px; color:var(--slate-500);">DO Bulan Ini</span>
              <div style="font-size:13.5px; font-weight:700; color:var(--primary-red);">${s.actualDo || 0} / ${s.targetDo} DO</div>
            </div>
          </div>
        </div>
      `;
    });
    html += '</div>';
    container.innerHTML = html;
  }

  function renderOverviewCharts() {
    // 1. Monthly Trend Bar Chart
    const trendEl = document.getElementById('chartOverviewMonthlyTrend');
    if (trendEl && !state.charts.overviewMonthlyTrend) {
      const trendData = data.monthlyTrend || [];
      const categories = trendData.map(d => d.month);
      const creditSeries = trendData.map(d => d.kredit);
      const cashSeries = trendData.map(d => d.tunai);

      const options = {
        chart: {
          type: 'bar',
          height: 300,
          stacked: true,
          toolbar: { show: false },
          fontFamily: 'Inter, sans-serif'
        },
        colors: ['#eb0a1e', '#0f172a'],
        series: [
          { name: 'Kredit (Leasing)', data: creditSeries },
          { name: 'Tunai (Cash)', data: cashSeries }
        ],
        xaxis: { categories: categories },
        yaxis: { title: { text: 'Jumlah Delivery (Unit)' } },
        legend: { position: 'top' },
        dataLabels: { enabled: false }
      };

      state.charts.overviewMonthlyTrend = new ApexCharts(trendEl, options);
      state.charts.overviewMonthlyTrend.render();
    }

    // 2. Model Distribution Donut Chart
    const modelEl = document.getElementById('chartOverviewModels');
    if (modelEl && !state.charts.overviewModels) {
      const modelData = data.modelDist || [];
      const labels = modelData.map(d => d.model);
      const series = modelData.map(d => d.units);

      const options = {
        chart: {
          type: 'donut',
          height: 300,
          fontFamily: 'Inter, sans-serif'
        },
        colors: ['#eb0a1e', '#1e293b', '#2563eb', '#16a34a', '#d97706', '#9333ea', '#06b6d4', '#e11d48'],
        series: series,
        labels: labels,
        legend: { position: 'bottom' },
        dataLabels: { enabled: true, formatter: (val) => val.toFixed(1) + '%' }
      };

      state.charts.overviewModels = new ApexCharts(modelEl, options);
      state.charts.overviewModels.render();
    }
  }

  // =========================================================================
  // TAB 2: HOT PROSPEK & SMART PASTE CONTROLLER
  // =========================================================================
  function initProspek() {
    populateProspekFilterOptions();
    bindProspekEvents();
    renderProspekTable();
    initSmartPasteModal();
  }

  function populateProspekFilterOptions() {
    const selectSales = document.getElementById('filterProspekSalesman');
    const stageSelect = document.getElementById('filterProspekStage');
    const ratingSelect = document.getElementById('filterProspekRating');
    const manSales = document.getElementById('manSalesman');

    const all = getAllMergedProspects();

    // 1. Salesmen dropdown options
    if (selectSales) {
      const salesSet = new Set();
      all.forEach(p => {
        const s = p.salesman || p.sales || p.wiraniaga;
        if (s) salesSet.add(s);
      });
      (data.salesforce || []).forEach(s => salesSet.add(s.name));

      const sortedSales = Array.from(salesSet).filter(Boolean).sort();
      selectSales.innerHTML = '<option value="all">Semua Wiraniaga</option>';
      sortedSales.forEach(name => {
        selectSales.innerHTML += `<option value="${name}">${name}</option>`;
      });
    }

    // 2. Stage dropdown options
    if (stageSelect) {
      const stageSet = new Set();
      all.forEach(p => {
        if (p.stage) stageSet.add(p.stage);
      });
      stageSelect.innerHTML = '<option value="all">Semua Tahapan</option>';
      Array.from(stageSet).filter(Boolean).sort().forEach(st => {
        stageSelect.innerHTML += `<option value="${st}">${st}</option>`;
      });
    }

    // 3. Rating dropdown options
    if (ratingSelect) {
      const ratingSet = new Set();
      all.forEach(p => {
        if (p.rating) ratingSet.add(p.rating);
      });
      ratingSelect.innerHTML = '<option value="all">Semua Rating</option>';
      Array.from(ratingSet).filter(Boolean).sort().forEach(rt => {
        ratingSelect.innerHTML += `<option value="${rt}">${rt}</option>`;
      });
    }

    // 4. Manual Add Form Salesmen
    if (manSales) {
      const salesmen = (data.salesforce || []).map(s => s.name);
      manSales.innerHTML = '';
      salesmen.forEach(name => {
        manSales.innerHTML += `<option value="${name}">${name}</option>`;
      });
    }
  }

  function bindProspekEvents() {
    const searchInput = document.getElementById('filterProspekSearch');
    const stageSelect = document.getElementById('filterProspekStage');
    const ratingSelect = document.getElementById('filterProspekRating');
    const salesSelect = document.getElementById('filterProspekSalesman');
    const exportBtn = document.getElementById('btnExportProspekCsv');
    const resetBtn = document.getElementById('btnResetCustomProspects');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.prospek.search = e.target.value.toLowerCase().trim();
        state.prospek.page = 1;
        renderProspekTable();
      });
    }

    if (stageSelect) {
      stageSelect.addEventListener('change', (e) => {
        state.prospek.stage = e.target.value;
        state.prospek.page = 1;
        renderProspekTable();
      });
    }

    if (ratingSelect) {
      ratingSelect.addEventListener('change', (e) => {
        state.prospek.rating = e.target.value;
        state.prospek.page = 1;
        renderProspekTable();
      });
    }

    if (salesSelect) {
      salesSelect.addEventListener('change', (e) => {
        state.prospek.salesman = e.target.value;
        state.prospek.page = 1;
        renderProspekTable();
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', exportProspekCsv);
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin mereset seluruh data prospek input mandiri? Data awal 105 prospek bawaan spreadsheet tetap aman.')) {
          state.customProspects = [];
          saveCustomProspects([]);
          updateProspectCounters();
          renderProspekTable();
          showToast('Data input mandiri berhasil direset.');
        }
      });
    }
  }

  function getAllMergedProspects() {
    // Custom prospects first (marked with isCustom: true), then initial prospects
    return [...state.customProspects, ...(data.hotProspects || [])];
  }

  function getFilteredProspek() {
    const all = getAllMergedProspects();
    return all.filter(p => {
      const name = (p.name || p.cust || p.customer || '').toLowerCase();
      const phone = (p.phone || '').toLowerCase();
      const sales = (p.salesman || p.sales || p.wiraniaga || '').toLowerCase();
      const model = (p.model || p.unit || '').toLowerCase();
      const notes = (p.notes || p.note || p.catatan || '').toLowerCase();

      // Search
      if (state.prospek.search) {
        const q = state.prospek.search.toLowerCase();
        const target = `${name} ${phone} ${sales} ${model} ${notes}`;
        if (!target.includes(q)) return false;
      }
      // Stage
      if (state.prospek.stage !== 'all') {
        const curStage = (p.stage || '').toLowerCase();
        if (curStage !== state.prospek.stage.toLowerCase()) {
          return false;
        }
      }
      // Rating
      if (state.prospek.rating !== 'all') {
        const curRating = (p.rating || 'Hot').toLowerCase();
        if (curRating !== state.prospek.rating.toLowerCase()) {
          return false;
        }
      }
      // Salesman (flexible matching)
      if (state.prospek.salesman !== 'all') {
        const sel = state.prospek.salesman.toLowerCase();
        if (!sales.includes(sel) && !sel.includes(sales)) {
          return false;
        }
      }
      return true;
    });
  }

  function renderProspekTable() {
    const tbody = document.getElementById('prospekTableBody');
    const badge = document.getElementById('prospekShowingBadge');
    const pagination = document.getElementById('prospekPagination');
    if (!tbody) return;

    const filtered = getFilteredProspek();
    const total = filtered.length;

    if (badge) {
      badge.textContent = `Menampilkan ${total} Prospek Aktif Tim Ryan`;
    }

    // Pagination
    const page = state.prospek.page;
    const pageSize = state.prospek.pageSize;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    if (paginated.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:30px; color:var(--slate-500);">Tidak ada data prospek yang cocok dengan kriteria filter.</td></tr>';
      if (pagination) pagination.innerHTML = '';
      return;
    }

    let rowsHtml = '';
    paginated.forEach((p, idx) => {
      const rowNo = startIndex + idx + 1;
      const isCustom = !!p.isCustom;
      const name = p.name || p.cust || p.customer || 'Tanpa Nama';
      const phone = p.phone || '-';
      const sales = p.salesman || p.sales || p.wiraniaga || '-';
      const model = p.model || p.unit || '-';
      const rating = p.rating || 'Hot';
      const stage = p.stage || 'Follow-up';
      const payment = p.payment || p.type || 'Kredit';
      const leasing = p.leasing || '-';
      const notes = p.notes || p.note || p.catatan || '-';

      const badgeRating = rating.toLowerCase() === 'hot' ? 'badge-kredit' : 'badge-tunai';
      const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
      const waLink = cleanPhone ? `https://wa.me/${cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone}` : null;

      // OTR Display (safe against strings or numbers)
      let otrDisplay = '-';
      if (typeof p.otr === 'number' && p.otr > 0) {
        otrDisplay = fmtRupiah(p.otr);
      } else if (typeof p.otr === 'string' && p.otr.trim()) {
        otrDisplay = p.otr.startsWith('Rp') ? p.otr : (Number(p.otr.replace(/[^0-9]/g, '')) ? fmtRupiah(Number(p.otr.replace(/[^0-9]/g, ''))) : p.otr);
      }

      rowsHtml += `
        <tr style="${isCustom ? 'background:#f0fdf4;' : ''}">
          <td style="text-align:center; font-weight:600;">${rowNo}</td>
          <td>
            <div style="font-weight:700; color:var(--slate-800); display:flex; align-items:center; gap:6px;">
              ${name}
              ${isCustom ? '<span class="badge-status badge-custom" style="font-size:10px; padding:2px 6px;">INPUT BARU</span>' : ''}
              ${p.tradein && String(p.tradein).toLowerCase() === 'yes' ? '<span class="badge-status badge-tunai" style="font-size:9.5px; padding:1px 5px; background:#fef3c7; color:#92400e;">TRADE-IN</span>' : ''}
            </div>
            ${waLink ? `
              <a href="${waLink}" target="_blank" rel="noopener noreferrer" style="font-size:11.5px; color:#16a34a; text-decoration:none; display:inline-flex; align-items:center; gap:4px; margin-top:2px;">
                <i class="fa-brands fa-whatsapp"></i> ${phone}
              </a>
            ` : `<span style="font-size:11.5px; color:var(--slate-400);">${phone}</span>`}
          </td>
          <td>
            <div style="font-weight:600; color:var(--slate-800);">${sales}</div>
            <span style="font-size:11px; color:var(--slate-500);">${p.isRyan ? 'Tim 1 Pak Ryan' : (p.spv || 'Cabang')}</span>
          </td>
          <td>
            <div style="font-weight:700; color:var(--slate-800);">${model}</div>
            <span style="font-size:11.5px; color:var(--slate-600);">${otrDisplay}</span>
          </td>
          <td style="text-align:center;">
            <span class="badge-status ${badgeRating}">${rating}</span>
          </td>
          <td>
            <span class="badge-status badge-tunai" style="background:#e0f2fe; color:#0369a1; border-color:#bae6fd;">
              ${stage}
            </span>
          </td>
          <td>
            <div style="font-weight:600; color:var(--slate-800);">${payment}</div>
            <span style="font-size:11.5px; color:var(--slate-500);">${leasing}</span>
          </td>
          <td style="max-width:260px; font-size:12px; color:var(--slate-700); line-height:1.4;">
            ${notes}
            ${p.tradeinUnit && p.tradeinUnit !== '-' ? `<div style="font-size:11px; color:#92400e; margin-top:2px;"><i class="fa-solid fa-car-side"></i> ${p.tradeinUnit}</div>` : ''}
          </td>
          <td style="text-align:center;">
            ${isCustom ? `
              <button type="button" class="btn-delete-prospect" data-id="${p.id}" style="border:none; background:#fee2e2; color:#dc2626; border-radius:6px; padding:6px 10px; cursor:pointer; font-size:11px;" title="Hapus data input mandiri ini">
                <i class="fa-solid fa-trash"></i>
              </button>
            ` : `
              <span style="font-size:11px; color:var(--slate-400);">&mdash;</span>
            `}
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = rowsHtml;

    // Bind individual delete buttons for custom prospects
    tbody.querySelectorAll('.btn-delete-prospect').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        if (confirm('Hapus prospek ini dari data input mandiri?')) {
          state.customProspects = state.customProspects.filter(item => String(item.id) !== String(id));
          saveCustomProspects(state.customProspects);
          updateProspectCounters();
          renderProspekTable();
          showToast('Data prospek berhasil dihapus.');
        }
      });
    });

    // Render Pagination Controls
    renderPagination(pagination, page, totalPages, (newPage) => {
      state.prospek.page = newPage;
      renderProspekTable();
    });
  }

  // =========================================================================
  // SMART PASTE PARSER ENGINE (WhatsApp, Excel, Lists)
  // =========================================================================
  function parseSmartText(text) {
    if (!text || !text.trim()) return [];
    const trimmed = text.trim();
    const results = [];

    const knownSales = (data.salesforce || []).map(s => s.name);
    function findSales(str) {
      if (!str) return null;
      const lower = str.toLowerCase();
      for (const s of knownSales) {
        const sLower = s.toLowerCase();
        if (lower.includes(sLower) || sLower.includes(lower)) return s;
      }
      return null;
    }

    function findPhone(str) {
      const m = str.match(/(?:(?:\+?62|08|628)[0-9\s-]{8,15})/);
      return m ? m[0].replace(/[\s-]/g, '') : null;
    }

    // Check if TSV (Excel / Google Sheets paste)
    if (trimmed.includes('\t')) {
      const rows = trimmed.split(/\r?\n/).filter(r => r.trim().length > 0);
      rows.forEach(row => {
        const cols = row.split('\t').map(c => c.trim());
        if (cols.length >= 2) {
          if (cols[0].toLowerCase().includes('nama') || cols[0].toLowerCase().includes('konsumen')) return;

          let name = cols[0];
          let phone = null;
          let salesman = null;
          let model = 'All New Avanza 1.5 G CVT';
          let payment = 'Kredit';
          let leasing = 'MTF';
          let notes = '';

          for (let i = 1; i < cols.length; i++) {
            const val = cols[i];
            if (!phone && findPhone(val)) {
              phone = findPhone(val);
            } else if (!salesman && findSales(val)) {
              salesman = findSales(val);
            } else if (val.toLowerCase().includes('kredit') || val.toLowerCase().includes('tunai') || val.toLowerCase().includes('cash')) {
              payment = val.toLowerCase().includes('tunai') || val.toLowerCase().includes('cash') ? 'Tunai' : 'Kredit';
            } else if (['mtf', 'tafs', 'acc', 'bca', 'muf', 'adira'].some(l => val.toLowerCase().includes(l))) {
              leasing = val.toUpperCase();
            } else if (!notes) {
              notes = val;
            } else {
              notes += ' | ' + val;
            }
          }

          results.push({
            id: 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            name: name || 'Prospek Baru',
            phone: phone || '-',
            salesman: salesman || 'Heri Setiawan',
            model: model,
            otr: 275000000,
            rating: 'Hot',
            stage: 'Follow-up',
            payment: payment,
            leasing: payment === 'Tunai' ? '-' : leasing,
            notes: notes || 'Input via Smart Paste Excel/TSV',
            isCustom: true,
            createdAt: new Date().toISOString()
          });
        }
      });

      if (results.length > 0) return results;
    }

    // Key-Value Pattern (WhatsApp / Form style)
    const blocks = trimmed.split(/(?:\n\s*[-=]{3,}\s*\n|\n{2,}(?=Nama|Bpk|Ibu|Prospek|\d+\.))/i);

    blocks.forEach(block => {
      const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) return;

      let name = null;
      let phone = null;
      let salesman = null;
      let model = null;
      let payment = 'Kredit';
      let leasing = 'MTF';
      let stage = 'Follow-up';
      let rating = 'Hot';
      let notes = '';

      lines.forEach(line => {
        const lower = line.toLowerCase();

        if (lower.startsWith('nama:') || lower.startsWith('nama konsumen:') || lower.startsWith('customer:')) {
          name = line.split(':')[1].trim();
        } else if (!name && (lower.startsWith('bpk') || lower.startsWith('ibu') || lower.startsWith('bapak') || lower.startsWith('om'))) {
          name = line.replace(/^[-*•\d.]+\s*/, '').trim();
        }

        if (lower.includes('hp:') || lower.includes('wa:') || lower.includes('telp:') || lower.includes('kontak:')) {
          phone = findPhone(line) || line.split(':')[1]?.trim();
        } else if (!phone && findPhone(line)) {
          phone = findPhone(line);
        }

        if (lower.includes('sales:') || lower.includes('wiraniaga:') || lower.includes('pic:') || lower.includes('salesman:')) {
          const raw = line.split(':')[1]?.trim();
          salesman = findSales(raw) || raw;
        } else if (!salesman && findSales(line)) {
          salesman = findSales(line);
        }

        if (lower.includes('unit:') || lower.includes('mobil:') || lower.includes('tipe:') || lower.includes('kendaraan:')) {
          model = line.split(':')[1]?.trim();
        } else if (!model && (lower.includes('avanza') || lower.includes('zenix') || lower.includes('calya') || lower.includes('veloz') || lower.includes('rush') || lower.includes('reborn') || lower.includes('agya') || lower.includes('raize') || lower.includes('yaris') || lower.includes('fortuner') || lower.includes('rangga'))) {
          model = line.replace(/^[-*•]\s*/, '').trim();
        }

        if (lower.includes('bayar:') || lower.includes('cara bayar:') || lower.includes('pembayaran:')) {
          const val = line.split(':')[1]?.trim() || '';
          payment = val.toLowerCase().includes('tunai') || val.toLowerCase().includes('cash') ? 'Tunai' : 'Kredit';
        } else if (lower.includes('tunai') || lower.includes('cash keras')) {
          payment = 'Tunai';
        }

        if (lower.includes('leasing:') || lower.includes('finance:')) {
          leasing = line.split(':')[1]?.trim() || 'MTF';
        } else if (['mtf', 'tafs', 'acc', 'bca', 'muf', 'adira'].some(l => lower.includes(l))) {
          const m = lower.match(/\b(mtf|tafs|acc|bca|muf|adira)\b/i);
          if (m) leasing = m[1].toUpperCase();
        }

        if (lower.includes('spk')) stage = 'SPK';
        else if (lower.includes('trade in') || lower.includes('trade-in') || lower.includes('tukar tambah')) stage = 'Appraisal Trade-In';
        else if (lower.includes('test drive')) stage = 'Test Drive';

        if (lower.includes('warm')) rating = 'Warm';

        if (lower.includes('catatan:') || lower.includes('ket:') || lower.includes('notes:') || lower.includes('status:')) {
          notes = line.split(':')[1]?.trim();
        } else if (!line.includes(':') && !findPhone(line) && line !== name && line !== model) {
          notes += (notes ? ' | ' : '') + line.replace(/^[-*•]\s*/, '');
        }
      });

      if (!name && lines.length > 0) {
        name = lines[0].replace(/^[-*•\d.]+\s*/, '').split(':')[0].trim();
      }

      if (name) {
        results.push({
          id: 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          name: name,
          phone: phone || '-',
          salesman: salesman || 'Heri Setiawan',
          model: model || 'All New Avanza 1.5 G CVT',
          otr: 275000000,
          rating: rating,
          stage: stage,
          payment: payment,
          leasing: payment === 'Tunai' ? '-' : leasing,
          notes: notes || 'Input via Smart Paste',
          isCustom: true,
          createdAt: new Date().toISOString()
        });
      }
    });

    return results;
  }

  // =========================================================================
  // MODAL CONTROLLER & EVENTS
  // =========================================================================
  let parsedDrafts = [];

  function initSmartPasteModal() {
    const modal = document.getElementById('modalAddProspect');
    const btnOpen = document.getElementById('btnOpenProspectModal');
    const btnClose = document.getElementById('btnCloseProspectModal');
    const btnCancel = document.getElementById('btnCancelProspectModal');

    const tabSmart = document.getElementById('btnTabSmartPaste');
    const tabManual = document.getElementById('btnTabManualForm');
    const modeSmart = document.getElementById('modalModeSmartPaste');
    const modeManual = document.getElementById('modalModeManual');

    const btnParse = document.getElementById('btnParsePasteText');
    const btnClear = document.getElementById('btnClearPasteInput');
    const pasteInput = document.getElementById('smartPasteInput');
    const previewContainer = document.getElementById('parsedPreviewContainer');
    const cardList = document.getElementById('parsedCardList');
    const countBadge = document.getElementById('parsedCountBadge');
    const statusText = document.getElementById('parseStatusText');

    const btnCommit = document.getElementById('btnCommitAddProspect');

    // Quick Example Buttons
    const btnWaEx = document.getElementById('btnFillWaExample');
    const btnExcelEx = document.getElementById('btnFillExcelExample');
    const btnListEx = document.getElementById('btnFillListExample');

    function openModal() {
      if (modal) modal.style.display = 'flex';
      parsedDrafts = [];
      if (previewContainer) previewContainer.style.display = 'none';
      if (statusText) statusText.textContent = '';
    }

    function closeModal() {
      if (modal) modal.style.display = 'none';
      parsedDrafts = [];
    }

    if (btnOpen) btnOpen.addEventListener('click', openModal);
    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (btnCancel) btnCancel.addEventListener('click', closeModal);

    // Modal tabs
    if (tabSmart && tabManual && modeSmart && modeManual) {
      tabSmart.addEventListener('click', () => {
        tabSmart.classList.add('active');
        tabSmart.style.color = 'var(--primary-red)';
        tabSmart.style.borderBottom = '2px solid var(--primary-red)';
        tabManual.classList.remove('active');
        tabManual.style.color = 'var(--slate-600)';
        tabManual.style.borderBottom = 'none';
        modeSmart.style.display = 'block';
        modeManual.style.display = 'none';
      });

      tabManual.addEventListener('click', () => {
        tabManual.classList.add('active');
        tabManual.style.color = 'var(--primary-red)';
        tabManual.style.borderBottom = '2px solid var(--primary-red)';
        tabSmart.classList.remove('active');
        tabSmart.style.color = 'var(--slate-600)';
        tabSmart.style.borderBottom = 'none';
        modeManual.style.display = 'block';
        modeSmart.style.display = 'none';
      });
    }

    // Quick Fill Examples
    if (btnWaEx && pasteInput) {
      btnWaEx.addEventListener('click', () => {
        pasteInput.value = `Nama: Bpk. H. Ahmad Fauzi
No WA: 081223456789
Sales: Heri Setiawan
Unit: Innova Zenix 2.0 V Hybrid Modellista (White Pearl)
Bayar: Kredit MTF DP 25% (Tenor 4 Tahun)
Tahap: Test Drive
Rating: Hot
Catatan: Konsumen minta jadwal test drive hari Sabtu di Tunas Kiara Condong, rencana trade-in Innova Reborn 2018.`;
        btnParse.click();
      });
    }

    if (btnExcelEx && pasteInput) {
      btnExcelEx.addEventListener('click', () => {
        pasteInput.value = `Ibu Maria Susanti	081398765432	Gilang Ramadhan	All New Avanza 1.5 G CVT	Kredit TAFS	Hot Prospek nego diskon pameran
Bpk. Dedi Supriadi	082112345678	Yudi Heryadi	New Calya 1.2 G AT	Tunai	SPK menunggu pelunasan transfer bank`;
        btnParse.click();
      });
    }

    if (btnListEx && pasteInput) {
      btnListEx.addEventListener('click', () => {
        pasteInput.value = `1. Bpk. Rian Pratama - 085721345678 - Sales Hendra Wijaya - Rush 1.5 S AT GR Sport - Kredit ACC DP 30 Jt - Hot Prospek
2. Ibu Cindy Claudia - 081809876543 - Sales Asep Saepuloh - Veloz 1.5 Q CVT TSS - Kredit KKB BCA - Follow-up simulasi bunga murah`;
        btnParse.click();
      });
    }

    // Parse Action
    if (btnParse && pasteInput) {
      btnParse.addEventListener('click', () => {
        const text = pasteInput.value.trim();
        if (!text) {
          alert('Silakan masukkan atau paste teks prospek terlebih dahulu.');
          return;
        }
        parsedDrafts = parseSmartText(text);

        if (parsedDrafts.length === 0) {
          if (statusText) statusText.textContent = 'Tidak berhasil mengekstrak data. Coba format lain atau gunakan form manual.';
          if (previewContainer) previewContainer.style.display = 'none';
          return;
        }

        if (statusText) statusText.textContent = `Berhasil mengekstrak ${parsedDrafts.length} calon prospek!`;
        if (countBadge) countBadge.textContent = `${parsedDrafts.length} Data Siap Disimpan`;

        // Render Preview Cards
        let cardsHtml = '';
        parsedDrafts.forEach((item, i) => {
          cardsHtml += `
            <div style="background:#fff; border:1px solid #cbd5e1; border-left:4px solid var(--primary-red); border-radius:8px; padding:12px 14px; font-size:12px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <strong style="font-size:13.5px; color:var(--slate-800);">${i + 1}. ${item.name}</strong>
                <span class="badge-status badge-kredit" style="font-size:11px;">${item.rating} &bull; ${item.stage}</span>
              </div>
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:6px; color:var(--slate-600); margin-top:6px;">
                <div><i class="fa-solid fa-phone" style="color:#16a34a; width:16px;"></i> ${item.phone}</div>
                <div><i class="fa-solid fa-user-tie" style="color:#0284c7; width:16px;"></i> ${item.salesman}</div>
                <div><i class="fa-solid fa-car" style="color:var(--primary-red); width:16px;"></i> ${item.model}</div>
                <div><i class="fa-solid fa-money-bill" style="color:#d97706; width:16px;"></i> ${item.payment} (${item.leasing})</div>
              </div>
              <div style="margin-top:6px; font-style:italic; color:var(--slate-500); border-top:1px dashed #e2e8f0; padding-top:4px;">
                ${item.notes}
              </div>
            </div>
          `;
        });

        if (cardList) cardList.innerHTML = cardsHtml;
        if (previewContainer) previewContainer.style.display = 'block';
      });
    }

    if (btnClear && pasteInput) {
      btnClear.addEventListener('click', () => {
        pasteInput.value = '';
        parsedDrafts = [];
        if (previewContainer) previewContainer.style.display = 'none';
        if (statusText) statusText.textContent = '';
      });
    }

    // Commit Save Action
    if (btnCommit) {
      btnCommit.addEventListener('click', () => {
        // If Smart Paste mode
        if (modeSmart.style.display !== 'none') {
          if (parsedDrafts.length === 0) {
            // If user didn't click parse yet, try parsing now
            if (pasteInput.value.trim()) {
              parsedDrafts = parseSmartText(pasteInput.value.trim());
            }
          }

          if (parsedDrafts.length === 0) {
            alert('Belum ada data prospek yang diekstrak. Silakan masukkan teks dan klik Ekstrak terlebih dahulu.');
            return;
          }

          // Prepend parsed drafts to state and save
          state.customProspects = [...parsedDrafts, ...state.customProspects];
          saveCustomProspects(state.customProspects);
          updateProspectCounters();
          renderProspekTable();
          closeModal();
          showToast(`${parsedDrafts.length} Hot Prospek baru berhasil ditambahkan!`);
          pasteInput.value = '';
          parsedDrafts = [];
        } else {
          // Manual form mode
          const nameInput = document.getElementById('manCustName');
          const phoneInput = document.getElementById('manCustPhone');
          const salesInput = document.getElementById('manSalesman');
          const unitInput = document.getElementById('manUnit');
          const payInput = document.getElementById('manPayment');
          const leasInput = document.getElementById('manLeasing');
          const stageInput = document.getElementById('manStage');
          const ratingInput = document.getElementById('manRating');
          const notesInput = document.getElementById('manNotes');

          if (!nameInput || !nameInput.value.trim()) {
            alert('Nama konsumen wajib diisi!');
            return;
          }
          if (!unitInput || !unitInput.value.trim()) {
            alert('Model unit wajib diisi!');
            return;
          }

          const newProspect = {
            id: 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            name: nameInput.value.trim(),
            phone: phoneInput.value.trim() || '-',
            salesman: salesInput.value || 'Heri Setiawan',
            model: unitInput.value.trim(),
            otr: 275000000,
            rating: ratingInput.value || 'Hot',
            stage: stageInput.value || 'Follow-up',
            payment: payInput.value || 'Kredit',
            leasing: payInput.value === 'Tunai' ? '-' : (leasInput.value || 'MTF'),
            notes: notesInput.value.trim() || 'Input manual SPV',
            isCustom: true,
            createdAt: new Date().toISOString()
          };

          state.customProspects = [newProspect, ...state.customProspects];
          saveCustomProspects(state.customProspects);
          updateProspectCounters();
          renderProspekTable();
          closeModal();
          showToast('1 Hot Prospek baru berhasil disimpan!');

          // Reset manual form fields
          nameInput.value = '';
          phoneInput.value = '';
          unitInput.value = '';
          notesInput.value = '';
        }
      });
    }
  }

  function exportProspekCsv() {
    const list = getFilteredProspek();
    let csv = 'No,Nama Konsumen,No Telepon,Wiraniaga,Model Incaran,Estimasi OTR,Rating,Tahapan,Cara Bayar,Mitra Leasing,Catatan Tindak Lanjut\n';

    list.forEach((p, idx) => {
      const name = p.name || p.cust || p.customer || '';
      const phone = p.phone || '';
      const sales = p.salesman || p.sales || p.wiraniaga || '';
      const model = p.model || p.unit || '';
      const otr = typeof p.otr === 'number' ? p.otr : (p.otr || '').replace(/[^0-9]/g, '');
      const rating = p.rating || 'Hot';
      const stage = p.stage || 'Follow-up';
      const payment = p.payment || p.type || 'Kredit';
      const leasing = p.leasing || '-';
      const notes = p.notes || p.note || '';

      const row = [
        idx + 1,
        `"${name.replace(/"/g, '""')}"`,
        `"${phone.replace(/"/g, '""')}"`,
        `"${sales.replace(/"/g, '""')}"`,
        `"${model.replace(/"/g, '""')}"`,
        otr || 0,
        `"${rating}"`,
        `"${stage}"`,
        `"${payment}"`,
        `"${leasing}"`,
        `"${notes.replace(/"/g, '""')}"`
      ];
      csv += row.join(',') + '\n';
    });

    downloadCsv('Hot_Prospek_Tim1_Ryan_' + new Date().toISOString().slice(0, 10) + '.csv', csv);
    showToast('File CSV Hot Prospek berhasil diunduh.');
  }

  // =========================================================================
  // TAB 3: PLAN ACTIVITY CONTROLLER
  // =========================================================================
  function initActivity() {
    bindActivityEvents();
    renderActivityTable();
    renderActivityCharts();
  }

  function bindActivityEvents() {
    const catSelect = document.getElementById('filterActivityCategory');
    const funSelect = document.getElementById('filterActivityFunnel');
    const exportBtn = document.getElementById('btnExportActivityCsv');

    if (catSelect) {
      catSelect.addEventListener('change', (e) => {
        state.activity.category = e.target.value;
        renderActivityTable();
      });
    }

    if (funSelect) {
      funSelect.addEventListener('change', (e) => {
        state.activity.funnel = e.target.value;
        renderActivityTable();
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', exportActivityCsv);
    }
  }

  function renderActivityCharts() {
    // 1. Channel Target vs Actual Chart
    const chEl = document.getElementById('chartActivityChannel');
    if (chEl && !state.charts.activityChannel) {
      const channels = ['Digital Mktg', 'LIVE TikTok', 'Walk-in', 'Gathering', 'FOA Lapangan', 'DB Bengkel', 'Ref / RO', 'Pameran'];
      const targets = [54, 54, 42, 36, 12, 48, 48, 56];
      const actuals = [18, 19, 9, 11, 12, 16, 24, 19];

      const options = {
        chart: {
          type: 'bar',
          height: 280,
          toolbar: { show: false },
          fontFamily: 'Inter, sans-serif'
        },
        colors: ['#0284c7', '#10b981'],
        series: [
          { name: 'Target Leads', data: targets },
          { name: 'Realisasi Leads (sd P2)', data: actuals }
        ],
        xaxis: { categories: channels },
        legend: { position: 'top' },
        dataLabels: { enabled: false }
      };

      state.charts.activityChannel = new ApexCharts(chEl, options);
      state.charts.activityChannel.render();
    }

    // 2. Funnel Conversion Target vs Actual Chart
    const fnEl = document.getElementById('chartActivityFunnelRate');
    if (fnEl && !state.charts.activityFunnelRate) {
      const stages = ['Leads (352)', 'Prospect (132)', 'Hot Pros. (80)', 'SPK Firm (49)', 'Retail Sales (33)'];
      const targets = [352, 132, 80, 49, 33];
      const actuals = [108, 75, 33, 13, 4];

      const options = {
        chart: {
          type: 'bar',
          height: 280,
          toolbar: { show: false },
          fontFamily: 'Inter, sans-serif'
        },
        plotOptions: {
          bar: {
            horizontal: true,
            dataLabels: { position: 'top' }
          }
        },
        colors: ['#0284c7', '#10b981'],
        series: [
          { name: 'Target Target SPM', data: targets },
          { name: 'Realisasi (sd P2)', data: actuals }
        ],
        xaxis: { categories: stages },
        legend: { position: 'top' },
        dataLabels: {
          enabled: true,
          formatter: (val) => fmtNumber(val)
        }
      };

      state.charts.activityFunnelRate = new ApexCharts(fnEl, options);
      state.charts.activityFunnelRate.render();
    }
  }

  function getFilteredActivity() {
    const all = data.planActivity || [];
    return all.filter(a => {
      if (state.activity.category !== 'all') {
        const cat = (a.category || '').toLowerCase();
        const sel = state.activity.category.toLowerCase();
        if (!cat.includes(sel) && !sel.includes(cat)) {
          return false;
        }
      }
      if (state.activity.funnel !== 'all') {
        const fn = (a.funnel || '').toLowerCase();
        const stage = (a.funnelStage || '').toLowerCase();
        const sel = state.activity.funnel.toLowerCase();
        if (!fn.includes(sel) && !sel.includes(fn) && !stage.includes(sel)) {
          return false;
        }
      }
      return true;
    });
  }

  function renderActivityTable() {
    const tbody = document.getElementById('activityTableBody');
    const badge = document.getElementById('activityShowingBadge');
    if (!tbody) return;

    const list = getFilteredActivity();
    if (badge) {
      badge.textContent = `Menampilkan ${list.length} Baris Rencana Aktivitas Tim Ryan (Agustus 2026)`;
    }

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="13" style="text-align:center; padding:30px; color:var(--slate-500);">Tidak ada aktivitas yang sesuai dengan filter.</td></tr>';
      return;
    }

    let html = '';
    list.forEach((item, idx) => {
      const isTotal = (item.category || '').toLowerCase().includes('total');
      const funnel = item.funnel || item.funnelStage || '-';
      let badgeColor = 'badge-kredit';
      if (funnel.toLowerCase().includes('hot')) badgeColor = 'badge-hot';
      else if (funnel.toLowerCase().includes('spk')) badgeColor = 'badge-high';
      else if (funnel.toLowerCase().includes('rs') || funnel.toLowerCase().includes('sales')) badgeColor = 'badge-cai';

      const p1 = item.p1 !== undefined ? item.p1 : (item.target ? item.target.p1 : 0);
      const p2 = item.p2 !== undefined ? item.p2 : (item.target ? item.target.p2 : 0);
      const p3 = item.p3 !== undefined ? item.p3 : (item.target ? item.target.p3 : 0);
      const p4 = item.p4 !== undefined ? item.p4 : (item.target ? item.target.p4 : 0);
      const p5 = item.p5 !== undefined ? item.p5 : (item.target ? item.target.p5 : 0);
      const p6 = item.p6 !== undefined ? item.p6 : (item.target ? item.target.p6 : 0);
      const totTarget = item.totalTarget !== undefined ? item.totalTarget : (item.target ? item.target.total : 0);
      const totActual = item.totalActual !== undefined ? item.totalActual : (item.actual ? item.actual.total : 0);
      const rate = item.achievementRate !== undefined ? item.achievementRate : (totTarget > 0 ? Number(((totActual / totTarget) * 100).toFixed(1)) : 0);

      html += `
        <tr style="${isTotal ? 'background:#f1f5f9; font-weight:700;' : ''}">
          <td style="text-align:center; font-weight:600;">${idx + 1}</td>
          <td>
            <strong style="color:${isTotal ? 'var(--primary-red)' : 'var(--slate-800)'};">${item.category}</strong>
          </td>
          <td style="font-size:12px; color:var(--slate-600);">${item.sub || '-'}</td>
          <td style="text-align:center;">
            <span class="badge-status ${badgeColor}" style="font-size:11px;">${item.funnelStage || funnel}</span>
          </td>
          <td style="text-align:right; font-size:12.5px;">${p1}</td>
          <td style="text-align:right; font-size:12.5px;">${p2}</td>
          <td style="text-align:right; font-size:12.5px;">${p3}</td>
          <td style="text-align:right; font-size:12.5px;">${p4}</td>
          <td style="text-align:right; font-size:12.5px;">${p5}</td>
          <td style="text-align:right; font-size:12.5px;">${p6}</td>
          <td style="text-align:right; font-weight:700; color:var(--primary-red); font-size:13px;">${totTarget}</td>
          <td style="text-align:right; font-weight:700; color:#16a34a; font-size:13px;">${totActual}</td>
          <td style="text-align:center;">
            <span class="badge-status ${rate >= 50 ? 'badge-cash' : 'badge-kredit'}" style="font-size:11px;">${rate}%</span>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }

  function exportActivityCsv() {
    const list = getFilteredActivity();
    let csv = 'No,Saluran Aktivitas,Detail Sub Area,Funnel,1-5 Agt (P1),6-10 Agt (P2),11-15 Agt (P3),16-20 Agt (P4),21-25 Agt (P5),26-31 Agt (P6),Total Target,Realisasi sd P2,Capaian (%)\n';

    list.forEach((item, idx) => {
      const p1 = item.p1 !== undefined ? item.p1 : (item.target ? item.target.p1 : 0);
      const p2 = item.p2 !== undefined ? item.p2 : (item.target ? item.target.p2 : 0);
      const p3 = item.p3 !== undefined ? item.p3 : (item.target ? item.target.p3 : 0);
      const p4 = item.p4 !== undefined ? item.p4 : (item.target ? item.target.p4 : 0);
      const p5 = item.p5 !== undefined ? item.p5 : (item.target ? item.target.p5 : 0);
      const p6 = item.p6 !== undefined ? item.p6 : (item.target ? item.target.p6 : 0);
      const totTarget = item.totalTarget !== undefined ? item.totalTarget : (item.target ? item.target.total : 0);
      const totActual = item.totalActual !== undefined ? item.totalActual : (item.actual ? item.actual.total : 0);
      const rate = item.achievementRate !== undefined ? item.achievementRate : 0;

      csv += [
        idx + 1,
        `"${(item.category || '').replace(/"/g, '""')}"`,
        `"${(item.sub || '').replace(/"/g, '""')}"`,
        `"${(item.funnelStage || item.funnel || '').replace(/"/g, '""')}"`,
        p1, p2, p3, p4, p5, p6,
        totTarget,
        totActual,
        `"${rate}%"`
      ].join(',') + '\n';
    });

    downloadCsv('Plan_Activity_SPM_Tim1_Ryan_' + new Date().toISOString().slice(0, 10) + '.csv', csv);
    showToast('File CSV Plan Activity berhasil diunduh.');
  }

  // =========================================================================
  // TAB 4: PENJUALAN (SPK & DO) CONTROLLER
  // =========================================================================
  function initPenjualan() {
    populatePenjualanFilterOptions();
    bindPenjualanEvents();
    renderPenjualanTable();
  }

  function populatePenjualanFilterOptions() {
    const modelSelect = document.getElementById('filterPenjualanModel');
    const salesSelect = document.getElementById('filterPenjualanSalesman');

    if (modelSelect) {
      const models = (data.modelDist || []).map(m => m.model);
      modelSelect.innerHTML = '<option value="all">Semua Model</option>';
      models.forEach(m => {
        modelSelect.innerHTML += `<option value="${m}">${m}</option>`;
      });
    }

    if (salesSelect) {
      const salesmen = (data.salesforce || []).map(s => s.name);
      salesSelect.innerHTML = '<option value="all">Semua Wiraniaga</option>';
      salesmen.forEach(s => {
        salesSelect.innerHTML += `<option value="${s}">${s}</option>`;
      });
    }
  }

  function bindPenjualanEvents() {
    // Subnav button switching
    document.querySelectorAll('.subnav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.subnav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.penjualan.currentSub = btn.getAttribute('data-sub');
        state.penjualan.page = 1;

        // Show/hide alert for SPK Borrow
        const alertEl = document.getElementById('spkBorrowAlert');
        if (alertEl) {
          alertEl.style.display = state.penjualan.currentSub === 'spk-borrow' ? 'block' : 'none';
        }

        renderPenjualanTable();
      });
    });

    // Filters
    const searchInput = document.getElementById('filterPenjualanSearch');
    const monthSelect = document.getElementById('filterPenjualanMonth');
    const modelSelect = document.getElementById('filterPenjualanModel');
    const salesSelect = document.getElementById('filterPenjualanSalesman');
    const paySelect = document.getElementById('filterPenjualanPayment');
    const exportBtn = document.getElementById('btnExportPenjualanCsv');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.penjualan.search = e.target.value.toLowerCase().trim();
        state.penjualan.page = 1;
        renderPenjualanTable();
      });
    }

    if (monthSelect) {
      monthSelect.addEventListener('change', (e) => {
        state.penjualan.month = e.target.value;
        state.penjualan.page = 1;
        renderPenjualanTable();
      });
    }

    if (modelSelect) {
      modelSelect.addEventListener('change', (e) => {
        state.penjualan.model = e.target.value;
        state.penjualan.page = 1;
        renderPenjualanTable();
      });
    }

    if (salesSelect) {
      salesSelect.addEventListener('change', (e) => {
        state.penjualan.salesman = e.target.value;
        state.penjualan.page = 1;
        renderPenjualanTable();
      });
    }

    if (paySelect) {
      paySelect.addEventListener('change', (e) => {
        state.penjualan.payment = e.target.value;
        state.penjualan.page = 1;
        renderPenjualanTable();
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', exportPenjualanCsv);
    }
  }

  function getActivePenjualanList() {
    switch (state.penjualan.currentSub) {
      case 'do-sep':
        return data.doSeptember || [];
      case 'spk-sep':
        return data.spkSeptember || [];
      case 'spk-borrow':
        return data.spkBorrow || [];
      case 'do-ytd':
      default:
        return data.transactions || [];
    }
  }

  function getFilteredPenjualan() {
    const list = getActivePenjualanList();
    return list.filter(item => {
      // Search
      if (state.penjualan.search) {
        const q = state.penjualan.search;
        const target = `${item.customerName || item.customer || ''} ${item.spkNumber || item.spkNo || ''} ${item.invoiceNo || ''} ${item.vin || ''} ${item.salesman || ''} ${item.model || ''}`.toLowerCase();
        if (!target.includes(q)) return false;
      }
      // Month (mainly for YTD transactions)
      if (state.penjualan.month !== 'all' && item.month && item.month !== state.penjualan.month) {
        return false;
      }
      // Model
      if (state.penjualan.model !== 'all' && item.model && !item.model.includes(state.penjualan.model)) {
        return false;
      }
      // Salesman
      if (state.penjualan.salesman !== 'all' && item.salesman && item.salesman !== state.penjualan.salesman) {
        return false;
      }
      // Payment
      if (state.penjualan.payment !== 'all') {
        const pType = (item.paymentType || item.payment || '').toLowerCase();
        if (state.penjualan.payment === 'Kredit' && !pType.includes('kredit')) return false;
        if (state.penjualan.payment === 'Tunai' && !pType.includes('tunai') && !pType.includes('cash')) return false;
      }
      return true;
    });
  }

  function renderPenjualanTable() {
    const thead = document.getElementById('penjualanTableHead');
    const tbody = document.getElementById('penjualanTableBody');
    const badge = document.getElementById('penjualanShowingBadge');
    const pagination = document.getElementById('penjualanPagination');
    if (!tbody) return;

    const sub = state.penjualan.currentSub;
    const filtered = getFilteredPenjualan();
    const total = filtered.length;

    // Update Badge text
    if (badge) {
      let subTitle = 'Transaksi Delivery Unit (DO) YTD 2026';
      if (sub === 'do-sep') subTitle = 'DO September 2026 (Tim Ryan)';
      else if (sub === 'spk-sep') subTitle = 'SPK September 2026 (Tim Ryan)';
      else if (sub === 'spk-borrow') subTitle = 'SPK Borrow & Outstanding (Tim Ryan)';
      badge.textContent = `Menampilkan ${total} ${subTitle}`;
    }

    // Dynamic headers based on sub-module
    if (thead) {
      if (sub === 'spk-borrow') {
        thead.innerHTML = `
          <tr>
            <th style="width:40px;">No</th>
            <th>No SPK</th>
            <th>Tgl SPK</th>
            <th>Nama Konsumen</th>
            <th>Model &amp; Tipe Unit</th>
            <th>Wiraniaga</th>
            <th>Tanda Jadi (DP)</th>
            <th>Status Validasi Admin</th>
            <th>Catatan Supervisi</th>
          </tr>
        `;
      } else if (sub === 'spk-sep') {
        thead.innerHTML = `
          <tr>
            <th style="width:40px;">No</th>
            <th>No SPK</th>
            <th>Tgl SPK</th>
            <th>Nama Konsumen</th>
            <th>Model &amp; Tipe Unit</th>
            <th>Wiraniaga</th>
            <th>Cara Bayar</th>
            <th>Warna Unit</th>
            <th style="text-align:center;">Status SPK</th>
          </tr>
        `;
      } else {
        thead.innerHTML = `
          <tr>
            <th style="width:40px;">No</th>
            <th>No Invoice / SPK</th>
            <th>Tanggal DO</th>
            <th>Nama Konsumen</th>
            <th>Model &amp; Tipe Unit</th>
            <th>Wiraniaga</th>
            <th>Cara Bayar / Leasing</th>
            <th style="text-align:right;">Nilai OTR</th>
          </tr>
        `;
      }
    }

    // Pagination
    const page = state.penjualan.page;
    const pageSize = state.penjualan.pageSize;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    if (paginated.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:30px; color:var(--slate-500);">Tidak ada data yang cocok dengan kriteria pencarian.</td></tr>';
      if (pagination) pagination.innerHTML = '';
      return;
    }

    let rowsHtml = '';
    paginated.forEach((item, idx) => {
      const rowNo = startIndex + idx + 1;

      if (sub === 'spk-borrow') {
        const isOverdue = item.isOverdue || (item.remarks && item.remarks.includes('> 2 bulan'));
        rowsHtml += `
          <tr style="${isOverdue ? 'background:#fff1f2;' : ''}">
            <td style="text-align:center; font-weight:600;">${rowNo}</td>
            <td><strong>${item.spkNo || item.spkNumber || '-'}</strong></td>
            <td>${item.spkDate || '-'}</td>
            <td>${item.customerName || item.customer || '-'}</td>
            <td>${item.model || '-'}</td>
            <td>${item.salesman || '-'}</td>
            <td>${item.tandaJadi ? fmtRupiah(item.tandaJadi) : '-'}</td>
            <td>
              <span class="badge-status ${item.validationStatus === 'APPROVED' ? 'badge-kredit' : 'badge-tunai'}">
                ${item.validationStatus || 'OPEN'}
              </span>
            </td>
            <td style="font-size:12px; color:${isOverdue ? '#b80515; font-weight:700;' : 'var(--slate-600);'}">
              ${item.remarks || '-'}
            </td>
          </tr>
        `;
      } else if (sub === 'spk-sep') {
        rowsHtml += `
          <tr>
            <td style="text-align:center; font-weight:600;">${rowNo}</td>
            <td><strong>${item.spkNo || item.spkNumber || '-'}</strong></td>
            <td>${item.spkDate || '-'}</td>
            <td>${item.customerName || item.customer || '-'}</td>
            <td>${item.model || '-'}</td>
            <td>${item.salesman || '-'}</td>
            <td>${item.paymentType || item.payment || 'Kredit'}</td>
            <td>${item.color || '-'}</td>
            <td style="text-align:center;">
              <span class="badge-status badge-kredit">${item.status || 'SPK'}</span>
            </td>
          </tr>
        `;
      } else {
        // YTD DO or September DO
        const pType = item.paymentType || item.payment || 'Kredit';
        const badgePayment = pType.toLowerCase().includes('kredit') ? 'badge-kredit' : 'badge-tunai';
        rowsHtml += `
          <tr>
            <td style="text-align:center; font-weight:600;">${rowNo}</td>
            <td>
              <strong>${item.invoiceNo || item.spkNumber || '-'}</strong>
              ${item.vin ? `<div style="font-size:11px; color:var(--slate-400);">VIN: ${item.vin}</div>` : ''}
            </td>
            <td>${item.doDate || item.date || '-'}</td>
            <td>${item.customerName || item.customer || '-'}</td>
            <td>
              <strong>${item.model || '-'}</strong>
            </td>
            <td>${item.salesman || '-'}</td>
            <td>
              <span class="badge-status ${badgePayment}">${pType}</span>
              ${item.leasing ? `<div style="font-size:11px; color:var(--slate-500); margin-top:2px;">${item.leasing}</div>` : ''}
            </td>
            <td style="text-align:right; font-weight:700; color:var(--slate-800);">
              ${item.otr ? fmtRupiah(item.otr) : '-'}
            </td>
          </tr>
        `;
      }
    });

    tbody.innerHTML = rowsHtml;

    // Render Pagination Controls
    renderPagination(pagination, page, totalPages, (newPage) => {
      state.penjualan.page = newPage;
      renderPenjualanTable();
    });
  }

  function exportPenjualanCsv() {
    const list = getFilteredPenjualan();
    const sub = state.penjualan.currentSub;
    let csv = '';

    if (sub === 'spk-borrow') {
      csv = 'No,No SPK,Tgl SPK,Nama Konsumen,Model Unit,Wiraniaga,Tanda Jadi (DP),Status Validasi,Catatan Supervisi\n';
      list.forEach((item, idx) => {
        csv += [
          idx + 1,
          `"${item.spkNo || item.spkNumber || ''}"`,
          `"${item.spkDate || ''}"`,
          `"${item.customerName || item.customer || ''}"`,
          `"${item.model || ''}"`,
          item.tandaJadi || 0,
          `"${item.validationStatus || ''}"`,
          `"${(item.remarks || '').replace(/"/g, '""')}"`
        ].join(',') + '\n';
      });
    } else {
      csv = 'No,No Invoice/SPK,Tanggal DO,Nama Konsumen,Model Unit,Wiraniaga,Cara Bayar,Mitra Leasing,Nilai OTR\n';
      list.forEach((item, idx) => {
        csv += [
          idx + 1,
          `"${item.invoiceNo || item.spkNumber || ''}"`,
          `"${item.doDate || item.date || ''}"`,
          `"${item.customerName || item.customer || ''}"`,
          `"${item.model || ''}"`,
          `"${item.salesman || ''}"`,
          `"${item.paymentType || item.payment || ''}"`,
          `"${item.leasing || ''}"`,
          item.otr || 0
        ].join(',') + '\n';
      });
    }

    downloadCsv(`Penjualan_${sub}_Tim1_Ryan_` + new Date().toISOString().slice(0, 10) + '.csv', csv);
    showToast('File CSV Penjualan berhasil diunduh.');
  }

  // =========================================================================
  // TAB 5: LEASING & HISTORIS MULTI-TAHUN CONTROLLER
  // =========================================================================
  function renderLeasingCharts() {
    // 1. Leasing Distribution Donut
    const distEl = document.getElementById('chartLeasingDistribution');
    if (distEl && !state.charts.leasingDistribution) {
      const dist = (data.leasingHistory || {}).ryanLeasingDistribution || {
        'MTF': 92,
        'TAFS': 79,
        'ACC': 37,
        'KKB BCA': 15,
        'MUF': 5,
        'Adira & Lainnya': 21
      };

      const labels = Object.keys(dist);
      const series = Object.values(dist);

      const options = {
        chart: {
          type: 'donut',
          height: 300,
          fontFamily: 'Inter, sans-serif'
        },
        colors: ['#eb0a1e', '#2563eb', '#16a34a', '#d97706', '#9333ea', '#64748b'],
        series: series,
        labels: labels,
        legend: { position: 'bottom' },
        dataLabels: { enabled: true, formatter: (val) => val.toFixed(1) + '%' }
      };

      state.charts.leasingDistribution = new ApexCharts(distEl, options);
      state.charts.leasingDistribution.render();
    }

    // 2. Monthly Trend Kredit vs Tunai 2026
    const trendEl = document.getElementById('chartLeasingMonthlyTrend');
    if (trendEl && !state.charts.leasingMonthlyTrend) {
      const monthly = (data.leasingHistory || {}).monthlyLeasing2026 || data.monthlyTrend || [];
      const categories = monthly.map(m => m.month);
      const credit = monthly.map(m => m.kredit);
      const cash = monthly.map(m => m.tunai);

      const options = {
        chart: {
          type: 'area',
          height: 300,
          toolbar: { show: false },
          fontFamily: 'Inter, sans-serif'
        },
        colors: ['#eb0a1e', '#0f172a'],
        series: [
          { name: 'Kredit (Leasing)', data: credit },
          { name: 'Tunai (Cash)', data: cash }
        ],
        xaxis: { categories: categories },
        legend: { position: 'top' },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 }
      };

      state.charts.leasingMonthlyTrend = new ApexCharts(trendEl, options);
      state.charts.leasingMonthlyTrend.render();
    }
  }

  // =========================================================================
  // TAB 6: FOKUS FOA (OUTLET AREA) CONTROLLER
  // =========================================================================
  state.foa = {
    onlyRyan: true // Default: only show SPV Ryan's salesmen
  };

  function initFoa() {
    bindFoaEvents();
    renderFoaTable();
    renderFoaChart();
  }

  function bindFoaEvents() {
    const btnRyan = document.getElementById('btnFoaRyanOnly');
    const btnAll = document.getElementById('btnFoaAllBranch');

    if (btnRyan && btnAll) {
      btnRyan.addEventListener('click', () => {
        btnRyan.classList.add('active');
        btnAll.classList.remove('active');
        state.foa.onlyRyan = true;
        renderFoaTable();
        renderFoaChart();
      });

      btnAll.addEventListener('click', () => {
        btnAll.classList.add('active');
        btnRyan.classList.remove('active');
        state.foa.onlyRyan = false;
        renderFoaTable();
        renderFoaChart();
      });
    }
  }

  function getFilteredFoa() {
    const all = data.fokusFoa || [];
    if (state.foa.onlyRyan) {
      return all.filter(item => item.isRyan === true);
    }
    return all;
  }

  function renderFoaChart() {
    const chartEl = document.getElementById('chartFoaModelDist');
    if (!chartEl) return;

    const list = getFilteredFoa();
    // Count model occurrences in the filtered list
    const modelCounts = {};
    list.forEach(item => {
      if (Array.isArray(item.fokusModel)) {
        item.fokusModel.forEach(m => {
          modelCounts[m] = (modelCounts[m] || 0) + 1;
        });
      }
    });

    const categories = Object.keys(modelCounts);
    const series = Object.values(modelCounts);

    if (state.charts.foaModelDist) {
      state.charts.foaModelDist.updateOptions({
        xaxis: { categories: categories },
        series: [{ name: 'Wiraniaga Penugasan Model', data: series }]
      });
    } else {
      const options = {
        chart: {
          type: 'bar',
          height: 280,
          toolbar: { show: false },
          fontFamily: 'Inter, sans-serif'
        },
        colors: ['#b80515'],
        series: [{ name: 'Wiraniaga Penugasan Model', data: series }],
        xaxis: { categories: categories },
        plotOptions: {
          bar: { borderRadius: 4, columnWidth: '45%' }
        },
        dataLabels: { enabled: true }
      };

      state.charts.foaModelDist = new ApexCharts(chartEl, options);
      state.charts.foaModelDist.render();
    }
  }

  function renderFoaTable() {
    const tbody = document.getElementById('foaTableBody');
    const tfoot = document.getElementById('foaTableFoot');
    const exportBtn = document.getElementById('btnExportFoaCsv');
    const notice = document.getElementById('foaFilterNotice');
    const summaryBadge = document.getElementById('foaTableSummaryBadge');

    // KPI Card Elements
    const kpiSales = document.getElementById('kpiFoaTotalSales');
    const kpiSpk = document.getElementById('kpiFoaTargetSpk');
    const kpiDo = document.getElementById('kpiFoaTargetDo');
    const kpiActual = document.getElementById('kpiFoaActual');
    const kpiSalesTitle = document.getElementById('kpiFoaSalesTitle');
    const kpiSalesSub = document.getElementById('kpiFoaSalesSub');

    if (!tbody) return;

    const list = getFilteredFoa();
    const isRyanOnly = state.foa.onlyRyan;

    // Calculate totals
    let totSpk = 0;
    let totDo = 0;
    let actSpk = 0;
    let actDo = 0;

    list.forEach(item => {
      totSpk += (item.targetSpk || 0);
      totDo += (item.targetDo || 0);
      actSpk += (item.actualSpk || 0);
      actDo += (item.actualDo || 0);
    });

    // Update KPI Cards
    if (kpiSales) kpiSales.textContent = `${list.length} Wiraniaga`;
    if (kpiSpk) kpiSpk.textContent = `${totSpk} SPK`;
    if (kpiDo) kpiDo.textContent = `${totDo} Unit DO`;
    if (kpiActual) kpiActual.textContent = `${actSpk} SPK / ${actDo} DO`;

    if (kpiSalesTitle) kpiSalesTitle.textContent = isRyanOnly ? 'Personel FOA Tim Ryan' : 'Total Personel FOA Cabang';
    if (kpiSalesSub) kpiSalesSub.textContent = isRyanOnly ? 'Khusus Tim 1 Pak Ryan' : 'Gabungan 3 Tim Supervisor';

    if (notice) {
      notice.textContent = isRyanOnly
        ? 'Menampilkan 8 Wiraniaga khusus di bawah supervisi Pak Ryan (Feryanto)'
        : 'Menampilkan seluruh 12 Wiraniaga cabang (Tim Ryan, Alvin, Riva)';
    }

    if (summaryBadge) {
      summaryBadge.textContent = `Target: ${totSpk} SPK • ${totDo} DO • Realisasi: ${actSpk} SPK / ${actDo} DO`;
    }

    // Render Table Rows
    let html = '';
    list.forEach((item, idx) => {
      const name = item.wiraniaga || item.salesman || '-';
      const isRyan = item.isRyan === true;
      const kecBadges = Array.isArray(item.kecamatan)
        ? item.kecamatan.map(k => `<span class="badge-status badge-kredit" style="font-size:11px; margin:2px 4px 2px 0; display:inline-block;">${k}</span>`).join('')
        : (item.kecamatan || '-');

      const targetSpk = item.targetSpk !== undefined ? item.targetSpk : 1;
      const targetDo = item.targetDo !== undefined ? item.targetDo : 1;
      const actualSpk = item.actualSpk || 0;
      const actualDo = item.actualDo || 0;
      const plan = item.plan || '-';

      const modelBadges = Array.isArray(item.fokusModel)
        ? item.fokusModel.map(m => `<span class="badge-status badge-tunai" style="font-size:11px; margin:2px 4px 2px 0; display:inline-block; font-weight:600;">${m}</span>`).join('')
        : (item.fokusModel || item.focusModel || '-');

      let actList = '';
      if (Array.isArray(item.aktivitas) && item.aktivitas.length > 0) {
        actList = `<ul style="margin:0; padding-left:14px; font-size:11.5px; color:var(--slate-700); line-height:1.4;">${item.aktivitas.map(a => `<li>${a.replace(/^[-*•\s]+/, '')}</li>`).join('')}</ul>`;
      } else {
        actList = `<span style="font-size:12px; color:var(--slate-400);">${item.agenda || '-'}</span>`;
      }

      html += `
        <tr style="${isRyan ? '' : 'opacity:0.85; background:#f8fafc;'}">
          <td style="text-align:center; font-weight:600;">${idx + 1}</td>
          <td>
            <div style="font-weight:700; color:var(--slate-800); font-size:13px; display:flex; align-items:center; gap:6px;">
              ${name}
              ${isRyan ? '<span class="badge-status badge-kredit" style="font-size:10px; padding:2px 6px;">TIM RYAN</span>' : `<span class="badge-status badge-tunai" style="font-size:10px; padding:2px 6px;">${item.spv}</span>`}
            </div>
            <span style="font-size:11px; color:var(--slate-500);">${item.fullName || name}</span>
          </td>
          <td style="max-width:200px;">${kecBadges}</td>
          <td style="text-align:right; font-weight:700; font-size:13px; color:var(--slate-800);">${targetSpk}</td>
          <td style="text-align:right; font-weight:700; font-size:13px; color:var(--slate-800);">${targetDo}</td>
          <td style="text-align:right;">${actualSpk > 0 ? `<span style="color:#16a34a; font-weight:800; font-size:13.5px;">${actualSpk}</span>` : `<span style="color:var(--slate-400); font-size:12px;">0</span>`}</td>
          <td style="text-align:right;">${actualDo > 0 ? `<span style="color:#16a34a; font-weight:800; font-size:13.5px;">${actualDo}</span>` : `<span style="color:var(--slate-400); font-size:12px;">0</span>`}</td>
          <td style="text-align:center; color:var(--slate-400); font-size:12px;">${plan}</td>
          <td style="max-width:220px;">${modelBadges}</td>
          <td style="max-width:280px;">${actList}</td>
        </tr>
      `;
    });

    tbody.innerHTML = html;

    // Render Footer Row
    if (tfoot) {
      tfoot.innerHTML = `
        <tr style="background:#f8fafc; font-weight:800; border-top:2px solid var(--slate-300);">
          <td colspan="3" style="text-align:right; color:var(--slate-800);">TOTAL (${isRyanOnly ? 'TIM 1 SPV RYAN' : 'SEMUA CABANG'}):</td>
          <td style="text-align:right; color:var(--slate-800); font-size:14px;">${totSpk}</td>
          <td style="text-align:right; color:var(--slate-800); font-size:14px;">${totDo}</td>
          <td style="text-align:right; color:#16a34a; font-size:14px;">${actSpk}</td>
          <td style="text-align:right; color:#16a34a; font-size:14px;">${actDo}</td>
          <td style="text-align:center; color:var(--slate-400);">-</td>
          <td colspan="2" style="font-size:12px; color:var(--slate-600); font-weight:600;">
            ${isRyanOnly ? '8 Wiraniaga Tim 1 Pak Ryan (Target: 10 SPK, 10 DO)' : '12 Wiraniaga Terbagi Dalam 4 Kelompok (Target: 15 SPK, 15 DO)'}
          </td>
        </tr>
      `;
    }

    // Export CSV
    if (exportBtn && !exportBtn.dataset.bound) {
      exportBtn.dataset.bound = 'true';
      exportBtn.addEventListener('click', () => {
        const currentList = getFilteredFoa();
        let csv = 'No,Wiraniaga,Nama Lengkap,SPV,Kecamatan,Target SPK,Target DO,Actual SPK,Actual DO,Plan,Fokus Model,Aktivitas\\n';
        currentList.forEach((item, idx) => {
          const kec = Array.isArray(item.kecamatan) ? item.kecamatan.join('; ') : item.kecamatan;
          const models = Array.isArray(item.fokusModel) ? item.fokusModel.join('; ') : (item.fokusModel || item.focusModel);
          const acts = Array.isArray(item.aktivitas) ? item.aktivitas.map(a => a.replace(/^[-*•\\s]+/, '')).join('; ') : (item.agenda || '');
          csv += [
            idx + 1,
            `"${item.wiraniaga || item.salesman || ''}"`,
            `"${item.fullName || item.wiraniaga || ''}"`,
            `"${item.spv || 'Feryanto (Pak Ryan)'}"`,
            `"${kec || ''}"`,
            item.targetSpk || 0,
            item.targetDo || 0,
            item.actualSpk || 0,
            item.actualDo || 0,
            `"${item.plan || ''}"`,
            `"${models || ''}"`,
            `"${acts.replace(/"/g, '""')}"`
          ].join(',') + '\\n';
        });
        const prefix = state.foa.onlyRyan ? 'Fokus_FOA_Khusus_Tim_Ryan_' : 'Fokus_FOA_Semua_Cabang_';
        downloadCsv(prefix + new Date().toISOString().slice(0, 10) + '.csv', csv);
        showToast('File CSV Fokus FOA berhasil diunduh.');
      });
    }
  }

  // =========================================================================
  // TAB 7: OLX AUTOS TRADE-IN CONTROLLER
  // =========================================================================
  function initOlx() {
    populateOlxFilterOptions();
    bindOlxEvents();
    updateOlxKpis();
    renderOlxTable();
    renderOlxCharts();
  }

  function getOlxBaseList() {
    const all = data.olxTradeIn || [];
    if (state.olx.scope === 'all') {
      return all;
    }
    return all.filter(o => o.isRyan || (o.spv || '').toLowerCase().includes('ryan'));
  }

  function populateOlxFilterOptions() {
    const salesSelect = document.getElementById('filterOlxSales');
    if (!salesSelect) return;

    const list = getOlxBaseList();
    const sales = Array.from(new Set(list.map(o => o.salesman || o.sales))).filter(Boolean).sort();

    salesSelect.innerHTML = '<option value="all">Semua Wiraniaga</option>';
    sales.forEach(s => {
      salesSelect.innerHTML += `<option value="${s}">${s}</option>`;
    });
  }

  function updateOlxKpis() {
    const list = getOlxBaseList();
    const totalUnits = list.length;
    const totalPrice = list.reduce((sum, item) => sum + (item.appraisalPrice || item.price || 0), 0);
    const deals = list.filter(item => (item.status || item.result || '').toLowerCase().includes('deal')).length;
    const negos = totalUnits - deals;
    const dealRate = totalUnits > 0 ? ((deals / totalUnits) * 100).toFixed(1) : 0;

    const elUnits = document.getElementById('kpiOlxTotalUnits');
    const elVal = document.getElementById('kpiOlxTotalValue');
    const elDeal = document.getElementById('kpiOlxDealUnits');
    const elNego = document.getElementById('kpiOlxNegoUnits');

    if (elUnits) elUnits.textContent = `${totalUnits} Unit`;
    if (elVal) elVal.textContent = `Rp ${(totalPrice / 1e9).toFixed(2).replace('.', ',')} M`;
    if (elDeal) elDeal.textContent = `${deals} Unit (${dealRate}%)`;
    if (elNego) elNego.textContent = `${negos} Unit`;
  }

  function bindOlxEvents() {
    const btnRyanOnly = document.getElementById('btnOlxRyanOnly');
    const btnAllBranch = document.getElementById('btnOlxAllBranch');
    const notice = document.getElementById('olxFilterNotice');

    if (btnRyanOnly && !btnRyanOnly.dataset.bound) {
      btnRyanOnly.dataset.bound = 'true';
      btnRyanOnly.addEventListener('click', () => {
        state.olx.scope = 'ryan';
        btnRyanOnly.classList.add('active');
        btnRyanOnly.style.fontWeight = '700';
        if (btnAllBranch) {
          btnAllBranch.classList.remove('active');
          btnAllBranch.style.fontWeight = '400';
        }
        if (notice) notice.textContent = 'Menampilkan 26 taksasi trade-in Tim 1 SPV Ryan';
        populateOlxFilterOptions();
        updateOlxKpis();
        renderOlxTable();
        renderOlxCharts();
      });
    }

    if (btnAllBranch && !btnAllBranch.dataset.bound) {
      btnAllBranch.dataset.bound = 'true';
      btnAllBranch.addEventListener('click', () => {
        state.olx.scope = 'all';
        btnAllBranch.classList.add('active');
        btnAllBranch.style.fontWeight = '700';
        if (btnRyanOnly) {
          btnRyanOnly.classList.remove('active');
          btnRyanOnly.style.fontWeight = '400';
        }
        if (notice) notice.textContent = 'Menampilkan 52 taksasi trade-in seluruh cabang TKC';
        populateOlxFilterOptions();
        updateOlxKpis();
        renderOlxTable();
        renderOlxCharts();
      });
    }

    const searchInput = document.getElementById('filterOlxSearch');
    const monthSelect = document.getElementById('filterOlxMonth');
    const statusSelect = document.getElementById('filterOlxStatus');
    const salesSelect = document.getElementById('filterOlxSales');

    if (searchInput && !searchInput.dataset.bound) {
      searchInput.dataset.bound = 'true';
      searchInput.addEventListener('input', (e) => {
        state.olx.search = e.target.value.toLowerCase().trim();
        renderOlxTable();
      });
    }

    if (monthSelect && !monthSelect.dataset.bound) {
      monthSelect.dataset.bound = 'true';
      monthSelect.addEventListener('change', (e) => {
        state.olx.month = e.target.value;
        renderOlxTable();
      });
    }

    if (statusSelect && !statusSelect.dataset.bound) {
      statusSelect.dataset.bound = 'true';
      statusSelect.addEventListener('change', (e) => {
        state.olx.status = e.target.value;
        renderOlxTable();
      });
    }

    if (salesSelect && !salesSelect.dataset.bound) {
      salesSelect.dataset.bound = 'true';
      salesSelect.addEventListener('change', (e) => {
        state.olx.salesman = e.target.value;
        renderOlxTable();
      });
    }
  }

  function getFilteredOlx() {
    const list = getOlxBaseList();
    return list.filter(o => {
      if (state.olx.search) {
        const q = state.olx.search;
        const usedCar = o.usedCar || `${o.brand || ''} ${o.type || o.model || ''}`;
        const salesman = o.salesman || o.sales || '';
        const notes = o.notes || o.ket || '';
        const status = o.status || o.result || '';
        const target = `${usedCar} ${salesman} ${notes} ${status} ${o.color || ''} ${o.month || ''}`.toLowerCase();
        if (!target.includes(q)) return false;
      }
      if (state.olx.month !== 'all' && (o.month || '').toLowerCase() !== state.olx.month.toLowerCase()) {
        return false;
      }
      if (state.olx.status !== 'all') {
        const st = (o.status || o.result || '').toLowerCase();
        const sel = state.olx.status.toLowerCase();
        if (!st.includes(sel)) return false;
      }
      if (state.olx.salesman !== 'all') {
        const s = o.salesman || o.sales || '';
        if (s !== state.olx.salesman) return false;
      }
      return true;
    });
  }

  function renderOlxTable() {
    const tbody = document.getElementById('olxTableBody');
    const badge = document.getElementById('olxShowingBadge');
    if (!tbody) return;

    const list = getFilteredOlx();
    if (badge) {
      const scopeLabel = state.olx.scope === 'ryan' ? 'Tim 1 Pak Ryan' : 'Seluruh Tim Cabang TKC';
      badge.textContent = `Menampilkan ${list.length} Data Trade-In OLX (${scopeLabel})`;
    }

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="11" style="text-align:center; padding:30px; color:var(--slate-500);">Tidak ada data trade-in yang cocok dengan filter.</td></tr>';
      return;
    }

    let html = '';
    list.forEach((item, idx) => {
      const salesman = item.salesman || item.sales || '-';
      const usedCar = item.usedCar || `${item.brand || ''} ${item.type || item.model || ''}`.trim() || '-';
      const price = item.appraisalPrice !== undefined ? item.appraisalPrice : (item.price !== undefined ? item.price : 0);
      const mileage = item.mileage || item.km || '-';
      const tax = item.taxExpiry || item.tax || '-';
      const year = item.year || '-';
      const color = item.color || '-';
      const month = item.month || '-';
      const notes = item.notes || item.ket || '-';
      const status = item.status || item.result || 'Cek Unit';

      const isDeal = status.toLowerCase().includes('deal');
      const badgeStyle = isDeal
        ? 'background:#dcfce7; color:#166534; border:1px solid #bbf7d0;'
        : 'background:#fef3c7; color:#b45309; border:1px solid #fde68a;';

      html += `
        <tr>
          <td style="text-align:center; font-weight:600;">${idx + 1}</td>
          <td>${month}</td>
          <td><strong>${salesman}</strong> ${!item.isRyan ? '<span style="font-size:10px; color:var(--slate-400);">(' + (item.spv || 'Cabang') + ')</span>' : ''}</td>
          <td><strong>${usedCar}</strong></td>
          <td style="text-align:center;">${year}</td>
          <td>${color}</td>
          <td style="text-align:right; font-weight:700; color:var(--slate-800);">${price > 0 ? fmtRupiah(price) : (item.priceRaw || '-')}</td>
          <td>${mileage}</td>
          <td>${tax}</td>
          <td style="font-size:12px; color:var(--slate-600); max-width:220px;">${notes}</td>
          <td style="text-align:center;">
            <span class="badge-status" style="${badgeStyle}">${status}</span>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }

  function renderOlxCharts() {
    const list = getOlxBaseList();

    // 1. Monthly Trend Chart
    const trendEl = document.getElementById('chartOlxTrend');
    if (trendEl) {
      const months = ['June 2026', 'July 2026', 'August 2026', 'September 2026'];
      const monthLabels = ['Juni 2026', 'Juli 2026', 'Agustus 2026', 'September 2026'];
      const appraisals = months.map(m => list.filter(o => (o.month || '').toLowerCase().includes(m.toLowerCase().split(' ')[0])).length);
      const deals = months.map(m => list.filter(o => (o.month || '').toLowerCase().includes(m.toLowerCase().split(' ')[0]) && (o.status || o.result || '').toLowerCase().includes('deal')).length);

      if (state.charts.olxTrend) {
        state.charts.olxTrend.updateSeries([
          { name: 'Unit Di-Appraisal', data: appraisals },
          { name: 'Unit Berhasil Deal', data: deals }
        ]);
      } else {
        const options = {
          chart: {
            type: 'bar',
            height: 280,
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif'
          },
          colors: ['#d97706', '#16a34a'],
          series: [
            { name: 'Unit Di-Appraisal', data: appraisals },
            { name: 'Unit Berhasil Deal', data: deals }
          ],
          xaxis: { categories: monthLabels },
          legend: { position: 'top' },
          dataLabels: { enabled: false }
        };

        state.charts.olxTrend = new ApexCharts(trendEl, options);
        state.charts.olxTrend.render();
      }
    }

    // 2. Brand Breakdown Donut Chart
    const brandEl = document.getElementById('chartOlxBrands');
    if (brandEl) {
      const brandCounts = {};
      list.forEach(o => {
        const b = (o.brand || 'Lainnya').toUpperCase();
        brandCounts[b] = (brandCounts[b] || 0) + 1;
      });

      const sortedBrands = Object.keys(brandCounts).sort((a, b) => brandCounts[b] - brandCounts[a]);
      const topBrands = sortedBrands.slice(0, 5);
      const counts = topBrands.map(b => brandCounts[b]);

      if (state.charts.olxBrands) {
        state.charts.olxBrands.updateOptions({
          labels: topBrands,
          series: counts
        });
      } else {
        const options = {
          chart: {
            type: 'donut',
            height: 280,
            fontFamily: 'Inter, sans-serif'
          },
          colors: ['#eb0a1e', '#2563eb', '#16a34a', '#d97706', '#9333ea'],
          series: counts,
          labels: topBrands,
          legend: { position: 'bottom' },
          dataLabels: { enabled: true }
        };

        state.charts.olxBrands = new ApexCharts(brandEl, options);
        state.charts.olxBrands.render();
      }
    }
  }

  function exportOlxCsv() {
    const list = getFilteredOlx();
    let csv = 'No,Bulan,Wiraniaga,Merk & Tipe Mobil Seken,Tahun,Warna,Harga Taksasi,Odometer,Masa Pajak,Catatan / Bidding,Status\n';

    list.forEach((item, idx) => {
      const salesman = item.salesman || item.sales || '-';
      const usedCar = item.usedCar || `${item.brand || ''} ${item.type || item.model || ''}`.trim() || '-';
      const price = item.appraisalPrice !== undefined ? item.appraisalPrice : (item.price !== undefined ? item.price : 0);
      const mileage = item.mileage || item.km || '-';
      const tax = item.taxExpiry || item.tax || '-';
      const year = item.year || '-';
      const color = item.color || '-';
      const month = item.month || '-';
      const notes = (item.notes || item.ket || '').replace(/"/g, '""');
      const status = item.status || item.result || 'Cek Unit';

      csv += [
        idx + 1,
        `"${month}"`,
        `"${salesman}"`,
        `"${usedCar}"`,
        year,
        `"${color}"`,
        price,
        `"${mileage}"`,
        `"${tax}"`,
        `"${notes}"`,
        `"${status}"`
      ].join(',') + '\n';
    });

    downloadCsv('OLX_TradeIn_Tim1_Ryan_' + new Date().toISOString().slice(0, 10) + '.csv', csv);
    showToast('File CSV OLX Trade-In berhasil diunduh.');
  }

  // =========================================================================
  // TAB 8: AREA OPERATION (AO) REPORT CONTROLLER
  // =========================================================================
  function renderAoCharts() {
    const chartEl = document.getElementById('chartAoWaterfall');
    if (chartEl && !state.charts.aoWaterfall) {
      const options = {
        chart: {
          type: 'bar',
          height: 300,
          toolbar: { show: false },
          fontFamily: 'Inter, sans-serif'
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '50%',
            borderRadius: 4
          }
        },
        colors: ['#0284c7', '#16a34a', '#d97706', '#eb0a1e'],
        series: [{
          name: 'Jumlah Unit (Nasional)',
          data: [
            { x: 'Full Stock (Free)', y: 77 },
            { x: 'Matched Order', y: 48 },
            { x: 'OS Firmed', y: 13 },
            { x: 'Potential DO Rilis', y: 6 }
          ]
        }],
        dataLabels: {
          enabled: true,
          formatter: (val) => val + ' Unit'
        },
        yaxis: { title: { text: 'Volume Kendaraan (Unit)' } }
      };

      state.charts.aoWaterfall = new ApexCharts(chartEl, options);
      state.charts.aoWaterfall.render();
    }
  }

  // =========================================================================
  // TAB 9: MARKETING FUNNEL CONTROLLER
  // =========================================================================
  function renderFunnelChart() {
    const chartEl = document.getElementById('chartFunnelPipeline');
    if (chartEl && !state.charts.funnelPipeline) {
      const stages = ['1. Total Leads', '2. Kontak/Follow-up', '3. Prospek', '4. Hot Prospek', '5. Terbit SPK', '6. Delivery (DO)'];
      const volumes = [1840, 920, 460, 184, 64, 35];

      const options = {
        chart: {
          type: 'bar',
          height: 320,
          toolbar: { show: false },
          fontFamily: 'Inter, sans-serif'
        },
        plotOptions: {
          bar: {
            horizontal: true,
            distributed: true,
            borderRadius: 6
          }
        },
        colors: ['#0284c7', '#38bdf8', '#0ea5e9', '#d97706', '#e11d48', '#16a34a'],
        series: [{ name: 'Volume Pipeline', data: volumes }],
        xaxis: { categories: stages },
        legend: { show: false },
        dataLabels: {
          enabled: true,
          formatter: (val) => fmtNumber(val) + ' Unit/Kontak'
        }
      };

      state.charts.funnelPipeline = new ApexCharts(chartEl, options);
      state.charts.funnelPipeline.render();
    }
  }

  // =========================================================================
  // TAB 10: KINERJA WIRANIAGA CONTROLLER
  // =========================================================================
  function initWiraniaga() {
    bindWiraniagaEvents();
    renderWiraniagaSummary();
    renderWiraniagaTable();
    renderWiraniagaCards();
  }

  function bindWiraniagaEvents() {
    const searchInput = document.getElementById('filterWiraniagaSearch');
    const btnTable = document.getElementById('btnViewWiraniagaTable');
    const btnCards = document.getElementById('btnViewWiraniagaCards');
    const tableView = document.getElementById('wiraniagaTableView');
    const cardsView = document.getElementById('wiraniagaCardsGrid');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.wiraniaga.search = e.target.value.toLowerCase().trim();
        renderWiraniagaTable();
        renderWiraniagaCards();
      });
    }

    if (btnTable && btnCards) {
      btnTable.addEventListener('click', () => {
        state.wiraniaga.viewMode = 'table';
        btnTable.classList.add('active');
        btnTable.style.background = '#fff';
        btnTable.style.color = 'var(--slate-800)';
        btnCards.classList.remove('active');
        btnCards.style.background = 'transparent';
        btnCards.style.color = 'var(--slate-600)';
        if (tableView) tableView.style.display = 'block';
        if (cardsView) cardsView.style.display = 'none';
      });

      btnCards.addEventListener('click', () => {
        state.wiraniaga.viewMode = 'cards';
        btnCards.classList.add('active');
        btnCards.style.background = '#fff';
        btnCards.style.color = 'var(--slate-800)';
        btnTable.classList.remove('active');
        btnTable.style.background = 'transparent';
        btnTable.style.color = 'var(--slate-600)';
        if (tableView) tableView.style.display = 'none';
        if (cardsView) cardsView.style.display = 'grid';
      });
    }
  }

  function getFilteredWiraniaga() {
    const all = data.salesforce || [];
    if (!state.wiraniaga.search) return all;
    return all.filter(s => {
      const target = `${s.name || ''} ${s.shortName || ''}`.toLowerCase();
      return target.includes(state.wiraniaga.search);
    });
  }

  function renderWiraniagaSummary() {
    const all = data.salesforce || [];
    let totSpkTarget = 0;
    let totSpkActual = 0;
    let totDoTarget = 0;
    let totDoActual = 0;

    all.forEach(s => {
      totSpkTarget += (s.targetSpk || 0);
      totSpkActual += (s.actualSpk || 0);
      totDoTarget += (s.targetDo || 0);
      totDoActual += (s.actualDo || 0);
    });

    const elDo = document.getElementById('kpiWTotalDo');
    const elSpk = document.getElementById('kpiWTotalSpk');
    if (elDo) elDo.textContent = `${totDoActual} Unit DO`;
    if (elSpk) elSpk.textContent = `${totSpkActual} SPK`;
  }

  function renderWiraniagaTable() {
    const tbody = document.getElementById('wiraniagaTableBody');
    const tfoot = document.getElementById('wiraniagaTableFoot');
    const badge = document.getElementById('wiraniagaShowingCount');
    if (!tbody) return;

    const list = getFilteredWiraniaga();
    if (badge) {
      badge.textContent = `${list.length} Wiraniaga`;
    }

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:30px; color:var(--slate-500);">Tidak ada wiraniaga yang cocok dengan kriteria pencarian.</td></tr>';
      if (tfoot) tfoot.innerHTML = '';
      return;
    }

    let rowsHtml = '';
    let sumTargetSpk = 0;
    let sumActualSpk = 0;
    let sumTargetDo = 0;
    let sumActualDo = 0;

    list.forEach((s, idx) => {
      sumTargetSpk += (s.targetSpk || 0);
      sumActualSpk += (s.actualSpk || 0);
      sumTargetDo += (s.targetDo || 0);
      sumActualDo += (s.actualDo || 0);

      const capaiSpk = s.capaianSpk !== undefined ? s.capaianSpk : Math.round(((s.actualSpk || 0) / (s.targetSpk || 1)) * 100);
      const capaiDo = s.capaianDo !== undefined ? s.capaianDo : Math.round(((s.actualDo || 0) / (s.targetDo || 1)) * 100);

      let statusBadge = '<span style="font-size:11px; color:var(--slate-400); font-weight:600;">Prospek</span>';
      if ((s.actualDo || 0) > 0) {
        statusBadge = `<span class="badge-status badge-kredit" style="font-size:11px; font-weight:700;"><i class="fa-solid fa-car" style="margin-right:3px;"></i> ${s.actualDo} DO Closed</span>`;
      } else if ((s.actualSpk || 0) > 0) {
        statusBadge = `<span class="badge-status badge-tunai" style="font-size:11px; font-weight:700; background:#e0f2fe; color:#0369a1; border-color:#bae6fd;"><i class="fa-solid fa-file-signature" style="margin-right:3px;"></i> ${s.actualSpk} SPK In</span>`;
      }

      rowsHtml += `
        <tr style="${(s.actualDo || 0) > 0 ? 'background:#f0fdf4;' : (s.actualSpk || 0) > 0 ? 'background:#f8fafc;' : ''}">
          <td style="text-align:center; font-weight:600;">${idx + 1}</td>
          <td>
            <div style="font-weight:700; color:var(--slate-800); font-size:13px;">${s.name}</div>
          </td>
          <td style="text-align:center; font-size:13px; color:var(--slate-600);">${s.targetSpk}</td>
          <td style="text-align:center; font-weight:700; font-size:13px; color:${(s.actualSpk || 0) > 0 ? '#0284c7' : 'var(--slate-600)'};">${s.actualSpk || 0}</td>
          <td style="text-align:center;">
            <span class="badge-status ${capaiSpk >= 50 ? 'badge-kredit' : 'badge-tunai'}" style="font-size:11px;">${capaiSpk}%</span>
          </td>
          <td style="text-align:center; font-size:13px; color:var(--slate-600);">${s.targetDo}</td>
          <td style="text-align:center; font-weight:700; font-size:13.5px; color:${(s.actualDo || 0) > 0 ? 'var(--primary-red)' : 'var(--slate-600)'};">${s.actualDo || 0}</td>
          <td style="text-align:center;">
            <span class="badge-status ${capaiDo >= 50 ? 'badge-kredit' : 'badge-tunai'}" style="font-size:11px;">${capaiDo}%</span>
          </td>
          <td style="text-align:center;">
            ${statusBadge}
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = rowsHtml;

    if (tfoot) {
      const totCapaiSpk = Math.round((sumActualSpk / (sumTargetSpk || 1)) * 100);
      const totCapaiDo = Math.round((sumActualDo / (sumTargetDo || 1)) * 100);
      tfoot.innerHTML = `
        <tr>
          <td colspan="2" style="text-align:right; font-weight:800; color:var(--slate-800);">Total Tim Ryan:</td>
          <td style="text-align:center; font-weight:800;">${sumTargetSpk}</td>
          <td style="text-align:center; font-weight:800; color:#0284c7;">${sumActualSpk}</td>
          <td style="text-align:center; font-weight:800;">${totCapaiSpk}%</td>
          <td style="text-align:center; font-weight:800;">${sumTargetDo}</td>
          <td style="text-align:center; font-weight:800; color:var(--primary-red); font-size:14px;">${sumActualDo}</td>
          <td style="text-align:center; font-weight:800;">${totCapaiDo}%</td>
          <td style="text-align:center; font-weight:800; color:var(--primary-red);">Target SPV: 35 Unit</td>
        </tr>
      `;
    }
  }

  function renderWiraniagaCards() {
    const container = document.getElementById('wiraniagaCardsGrid');
    if (!container) return;

    const list = getFilteredWiraniaga();
    let html = '';

    list.forEach((s, idx) => {
      const capaiSpk = s.capaianSpk !== undefined ? s.capaianSpk : Math.round(((s.actualSpk || 0) / (s.targetSpk || 1)) * 100);
      const capaiDo = s.capaianDo !== undefined ? s.capaianDo : Math.round(((s.actualDo || 0) / (s.targetDo || 1)) * 100);

      const initials = s.name.split(' ').filter(w => !w.startsWith('(')).map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const hasDo = (s.actualDo || 0) > 0;
      const hasSpk = (s.actualSpk || 0) > 0;
      const avatarBg = hasDo ? 'var(--primary-red)' : hasSpk ? '#0284c7' : 'var(--slate-600)';

      let statusBadge = '<span style="font-size:11px; color:var(--slate-400);">Prospek</span>';
      if (hasDo) {
        statusBadge = `<span class="badge-status badge-kredit" style="font-size:10.5px;"><i class="fa-solid fa-car" style="margin-right:3px;"></i> ${s.actualDo} DO</span>`;
      } else if (hasSpk) {
        statusBadge = `<span class="badge-status badge-tunai" style="font-size:10.5px; background:#e0f2fe; color:#0369a1; border-color:#bae6fd;"><i class="fa-solid fa-file-signature" style="margin-right:3px;"></i> ${s.actualSpk} SPK</span>`;
      }

      html += `
        <div style="background:#fff; border:1px solid ${hasDo ? '#bbf7d0' : '#e2e8f0'}; border-radius:10px; padding:14px; box-shadow:var(--shadow-sm); display:flex; flex-direction:column; justify-content:space-between;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <div style="width:34px; height:34px; border-radius:50%; background:${avatarBg}; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12px;">
                ${initials}
              </div>
              <div>
                <h4 style="margin:0; font-size:13px; font-weight:700; color:var(--slate-800);">${s.name}</h4>
                <span style="font-size:11px; color:var(--slate-500);">Wiraniaga Tim Ryan</span>
              </div>
            </div>
            ${statusBadge}
          </div>

          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px; display:grid; grid-template-columns: 1fr 1fr; gap:10px; text-align:center;">
            <div>
              <div style="font-size:10px; color:var(--slate-500); text-transform:uppercase; font-weight:700;">Target SPK</div>
              <div style="font-size:15px; font-weight:800; color:${hasSpk ? '#0284c7' : 'var(--slate-800)'}; margin:2px 0;">
                ${s.actualSpk || 0} <span style="font-size:11px; font-weight:500; color:var(--slate-400);">/ ${s.targetSpk}</span>
              </div>
              <div style="font-size:10.5px; font-weight:600; color:${capaiSpk >= 50 ? '#16a34a' : 'var(--slate-400)'};">${capaiSpk}%</div>
            </div>

            <div style="border-left:1px solid #e2e8f0;">
              <div style="font-size:10px; color:var(--slate-500); text-transform:uppercase; font-weight:700;">Delivery (DO)</div>
              <div style="font-size:15px; font-weight:800; color:${hasDo ? 'var(--primary-red)' : 'var(--slate-800)'}; margin:2px 0;">
                ${s.actualDo || 0} <span style="font-size:11px; font-weight:500; color:var(--slate-400);">/ ${s.targetDo}</span>
              </div>
              <div style="font-size:10.5px; font-weight:600; color:${capaiDo >= 50 ? '#16a34a' : 'var(--slate-400)'};">${capaiDo}%</div>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // =========================================================================
  // TAB 11: RETENSI SERVIS BERKALA (SBI) CONTROLLER
  // =========================================================================
  function initSbi() {
    bindSbiEvents();
    renderSbiTable();
    renderSbiCharts();
  }

  function bindSbiEvents() {
    const searchInput = document.getElementById('filterSbiSearch');
    const caiSelect = document.getElementById('filterSbiCai');
    const judgeSelect = document.getElementById('filterSbiJudgement');
    const datangSelect = document.getElementById('filterSbiKedatangan');
    const exportBtn = document.getElementById('btnExportSbiCsv');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.sbi.search = e.target.value.toLowerCase().trim();
        state.sbi.page = 1;
        renderSbiTable();
      });
    }

    if (caiSelect) {
      caiSelect.addEventListener('change', (e) => {
        state.sbi.cai = e.target.value;
        state.sbi.page = 1;
        renderSbiTable();
      });
    }

    if (judgeSelect) {
      judgeSelect.addEventListener('change', (e) => {
        state.sbi.judgement = e.target.value;
        state.sbi.page = 1;
        renderSbiTable();
      });
    }

    if (datangSelect) {
      datangSelect.addEventListener('change', (e) => {
        state.sbi.kedatangan = e.target.value;
        state.sbi.page = 1;
        renderSbiTable();
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', exportSbiCsv);
    }
  }

  function renderSbiCharts() {
    // 1. Monthly SBI Schedule Chart
    const monthlyEl = document.getElementById('chartSbiMonthly');
    if (monthlyEl && !state.charts.sbiMonthly) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt'];
      const counts = [65, 72, 80, 68, 75, 70, 78, 82, 64, 50];

      const options = {
        chart: {
          type: 'bar',
          height: 280,
          toolbar: { show: false },
          fontFamily: 'Inter, sans-serif'
        },
        colors: ['#0284c7'],
        series: [{ name: 'Kendaraan Jatuh Tempo Servis', data: counts }],
        xaxis: { categories: months },
        plotOptions: {
          bar: { borderRadius: 4, columnWidth: '45%' }
        },
        dataLabels: { enabled: false }
      };

      state.charts.sbiMonthly = new ApexCharts(monthlyEl, options);
      state.charts.sbiMonthly.render();
    }

    // 2. Judgements Donut Chart
    const judgeEl = document.getElementById('chartSbiJudgements');
    if (judgeEl && !state.charts.sbiJudgements) {
      const categories = ['HOT Priority', 'HIGH Priority', 'MEDIUM Priority', 'LOW Priority'];
      const series = [118, 70, 310, 206];

      const options = {
        chart: {
          type: 'donut',
          height: 280,
          fontFamily: 'Inter, sans-serif'
        },
        colors: ['#eb0a1e', '#f59e0b', '#0284c7', '#94a3b8'],
        series: series,
        labels: categories,
        legend: { position: 'bottom' },
        dataLabels: { enabled: true }
      };

      state.charts.sbiJudgements = new ApexCharts(judgeEl, options);
      state.charts.sbiJudgements.render();
    }
  }

  function getFilteredSbi() {
    const all = data.sbiRecords || [];
    return all.filter(item => {
      // Search
      if (state.sbi.search) {
        const q = state.sbi.search;
        const cust = item.customerName || item.customer_name || item.nama || '';
        const plat = item.policeNo || item.plat_no || '';
        const vin = item.vin || '';
        const sales = item.salesman || item.sales_person || item.sales || '';
        const phone = item.phone || item.telepon || '';
        const target = `${cust} ${plat} ${vin} ${sales} ${phone} ${item.model || ''} ${item.notes || ''}`.toLowerCase();
        if (!target.includes(q)) return false;
      }
      // CAI
      if (state.sbi.cai !== 'all') {
        const cai = (item.caiStatus || item.cai_status || '').toUpperCase();
        if (state.sbi.cai === 'CAI' && !cai.includes('CAI')) return false;
        if (state.sbi.cai === 'NOT CAI' && cai === 'CAI') return false;
      }
      // Judgement
      if (state.sbi.judgement !== 'all') {
        const j = (item.judgement || item.judgement_cust || '').toUpperCase();
        if (j !== state.sbi.judgement.toUpperCase()) return false;
      }
      // Kedatangan
      if (state.sbi.kedatangan !== 'all') {
        const kd = (item.kedatangan || item.potency_sales || '').toUpperCase();
        if (!kd.includes(state.sbi.kedatangan.toUpperCase())) return false;
      }
      return true;
    });
  }

  function renderSbiTable() {
    const tbody = document.getElementById('sbiTableBody');
    const badge = document.getElementById('sbiShowingBadge');
    if (!tbody) return;

    const filtered = getFilteredSbi();
    const total = filtered.length;

    if (badge) {
      badge.textContent = `Menampilkan ${total} Database SBI Tim Ryan`;
    }

    // Pagination
    const page = state.sbi.page;
    const pageSize = state.sbi.pageSize;
    const startIndex = (page - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    if (paginated.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:30px; color:var(--slate-500);">Tidak ada data servis SBI yang sesuai filter.</td></tr>';
      return;
    }

    let html = '';
    paginated.forEach((item, idx) => {
      const rowNo = startIndex + idx + 1;
      const cust = item.customerName || item.customer_name || item.nama || '-';
      const phone = (item.phone && item.phone !== '-') ? item.phone : (item.telepon && item.telepon !== '-' ? item.telepon : '');
      const model = item.model || '-';
      const plat = (item.policeNo && item.policeNo !== '-') ? item.policeNo : (item.plat_no && item.plat_no !== '-' ? item.plat_no : '');
      const sales = item.salesman || item.sales_person || item.sales || '-';
      const cai = item.caiStatus || item.cai_status || 'CAI';
      const judge = item.judgement || item.judgement_cust || 'MEDIUM';
      const datang = item.kedatangan || item.potency_sales || 'SUDAH DATANG';
      const notes = item.notes || item.notes_fu || '-';
      const month = item.fuMonth || item.month_fu || '-';

      const isHot = judge === 'HOT' || judge === 'HIGH';
      const isDatang = datang.toUpperCase().includes('SUDAH');

      html += `
        <tr>
          <td style="text-align:center; font-weight:600;">${rowNo}</td>
          <td>${month}</td>
          <td>
            <strong>${cust}</strong>
            ${phone ? `<div style="font-size:11.5px; color:var(--slate-500);"><i class="fa-solid fa-phone" style="font-size:10px;"></i> ${phone}</div>` : ''}
          </td>
          <td>
            <strong>${model}</strong>
            ${plat ? `<div style="font-size:11.5px; color:var(--primary-red); font-weight:600;">${plat}</div>` : ''}
          </td>
          <td>${sales}</td>
          <td style="text-align:center;">
            <span class="badge-status ${cai === 'CAI' ? 'badge-kredit' : 'badge-tunai'}">
              ${cai}
            </span>
          </td>
          <td style="text-align:center;">
            <span class="badge-status ${isHot ? 'badge-kredit' : 'badge-tunai'}" style="${isHot ? 'background:#fee2e2; color:#b91c1c;' : ''}">
              ${judge}
            </span>
          </td>
          <td style="text-align:center;">
            <span class="badge-status" style="${isDatang ? 'background:#dcfce7; color:#15803d;' : 'background:#fef3c7; color:#b45309;'}">
              ${datang}
            </span>
          </td>
          <td style="font-size:12px; color:var(--slate-600); max-width:220px;">
            ${notes}
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }

  function exportSbiCsv() {
    const list = getFilteredSbi();
    let csv = 'No,Bulan FU,Nama Konsumen,No Telepon,Model Kendaraan,No Polisi,Wiraniaga,Status CAI,Judgement,Status Kedatangan,Catatan\n';

    list.forEach((item, idx) => {
      csv += [
        idx + 1,
        `"${item.fuMonth || ''}"`,
        `"${item.customerName || ''}"`,
        `"${item.phone || ''}"`,
        `"${item.model || ''}"`,
        `"${item.policeNo || ''}"`,
        `"${item.salesman || ''}"`,
        `"${item.caiStatus || ''}"`,
        `"${item.judgement || ''}"`,
        `"${item.kedatangan || ''}"`,
        `"${(item.notes || '').replace(/"/g, '""')}"`
      ].join(',') + '\n';
    });

    downloadCsv('SBI_Records_Tim1_Ryan_' + new Date().toISOString().slice(0, 10) + '.csv', csv);
    showToast('File CSV Service Berkala (SBI) berhasil diunduh.');
  }

  // =========================================================================
  // TAB: ONE ACCOUNT ID CONTROLLER (DIGITAL DELIVERY & CONSENT)
  // =========================================================================
  function initOneAccount() {
    populateOneAccountFilterOptions();
    bindOneAccountEvents();
    updateOneAccountKpis();
    renderOneAccountTable();
    renderOneAccountCharts();
  }

  function getOneAccountBaseList() {
    const all = data.oneAccount || [];
    if (state.oneaccount.scope === 'ryan') {
      return all.filter(o => o.isRyan === true);
    }
    return all;
  }

  function populateOneAccountFilterOptions() {
    const salesSelect = document.getElementById('filterOneAccountSales');
    if (!salesSelect) return;
    const baseList = getOneAccountBaseList();
    const salesmen = Array.from(new Set(baseList.map(o => o.salesman || o.sales || '').filter(Boolean))).sort();

    const currentVal = state.oneaccount.salesman;
    let html = '<option value="all">Semua Wiraniaga</option>';
    salesmen.forEach(s => {
      html += `<option value="${s}" ${currentVal === s ? 'selected' : ''}>${s}</option>`;
    });
    salesSelect.innerHTML = html;
  }

  function updateOneAccountKpis() {
    const list = getOneAccountBaseList();
    const total = list.length;
    const hasId = list.filter(o => o.hasOneAccount || (o.oneAccountId && o.oneAccountId !== '-')).length;
    const pctId = total > 0 ? ((hasId / total) * 100).toFixed(1) : '0';

    const consentDone = list.filter(o => (o.consent || '').toUpperCase() === 'DONE').length;
    const pctConsent = total > 0 ? ((consentDone / total) * 100).toFixed(1) : '0';

    const dxmiCount = list.filter(o => (o.dxmi || '').toUpperCase().includes('TERDAFTAR')).length;
    const inquiryCount = list.filter(o => (o.inquiry || '').toUpperCase().includes('TERDAFTAR')).length;

    const elTotal = document.getElementById('kpiOneAccountTotalUnits');
    const elId = document.getElementById('kpiOneAccountGenerated');
    const elConsent = document.getElementById('kpiOneAccountConsent');
    const elDxmi = document.getElementById('kpiOneAccountDxmi');

    if (elTotal) elTotal.textContent = `${fmtNumber(total)} Unit`;
    if (elId) elId.textContent = `${fmtNumber(hasId)} Unit (${pctId}%)`;
    if (elConsent) elConsent.textContent = `${fmtNumber(consentDone)} Unit (${pctConsent}%)`;
    if (elDxmi) {
      elDxmi.textContent = `${dxmiCount} Unit DXMI`;
      const sub = elDxmi.nextElementSibling;
      if (sub) sub.textContent = `${inquiryCount} Unit Inquiry Terdaftar`;
    }

    const navBadge = document.getElementById('navBadgeOneAccount');
    if (navBadge) {
      const ryanCount = (data.oneAccount || []).filter(o => o.isRyan).length;
      navBadge.textContent = String(ryanCount || 16);
    }
  }

  function bindOneAccountEvents() {
    const btnRyanOnly = document.getElementById('btnOneAccountRyanOnly');
    const btnAllBranch = document.getElementById('btnOneAccountAllBranch');
    const notice = document.getElementById('oneAccountFilterNotice');

    if (btnRyanOnly && !btnRyanOnly.dataset.bound) {
      btnRyanOnly.dataset.bound = 'true';
      btnRyanOnly.addEventListener('click', () => {
        state.oneaccount.scope = 'ryan';
        btnRyanOnly.classList.add('active');
        btnRyanOnly.style.fontWeight = '700';
        if (btnAllBranch) {
          btnAllBranch.classList.remove('active');
          btnAllBranch.style.fontWeight = '400';
        }
        if (notice) notice.textContent = 'Menampilkan 16 data delivery & One Account ID Tim 1 SPV Ryan';
        populateOneAccountFilterOptions();
        updateOneAccountKpis();
        renderOneAccountTable();
        renderOneAccountCharts();
      });
    }

    if (btnAllBranch && !btnAllBranch.dataset.bound) {
      btnAllBranch.dataset.bound = 'true';
      btnAllBranch.addEventListener('click', () => {
        state.oneaccount.scope = 'all';
        btnAllBranch.classList.add('active');
        btnAllBranch.style.fontWeight = '700';
        if (btnRyanOnly) {
          btnRyanOnly.classList.remove('active');
          btnRyanOnly.style.fontWeight = '400';
        }
        if (notice) notice.textContent = 'Menampilkan 37 data delivery seluruh cabang TKC';
        populateOneAccountFilterOptions();
        updateOneAccountKpis();
        renderOneAccountTable();
        renderOneAccountCharts();
      });
    }

    const searchInput = document.getElementById('filterOneAccountSearch');
    const statusSelect = document.getElementById('filterOneAccountStatus');
    const consentSelect = document.getElementById('filterOneAccountConsent');
    const salesSelect = document.getElementById('filterOneAccountSales');

    if (searchInput && !searchInput.dataset.bound) {
      searchInput.dataset.bound = 'true';
      searchInput.addEventListener('input', (e) => {
        state.oneaccount.search = e.target.value.toLowerCase().trim();
        renderOneAccountTable();
      });
    }

    if (statusSelect && !statusSelect.dataset.bound) {
      statusSelect.dataset.bound = 'true';
      statusSelect.addEventListener('change', (e) => {
        state.oneaccount.status = e.target.value;
        renderOneAccountTable();
      });
    }

    if (consentSelect && !consentSelect.dataset.bound) {
      consentSelect.dataset.bound = 'true';
      consentSelect.addEventListener('change', (e) => {
        state.oneaccount.consent = e.target.value;
        renderOneAccountTable();
      });
    }

    if (salesSelect && !salesSelect.dataset.bound) {
      salesSelect.dataset.bound = 'true';
      salesSelect.addEventListener('change', (e) => {
        state.oneaccount.salesman = e.target.value;
        renderOneAccountTable();
      });
    }
  }

  function getFilteredOneAccount() {
    const list = getOneAccountBaseList();
    return list.filter(o => {
      if (state.oneaccount.search) {
        const q = state.oneaccount.search;
        const cust = (o.customerName || o.namaKonsumen || '').toLowerCase();
        const sales = (o.salesman || o.sales || '').toLowerCase();
        const nvdo = (o.nvdo || '').toLowerCase();
        const noka = (o.noka || o.vin || '').toLowerCase();
        const nvso = (o.nvso || o.spkNo || '').toLowerCase();
        const id = (o.oneAccountId || '').toLowerCase();
        const phone = (o.phone || o.noTelp || '').toLowerCase();
        if (!cust.includes(q) && !sales.includes(q) && !nvdo.includes(q) && !noka.includes(q) && !nvso.includes(q) && !id.includes(q) && !phone.includes(q)) {
          return false;
        }
      }
      if (state.oneaccount.status !== 'all') {
        const hasId = o.hasOneAccount || (o.oneAccountId && o.oneAccountId !== '-');
        if (state.oneaccount.status === 'has_id' && !hasId) return false;
        if (state.oneaccount.status === 'no_id' && hasId) return false;
      }
      if (state.oneaccount.consent !== 'all') {
        const isDone = (o.consent || '').toUpperCase() === 'DONE';
        if (state.oneaccount.consent === 'DONE' && !isDone) return false;
        if (state.oneaccount.consent === 'BELUM' && isDone) return false;
      }
      if (state.oneaccount.salesman !== 'all') {
        const s = o.salesman || o.sales || '';
        if (s !== state.oneaccount.salesman) return false;
      }
      return true;
    });
  }

  function renderOneAccountTable() {
    const tbody = document.getElementById('oneAccountTableBody');
    const badge = document.getElementById('oneAccountShowingBadge');
    if (!tbody) return;

    const list = getFilteredOneAccount();
    if (badge) {
      const scopeText = state.oneaccount.scope === 'ryan' ? 'Tim 1 Pak Ryan' : 'Semua Tim Cabang';
      badge.textContent = `Menampilkan ${list.length} Data One Account ID (${scopeText})`;
    }

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="12" style="text-align:center; padding:32px; color:var(--slate-500);">Tidak ada data One Account ID yang sesuai dengan filter.</td></tr>';
      return;
    }

    let html = '';
    list.forEach((o, idx) => {
      const hasId = o.hasOneAccount || (o.oneAccountId && o.oneAccountId !== '-');
      const isConsentDone = (o.consent || '').toUpperCase() === 'DONE';
      const isInquiryReg = (o.inquiry || '').toUpperCase().includes('TERDAFTAR');
      const isDxmiReg = (o.dxmi || '').toUpperCase().includes('TERDAFTAR');

      const oneAccountBadge = hasId
        ? `<div style="font-family:monospace; font-size:11px; background:#f0fdf4; color:#166534; padding:3px 7px; border-radius:4px; border:1px solid #bbf7d0; word-break:break-all; max-width:230px; font-weight:600;" title="${o.oneAccountId}">${o.oneAccountId}</div>`
        : `<span class="badge-status badge-kredit" style="font-size:11px;">Belum Terbit</span>`;

      const consentBadge = isConsentDone
        ? `<span class="badge-status badge-cash" style="font-size:11px;"><i class="fa-solid fa-check"></i> DONE</span>`
        : `<span class="badge-status badge-kredit" style="font-size:11px;">BELUM</span>`;

      const inquiryBadge = isInquiryReg
        ? `<span class="badge-status badge-cai" style="font-size:11px;">TERDAFTAR</span>`
        : `<span class="badge-status badge-kredit" style="font-size:11px;">BELUM DAFTAR</span>`;

      const dxmiBadge = isDxmiReg
        ? `<span class="badge-status badge-hot" style="font-size:11px;">TERDAFTAR</span>`
        : `<span style="color:var(--slate-400); font-size:12px;">-</span>`;

      const phoneDisplay = (o.phone && o.phone !== '-') ? o.phone : ((o.noTelp && o.noTelp !== '-') ? o.noTelp : '-');
      const customerDisplay = o.customerName || o.namaKonsumen || '-';
      const salesDisplay = o.salesman || o.sales || '-';
      const ryanTag = o.isRyan
        ? `<div style="font-size:10.5px; color:#059669; font-weight:600; margin-top:2px;"><i class="fa-solid fa-user-check"></i> Tim Ryan</div>`
        : `<div style="font-size:10.5px; color:var(--slate-400); margin-top:2px;">Cabang TKC</div>`;

      html += `
        <tr>
          <td style="text-align:center; font-weight:600;">${idx + 1}</td>
          <td><strong>${o.nvdo || '-'}</strong></td>
          <td style="font-size:12px; color:var(--slate-600); white-space:nowrap;">${o.deliveryDate || o.tglDelivery || '-'}</td>
          <td>
            <strong style="color:var(--slate-900); font-size:13px;">${customerDisplay}</strong>
            ${phoneDisplay !== '-' ? `<div style="font-size:11.5px; color:var(--slate-500); margin-top:2px;"><i class="fa-solid fa-phone" style="font-size:10px;"></i> ${phoneDisplay}</div>` : ''}
          </td>
          <td>
            <strong>${salesDisplay}</strong>
            ${ryanTag}
          </td>
          <td style="font-size:12px; font-family:monospace; color:var(--slate-700);">${o.nvso || o.spkNo || '-'}</td>
          <td><code style="font-size:11.5px; background:var(--slate-100); padding:2px 6px; border-radius:4px; font-weight:600;">${o.noka || o.vin || '-'}</code></td>
          <td>${oneAccountBadge}</td>
          <td style="text-align:center;">${consentBadge}</td>
          <td style="text-align:center;">${inquiryBadge}</td>
          <td style="text-align:center;">${dxmiBadge}</td>
          <td style="font-size:12px; color:var(--slate-600);">${o.pic && o.pic !== '-' ? o.pic : '-'}</td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }

  function renderOneAccountCharts() {
    const list = getOneAccountBaseList();

    // 1. Ratio Donut Chart
    const ratioEl = document.getElementById('chartOneAccountRatio');
    if (ratioEl) {
      const hasId = list.filter(o => o.hasOneAccount || (o.oneAccountId && o.oneAccountId !== '-')).length;
      const noId = list.length - hasId;

      if (state.charts.oneAccountRatio) {
        state.charts.oneAccountRatio.updateSeries([hasId, noId]);
      } else {
        const options = {
          chart: {
            type: 'donut',
            height: 280,
            fontFamily: 'Inter, sans-serif'
          },
          labels: ['One Account ID Terbit', 'Belum Terbit'],
          series: [hasId, noId],
          colors: ['#059669', '#cbd5e1'],
          legend: { position: 'bottom' },
          dataLabels: {
            enabled: true,
            formatter: (val) => `${val.toFixed(1)}%`
          },
          plotOptions: {
            pie: {
              donut: {
                size: '65%',
                labels: {
                  show: true,
                  total: {
                    show: true,
                    label: 'Total Delivery',
                    formatter: () => `${list.length} Unit`
                  }
                }
              }
            }
          }
        };
        state.charts.oneAccountRatio = new ApexCharts(ratioEl, options);
        state.charts.oneAccountRatio.render();
      }
    }

    // 2. Services Bar Chart
    const servicesEl = document.getElementById('chartOneAccountServices');
    if (servicesEl) {
      const consentDone = list.filter(o => (o.consent || '').toUpperCase() === 'DONE').length;
      const inquiryReg = list.filter(o => (o.inquiry || '').toUpperCase().includes('TERDAFTAR')).length;
      const dxmiReg = list.filter(o => (o.dxmi || '').toUpperCase().includes('TERDAFTAR')).length;

      if (state.charts.oneAccountServices) {
        state.charts.oneAccountServices.updateSeries([
          { name: 'Unit Terdaftar', data: [consentDone, inquiryReg, dxmiReg] }
        ]);
      } else {
        const options = {
          chart: {
            type: 'bar',
            height: 280,
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif'
          },
          colors: ['#059669', '#0284c7', '#dc2626'],
          series: [
            { name: 'Unit Terdaftar', data: [consentDone, inquiryReg, dxmiReg] }
          ],
          xaxis: {
            categories: ['Consent DONE', 'Inquiry Terdaftar', 'DXMI Terdaftar']
          },
          plotOptions: {
            bar: {
              borderRadius: 6,
              columnWidth: '45%',
              distributed: true
            }
          },
          legend: { show: false },
          dataLabels: {
            enabled: true,
            formatter: (val) => `${val} Unit`
          }
        };
        state.charts.oneAccountServices = new ApexCharts(servicesEl, options);
        state.charts.oneAccountServices.render();
      }
    }
  }


  // =========================================================================
  // MODULE: DASHBOARD AFI 2026 (AREA FINANCING & DELIVERY) TIM RYAN
  // Source: Dashboard AFI 2026 KC sd Okt-.xlsx (244 Unit DO YTD Tim Ryan)
  // =========================================================================

  function initAfi() {
    const afiData = (data && data.dashboardAfi) ? data.dashboardAfi : (window.RYAN_DATA ? window.RYAN_DATA.dashboardAfi : null);
    if (!afiData) {
      console.warn("Dataset dashboardAfi belum dimuat!");
      return;
    }

    // Populate Sales Dropdown
    const salesSelect = document.getElementById('filterAfiSales');
    if (salesSelect && afiData.salesStats) {
      salesSelect.innerHTML = '<option value="all">Semua Wiraniaga</option>';
      afiData.salesStats.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.salesPerson;
        opt.textContent = `${s.salesPerson} (${s.total} Unit)`;
        salesSelect.appendChild(opt);
      });
    }

    // Bind Search Input
    const searchInput = document.getElementById('filterAfiSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.afi.search = e.target.value.toLowerCase().trim();
        state.afi.page = 1;
        renderAfiTable();
      });
    }

    // Bind Select Filters
    const monthSelect = document.getElementById('filterAfiMonth');
    if (monthSelect) {
      monthSelect.addEventListener('change', (e) => {
        state.afi.month = e.target.value;
        state.afi.page = 1;
        renderAfiTable();
      });
    }

    const paymentSelect = document.getElementById('filterAfiPayment');
    if (paymentSelect) {
      paymentSelect.addEventListener('change', (e) => {
        state.afi.payment = e.target.value;
        state.afi.page = 1;
        renderAfiTable();
      });
    }

    const leasingSelect = document.getElementById('filterAfiLeasing');
    if (leasingSelect) {
      leasingSelect.addEventListener('change', (e) => {
        state.afi.leasing = e.target.value;
        state.afi.page = 1;
        renderAfiTable();
      });
    }

    const pmaSelect = document.getElementById('filterAfiPma');
    if (pmaSelect) {
      pmaSelect.addEventListener('change', (e) => {
        state.afi.pma = e.target.value;
        state.afi.page = 1;
        renderAfiTable();
      });
    }

    if (salesSelect) {
      salesSelect.addEventListener('change', (e) => {
        state.afi.sales = e.target.value;
        state.afi.page = 1;
        renderAfiTable();
      });
    }

    // Page Size Select
    const pageSizeSelect = document.getElementById('afiPageSize');
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener('change', (e) => {
        state.afi.pageSize = parseInt(e.target.value, 10) || 25;
        state.afi.page = 1;
        renderAfiTable();
      });
    }

    // Reset Filter Button
    const resetBtn = document.getElementById('btnResetAfiFilter');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        state.afi.search = '';
        state.afi.month = 'all';
        state.afi.payment = 'all';
        state.afi.leasing = 'all';
        state.afi.pma = 'all';
        state.afi.sales = 'all';
        state.afi.page = 1;

        if (searchInput) searchInput.value = '';
        if (monthSelect) monthSelect.value = 'all';
        if (paymentSelect) paymentSelect.value = 'all';
        if (leasingSelect) leasingSelect.value = 'all';
        if (pmaSelect) pmaSelect.value = 'all';
        if (salesSelect) salesSelect.value = 'all';

        renderAfiTable();
        showToast('Filter Dashboard AFI telah direset.', 'info');
      });
    }

    // Export CSV Button
    const exportBtn = document.getElementById('btnExportAfiCsv');
    if (exportBtn) {
      exportBtn.addEventListener('click', exportAfiCsv);
    }

    // Refresh Button
    const refreshBtn = document.getElementById('btnRefreshAfi');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        renderAfiKpi();
        renderAfiCharts();
        renderAfiTable();
        showToast('Data Dashboard AFI Tim Ryan berhasil disegarkan!', 'success');
      });
    }

    renderAfiKpi();
  }

  function renderAfiKpi() {
    const afiData = (data && data.dashboardAfi) ? data.dashboardAfi : (window.RYAN_DATA ? window.RYAN_DATA.dashboardAfi : null);
    if (!afiData || !afiData.summary) return;

    const s = afiData.summary;
    const elTotal = document.getElementById('kpiAfiTotalDo');
    if (elTotal) elTotal.textContent = `${s.totalDo} Unit`;

    const elCredit = document.getElementById('kpiAfiCredit');
    if (elCredit) elCredit.textContent = `${s.totalCredit} Unit (${s.shareCredit})`;

    const elCash = document.getElementById('kpiAfiCash');
    if (elCash) elCash.textContent = `${s.totalCash} Unit (${s.shareCash})`;

    const elPma = document.getElementById('kpiAfiPma');
    if (elPma) elPma.textContent = `${s.totalPma} Unit (${s.sharePma})`;

    const elTopSales = document.getElementById('kpiAfiTopSales');
    if (elTopSales) elTopSales.textContent = `${s.topSalesName} (${s.topSalesUnits} Unit)`;
  }

  function renderAfiCharts() {
    const afiData = (data && data.dashboardAfi) ? data.dashboardAfi : (window.RYAN_DATA ? window.RYAN_DATA.dashboardAfi : null);
    if (!afiData) return;

    // 1. Chart Monthly Trend (Stacked Bar Kredit vs Cash)
    const monthlyEl = document.getElementById('chartAfiMonthly');
    if (monthlyEl) {
      const months = afiData.monthlyStats.map(m => m.month);
      const creditData = afiData.monthlyStats.map(m => m.credit);
      const cashData = afiData.monthlyStats.map(m => m.cash);

      if (state.charts.afiMonthly) {
        state.charts.afiMonthly.updateSeries([
          { name: 'Kredit (Leasing)', data: creditData },
          { name: 'Tunai (Cash)', data: cashData }
        ]);
      } else {
        const options = {
          chart: {
            type: 'bar',
            height: 320,
            stacked: true,
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif'
          },
          colors: ['#0284c7', '#10b981'],
          series: [
            { name: 'Kredit (Leasing)', data: creditData },
            { name: 'Tunai (Cash)', data: cashData }
          ],
          xaxis: {
            categories: months,
            labels: { style: { colors: 'var(--slate-500)', fontSize: '12px' } }
          },
          yaxis: {
            title: { text: 'Unit Delivery Order', style: { color: 'var(--slate-500)' } }
          },
          legend: { position: 'top', horizontalAlign: 'right' },
          dataLabels: {
            enabled: true,
            style: { fontSize: '11px', fontWeight: 600 }
          },
          plotOptions: {
            bar: {
              borderRadius: 4,
              columnWidth: '55%'
            }
          },
          tooltip: {
            shared: true,
            intersect: false,
            y: { formatter: (val) => `${val} Unit` }
          }
        };
        state.charts.afiMonthly = new ApexCharts(monthlyEl, options);
        state.charts.afiMonthly.render();
      }
    }

    // 2. Chart Leasing Composition (Donut)
    const leasingEl = document.getElementById('chartAfiLeasing');
    if (leasingEl) {
      const leasingSeries = afiData.leasingStats.map(l => l.count);
      const leasingLabels = afiData.leasingStats.map(l => `${l.leasing} (${l.count} Unit)`);

      if (state.charts.afiLeasing) {
        state.charts.afiLeasing.updateOptions({ labels: leasingLabels });
        state.charts.afiLeasing.updateSeries(leasingSeries);
      } else {
        const options = {
          chart: {
            type: 'donut',
            height: 320,
            fontFamily: 'Inter, sans-serif'
          },
          colors: ['#dc2626', '#0284c7', '#10b981', '#f59e0b', '#6b7280', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'],
          series: leasingSeries,
          labels: leasingLabels,
          legend: { position: 'bottom', fontSize: '12px' },
          plotOptions: {
            pie: {
              donut: {
                size: '65%',
                labels: {
                  show: true,
                  total: {
                    show: true,
                    label: 'Total DO',
                    formatter: () => `${afiData.summary.totalDo} Unit`
                  }
                }
              }
            }
          },
          dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(1)}%` },
          tooltip: {
            y: { formatter: (val) => `${val} Unit` }
          }
        };
        state.charts.afiLeasing = new ApexCharts(leasingEl, options);
        state.charts.afiLeasing.render();
      }
    }

    // 3. Chart Model Distribution (Top 10 Horizontal Bar)
    const modelEl = document.getElementById('chartAfiModel');
    if (modelEl) {
      const top10 = afiData.modelStats.slice(0, 10);
      const categories = top10.map(m => m.model);
      const seriesData = top10.map(m => m.count);

      if (state.charts.afiModel) {
        state.charts.afiModel.updateSeries([{ name: 'Unit Delivery', data: seriesData }]);
        state.charts.afiModel.updateOptions({ xaxis: { categories } });
      } else {
        const options = {
          chart: {
            type: 'bar',
            height: 320,
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif'
          },
          colors: ['#dc2626'],
          plotOptions: {
            bar: {
              horizontal: true,
              borderRadius: 4,
              barHeight: '65%'
            }
          },
          series: [{ name: 'Unit Delivery', data: seriesData }],
          xaxis: {
            categories: categories,
            labels: { style: { colors: 'var(--slate-500)', fontSize: '11px' } }
          },
          dataLabels: {
            enabled: true,
            formatter: (val) => `${val} Unit`,
            style: { fontSize: '11px', fontWeight: 600 }
          },
          tooltip: {
            y: { formatter: (val) => `${val} Unit` }
          }
        };
        state.charts.afiModel = new ApexCharts(modelEl, options);
        state.charts.afiModel.render();
      }
    }

    // 4. Chart Customer Segmentation & Acquisition (Distributed Bar)
    const segmentEl = document.getElementById('chartAfiSegment');
    if (segmentEl) {
      const combinedLabels = [
        'Profil: First Buyer',
        'Profil: Additional',
        'Profil: Replacement',
        'Sumber: Referensi',
        'Sumber: Live Medsos',
        'Sumber: Repeat Order (RO)',
        'Sumber: Pameran / Event'
      ];
      const combinedValues = [143, 91, 10, 121, 71, 38, 9];

      if (state.charts.afiSegment) {
        state.charts.afiSegment.updateSeries([{ name: 'Jumlah Konsumen', data: combinedValues }]);
      } else {
        const options = {
          chart: {
            type: 'bar',
            height: 320,
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif'
          },
          colors: ['#0284c7', '#38bdf8', '#93c5fd', '#10b981', '#059669', '#34d399', '#f59e0b'],
          plotOptions: {
            bar: {
              distributed: true,
              borderRadius: 4,
              columnWidth: '55%'
            }
          },
          series: [{ name: 'Jumlah Konsumen', data: combinedValues }],
          xaxis: {
            categories: combinedLabels,
            labels: {
              rotate: -20,
              style: { colors: 'var(--slate-600)', fontSize: '10.5px' }
            }
          },
          legend: { show: false },
          dataLabels: {
            enabled: true,
            formatter: (val) => `${val}`,
            style: { fontSize: '11px', fontWeight: 600 }
          },
          tooltip: {
            y: { formatter: (val) => `${val} Konsumen` }
          }
        };
        state.charts.afiSegment = new ApexCharts(segmentEl, options);
        state.charts.afiSegment.render();
      }
    }

    // 5. Chart Sales Leaderboard (Horizontal Stacked Bar Kredit & Cash)
    const salesEl = document.getElementById('chartAfiSales');
    if (salesEl) {
      const salesCategories = afiData.salesStats.map(s => s.salesPerson);
      const salesCredit = afiData.salesStats.map(s => s.credit);
      const salesCash = afiData.salesStats.map(s => s.cash);

      if (state.charts.afiSales) {
        state.charts.afiSales.updateSeries([
          { name: 'Kredit (Leasing)', data: salesCredit },
          { name: 'Tunai (Cash)', data: salesCash }
        ]);
        state.charts.afiSales.updateOptions({ yaxis: { categories: salesCategories } });
      } else {
        const options = {
          chart: {
            type: 'bar',
            height: 520,
            stacked: true,
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif'
          },
          colors: ['#0284c7', '#10b981'],
          plotOptions: {
            bar: {
              horizontal: true,
              borderRadius: 3,
              barHeight: '70%'
            }
          },
          series: [
            { name: 'Kredit (Leasing)', data: salesCredit },
            { name: 'Tunai (Cash)', data: salesCash }
          ],
          xaxis: {
            title: { text: 'Total Delivery Unit YTD 2026', style: { color: 'var(--slate-500)' } },
            labels: { style: { colors: 'var(--slate-500)', fontSize: '11px' } }
          },
          yaxis: {
            categories: salesCategories,
            labels: { style: { colors: 'var(--slate-700)', fontSize: '11.5px', fontWeight: 600 } }
          },
          legend: { position: 'top', horizontalAlign: 'right' },
          dataLabels: {
            enabled: true,
            formatter: (val) => val > 0 ? `${val}` : '',
            style: { fontSize: '10px', fontWeight: 600 }
          },
          tooltip: {
            shared: true,
            intersect: false,
            y: { formatter: (val) => `${val} Unit` }
          }
        };
        state.charts.afiSales = new ApexCharts(salesEl, options);
        state.charts.afiSales.render();
      }
    }
  }

  function getFilteredAfiRecords() {
    const afiData = (data && data.dashboardAfi) ? data.dashboardAfi : (window.RYAN_DATA ? window.RYAN_DATA.dashboardAfi : null);
    if (!afiData || !afiData.records) return [];

    let list = afiData.records;

    // Filter Search
    if (state.afi.search) {
      const q = state.afi.search;
      list = list.filter(r =>
        (r.customerName && r.customerName.toLowerCase().includes(q)) ||
        (r.salesPerson && r.salesPerson.toLowerCase().includes(q)) ||
        (r.model && r.model.toLowerCase().includes(q)) ||
        (r.variant && r.variant.toLowerCase().includes(q)) ||
        (r.leasing && r.leasing.toLowerCase().includes(q)) ||
        (r.city && r.city.toLowerCase().includes(q)) ||
        (r.chassis && r.chassis.toLowerCase().includes(q)) ||
        (r.spkNo && r.spkNo.toLowerCase().includes(q)) ||
        (r.invoiceNo && r.invoiceNo.toLowerCase().includes(q))
      );
    }

    // Filter Month
    if (state.afi.month && state.afi.month !== 'all') {
      list = list.filter(r => r.month.toLowerCase() === state.afi.month.toLowerCase());
    }

    // Filter Cara Bayar
    if (state.afi.payment && state.afi.payment !== 'all') {
      list = list.filter(r => r.paymentMethod === state.afi.payment);
    }

    // Filter Leasing
    if (state.afi.leasing && state.afi.leasing !== 'all') {
      list = list.filter(r => r.leasing === state.afi.leasing);
    }

    // Filter PMA
    if (state.afi.pma && state.afi.pma !== 'all') {
      list = list.filter(r => r.pma === state.afi.pma);
    }

    // Filter Sales
    if (state.afi.sales && state.afi.sales !== 'all') {
      list = list.filter(r => r.salesPerson === state.afi.sales);
    }

    return list;
  }

  function renderAfiTable() {
    const tableBody = document.getElementById('afiTableBody');
    if (!tableBody) return;

    const filtered = getFilteredAfiRecords();
    const total = filtered.length;

    // Update Showing Badge
    const badge = document.getElementById('afiShowingBadge');
    if (badge) {
      badge.textContent = `Menampilkan ${fmtNumber(total)} dari 244 Data AFI Tim Ryan`;
    }

    // Pagination calculations
    const pageSize = state.afi.pageSize;
    const totalPages = Math.ceil(total / pageSize) || 1;
    if (state.afi.page > totalPages) state.afi.page = totalPages;
    const page = state.afi.page;
    const startIndex = (page - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    if (paginated.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="12" style="text-align:center; padding:32px; color:var(--slate-400);">
            <i class="fa-solid fa-folder-open" style="font-size:32px; margin-bottom:8px;"></i>
            <p>Tidak ada data delivery AFI yang cocok dengan kriteria filter.</p>
          </td>
        </tr>
      `;
      const paginationEl = document.getElementById('afiPagination');
      if (paginationEl) paginationEl.innerHTML = '';
      return;
    }

    let rowsHtml = '';
    paginated.forEach((r, idx) => {
      const rowNo = startIndex + idx + 1;
      const paymentBadge = r.paymentMethod === 'KREDIT'
        ? '<span class="badge-status badge-kredit"><i class="fa-solid fa-credit-card"></i> Kredit</span>'
        : '<span class="badge-status badge-cash"><i class="fa-solid fa-money-bill"></i> Cash</span>';

      const leasingBadge = r.leasing === 'CASH'
        ? '<span style="color:var(--slate-500); font-size:12px;">-</span>'
        : `<span class="badge-status badge-leasing">${r.leasing}</span>`;

      const pmaBadge = r.pma === 'PMA'
        ? '<span class="badge-status badge-pma"><i class="fa-solid fa-circle-check"></i> PMA</span>'
        : '<span class="badge-status badge-nonpma">Non-PMA</span>';

      const refNo = r.spkNo || r.invoiceNo || '-';

      rowsHtml += `
        <tr>
          <td style="text-align:center; font-weight:600; color:var(--slate-500);">${rowNo}</td>
          <td><strong style="color:var(--slate-800);">${r.month} 2026</strong></td>
          <td>
            <div style="font-weight:700; color:var(--slate-900);">${r.customerName}</div>
            <small style="color:var(--slate-500); font-size:11px;">${r.pekerjaan || '-'}</small>
          </td>
          <td>
            <div style="font-weight:650; color:var(--slate-800);">${r.salesPerson}</div>
            <small style="color:var(--slate-400); font-size:10px;">SPV: FERYANTO</small>
          </td>
          <td>
            <div style="font-weight:700; color:var(--primary-red);">${r.model}</div>
            <small style="color:var(--slate-600); font-size:11px;">${r.variant}</small>
          </td>
          <td style="text-align:center;">${paymentBadge}</td>
          <td>${leasingBadge}</td>
          <td style="font-size:12px; color:var(--slate-700);">${r.city}</td>
          <td style="text-align:center;">${pmaBadge}</td>
          <td style="font-size:12px; color:var(--slate-700);">${r.sumberProspek}</td>
          <td><span style="font-size:11px; background:var(--slate-100); padding:3px 6px; border-radius:4px; font-weight:600; color:var(--slate-700);">${r.profilPembelian}</span></td>
          <td style="font-size:11px; font-family:monospace; color:var(--slate-600);">${refNo}</td>
        </tr>
      `;
    });

    tableBody.innerHTML = rowsHtml;

    // Render Pagination
    const paginationEl = document.getElementById('afiPagination');
    if (paginationEl) {
      renderPagination(paginationEl, page, totalPages, (newPage) => {
        state.afi.page = newPage;
        renderAfiTable();
      });
    }
  }

  function exportAfiCsv() {
    const list = getFilteredAfiRecords();
    if (!list || list.length === 0) {
      showToast('Tidak ada data AFI yang dapat diekspor.', 'warning');
      return;
    }

    const headers = [
      'No',
      'Bulan',
      'Tahun',
      'Nama Customer',
      'Pekerjaan',
      'Wiraniaga',
      'Supervisor',
      'Model',
      'Varian',
      'Cara Bayar',
      'Mitra Leasing',
      'Kota',
      'PMA',
      'Sumber Prospek',
      'Profil Pembelian',
      'Chassis',
      'No SPK',
      'No Invoice'
    ];

    const escapeCell = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    let csvContent = headers.join(',') + '\\n';

    list.forEach((r, idx) => {
      const row = [
        idx + 1,
        r.month,
        r.year || 2026,
        r.customerName,
        r.pekerjaan || '-',
        r.salesPerson,
        'FERYANTO',
        r.model,
        r.variant,
        r.paymentMethod,
        r.leasing,
        r.city,
        r.pma,
        r.sumberProspek,
        r.profilPembelian,
        r.chassis || '-',
        r.spkNo || '-',
        r.invoiceNo || '-'
      ];
      csvContent += row.map(escapeCell).join(',') + '\\n';
    });

    const filename = `Dashboard_AFI_2026_Tim_Ryan_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCsv(filename, csvContent);
    showToast(`Berhasil mengekspor ${list.length} data AFI Tim Ryan ke CSV!`, 'success');
  }

  // =========================================================================
  // SHARED PAGINATION COMPONENT
  // =========================================================================
  function renderPagination(container, currentPage, totalPages, onPageChange) {
    if (!container) return;
    if (totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    let html = '<div class="pagination" style="display:flex; gap:6px; align-items:center; justify-content:center; padding:12px;">';

    // Prev Button
    html += `
      <button type="button" class="btn-page ${currentPage === 1 ? 'disabled' : ''}" data-page="${currentPage - 1}" style="padding:4px 10px; border:1px solid var(--slate-300); border-radius:4px; background:#fff; cursor:pointer;" ${currentPage === 1 ? 'disabled' : ''}>
        &laquo;
      </button>
    `;

    // Pages numbers
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let p = startPage; p <= endPage; p++) {
      const active = p === currentPage;
      html += `
        <button type="button" class="btn-page ${active ? 'active' : ''}" data-page="${p}" style="padding:4px 10px; border:1px solid ${active ? 'var(--primary-red)' : 'var(--slate-300)'}; border-radius:4px; background:${active ? 'var(--primary-red)' : '#fff'}; color:${active ? '#fff' : 'var(--slate-700)'}; font-weight:${active ? '700' : '500'}; cursor:pointer;">
          ${p}
        </button>
      `;
    }

    // Next Button
    html += `
      <button type="button" class="btn-page ${currentPage === totalPages ? 'disabled' : ''}" data-page="${currentPage + 1}" style="padding:4px 10px; border:1px solid var(--slate-300); border-radius:4px; background:#fff; cursor:pointer;" ${currentPage === totalPages ? 'disabled' : ''}>
        &raquo;
      </button>
    `;

    html += '</div>';
    container.innerHTML = html;

    container.querySelectorAll('.btn-page').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.getAttribute('data-page'), 10);
        if (page >= 1 && page <= totalPages && page !== currentPage) {
          onPageChange(page);
        }
      });
    });
  }

  // =========================================================================
  // BOOTSTRAP INITIALIZATION
  // =========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    startClock();
    initSidebar();
    initOverview();
    initProspek();
    initActivity();
    initPenjualan();
    initFoa();
    initOlx();
    initWiraniaga();
    initSbi();
    initOneAccount();
    initAfi();

    // Check initial hash in URL
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById('pane-' + hash)) {
      switchTab(hash);
    }
  });

})();
