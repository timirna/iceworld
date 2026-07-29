/* ========================================================
   ICE WORLD ELECTRONICS — shared front-end logic
   Product catalog (live from backend/Sanity, with a demo
   fallback) + cart (localStorage) + Cash-on-Delivery checkout
   ======================================================== */

/* ---------- Backend config ---------------------------------------------
   Once you've deployed iwe-backend (see /iwe-backend/README.md) and
   iwe-cms (Sanity Studio), paste your live backend URL below, e.g.:
     const IWE_API_BASE = "https://iwe-backend.onrender.com";
   Until then, IWE_API_BASE stays empty and the site automatically shows
   the built-in demo products below so the site still works while you
   finish setting things up.
------------------------------------------------------------------------ */
const IWE_API_BASE = ""; // <-- paste your Render backend URL here

const IWE_PHONE_PRIMARY = "09613-244344";
const IWE_PHONE_TEL = "+8809613244344"; // used for tel: links

/* ---------- Demo/fallback catalog (used until IWE_API_BASE is set, or
   if the live API can't be reached) ---------- */
const IWE_DEMO_PRODUCTS = [
  {id:"tv-01",cat:"tv",icon:"📺",brand:"Samsung",name:'Samsung 55" Crystal 4K UHD Smart TV',price:68500,was:79900,rating:4.6,stock:true},
  {id:"tv-02",cat:"tv",icon:"📺",brand:"Walton",name:'Walton 43" Full HD Android TV',price:29900,was:null,rating:4.3,stock:true},
  {id:"tv-03",cat:"tv",icon:"📺",brand:"LG",name:'LG 65" NanoCell 4K Smart TV',price:112000,was:129000,rating:4.7,stock:true},
  {id:"ac-01",cat:"ac",icon:"❄️",brand:"General",name:"General 1.5 Ton Inverter Split AC",price:64500,was:71000,rating:4.5,stock:true},
  {id:"ac-02",cat:"ac",icon:"❄️",brand:"Gree",name:"Gree 1 Ton Non-Inverter Split AC",price:38900,was:null,rating:4.2,stock:true},
  {id:"ac-03",cat:"ac",icon:"❄️",brand:"Walton",name:"Walton 2 Ton Inverter Split AC",price:85900,was:94900,rating:4.4,stock:false},
  {id:"fridge-01",cat:"fridge",icon:"🧊",brand:"Samsung",name:"Samsung 253L Digital Inverter Fridge",price:52900,was:57900,rating:4.6,stock:true},
  {id:"fridge-02",cat:"fridge",icon:"🧊",brand:"Walton",name:"Walton 210L Direct Cool Refrigerator",price:26500,was:null,rating:4.1,stock:true},
  {id:"fridge-03",cat:"fridge",icon:"🧊",brand:"Jamuna",name:"Jamuna 320L Side-by-Side Fridge",price:69500,was:76000,rating:4.3,stock:true},
  {id:"wm-01",cat:"washer",icon:"🌀",brand:"Samsung",name:"Samsung 7kg Front Load Washing Machine",price:47900,was:52900,rating:4.5,stock:true},
  {id:"wm-02",cat:"washer",icon:"🌀",brand:"Vision",name:"Vision 8kg Top Load Washing Machine",price:31900,was:null,rating:4.0,stock:true},
  {id:"wm-03",cat:"washer",icon:"🌀",brand:"LG",name:"LG 9kg Inverter Front Load Washing Machine",price:58500,was:64900,rating:4.7,stock:true},
  {id:"oven-01",cat:"oven",icon:"🔥",brand:"Walton",name:"Walton 25L Microwave Oven with Grill",price:12900,was:14500,rating:4.2,stock:true},
  {id:"oven-02",cat:"oven",icon:"🔥",brand:"Samsung",name:"Samsung 32L Convection Microwave Oven",price:21500,was:null,rating:4.4,stock:true},
  {id:"dw-01",cat:"dishwasher",icon:"🍽️",brand:"Bosch",name:"Bosch 12-Place Freestanding Dishwasher",price:74900,was:82000,rating:4.6,stock:true},
  {id:"dryer-01",cat:"dryer",icon:"🌪️",brand:"Whirlpool",name:"Whirlpool 7kg Tumble Dryer",price:45500,was:49900,rating:4.3,stock:true},
  {id:"small-01",cat:"small",icon:"🔌",brand:"Walton",name:"Walton 1000W Electric Kettle",price:1850,was:2200,rating:4.1,stock:true},
  {id:"small-02",cat:"small",icon:"🔌",brand:"Miyako",name:"Miyako Blender & Grinder Combo",price:3450,was:null,rating:4.0,stock:true},
];

const IWE_CATEGORIES = [
  {key:"ac",icon:"❄️",label:"Air Conditioners"},
  {key:"fridge",icon:"🧊",label:"Refrigerators"},
  {key:"tv",icon:"📺",label:"TVs"},
  {key:"washer",icon:"🌀",label:"Washing Machines"},
  {key:"oven",icon:"🔥",label:"Ovens & Microwaves"},
  {key:"dishwasher",icon:"🍽️",label:"Dishwashers"},
  {key:"dryer",icon:"🌪️",label:"Dryers"},
];

const IWE_ICON_BY_CAT = {
  tv:"📺", ac:"❄️", fridge:"🧊", washer:"🌀",
  oven:"🔥", dishwasher:"🍽️", dryer:"🌪️", small:"🔌",
};

/* ---------- Live product catalog (populated on page load) ---------- */
let IWE_PRODUCTS_LIVE = [];
let IWE_USING_DEMO_DATA = true;

async function iweFetchProducts(){
  if(!IWE_API_BASE){
    IWE_USING_DEMO_DATA = true;
    IWE_PRODUCTS_LIVE = IWE_DEMO_PRODUCTS.slice();
    return IWE_PRODUCTS_LIVE;
  }
  try{
    const res = await fetch(`${IWE_API_BASE}/api/products`);
    if(!res.ok) throw new Error(`API returned ${res.status}`);
    const data = await res.json();
    IWE_PRODUCTS_LIVE = (data.products || []).map(p=>({
      id: p._id,
      cat: p.category,
      brand: p.brand || "",
      name: p.name,
      price: p.price,
      was: p.wasPrice || null,
      rating: p.rating || 4.5,
      stock: p.inStock !== false,
      imageUrl: p.imageUrl || null,
      icon: IWE_ICON_BY_CAT[p.category] || "📦",
      featured: !!p.featured,
    }));
    IWE_USING_DEMO_DATA = false;
    return IWE_PRODUCTS_LIVE;
  }catch(err){
    console.warn("Could not load live products, showing demo catalog instead:", err.message);
    IWE_USING_DEMO_DATA = true;
    IWE_PRODUCTS_LIVE = IWE_DEMO_PRODUCTS.slice();
    return IWE_PRODUCTS_LIVE;
  }
}

/* ---------- Currency ---------- */
function iweFormatBDT(n){
  return "৳" + Number(n||0).toLocaleString("en-IN");
}

/* ---------- Cart (localStorage) ---------- */
const IWE_CART_KEY = "iwe_cart";

function iweGetCart(){
  try{ return JSON.parse(localStorage.getItem(IWE_CART_KEY)) || []; }
  catch(e){ return []; }
}
function iweSaveCart(cart){
  localStorage.setItem(IWE_CART_KEY, JSON.stringify(cart));
  iweUpdateCartBadge();
}
function iweAddToCart(id, qty=1){
  const cart = iweGetCart();
  const existing = cart.find(i=>i.id===id);
  if(existing){ existing.qty += qty; }
  else{ cart.push({id, qty}); }
  iweSaveCart(cart);
  iweToast("Added to basket");
}
function iweRemoveFromCart(id){
  let cart = iweGetCart().filter(i=>i.id!==id);
  iweSaveCart(cart);
}
function iweSetQty(id, qty){
  let cart = iweGetCart();
  const item = cart.find(i=>i.id===id);
  if(item){
    item.qty = Math.max(1, qty);
    iweSaveCart(cart);
  }
}
function iweCartCount(){
  return iweGetCart().reduce((sum,i)=>sum+i.qty,0);
}
function iweUpdateCartBadge(){
  document.querySelectorAll(".cart-count").forEach(el=>{
    el.textContent = iweCartCount();
  });
}
function iweClearCart(){
  localStorage.removeItem(IWE_CART_KEY);
  iweUpdateCartBadge();
}

/* ---------- Toast ---------- */
function iweToast(msg){
  let toast = document.querySelector(".toast");
  if(!toast){
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>toast.classList.remove("show"), 2200);
}

/* ---------- Product card renderer ---------- */
function iweProductCardHTML(p){
  const stockBadge = p.stock ? '<span class="stock-badge">In stock</span>' : '<span class="stock-badge" style="background:#c0392b;">Out of stock</span>';
  const priceHTML = p.was
    ? `<span class="now">${iweFormatBDT(p.price)}</span><span class="was">${iweFormatBDT(p.was)}</span>`
    : `<span class="now">${iweFormatBDT(p.price)}</span>`;
  const media = p.imageUrl
    ? `<img src="${p.imageUrl}" alt="${p.name}" style="max-height:100%;max-width:100%;object-fit:contain;">`
    : (p.icon || "📦");
  return `
  <div class="product-card" data-cat="${p.cat}" data-price="${p.price}">
    <div class="product-media">${stockBadge}${media}</div>
    <div class="product-brand">${p.brand}</div>
    <div class="product-title">${p.name}</div>
    <div class="product-rating">★★★★★ <span style="color:var(--grey-600);">(${p.rating})</span></div>
    <div class="product-price">${priceHTML}</div>
    <button class="btn btn-primary btn-block" ${p.stock ? "" : "disabled style='opacity:.5;cursor:not-allowed;'"} onclick="iweAddToCart('${p.id}')">Add to Basket</button>
  </div>`;
}

/* ---------- Render helpers used by pages ---------- */
function iweRenderCategoryGrid(targetSelector){
  const el = document.querySelector(targetSelector);
  if(!el) return;
  el.innerHTML = IWE_CATEGORIES.map(c=>`
    <a class="cat-card" href="shop.html?cat=${c.key}">
      <div class="cat-icon">${c.icon}</div>
      <span>${c.label}</span>
    </a>`).join("");
}

function iweRenderFeaturedProducts(targetSelector, limit=8){
  const el = document.querySelector(targetSelector);
  if(!el) return;
  const withDeal = IWE_PRODUCTS_LIVE.filter(p=>p.was || p.featured);
  const list = (withDeal.length ? withDeal : IWE_PRODUCTS_LIVE).slice(0,limit);
  el.innerHTML = list.map(iweProductCardHTML).join("");
}

function iweRenderShopGrid(targetSelector){
  const el = document.querySelector(targetSelector);
  if(!el) return;
  const params = new URLSearchParams(window.location.search);
  const catFilter = params.get("cat");
  function draw(){
    const checked = Array.from(document.querySelectorAll(".cat-filter:checked")).map(c=>c.value);
    const sortVal = document.querySelector("#sortSelect") ? document.querySelector("#sortSelect").value : "";
    let list = IWE_PRODUCTS_LIVE.slice();
    if(checked.length){ list = list.filter(p=>checked.includes(p.cat)); }
    if(sortVal==="price-asc") list.sort((a,b)=>a.price-b.price);
    if(sortVal==="price-desc") list.sort((a,b)=>b.price-a.price);
    if(sortVal==="rating") list.sort((a,b)=>b.rating-a.rating);
    el.innerHTML = list.length ? list.map(iweProductCardHTML).join("") : '<p style="grid-column:1/-1;color:var(--grey-600);">No products match these filters.</p>';
    const countEl = document.querySelector("#resultCount");
    if(countEl) countEl.textContent = list.length;
  }
  document.querySelectorAll(".cat-filter").forEach(cb=>{
    if(catFilter && cb.value===catFilter) cb.checked = true;
    cb.addEventListener("change", draw);
  });
  const sortSelect = document.querySelector("#sortSelect");
  if(sortSelect) sortSelect.addEventListener("change", draw);
  draw();
}

/* ---------- Cart page renderer ---------- */
function iweRenderCartPage(){
  const wrap = document.querySelector("#cartContent");
  if(!wrap) return;
  const cart = iweGetCart();
  if(!cart.length){
    wrap.innerHTML = `
      <div class="empty-cart">
        <div class="icon">🛒</div>
        <h3>Your basket is empty</h3>
        <p style="color:var(--grey-600);margin-bottom:20px;">Looks like you haven't added anything yet.</p>
        <a href="shop.html" class="btn btn-primary">Start Shopping</a>
      </div>`;
    return;
  }
  let subtotal = 0;
  const rows = cart.map(item=>{
    const p = IWE_PRODUCTS_LIVE.find(x=>x.id===item.id);
    if(!p) return "";
    const lineTotal = p.price * item.qty;
    subtotal += lineTotal;
    const media = p.imageUrl ? `<img src="${p.imageUrl}" alt="" style="width:100%;height:100%;object-fit:contain;">` : (p.icon||"📦");
    return `
    <tr>
      <td>
        <div class="cart-item-info">
          <div class="thumb">${media}</div>
          <div>
            <div style="font-weight:600;">${p.name}</div>
            <div style="font-size:.78rem;color:var(--grey-600);">${p.brand}</div>
          </div>
        </div>
      </td>
      <td>${iweFormatBDT(p.price)}</td>
      <td>
        <div class="qty-control">
          <button onclick="iweSetQty('${p.id}', ${item.qty-1}); iweRenderCartPage();">−</button>
          <input type="text" readonly value="${item.qty}">
          <button onclick="iweSetQty('${p.id}', ${item.qty+1}); iweRenderCartPage();">+</button>
        </div>
      </td>
      <td>${iweFormatBDT(lineTotal)}</td>
      <td><a href="#" class="remove-link" onclick="iweRemoveFromCart('${p.id}'); iweRenderCartPage(); return false;">Remove</a></td>
    </tr>`;
  }).join("");

  const delivery = 0;
  const total = subtotal + delivery;

  wrap.innerHTML = `
    <div class="cart-layout">
      <div>
        <table class="cart-table">
          <thead><tr><th>Product</th><th>Price</th><th>Quantity</th><th>Total</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="summary-card">
        <h3 style="margin-top:0;color:var(--navy);">Order Summary</h3>
        <div class="summary-row"><span>Subtotal</span><span>${iweFormatBDT(subtotal)}</span></div>
        <div class="summary-row"><span>Delivery</span><span>${delivery===0?"Free":iweFormatBDT(delivery)}</span></div>
        <div class="summary-row total"><span>Total</span><span>${iweFormatBDT(total)}</span></div>

        <form id="iweCheckoutForm" style="margin-top:18px;">
          <div class="form-row">
            <label>Full Name</label>
            <input type="text" name="customerName" required>
          </div>
          <div class="form-row">
            <label>Phone Number</label>
            <input type="tel" name="phone" required>
          </div>
          <div class="form-row">
            <label>Delivery Address</label>
            <textarea name="address" required placeholder="House, road, area, city"></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-block">Place Order — Cash on Delivery</button>
          <p style="font-size:.75rem;color:var(--grey-600);margin-top:10px;">
            No online payment needed. We'll <strong>call ${IWE_PHONE_PRIMARY}→you</strong> shortly to confirm stock &amp; delivery time before dispatch.
          </p>
        </form>
        <div id="iweOrderResult"></div>
      </div>
    </div>`;

  const form = document.querySelector("#iweCheckoutForm");
  if(form){
    form.addEventListener("submit", iweHandleCheckoutSubmit);
  }
}

/* ---------- Checkout submit (Cash on Delivery, call to confirm) ---------- */
async function iweHandleCheckoutSubmit(e){
  e.preventDefault();
  const form = e.target;
  const resultEl = document.querySelector("#iweOrderResult");
  const submitBtn = form.querySelector('button[type="submit"]');
  const cart = iweGetCart();

  if(!cart.length){
    iweToast("Your basket is empty");
    return;
  }

  const payload = {
    customerName: form.customerName.value,
    phone: form.phone.value,
    address: form.address.value,
    items: cart.map(item=>{
      const p = IWE_PRODUCTS_LIVE.find(x=>x.id===item.id) || {};
      return {productId: item.id, name: p.name, price: p.price, qty: item.qty};
    }),
  };

  submitBtn.disabled = true;
  submitBtn.textContent = "Placing order…";

  try{
    if(!IWE_API_BASE){
      throw new Error("Backend not configured yet");
    }
    const res = await fetch(`${IWE_API_BASE}/api/orders`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if(!res.ok){ throw new Error(data.error || "Could not place order"); }

    iweClearCart();
    form.style.display = "none";
    resultEl.innerHTML = `
      <div style="background:var(--grey-100);border-radius:8px;padding:18px;margin-top:16px;">
        <p style="font-weight:700;color:var(--navy);margin:0 0 6px;">Order placed! 🎉</p>
        <p style="font-size:.88rem;margin:0 0 14px;">${data.message || "We'll call you shortly to confirm before dispatch."}</p>
        <a href="tel:${IWE_PHONE_TEL}" class="btn btn-primary btn-block">Call Us Now to Confirm</a>
      </div>`;
  }catch(err){
    submitBtn.disabled = false;
    submitBtn.textContent = "Place Order — Cash on Delivery";
    resultEl.innerHTML = `
      <div style="background:#fdecea;border-radius:8px;padding:14px;margin-top:14px;color:#8a1f11;font-size:.85rem;">
        Couldn't submit your order automatically (${err.message}). Please call us directly at
        <a href="tel:${IWE_PHONE_TEL}" style="font-weight:700;color:#8a1f11;">${IWE_PHONE_PRIMARY}</a> and we'll take your order over the phone.
      </div>`;
  }
}

/* ---------- Hero banner slider (auto-rotating offer slides) ---------- */
let iweSlideIndex = 0;
let iweSlideTimer = null;

function iweGoToSlide(i){
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".hero-dot");
  if(!slides.length) return;
  iweSlideIndex = (i + slides.length) % slides.length;
  slides.forEach(s=>s.classList.remove("active"));
  dots.forEach(d=>d.classList.remove("active"));
  slides[iweSlideIndex].classList.add("active");
  if(dots[iweSlideIndex]) dots[iweSlideIndex].classList.add("active");
  iweRestartSlideTimer();
}

function iweRestartSlideTimer(){
  clearInterval(iweSlideTimer);
  const slides = document.querySelectorAll(".hero-slide");
  if(slides.length < 2) return;
  iweSlideTimer = setInterval(()=>{ iweGoToSlide(iweSlideIndex+1); }, 2500);
}

function iweInitHeroSlider(){
  if(!document.querySelector(".hero-slider")) return;
  iweRestartSlideTimer();
}

/* ---------- Carousel scroll helper ---------- */
function iweScrollCarousel(id, dir){
  const track = document.getElementById(id);
  if(!track) return;
  const amount = Math.min(track.clientWidth * 0.8, 600) * dir;
  track.scrollBy({left: amount, behavior: "smooth"});
}

/* ---------- Nav toggle ---------- */
function iweInitNavToggle(){
  const btn = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if(btn && nav){
    btn.addEventListener("click", ()=> nav.classList.toggle("open"));
  }
}

/* ---------- Init on load ---------- */
document.addEventListener("DOMContentLoaded", async ()=>{
  iweUpdateCartBadge();
  iweInitNavToggle();
  iweInitHeroSlider();

  await iweFetchProducts();

  iweRenderCategoryGrid("#categoryGrid");
  iweRenderFeaturedProducts("#featuredGrid");
  iweRenderShopGrid("#shopGrid");
  iweRenderCartPage();

  if(IWE_USING_DEMO_DATA && IWE_API_BASE){
    iweToast("Showing demo products — check your backend connection");
  }

  // Generic form intercept for non-checkout forms (newsletter, contact, quote)
  // -> friendly confirmation. The basket checkout form is handled separately
  // by iweHandleCheckoutSubmit above.
  document.querySelectorAll("form[data-iwe-form]").forEach(form=>{
    form.addEventListener("submit", e=>{
      e.preventDefault();
      iweToast("Thanks! We received your request and will contact you shortly.");
      form.reset();
    });
  });
});
