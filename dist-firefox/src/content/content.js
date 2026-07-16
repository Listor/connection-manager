(function(){"use strict";function Z(e){try{const t=new URL(e);if(!t.hostname.endsWith("linkedin.com"))return null;const n=t.pathname.match(/^\/in\/([^/]+)\/?$/);return n?`https://www.linkedin.com/in/${n[1]}`:null}catch{return null}}const je=/^(abschnitt hinzufügen|add profile section|profil verbessern|enhance profile|profil bearbeiten|edit profile|anzeigen als|view as|open to|ressourcen|resources|kontaktinfo|contact info|mehr|more)$/i;function me(e){return je.test(e.replace(/\s+/g," ").trim())}function He(e){return e.hasAttribute("aria-disabled")&&!e.querySelector("img")?!0:me(e.textContent??"")}function*Ue(e){const t=e.querySelectorAll('a[href*="/in/"]');for(const n of Array.from(t)){const o=n.href||n.getAttribute("href")||"",r=Z(o);r&&(He(n)||(n.dataset.liNotesProfile=r,yield n))}}function ne(e){switch(Ke(e)){case"comment":return Ge(e);case"feed":return Ve(e);case"profile":return We(e);case"search":return Ye(e);case"connection":return Je(e);case"message":return Xe(e);case"notification":return Qe(e);default:return ge(e)}}function Ke(e){return e.classList.contains("comments-comment-meta__description-container")||e.querySelector(".comments-comment-meta__description-title")?"comment":e.querySelector(".update-components-actor__title")||e.querySelector(".feed-shared-actor__title")?"feed":e.querySelector(".pv-text-details__left-panel h1")||e.querySelector(".text-heading-xlarge")?"profile":e.querySelector(".entity-result__title-text")||e.querySelector(".search-result__info .actor-name")?"search":e.querySelector(".mn-connection-card__name")||e.querySelector(".connection-card__name")||e.querySelector(".invitation-card__name")?"connection":e.querySelector(".msg-conversations-container__name")||e.querySelector(".msg-conversation-card__participant-name")?"message":e.querySelector(".notification-actor__name")?"notification":"generic"}function Ge(e){var o;const t=e.querySelector(".comments-comment-meta__description-title");if(t){const r=(o=t.textContent)==null?void 0:o.trim();if(r&&r.length>0)return r}const n=e.querySelector('a[href*="/in/"]');return n?ge(n):null}function Ve(e){var r,a,i;const t=e.querySelectorAll('a[href*="/in/"]');for(const s of Array.from(t)){const c=ge(s);if(c)return c}const n=e.querySelector(".update-components-actor__title");if(n){const s=n.querySelectorAll(".update-components-actor__single-line-truncate");for(const u of Array.from(s)){const f=(r=u.textContent)==null?void 0:r.trim();if(f&&f.length>0&&!f.includes("•")&&!/\d+\.$/.test(f))return f.replace(/(.+)\1/,"$1").trim()}const c=(a=n.textContent)==null?void 0:a.trim();if(c&&c.length>0)return c}const o=[".update-components-actor__name",".feed-shared-actor__name",".feed-shared-actor__title"];for(const s of o){const c=e.querySelector(s);if(c){const u=(i=c.textContent)==null?void 0:i.trim();if(u&&u.length>0)return u}}return null}function We(e){var n;const t=[".pv-text-details__left-panel h1",".text-heading-xlarge",".pv-top-card-section__name"];for(const o of t){const r=e.querySelector(o);if(r){const a=(n=r.textContent)==null?void 0:n.trim();if(a&&a.length>0)return a}}return null}function Ye(e){var n;const t=[".entity-result__title-text",".search-result__info .actor-name",".search-result__title"];for(const o of t){const r=e.querySelector(o);if(r){const a=(n=r.textContent)==null?void 0:n.trim();if(a&&a.length>0)return a}}return null}function Je(e){var n;const t=[".mn-connection-card__name",".invitation-card__name",".connection-card__name"];for(const o of t){const r=e.querySelector(o);if(r){const a=(n=r.textContent)==null?void 0:n.trim();if(a&&a.length>0)return a}}return null}function Xe(e){var n;const t=[".msg-conversations-container__name",".msg-conversation-card__participant-name"];for(const o of t){const r=e.querySelector(o);if(r){const a=(n=r.textContent)==null?void 0:n.trim();if(a&&a.length>0)return a}}return null}function Qe(e){var n;const t=[".notification-actor__name",".reactions-detail__actor-name"];for(const o of t){const r=e.querySelector(o);if(r){const a=(n=r.textContent)==null?void 0:n.trim();if(a&&a.length>0)return a}}return null}function fe(e){var n;if(!e)return null;const t=(n=e.split(/[•·\n\r\t]/)[0])==null?void 0:n.trim();return t&&t.length>0&&t.length<100?t:null}function ge(e){var i,s;const t=[".artdeco-entity-lockup__title",".comment-actor__name"];for(const c of t){const u=e.querySelector(c);if(u){const f=u.querySelector('span[aria-hidden="true"]'),C=fe((f??u).textContent);if(C)return C}}const n=e.querySelector('span[aria-hidden="true"]'),o=fe(n==null?void 0:n.textContent);if(o)return o;const r=((i=e.innerText)==null?void 0:i.trim())||((s=e.textContent)==null?void 0:s.trim()),a=fe(r);if(a){const c=a.replace(/\s+(CEO|CTO|CFO|COO|VP|Director|Manager|Lead|Senior|Junior|Associate|Intern)\b.*$/i,"").replace(/\s+at\s+.*$/i,"").replace(/\s+@\s+.*$/i,"").trim();return c&&c.length>0&&c.length<100?c:a}return Ze(e)}function Ze(e){const t=e.dataset.liNotesProfile||Z(e.href);if(!t)return null;const n=[`a[data-li-notes-profile="${t}"]`,`a[href*="${t.replace("https://www.linkedin.com/in/","/in/")}"]`];let o=e.parentElement;const r=3;let a=0;for(;o&&a<r;){for(const i of n){const s=o.querySelectorAll(i);for(const c of Array.from(s)){if(c===e||(c.dataset.liNotesProfile||Z(c.href))!==t)continue;const f=ne(c);if(f)return f}}o=o.parentElement,a++}return null}const Re="li-notes",et=2;let Y=null;function D(){return Y||(Y=new Promise((e,t)=>{const n=indexedDB.open(Re,et);n.onupgradeneeded=o=>{const r=o.target.result;if(r.objectStoreNames.contains("settings")||r.createObjectStore("settings",{keyPath:"id"}),!r.objectStoreNames.contains("contacts")){const a=r.createObjectStore("contacts",{keyPath:"profileUrl"});a.createIndex("byName","displayName",{unique:!1}),a.createIndex("byCategory","categoryId",{unique:!1})}if(!r.objectStoreNames.contains("events")){const a=r.createObjectStore("events",{keyPath:"id"});a.createIndex("byProfileUrl","profileUrl",{unique:!1}),a.createIndex("byTimestampDesc","timestamp",{unique:!1})}},n.onsuccess=()=>{n.result.onclose=()=>{Y=null},e(n.result)},n.onerror=()=>{Y=null,t(n.error)}}),Y)}function L(e,t,n){return e.transaction(t,n)}async function F(e){const o=L(e,["settings"],"readonly").objectStore("settings").get("default"),r=await new Promise((i,s)=>{o.onsuccess=()=>i(o.result),o.onerror=()=>s(o.error)});if(r){let i=!1;const s={...r};return s.categories&&(s.categories=s.categories.map(c=>{if(!c.emoticon){i=!0;let u="🤝";return c.id==="business"?u="💼":c.id==="colleague"?u="👥":c.id==="acquaintance"&&(u="🤝"),{...c,emoticon:u}}return c})),i?(await oe(e,s),s):r}const a=ot;return await oe(e,a),a}function oe(e,t){const n=L(e,["settings"],"readwrite");return n.objectStore("settings").put(t),new Promise((r,a)=>{n.oncomplete=()=>r(),n.onerror=()=>a(n.error)})}function M(e,t){const r=L(e,["contacts"],"readonly").objectStore("contacts").get(t);return new Promise((a,i)=>{r.onsuccess=()=>a(r.result),r.onerror=()=>i(r.error)})}function J(e,t){const n=L(e,["contacts"],"readwrite");return n.objectStore("contacts").put(t),new Promise((r,a)=>{n.oncomplete=()=>r(),n.onerror=()=>a(n.error)})}function we(e,t){const r=L(e,["events"],"readonly").objectStore("events").index("byProfileUrl").getAll(t);return new Promise((a,i)=>{r.onsuccess=()=>a(r.result||[]),r.onerror=()=>i(r.error)})}function tt(e,t){const n=L(e,["events"],"readwrite");return n.objectStore("events").put(t),new Promise((o,r)=>{n.oncomplete=()=>o(),n.onerror=()=>r(n.error)})}function nt(e,t){const n=L(e,["events"],"readwrite");return n.objectStore("events").delete(t),new Promise((o,r)=>{n.oncomplete=()=>o(),n.onerror=()=>r(n.error)})}function re(e){const o=L(e,["contacts"],"readonly").objectStore("contacts").getAll();return new Promise((r,a)=>{o.onsuccess=()=>r(o.result||[]),o.onerror=()=>a(o.error)})}function ae(e){const o=L(e,["events"],"readonly").objectStore("events").getAll();return new Promise((r,a)=>{o.onsuccess=()=>r(o.result||[]),o.onerror=()=>a(o.error)})}function Ee(e){const t=L(e,["contacts"],"readwrite");return t.objectStore("contacts").clear(),new Promise((o,r)=>{t.oncomplete=()=>o(),t.onerror=()=>r(t.error)})}function Ce(e){const t=L(e,["events"],"readwrite");return t.objectStore("events").clear(),new Promise((o,r)=>{t.oncomplete=()=>o(),t.onerror=()=>r(t.error)})}function ke(e,t){const n=L(e,["contacts"],"readwrite"),o=n.objectStore("contacts");return t.forEach(r=>{o.put(r)}),new Promise((r,a)=>{n.oncomplete=()=>r(),n.onerror=()=>a(n.error)})}function Se(e,t){const n=L(e,["events"],"readwrite"),o=n.objectStore("events");return t.forEach(r=>{o.put(r)}),new Promise((r,a)=>{n.oncomplete=()=>r(),n.onerror=()=>a(n.error)})}const ot={id:"default",lang:"de",weights:{categories:.2,events:.1,affinity:.33},decay:{mode:"exponential",decayStartDays:21,halfLifeDays:90},anonymousMode:!1,categories:[{id:"business",label_de:"Geschäftsbeziehung",label_en:"Business relationship",value:80,color:"#28a745",emoticon:"💼"},{id:"colleague",label_de:"Kollege",label_en:"Colleague",value:60,color:"#007bff",emoticon:"👥"},{id:"acquaintance",label_de:"Bekanntschaft",label_en:"Acquaintance",value:40,color:"#ffc107",emoticon:"🤝"}],eventTypes:[{id:"meeting",label_de:"Treffen",label_en:"Meeting"},{id:"call",label_de:"Telefonat",label_en:"Call"},{id:"lunch",label_de:"Mittagessen",label_en:"Lunch"}],scoreBands:[{id:"weak",label_de:"Schwach",label_en:"Weak",min:0,max:24},{id:"low",label_de:"Gering",label_en:"Low",min:25,max:49},{id:"medium",label_de:"Mittel",label_en:"Medium",min:50,max:74},{id:"strong",label_de:"Stark",label_en:"Strong",min:75,max:89},{id:"vstrong",label_de:"Sehr stark",label_en:"Very strong",min:90,max:100}]};function rt(e,t){if(t.mode==="off"||e<=t.decayStartDays)return 1;const n=e-t.decayStartDays;if(t.mode==="exponential")return Math.pow(.5,n/t.halfLifeDays);const o=2*t.halfLifeDays;return Math.max(0,1-n/o)}function at(e,t,n){if(!e.length)return 0;const o=e.reduce((r,a)=>{const i=Math.max(0,(t.getTime()-new Date(a.timestamp).getTime())/864e5),s=rt(i,n),u=a.points*20*s;return console.log(`Event: ${a.points} points, age: ${i.toFixed(2)} days, decay: ${s.toFixed(3)}, contribution: ${u.toFixed(1)}`),r+u},0);return console.log(`Total event score: ${o.toFixed(1)}`),Math.max(0,o)}function it(e,t,n,o){const r=o.categories*e,a=o.events*t,i=o.affinity*n,s=r+a+i;return console.log("Total score calculation:"),console.log(`  Category: ${e} × ${o.categories} = ${r.toFixed(1)}`),console.log(`  Events: ${t.toFixed(1)} × ${o.events} = ${a.toFixed(1)}`),console.log(`  Affinity: ${n} × ${o.affinity} = ${i.toFixed(1)}`),console.log(`  Total: ${s.toFixed(1)} → ${Math.round(s)}`),Math.round(Math.max(0,Math.min(100,s)))}const st={business:'<rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>',colleague:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',acquaintance:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',friend:'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',family:'<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'},ct='<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>';function lt(e){return`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${st[e]??ct}</svg>`}function dt(){return`
    /* Imported shared CSS styles (adapted for shadow DOM) */
    /* Shared styles for the Connection Manager overlay UI */
    
    * {
      font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont,
        "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      box-sizing: border-box;
    }
    
    /* Design tokens — dark, deliberately distinct from LinkedIn */
    :host {
      color-scheme: dark;
      --accent: #7c7ff2;
      --accent-strong: #6366f1;
      --accent-soft: rgba(124, 127, 242, 0.16);
      --surface: rgba(19, 21, 28, 0.97);
      --surface-solid: #14161d;
      --surface-raised: rgba(255, 255, 255, 0.05);
      --surface-hover: rgba(255, 255, 255, 0.1);
      --border-color: rgba(255, 255, 255, 0.1);
      --border-strong: rgba(255, 255, 255, 0.2);
      --text-primary: #f2f4f8;
      --text-secondary: #a3abbd;
      --text-muted: #737d91;
      --error-color: #f87171;
      --error-bg: rgba(248, 113, 113, 0.12);
      --error-border: rgba(248, 113, 113, 0.3);
      --success-color: #4ade80;
      --success-bg: rgba(74, 222, 128, 0.12);
      --success-border: rgba(74, 222, 128, 0.3);
      --focus-ring: 0 0 0 3px rgba(124, 127, 242, 0.25);
    }
    
    /* Buttons */
    button {
      border: 1px solid var(--border-color);
      background: var(--surface-raised);
      color: var(--text-primary);
      border-radius: 8px;
      padding: 7px 12px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.01em;
      white-space: nowrap;
      transition: background 0.15s ease, border-color 0.15s ease,
        transform 0.1s ease, box-shadow 0.15s ease;
    }
    
    button:hover {
      background: var(--surface-hover);
      border-color: var(--border-strong);
    }
    
    button.primary {
      background: linear-gradient(135deg, #7c7ff2, #5b8cf7);
      border: 1px solid transparent;
      color: #fff;
      font-weight: 600;
      padding: 9px 18px;
      min-width: 110px;
      box-shadow: 0 2px 12px rgba(99, 102, 241, 0.35);
    }
    
    button.primary:hover {
      filter: brightness(1.08);
      box-shadow: 0 4px 16px rgba(99, 102, 241, 0.45);
    }
    
    button:active {
      transform: translateY(1px);
    }
    
    button:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      transform: none;
    }
    
    /* Inputs */
    input[type="number"],
    input[type="text"],
    input[type="datetime-local"],
    select,
    textarea {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      font-size: 13px;
      background: var(--surface-raised);
      color: var(--text-primary);
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    
    input[type="number"]:focus,
    input[type="text"]:focus,
    input[type="datetime-local"]:focus,
    select:focus,
    textarea:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: var(--focus-ring);
    }
    
    select option {
      background: var(--surface-solid);
      color: var(--text-primary);
    }
    
    input[type="range"] {
      accent-color: var(--accent);
    }
    
    /* Labels */
    label {
      display: block;
      margin-bottom: 6px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-muted);
    }
    
    /* Tooltip card */
    .card {
      background: var(--surface);
      backdrop-filter: blur(16px) saturate(1.3);
      -webkit-backdrop-filter: blur(16px) saturate(1.3);
      border: 1px solid var(--border-color);
      border-radius: 14px;
      padding: 14px 14px 12px 17px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.35),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);
      position: relative;
      width: 400px;
      overflow: hidden;
      color: var(--text-primary);
      transform-origin: 14px 14px;
      animation: card-in 0.18s cubic-bezier(0.2, 0.8, 0.3, 1);
    }
    
    /* The card expands out of the bubble sitting at its top-left corner */
    @keyframes card-in {
      from {
        opacity: 0;
        transform: scale(0.25);
      }
    }
    
    .card-out {
      animation: card-out 0.13s ease-in forwards;
      pointer-events: none;
    }
    
    @keyframes card-out {
      to {
        opacity: 0;
        transform: scale(0.6);
      }
    }
    
    /* Hover bubble that opens the card on click */
    .details-bubble {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 999px;
      border: 1px solid var(--border-color);
      background: var(--surface);
      backdrop-filter: blur(16px) saturate(1.3);
      -webkit-backdrop-filter: blur(16px) saturate(1.3);
      color: var(--text-secondary);
      cursor: pointer;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);
      animation: bubble-in 0.18s cubic-bezier(0.2, 0.8, 0.3, 1);
      transition: color 0.15s ease, border-color 0.15s ease,
        background 0.15s ease;
    }
    
    /* Fades up out of the element it belongs to */
    @keyframes bubble-in {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
    }
    
    .details-bubble:hover {
      color: var(--accent);
      border-color: var(--border-strong);
      background: var(--surface-solid);
    }
    
    .details-bubble svg {
      width: 15px;
      height: 15px;
      pointer-events: none;
    }
    
    /* Category accent bar (card and dialogs) */
    .category-accent {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: var(--border-strong);
    }
    
    /* Loading placeholders */
    .skeleton {
      display: inline-block;
      height: 12px;
      max-width: 100%;
      border-radius: 6px;
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.06) 25%,
        rgba(255, 255, 255, 0.14) 50%,
        rgba(255, 255, 255, 0.06) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.2s ease-in-out infinite;
    }
    
    @keyframes shimmer {
      from {
        background-position: 200% 0;
      }
      to {
        background-position: -200% 0;
      }
    }
    
    /* Dialogs */
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(8, 9, 12, 0.6);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      z-index: 2147483648;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: overlay-in 0.15s ease-out;
    }
    
    @keyframes overlay-in {
      from {
        opacity: 0;
      }
    }
    
    .dialog {
      background: var(--surface-solid);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 20px;
      max-width: 420px;
      width: 90%;
      max-height: 85vh;
      overflow-x: hidden;
      overflow-y: auto;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);
      position: relative;
      color: var(--text-primary);
    }
    
    .dialog {
      animation: dialog-in 0.18s cubic-bezier(0.2, 0.8, 0.3, 1);
    }
    
    @keyframes dialog-in {
      from {
        opacity: 0;
        transform: translateY(8px) scale(0.97);
      }
    }
    
    .dialog h3 {
      margin: 0 0 18px 0;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }
    
    .dialog-row {
      margin-bottom: 14px;
    }
    
    .dialog-buttons {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 18px;
    }
    
    .dialog-buttons button {
      padding: 8px 16px;
    }
    
    /* Messages */
    .error {
      color: var(--error-color);
      font-size: 13px;
      margin-top: 8px;
      padding: 8px 12px;
      background: var(--error-bg);
      border: 1px solid var(--error-border);
      border-radius: 8px;
    }
    
    .success {
      color: var(--success-color);
      font-size: 13px;
      margin-top: 8px;
      padding: 8px 12px;
      background: var(--success-bg);
      border: 1px solid var(--success-border);
      border-radius: 8px;
    }
    
    /* Utility text */
    .small {
      color: var(--text-secondary);
      font-size: 12px;
    }
    
    .muted {
      color: var(--text-muted);
    }
    
    .help-text {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 4px;
    }
    
    .url-text {
      word-break: break-all;
      font-size: 12px;
      color: var(--text-muted);
    }
    
    /* Layout */
    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
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
    
    .interaction-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 6px;
    }
    
    .interaction-text {
      color: var(--text-muted);
      font-size: 12px;
      font-weight: 400;
    }
    
    .category-chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--surface-raised);
      flex-shrink: 0;
    }
    
    .category-chip svg {
      width: 14px;
      height: 14px;
    }
    
    /* Badges & score */
    .badge {
      padding: 3px 9px;
      border-radius: 999px;
      border: 1px solid var(--border-color);
      background: var(--surface-raised);
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--text-secondary);
    }
    
    .score {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .score-number {
      font-size: 15px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      color: var(--text-primary);
    }
    
    .score-badge {
      font-size: 11px;
      color: var(--text-secondary);
    }
    
    .delete-event__label {
      position: relative;
      top: -2px;
    }
    
    .card-content {
      margin-bottom: 12px;
      min-height: 80px;
    }
    
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
      border-radius: 4px;
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
      background: transparent;
      border-color: var(--border-color);
      color: var(--text-secondary);
    }

    .dialog-buttons button.secondary:hover {
      background: var(--surface-raised);
      color: var(--text-primary);
    }

    /* Points grid for event dialogs */
    .points-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 6px;
      margin-top: 4px;
    }

    .points-grid button {
      padding: 8px;
      border: 1px solid var(--border-color);
      background: var(--surface-raised);
      border-radius: 8px;
      cursor: pointer;
      font-variant-numeric: tabular-nums;
    }

    .points-grid button.selected {
      background: linear-gradient(135deg, #7c7ff2, #5b8cf7);
      color: #fff;
      border-color: transparent;
      box-shadow: 0 2px 10px rgba(99, 102, 241, 0.35);
    }

    /* Events list specific styles */
    .events-list {
      max-height: 200px;
      overflow-y: auto;
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 4px;
    }

    .event-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 8px;
      border-radius: 8px;
      gap: 8px;
    }

    .event-item:hover {
      background: var(--surface-raised);
    }

    .event-item + .event-item {
      border-top: 1px solid var(--border-color);
    }

    .event-info {
      flex: 1;
    }

    .event-date {
      font-weight: 600;
      font-size: 12px;
      color: var(--text-primary);
    }

    .event-type {
      color: var(--text-secondary);
      font-size: 12px;
    }

    .event-points {
      color: var(--accent);
      font-weight: 600;
      font-size: 12px;
    }

    .event-note {
      color: var(--text-muted);
      font-size: 11px;
      margin-top: 4px;
    }

    .delete-event {
      background: transparent;
      color: var(--text-muted);
      border: 1px solid var(--border-color);
      border-radius: 50%;
      width: 20px;
      height: 20px;
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
      padding: 0;
    }

    .delete-event:hover {
      background: var(--error-bg);
      color: var(--error-color);
      border-color: var(--error-border);
    }

    .no-events {
      color: var(--text-muted);
      text-align: center;
      padding: 16px;
      font-size: 12px;
    }
  `}const ut=typeof browser<"u"?browser:chrome;let h=null,m=null,ie=null,se=null,z=null,j=null,T=null,H=!1,x=null,R=null,be=null,ce=null,X=null;function pt(){const e=document.createElement("div");return e.style.cssText=`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #000;
    border-radius: 4px;
    z-index: 10;
    pointer-events: none;
  `,e}function xe(){if(!H){document.querySelectorAll(".li-anonymous-overlay").forEach(t=>t.remove());return}['a[href*="/in/"] span',".entity-result__title-text",".pv-text-details__left-panel h1",".text-heading-xlarge",".text-body-large",".artdeco-entity-lockup__title",".feed-identity-module__actor-name",".comment-actor__name",".post-meta__actor-name",".msg-conversations-container__name",".conversation__participant-name",".search-result__info .actor-name",".notification-item__actor-name",".feed-shared-actor__name",".feed-shared-comment-v2__actor-name",".feed-shared-update-v2__actor-name"].forEach(t=>{document.querySelectorAll(t).forEach(o=>{if(o instanceof HTMLElement){if(o.dataset.anonymousProcessed)return;o.dataset.anonymousProcessed="true",window.getComputedStyle(o).position==="static"&&(o.style.position="relative");const a=pt();a.className="li-anonymous-overlay",a.style.position="absolute",a.style.top="0",a.style.left="0",a.style.width="100%",a.style.height="100%",o.appendChild(a)}})})}async function _e(){try{const e=await D();H=(await F(e)).anonymousMode,xe()}catch(e){console.error("Error updating anonymous mode:",e)}}_e(),new MutationObserver(()=>{H&&xe()}).observe(document.body,{childList:!0,subtree:!0}),document.addEventListener("keydown",e=>{e.ctrlKey&&e.shiftKey&&e.key==="O"&&(e.preventDefault(),Pe())}),ut.runtime.onMessage.addListener((e,t,n)=>{if(e.type==="INDEXEDDB_REQUEST")return mt(e.request).then(n),!0;if(e.type==="OPEN_OPTIONS")return Pe(),n({success:!0}),!0;if(e.type==="SETTINGS_UPDATED")return _e(),n({success:!0}),!0});async function mt(e){try{console.log("Content script handling IndexedDB request:",e);const t=await D();switch(e.type){case"GET_ALL_CONTACTS":return{success:!0,data:await re(t)};case"GET_ALL_EVENTS":return{success:!0,data:await ae(t)};case"CLEAR_ALL_CONTACTS":return await Ee(t),{success:!0};case"CLEAR_ALL_EVENTS":return await Ce(t),{success:!0};case"IMPORT_CONTACTS":return await ke(t,e.data),{success:!0};case"IMPORT_EVENTS":return await Se(t,e.data),{success:!0};case"GET_SETTINGS":return{success:!0,data:await F(t)};case"PUT_SETTINGS":return await oe(t,e.data),{success:!0};case"EXPORT_DATA":const a=await re(t),i=await ae(t);return{success:!0,data:{version:"1.0",settings:await F(t),contacts:a,events:i}};default:return{success:!1,error:"Unknown request type"}}}catch(t){return console.error("Content script IndexedDB error:",t),{success:!1,error:t instanceof Error?t.message:"Unknown error"}}}function Te(){if(m)return;const e=document.createElement("div");e.id="li-notes-overlay-host",e.style.position="fixed",e.style.zIndex="2147483647",e.style.top="0",e.style.left="0",document.documentElement.appendChild(e),h=e.attachShadow({mode:"open"}),m=document.createElement("div");const t=document.createElement("style");t.textContent=dt(),h.append(t,m)}function ft(e,t){if(!m)return;const n=window.innerWidth,o=window.innerHeight,r=(t==null?void 0:t.width)||380,a=(t==null?void 0:t.height)||140;let i,s;X?(i=e.left+X.dx,s=e.top+X.dy):(i=e.left,s=e.top+e.height+10),i<12&&(i=12),i+r>n-12&&(i=n-r-12),s+a>o-12&&(s=X?o-a-12:e.top-a-10),s<12&&(s=12),m.style.position="absolute",m.style.left=`${i}px`,m.style.top=`${s}px`,_t(e,{left:i,top:s,width:r,height:a})}function le(){if(!m||!j||!m.firstElementChild)return;const e=j.getBoundingClientRect(),t=m.firstElementChild.getBoundingClientRect();ft(e,{width:t.width,height:t.height})}const gt=`
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
`;function Le(){if(!x||!R)return;const e=R.getBoundingClientRect(),t=x.offsetWidth||28,n=x.offsetHeight||28;let o=e.left,r=e.top-n-6;o<4&&(o=4),o+t>window.innerWidth-4&&(o=window.innerWidth-t-4),r<4&&(r=e.bottom+6),x.style.left=`${o}px`,x.style.top=`${r}px`}function $e(){de(),R=null,be=null,x&&(x.style.display="none")}function de(){ce&&(clearTimeout(ce),ce=null)}function Ne(){de(),ce=window.setTimeout($e,250)}function bt(e,t){Te(),h&&(m&&m.childElementCount>0||(de(),x||(x=document.createElement("div"),x.className="details-bubble",x.title="Details anzeigen",x.innerHTML=gt,x.addEventListener("mouseenter",de),x.addEventListener("mouseleave",()=>Ne()),x.addEventListener("click",n=>{n.preventDefault(),n.stopPropagation();const o=R,r=be,a={left:parseFloat(x.style.left)||0,top:parseFloat(x.style.top)||0};$e(),o&&r&&wt(o,r,a)}),h.appendChild(x)),R=e,be=t,x.style.display="flex",x.style.animation="none",x.offsetWidth,x.style.animation="",Le()))}function Ie(){le(),Le()}window.addEventListener("scroll",Ie,{capture:!0,passive:!0}),window.addEventListener("resize",Ie,{passive:!0});function xt(e){return e<=24?"Schwach":e<=49?"Gering":e<=74?"Mittel":e<=89?"Stark":"Sehr stark"}function yt(e){switch(e){case"meeting":return"Treffen";case"call":return"Telefonat";case"lunch":return"Mittagessen";default:return e}}function ee(e,t){const n=t.categories.find(o=>o.id===e);return(n==null?void 0:n.color)||"#ccc"}function vt(e,t){const n=t.categories.find(o=>o.id===e);return(n==null?void 0:n.label_de)||e}let V=null;function De(){if(!m)return null;let e=m.firstElementChild;return e||(e=document.createElement("div"),e.className="card",e.addEventListener("mouseenter",ue),e.addEventListener("mouseleave",()=>ze()),e.addEventListener("click",async t=>{const n=t.target;if(n.tagName==="BUTTON"&&V){const o=n.getAttribute("data-act");await Et(o,V.profileUrl,V.contact,V.name)}}),m.appendChild(e)),e}function Ae(e){return`<div style="position: relative;">${e||'<span class="skeleton" style="width: 120px"></span>'}${H?'<div class="anonymous-overlay"></div>':""}</div>`}function ht(e){const t=De();t&&(V=null,t.innerHTML=`
    <div class="category-accent"></div>
    <div class="card-content">
      <div class="row">${Ae(e)}<div class="score"><span class="skeleton" style="width: 36px"></span></div></div>
      <div class="interaction-row">
        <div class="interaction-text"><span class="skeleton" style="width: 150px"></span></div>
        <span class="skeleton" style="width: 26px; height: 26px; border-radius: 8px;"></span>
      </div>
      <div class="small"></div>
    </div>
    <div class="button-row">
      <button data-act="add-evt" disabled>Interaktion +</button>
      <button data-act="add-note" disabled>Notiz +</button>
      <button data-act="details" disabled>Details</button>
    </div>
  `,le())}function qe(e){const t=De();t&&(V=e,t.innerHTML=`
    <div class="category-accent" style="background: ${e.categoryColor}"></div>
    <div class="card-content">
      <div class="row">${Ae(e.name)}<div class="score"><span class="score-number">${e.scoreDisplay}</span><span class="score-badge">${e.badgeDisplay}</span></div></div>
      <div class="interaction-row">
        <div class="interaction-text">${e.interactionText}</div>
        <span class="category-chip" title="${e.categoryLabel}" style="color: ${e.categoryColor}; background: color-mix(in srgb, ${e.categoryColor} 14%, transparent); border-color: color-mix(in srgb, ${e.categoryColor} 35%, transparent);">${lt(e.categoryId)}</span>
      </div>
      <div class="small">${e.notes}</div>
    </div>
    <div class="button-row">
      <button data-act="add-evt">Interaktion +</button>
      <button data-act="add-note">Notiz +</button>
      <button data-act="details">Details</button>
    </div>
  `,le())}async function Me(e,t){var N,d;const n=await D(),o=await F(n);let r=await M(n,t);const a=await we(n,t);let i=r==null?void 0:r.displayName;if(i&&me(i)&&(i=void 0),!i){const l=ne(e);l&&(r?r.displayName=l:r={profileUrl:t,displayName:l,categoryId:"acquaintance",affinity:0},await J(n,r),i=l)}i||(i=((N=e.textContent)==null?void 0:N.trim())||"—");const s=at(a,new Date,o.decay),c=r?((d=o.categories.find(l=>l.id===r.categoryId))==null?void 0:d.value)??0:0,u=(r==null?void 0:r.affinity)??0,f=a.length>0,C=u>0,g=(r==null?void 0:r.categoryId)&&r.categoryId!=="acquaintance";let b,k;if(!f&&!C&&!g)b="N/A",k="";else{const l=it(c,s,u,o.weights);b=l.toString(),k=`<span class="badge">${xt(l)}</span>`}const $=(r==null?void 0:r.categoryId)||"acquaintance";return{profileUrl:t,name:i,scoreDisplay:b,badgeDisplay:k,interactionText:a.length?`Letzte Interaktion: ${new Date(Math.max(...a.map(l=>+new Date(l.timestamp)))).toLocaleDateString()}`:"Keine Interaktionen",categoryId:$,categoryColor:ee($,o),categoryLabel:vt($,o),notes:r!=null&&r.notes?r.notes.split(`
`)[0]:"",contact:r}}async function te(){if(!j||!z)return;const e=z,t=j,n=await Me(t,e);z!==e||j!==t||qe(n)}async function wt(e,t,n){if(Te(),!m||!h)return;if(ue(),n){const a=e.getBoundingClientRect();X={dx:n.left-a.left,dy:n.top-a.top}}const o=z===t&&m.childElementCount>0;if(z=t,j=e,o){le();return}ht(ne(e)??"");const r=await Me(e,t);z!==t||j!==e||qe(r)}async function Et(e,t,n,o){switch(e){case"add-evt":await Ct(t,o);break;case"add-note":await kt(t,n);break;case"details":await St(t,n,o);break}}async function Ct(e,t){if(!h)return;const n=document.createElement("div");n.className="dialog-overlay";const o=document.createElement("div");o.className="dialog";let r="meeting",a=3;const i=await D(),s=await F(i),c=await M(i,e),u=ee((c==null?void 0:c.categoryId)||"acquaintance",s);o.innerHTML=`
      <h3>Interaktion hinzufügen</h3>
      <div class="dialog-row">
        <label>Für</label>
        <div style="position: relative; font-size: 13px; font-weight: 600;">${t}${H?'<div class="anonymous-overlay"></div>':""}</div>
      </div>
      <div class="dialog-row">
        <label for="event-type">Typ</label>
        <select id="event-type">
          <option value="meeting">Treffen</option>
          <option value="call">Telefonat</option>
          <option value="lunch">Mittagessen</option>
        </select>
      </div>
      <div class="dialog-row">
        <label>Bewertung</label>
        <div class="points-grid">
          <button data-points="1">1</button>
          <button data-points="2">2</button>
          <button data-points="3" class="selected">3</button>
          <button data-points="4">4</button>
          <button data-points="5">5</button>
        </div>
      </div>
           <div class="dialog-row">
         <label for="event-datetime">Datum & Uhrzeit</label>
         <input type="datetime-local" id="event-datetime" />
       </div>
       <div class="dialog-row">
         <label for="event-note">Notiz (optional)</label>
         <textarea id="event-note" placeholder="Details zur Interaktion..."></textarea>
       </div>
      <div class="dialog-buttons">
        <button class="secondary" id="cancel-event">Abbrechen</button>
        <button class="primary" id="save-event">Speichern</button>
      </div>
      <div class="category-accent" style="background: ${u};"></div>
    `,o.style.position="relative",n.appendChild(o),h.appendChild(n);const f=o.querySelector("#event-type"),C=o.querySelectorAll(".points-grid button"),g=o.querySelector("#event-datetime"),b=o.querySelector("#event-note"),k=o.querySelector("#cancel-event"),$=o.querySelector("#save-event"),N=new Date,d=N.getFullYear(),l=String(N.getMonth()+1).padStart(2,"0"),w=String(N.getDate()).padStart(2,"0"),U=String(N.getHours()).padStart(2,"0"),O=String(N.getMinutes()).padStart(2,"0");g.value=`${d}-${l}-${w}T${U}:${O}`,f.addEventListener("change",I=>{r=I.target.value}),C.forEach(I=>{I.addEventListener("click",()=>{C.forEach(A=>A.classList.remove("selected")),I.classList.add("selected"),a=Number(I.getAttribute("data-points"))})}),k.addEventListener("click",()=>{h.removeChild(n)}),$.addEventListener("click",async()=>{const I=b.value.trim(),A=g.value;try{const W=await D(),B={id:crypto.randomUUID(),profileUrl:e,typeId:r,timestamp:A?new Date(A).toISOString():new Date().toISOString(),points:a,note:I||void 0};await tt(W,B),h.removeChild(n),await te()}catch(W){console.error("Error adding event:",W),alert("Fehler beim Speichern des Events")}}),n.addEventListener("click",I=>{I.target===n&&h.removeChild(n)})}async function kt(e,t){if(!h)return;const n=document.createElement("div");n.className="dialog-overlay";const o=document.createElement("div");o.className="dialog";const r=(t==null?void 0:t.notes)||"",a=await D(),i=await F(a),s=ee((t==null?void 0:t.categoryId)||"acquaintance",i);o.innerHTML=`
       <h3>Notiz bearbeiten</h3>
       <div class="dialog-row">
         <label for="contact-note">Notiz</label>
         <textarea id="contact-note" placeholder="Notizen zu diesem Kontakt...">${r}</textarea>
       </div>
       <div class="dialog-buttons">
         <button class="secondary" id="cancel-note">Abbrechen</button>
         ${r?'<button class="secondary" id="remove-note">Entfernen</button>':""}
         <button class="primary" id="save-note">Speichern</button>
       </div>
       <div class="category-accent" style="background: ${s};"></div>
     `,o.style.position="relative",n.appendChild(o),h.appendChild(n);const c=o.querySelector("#contact-note"),u=o.querySelector("#cancel-note"),f=o.querySelector("#save-note"),C=o.querySelector("#remove-note");u.addEventListener("click",()=>{h.removeChild(n)}),C&&C.addEventListener("click",async()=>{try{const g=await D();let b=await M(g,e);b||(b={profileUrl:e,displayName:"Unbekannt",categoryId:"acquaintance",affinity:0}),b.notes=void 0,await J(g,b),h.removeChild(n),await te()}catch(g){console.error("Error removing note:",g),alert("Fehler beim Entfernen der Notiz")}}),f.addEventListener("click",async()=>{const g=c.value.trim();try{const b=await D();let k=await M(b,e);k?k.notes=g:k={profileUrl:e,displayName:"Unbekannt",categoryId:"acquaintance",affinity:0,notes:g},await J(b,k),h.removeChild(n),await te()}catch(b){console.error("Error saving note:",b),alert("Fehler beim Speichern der Notiz")}}),n.addEventListener("click",g=>{g.target===n&&h.removeChild(n)})}async function St(e,t,n){if(!h)return;const o=document.createElement("div");o.className="dialog-overlay";const r=document.createElement("div");r.className="dialog";const a=await D(),i=await F(a),s=await we(a,e),c=s.length>0?s.sort((d,l)=>new Date(l.timestamp).getTime()-new Date(d.timestamp).getTime()).map(d=>`
          <div class="event-item" data-event-id="${d.id}">
            <div class="event-info">
              <div class="event-date">${new Date(d.timestamp).toLocaleDateString()}</div>
              <div class="event-type">${yt(d.typeId)}</div>
              <div class="event-points">${d.points} Punkte</div>
              ${d.note?`<div class="event-note">${d.note}</div>`:""}
            </div>
            <button class="delete-event" data-event-id="${d.id}"><span class="delete-event__label">×</span></button>
          </div>
        `).join(""):'<div class="no-events">Keine Interaktionen</div>';r.innerHTML=`
      <h3>Kontakt Details</h3>
      <div class="dialog-row">
        <label for="contact-name">Name</label>
        <div style="position: relative;">
          <input type="text" id="contact-name" />
          ${H?'<div class="anonymous-overlay"></div>':""}
        </div>
      </div>
      <div class="dialog-row">
        <label>URL</label>
        <div class="url-text" style="position: relative;">${e}${H?'<div class="anonymous-overlay"></div>':""}</div>
      </div>
           <div class="dialog-row">
         <label for="contact-category">Kategorie</label>
         <select id="contact-category">
           ${i.categories.map(d=>`
             <option value="${d.id}" ${(t==null?void 0:t.categoryId)===d.id?"selected":""}>
               ${d.label_de}
             </option>
           `).join("")}
         </select>
       </div>
      <div class="dialog-row">
        <label>Empfinden</label>
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
        <label>Notizen</label>
        <div style="white-space: pre-wrap; max-height: 100px; overflow-y: auto;">${(t==null?void 0:t.notes)||"Keine"}</div>
      </div>
      <div class="dialog-row">
        <label>Interaktionen (${s.length})</label>
        <div class="events-list">
          ${c}
        </div>
      </div>
      <div class="dialog-buttons">
        <button class="secondary" id="close-details">Schließen</button>
      </div>
    `;const u=ee((t==null?void 0:t.categoryId)||"acquaintance",i);r.style.position="relative";const f=document.createElement("div");f.className="category-accent",f.id="details-category-accent",f.style.background=u,r.appendChild(f),o.appendChild(r),h.appendChild(o);const C=r.querySelector("#close-details"),g=r.querySelector("#contact-name");g.value=n,g.addEventListener("change",async()=>{const d=g.value.trim();if(!d||d===n){g.value=n;return}try{let l=await M(a,e);l?l.displayName=d:l={profileUrl:e,displayName:d,categoryId:"acquaintance",affinity:0},await J(a,l),n=d,await te()}catch(l){console.error("Error updating name:",l),alert("Fehler beim Aktualisieren des Namens")}});const b=r.querySelector("#contact-category"),k=r.querySelector("#contact-affinity"),$=r.querySelector("#affinity-value");C.addEventListener("click",()=>{h.removeChild(o)}),b.addEventListener("change",async()=>{const d=b.value;try{let l=await M(a,e);l?l.categoryId=d:l={profileUrl:e,displayName:n,categoryId:d,affinity:0},await J(a,l),l=await M(a,e);const w=r.querySelector("#details-category-accent");w&&(w.style.background=ee(d,i))}catch(l){console.error("Error updating category:",l),alert("Fehler beim Aktualisieren der Kategorie")}}),k.addEventListener("input",d=>{const l=d.target.value;$.textContent=`${l}/100`}),k.addEventListener("change",async d=>{const l=Number(d.target.value);try{let w=await M(a,e);w?w.affinity=l:w={profileUrl:e,displayName:n,categoryId:"acquaintance",affinity:l},await J(a,w),w=await M(a,e)}catch(w){console.error("Error updating affinity:",w),alert("Fehler beim Aktualisieren des Empfindens")}}),r.querySelectorAll(".delete-event").forEach(d=>{d.addEventListener("click",async l=>{l.stopPropagation();const w=l.target.closest(".delete-event"),U=w==null?void 0:w.getAttribute("data-event-id");if(U&&confirm("Interaktion wirklich löschen?"))try{await nt(a,U),h.removeChild(o),await te()}catch(O){console.error("Error deleting event:",O),alert("Fehler beim Löschen der Interaktion")}})}),o.addEventListener("click",d=>{d.target===o&&h.removeChild(o)})}function ue(){var t;ie&&(clearTimeout(ie),ie=null),se&&(clearTimeout(se),se=null),(t=m==null?void 0:m.firstElementChild)==null||t.classList.remove("card-out");const e=document.getElementById("li-notes-bridge");e&&e.remove()}function Be(){const e=()=>{m&&(m.innerHTML="");const n=document.getElementById("li-notes-bridge");n&&n.remove(),z=null,j=null,V=null,X=null},t=m==null?void 0:m.firstElementChild;t?(t.classList.add("card-out"),se=window.setTimeout(e,140)):e()}function ze(){ie=window.setTimeout(Be,200)}document.addEventListener("click",e=>{if(!m||m.childElementCount===0)return;const t=document.getElementById("li-notes-overlay-host");t&&e.composedPath().includes(t)||(ue(),Be())},!0);function Oe(e){var n;return z?(e.dataset.liNotesProfile||(e.href?(n=window.normalizeLinkedInProfileUrl)==null?void 0:n.call(window,e.href):null))===z:!1}function _t(e,t){const n=document.getElementById("li-notes-bridge");n&&n.remove();const o=document.createElement("div");o.id="li-notes-bridge",o.style.cssText=`
    position: fixed;
    z-index: 2147483646;
    background: transparent;
    pointer-events: auto;
  `,t.top<e.top?(o.style.left=`${Math.min(e.left,t.left)}px`,o.style.top=`${t.top+t.height}px`,o.style.width=`${Math.max(e.right,t.left+t.width)-Math.min(e.left,t.left)}px`,o.style.height=`${e.top-(t.top+t.height)}px`):(o.style.left=`${Math.min(e.left,t.left)}px`,o.style.top=`${e.bottom}px`,o.style.width=`${Math.max(e.right,t.left+t.width)-Math.min(e.left,t.left)}px`,o.style.height=`${t.top-e.bottom}px`),parseFloat(o.style.height)>0&&(o.addEventListener("mouseenter",ue),o.addEventListener("mouseleave",a=>{const i=a.relatedTarget,s=document.getElementById("li-notes-overlay-host");i&&s&&(s.contains(i)||s===i)||i&&Oe(i)||ze()}),document.body.appendChild(o))}function Pe(){if(T){T.style.display="flex";return}T=document.createElement("div"),T.style.cssText=`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(8, 9, 12, 0.6);
    backdrop-filter: blur(4px);
    z-index: 2147483646;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;const e=document.createElement("div");e.style.cssText=`
    background: #14161d;
    color: #f2f4f8;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 24px;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
    position: relative;
  `;const t=document.createElement("button");t.textContent="×",t.style.cssText=`
    position: absolute;
    top: 10px;
    right: 15px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #a3abbd;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
  `,t.onmouseenter=()=>{t.style.backgroundColor="rgba(255, 255, 255, 0.08)"},t.onmouseleave=()=>{t.style.backgroundColor="transparent"},t.onclick=()=>{ye()},T.onclick=o=>{o.target===T&&ye()};const n=o=>{o.key==="Escape"&&ye()};document.addEventListener("keydown",n),Tt(e),e.appendChild(t),T.appendChild(e),document.body.appendChild(T),T.escapeListener=n}function ye(){T&&(T.escapeListener&&document.removeEventListener("keydown",T.escapeListener),document.body.removeChild(T),T=null)}async function Tt(e){try{let t=function(p,y,_){const E=document.createElement("div");E.textContent=y,E.style.cssText=`
        color: ${_==="success"?"#4ade80":"#f87171"};
        font-size: 13px;
        margin-top: 8px;
        padding: 8px 12px;
        background: ${_==="success"?"rgba(74, 222, 128, 0.12)":"rgba(248, 113, 113, 0.12)"};
        border: 1px solid ${_==="success"?"rgba(74, 222, 128, 0.3)":"rgba(248, 113, 113, 0.3)"};
        border-radius: 8px;
      `,p.appendChild(E),setTimeout(()=>{p.contains(E)&&p.removeChild(E)},5e3)};const n=await D(),o=await F(n),r=document.createElement("h1");r.textContent="Connection Manager Einstellungen",r.style.cssText=`
      margin: 0 0 24px 0;
      font-size: 20px;
      font-weight: 600;
      letter-spacing: -0.01em;
      color: #f2f4f8;
      text-align: center;
    `;const a=document.createElement("div");a.style.cssText=`
      margin-bottom: 32px;
      padding: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.04);
    `;const i=document.createElement("h2");i.textContent="Gewichte",i.style.cssText=`
      margin: 0 0 16px 0;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #a3abbd;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 10px;
    `;const s=(p,y,_)=>{const E=document.createElement("div");E.style.cssText=`
        margin-bottom: 16px;
      `;const S=document.createElement("label");S.textContent=p,S.style.cssText=`
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
        color: #a3abbd;
      `;const v=document.createElement("input");v.type="number",v.step="0.01",v.value=y.toString(),v.id=_,v.style.cssText=`
        width: 120px;
        padding: 8px 12px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 8px;
        font-size: 13px;
        background: rgba(255, 255, 255, 0.05);
        color: #f2f4f8;
      `;const P=document.createElement("div");return P.textContent=`Gewichtung für ${p.toLowerCase()} (0-1)`,P.style.cssText=`
        font-size: 12px;
        color: #737d91;
        margin-top: 4px;
        font-style: italic;
      `,E.appendChild(S),E.appendChild(v),E.appendChild(P),E};a.appendChild(i),a.appendChild(s("Kategorien",o.weights.categories,"w_cat")),a.appendChild(s("Events",o.weights.events,"w_evt")),a.appendChild(s("Empfinden",o.weights.affinity,"w_aff"));const c=document.createElement("div");c.style.cssText=`
      margin-bottom: 32px;
      padding: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.04);
    `;const u=document.createElement("h2");u.textContent="Verfall",u.style.cssText=`
      margin: 0 0 16px 0;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #a3abbd;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 10px;
    `;const f=(p,y,_,E)=>{const S=document.createElement("div");S.style.cssText=`
        margin-bottom: 16px;
      `;const v=document.createElement("label");v.textContent=p,v.style.cssText=`
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
        color: #a3abbd;
      `;const P=document.createElement("input");P.type="number",P.value=y.toString(),P.id=_,P.style.cssText=`
        width: 120px;
        padding: 8px 12px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 8px;
        font-size: 13px;
        background: rgba(255, 255, 255, 0.05);
        color: #f2f4f8;
      `;const he=document.createElement("div");return he.textContent=E,he.style.cssText=`
        font-size: 12px;
        color: #737d91;
        margin-top: 4px;
        font-style: italic;
      `,S.appendChild(v),S.appendChild(P),S.appendChild(he),S},C=document.createElement("div");C.style.cssText=`
      margin-bottom: 16px;
    `;const g=document.createElement("label");g.textContent="Modus",g.style.cssText=`
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: #a3abbd;
    `;const b=document.createElement("select");b.id="d_mode",b.style.cssText=`
      width: 120px;
      padding: 8px 12px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      font-size: 13px;
      background: rgba(255, 255, 255, 0.05);
      color: #f2f4f8;
    `,["exponential","linear","off"].forEach(p=>{const y=document.createElement("option");y.value=p,y.textContent=p,y.selected=o.decay.mode===p,b.appendChild(y)});const k=document.createElement("div");k.textContent="Art des Verfalls: exponential, linear oder aus",k.style.cssText=`
      font-size: 12px;
      color: #737d91;
      margin-top: 4px;
      font-style: italic;
    `,C.appendChild(g),C.appendChild(b),C.appendChild(k),c.appendChild(u),c.appendChild(f("Start (Tage)",o.decay.decayStartDays,"d_start","Nach wie vielen Tagen beginnt der Verfall")),c.appendChild(f("Halbwert (Tage)",o.decay.halfLifeDays,"d_half","Nach wie vielen Tagen halbiert sich der Wert")),c.appendChild(C);const $=document.createElement("div");$.style.cssText=`
      margin-bottom: 32px;
      padding: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.04);
    `;const N=document.createElement("h2");N.textContent="Datenschutz",N.style.cssText=`
      margin: 0 0 16px 0;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #a3abbd;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 10px;
    `;const d=document.createElement("div");d.style.cssText=`
      margin-bottom: 16px;
    `;const l=document.createElement("input");l.type="checkbox",l.id="anonymous-mode",l.checked=o.anonymousMode,l.style.cssText=`
      margin-right: 12px;
      width: 18px;
      height: 18px;
      accent-color: #7c7ff2;
    `;const w=document.createElement("label");w.textContent="Anonymus Modus",w.htmlFor="anonymous-mode",w.style.cssText=`
      font-weight: 500;
      color: #a3abbd;
      cursor: pointer;
    `;const U=document.createElement("div");U.textContent="Überdeckt alle Namen auf LinkedIn mit einem geblurten schwarzen Balken",U.style.cssText=`
      font-size: 12px;
      color: #737d91;
      margin-top: 8px;
      font-style: italic;
    `,d.appendChild(l),d.appendChild(w),$.appendChild(N),$.appendChild(d),$.appendChild(U);const O=document.createElement("div");O.style.cssText=`
      margin-bottom: 32px;
      padding: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.04);
    `;const I=document.createElement("h2");I.textContent="Daten Export/Import",I.style.cssText=`
      margin: 0 0 16px 0;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #a3abbd;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 10px;
    `;const A=document.createElement("div");A.style.cssText=`
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-bottom: 12px;
      flex-wrap: wrap;
    `;const W=`
      background: rgba(255, 255, 255, 0.05);
      color: #f2f4f8;
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.15s ease, border-color 0.15s ease;
    `,B=document.createElement("button");B.textContent="Daten exportieren",B.style.cssText=W;const K=document.createElement("button");K.textContent="Daten importieren",K.style.cssText=W;const G=document.createElement("button");G.textContent="DB Test",G.style.cssText=W;const pe=document.createElement("button");pe.textContent="Speichern",pe.style.cssText=`
      background: linear-gradient(135deg, #7c7ff2, #5b8cf7);
      color: #fff;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      box-shadow: 0 2px 12px rgba(99, 102, 241, 0.35);
      transition: filter 0.15s ease;
    `;const q=document.createElement("div");q.id="options-message-container",pe.onclick=async()=>{try{const p=parseFloat(document.getElementById("w_cat").value),y=parseFloat(document.getElementById("w_evt").value),_=parseFloat(document.getElementById("w_aff").value),E=p+y+_;if(Math.abs(E-1)>1e-4){t(q,`Summe der Gewichte muss 1 sein. Aktuell: ${E.toFixed(2)}`,"error");return}o.weights={categories:p,events:y,affinity:_},o.decay={mode:document.getElementById("d_mode").value,decayStartDays:parseInt(document.getElementById("d_start").value,10),halfLifeDays:parseInt(document.getElementById("d_half").value,10)},o.anonymousMode=document.getElementById("anonymous-mode").checked,await oe(n,o),H=o.anonymousMode,xe(),t(q,"Einstellungen erfolgreich gespeichert!","success")}catch{t(q,"Fehler beim Speichern der Einstellungen","error")}},B.onclick=async()=>{try{B.disabled=!0,B.textContent="Exportiere...";const p=await re(n),y=await ae(n),_={version:"1.0",settings:o,contacts:p,events:y},E=new Blob([JSON.stringify(_,null,2)],{type:"application/json"}),S=URL.createObjectURL(E),v=document.createElement("a");v.href=S,v.download=`linkedin-connections-export-${new Date().toISOString().split("T")[0]}.json`,document.body.appendChild(v),v.click(),document.body.removeChild(v),URL.revokeObjectURL(S),t(q,`Export erfolgreich! ${p.length} Kontakte und ${y.length} Events exportiert.`,"success")}catch(p){console.error("Export error:",p),t(q,"Fehler beim Exportieren der Daten","error")}finally{B.disabled=!1,B.textContent="Daten exportieren"}};const Q=document.createElement("input");Q.type="file",Q.accept=".json",Q.style.display="none",document.body.appendChild(Q),K.onclick=()=>{Q.click()},Q.onchange=async p=>{var E;const y=p.target,_=(E=y.files)==null?void 0:E[0];if(_)try{K.disabled=!0,K.textContent="Importiere...";const S=await _.text(),v=JSON.parse(S);if(v.version!=="1.0")throw new Error("Unsupported export version");await Ee(n),await Ce(n),await ke(n,v.contacts),await Se(n,v.events),t(q,`Import erfolgreich! ${v.contacts.length} Kontakte und ${v.events.length} Events importiert.`,"success")}catch(S){t(q,`Fehler beim Importieren: ${S instanceof Error?S.message:"Unbekannter Fehler"}`,"error")}finally{K.disabled=!1,K.textContent="Daten importieren",y.value=""}},G.onclick=async()=>{try{G.disabled=!0,G.textContent="Teste...";const p=await re(n),y=await ae(n);console.log("Contacts:",p),console.log("Events:",y),t(q,`DB Test: ${p.length} Kontakte, ${y.length} Events gefunden. Siehe Konsole für Details.`,"success")}catch(p){console.error("DB Test error:",p),t(q,`DB Test Fehler: ${p instanceof Error?p.message:"Unbekannter Fehler"}`,"error")}finally{G.disabled=!1,G.textContent="DB Test"}},A.appendChild(B),A.appendChild(K),A.appendChild(G),A.appendChild(pe),O.appendChild(I),O.appendChild(A),O.appendChild(q),e.appendChild(r),e.appendChild(a),e.appendChild(c),e.appendChild($),e.appendChild(O)}catch(t){console.error("Error initializing options:",t),e.innerHTML=`<p style="color: red;">Fehler beim Laden der Einstellungen: ${t}</p>`}}window.normalizeLinkedInProfileUrl=Z;function ve(e){return e.replace(/\s+/g," ").trim().toLowerCase()}async function Lt(e,t){if(e.querySelector("img"))return!0;const n=ve(e.textContent??"");if(!n)return!1;try{const r=await D(),a=await M(r,t);if(a!=null&&a.displayName&&!me(a.displayName))return n.includes(ve(a.displayName))}catch{}const o=ne(e);return!!o&&n.includes(ve(o))}function Fe(e){for(const t of Ue(e)){if(t.dataset.liNotesBound==="1")continue;t.dataset.liNotesBound="1";const n=t.dataset.liNotesProfile||Z(t.href);n&&(t.addEventListener("mouseenter",async()=>{await Lt(t,n)&&t.matches(":hover")&&bt(t,n)}),t.addEventListener("mouseleave",o=>{const r=o.relatedTarget,a=document.getElementById("li-notes-overlay-host");r&&a&&(a.contains(r)||a===r)||r&&Oe(r)||Ne()}))}}function $t(e){for(const t of e)t.addedNodes&&t.addedNodes.forEach(n=>{n instanceof HTMLElement&&Fe(n)})}(function(){new MutationObserver($t).observe(document.body,{childList:!0,subtree:!0}),Fe(document)})()})();
