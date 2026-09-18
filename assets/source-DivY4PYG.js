import{n as e}from"./rolldown-runtime-Dd_uD5pT.js";import{l as t}from"./vendor-yjs-Gj-z4pnH.js";import{X as n,p as r}from"./docs-cmi_e3i7.js";import{a as i,l as a,r as o}from"./sourceSeal-Dbk5jbjY.js";var s=`i18n/`,c=5e3,l=256,u=4096,d=/^[a-z]{2,3}(-[a-z0-9]{2,8})?$/;function f(e){if(!e.startsWith(s)||!e.endsWith(`.json`))return null;let t=e.slice(5,-5).toLowerCase();return d.test(t)?t:null}function p(e,t){let n;try{n=JSON.parse(t)}catch(t){throw Error(`${e} is not valid JSON: ${t instanceof Error?t.message:String(t)}`,{cause:t})}if(!n||typeof n!=`object`||Array.isArray(n))throw Error(`${e} must contain a JSON object mapping source strings to translations`);let r=Object.entries(n);if(r.length>c)throw Error(`${e} exceeds ${c} entries`);let i={};for(let[t,n]of r){if(typeof n!=`string`)throw Error(`${e}: value of "${t.slice(0,60)}" must be a string`);if(t.length===0||t.length>l)throw Error(`${e}: keys must be 1–${l} characters`);if(n.length>u)throw Error(`${e}: value of "${t.slice(0,60)}" exceeds ${u} characters`);Object.defineProperty(i,t,{value:n,enumerable:!0,configurable:!0,writable:!0})}return i}function m(e){let t=0;for(let[n,r]of Object.entries(e))if(!(!n.startsWith(s)||!n.endsWith(`.json`))){if(!f(n))throw Error(`${n}: i18n files must be named i18n/<language>.json (e.g. i18n/de.json)`);if(t+=1,t>24)throw Error(`Code Apps are limited to 24 i18n languages`);p(n,r)}}function h(e){let t={};for(let[n,r]of Object.entries(e)){let e=f(n);if(!(!e||Object.keys(t).length>=24))try{Object.defineProperty(t,e,{value:p(n,r),enumerable:!0,configurable:!0,writable:!0})}catch{}}return t}var g=e({DEFAULT_CODE_APP_HTML:()=>b,DEFAULT_CODE_APP_MANIFEST_YAML:()=>y,MAX_CODE_APP_FILES:()=>64,createCodeAppFile:()=>k,deleteCodeAppFile:()=>j,getCodeAppFile:()=>T,getCodeAppFiles:()=>w,initializeCodeAppSource:()=>P,normalizeCodeAppFilePath:()=>S,renameCodeAppFile:()=>A,replaceCodeAppFiles:()=>N,replaceTextMinimal:()=>D,setCodeAppFile:()=>O,validateCodeAppFiles:()=>M}),_=1024,v=4e6,y=i(),b=`<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>My Code App</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 2rem; background: #0f172a; color: #f8fafc; }
    main { max-width: 42rem; margin: 0 auto; }
    nav { display: flex; gap: .5rem; margin-bottom: 2rem; }
    button { border: 0; border-radius: .5rem; padding: .65rem 1rem; background: #334155; color: white; cursor: pointer; }
    button.active, #increment { background: #f97316; }
    [data-view][hidden] { display: none; }
    pre { padding: 1rem; border-radius: .75rem; background: #1e293b; overflow: auto; }
  </style>
</head>
<body>
  <main>
    <nav aria-label="App navigation">
      <button data-route="/">Overview</button>
      <button data-route="/counter">Shared counter</button>
    </nav>
    <section data-view="/">
      <h1>My Code App</h1>
      <p>Routes come from manifest.yaml and stay synchronized with the Builder navigation.</p>
    </section>
    <section data-view="/counter" hidden>
      <h1>Shared counter</h1>
      <button id="increment">Increment</button>
      <pre id="output">Connecting…</pre>
    </section>
  </main>
  <script>
    Dapp.onReady(async () => {
      document.querySelectorAll('[data-route]').forEach((button) => {
        button.addEventListener('click', () => $router.navigate(button.dataset.route));
      });
      $router.subscribe((path) => {
        document.querySelectorAll('[data-view]').forEach((view) => { view.hidden = view.dataset.view !== path; });
        document.querySelectorAll('[data-route]').forEach((button) => { button.classList.toggle('active', button.dataset.route === path); });
      });

      const output = document.getElementById('output');
      await $data.subscribe((state) => { output.textContent = JSON.stringify(state, null, 2); });
      document.getElementById('increment').addEventListener('click', async () => {
        const count = (await $data.get('count')) || 0;
        await $data.set('count', count + 1);
      });
    });
  <\/script>
</body>
</html>`;function x(e){for(let t=0;t<e.length;t++){let n=e.charCodeAt(t);if(n<=31||n===127)return!0}return!1}function S(e){if(e.length>_)throw Error(`Code App file path is too long`);let t=e.trim(),n=t.split(`/`);if(!t||new TextEncoder().encode(t).byteLength>_||t.startsWith(`/`)||t.includes(`\\`)||x(t)||n.some(e=>!e||e===`.`||e===`..`))throw Error(`Invalid Code App file path`);return t}function C(e){if(e.length>1e6)throw Error(`Code App files are limited to 1 MB`)}function w(e){let n=r(e).getMap(`files`),i={};return n.forEach((e,n)=>{Object.defineProperty(i,n,{value:e instanceof t?e.toJSON():``,enumerable:!0,configurable:!0,writable:!0})}),i}function T(e,n){let i=r(e).getMap(`files`).get(S(n));return i instanceof t?i.toJSON():``}function E(e){return e>=55296&&e<=56319}function D(e,t){let n=e.toJSON();if(n===t)return;let r=Math.min(n.length,t.length),i=0;for(;i<r&&n.charCodeAt(i)===t.charCodeAt(i);)i+=1;i>0&&E(n.charCodeAt(i-1))&&--i;let a=0;for(;a<r-i&&n.charCodeAt(n.length-1-a)===t.charCodeAt(t.length-1-a);)a+=1;a>0&&E(n.charCodeAt(n.length-a-1))&&--a;let o=n.length-i-a;o>0&&e.delete(i,o);let s=t.slice(i,t.length-a);s&&e.insert(i,s)}function O(e,i,a){n(e,`owner`),C(a);let s=S(i),c=r(e),l=c.getMap(`files`),u=l.get(s);c.transact(()=>{u||(u=new t,l.set(s,u)),D(u,a)}),o(e)}function k(e,i,a){n(e,`owner`),C(a);let s=S(i),c=r(e).getMap(`files`);if(c.has(s))throw Error(`Code App file already exists: ${s}`);let l=new t;l.insert(0,a),c.set(s,l),o(e)}function A(e,i,a){n(e,`owner`);let s=S(i),c=S(a),l=r(e),u=l.getMap(`files`),d=u.get(s);if(!(d instanceof t))throw Error(`Code App file does not exist: ${s}`);if(u.has(c))throw Error(`Code App file already exists: ${c}`);let f=new t;f.insert(0,d.toJSON()),l.transact(()=>{u.set(c,f),u.delete(s)}),o(e)}function j(e,t){n(e,`owner`);let i=S(t),a=r(e).getMap(`files`);if(!a.has(i))throw Error(`Code App file does not exist: ${i}`);a.delete(i),o(e)}function M(e){let t=Object.entries(e);if(t.length===0||t.length>64)throw Error(`Code App source must contain 1–64 files`);let n={},r=0,i=new TextEncoder;for(let[e,a]of t){if(typeof a!=`string`)throw Error(`Code App file contents must be strings`);C(a);let t=S(e);if(t!==e||Object.hasOwn(n,t))throw Error(`Code App source contains a non-canonical or duplicate path`);if(r+=i.encode(t).byteLength+i.encode(a).byteLength,r>v)throw Error(`Code App source is limited to ${v} bytes`);Object.defineProperty(n,t,{value:a,enumerable:!0,configurable:!0,writable:!0})}if(!Object.hasOwn(n,`index.html`)||!Object.hasOwn(n,`manifest.yaml`))throw Error(`Code App source requires index.html and manifest.yaml`);let o=a(n[`manifest.yaml`]);if(o.error)throw Error(`Invalid Code App manifest: ${o.error}`);return m(n),n}function N(e,i){let a=M(i);n(e,`owner`);let s=r(e),c=s.getMap(`files`);s.transact(()=>{for(let e of[...c.keys()])c.delete(e);for(let[e,n]of Object.entries(a)){let r=new t;r.insert(0,n),c.set(e,r)}}),o(e)}function P(e,t=b,n=y){let i=r(e).getMap(`files`);i.has(`index.html`)||O(e,`index.html`,t),i.has(`manifest.yaml`)||O(e,`manifest.yaml`,n)}export{T as a,S as c,O as d,g as f,j as i,A as l,h as m,y as n,w as o,M as p,k as r,P as s,b as t,N as u};