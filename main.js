/* ========================================================
   ICE WORLD ELECTRONICS — shared front-end logic
   Product catalog + cart (localStorage) + small UI helpers
   ======================================================== */

/* ---------- Product catalog ---------- */
const IWE_PRODUCTS = [
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

/* ---------- Currency ---------- */
function iweFormatBDT(n){
  return "৳" + n.toLocaleString("en-IN");
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
  return `
  <div class="product-card" data-cat="${p.cat}" data-price="${p.price}">
    <div class="product-media">${stockBadge}${p.icon}</div>
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
  const list = IWE_PRODUCTS.filter(p=>p.was).slice(0,limit);
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
    let list = IWE_PRODUCTS.slice();
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
    const p = IWE_PRODUCTS.find(x=>x.id===item.id);
    if(!p) return "";
    const lineTotal = p.price * item.qty;
    subtotal += lineTotal;
    return `
    <tr>
      <td>
        <div class="cart-item-info">
          <div class="thumb">${p.icon}</div>
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

  const delivery = subtotal > 0 ? 0 : 0;
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
        <a href="contact.html" class="btn btn-primary btn-block" style="margin-top:16px;">Request Order Callback</a>
        <p style="font-size:.75rem;color:var(--grey-600);margin-top:10px;">Our team will call to confirm stock, delivery time & payment (Cash on Delivery / bKash / Card).</p>
      </div>
    </div>`;
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
document.addEventListener("DOMContentLoaded", ()=>{
  iweUpdateCartBadge();
  iweInitNavToggle();
  iweRenderCategoryGrid("#categoryGrid");
  iweRenderFeaturedProducts("#featuredGrid");
  iweRenderShopGrid("#shopGrid");
  iweRenderCartPage();

  // Generic form intercept (no backend) -> friendly confirmation
  document.querySelectorAll("form[data-iwe-form]").forEach(form=>{
    form.addEventListener("submit", e=>{
      e.preventDefault();
      iweToast("Thanks! We received your request and will contact you shortly.");
      form.reset();
    });
  });
});
