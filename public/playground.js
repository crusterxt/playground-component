"use strict";(()=>{var oe=Object.defineProperty,re=Object.defineProperties;var se=Object.getOwnPropertyDescriptors;var V=Object.getOwnPropertySymbols;var le=Object.prototype.hasOwnProperty,ae=Object.prototype.propertyIsEnumerable;var D=(u,e,t)=>e in u?oe(u,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):u[e]=t,_=(u,e)=>{for(var t in e||(e={}))le.call(e,t)&&D(u,t,e[t]);if(V)for(var t of V(e))ae.call(e,t)&&D(u,t,e[t]);return u},q=(u,e)=>re(u,se(e));var P=CodeMirror.Pos,ue=["arrays","benchmark","bitfield","cli","clipboard","compress","context","crypto","darwin","datatypes","dl","dlmalloc","encoding","eventbus","flag","fontstash","gg","gx","hash","io","js","json","log","math","mssql","mysql","net","orm","os","pg","picoev","picohttpparser","rand","readline","regex","runtime","semver","sokol","sqlite","stbi","strconv","strings","sync","szip","term","time","toml","v","vweb","x"],K=["params","noinit","required","skip","assert_continues","unsafe","manualfree","heap","nonnull","primary","inline","direct_array_access","live","flag","noinline","noreturn","typedef","console","sql","table","deprecated","deprecated_after","export","callconv"],U="[\\w_]+",Q=new RegExp(`^(${K.join("|")})]$`),Y=`(${U}: ${U})`,Z=new RegExp(`^${Y}]$`),G=new RegExp(`^(${K.join("|")}(; ?)?){2,}]$`),J=new RegExp(`^((${Y})(; )?){2,}]$`),X=new RegExp(`^if ${U} \\??]`);function de(u){var p;let e=[],t=u.getCursor(),n=u.getTokenAt(t),r=new Set;for(let g=0;g<Math.min(u.lineCount(),10);g++){let f=u.getLineTokens(g).filter(b=>b.type!=null);f.length>0&&f[0].string==="import"&&r.add(f[f.length-1].string)}let l=u.getLineTokens(t.line);l.length>0&&l[0].string==="import"&&e.push(l[0]);let a=n.string.length,d=u.getTokenAt(P(t.line,t.ch-a));return n.string==="."&&e.push(n),d.string==="."&&e.push(d),/\b(?:string|comment)\b/.test((p=n.type)!=null?p:"")?null:(/^[\w$_]*$/.test(n.string)?n.end>t.ch&&(n.end=t.ch,n.string=n.string.slice(0,t.ch-n.start)):n={start:t.ch,end:t.ch,string:"",state:n.state,type:n.string==="."?"property":null},{list:ce(n,r,e),from:P(t.line,n.start),to:P(t.line,n.end)})}function ce(u,e,t){let n=[],r=u.string;function l(a){let d=a.text;if(!d.startsWith(r))return;n.find(g=>g.text===d)||n.push(a)}if(t&&t.length){let a=t.pop();if(a!==void 0){if(a.type==="keyword"&&a.string==="import")return ue.forEach(d=>{l({text:d,displayText:d,className:"completion-module"})}),n;if(a.string===".")return[]}}return e.forEach(a=>{l({text:a,displayText:a,className:"completion-module"})}),A.forEach(a=>{l({text:a+" ",displayText:a,className:"completion-keyword"})}),N.forEach(a=>{l({text:a+" ",displayText:a,className:"completion-keyword"})}),B.forEach(a=>{l({text:a,displayText:a,className:"completion-atom"})}),W.forEach(a=>{l({text:a,displayText:a,className:"completion-type"})}),n}var pe=u=>de(u);CodeMirror.registerHelper("hint","v",pe);var F=class{constructor(e,t,n,r,l){this.indentation=e;this.column=t;this.type=n;this.align=r;this.prev=l;this.insideString=!1;this.stringQuote=null;this.expectedImportName=!1;this.knownImports=new Set}},A=new Set(["as","asm","assert","atomic","break","const","continue","defer","else","enum","fn","for","go","goto","if","import","in","interface","is","isreftype","lock","match","module","mut","none","or","pub","return","rlock","select","shared","sizeof","static","struct","spawn","type","typeof","union","unsafe","volatile","__global","__offsetof"]),N=new Set(["sql","chan","thread"]),B=new Set(["true","false","nil","print","println","exit","panic","error","dump"]),W=new Set(["bool","string","i8","i16","int","i64","i128","u8","u16","u32","u64","u128","rune","f32","f64","isize","usize","voidptr","any"]);CodeMirror.defineMode("v",u=>{var y;let e=(y=u.indentUnit)!=null?y:0,t=/[+\-*&^%:=<>!?|\/]/,n=null;function r(i){return i.eatWhile(/[\w$_\xa1-\uffff]/),i.current()}function l(i,o){let s=i.next();if(s===null)return null;if(o.context.insideString&&s==="}")return i.eat("}"),o.tokenize=g(o.context.stringQuote),"end-interpolation";if(s==='"'||s==="'"||s==="`")return o.tokenize=g(s),o.tokenize(i,o);if(s==="."&&!i.match(/^[0-9]+([eE][\-+]?[0-9]+)?/))return"operator";if(s==="["&&(i.match(Q)||i.match(Z)||i.match(G)||i.match(J)||i.match(X)))return"attribute";if(/[\d.]/.test(s))return s==="0"?i.match(/^[xX][0-9a-fA-F_]+/)||i.match(/^o[0-7_]+/)||i.match(/^b[0-1_]+/):i.match(/^[0-9_]*\.?[0-9_]*([eE][\-+]?[0-9_]+)?/),"number";if(/[\[\]{}(),;:.]/.test(s))return n=s,null;if(s==="/"){if(i.eat("*"))return o.tokenize=f,f(i,o);if(i.eat("/"))return i.skipToEnd(),"comment"}if(t.test(s))return i.eatWhile(t),"operator";if(s==="@")return r(i),"at-identifier";if(s==="$"){let M=r(i).slice(1);return A.has(M)?"keyword":"compile-time-identifier"}i.backUp(2);let h=i.next()===".";i.next();let c=r(i);if(c==="import"&&(o.context.expectedImportName=!0),A.has(c)||N.has(c))return"keyword";if(B.has(c))return"atom";if(W.has(c))return"builtin";if(c.length>0&&c[0].toUpperCase()===c[0])return"type";let x=i.peek();if(x==="("||x==="<")return"function";if(x==="["){i.next();let M=i.next();if(i.backUp(2),M!=null&&M.match(/[A-Z]/i))return"function"}return h?"property":o.context.expectedImportName&&i.peek()!="."?(o.context.expectedImportName=!1,o.context.knownImports===void 0&&(o.context.knownImports=new Set),o.context.knownImports.add(c),"import-name"):o.context.knownImports.has(c)&&i.peek()=="."?"import-name":"variable"}function a(i,o){return i.match("}")?(o.tokenize=g(o.context.stringQuote),"end-interpolation"):(o.tokenize=l,o.tokenize(i,o))}function d(i,o){let s=i.next();if(s===" ")return o.tokenize=g(o.context.stringQuote),o.tokenize(i,o);if(s===".")return"operator";let h=r(i);if(h[0].toLowerCase()===h[0].toUpperCase())return o.tokenize=g(o.context.stringQuote),o.tokenize(i,o);let c=i.next();return i.backUp(1),c==="."?o.tokenize=d:o.tokenize=g(o.context.stringQuote),"variable"}function p(i,o){let s=i.next();return s==="$"&&i.eat("{")?(o.tokenize=a,"start-interpolation"):s==="$"?(o.tokenize=d,"start-interpolation"):"string"}function g(i){return function(o,s){s.context.insideString=!0,s.context.stringQuote=i;let h="",c=!1,x=!1;for(;(h=o.next())!=null;){if(h===i&&!c){x=!0;break}if(h==="$"&&!c&&o.eat("{"))return s.tokenize=p,o.backUp(2),"string";if(h==="$"&&!c)return s.tokenize=p,o.backUp(1),"string";c=!c&&h==="\\"}return(x||c)&&(s.tokenize=l),s.context.insideString=!1,s.context.stringQuote=null,"string"}}function f(i,o){let s=!1,h;for(;h=i.next();){if(h==="/"&&s){o.tokenize=l;break}s=h==="*"}return"comment"}function b(i,o,s){return i.context=new F(i.indention,o,s,null,i.context)}function m(i){if(!i.context.prev)return;let o=i.context.type;return(o===")"||o==="]"||o==="}")&&(i.indention=i.context.indentation),i.context=i.context.prev,i.context}return{startState:function(){return{tokenize:null,context:new F(0,0,"top",!1),indention:0,startOfLine:!0}},token:function(i,o){let s=o.context;if(i.sol()&&(s.align==null&&(s.align=!1),o.indention=i.indentation(),o.startOfLine=!0),i.eatSpace())return null;n=null;let h=(o.tokenize||l)(i,o);return h==="comment"||(s.align==null&&(s.align=!0),n==="{"?b(o,i.column(),"}"):n==="["?b(o,i.column(),"]"):n==="("?b(o,i.column(),")"):(n==="}"&&s.type==="}"||n===s.type)&&m(o),o.startOfLine=!1),h},indent:function(i,o){if(i.tokenize!==l&&i.tokenize!=null||i.context.type=="top")return 0;let s=i.context,c=o.charAt(0)===s.type;return s.align?s.column+(c?0:1):s.indentation+(c?0:e)},electricChars:"{}):",closeBrackets:"()[]{}''\"\"``",fold:"brace",blockCommentStart:"/*",blockCommentEnd:"*/",lineComment:"//"}});CodeMirror.defineMIME("text/x-v","v");var S=class{saveCode(e){window.localStorage.setItem(S.LOCAL_STORAGE_KEY,e)}getCode(e){let t=window.localStorage.getItem(S.LOCAL_STORAGE_KEY);if(t==null){e(S.WELCOME_CODE);return}e(t)}},T=S;T.LOCAL_STORAGE_KEY="code",T.WELCOME_CODE=`
// Welcome to the V Playground!
// Here you can edit, run, and share V code.
// Let's start with a simple "Hello, Playground!" example:
println('Hello, Playground!')

// To run the code, click the "Run" button or just press Ctrl + R.
// To format the code, click the "Format" button or just press Ctrl + L.
// See all shortcuts in the "Help" in the bottom right corner.

// More examples are available in right dropdown list.
// You can find Help for shortcuts in the bottom right corner or just press Ctrl + I.
// See also change theme button in the top right corner. 
// If you want to learn more about V, visit https://vlang.io
// Join us on Discord: https://discord.gg/vlang
// Enjoy!
`.trimStart();var v=class{constructor(e){this.hash=e}saveCode(e){}getCode(e){return this.getSharedCode(e)}getSharedCode(e){let t=new FormData;t.append("hash",this.hash),fetch("/query",{method:"post",body:t}).then(n=>n.text()).then(n=>{e(n)}).catch(n=>{console.log(n)})}};v.QUERY_PARAM_NAME="query",v.CODE_NOT_FOUND="Not found.";var O=class{constructor(e){this.text=e}saveCode(e){}getCode(e){e(this.text)}};var I=class{constructor(e){this.onClose=null;this.onWrite=null;this.filters=[];this.element=e}registerCloseHandler(e){this.onClose=e}registerWriteHandler(e){this.onWrite=e}registerFilter(e){this.filters.push(e)}write(e){let t=e.split(`
`),n=this.getTerminalOutputElement(),l=t.filter(a=>this.filters.every(d=>d(a))).join(`
`);n.innerHTML+=l+`
`,this.onWrite!==null&&this.onWrite(e)}writeTestPassed(){let e=`
<span class="test-passed-line">
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8.50006" cy="8.5" r="6.70953" stroke="#38a13b"/>
        <path d="M5.06188 8.93582L8.00653 10.9566L11.4065 5.35109" stroke="#38a13b"/>
    </svg>

    <span>Tests passed</span>
</span>
`,t=this.getTerminalOutputElement();t.innerHTML+=e+`
`,this.onWrite!==null&&this.onWrite("")}writeTestFailed(){let e=`
<span class="test-failed-line">
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8.50006" cy="8.5" r="6.70953" stroke="#AF5050"/>
        <path d="M9.05936 4.27274L8.97413 10.5455H7.9855L7.90027 4.27274H9.05936ZM8.47981 13.0682C8.26959 13.0682 8.08919 12.9929 7.93862 12.8423C7.78805 12.6918 7.71277 12.5114 7.71277 12.3011C7.71277 12.0909 7.78805 11.9105 7.93862 11.76C8.08919 11.6094 8.26959 11.5341 8.47981 11.5341C8.69004 11.5341 8.87044 11.6094 9.02101 11.76C9.17158 11.9105 9.24686 12.0909 9.24686 12.3011C9.24686 12.4403 9.21135 12.5682 9.14033 12.6847C9.07214 12.8011 8.97981 12.8949 8.86334 12.9659C8.7497 13.0341 8.62186 13.0682 8.47981 13.0682Z" fill="#AF5050"/>
    </svg>

    <span>Tests failed</span>
</span>
`,t=this.getTerminalOutputElement();t.innerHTML+=e+`
`,this.onWrite!==null&&this.onWrite("")}clear(){this.getTerminalOutputElement().innerHTML=""}mount(){let e=this.element.querySelector(".js-terminal__close-buttom");e==null||this.onClose===null||e.addEventListener("click",this.onClose)}getTerminalOutputElement(){return this.element.querySelector(".js-terminal__output")}};var z=class{constructor(e){this.removedIndent=0;this.state=0;this.wasUnfolded=!1;this.foldedCode=null;this.unfoldedCode=null;this.currentCodeObtainer=()=>"";let t=this.normalizeCode(e);this.range=this.getSnippetRange(t),this.code=this.removeRangeMarkers(t)}registerCurrentCodeObtainer(e){this.currentCodeObtainer=e}noFolding(){return this.range.start==-1}getCode(){return this.noFolding()?this.code:this.state==1?this.getUnfoldedCode():this.getFoldedCode()}getRunnableCode(){return this.state==1?this.currentCodeObtainer():this.getUnfoldedCodeWithoutCaching()}getUnfoldedCode(){return this.unfoldedCode!=null?this.unfoldedCode:this.getUnfoldedCodeWithoutCaching()}getUnfoldedCodeWithoutCaching(){if(this.noFolding())return this.currentCodeObtainer();let e=this.currentCodeObtainer(),t=" ".repeat(this.removedIndent),n=e.split(`
`).map(p=>t+p).join(`
`),r=this.code.split(`
`),l=r.slice(0,this.range.start).join(`
`),a=r.slice(r.length-this.range.startFromEnd).join(`
`),d=l+`
`+n+`
`+a;return this.unfoldedCode=d,d}getFoldedCode(){if(this.noFolding())return this.currentCodeObtainer();if(this.foldedCode!=null)return this.foldedCode;this.wasUnfolded&&(this.code=this.currentCodeObtainer());let e=this.code.split(`
`),t=e.slice(this.range.start,e.length-this.range.startFromEnd).join(`
`),n=this.normalizeIndents(t);return this.foldedCode=n,n}toggle(){this.state==0?(this.state=1,this.wasUnfolded=!0,this.foldedCode=null):(this.state=0,this.unfoldedCode=null)}getSnippetRange(e){let t=e.split(`
`),n=t.findIndex(l=>l.trim().startsWith("//code::start")),r=t.findIndex(l=>l.trim().startsWith("//code::end"));return n==-1||r==-1?{start:-1,startFromEnd:0}:{start:n,startFromEnd:t.length-r-1}}normalizeCode(e){let t=this.normalizeIndents(e).split(`
`);if(t.length>1){let n=t[0],r=t[t.length-1];n.trim().length==0&&t.shift(),r.trim().length==0&&t.pop()}return t.join(`
`)}normalizeIndents(e){let t=e.split(`
`),n=t.map(a=>this.lineIndent(a)),r=Math.min(...n),l=t.map(a=>a.substring(r));return this.removedIndent=r,l.join(`
`)}lineIndent(e){for(let t=0;t<e.length;t++)if(e[t]!==" "&&e[t]!="	")return e.substring(0,t).replaceAll("	","    ").length;return Number.MAX_VALUE}removeRangeMarkers(e){return e.split(`
`).filter(r=>!r.trim().startsWith("//code::")).join(`
`)}};var H=class{constructor(e,t,n,r){this.snippet=null;let l={mode:"v",lineNumbers:r,matchBrackets:!0,extraKeys:{"Ctrl-Space":"autocomplete","Ctrl-/":"toggleComment"},indentWithTabs:!0,indentUnit:4,autoCloseBrackets:!0,showHint:!0,lint:{async:!0,lintOnChange:!0,delay:20},toggleLineComment:{indent:!0,padding:" "},theme:"dark",readOnly:n?"nocursor":!1};this.wrapperElement=e;let a=e.querySelector("textarea");this.editor=CodeMirror.fromTextArea(a,l),this.repository=t,this.repository.getCode(p=>{if(p===v.CODE_NOT_FOUND){this.terminal.write("Code for shared link not found.");return}this.snippet=new z(p),this.snippet.registerCurrentCodeObtainer(()=>this.editor.getValue()),this.setCode(this.snippet.getCode())});let d=e.querySelector(".js-terminal");if(d==null)throw new Error("Terminal not found, please check that terminal inside editor element");this.terminal=new I(d),this.terminal.registerCloseHandler(()=>{this.closeTerminal(),this.editor.refresh()}),this.terminal.registerWriteHandler(p=>{this.openTerminal()}),this.terminal.registerFilter(p=>!p.trim().startsWith("Failed command")),this.terminal.mount(),this.closeTerminal()}setEditorFontSize(e){let t=this.wrapperElement.querySelector(".CodeMirror"),n=e;n.endsWith("px")&&(n=n.slice(0,-2)),t.style.fontSize=n+"px",this.refresh()}setCode(e,t=!1){let n=this.editor.getCursor();this.editor.setValue(e),this.repository.saveCode(e),t&&this.editor.setCursor(n)}getCode(){var e;return(e=this.snippet)==null?void 0:e.getCode()}saveCode(){this.repository instanceof v&&(this.repository=new T),this.repository.saveCode(this.getCode())}toggleSnippet(){if(this.snippet!==null){if(this.snippet.toggle(),this.setCode(this.snippet.getCode()),this.snippet.state==1){let t=this.snippet.getCode().split(`
`).length,n=this.snippet.range.start,r=t-this.snippet.range.startFromEnd;this.editor.markText({line:0,ch:0},{line:n,ch:0},{readOnly:!0,inclusiveLeft:!0,inclusiveRight:!1}),this.editor.markText({line:r,ch:0},{line:t,ch:0},{readOnly:!0,inclusiveLeft:!0,inclusiveRight:!1}),this.editor.operation(()=>{for(let l=0;l<n;l++)this.editor.addLineClass(l,"background","unmodifiable-line");for(let l=r;l<t;l++)this.editor.addLineClass(l,"background","unmodifiable-line")})}this.refresh()}}openTerminal(){this.wrapperElement.classList.remove("closed-terminal")}closeTerminal(){this.wrapperElement.classList.add("closed-terminal")}setTheme(e){var t;this.editor.setOption("theme",e.name()),(t=this.wrapperElement)==null||t.setAttribute("data-theme",e.name())}showCompletion(){this.editor.execCommand("autocomplete")}refresh(){this.editor.refresh()}};var k=class{static runCode(e){let t=new FormData;t.append("code",e);let n=this.buildUrl("run");return fetch(n,{method:"post",body:t}).then(r=>{if(r.status!=200)throw new Error("Can't run code");return r}).then(r=>r.json()).then(r=>JSON.parse(r))}static runTest(e){let t=new FormData;t.append("code",e);let n=this.buildUrl("run_test");return fetch(n,{method:"post",body:t}).then(r=>{if(r.status!=200)throw new Error("Can't run test");return r}).then(r=>r.json()).then(r=>JSON.parse(r))}static buildUrl(e){return this.server!==null&&this.server!==void 0?`${this.server.endsWith("/")?this.server.slice(0,-1):this.server}/${e}`:`/${e}`}};var ee=`
<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="8.5" y1="2" x2="8.5" y2="15" stroke="black"/>
    <line x1="15" y1="8.5" x2="2" y2="8.5" stroke="black"/>
</svg>
`,te=`
<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="3.90385" y1="3.9038" x2="13.0962" y2="13.0962" stroke="black"/>
    <line x1="13.0962" y1="3.90382" x2="3.90384" y2="13.0962" stroke="black"/>
</svg>
`,ne=`<div class="js-playground v-playground">
  <div class="playground__wrapper">
    <div class="playground__editor">
      <div class="js-playground__action-show-all show-all-button">
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="8.5" y1="2" x2="8.5" y2="15" stroke="black"/>
              <line x1="15" y1="8.5" x2="2" y2="8.5" stroke="black"/>
          </svg>
      </div>
      <div class="js-playground__action-run run-style-button">
        <div class="icon">
          <svg class="run-icon" width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_14_12)">
              <path d="M14.0548 8.75068L3.25542 14.9857C2.92209 15.1782 2.50542 14.9376 2.50542 14.5527L2.50542 2.08263C2.50542 1.69774 2.92208 1.45717 3.25542 1.64962L14.0548 7.88465C14.3881 8.0771 14.3881 8.55823 14.0548 8.75068Z"
                    fill="#659360" fill-opacity="0.2" stroke="#659360"/>
            </g>
            <defs>
              <clipPath id="clip0_14_12">
                <rect width="16" height="16" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>
      
      <!-- Place for CodeMirror editor -->
      <textarea></textarea>
    </div>
    
    <div class="js-terminal playground__terminal">
      <div class="header">
        <button class="js-terminal__close-buttom terminal__close-button">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect class="close-terminal-button-rect" x="1" y="8" width="13" height="1"/>
          </svg>
        </button>
      </div>
      <pre class="js-terminal__output terminal__output"></pre>
    </div>
  </div>
  
  <div class="js-playground__footer playground__footer">
    <span class="js-playground-link playground-link">Playground \u2192</span>
  </div>
</div>
`;var E=class{name(){return"dark"}};var R=class{name(){return"light"}};var w=class{constructor(e=null){this.currentTheme=null;this.onChange=[];this.changeThemeButton=null;this.predefinedTheme=null;this.predefinedTheme=e,this.changeThemeButton=document.querySelector(".js-playground__action-change-theme")}registerOnChange(e){this.onChange.push(e)}loadTheme(){if(this.predefinedTheme!==null&&this.predefinedTheme!==void 0){this.turnTheme(this.predefinedTheme);return}this.turnTheme(new E)}turnTheme(e){this.currentTheme=e,this.onChange.forEach(t=>t(e))}turnDarkTheme(){this.turnTheme(new E)}turnLightTheme(){this.turnTheme(new R)}toggleTheme(){this.currentTheme&&(this.currentTheme.name()==="light"?this.turnDarkTheme():this.turnLightTheme())}static findTheme(e){let n=this.themes.filter(r=>r.name()===e)[0];if(n===void 0)throw new Error(`Theme ${e} not found`);return n}};w.themes=[new E,new R];var L=u=>{if(u!=null)return u==="true"},$=u=>Object.fromEntries(Object.entries(u).filter(([e,t])=>t!==void 0));var C=class{constructor(e){this.onSuccessfulRun=[];this.onFailedRun=[];var a,d,p,g,f,b;if(e.selector)this.playgroundElement=document.querySelector(e.selector);else if(e.element)this.playgroundElement=e.element;else throw new Error("No selector or element provided");let t=(d=(a=e.code)!=null?a:this.playgroundElement.textContent)!=null?d:"";this.mount(this.playgroundElement),this.runAsTests=e.configuration==="tests",this.repository=new O(t);let n=this.playgroundElement.querySelector(".v-playground");this.editor=new H(n,this.repository,(p=e.highlightOnly)!=null?p:!1,(g=e.showLineNumbers)!=null?g:!0),e.fontSize&&this.editor.setEditorFontSize(e.fontSize);let r=(f=e.theme)!=null?f:"light";if(this.themeManager=new w(w.findTheme(r)),this.themeManager.registerOnChange(m=>{this.setThemeImpl(m)}),this.themeManager.loadTheme(),this.registerRunAction(e.customRunButton,()=>{this.run()}),this.registerAction("show-all",()=>{var y;this.editor.toggleSnippet();let m=this.getActionElement("show-all");((y=this.editor.snippet)==null?void 0:y.state)===0?m.innerHTML=ee:m.innerHTML=te}),this.setupPlaygroundLink(),e.showFoldedCodeButton===!1||(b=this.editor.snippet)!=null&&b.noFolding()){let m=this.getActionElement("show-all");m.style.display="none"}let l=this.playgroundElement.querySelector(".js-playground__footer");if(e.showFooter===!1&&(l.style.display="none",n.classList.add("no-footer")),e.highlightOnly===!0){let m=this.getActionElement("run");m.style.display="none",l.style.display="none"}e.server!==void 0&&(k.server=e.server)}setTheme(e){this.setThemeImpl(w.findTheme(e))}setThemeImpl(e){this.editor.setTheme(e)}setupPlaygroundLink(){this.playgroundElement.querySelector(".js-playground-link").addEventListener("click",()=>{var a;let t="https://play.vlang.foundation/?base64=",n=(a=this.editor.snippet)==null?void 0:a.getRunnableCode(),r=btoa(n),l=t+r;window.open(l,"_blank")})}static create(e,t){let n=this.getDefaultConfiguration(),r=this.getConfigurationFromElement(e);return new C(q(_(_(_({},n),$(t!=null?t:{})),$(r)),{element:e}))}static getDefaultConfiguration(){return{configuration:"run",theme:"light",fontSize:"12px",showLineNumbers:!0,highlightOnly:!1,showFoldedCodeButton:!0,showFooter:!0,server:"https://play.vlang.foundation/"}}static getConfigurationFromElement(e){var b,m,y,i,o;let t=(b=e==null?void 0:e.getAttribute("data-configuration"))!=null?b:void 0,n=(m=e==null?void 0:e.getAttribute("data-theme"))!=null?m:void 0,r=(y=e.getAttribute("data-font-size"))!=null?y:void 0,l=L(e==null?void 0:e.getAttribute("data-show-line-numbers")),a=L(e.getAttribute("data-highlight-only")),d=L(e==null?void 0:e.getAttribute("data-show-folded-code-button")),p=L(e.getAttribute("data-show-footer")),g=(i=e==null?void 0:e.getAttribute("data-custom-run-button"))!=null?i:void 0,f=(o=e==null?void 0:e.getAttribute("data-server"))!=null?o:void 0;return{configuration:t,theme:n,fontSize:r,showLineNumbers:l,highlightOnly:a,showFoldedCodeButton:d,showFooter:p,customRunButton:g,server:f}}registerOnSuccessfulRun(e){this.onSuccessfulRun.push(e)}registerOnFailedRun(e){this.onFailedRun.push(e)}registerRunAction(e,t){if(e){let n=document.querySelector(e);if(n===void 0)throw new Error(`Can't find custom button with selector ${e}`);n.addEventListener("click",t);let r=this.getActionElement("run");r.style.display="none";return}this.registerAction("run",t)}mount(e){e!==null&&(e.innerHTML=ne)}registerAction(e,t){let n=this.playgroundElement.querySelector(`.js-playground__action-${e}`);if(n===void 0)throw new Error(`Can't find action button with class js-playground__action-${e}`);n.addEventListener("click",t)}getActionElement(e){return this.playgroundElement.querySelector(`.js-playground__action-${e}`)}run(){if(this.runAsTests){this.runTests();return}this.runCode()}runCode(){var t;this.clearTerminal(),this.writeToTerminal("Running code...");let e=(t=this.editor.snippet)==null?void 0:t.getRunnableCode();k.runCode(e).then(n=>{this.clearTerminal(),this.writeToTerminal(n.output),this.onRunFinished(n)}).catch(n=>{console.log(n),this.writeToTerminal("Can't run code. Please try again."),this.onFailedRun.forEach(r=>r())})}runTests(){var t;this.clearTerminal(),this.writeToTerminal("Running tests...");let e=(t=this.editor.snippet)==null?void 0:t.getRunnableCode();k.runTest(e).then(n=>{if(this.clearTerminal(),n.ok)this.editor.terminal.writeTestPassed();else{this.editor.terminal.writeTestFailed();let r=n.output.split(`
`).slice(2,-6).join(`
`);this.writeToTerminal(r)}this.onRunFinished(n)}).catch(n=>{console.log(n),this.writeToTerminal("Can't run tests. Please try again."),this.onFailedRun.forEach(r=>r())})}onRunFinished(e){e.ok?this.onSuccessfulRun.forEach(t=>t()):this.onFailedRun.forEach(t=>t())}setupShortcuts(){this.editor.editor.on("keypress",(e,t)=>{!e.state.completionActive&&t.key.length===1&&t.key.match(/[a-z0-9]/i)&&this.editor.showCompletion()}),document.addEventListener("keydown",e=>{(e.ctrlKey||e.metaKey)&&e.key==="s"?(this.editor.saveCode(),e.preventDefault()):this.editor.saveCode()})}clearTerminal(){this.editor.terminal.clear()}writeToTerminal(e){this.editor.terminal.write(e)}setEditorFontSize(e){this.editor.setEditorFontSize(e)}};var j=document.currentScript,ie=j==null?void 0:j.getAttribute("data-selector"),ge=C.getConfigurationFromElement(j);ie&&window.addEventListener("DOMContentLoaded",()=>{document.querySelectorAll(ie).forEach(u=>{C.create(u,ge)})});window.Playground=C;})();
//# sourceMappingURL=playground.js.map
