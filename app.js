// ==========================================
// 1. UTILITY FUNCTIONS (Modals & Toasts)
// ==========================================
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
    }
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
// 2. DARK MODE LOGIC (Persistent across pages)
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
        if (typeof showToast === "function") showToast('Dark Mode Enabled 🌙');
    } else {
        localStorage.setItem('geuNexusTheme', 'light');
        if (toggleBtn) toggleBtn.innerText = '🌙';
        if (typeof showToast === "function") showToast('Light Mode Enabled ☀️');
    }
}

// ==========================================
// 3. LOST & FOUND (LocalStorage & Handshake)
// ==========================================
function submitReport() {
    const nameInput = document.getElementById('reportName');
    const statusInput = document.getElementById('reportStatus');
    const locationInput = document.getElementById('reportLocation');

    if (!nameInput) {
        closeModal('reportModal');
        return;
    }

    const name = nameInput.value.trim();
    const status = statusInput.value;
    const loc = locationInput.value.trim() || 'Campus';
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    if (!name || status === "" || status === "Select...") {
        showToast('⚠️ Please enter an Item Name and Status.');
        return;
    }

    // SMART MATCH ALERT
    if (status === "Lost" && name.toLowerCase().includes("black dell laptop")) {
        alert("🚨 SMART MATCH ALERT: A Black Dell Laptop was recently reported as FOUND! Please check the Found board immediately.");
    }

    const newItem = { name: name, status: status, location: loc, date: date };
    let savedItems = JSON.parse(localStorage.getItem('geuNexusItems')) || [];
    savedItems.push(newItem);
    localStorage.setItem('geuNexusItems', JSON.stringify(savedItems));

    const grid = document.getElementById('itemGrid');
    if (grid) {
        grid.insertAdjacentHTML('afterbegin', createCardHTML(newItem));
    }

    closeModal('reportModal');
    showToast('Item saved to database successfully! 📬');
    
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

function claimItem(btnElement) {
    alert("✉️ An OTP has been sent to your registered GEU email address.");
    let pin = prompt("Enter the 4-digit PIN to verify handover:");
    if (pin === "1234") {
        const card = btnElement.closest('.card');
        const badge = card.querySelector('.badge');
        badge.className = 'badge badge-found';
        badge.style.background = '#16A34A'; 
        badge.style.color = 'white';
        badge.innerHTML = '✅ Claimed';
        btnElement.innerHTML = "Handover Verified";
        btnElement.className = "btn btn-outline";
        btnElement.style.pointerEvents = "none";
        btnElement.style.opacity = "0.5";
        showToast("✅ Verification successful! Item handed over securely.");
    } else if (pin !== null) {
        alert("❌ Incorrect PIN. Handover denied for security.");
    }
}

// ==========================================
// 4. MARKETPLACE (Photo Upload & Meetup)
// ==========================================
let currentUploadedPhoto = null;

function handlePhotoUpload(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentUploadedPhoto = e.target.result; 
            document.getElementById('photoPreview').innerHTML = `
                <img src="${currentUploadedPhoto}" style="max-height:120px; border-radius:8px; object-fit:contain;">
            `;
        }
        reader.readAsDataURL(file);
    }
}

function submitSmartListing() {
    const titleInput = document.getElementById('postTitle');
    const title = titleInput.value.toLowerCase();

    if (!currentUploadedPhoto) {
        showToast("⚠️ Please upload a photo for your listing!");
        const uploadBox = document.getElementById('photoPreview').parentElement;
        uploadBox.style.borderColor = 'var(--danger)';
        uploadBox.style.background = '#FEF2F2';
        setTimeout(() => {
            uploadBox.style.borderColor = 'var(--border)';
            uploadBox.style.background = 'var(--surface2)';
        }, 1500);
        return; 
    }

    if (title.includes('drafter')) {
        const wantToMessage = confirm("🚨 SMART MATCH: Wait! Aman from 1st Year just posted an urgent request looking for a Drafter.\n\nWould you like to message him directly instead of posting a new listing?");
        if (wantToMessage) {
            closeModal('postModal');
            showToast("Redirecting to chat with Aman K...");
            titleInput.value = ''; 
            return; 
        }
    }

    const imageHTML = `<img src="${currentUploadedPhoto}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">`;

    const newCard = `
      <div class="card filterable-card" data-tags="sell" style="animation: fadeUp 0.4s ease;">
        <div class="listing-img" style="padding:0; overflow:hidden;">
            ${imageHTML}
        </div>
        <span class="badge badge-sell" style="margin-bottom:6px;">Just Posted</span>
        <h3 style="font-size:15px;">${titleInput.value || 'New Item'}</h3>
        <div class="price-tag">₹ Check Details</div>
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:10px;">Newly listed item.</p>
        <p style="font-size:12px;color:var(--text-light);">👤 You</p>
        <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:12px;font-size:13px;" onclick="showToast('This is your listing!')">Manage Listing</button>
      </div>
    `;

    const grid = document.getElementById('marketGrid');
    if(grid) grid.insertAdjacentHTML('afterbegin', newCard);

    closeModal('postModal');
    showToast("Listing posted with photo! 🎉");
    titleInput.value = '';
    currentUploadedPhoto = null;
    document.getElementById('photoPreview').innerHTML = `
        <div style="font-size:28px; margin-bottom:8px;">📸</div>
        <span style="font-size:13px; color:var(--text-muted);">Click to upload an image of your item</span>
    `;
}

function openMeetup(sellerName, itemName) {
    document.getElementById('meetupSellerName').innerText = sellerName;
    document.getElementById('meetupDate').valueAsDate = new Date();
    document.getElementById('meetupTime').value = "16:00"; 
    openModal('meetupModal');
}

function sendMeetupInvite() {
    const loc = document.getElementById('meetupLocation').value;
    closeModal('meetupModal');
    alert(`✅ Secure Invite Sent!\n\nYou requested to meet at ${loc}. We will notify you once the seller confirms the time!`);
}

// ==========================================
// 5. PG LISTINGS (Live Google Sheet Fetch)
// ==========================================
const PG_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTlG_rrgZHXR_ZFpWfD5mIM95QeIYTB7vN8A23F6ibmPPR6AZ9iAm4W5T0VZl2zDfGlDkN3ESTNdqW-/pub?output=csv";

async function loadLivePGs() {
    const grid = document.getElementById('pgGrid');
    const count = document.getElementById('pgCount');
    if (!grid) return;

    try {
        const response = await fetch(PG_SHEET_CSV_URL);
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
            let genderClass = 'coed';
            let genderLabel = 'Co-ed';
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
            if (am.includes('laundry')) { tags.push('laundry'); amenityPills.push('🧺 Laundry'); }
            if (am.includes('parking')) { tags.push('parking'); amenityPills.push('🅿 Parking'); }
            if (am.includes('gym')) { tags.push('gym'); amenityPills.push('🏋️ Gym'); }

            const pillsHtml = amenityPills.map(p => `<span class="amenity-tag">${p}</span>`).join('');
            const icons = ['🏡', '🏘️', '🏠', '🏢'];
            const icon = icons[name.length % icons.length];

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
                <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:14px;font-size:13px;" onclick="showToast('Contact Owner: ${contact.replace(/'/g, "\\'")}')">Contact Owner</button>
              </div>
            `;
        });

        grid.innerHTML = html;
        if(count) count.innerText = `${dataRows.length} PGs listed`;
    } catch (error) {
        console.error("Error loading PGs:", error);
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:red;">❌ Failed to load live PG data. Ensure your Google Sheet is Published to the Web!</div>';
    }
}

// ==========================================
// 6. CAFE DIRECTORY (PRE-LOADED GEU SPOTS)
// ==========================================
const cafeDatabase = [
  { name: "Ravi Canteen", emoji: "☕", rating: "★★★★★", location: "Inside Campus", cost: "₹40–120", desc: "Popular for Maggi, samosa, and chai between lectures.", tags: ["walking", "fast-food", "top"], pills: ["Fast Food", "Snacks"] },
  { name: "Quick Bite Café", emoji: "🧋", rating: "★★★★☆", location: "Inside Campus", cost: "₹60–150", desc: "Quick snacks and cold coffee; ideal for short breaks.", tags: ["walking", "fast-food", "cafe", "good"], pills: ["Fast Food", "Beverages"] },
  { name: "Happiness Hut", emoji: "🍩", rating: "★★★★★", location: "Inside Campus", cost: "₹80–200", desc: "Known for shakes, desserts, and relaxed hangout vibe.", tags: ["walking", "cafe", "top"], pills: ["Desserts", "Beverages"] },
  { name: "Main Food Court", emoji: "🍱", rating: "★★★★☆", location: "Inside Campus", cost: "₹70–180", desc: "Multiple options for full meals within campus.", tags: ["walking", "north-indian", "fast-food", "good"], pills: ["North Indian", "Meals"] },
  { name: "Gupta Burger", emoji: "🍔", rating: "★★★★★", location: "Near GEU Main Gate", cost: "₹50–120", desc: "Budget-friendly burgers and fries; highly popular among students.", tags: ["near", "fast-food", "top"], pills: ["Street Food", "Burgers"] },
  { name: "Gupta's Cafe & Restaurant", emoji: "🍛", rating: "★★★★☆", location: "Opp. GEU Main Gate", cost: "₹120–250", desc: "Good for proper meals with quick service.", tags: ["near", "north-indian", "good"], pills: ["North Indian", "Meals"] },
  { name: "Cafe 7th Era", emoji: "🍕", rating: "★★★★★", location: "GEU Road", cost: "₹150–300", desc: "Trendy student café with good ambience.", tags: ["near", "cafe", "fast-food", "top"], pills: ["Cafe", "Ambience"] },
  { name: "Chill Bro Cafe", emoji: "🍟", rating: "★★★★☆", location: "GEU Road", cost: "₹120–250", desc: "Casual hangout spot with modern vibe.", tags: ["near", "cafe", "good"], pills: ["Cafe", "Snacks"] },
  { name: "Craving Crew Cafe", emoji: "🥪", rating: "★★★★☆", location: "Near University Area", cost: "₹120–250", desc: "Popular for group hangouts and quick meals.", tags: ["near", "cafe", "fast-food", "good"], pills: ["Hangout", "Fast Food"] },
  { name: "Lime Light Cafe", emoji: "🍝", rating: "★★★★☆", location: "Nearby Market", cost: "₹150–300", desc: "Stylish café with a good variety of food.", tags: ["near", "cafe", "good"], pills: ["Multi-cuisine", "Stylish"] },
  { name: "Arth Coffee House", emoji: "☕", rating: "★★★★★", location: "Main Road", cost: "₹150–350", desc: "Premium coffee experience with calm ambience.", tags: ["far", "cafe", "top"], pills: ["Coffee", "Premium"] },
  { name: "Jo Paji Paratha Corner", emoji: "🧈", rating: "★★★★★", location: "Prem Nagar", cost: "₹80–200", desc: "Famous for stuffed parathas and heavy meals.", tags: ["far", "north-indian", "top"], pills: ["Paratha", "North Indian"] },
  { name: "Bunkhouse Cafe", emoji: "🥗", rating: "★★★★☆", location: "Post Office Road", cost: "₹150–300", desc: "Cozy café with aesthetic interiors.", tags: ["far", "cafe", "good"], pills: ["Continental", "Aesthetic"] },
  { name: "Annie's Bakery", emoji: "🍰", rating: "★★★★★", location: "Party Junction", cost: "₹100–300", desc: "Known for cakes, pastries, and baked items.", tags: ["far", "cafe", "top"], pills: ["Bakery", "Desserts"] },
  { name: "Tamanna Cheesecake", emoji: "🧀", rating: "★★★★★", location: "Café Zone", cost: "₹150–350", desc: "Specializes in cheesecakes and dessert items.", tags: ["far", "cafe", "top"], pills: ["Cheesecake", "Desserts"] },
  { name: "The Waffle Co.", emoji: "🧇", rating: "★★★★☆", location: "Student Market", cost: "₹120–300", desc: "Sweet waffles and chocolate-based treats.", tags: ["far", "cafe", "good"], pills: ["Waffles", "Sweets"] },
  { name: "Chai Sutta Bar", emoji: "🍵", rating: "★★★★★", location: "Near University", cost: "₹50–150", desc: "Popular chain for chai, snacks, and student hangouts.", tags: ["near", "fast-food", "top"], pills: ["Chai", "Snacks"] },
  { name: "Gangchen Tibet Kitchen", emoji: "🥟", rating: "★★★★★", location: "Clement Town", cost: "₹150–300", desc: "Famous for authentic momos and thukpa.", tags: ["far", "chinese", "top"], pills: ["Tibetan", "Momos"] }
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
// 7. INITIALIZATION & PAGE LOAD LOGIC
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Theme
    initTheme();
    
    // 2. Load PG data if on the PGs page
    if (typeof loadLivePGs === 'function') {
        loadLivePGs();
    }
    
    // 3. Load Cafe data if on the Cafes page
    if (typeof renderCafes === 'function') {
        renderCafes();
    }

    // 4. Load Lost & Found Grid from LocalStorage
    const grid = document.getElementById('itemGrid');
    if (grid) {
        let savedItems = JSON.parse(localStorage.getItem('geuNexusItems')) || [];
        savedItems.forEach(item => {
            grid.insertAdjacentHTML('afterbegin', createCardHTML(item));
        });
    }

    // 5. Open the About Us modal automatically once per session/user
    if (!localStorage.getItem('aboutShown')) {
        openModal('aboutModal');
        localStorage.setItem('aboutShown', 'true');
    }
});