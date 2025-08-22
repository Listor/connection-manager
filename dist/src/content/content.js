(function(){"use strict";function J(e){try{const t=new URL(e);if(!t.hostname.endsWith("linkedin.com"))return null;const o=t.pathname.match(/\/in\/([^/]+)\/?/);return o?`https://www.linkedin.com/in/${o[1]}`:null}catch{return null}}function*Ce(e){const t=e.querySelectorAll('a[href*="/in/"]');for(const o of Array.from(t)){const n=o.href||o.getAttribute("href")||"",a=J(n);a&&(o.dataset.liNotesProfile=a,yield o)}}function oe(e){switch(Se(e)){case"comment":return ke(e);case"feed":return _e(e);case"profile":return Te(e);case"search":return $e(e);case"connection":return Le(e);case"message":return Ne(e);case"notification":return Ie(e);default:return re(e)}}function Se(e){return e.classList.contains("comments-comment-meta__description-container")||e.querySelector(".comments-comment-meta__description-title")?"comment":e.querySelector(".update-components-actor__title")||e.querySelector(".feed-shared-actor__title")?"feed":e.querySelector(".pv-text-details__left-panel h1")||e.querySelector(".text-heading-xlarge")?"profile":e.querySelector(".entity-result__title-text")||e.querySelector(".search-result__info .actor-name")?"search":e.querySelector(".mn-connection-card__name")||e.querySelector(".connection-card__name")||e.querySelector(".invitation-card__name")?"connection":e.querySelector(".msg-conversations-container__name")||e.querySelector(".msg-conversation-card__participant-name")?"message":e.querySelector(".notification-actor__name")?"notification":"generic"}function ke(e){var n;const t=e.querySelector(".comments-comment-meta__description-title");if(t){const a=(n=t.textContent)==null?void 0:n.trim();if(a&&a.length>0)return a}const o=e.querySelector('a[href*="/in/"]');return o?re(o):null}function _e(e){var a,r,i;const t=e.querySelectorAll('a[href*="/in/"]');for(const s of Array.from(t)){const c=re(s);if(c)return c}const o=e.querySelector(".update-components-actor__title");if(o){const s=o.querySelectorAll(".update-components-actor__single-line-truncate");for(const u of Array.from(s)){const g=(a=u.textContent)==null?void 0:a.trim();if(g&&g.length>0&&!g.includes("•")&&!/\d+\.$/.test(g))return g.replace(/(.+)\1/,"$1").trim()}const c=(r=o.textContent)==null?void 0:r.trim();if(c&&c.length>0)return c}const n=[".update-components-actor__name",".feed-shared-actor__name",".feed-shared-actor__title"];for(const s of n){const c=e.querySelector(s);if(c){const u=(i=c.textContent)==null?void 0:i.trim();if(u&&u.length>0)return u}}return null}function Te(e){var o;const t=[".pv-text-details__left-panel h1",".text-heading-xlarge",".pv-top-card-section__name"];for(const n of t){const a=e.querySelector(n);if(a){const r=(o=a.textContent)==null?void 0:o.trim();if(r&&r.length>0)return r}}return null}function $e(e){var o;const t=[".entity-result__title-text",".search-result__info .actor-name",".search-result__title"];for(const n of t){const a=e.querySelector(n);if(a){const r=(o=a.textContent)==null?void 0:o.trim();if(r&&r.length>0)return r}}return null}function Le(e){var o;const t=[".mn-connection-card__name",".invitation-card__name",".connection-card__name"];for(const n of t){const a=e.querySelector(n);if(a){const r=(o=a.textContent)==null?void 0:o.trim();if(r&&r.length>0)return r}}return null}function Ne(e){var o;const t=[".msg-conversations-container__name",".msg-conversation-card__participant-name"];for(const n of t){const a=e.querySelector(n);if(a){const r=(o=a.textContent)==null?void 0:o.trim();if(r&&r.length>0)return r}}return null}function Ie(e){var o;const t=[".notification-actor__name",".reactions-detail__actor-name"];for(const n of t){const a=e.querySelector(n);if(a){const r=(o=a.textContent)==null?void 0:o.trim();if(r&&r.length>0)return r}}return null}function re(e){var n,a,r;const t=[".artdeco-entity-lockup__title",".comment-actor__name"];for(const i of t){const s=e.querySelector(i);if(s){const c=(n=s.textContent)==null?void 0:n.trim();if(c&&c.length>0)return c}}const o=(a=e.textContent)==null?void 0:a.trim();if(o){const s=(r=o.split(/[•·\n\r\t]/)[0])==null?void 0:r.trim();if(s&&s.length>0&&s.length<100){const c=s.replace(/\s+(CEO|CTO|CFO|COO|VP|Director|Manager|Lead|Senior|Junior|Associate|Intern)\b.*$/i,"").replace(/\s+at\s+.*$/i,"").replace(/\s+@\s+.*$/i,"").trim();return c&&c.length>0&&c.length<100?c:s}}return De(e)}function De(e){const t=e.dataset.liNotesProfile||J(e.href);if(!t)return null;const o=[`a[data-li-notes-profile="${t}"]`,`a[href*="${t.replace("https://www.linkedin.com/in/","/in/")}"]`];let n=e.parentElement;const a=3;let r=0;for(;n&&r<a;){for(const i of o){const s=n.querySelectorAll(i);for(const c of Array.from(s)){if(c===e||(c.dataset.liNotesProfile||J(c.href))!==t)continue;const g=oe(c);if(g)return g}}n=n.parentElement,r++}return null}const qe="li-notes",Ae=2;function M(){return new Promise((e,t)=>{const o=indexedDB.open(qe,Ae);o.onupgradeneeded=n=>{const a=n.target.result;if(a.objectStoreNames.contains("settings")||a.createObjectStore("settings",{keyPath:"id"}),!a.objectStoreNames.contains("contacts")){const r=a.createObjectStore("contacts",{keyPath:"profileUrl"});r.createIndex("byName","displayName",{unique:!1}),r.createIndex("byCategory","categoryId",{unique:!1})}if(!a.objectStoreNames.contains("events")){const r=a.createObjectStore("events",{keyPath:"id"});r.createIndex("byProfileUrl","profileUrl",{unique:!1}),r.createIndex("byTimestampDesc","timestamp",{unique:!1})}},o.onsuccess=()=>e(o.result),o.onerror=()=>t(o.error)})}function D(e,t,o){return e.transaction(t,o)}async function P(e){const n=D(e,["settings"],"readonly").objectStore("settings").get("default"),a=await new Promise((i,s)=>{n.onsuccess=()=>i(n.result),n.onerror=()=>s(n.error)});if(a){let i=!1;const s={...a};return s.categories&&(s.categories=s.categories.map(c=>{if(!c.emoticon){i=!0;let u="🤝";return c.id==="business"?u="💼":c.id==="colleague"?u="👥":c.id==="acquaintance"&&(u="🤝"),{...c,emoticon:u}}return c})),i?(await X(e,s),s):a}const r=Be;return await X(e,r),r}function X(e,t){const o=D(e,["settings"],"readwrite");return o.objectStore("settings").put(t),new Promise((a,r)=>{o.oncomplete=()=>a(),o.onerror=()=>r(o.error)})}function F(e,t){const a=D(e,["contacts"],"readonly").objectStore("contacts").get(t);return new Promise((r,i)=>{a.onsuccess=()=>r(a.result),a.onerror=()=>i(a.error)})}function U(e,t){const o=D(e,["contacts"],"readwrite");return o.objectStore("contacts").put(t),new Promise((a,r)=>{o.oncomplete=()=>a(),o.onerror=()=>r(o.error)})}function ae(e,t){const a=D(e,["events"],"readonly").objectStore("events").index("byProfileUrl").getAll(t);return new Promise((r,i)=>{a.onsuccess=()=>r(a.result||[]),a.onerror=()=>i(a.error)})}function Me(e,t){const o=D(e,["events"],"readwrite");return o.objectStore("events").put(t),new Promise((n,a)=>{o.oncomplete=()=>n(),o.onerror=()=>a(o.error)})}function ze(e,t){const o=D(e,["events"],"readwrite");return o.objectStore("events").delete(t),new Promise((n,a)=>{o.oncomplete=()=>n(),o.onerror=()=>a(o.error)})}function Y(e){const n=D(e,["contacts"],"readonly").objectStore("contacts").getAll();return new Promise((a,r)=>{n.onsuccess=()=>a(n.result||[]),n.onerror=()=>r(n.error)})}function Q(e){const n=D(e,["events"],"readonly").objectStore("events").getAll();return new Promise((a,r)=>{n.onsuccess=()=>a(n.result||[]),n.onerror=()=>r(n.error)})}function le(e){const t=D(e,["contacts"],"readwrite");return t.objectStore("contacts").clear(),new Promise((n,a)=>{t.oncomplete=()=>n(),t.onerror=()=>a(t.error)})}function de(e){const t=D(e,["events"],"readwrite");return t.objectStore("events").clear(),new Promise((n,a)=>{t.oncomplete=()=>n(),t.onerror=()=>a(t.error)})}function ue(e,t){const o=D(e,["contacts"],"readwrite"),n=o.objectStore("contacts");return t.forEach(a=>{n.put(a)}),new Promise((a,r)=>{o.oncomplete=()=>a(),o.onerror=()=>r(o.error)})}function pe(e,t){const o=D(e,["events"],"readwrite"),n=o.objectStore("events");return t.forEach(a=>{n.put(a)}),new Promise((a,r)=>{o.oncomplete=()=>a(),o.onerror=()=>r(o.error)})}const Be={id:"default",lang:"de",weights:{categories:.2,events:.1,affinity:.33},decay:{mode:"exponential",decayStartDays:21,halfLifeDays:90},anonymousMode:!1,categories:[{id:"business",label_de:"Geschäftsbeziehung",label_en:"Business relationship",value:80,color:"#28a745",emoticon:"💼"},{id:"colleague",label_de:"Kollege",label_en:"Colleague",value:60,color:"#007bff",emoticon:"👥"},{id:"acquaintance",label_de:"Bekanntschaft",label_en:"Acquaintance",value:40,color:"#ffc107",emoticon:"🤝"}],eventTypes:[{id:"meeting",label_de:"Treffen",label_en:"Meeting"},{id:"call",label_de:"Telefonat",label_en:"Call"},{id:"lunch",label_de:"Mittagessen",label_en:"Lunch"}],scoreBands:[{id:"weak",label_de:"Schwach",label_en:"Weak",min:0,max:24},{id:"low",label_de:"Gering",label_en:"Low",min:25,max:49},{id:"medium",label_de:"Mittel",label_en:"Medium",min:50,max:74},{id:"strong",label_de:"Stark",label_en:"Strong",min:75,max:89},{id:"vstrong",label_de:"Sehr stark",label_en:"Very strong",min:90,max:100}]};function Oe(e,t){if(t.mode==="off"||e<=t.decayStartDays)return 1;const o=e-t.decayStartDays;if(t.mode==="exponential")return Math.pow(.5,o/t.halfLifeDays);const n=2*t.halfLifeDays;return Math.max(0,1-o/n)}function me(e,t,o){if(!e.length)return 0;const n=e.reduce((a,r)=>{const i=Math.max(0,(t.getTime()-new Date(r.timestamp).getTime())/864e5),s=Oe(i,o),u=r.points*20*s;return console.log(`Event: ${r.points} points, age: ${i.toFixed(2)} days, decay: ${s.toFixed(3)}, contribution: ${u.toFixed(1)}`),a+u},0);return console.log(`Total event score: ${n.toFixed(1)}`),Math.max(0,n)}function ge(e,t,o,n){const a=n.categories*e,r=n.events*t,i=n.affinity*o,s=a+r+i;return console.log("Total score calculation:"),console.log(`  Category: ${e} × ${n.categories} = ${a.toFixed(1)}`),console.log(`  Events: ${t.toFixed(1)} × ${n.events} = ${r.toFixed(1)}`),console.log(`  Affinity: ${o} × ${n.affinity} = ${i.toFixed(1)}`),console.log(`  Total: ${s.toFixed(1)} → ${Math.round(s)}`),Math.round(Math.max(0,Math.min(100,s)))}function Pe(){return`
    /* Imported shared CSS styles (adapted for shadow DOM) */
    /* Shared styles for Connection Manager Chrome Extension */
    
    /* Base styles */
    * {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        "Helvetica Neue", Arial, sans-serif;
      box-sizing: border-box;
    }
    
    /* Common colors */
    :host {
      --linkedin-blue: #0073b1;
      --linkedin-blue-dark: #005885;
      --border-color: #ddd;
      --background-light: #f8f9fa;
      --background-lighter: #fafafa;
      --text-primary: #333;
      --text-secondary: #666;
      --text-muted: #666;
      --error-color: #dc3545;
      --error-bg: #f8d7da;
      --error-border: #f5c6cb;
      --success-color: #155724;
      --success-bg: #d4edda;
      --success-border: #c3e6cb;
      --success-color-dark: #0f3d1a;
      --shadow-light: rgba(0, 0, 0, 0.1);
      --shadow-medium: rgba(0, 0, 0, 0.15);
      --shadow-heavy: rgba(0, 0, 0, 0.3);
    }
    
    /* Common button styles */
    button {
      border: 1px solid var(--border-color);
      background: var(--background-lighter);
      border-radius: 6px;
      padding: 6px 10px;
      cursor: pointer;
      font-size: 12px;
      white-space: nowrap;
      transition: background-color 0.2s ease;
    }
    
    button:hover {
      background: #f0f0f0;
    }
    
    button.primary {
      background: var(--linkedin-blue);
      color: white;
      border-color: var(--linkedin-blue);
      font-weight: 500;
      padding: 12px 24px;
      min-width: 120px;
    }
    
    button.primary:hover {
      background: var(--linkedin-blue-dark);
    }
    
    button:active {
      transform: translateY(1px);
    }
    
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
    }
    
    /* Common input styles */
    input[type="number"],
    input[type="text"],
    input[type="datetime-local"],
    select,
    textarea {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      font-size: 14px;
      background: white;
      transition: border-color 0.2s ease;
    }
    
    input[type="number"]:focus,
    input[type="text"]:focus,
    input[type="datetime-local"]:focus,
    select:focus,
    textarea:focus {
      outline: none;
      border-color: var(--linkedin-blue);
      box-shadow: 0 0 0 2px rgba(0, 115, 177, 0.1);
    }
    
    /* Common label styles */
    label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: var(--text-primary);
    }
    
    /* Common card styles */
    .card {
      background: white;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 12px;
      box-shadow: 0 4px 16px var(--shadow-light);
      position: relative;
      width: 400px;
      min-height: ;
    }
    
    /* Common dialog styles */
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 2147483648;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .dialog {
      background: white;
      border-radius: 8px;
      padding: 20px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 8px 32px var(--shadow-heavy);
      position: relative;
    }
    
    .dialog h3 {
      margin: 0 0 16px 0;
      font-size: 18px;
    }
    
    .dialog-row {
      margin-bottom: 12px;
    }
    
    .dialog-row label {
      display: block;
      margin-bottom: 4px;
      font-weight: 500;
    }
    
    .dialog-buttons {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 16px;
    }
    
    .dialog-buttons button {
      padding: 8px 16px;
    }
    
    /* Common message styles */
    .error {
      color: var(--error-color);
      font-size: 14px;
      margin-top: 8px;
      padding: 8px 12px;
      background: var(--error-bg);
      border: 1px solid var(--error-border);
      border-radius: 4px;
    }
    
    .success {
      color: var(--success-color);
      font-size: 14px;
      margin-top: 8px;
      padding: 8px 12px;
      background: var(--success-bg);
      border: 1px solid var(--success-border);
      border-radius: 4px;
    }
    
    /* Common utility classes */
    .small {
      color: var(--text-secondary);
      font-size: 12px;
    }
    
    .muted {
      color: var(--text-muted);
    }
    
    .help-text {
      font-size: 12px;
      color: var(--text-secondary);
      margin-top: 4px;
      font-style: italic;
    }
    
    /* Common layout utilities */
    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    
    .button-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-top: auto;
      padding-top: 12px;
    }
    
    .button-row button {
      flex: 1;
      min-width: 0;
    }
    
    /* Interaction row styles */
    .interaction-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4px;
    }
    
    .interaction-text {
      color: var(--text-secondary);
      font-size: 12px;
    }
    
    .category-emoticon {
      font-size: 18px;
      margin-top: -6px;
    }
    
    /* Common badge styles */
    .badge {
      padding: 2px 6px;
      border-radius: 999px;
      border: 1px solid #ccc;
      font-size: 10px;
    }
    
    /* Score display styles */
    .score {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .score-number {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .score-badge {
      font-size: 11px;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .delete-event__label {
      position: relative;
      top: -2px;
    }
    
    /* Card content styles */
    .card-content {
      margin-bottom: 12px;
      min-height: 80px;
    }
    
    /* Responsive utilities */
    @media (max-width: 768px) {
      .row,
      .button-row {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }
    
      .button-row button {
        width: 100%;
      }
    }
    

    /* Shadow DOM specific additions */
    
    /* Anonymous mode overlay */
    .anonymous-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #000;
      border-radius: 2px;
      pointer-events: none;
    }

    /* Dialog row specific styles for shadow DOM */
    .dialog-row textarea {
      resize: vertical;
      min-height: 80px;
      max-height: 200px;
      box-sizing: border-box;
      width: 100%;
    }

    .dialog-buttons button.secondary {
      background: var(--background-light);
      border-color: var(--border-color);
    }

    /* Points grid for event dialogs */
    .points-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 4px;
      margin-top: 4px;
    }

    .points-grid button {
      padding: 8px;
      border: 1px solid var(--border-color);
      background: var(--background-light);
      border-radius: 4px;
      cursor: pointer;
    }

    .points-grid button.selected {
      background: var(--linkedin-blue);
      color: white;
      border-color: var(--linkedin-blue);
    }

    /* Events list specific styles */
    .events-list {
      max-height: 200px;
      overflow-y: auto;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: 8px;
    }

    .event-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 8px;
      border-bottom: 1px solid #eee;
      gap: 8px;
    }

    .event-item:last-child {
      border-bottom: none;
    }

    .event-info {
      flex: 1;
    }

    .event-date {
      font-weight: 500;
      color: var(--text-primary);
    }

    .event-type {
      color: var(--text-secondary);
      font-size: 12px;
    }

    .event-points {
      color: var(--linkedin-blue);
      font-weight: 500;
      font-size: 12px;
    }

    .event-note {
      color: var(--text-secondary);
      font-size: 11px;
      margin-top: 4px;
      font-style: italic;
    }

    .delete-event {
      background: var(--error-color);
      color: white;
      border: none;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
    }

    .delete-event:hover {
      background: #c82333;
    }

    .no-events {
      color: var(--text-secondary);
      font-style: italic;
      text-align: center;
      padding: 16px;
    }

    .category-gradient {
      position: absolute;
      top: 0;
      right: 0;
      width: 30%;
      height: 100%;
      opacity: 0.5;
      pointer-events: none;
      border-radius: 8px;
    }

    .dialog .category-gradient {
      border-radius: 8px;
    }
  `}let E=null,T=null,Z=null,B=null,G=null,L=null,j=!1;function Fe(){const e=document.createElement("div");return e.style.cssText=`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #000;
    border-radius: 4px;
    z-index: 10;
    pointer-events: none;
  `,e}function ie(){if(!j){document.querySelectorAll(".li-anonymous-overlay").forEach(t=>t.remove());return}['a[href*="/in/"] span',".entity-result__title-text",".pv-text-details__left-panel h1",".text-heading-xlarge",".text-body-large",".artdeco-entity-lockup__title",".feed-identity-module__actor-name",".comment-actor__name",".post-meta__actor-name",".msg-conversations-container__name",".conversation__participant-name",".search-result__info .actor-name",".notification-item__actor-name",".feed-shared-actor__name",".feed-shared-comment-v2__actor-name",".feed-shared-update-v2__actor-name"].forEach(t=>{document.querySelectorAll(t).forEach(n=>{if(n instanceof HTMLElement){if(n.dataset.anonymousProcessed)return;n.dataset.anonymousProcessed="true",window.getComputedStyle(n).position==="static"&&(n.style.position="relative");const r=Fe();r.className="li-anonymous-overlay",r.style.position="absolute",r.style.top="0",r.style.left="0",r.style.width="100%",r.style.height="100%",n.appendChild(r)}})})}async function fe(){try{const e=await M();j=(await P(e)).anonymousMode,ie()}catch(e){console.error("Error updating anonymous mode:",e)}}fe(),new MutationObserver(()=>{j&&ie()}).observe(document.body,{childList:!0,subtree:!0}),document.addEventListener("keydown",e=>{e.ctrlKey&&e.shiftKey&&e.key==="O"&&(e.preventDefault(),we())}),chrome.runtime.onMessage.addListener((e,t,o)=>{if(e.type==="INDEXEDDB_REQUEST")return je(e.request).then(o),!0;if(e.type==="OPEN_OPTIONS")return we(),o({success:!0}),!0;if(e.type==="SETTINGS_UPDATED")return fe(),o({success:!0}),!0});async function je(e){try{console.log("Content script handling IndexedDB request:",e);const t=await M();switch(e.type){case"GET_ALL_CONTACTS":return{success:!0,data:await Y(t)};case"GET_ALL_EVENTS":return{success:!0,data:await Q(t)};case"CLEAR_ALL_CONTACTS":return await le(t),{success:!0};case"CLEAR_ALL_EVENTS":return await de(t),{success:!0};case"IMPORT_CONTACTS":return await ue(t,e.data),{success:!0};case"IMPORT_EVENTS":return await pe(t,e.data),{success:!0};case"GET_SETTINGS":return{success:!0,data:await P(t)};case"PUT_SETTINGS":return await X(t,e.data),{success:!0};case"EXPORT_DATA":const r=await Y(t),i=await Q(t);return{success:!0,data:{version:"1.0",settings:await P(t),contacts:r,events:i}};default:return{success:!1,error:"Unknown request type"}}}catch(t){return console.error("Content script IndexedDB error:",t),{success:!1,error:t instanceof Error?t.message:"Unknown error"}}}function He(){if(T)return;const e=document.createElement("div");e.id="li-notes-overlay-host",e.style.position="fixed",e.style.zIndex="2147483647",e.style.top="0",e.style.left="0",document.documentElement.appendChild(e),E=e.attachShadow({mode:"open"}),T=document.createElement("div");const t=document.createElement("style");t.textContent=Pe(),E.append(t,T)}function ye(e){if(!T)return;const t=window.innerWidth,o=window.innerHeight,n=380,a=140;let r=e.left,i=e.top+e.height+10;r<12&&(r=12),r+n>t-12&&(r=t-n-12),i+a>o-12&&(i=e.top-a-10),i<12&&(i=12),T.style.position="absolute",T.style.left=`${r}px`,T.style.top=`${i}px`,Je(e,{left:r,top:i,width:n,height:a})}function be(e){return e<=24?"Schwach":e<=49?"Gering":e<=74?"Mittel":e<=89?"Stark":"Sehr stark"}function Ue(e){switch(e){case"meeting":return"Treffen";case"call":return"Telefonat";case"lunch":return"Mittagessen";default:return e}}function V(e,t){const o=t.categories.find(n=>n.id===e);return(o==null?void 0:o.color)||"#ccc"}function ve(e,t){const o=t.categories.find(n=>n.id===e);return(o==null?void 0:o.emoticon)||"🤝"}async function R(){var m,v;if(!G||!B)return;const e=G.getBoundingClientRect();ye(e);const t=await M(),o=await P(t);let n=await F(t,B);const a=await ae(t,B);let r=n==null?void 0:n.displayName;const i=oe(G);r?i&&i!==r&&n&&(i.length<r.length||!r.includes(i))&&(n.displayName=i,await U(t,n),r=i):i&&!n?(n={profileUrl:B,displayName:i,categoryId:"acquaintance",affinity:0},await U(t,n),r=i):i&&(r=i),r||(r=((m=G.textContent)==null?void 0:m.trim())||"—");let s,c;const u=me(a,new Date,o.decay),g=n?((v=o.categories.find(S=>S.id===n.categoryId))==null?void 0:v.value)??0:0,C=(n==null?void 0:n.affinity)??0,b=a.length>0,f=C>0,_=(n==null?void 0:n.categoryId)&&n.categoryId!=="acquaintance";if(!b&&!f&&!_)s="N/A",c="";else{const S=ge(g,u,C,o.weights);s=S.toString(),c=`<span class="badge">${be(S)}</span>`}const q=V((n==null?void 0:n.categoryId)||"acquaintance",o),l=ve((n==null?void 0:n.categoryId)||"acquaintance",o);if(!T)return;T.innerHTML="";const d=document.createElement("div");d.className="card",d.style.position="relative",d.innerHTML=`
    <div class="card-content">
            <div class="row"><div style="position: relative;">${r}${j?'<div class="anonymous-overlay"></div>':""}</div><div class="score"><span class="score-number">${s}</span><span class="score-badge">${c}</span></div></div>
      <div class="interaction-row">
        <div class="interaction-text">${a.length?`Letzte Interaktion: ${new Date(Math.max(...a.map(S=>+new Date(S.timestamp)))).toLocaleDateString()}`:"Keine Interaktionen"}</div>
        <div class="category-emoticon">${l}</div>
      </div>
      <div class="small">${n!=null&&n.notes?n.notes.split(`
`)[0]:""}</div>
    </div>
    <div class="button-row">
      <button data-act="add-evt">Interaktion +</button>
      <button data-act="add-note">Notiz +</button>
      <button data-act="details">Details</button>
    </div>
    <div class="category-gradient" style="background: linear-gradient(to right, transparent 0%, ${q}40 70%, ${q}80 100%);"></div>
  `,d.addEventListener("mouseenter",ee),d.addEventListener("mouseleave",()=>{te()}),d.addEventListener("click",async S=>{const A=S.target;if(A.tagName==="BUTTON"){const y=A.getAttribute("data-act");B&&await xe(y,B,n,r)}}),T.appendChild(d)}async function Ke(e,t){var S,A;if(He(),!T||!E)return;ee(),B=t,G=e;const o=e.getBoundingClientRect();ye(o);const n=await M(),a=await P(n);let r=await F(n,t);const i=await ae(n,t);let s=r==null?void 0:r.displayName;const c=oe(e);s?c&&c!==s&&r&&(c.length<s.length||!s.includes(c))&&(r.displayName=c,await U(n,r),s=c):c&&!r?(r={profileUrl:t,displayName:c,categoryId:"acquaintance",affinity:0},await U(n,r),s=c):c&&(s=c),s||(s=((S=e.textContent)==null?void 0:S.trim())||"—");let u,g;const C=me(i,new Date,a.decay),b=r?((A=a.categories.find(y=>y.id===r.categoryId))==null?void 0:A.value)??0:0,f=(r==null?void 0:r.affinity)??0,_=i.length>0,q=f>0,l=(r==null?void 0:r.categoryId)&&r.categoryId!=="acquaintance";if(!_&&!q&&!l)u="N/A",g="";else{const y=ge(b,C,f,a.weights);u=y.toString(),g=`<span class="badge">${be(y)}</span>`}const d=V((r==null?void 0:r.categoryId)||"acquaintance",a),m=ve((r==null?void 0:r.categoryId)||"acquaintance",a);T.innerHTML="";const v=document.createElement("div");v.className="card",v.style.position="relative",v.innerHTML=`
    <div class="card-content">
            <div class="row"><div style="position: relative;">${s}${j?'<div class="anonymous-overlay"></div>':""}</div><div class="score"><span class="score-number">${u}</span><span class="score-badge">${g}</span></div></div>
      <div class="interaction-row">
        <div class="interaction-text">${i.length?`Letzte Interaktion: ${new Date(Math.max(...i.map(y=>+new Date(y.timestamp)))).toLocaleDateString()}`:"Keine Interaktionen"}</div>
        <div class="category-emoticon">${m}</div>
      </div>
      <div class="small">${r!=null&&r.notes?r.notes.split(`
`)[0]:""}</div>
    </div>
    <div class="button-row">
      <button data-act="add-evt">Interaktion +</button>
      <button data-act="add-note">Notiz +</button>
      <button data-act="details">Details</button>
    </div>
    <div class="category-gradient" style="background: linear-gradient(to right, transparent 0%, ${d}40 70%, ${d}80 100%);"></div>
  `,v.addEventListener("mouseenter",ee),v.addEventListener("mouseleave",()=>{te()}),v.addEventListener("click",async y=>{const N=y.target;if(N.tagName==="BUTTON"){const I=N.getAttribute("data-act");await xe(I,t,r,s)}}),T.appendChild(v)}async function xe(e,t,o,n){switch(e){case"add-evt":await Ge(t,n);break;case"add-note":await Ve(t,o);break;case"details":await We(t,o,n);break}}async function Ge(e,t){if(!E)return;const o=document.createElement("div");o.className="dialog-overlay";const n=document.createElement("div");n.className="dialog";let a="meeting",r=3;const i=await M(),s=await P(i),c=await F(i,e),u=V((c==null?void 0:c.categoryId)||"acquaintance",s);n.innerHTML=`
      <h3>Interaktion hinzufügen</h3>
      <div class="dialog-row">
                <label>Für: <span style="position: relative;">${t}${j?'<div class="anonymous-overlay"></div>':""}</span></label>
      </div>
      <div class="dialog-row">
        <label for="event-type">Typ:</label>
        <select id="event-type">
          <option value="meeting">Treffen</option>
          <option value="call">Telefonat</option>
          <option value="lunch">Mittagessen</option>
        </select>
      </div>
      <div class="dialog-row">
        <label>Bewertung:</label>
        <div class="points-grid">
          <button data-points="1">1</button>
          <button data-points="2">2</button>
          <button data-points="3" class="selected">3</button>
          <button data-points="4">4</button>
          <button data-points="5">5</button>
        </div>
      </div>
           <div class="dialog-row">
         <label for="event-datetime">Datum & Uhrzeit:</label>
         <input type="datetime-local" id="event-datetime" />
       </div>
       <div class="dialog-row">
         <label for="event-note">Notiz (optional):</label>
         <textarea id="event-note" placeholder="Details zur Interaktion..."></textarea>
       </div>
      <div class="dialog-buttons">
        <button class="secondary" id="cancel-event">Abbrechen</button>
        <button class="primary" id="save-event">Speichern</button>
      </div>
      <div class="category-gradient" style="background: linear-gradient(to right, transparent 0%, ${u}40 70%, ${u}80 100%);"></div>
    `,n.style.position="relative",o.appendChild(n),E.appendChild(o);const g=n.querySelector("#event-type"),C=n.querySelectorAll(".points-grid button"),b=n.querySelector("#event-datetime"),f=n.querySelector("#event-note"),_=n.querySelector("#cancel-event"),q=n.querySelector("#save-event"),l=new Date,d=l.getFullYear(),m=String(l.getMonth()+1).padStart(2,"0"),v=String(l.getDate()).padStart(2,"0"),S=String(l.getHours()).padStart(2,"0"),A=String(l.getMinutes()).padStart(2,"0");b.value=`${d}-${m}-${v}T${S}:${A}`,g.addEventListener("change",y=>{a=y.target.value}),C.forEach(y=>{y.addEventListener("click",()=>{C.forEach(N=>N.classList.remove("selected")),y.classList.add("selected"),r=Number(y.getAttribute("data-points"))})}),_.addEventListener("click",()=>{E.removeChild(o)}),q.addEventListener("click",async()=>{const y=f.value.trim(),N=b.value;try{const I=await M(),O={id:crypto.randomUUID(),profileUrl:e,typeId:a,timestamp:N?new Date(N).toISOString():new Date().toISOString(),points:r,note:y||void 0};await Me(I,O),E.removeChild(o),await R()}catch(I){console.error("Error adding event:",I),alert("Fehler beim Speichern des Events")}}),o.addEventListener("click",y=>{y.target===o&&E.removeChild(o)})}async function Ve(e,t){if(!E)return;const o=document.createElement("div");o.className="dialog-overlay";const n=document.createElement("div");n.className="dialog";const a=(t==null?void 0:t.notes)||"",r=await M(),i=await P(r),s=V((t==null?void 0:t.categoryId)||"acquaintance",i);n.innerHTML=`
       <h3>Notiz bearbeiten</h3>
       <div class="dialog-row">
         <label for="contact-note">Notiz:</label>
         <textarea id="contact-note" placeholder="Notizen zu diesem Kontakt...">${a}</textarea>
       </div>
       <div class="dialog-buttons">
         <button class="secondary" id="cancel-note">Abbrechen</button>
         ${a?'<button class="secondary" id="remove-note">Entfernen</button>':""}
         <button class="primary" id="save-note">Speichern</button>
       </div>
       <div class="category-gradient" style="background: linear-gradient(to right, transparent 0%, ${s}40 70%, ${s}80 100%);"></div>
     `,n.style.position="relative",o.appendChild(n),E.appendChild(o);const c=n.querySelector("#contact-note"),u=n.querySelector("#cancel-note"),g=n.querySelector("#save-note"),C=n.querySelector("#remove-note");u.addEventListener("click",()=>{E.removeChild(o)}),C&&C.addEventListener("click",async()=>{try{const b=await M();let f=await F(b,e);f||(f={profileUrl:e,displayName:"Unbekannt",categoryId:"acquaintance",affinity:0}),f.notes=void 0,await U(b,f),E.removeChild(o),await R()}catch(b){console.error("Error removing note:",b),alert("Fehler beim Entfernen der Notiz")}}),g.addEventListener("click",async()=>{const b=c.value.trim();try{const f=await M();let _=await F(f,e);_?_.notes=b:_={profileUrl:e,displayName:"Unbekannt",categoryId:"acquaintance",affinity:0,notes:b},await U(f,_),E.removeChild(o),await R()}catch(f){console.error("Error saving note:",f),alert("Fehler beim Speichern der Notiz")}}),o.addEventListener("click",b=>{b.target===o&&E.removeChild(o)})}async function We(e,t,o){if(!E)return;const n=document.createElement("div");n.className="dialog-overlay";const a=document.createElement("div");a.className="dialog";const r=await M(),i=await P(r),s=await ae(r,e),c=s.length>0?s.sort((l,d)=>new Date(d.timestamp).getTime()-new Date(l.timestamp).getTime()).map(l=>`
          <div class="event-item" data-event-id="${l.id}">
            <div class="event-info">
              <div class="event-date">${new Date(l.timestamp).toLocaleDateString()}</div>
              <div class="event-type">${Ue(l.typeId)}</div>
              <div class="event-points">${l.points} Punkte</div>
              ${l.note?`<div class="event-note">${l.note}</div>`:""}
            </div>
            <button class="delete-event" data-event-id="${l.id}"><span class="delete-event__label">×</span></button>
          </div>
        `).join(""):'<div class="no-events">Keine Interaktionen</div>';a.innerHTML=`
      <h3>Kontakt Details</h3>
      <div class="dialog-row">
        <label>Name:</label>
                <div style="position: relative;">${o}${j?'<div class="anonymous-overlay"></div>':""}</div>
      </div>
      <div class="dialog-row">
        <label>URL:</label>
        <div style="word-break: break-all; font-size: 12px; color: #666; position: relative;">${e}${j?'<div class="anonymous-overlay"></div>':""}</div>
      </div>
           <div class="dialog-row">
         <label for="contact-category">Kategorie:</label>
         <select id="contact-category">
           ${i.categories.map(l=>`
             <option value="${l.id}" ${(t==null?void 0:t.categoryId)===l.id?"selected":""}>
               ${l.label_de}
             </option>
           `).join("")}
         </select>
       </div>
      <div class="dialog-row">
        <label>Empfinden:</label>
        <div style="display: flex; align-items: center; gap: 12px;">
          <input 
            type="range" 
            id="contact-affinity" 
            min="0" 
            max="100" 
            value="${(t==null?void 0:t.affinity)||0}"
            style="flex: 1;"
          />
          <span id="affinity-value" style="min-width: 40px; text-align: right;">${(t==null?void 0:t.affinity)||0}/100</span>
        </div>
      </div>
      <div class="dialog-row">
        <label>Notizen:</label>
        <div style="white-space: pre-wrap; max-height: 100px; overflow-y: auto;">${(t==null?void 0:t.notes)||"Keine"}</div>
      </div>
      <div class="dialog-row">
        <label>Interaktionen (${s.length}):</label>
        <div class="events-list">
          ${c}
        </div>
      </div>
      <div class="dialog-buttons">
        <button class="secondary" id="close-details">Schließen</button>
      </div>
    `;const u=V((t==null?void 0:t.categoryId)||"acquaintance",i);a.style.position="relative";const g=document.createElement("div");g.className="category-gradient",g.id="details-category-gradient",g.style.background=`linear-gradient(to right, transparent 0%, ${u}40 70%, ${u}80 100%)`,a.appendChild(g),n.appendChild(a),E.appendChild(n);const C=a.querySelector("#close-details"),b=a.querySelector("#contact-category"),f=a.querySelector("#contact-affinity"),_=a.querySelector("#affinity-value");C.addEventListener("click",()=>{E.removeChild(n)}),b.addEventListener("change",async()=>{const l=b.value;try{let d=await F(r,e);d?d.categoryId=l:d={profileUrl:e,displayName:o,categoryId:l,affinity:0},await U(r,d),d=await F(r,e);const m=a.querySelector("#details-category-gradient");if(m){const v=V(l,i);m.style.background=`linear-gradient(to right, transparent 0%, ${v}40 70%, ${v}80 100%)`}}catch(d){console.error("Error updating category:",d),alert("Fehler beim Aktualisieren der Kategorie")}}),f.addEventListener("input",l=>{const d=l.target.value;_.textContent=`${d}/100`}),f.addEventListener("change",async l=>{const d=Number(l.target.value);try{let m=await F(r,e);m?m.affinity=d:m={profileUrl:e,displayName:o,categoryId:"acquaintance",affinity:d},await U(r,m),m=await F(r,e)}catch(m){console.error("Error updating affinity:",m),alert("Fehler beim Aktualisieren des Empfindens")}}),a.querySelectorAll(".delete-event").forEach(l=>{l.addEventListener("click",async d=>{d.stopPropagation();const m=d.target.closest(".delete-event"),v=m==null?void 0:m.getAttribute("data-event-id");if(v&&confirm("Interaktion wirklich löschen?"))try{await ze(r,v),E.removeChild(n),await R()}catch(S){console.error("Error deleting event:",S),alert("Fehler beim Löschen der Interaktion")}})}),n.addEventListener("click",l=>{l.target===n&&E.removeChild(n)})}function ee(){Z&&(clearTimeout(Z),Z=null);const e=document.getElementById("li-notes-bridge");e&&e.remove()}function te(){Z=window.setTimeout(()=>{T&&(T.innerHTML="");const e=document.getElementById("li-notes-bridge");e&&e.remove(),B=null,G=null},200)}function he(e){var o;return B?(e.dataset.liNotesProfile||(e.href?(o=window.normalizeLinkedInProfileUrl)==null?void 0:o.call(window,e.href):null))===B:!1}function Je(e,t){const o=document.getElementById("li-notes-bridge");o&&o.remove();const n=document.createElement("div");n.id="li-notes-bridge",n.style.cssText=`
    position: fixed;
    z-index: 2147483646;
    background: transparent;
    pointer-events: auto;
  `,t.top<e.top?(n.style.left=`${Math.min(e.left,t.left)}px`,n.style.top=`${t.top+t.height}px`,n.style.width=`${Math.max(e.right,t.left+t.width)-Math.min(e.left,t.left)}px`,n.style.height=`${e.top-(t.top+t.height)}px`):(n.style.left=`${Math.min(e.left,t.left)}px`,n.style.top=`${e.bottom}px`,n.style.width=`${Math.max(e.right,t.left+t.width)-Math.min(e.left,t.left)}px`,n.style.height=`${t.top-e.bottom}px`),parseFloat(n.style.height)>0&&(n.addEventListener("mouseenter",ee),n.addEventListener("mouseleave",r=>{const i=r.relatedTarget,s=document.getElementById("li-notes-overlay-host");i&&s&&(s.contains(i)||s===i)||i&&he(i)||te()}),document.body.appendChild(n))}function we(){if(L){L.style.display="flex";return}L=document.createElement("div"),L.style.cssText=`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2147483646;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;const e=document.createElement("div");e.style.cssText=`
    background: white;
    border-radius: 8px;
    padding: 24px;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    position: relative;
  `;const t=document.createElement("button");t.textContent="×",t.style.cssText=`
    position: absolute;
    top: 10px;
    right: 15px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
  `,t.onmouseenter=()=>{t.style.backgroundColor="#f0f0f0"},t.onmouseleave=()=>{t.style.backgroundColor="transparent"},t.onclick=()=>{se()},L.onclick=n=>{n.target===L&&se()};const o=n=>{n.key==="Escape"&&se()};document.addEventListener("keydown",o),Xe(e),e.appendChild(t),L.appendChild(e),document.body.appendChild(L),L.escapeListener=o}function se(){L&&(L.escapeListener&&document.removeEventListener("keydown",L.escapeListener),document.body.removeChild(L),L=null)}async function Xe(e){try{let t=function(p,x,$){const w=document.createElement("div");w.textContent=x,w.style.cssText=`
        color: ${$==="success"?"#155724":"#dc3545"};
        font-size: 14px;
        margin-top: 8px;
        padding: 8px 12px;
        background: ${$==="success"?"#d4edda":"#f8d7da"};
        border: 1px solid ${$==="success"?"#c3e6cb":"#f5c6cb"};
        border-radius: 4px;
      `,p.appendChild(w),setTimeout(()=>{p.contains(w)&&p.removeChild(w)},5e3)};const o=await M(),n=await P(o),a=document.createElement("h1");a.textContent="Connection Manager Einstellungen",a.style.cssText=`
      margin: 0 0 24px 0;
      font-size: 24px;
      font-weight: 600;
      color: #333;
      text-align: center;
    `;const r=document.createElement("div");r.style.cssText=`
      margin-bottom: 32px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #fafafa;
    `;const i=document.createElement("h2");i.textContent="Gewichte",i.style.cssText=`
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #0073b1;
      padding-bottom: 8px;
    `;const s=(p,x,$)=>{const w=document.createElement("div");w.style.cssText=`
        margin-bottom: 16px;
      `;const k=document.createElement("label");k.textContent=p,k.style.cssText=`
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
        color: #333;
      `;const h=document.createElement("input");h.type="number",h.step="0.01",h.value=x.toString(),h.id=$,h.style.cssText=`
        width: 120px;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      `;const H=document.createElement("div");return H.textContent=`Gewichtung für ${p.toLowerCase()} (0-1)`,H.style.cssText=`
        font-size: 12px;
        color: #666;
        margin-top: 4px;
        font-style: italic;
      `,w.appendChild(k),w.appendChild(h),w.appendChild(H),w};r.appendChild(i),r.appendChild(s("Kategorien",n.weights.categories,"w_cat")),r.appendChild(s("Events",n.weights.events,"w_evt")),r.appendChild(s("Empfinden",n.weights.affinity,"w_aff"));const c=document.createElement("div");c.style.cssText=`
      margin-bottom: 32px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #fafafa;
    `;const u=document.createElement("h2");u.textContent="Verfall",u.style.cssText=`
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #0073b1;
      padding-bottom: 8px;
    `;const g=(p,x,$,w)=>{const k=document.createElement("div");k.style.cssText=`
        margin-bottom: 16px;
      `;const h=document.createElement("label");h.textContent=p,h.style.cssText=`
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
        color: #333;
      `;const H=document.createElement("input");H.type="number",H.value=x.toString(),H.id=$,H.style.cssText=`
        width: 120px;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      `;const ce=document.createElement("div");return ce.textContent=w,ce.style.cssText=`
        font-size: 12px;
        color: #666;
        margin-top: 4px;
        font-style: italic;
      `,k.appendChild(h),k.appendChild(H),k.appendChild(ce),k},C=document.createElement("div");C.style.cssText=`
      margin-bottom: 16px;
    `;const b=document.createElement("label");b.textContent="Modus",b.style.cssText=`
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: #333;
    `;const f=document.createElement("select");f.id="d_mode",f.style.cssText=`
      width: 120px;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    `,["exponential","linear","off"].forEach(p=>{const x=document.createElement("option");x.value=p,x.textContent=p,x.selected=n.decay.mode===p,f.appendChild(x)});const _=document.createElement("div");_.textContent="Art des Verfalls: exponential, linear oder aus",_.style.cssText=`
      font-size: 12px;
      color: #666;
      margin-top: 4px;
      font-style: italic;
    `,C.appendChild(b),C.appendChild(f),C.appendChild(_),c.appendChild(u),c.appendChild(g("Start (Tage)",n.decay.decayStartDays,"d_start","Nach wie vielen Tagen beginnt der Verfall")),c.appendChild(g("Halbwert (Tage)",n.decay.halfLifeDays,"d_half","Nach wie vielen Tagen halbiert sich der Wert")),c.appendChild(C);const q=document.createElement("div");q.style.cssText=`
      margin-bottom: 32px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #fafafa;
    `;const l=document.createElement("h2");l.textContent="Datenschutz",l.style.cssText=`
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #0073b1;
      padding-bottom: 8px;
    `;const d=document.createElement("div");d.style.cssText=`
      margin-bottom: 16px;
    `;const m=document.createElement("input");m.type="checkbox",m.id="anonymous-mode",m.checked=n.anonymousMode,m.style.cssText=`
      margin-right: 12px;
      width: 18px;
      height: 18px;
    `;const v=document.createElement("label");v.textContent="Anonymus Modus",v.htmlFor="anonymous-mode",v.style.cssText=`
      font-weight: 500;
      color: #333;
      cursor: pointer;
    `;const S=document.createElement("div");S.textContent="Überdeckt alle Namen auf LinkedIn mit einem geblurten schwarzen Balken",S.style.cssText=`
      font-size: 12px;
      color: #666;
      margin-top: 8px;
      font-style: italic;
    `,d.appendChild(m),d.appendChild(v),q.appendChild(l),q.appendChild(d),q.appendChild(S);const A=document.createElement("div");A.style.cssText=`
      margin-bottom: 32px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #fafafa;
    `;const y=document.createElement("h2");y.textContent="Daten Export/Import",y.style.cssText=`
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #0073b1;
      padding-bottom: 8px;
    `;const N=document.createElement("div");N.style.cssText=`
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-bottom: 12px;
      flex-wrap: wrap;
    `;const I=document.createElement("button");I.textContent="Daten exportieren",I.style.cssText=`
      background: #0073b1;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s;
    `;const O=document.createElement("button");O.textContent="Daten importieren",O.style.cssText=`
      background: #155724;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s;
    `;const K=document.createElement("button");K.textContent="DB Test",K.style.cssText=`
      background: #666;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s;
    `;const ne=document.createElement("button");ne.textContent="Speichern",ne.style.cssText=`
      background: #28a745;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s;
    `;const z=document.createElement("div");z.id="options-message-container",ne.onclick=async()=>{try{const p=parseFloat(document.getElementById("w_cat").value),x=parseFloat(document.getElementById("w_evt").value),$=parseFloat(document.getElementById("w_aff").value),w=p+x+$;if(Math.abs(w-1)>1e-4){t(z,`Summe der Gewichte muss 1 sein. Aktuell: ${w.toFixed(2)}`,"error");return}n.weights={categories:p,events:x,affinity:$},n.decay={mode:document.getElementById("d_mode").value,decayStartDays:parseInt(document.getElementById("d_start").value,10),halfLifeDays:parseInt(document.getElementById("d_half").value,10)},n.anonymousMode=document.getElementById("anonymous-mode").checked,await X(o,n),j=n.anonymousMode,ie(),t(z,"Einstellungen erfolgreich gespeichert!","success")}catch{t(z,"Fehler beim Speichern der Einstellungen","error")}},I.onclick=async()=>{try{I.disabled=!0,I.textContent="Exportiere...";const p=await Y(o),x=await Q(o),$={version:"1.0",settings:n,contacts:p,events:x},w=new Blob([JSON.stringify($,null,2)],{type:"application/json"}),k=URL.createObjectURL(w),h=document.createElement("a");h.href=k,h.download=`linkedin-connections-export-${new Date().toISOString().split("T")[0]}.json`,document.body.appendChild(h),h.click(),document.body.removeChild(h),URL.revokeObjectURL(k),t(z,`Export erfolgreich! ${p.length} Kontakte und ${x.length} Events exportiert.`,"success")}catch(p){console.error("Export error:",p),t(z,"Fehler beim Exportieren der Daten","error")}finally{I.disabled=!1,I.textContent="Daten exportieren"}};const W=document.createElement("input");W.type="file",W.accept=".json",W.style.display="none",document.body.appendChild(W),O.onclick=()=>{W.click()},W.onchange=async p=>{var w;const x=p.target,$=(w=x.files)==null?void 0:w[0];if($)try{O.disabled=!0,O.textContent="Importiere...";const k=await $.text(),h=JSON.parse(k);if(h.version!=="1.0")throw new Error("Unsupported export version");await le(o),await de(o),await ue(o,h.contacts),await pe(o,h.events),t(z,`Import erfolgreich! ${h.contacts.length} Kontakte und ${h.events.length} Events importiert.`,"success")}catch(k){t(z,`Fehler beim Importieren: ${k instanceof Error?k.message:"Unbekannter Fehler"}`,"error")}finally{O.disabled=!1,O.textContent="Daten importieren",x.value=""}},K.onclick=async()=>{try{K.disabled=!0,K.textContent="Teste...";const p=await Y(o),x=await Q(o);console.log("Contacts:",p),console.log("Events:",x),t(z,`DB Test: ${p.length} Kontakte, ${x.length} Events gefunden. Siehe Konsole für Details.`,"success")}catch(p){console.error("DB Test error:",p),t(z,`DB Test Fehler: ${p instanceof Error?p.message:"Unbekannter Fehler"}`,"error")}finally{K.disabled=!1,K.textContent="DB Test"}},N.appendChild(I),N.appendChild(O),N.appendChild(K),N.appendChild(ne),A.appendChild(y),A.appendChild(N),A.appendChild(z),e.appendChild(a),e.appendChild(r),e.appendChild(c),e.appendChild(q),e.appendChild(A)}catch(t){console.error("Error initializing options:",t),e.innerHTML=`<p style="color: red;">Fehler beim Laden der Einstellungen: ${t}</p>`}}window.normalizeLinkedInProfileUrl=J;function Ee(e){for(const t of Ce(e)){if(t.dataset.liNotesBound==="1")continue;t.dataset.liNotesBound="1";const o=t.dataset.liNotesProfile||J(t.href);o&&(t.addEventListener("mouseenter",()=>{Ke(t,o)}),t.addEventListener("mouseleave",n=>{const a=n.relatedTarget,r=document.getElementById("li-notes-overlay-host");if(a&&r&&(r.contains(a)||r===a))return;const i=document.getElementById("li-notes-bridge");a&&i&&(i.contains(a)||i===a)||a&&he(a)||te()}))}}function Ye(e){for(const t of e)t.addedNodes&&t.addedNodes.forEach(o=>{o instanceof HTMLElement&&Ee(o)})}(function(){new MutationObserver(Ye).observe(document.body,{childList:!0,subtree:!0}),Ee(document)})()})();
