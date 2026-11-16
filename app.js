(()=>{
"use strict";
const KEY="nutritrack-v1";
const defaults={goals:{calories:2000,sugar:50,sodium:2300,protein:100,carbs:250,fat:70,weight:null},foods:[],weights:[],saved:[]};
let state=load();
function load(){try{return {...structuredClone(defaults),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch(e){return structuredClone(defaults)}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const today=()=>new Date().toLocaleDateString("en-CA");
const fmt=n=>Math.round(Number(n)||0).toLocaleString("en-US");
const num=(v)=>Math.max(0,Number(v)||0);
const safe=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
$("#todayLabel").textContent=new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"});
$("#foodDate").value=today(); $("#weightForm [name=date]").value=today();
function entries(date){return state.foods.filter(x=>x.date===date)}
function totals(list){return list.reduce((a,x)=>{["calories","sugar","sodium","protein","carbs","fat"].forEach(k=>a[k]+=num(x[k]));return a},{calories:0,sugar:0,sodium:0,protein:0,carbs:0,fat:0})}
function setBar(id,val,goal){$(id).style.width=(goal>0?Math.min(100,val/goal*100):0)+"%"}
function render(){
 const t=totals(entries(today())),g=state.goals;
 $("#dashCalories").textContent=fmt(t.calories);$("#dashSugar").textContent=t.sugar.toFixed(1)+" g";$("#dashSodium").textContent=fmt(t.sodium)+" mg";
 $("#calorieGoalText").textContent=`of ${fmt(g.calories)} kcal goal`;$("#sugarGoalText").textContent=`of ${fmt(g.sugar)} g limit`;$("#sodiumGoalText").textContent=`of ${fmt(g.sodium)} mg limit`;
 setBar("#calorieBar",t.calories,g.calories);setBar("#sugarBar",t.sugar,g.sugar);setBar("#sodiumBar",t.sodium,g.sodium);
 ["protein","carbs","fat"].forEach(k=>{$("#"+(k==="carbs"?"carb":"")+(k==="carbs"?"Text":k+"Text")).textContent=t[k].toFixed(1)+" g";});
 setBar("#proteinBar",t.protein,g.protein);setBar("#carbBar",t.carbs,g.carbs);setBar("#fatBar",t.fat,g.fat);
 const ws=[...state.weights].sort((a,b)=>a.date.localeCompare(b.date));const latest=ws.at(-1),first=ws[0];
 $("#dashWeight").textContent=latest?latest.weight.toFixed(1)+" lb":"—";
 $("#weightChange").textContent=latest&&first&&latest!==first?`${(latest.weight-first.weight)>0?"+":""}${(latest.weight-first.weight).toFixed(1)} lb since first entry`:"Add weigh-ins to see change";
 $("#goalWeightDisplay").textContent=g.weight?g.weight+" lb":"Not set";
 $("#totalWeightChange").textContent=latest&&first?`${latest.weight-first.weight>0?"+":""}${(latest.weight-first.weight).toFixed(1)} lb`:"—";
 $("#entryCount").textContent=entries(today()).length+" entries";
 renderMeals("#todayMeals",entries(today()),true);
 renderMeals("#savedFoods",state.saved,false);
 renderWeights();renderCharts();
}
function renderMeals(target,list,group){
 const el=$(target);if(!list.length){el.innerHTML='<div class="empty">Nothing logged here yet.</div>';return}
 if(!group){el.innerHTML=list.map((x,i)=>`<div class="food-row"><div><b>${safe(x.name)}</b><small>${safe(x.serving||"1 serving")} · ${fmt(x.calories)} kcal</small></div><div class="row"><button class="btn secondary" data-saved="${i}">Add</button><button class="btn danger" data-unsave="${i}">×</button></div></div>`).join("");el.querySelectorAll("[data-saved]").forEach(b=>b.onclick=()=>askAndAddFood(state.saved[+b.dataset.saved]));el.querySelectorAll("[data-unsave]").forEach(b=>b.onclick=()=>{state.saved.splice(+b.dataset.unsave,1);save();render()});return}
 const meals=["Breakfast","Lunch","Dinner","Snack"];el.innerHTML=meals.map(m=>{const arr=list.filter(x=>x.meal===m);if(!arr.length)return "";return `<div class="meal"><h3>${m}</h3>${arr.map(x=>`<div class="food-row"><div>${safe(x.name)}<small>${safe(x.serving||"1 serving")}</small></div><strong>${fmt(x.calories)} kcal<br><div class="row"><button class="muted" style="border:0;background:none;padding:2px" data-fav="${x.id}">☆ Save</button><button class="muted" style="border:0;background:none;padding:2px" data-del="${x.id}">Remove</button></div></strong></div>`).join("")}</div>`}).join("")||'<div class="empty">No food logged for this date.</div>';
 el.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{state.foods=state.foods.filter(x=>x.id!==b.dataset.del);save();render()});
 el.querySelectorAll("[data-fav]").forEach(b=>b.onclick=()=>{const x=state.foods.find(x=>x.id===b.dataset.fav);if(x)saveFavorite(x)});
}
function renderWeights(){const ws=[...state.weights].sort((a,b)=>b.date.localeCompare(a.date));$("#weightHistory").innerHTML=ws.length?ws.map(w=>`<div class="food-row"><div><b>${new Date(w.date+"T12:00:00").toLocaleDateString()}</b><small>Weigh-in</small></div><strong>${w.weight.toFixed(1)} lb<br><button class="muted" data-wdel="${w.id}" style="border:0;background:none">Delete</button></strong></div>`).join(""):'<div class="empty">No weigh-ins recorded yet.</div>';$("#weightHistory").querySelectorAll("[data-wdel]").forEach(b=>b.onclick=()=>{state.weights=state.weights.filter(w=>w.id!==b.dataset.wdel);save();render()})}
function addFood(f){const qty=num(f.quantity||1)||1;const scaled={...f};["calories","sugar","sodium","protein","carbs","fat"].forEach(k=>scaled[k]=Math.round(num(f[k])*qty*10)/10);scaled.serving=(f.serving||"1 serving")+(qty!==1?` × ${qty}`:"");delete scaled.quantity;state.foods.push({...scaled,id:crypto.randomUUID(),date:f.date||$("#foodDate").value||today()});save();render();$("#searchResults").innerHTML="";$("#foodSearch").value="";}
function askAndAddFood(f){const q=prompt(`How many servings of ${f.name}? Enter a number (e.g. 0.5, 1, 2).`,"1");if(q===null)return;const qty=Number(q);if(!Number.isFinite(qty)||qty<=0||qty>100){alert("Please enter a serving amount greater than 0 and no more than 100.");return;}let meal=prompt("Meal: Breakfast, Lunch, Dinner, or Snack","Snack")||"Snack";if(!["Breakfast","Lunch","Dinner","Snack"].includes(meal))meal="Snack";addFood({...f,quantity:qty,meal});}
function saveFavorite(f){const item={...f};delete item.id;delete item.date;delete item.quantity;if(state.saved.some(x=>x.name===item.name)){alert("That food is already in Favorites.");return;}state.saved.push(item);save();render();alert("Saved to Favorites.");}
const starter=[
["Banana, medium",105,14.4,1,1.3,27,0.4],["Apple, medium",95,19,2,0.5,25,0.3],["Egg, large",72,0.2,71,6.3,0.4,4.8],["Chicken breast, cooked (100 g)",165,0,74,31,0,3.6],["White rice, cooked (1 cup)",205,0.1,2,4.3,44.5,0.4],["Oatmeal, cooked (1 cup)",154,1.1,115,5.9,27.4,2.6],["Whole milk (1 cup)",149,12.3,105,7.7,11.7,7.9],["Greek yogurt, plain (170 g)",100,5,60,17,6,0.7],["Bread, whole wheat (1 slice)",80,1.5,140,4,14,1.1],["Peanut butter (2 tbsp)",190,3.4,136,7,7,16],["Broccoli, cooked (1 cup)",55,1.5,64,3.7,11.2,0.6],["Baked potato, medium",161,2,17,4.3,36.6,0.2],["Cheddar cheese (1 oz)",114,0.1,180,7,0.4,9.4],["Cola, regular (12 fl oz)",140,39,15,0,39,0],["Ground beef, cooked 85% lean (3 oz)",213,0,75,22,0,13]]
const starterFoods=starter.map(a=>({name:a[0],calories:a[1],sugar:a[2],sodium:a[3],protein:a[4],carbs:a[5],fat:a[6],serving:"1 listed serving"}));
function resultCard(f,i){return `<div class="result"><div><b>${safe(f.name)}</b><small>${fmt(f.calories)} kcal · sugar ${Number(f.sugar||0).toFixed(1)} g · sodium ${fmt(f.sodium)} mg<br>${safe(f.serving||"per listed serving")}</small></div><div class="row"><button class="btn secondary" data-addfood="${i}">Add</button><button class="btn ghost" data-favresult="${i}">☆</button></div></div>`}
function showResults(arr){
 window.currentFoodResults=arr;
 $("#searchResults").innerHTML=arr.length?arr.map((f,i)=>resultCard(f,i)).join(""):'<div class="empty">No matches found. Try another term or enter the food manually.</div>';
 $("#searchResults").querySelectorAll("[data-addfood]").forEach(b=>b.onclick=()=>askAndAddFood(window.currentFoodResults[+b.dataset.addfood]));
 $("#searchResults").querySelectorAll("[data-favresult]").forEach(b=>b.onclick=()=>saveFavorite(window.currentFoodResults[+b.dataset.favresult]));
}
$("#searchBtn").onclick=async()=>{
 const q=$("#foodSearch").value.trim();if(!q)return;
 const local=starterFoods.filter(f=>f.name.toLowerCase().includes(q.toLowerCase()));
 showResults(local);
 try{
  const fields="product_name,brands,serving_size,nutriments";
  const url="https://world.openfoodfacts.org/api/v2/search?search_terms="+encodeURIComponent(q)+"&page_size=12&fields="+fields;
  const r=await fetch(url,{headers:{"Accept":"application/json"}});
  if(!r.ok)throw new Error("HTTP "+r.status);
  const d=await r.json();
  const online=(d.products||[]).filter(p=>p.product_name&&p.nutriments).map(p=>({name:p.product_name+(p.brands?" — "+p.brands:""),serving:p.serving_size||"100 g",calories:p.nutriments["energy-kcal_100g"]||0,sugar:p.nutriments.sugars_100g||0,sodium:(p.nutriments.sodium_100g||0)*1000,protein:p.nutriments.proteins_100g||0,carbs:p.nutriments.carbohydrates_100g||0,fat:p.nutriments.fat_100g||0,meal:"Snack"}));
  showResults([...local,...online].slice(0,20));
  if(!local.length&&!online.length)$("#searchResults").innerHTML='<div class="empty">No matching products were found. Try a different search or enter the nutrition label manually.</div>';
 }catch(e){
  if(local.length)$("#searchResults").innerHTML='<div class="notice">Online food search could not connect. Your built-in matches are still available; try again later or add the food manually.</div>'+$("#searchResults").innerHTML;
  else $("#searchResults").innerHTML='<div class="empty">Online search is temporarily unavailable. Check your internet connection, or enter the food manually.</div>';
 }
};
$("#foodSearch").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();$("#searchBtn").click()}});
async function lookupBarcode(code){
 try{
  const r=await fetch("https://world.openfoodfacts.org/api/v2/product/"+encodeURIComponent(code)+".json");
  if(!r.ok)throw new Error("Lookup failed");
  const data=await r.json(),p=data.product;
  if(data.status!==1||!p){alert("No product was found for barcode "+code+". You can enter the food manually.");return;}
  const n=p.nutriments||{};
  const food={name:(p.product_name||"Scanned product")+(p.brands?" — "+p.brands:""),serving:p.serving_size||"100 g",calories:n["energy-kcal_100g"]||0,sugar:n.sugars_100g||0,sodium:(n.sodium_100g||0)*1000,protein:n.proteins_100g||0,carbs:n.carbohydrates_100g||0,fat:n.fat_100g||0,meal:"Snack",barcode:code};
  showResults([food]);
 }catch(e){alert("Could not reach the food database. Check your internet connection and try again.");}
}
let html5QrScanner=null;
let scannerStarting=false;
function loadHtml5Qrcode(){
 return new Promise((resolve,reject)=>{
  if(window.Html5Qrcode){resolve();return;}
  const old=document.querySelector('script[data-html5-qrcode]');
  if(old){old.addEventListener("load",()=>resolve(),{once:true});old.addEventListener("error",()=>reject(new Error("Scanner library failed to load")),{once:true});return;}
  const script=document.createElement("script");
  script.src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js";
  script.async=true;script.dataset.html5Qrcode="1";
  script.onload=()=>window.Html5Qrcode?resolve():reject(new Error("Scanner library did not initialize"));
  script.onerror=()=>reject(new Error("Could not download scanner library"));
  document.head.appendChild(script);
 });
}
async function startScanner(){
 if(scannerStarting||html5QrScanner)return;
 scannerStarting=true;
 const panel=$("#scannerPanel"),status=$("#scannerStatus");
 panel.classList.remove("hidden");
 status.textContent="Loading barcode scanner…";
 try{
  if(!navigator.mediaDevices?.getUserMedia)throw new Error("Camera access is unavailable in this browser. Open the HTTPS website in Chrome and allow camera permission.");
  await loadHtml5Qrcode();
  html5QrScanner=new Html5Qrcode("scannerReader",{verbose:false});
  const cameras=await Html5Qrcode.getCameras();
  if(!cameras||!cameras.length)throw new Error("No camera was found. Check that your phone camera is available.");
  const back=cameras.find(c=>/back|rear|environment/i.test(c.label));
  const cameraId=(back||cameras[cameras.length-1]).id;
  status.textContent="Point your rear camera at a product barcode.";
  await html5QrScanner.start(cameraId,{fps:10,qrbox:{width:260,height:150},aspectRatio:1.6},
   async decodedText=>{
    if(!/^\d{8,14}$/.test(decodedText.trim())){status.textContent="Barcode detected, but it does not look like a standard product barcode. Keep scanning.";return;}
    status.textContent="Barcode found. Looking up product…";
    await stopScanner();
    await lookupBarcode(decodedText.trim());
   },
   ()=>{}
  );
 }catch(e){
  const message=(e&&e.message)?e.message:String(e);
  status.textContent=message+" You can use Enter barcode instead.";
  if(html5QrScanner){try{await html5QrScanner.clear()}catch(_){}html5QrScanner=null;}
 }finally{scannerStarting=false;}
}
async function stopScanner(){
 if(html5QrScanner){
  const scanner=html5QrScanner;html5QrScanner=null;
  try{if(scanner.isScanning)await scanner.stop()}catch(_){}
  try{await scanner.clear()}catch(_){}
 }
 $("#scannerReader").innerHTML="";
 $("#scannerPanel").classList.add("hidden");
}
$("#scanBtn").addEventListener("click",startScanner);
$("#stopScanBtn").addEventListener("click",stopScanner);
window.addEventListener("pagehide",()=>{stopScanner()});
$("#manualBarcodeBtn").onclick=()=>{const code=prompt("Enter the numbers beneath the barcode:");if(code&&/^\d{8,14}$/.test(code.trim()))lookupBarcode(code.trim());else if(code)alert("Please enter a barcode containing 8–14 digits.");};
window.addEventListener("pagehide",stopScanner);

$("#manualFood").onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));const f={...d,calories:num(d.calories),sugar:num(d.sugar),sodium:num(d.sodium),protein:num(d.protein),carbs:num(d.carbs),fat:num(d.fat),date:$("#foodDate").value};addFood(f);e.target.reset();};
$("#foodDate").onchange=()=>{const d=$("#foodDate").value;renderMeals("#todayMeals",entries(d),true);const t=totals(entries(d));$("#entryCount").textContent=entries(d).length+" entries";};
$("#quickAdd").onclick=()=>{document.querySelector('[data-page="food"]').click();$("#foodSearch").focus()};
$("#weightForm").onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));state.weights=state.weights.filter(w=>w.date!==d.date);state.weights.push({id:crypto.randomUUID(),date:d.date,weight:num(d.weight)});save();render();e.target.reset();e.target.date.value=today()};
$("#goalsForm").onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));Object.keys(d).forEach(k=>state.goals[k]=d[k]===""?null:num(d[k]));save();render();alert("Goals saved.")};
function initGoals(){const f=$("#goalsForm");Object.entries(state.goals).forEach(([k,v])=>{if(f.elements[k])f.elements[k].value=v??""})}
$$(".tabs button").forEach(b=>b.onclick=()=>{$$(".tabs button").forEach(x=>x.classList.toggle("active",x===b));$$(".page").forEach(x=>x.classList.toggle("active",x.id===b.dataset.page));if(b.dataset.page==="trends")renderCharts()});
function drawChart(id,rows,key,label){const c=$(id),ctx=c.getContext("2d"),rect=c.getBoundingClientRect(),dpr=window.devicePixelRatio||1;c.width=rect.width*dpr;c.height=rect.height*dpr;ctx.scale(dpr,dpr);const w=rect.width,h=rect.height,p={l:38,r:10,t:12,b:28};ctx.clearRect(0,0,w,h);const vals=rows.map(x=>x[key]).filter(v=>v!==null&&v!==undefined);if(!vals.length){ctx.fillStyle="#687771";ctx.font="13px system-ui";ctx.fillText("No data recorded for this period",12,30);return}let min=Math.min(...vals),max=Math.max(...vals);if(min===max){min-=1;max+=1}const x=i=>p.l+(rows.length<2?0:i*(w-p.l-p.r)/(rows.length-1)),y=v=>p.t+(max-v)*(h-p.t-p.b)/(max-min);ctx.strokeStyle="#e2e9e4";ctx.lineWidth=1;for(let i=0;i<4;i++){let yy=p.t+i*(h-p.t-p.b)/3;ctx.beginPath();ctx.moveTo(p.l,yy);ctx.lineTo(w-p.r,yy);ctx.stroke()}ctx.fillStyle="#687771";ctx.font="10px system-ui";ctx.fillText(fmt(max),2,p.t+4);ctx.fillText(fmt(min),2,h-p.b);ctx.strokeStyle="#24765d";ctx.lineWidth=2.5;ctx.beginPath();let started=false;rows.forEach((r,i)=>{if(r[key]==null)return;if(!started){ctx.moveTo(x(i),y(r[key]));started=true}else ctx.lineTo(x(i),y(r[key]))});ctx.stroke();rows.forEach((r,i)=>{if(r[key]==null)return;ctx.fillStyle="#24765d";ctx.beginPath();ctx.arc(x(i),y(r[key]),3,0,Math.PI*2);ctx.fill()});ctx.fillStyle="#687771";ctx.fillText(rows[0]?.label||"",p.l,h-7);let last=rows.at(-1);ctx.textAlign="right";ctx.fillText(last?.label||"",w-p.r,h-7);ctx.textAlign="left"}
function renderCharts(){const days=Number($("#rangeSelect").value||30),start=new Date();start.setDate(start.getDate()-days+1);const dates=[];for(let i=0;i<days;i++){const d=new Date(start);d.setDate(start.getDate()+i);dates.push(d.toLocaleDateString("en-CA"))}const dayRows=dates.map(d=>{const t=totals(entries(d));return {date:d,label:new Date(d+"T12:00:00").toLocaleDateString(undefined,{month:"numeric",day:"numeric"}),calories:entries(d).length?t.calories:null,sugar:entries(d).length?t.sugar:null,sodium:entries(d).length?t.sodium:null}});const weightRows=dates.map(d=>({date:d,label:new Date(d+"T12:00:00").toLocaleDateString(undefined,{month:"numeric",day:"numeric"}),weight:state.weights.find(w=>w.date===d)?.weight??null}));drawChart("#weightChart",weightRows,"weight");drawChart("#calorieChart",dayRows,"calories");drawChart("#sugarChart",dayRows,"sugar");drawChart("#sodiumChart",dayRows,"sodium")}
$("#rangeSelect").onchange=renderCharts;window.addEventListener("resize",()=>{if($("#trends").classList.contains("active"))renderCharts()});
$("#exportBtn").onclick=()=>{const rows=[["type","date","name","meal","serving","weight_lb","calories_kcal","sugar_g","sodium_mg","protein_g","carbs_g","fat_g"]];state.foods.forEach(x=>rows.push(["food",x.date,x.name,x.meal,x.serving,"",x.calories,x.sugar,x.sodium,x.protein,x.carbs,x.fat]));state.weights.forEach(x=>rows.push(["weight",x.date,"","","",x.weight,"","","","","",""]));const csv=rows.map(r=>r.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(",")).join("\r\n");download("nutritrack-export.csv",csv,"text/csv")}
$("#backupBtn").onclick=()=>download("nutritrack-backup.json",JSON.stringify(state,null,2),"application/json");
function download(name,data,type){const a=document.createElement("a"),u=URL.createObjectURL(new Blob([data],{type}));a.href=u;a.download=name;a.click();URL.revokeObjectURL(u)}
$("#importFile").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const d=JSON.parse(await f.text());if(!d.goals||!Array.isArray(d.foods)||!Array.isArray(d.weights))throw 0;state={...structuredClone(defaults),...d};save();initGoals();render();alert("Backup imported.")}catch(err){alert("That file does not look like a NutriTrack backup.")}e.target.value=""};
$("#clearBtn").onclick=()=>{if(confirm("Permanently erase all NutriTrack data stored in this browser? Export a backup first if you want to keep it.")){state=structuredClone(defaults);save();initGoals();render()}};
initGoals();render();
})();
if("serviceWorker" in navigator && location.protocol!=="file:"){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));}
