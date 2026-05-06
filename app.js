// ==========================================
// 0. SMART AUTH SHIELD & LOGOUT 🛡️
// ==========================================
const isLoginPage = window.location.href.includes('login.html');

// If user has no badge, and they are NOT on the login page, kick them to login
if (!localStorage.getItem('geuNexusAuth') && !isLoginPage) {
    window.location.replace('login.html');
}

// Global Logout Handler
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.getAttribute('href') === 'login.html') {
        localStorage.removeItem('geuNexusAuth');
    }
});

// ==========================================
// 1. UTILITY FUNCTIONS (Modals & Toasts)
// ==========================================
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'flex';
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = '#333';
    toast.style.color = 'white';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '8px';
    toast.style.zIndex = '1000';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    toast.innerText = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// ==========================================
// 2. DARK MODE LOGIC
// ==========================================
function initTheme() {
    const savedTheme = localStorage.getItem('geuNexusTheme');
    const toggleBtn = document.getElementById('themeToggle');

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        if (toggleBtn) toggleBtn.innerText = '☀️';
    } else {
        document.body.classList.remove('dark-theme');
        if (toggleBtn) toggleBtn.innerText = '🌙';
    }
}

function toggleTheme() {
    const body = document.body;
    const toggleBtn = document.getElementById('themeToggle');

    body.classList.toggle('dark-theme');

    if (body.classList.contains('dark-theme')) {
        localStorage.setItem('geuNexusTheme', 'dark');
        if (toggleBtn) toggleBtn.innerText = '☀️';
        showToast('Dark Mode Enabled 🌙');
    } else {
        localStorage.setItem('geuNexusTheme', 'light');
        if (toggleBtn) toggleBtn.innerText = '🌙';
        showToast('Light Mode Enabled ☀️');
    }
}

// ==========================================
// 3. LOST & FOUND (LocalStorage)
// ==========================================
function submitReport() {
    const nameInput = document.getElementById('reportName');
    const statusInput = document.getElementById('reportStatus');
    const locationInput = document.getElementById('reportLocation');

    if (!nameInput) { closeModal('reportModal'); return; }

    const name = nameInput.value.trim();
    const status = statusInput.value;
    const loc = locationInput.value.trim() || 'Campus';
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    if (!name || status === "" || status === "Select...") {
        showToast('⚠️ Please enter an Item Name and Status.');
        return;
    }

    if (status === "Lost" && name.toLowerCase().includes("black dell laptop")) {
        alert("🚨 SMART MATCH ALERT: A Black Dell Laptop was recently reported as FOUND! Please check the Found board immediately.");
    }

    const newItem = { name: name, status: status, location: loc, date: date };
    let savedItems = JSON.parse(localStorage.getItem('geuNexusItems')) || [];
    savedItems.push(newItem);
    localStorage.setItem('geuNexusItems', JSON.stringify(savedItems));

    const grid = document.getElementById('itemGrid');
    if (grid) grid.insertAdjacentHTML('afterbegin', createCardHTML(newItem));

    closeModal('reportModal');
    showToast('Item saved successfully! 📬');
    
    nameInput.value = ''; statusInput.value = ''; locationInput.value = '';
}

function createCardHTML(item) {
    const isLost = item.status === "Lost";
    const badgeClass = isLost ? "badge-lost" : "badge-found";
    const icon = isLost ? "❓" : "✅";
    
    return `
      <div class="card filterable-card" data-tags="${item.status.toLowerCase()}" style="animation: fadeUp 0.4s ease;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
          <div style="font-size:32px;">${icon}</div>
          <span class="badge ${badgeClass}">${item.status}</span>
        </div>
        <h3 style="font-size:16px;margin-bottom:4px;">${item.name}</h3>
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:12px;">Reported just now.</p>
        <div style="font-size:12px;color:var(--text-light);display:flex;flex-direction:column;gap:4px;">
          <span>📍 ${item.location}</span>
          <span>📅 ${item.date}</span>
        </div>
        <button class="btn btn-outline" style="width:100%;justify-content:center;margin-top:14px;font-size:13px;" onclick="showToast('Contact info copied!')">Contact ${isLost ? 'Owner' : 'Finder'}</button>
      </div>
    `;
}

// ==========================================
// 4. LIVE MARKETPLACE (Google Sheets)
// ==========================================
const MARKETPLACE_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRp1sH0n533NVGCrmx7C3m_6o38XDmzZEd33qnzIABvTHoOQLky3g3yZX2CFzpum2U2pSvF1gI1s4nE/pub?output=csv";

async function loadLiveMarketplace() {
    const grid = document.getElementById('marketGrid');
    const count = document.getElementById('marketCount');
    if (!grid) return;

    try {
        const fetchUrl = MARKETPLACE_CSV_URL + '&t=' + new Date().getTime(); // Cache buster
        const response = await fetch(fetchUrl);
        const csvText = await response.text();
        
        const rows = csvText.split('\n').map(row => row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/));
        const dataRows = rows.slice(1).filter(r => r.length > 1);

        if (dataRows.length === 0) {
            grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">No items listed yet! Be the first to post.</div>';
            if(count) count.innerText = "0 active listings";
            return;
        }

        let html = '';

        dataRows.forEach(row => {
            const clean = (str) => (str || '').replace(/^"|"$/g, '').trim();
            
            const fullName = clean(row[1]) || 'Anonymous Student';
            const title = clean(row[3]) || 'Item';
            const type = clean(row[4]) || 'For Sale';
            const condition = clean(row[5]) || 'Brand New';
            const priceStr = clean(row[6]) || '0';
            const category = clean(row[8]) || 'other';
            const desc = clean(row[9]) || '';
            const contact = clean(row[10]) || '';
            const imageLink = clean(row[11]) || '';
            const isMystery = clean(row[12]) && clean(row[12]).toLowerCase().includes('yes');

            const tags = [];
            let badgeHTML = '';
            let priceSuffix = '';
            let displayImg = imageLink ? `<img src="${imageLink}" style="width:100%;height:100%;object-fit:cover;">` : '<div style="font-size: 48px; padding-top: 20px;">📦</div>';
            let cardBorder = '';

            const typeLower = type.toLowerCase();
            
            if (typeLower.includes('bounty') || typeLower.includes('urgent')) {
                tags.push('bounty');
                badgeHTML = `<span class="badge badge-request" style="animation: pulse 2s infinite;">🚨 Midnight Bounty</span>`;
                cardBorder = 'border: 2px solid #FCA5A5; background: #FEF2F2;';
            } else if (typeLower.includes('bundle')) {
                tags.push('bundle');
                badgeHTML = `<span class="badge badge-bundle">📦 Senior Bundle</span>`;
                cardBorder = 'border: 2px solid #C7D2FE;';
            } else if (typeLower.includes('rent')) {
                tags.push('rental');
                badgeHTML = `<span class="badge" style="background:#FEF3C7; color:#D97706;">⏳ Rental</span>`;
                priceSuffix = ' <span style="font-size: 13px; font-weight: normal; color: var(--text-muted);">/ day</span>';
            } else if (typeLower.includes('free') || typeLower.includes('donate')) {
                tags.push('donate');
                badgeHTML = `<span class="badge" style="background:#DCFCE7; color:#16A34A;">🎁 Free / Donate</span>`;
            } else {
                tags.push('sell');
                badgeHTML = `<span class="badge badge-sell">🛒 For Sale</span>`;
            }

            if (isMystery) {
                tags.push('mystery');
                badgeHTML += ` <span class="badge" style="background:#E879F9; color:#fff; border: none;">✨ Mystery Item</span>`;
                displayImg = '<div style="font-size: 56px; padding-top: 20px; text-shadow: 0 4px 10px rgba(0,0,0,0.1);">🎁❓</div>';
                cardBorder = 'border: 2px dashed #E879F9; background: #FDF4FF;';
            }

            if (category.toLowerCase().includes('book')) tags.push('books');
            if (category.toLowerCase().includes('electronic')) tags.push('electronics');
            if (category.toLowerCase().includes('furnish') || category.toLowerCase().includes('gear')) tags.push('furniture');
            else tags.push('other');

            if (condition.toLowerCase().includes('new')) tags.push('new');
            if (condition.toLowerCase().includes('gently') || condition.toLowerCase().includes('lightly')) tags.push('lightly');
            if (condition.toLowerCase().includes('heavily')) tags.push('heavily');

            let priceHTML = `₹ ${priceStr}${priceSuffix}`;
            if (parseInt(priceStr, 10) === 0 || typeLower.includes('donate')) {
                priceHTML = `<span style="color:var(--success);">Free</span>`;
            }

            html += `
              <div class="card filterable-card" data-tags="${tags.join(' ')}" style="${cardBorder}">
                <div class="listing-img" style="overflow: hidden; padding: 0;">
                  ${displayImg}
                </div>
                <div style="margin-bottom: 8px;">${badgeHTML}</div>
                <h3 style="font-size:15px; margin-bottom: 4px;">${isMystery ? "Mystery Box: Take a guess!" : title}</h3>
                <div class="price-tag">${priceHTML}</div>
                <p style="font-size:13px;color:var(--text-muted);margin-bottom:10px;">${desc}</p>
                <p style="font-size:12px;color:var(--text-light);">👤 ${fullName}</p>
                <div style="display:flex; gap: 8px; margin-top: 12px;">
                  <a href="https://wa.me/91${contact}?text=Hi, I saw your listing for '${title}' on GEU Nexus. Is it still available?" target="_blank" class="btn btn-primary" style="flex: 1; justify-content: center; font-size: 13px; background: #25D366; color: white; border: none;">💬 WhatsApp</a>
                </div>
              </div>
            `;
        });
        
        grid.innerHTML = html;
        if(count) count.innerText = `${dataRows.length} active listings`;
    } catch (e) {
        console.error("Failed to load marketplace data:", e);
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:red;">❌ Failed to load live marketplace data. Check your Google Sheet URL.</div>';
    }
}

function filterMarketplace() {
    const input = document.getElementById('marketSearch').value.toLowerCase();
    const cards = document.querySelectorAll('.filterable-card');
    cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(input) ? 'block' : 'none';
    });
}

// ==========================================
// 5. LIVE PG LISTINGS (Google Sheets)
// ==========================================
const PG_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTlG_rrgZHXR_ZFpWfD5mIM95QeIYTB7vN8A23F6ibmPPR6AZ9iAm4W5T0VZl2zDfGlDkN3ESTNdqW-/pub?output=csv";

async function loadLivePGs() {
    const grid = document.getElementById('pgGrid');
    const count = document.getElementById('pgCount');
    if (!grid) return;

    try {
        const response = await fetch(PG_SHEET_CSV_URL + '&t=' + new Date().getTime());
        const csvText = await response.text();
        const rows = csvText.split('\n').map(row => row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/));
        const dataRows = rows.slice(1).filter(r => r.length > 1);

        let html = '';
        dataRows.forEach(row => {
            const clean = (str) => (str || '').replace(/^"|"$/g, '').trim();
            const name = clean(row[1]) || 'Unnamed PG';
            const genderType = clean(row[2]) || 'Co-ed';
            const rentStr = clean(row[3]) || '0';
            const location = clean(row[4]) || 'Near Campus';
            const amenitiesStr = clean(row[5]) || '';
            const desc = clean(row[6]) || 'Available for students.';
            const contact = clean(row[7]) || 'DM for details';

            const rent = parseInt(rentStr.replace(/[^0-9]/g, ''), 10) || 0;
            const tags = [];
            let genderClass = 'coed'; let genderLabel = 'Co-ed';
            if (genderType.toLowerCase().includes('boy')) { tags.push('boys'); genderClass = 'boys'; genderLabel = 'Boys'; }
            else if (genderType.toLowerCase().includes('girl')) { tags.push('girls'); genderClass = 'girls'; genderLabel = 'Girls'; }
            else { tags.push('coed'); }

            if (rent > 0 && rent < 5000) tags.push('budget');
            else if (rent >= 5000 && rent <= 7000) tags.push('mid');
            else if (rent > 7000) tags.push('premium');

            const amenityPills = [];
            const am = amenitiesStr.toLowerCase();
            if (am.includes('wifi')) { tags.push('wifi'); amenityPills.push('📶 WiFi'); }
            if (am.includes('meal')) { tags.push('meals'); amenityPills.push('🍽 Meals'); }
            if (am.includes('ac')) { tags.push('ac'); amenityPills.push('❄️ AC'); }

            const pillsHtml = amenityPills.map(p => `<span class="amenity-tag">${p}</span>`).join('');
            const icon = ['🏡', '🏘️', '🏠', '🏢'][name.length % 4];

            html += `
              <div class="card filterable-card" data-tags="${tags.join(',')}">
                <div class="pg-img">${icon}</div>
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
                  <h3 style="font-size:16px;">${name}</h3>
                  <span class="gender-badge ${genderClass}">${genderLabel}</span>
                </div>
                <div class="rent-tag">₹${rent.toLocaleString('en-IN')} <span>/ month</span></div>
                <p style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">📍 ${location}</p>
                <p style="font-size:13px;color:var(--text-muted);margin-bottom:10px;">${desc}</p>
                <div>${pillsHtml}</div>
                <div style="display:flex; gap: 8px; margin-top: 14px;">
                  <a href="https://wa.me/91${contact}?text=Hi, I saw your PG '${name}' on GEU Nexus. Is there a room available?" target="_blank" class="btn btn-primary" style="flex: 1; justify-content: center; font-size: 13px; background: #25D366; color: white; border: none;">💬 WhatsApp</a>
                </div>
              </div>
            `;
        });
        grid.innerHTML = html;
        if(count) count.innerText = `${dataRows.length} PGs listed`;
    } catch (error) { grid.innerHTML = '<div style="color:red;text-align:center;padding:40px;">❌ Failed to load PG data.</div>'; }
}

// ==========================================
// 6. CAFE DIRECTORY
// ==========================================
let cafeDatabase = [
  { name: "Ravi Canteen", emoji: "☕", rating: "★★★★★", location: "Inside Campus", cost: "₹40–120", desc: "Popular for Maggi, samosa, and chai between lectures.", tags: ["walking", "fast-food", "top"], pills: ["Fast Food", "Snacks"] },
  { name: "Quick Bite Café", emoji: "🧋", rating: "★★★★☆", location: "Inside Campus", cost: "₹60–150", desc: "Quick snacks and cold coffee.", tags: ["walking", "fast-food", "cafe", "good"], pills: ["Fast Food", "Beverages"] },
  { name: "Happiness Hut", emoji: "🍩", rating: "★★★★★", location: "Inside Campus", cost: "₹80–200", desc: "Known for shakes and relaxed hangout vibe.", tags: ["walking", "cafe", "top"], pills: ["Desserts", "Beverages"] },
  { name: "Gupta Burger", emoji: "🍔", rating: "★★★★★", location: "Near GEU Main Gate", cost: "₹50–120", desc: "Budget-friendly burgers and fries.", tags: ["near", "fast-food", "top"], pills: ["Street Food", "Burgers"] },
  { name: "Cafe 7th Era", emoji: "🍕", rating: "★★★★★", location: "GEU Road", cost: "₹150–300", desc: "Trendy student café with good ambience.", tags: ["near", "cafe", "fast-food", "top"], pills: ["Cafe", "Ambience"] }
];

function renderCafes() {
  const grid = document.getElementById('cafeGrid');
  const count = document.getElementById('cafeCount');
  if (!grid) return;

  if (count) count.innerText = `${cafeDatabase.length} cafes listed`;

  let html = '';
  cafeDatabase.forEach(cafe => {
    let pillsHtml = cafe.pills.map(pill => `<span class="tag-pill">${pill}</span>`).join('');
    
    html += `
      <div class="card filterable-card" data-tags="${cafe.tags.join(',')}">
        <div class="cafe-img">${cafe.emoji}</div>
        <h3 style="font-size:16px;">${cafe.name}</h3>
        <div class="stars">${cafe.rating}</div>
        <div class="cafe-meta">
          <span>📍 ${cafe.location}</span>
          <span>💰 ${cafe.cost}</span>
        </div>
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:10px;">${cafe.desc}</p>
        <div>${pillsHtml}</div>
        <a href="http://googleusercontent.com/maps.google.com/?q=${encodeURIComponent(cafe.name + ' Dehradun')}" target="_blank" class="btn btn-outline" style="width:100%;justify-content:center;margin-top:14px;font-size:13px;">View on Map 📍</a>
      </div>
    `;
  });

  grid.innerHTML = html;
}

// ==========================================
// 7. FILTER SECTIONS
// ==========================================
function filterCards() {
    const cards = document.querySelectorAll('.filterable-card');
    const selectedRadios = document.querySelectorAll('.filter-radio:checked');
    const selectedCbs = document.querySelectorAll('.filter-cb:checked');

    cards.forEach(card => {
        let show = true;
        const tags = (card.getAttribute('data-tags') || '').toLowerCase().replace(/,/g, ' ');

        selectedRadios.forEach(radio => {
            if (radio.value !== 'all') {
                const tagsArray = tags.split(/\s+/);
                if (!tagsArray.includes(radio.value.toLowerCase())) show = false;
            }
        });

        selectedCbs.forEach(cb => {
            const tagsArray = tags.split(/\s+/);
            if (!tagsArray.includes(cb.value.toLowerCase())) show = false;
        });

        card.style.display = show ? 'block' : 'none';
    });
}

// ==========================================
// 8. INITIALIZATION ON LOAD
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();

    if (typeof loadLivePGs === 'function' && document.getElementById('pgGrid')) loadLivePGs();
    if (typeof loadLiveMarketplace === 'function' && document.getElementById('marketGrid')) loadLiveMarketplace();
    if (document.getElementById('cafeGrid')) renderCafes();

    const grid = document.getElementById('itemGrid');
    if (grid) {
        let savedItems = JSON.parse(localStorage.getItem('geuNexusItems')) || [];
        savedItems.forEach(item => grid.insertAdjacentHTML('afterbegin', createCardHTML(item)));
    }

    if (!localStorage.getItem('aboutShown') && document.getElementById('aboutModal')) {
        openModal('aboutModal');
        localStorage.setItem('aboutShown', 'true');
    }

    const filterInputs = document.querySelectorAll('.filter-radio, .filter-cb');
    filterInputs.forEach(input => input.addEventListener('change', filterCards));
});