(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const c of a.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&s(c)}).observe(document,{childList:!0,subtree:!0});function n(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(i){if(i.ep)return;i.ep=!0;const a=n(i);fetch(i.href,a)}})();const g=[{id:"C4",label:"C4",frequency:261.63},{id:"C#4",label:"C#4/Db4",frequency:277.18},{id:"D4",label:"D4",frequency:293.66},{id:"D#4",label:"D#4/Eb4",frequency:311.13},{id:"E4",label:"E4",frequency:329.63},{id:"F4",label:"F4",frequency:349.23},{id:"F#4",label:"F#4/Gb4",frequency:369.99},{id:"G4",label:"G4",frequency:392},{id:"G#4",label:"G#4/Ab4",frequency:415.3},{id:"A4",label:"A4",frequency:440},{id:"A#4",label:"A#4/Bb4",frequency:466.16},{id:"B4",label:"B4",frequency:493.88},{id:"C5",label:"C5",frequency:523.25}],F=["a","s","d","f","j","k","l",";"],j=[3,2,4,5,6,7,8,9],G=["C4","D4","E4","F4","G4","A4","B4","C5"],N=["#f0b03f","#d55336","#0f8d6f","#8b5cf6","#3cb0ff","#ff7a9e","#7ad4a1","#ffd166"],_=[{id:"hemiola",name:"Hemiola 3:2",tempo:96,voices:[{subdivision:3,noteId:"C4",key:"j"},{subdivision:2,noteId:"G4",key:"f"}]},{id:"tresillo",name:"Son clave 3-2",tempo:100,voices:[{subdivision:8,restPattern:"2, 4, 5, 8",noteId:"C4",key:"j",soundMode:"click"},{subdivision:8,restPattern:"1, 2, 4, 6, 7, 8",noteId:"G4",key:"f",soundMode:"click"}]},{id:"quintuple",name:"5:4 rubato",tempo:84,voices:[{subdivision:5,noteId:"D4",key:"j"},{subdivision:4,noteId:"A4",key:"f"}]},{id:"bossa",name:"Bossa nova",tempo:90,voices:[{subdivision:16,restPattern:"2, 3, 6, 7, 10, 11, 14, 15",noteId:"C4",key:"j",soundMode:"click"},{subdivision:16,restPattern:"4, 8, 12, 16",noteId:"F4",key:"f",soundMode:"click"},{subdivision:16,restPattern:"2 3 5 6 8 9 10 12 13 15 16",noteId:"G4",key:"i",soundMode:"note"}]},{id:"paradiddle",name:"Paradiddle",tempo:96,voices:[{subdivision:8,restPattern:"2, 5, 7, 8",noteId:"C4",key:"j",soundMode:"click"},{subdivision:8,restPattern:"1, 3, 4, 6",noteId:"G4",key:"f",soundMode:"click"}]},{id:"ladder",name:"3:4:5 ladder",tempo:92,voices:[{subdivision:3,noteId:"C4",key:"j",soundMode:"click"},{subdivision:4,noteId:"E4",key:"f",soundMode:"click"},{subdivision:5,noteId:"G4",key:"i",soundMode:"click"}]},{id:"four-stack",name:"2:3:4:5 stack",tempo:84,voices:[{subdivision:2,noteId:"C4",key:"j",soundMode:"click"},{subdivision:3,noteId:"D4",key:"f",soundMode:"click"},{subdivision:4,noteId:"E4",key:"i",soundMode:"click"},{subdivision:5,noteId:"G4",key:"e",soundMode:"click"}]}],Q={tempo:96,playing:!1,voices:O(),stats:E(O())},A=55,$=8,X=.2,ee=25;let o={...Q},l=null,v=null;const R=document.querySelector("#app");R&&(R.innerHTML=te(),ie(),b(),k());function te(){return`
    <div class="page-shell">
      <header class="hero">
        <div class="hero-copy">
          <h1 class="title-merge">
            <span class="title-pol-rh-box">
              <p class="title-pol">Pol</p>
              <p class="title-rh">Rh</p>
            </span>
            <span class="title-y">y</span>
            <span class="title-orbit" aria-hidden="true">
              <svg viewBox="0 0 80 60" role="img" focusable="false">
                <ellipse cx="40" cy="30" rx="28" ry="14"></ellipse>
                <ellipse cx="48" cy="30" rx="20" ry="10"></ellipse>
                <ellipse cx="56" cy="30" rx="12" ry="6"></ellipse>
              </svg>
            </span>
            <span class="title-thma">thma</span>
          </h1>
          <p class="lede">
            Practice polyrhythms with your keyboard!
          </p>
        </div>
      </header>

      <div class="shortcut-bar" aria-label="Keyboard shortcuts">
        <span class="shortcut-pill"><span class="keycap">Space</span> Start/Stop</span>
        <span class="shortcut-pill"><span class="keycap">↑/↓</span> Tempo ±1</span>
        <span class="shortcut-pill"><span class="keycap">Mapped keys</span> Trigger voices</span>
      </div>

      <div class="config-row">
        <section class="panel controls">
          <div class="panel-header">
            <div>
              <h2>Rhythm Config</h2>
            </div>
            <button class="ghost-button" id="reset-session" type="button">Reset session</button>
          </div>
          <div class="controls-grid">
            <label class="control">
              <div class="control-header">
                <span class="control-label">Tempo (BPM)</span>
              </div>
              <div class="tempo-row">
                <input id="tempo" type="range" min="40" max="180" step="1" value="${o.tempo}" />
                <div class="tempo-input-wrap">
                  <input id="tempo-input" type="number" min="40" max="180" step="1" value="${o.tempo}" aria-label="Tempo BPM" />
                  <span class="tempo-suffix">BPM</span>
                </div>
              </div>
            </label>
          </div>
          <div class="voices-grid" aria-label="Practice voices">
            <div class="voice-header-row">
              <span aria-hidden="true"></span>
              <span class="voice-heading">Key</span>
              <span class="voice-heading">Subdiv.</span>
              <span class="voice-heading">Rests</span>
              <span class="voice-heading">Pitch</span>
              <span class="voice-heading">Sound</span>
              <span aria-hidden="true"></span>
            </div>
            <div class="voice-list" id="voice-list">
              ${B()}
            </div>
            <button class="ghost-button add-voice" id="add-voice" type="button" aria-label="Add voice">
              <img src="/PolyRhythma/icons/primary-tab-new.svg" class="add-voice-icon" alt="" aria-hidden="true" />
            </button>
          </div>
        </section>
        <section class="panel preset-panel">
          <div class="panel-header">
            <h2>Presets</h2>
          </div>
          <div class="preset-list">
            ${_.map(e=>`
              <button class="preset-button" data-preset="${e.id}">
                <span class="preset-name">${e.name}</span>
              </button>`).join("")}
          </div>
        </section>
      </div>

      <section class="panel timeline">
        <div class="panel-header">
          <div>
            <h2>PolyRhythma Player</h2>
          </div>
          <button class="primary-button" id="start-stop" type="button">Start playback</button>
        </div>
        <div class="timeline-track">
          <div class="timeline-progress" id="timeline-progress"></div>
          <div class="timeline-lanes" id="timeline-lanes" aria-label="Voice timelines"></div>
        </div>
      </section>

      <section class="panel stats">
        <div class="panel-header">
          <div>
            <h2>Precision</h2>
          </div>
        </div>
        <div class="stats-grid">
          <div class="stat">
            <p class="stat-label">Pocket</p>
            <p class="stat-value" id="overall-accuracy">—</p>
            <p class="stat-sub">Rolling ${$}s · ±${A}ms</p>
          </div>
          <div class="stat">
            <p class="stat-label">Mean error</p>
            <p class="stat-value" id="mean-avg">—</p>
            <p class="stat-sub">Rolling ${$}s · absolute ms</p>
          </div>
          <div class="stat">
            <p class="stat-label">Consistency</p>
            <div class="per-key-stats" id="per-key-stats">—</div>
            <p class="stat-sub">Std dev of intervals per key</p>
          </div>
        </div>
      </section>

    </div>
  `}function ne(){return o.voices.map(e=>`
    <div class="binding">
      <span class="key-pill">${e.key.toUpperCase()}</span>
      <span class="binding-label">${e.label} · ÷${e.subdivision} · ${e.noteId}</span>
    </div>`).join("")}function B(){return o.voices.map((e,t)=>`
      <div class="voice-row" data-voice-id="${e.id}">
        <div class="voice-id">${t+1}</div>
        <label class="voice-field">
          <input class="voice-key-input" type="text" maxlength="1" value="${e.key}" aria-label="Key for ${e.label}" />
        </label>
        <label class="voice-field">
          <input class="voice-ratio-input" type="number" min="1" max="16" value="${e.subdivision}" aria-label="Subdivision for ${e.label}" />
        </label>
        <label class="voice-field">
          <input
            class="voice-rests-input"
            type="text"
            inputmode="numeric"
            pattern="[0-9,\\s]*"
            placeholder="rests"
            value="${e.restPattern??""}"
            aria-label="Rest positions for ${e.label}"
          />
        </label>
        <label class="voice-field">
          <select class="voice-note-select" aria-label="Pitch for ${e.label}">
            ${se(e.noteId)}
          </select>
        </label>
        <label class="voice-field">
          <select class="voice-sound-select" aria-label="Sound for ${e.label}">
            <option value="click" ${e.soundMode==="click"?"selected":""}>Click</option>
            <option value="note" ${e.soundMode==="note"?"selected":""}>Note</option>
          </select>
        </label>
        <button class="delete-voice" type="button" aria-label="Remove ${e.label}" ${o.voices.length<=2?"disabled":""}>
          <svg viewBox="0 0 24 24" class="icon" aria-hidden="true">
            <path
              d="M9.5 4a1 1 0 0 0-.94.66L8.1 6H5a1 1 0 1 0 0 2h1.07l.73 10.12A2 2 0 0 0 8.79 20h6.42a2 2 0 0 0 1.99-1.88L17.93 8H19a1 1 0 1 0 0-2h-3.1l-.46-1.34A1 1 0 0 0 14.5 4h-5Zm.73 2h3.54l.2.6H10.03l.2-.6ZM9.12 8h5.76l-.7 9.7a.5.5 0 0 1-.49.45H9.27a.5.5 0 0 1-.49-.45L8.08 8Z"
            />
          </svg>
        </button>
      </div>
    `).join("")}function se(e){return g.map(t=>`<option value="${t.id}" ${t.id===e?"selected":""}>${t.label}</option>`).join("")}function ie(){const e=document.querySelector("#start-stop"),t=document.querySelector("#tempo"),n=document.querySelector("#tempo-input"),s=document.querySelector("#reset-session"),i=document.querySelector("#add-voice"),a=Array.from(document.querySelectorAll(".preset-button"));e==null||e.addEventListener("click",()=>{K()}),t==null||t.addEventListener("input",()=>{C(t.valueAsNumber)}),n==null||n.addEventListener("change",()=>{C(n.valueAsNumber)}),s==null||s.addEventListener("click",()=>{o={...o,stats:E(o.voices)},k()}),i==null||i.addEventListener("click",()=>{ye()}),a.forEach(c=>{c.addEventListener("click",()=>{const r=c.getAttribute("data-preset");r&&Se(r)})}),window.addEventListener("keydown",oe),J()}function oe(e){const t=e.target;if(t&&(t.tagName==="INPUT"||t.tagName==="SELECT"||t.isContentEditable))return;if(e.code==="Space"){e.preventDefault(),K();return}if(e.key==="ArrowUp"){e.preventDefault(),C(o.tempo+1);return}if(e.key==="ArrowDown"){e.preventDefault(),C(o.tempo-1);return}if(!o.playing||!l)return;const n=e.key.toLowerCase(),s=o.voices.find(i=>i.key.toLowerCase()===n);s&&ae(s)}function ae(e){if(!l)return;const t=P(),n=l.pattern,s=n.measureDuration,i=n.offsets[e.id];if(!i||i.length===0)return;const a=Math.max(0,t-l.startTime),c=Math.floor(a/s),r=a-c*s;let p=0,u=i[0];i.forEach((y,S)=>{const x=Math.abs(r-y),h=Math.abs(r-u);x<h&&(p=S,u=y)});const m=l.startTime+c*s+u,f=(t-m)*1e3,d={...o.stats};d.total+=1,d.perVoice[e.id]||(d.perVoice[e.id]={count:0,sumAbs:0}),d.perVoice[e.id].count+=1,d.perVoice[e.id].sumAbs+=Math.abs(f),Math.abs(f)<=A&&(d.withinWindow+=1),d.lastDeltas=[{voiceId:e.id,delta:f},...d.lastDeltas].slice(0,8),d.hitHistory=[{voiceId:e.id,time:t,delta:f,offsetIndex:p,cycle:c},...d.hitHistory].filter(y=>t-y.time<=$),o={...o,stats:d},k()}function U(){v||(v=new AudioContext),v.resume();const e=D(o),t=P()+.05,n={};o.voices.forEach(s=>{const i=e.offsets[s.id];n[s.id]={cycleIndex:0,offsetIndex:0,nextEventTime:t+((i==null?void 0:i[0])??0)}}),l={startTime:t,voices:n,schedulerId:null,rafId:null,pattern:e},o={...o,playing:!0},Y(),ce(),W()}function I(){z(!1),U()}function K(){o.playing?z():U()}function z(e=!0){l!=null&&l.schedulerId&&window.clearInterval(l.schedulerId),l!=null&&l.rafId&&cancelAnimationFrame(l.rafId),l=null;const t=document.querySelector("#timeline-progress");t&&(t.style.width="0%"),e&&(o={...o,playing:!1},Y())}function ce(){if(!l||!v)return;const e=()=>{if(!l||!v)return;const t=v.currentTime+X;o.voices.forEach(n=>le(n.id,t))};e(),l.schedulerId=window.setInterval(e,ee)}function le(e,t){if(!l||!v)return;const{pattern:n}=l,s=n.offsets[e],i=l.voices[e];if(!(!s||!i))for(;i.nextEventTime<t;)de(e,i.nextEventTime),re(e,s.length,n.measureDuration)}function re(e,t,n){if(!l||!v)return;const s=l.voices[e];if(!s)return;s.offsetIndex+=1,s.offsetIndex>=t&&(s.offsetIndex=0,s.cycleIndex+=1);const i=l.pattern.offsets[e][s.offsetIndex];s.nextEventTime=l.startTime+s.cycleIndex*n+i}function de(e,t){if(!v)return;const n=l==null?void 0:l.voices[e],s=o.voices.find(f=>f.id===e);if(!n||!s)return;const i=n.offsetIndex===0,a=g.find(f=>f.id===s.noteId)??g[0],c=v.createOscillator(),r=v.createGain();c.type="sine",c.frequency.value=a.frequency;const p=i?.45:.28,u=i?.32:.2,m=(l==null?void 0:l.pattern.spacing[e])??.5;if(s.soundMode==="note"){const f=u,d=Math.min(.25,Math.max(.05,m/2)),y=.01,S=f;r.gain.setValueAtTime(1e-4,t),r.gain.linearRampToValueAtTime(S,t+y),r.gain.setValueAtTime(S,t+d*.7),r.gain.exponentialRampToValueAtTime(1e-4,t+d),c.connect(r).connect(v.destination),c.start(t),c.stop(t+d+.02)}else{const f=p;r.gain.setValueAtTime(1e-4,t),r.gain.exponentialRampToValueAtTime(f,t+.005),r.gain.exponentialRampToValueAtTime(1e-4,t+.08),c.connect(r).connect(v.destination),c.start(t),c.stop(t+.12)}}function W(){if(!l)return;const t=P()-l.startTime,n=l.pattern.measureDuration,s=t%n/n*100,i=document.querySelector("#timeline-progress");i&&(i.style.width=`${s}%`),l.rafId=requestAnimationFrame(W)}function D(e){const t=60/e.tempo*4,n={},s={};return e.voices.forEach(i=>{const a=Z(i.restPattern,i.subdivision),c=ue(i.subdivision,t,a);n[i.id]=c.length?c:[0],s[i.id]=t/i.subdivision}),{measureDuration:t,offsets:n,spacing:s}}function Z(e,t){if(!e)return[];const n=e.split(/[\s,]+/).map(s=>Number.parseInt(s,10)).filter(s=>Number.isFinite(s)&&s>=1&&s<=t);return Array.from(new Set(n)).sort((s,i)=>s-i)}function ue(e,t,n=[]){const s=new Set(n),i=[];for(let a=0;a<e;a++){const c=a+1;s.has(c)||i.push(a*t/e)}return i}function b(){const e=D(o),t=document.querySelector("#timeline-lanes");t&&(t.innerHTML=o.voices.map(n=>`
        <div class="timeline-lane" data-voice-id="${n.id}">
          <div class="lane-label">${n.key.toUpperCase()} · ÷${n.subdivision} · ${n.noteId}</div>
          <div class="lane-markers" id="lane-${n.id}"></div>
        </div>
      `).join(""),o.voices.forEach((n,s)=>{pe(t.querySelector(`#lane-${n.id}`),e.offsets[n.id],e.measureDuration,s)})),l&&(l.pattern=e)}function pe(e,t,n,s){if(!e)return;const i=n||1,a=N[s%N.length];e.innerHTML=t.map((c,r)=>{const p=c/i*100;return`<span class="marker ${r===0?"downbeat":""}" style="left:${p}%;background:${a}"></span>`}).join("")}function k(){const e=document.querySelector("#overall-accuracy"),t=document.querySelector("#mean-avg");if(!e||!t)return;const n=o.stats,s=P(),i=n.hitHistory.filter(u=>s-u.time<=$),a=i.length,c=i.filter(u=>Math.abs(u.delta)<=A).length;e.textContent=a===0?"—":`${Math.round(c/a*100)}% locked`;const r=a===0?null:i.reduce((u,m)=>u+Math.abs(m.delta),0)/a;t.textContent=r!==null?fe(r):"—";const p=document.querySelector("#per-key-stats");if(p){const u=(l==null?void 0:l.pattern)??D(o);p.innerHTML=o.voices.map(m=>{var x;const f=i.filter(h=>h.voiceId===m.id).map(h=>({time:h.time,offsetIndex:h.offsetIndex,cycle:h.cycle})),d=((x=u.offsets[m.id])==null?void 0:x.length)??0,y=me(m.id,f,d),S=y===null?"—":ve(y);return`<span class="per-key-chip">${m.key.toUpperCase()}: ${S}</span>`}).join("")}}function Y(){const e=document.querySelector("#status-pill"),t=document.querySelector("#start-stop"),n=document.querySelector("#playback-state"),s=o.playing;e&&(e.textContent=s?"Running · stay on the grid":"Stopped · press play or Space to hear the guide",e.classList.toggle("is-live",s)),t&&(t.textContent=s?"Stop playback":"Start playback"),n&&(n.textContent=s?"Playing":"Stopped",n.classList.toggle("is-live",s))}function q(){const e=document.querySelector("#tempo"),t=document.querySelector("#tempo-input");e&&(e.value=o.tempo.toString()),t&&(t.value=o.tempo.toString())}function V(e,t,n,s){return Number.isNaN(e)?s:Math.min(n,Math.max(t,Math.round(e)))}function C(e){const t=V(e,40,180,o.tempo);if(t===o.tempo){q();return}o={...o,tempo:t},q(),b(),o.playing&&I()}function fe(e){return`${e>=0?"+":"–"}${Math.abs(e).toFixed(0)}ms`}function ve(e){return`±${e.toFixed(0)}ms`}function H(e){if(!e.length)return null;const t=e.reduce((s,i)=>s+i,0)/e.length,n=e.reduce((s,i)=>s+(i-t)**2,0)/e.length;return Math.sqrt(n)}function me(e,t,n){if(n<=0||t.length<2)return null;const s=[...t].sort((c,r)=>c.time-r.time),i=[];let a=[];for(let c=1;c<s.length;c+=1){const r=s[c-1],p=s[c],u=(r.offsetIndex+1)%n,m=u===0;if(!(p.offsetIndex===u&&(m?p.cycle===r.cycle+1:p.cycle===r.cycle))){if(a.length){const d=H(a);d!==null&&i.push(d)}a=[];continue}a.push((p.time-r.time)*1e3)}if(a.length){const c=H(a);c!==null&&i.push(c)}return i.length?i.reduce((c,r)=>c+r,0)/i.length:null}function E(e){const t={};return e.forEach(n=>{t[n.id]={count:0,sumAbs:0}}),{total:0,withinWindow:0,perVoice:t,lastDeltas:[],hitHistory:[]}}function P(){return v?v.currentTime:performance.now()/1e3}function O(){return F.slice(0,4).map((t,n)=>({id:`voice-${n+1}`,label:`Voice ${n+1}`,key:t,subdivision:j[n]??2,noteId:G[n]??"C4",restPattern:"",soundMode:"click"}))}function ye(){var c;if(o.voices.length>=8)return;const e=o.voices.length,t=F[e]??String.fromCharCode(97+e),n=j[e]??2,s=((c=g[e%g.length])==null?void 0:c.id)??"C4",i={id:`voice-${Date.now()}-${e}`,label:`Voice ${e+1}`,key:t,subdivision:n,noteId:G[e]??s,restPattern:"",soundMode:"click"},a=w([...o.voices,i]);o={...o,voices:a,stats:E(a)},L(),T(),b(),k(),o.playing&&I()}function be(e){if(o.voices.length<=2)return;const t=w(o.voices.filter(n=>n.id!==e));o={...o,voices:t,stats:E(t)},L(),T(),b(),k(),o.playing&&I()}function w(e){return e.map((t,n)=>({...t,label:`Voice ${n+1}`}))}function he(e){return(e||"").slice(0,1).toLowerCase()||" "}function ge(e,t){const n=Z(e,t);return n.length?n.join(", "):""}function ke(e){const t=V(e.subdivision,1,16,2),n=g.some(s=>s.id===e.noteId)?e.noteId:g[0].id;return{...e,key:he(e.key),subdivision:t,restPattern:ge(e.restPattern,t),noteId:n,soundMode:e.soundMode==="note"?"note":"click"}}function Se(e){const t=_.find(s=>s.id===e);if(!t)return;const n=w(t.voices.map((s,i)=>ke({id:`voice-${Date.now()}-${i}`,label:`Voice ${i+1}`,key:s.key,subdivision:s.subdivision,noteId:s.noteId,restPattern:s.restPattern??"",soundMode:s.soundMode??"click"})));o={...o,tempo:t.tempo,voices:n,stats:E(n)},L(),T(),q(),b(),k(),o.playing&&I()}function J(){Array.from(document.querySelectorAll(".voice-row")).forEach(t=>{const n=t.getAttribute("data-voice-id"),s=t.querySelector(".voice-key-input"),i=t.querySelector(".voice-ratio-input"),a=t.querySelector(".voice-rests-input"),c=t.querySelector(".voice-note-select"),r=t.querySelector(".voice-sound-select"),p=t.querySelector(".delete-voice");!n||!s||!i||!c||(s.addEventListener("input",()=>{const u=(s.value||"").slice(0,1).toLowerCase();s.value=u,M(n,{key:u||" "})}),i.addEventListener("change",()=>{const u=V(i.valueAsNumber,1,16,2);i.value=u.toString(),M(n,{subdivision:u}),b(),o.playing&&I()}),a==null||a.addEventListener("change",()=>{const u=(a.value||"").split(/[\s,]+/).map(d=>Number.parseInt(d,10)).filter(d=>Number.isFinite(d)&&d>0),f=Array.from(new Set(u)).sort((d,y)=>d-y).join(", ");a.value=f,M(n,{restPattern:f}),b(),o.playing&&I()}),c.addEventListener("change",()=>{M(n,{noteId:c.value})}),r==null||r.addEventListener("change",()=>{const u=r.value==="note"?"note":"click";M(n,{soundMode:u})}),p==null||p.addEventListener("click",()=>{be(n)}))})}function M(e,t){const n=o.voices.map(i=>i.id===e?{...i,...t}:i),s=w(n);o={...o,voices:s,stats:E(s)},L(),T(),b(),k()}function T(){const e=document.querySelector(".binding-list");e&&(e.innerHTML=ne())}function L(){const e=document.querySelector("#voice-list");e&&(e.innerHTML=B(),J())}
