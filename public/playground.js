"use strict";(()=>{var ee=Object.defineProperty,te=Object.defineProperties;var ne=Object.getOwnPropertyDescriptors;var N=Object.getOwnPropertySymbols;var ie=Object.prototype.hasOwnProperty,oe=Object.prototype.propertyIsEnumerable;var $=(p,e,t)=>e in p?ee(p,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):p[e]=t,_=(p,e)=>{for(var t in e||(e={}))ie.call(e,t)&&$(p,t,e[t]);if(N)for(var t of N(e))oe.call(e,t)&&$(p,t,e[t]);return p},Q=(p,e)=>te(p,ne(e));var V=["params","noinit","required","skip","assert_continues","unsafe","manualfree","heap","nonnull","primary","inline","direct_array_access","live","flag","noinline","noreturn","typedef","console","sql","table","deprecated","deprecated_after","export","callconv"],D="[\\w_]+",re=new RegExp(`^(${V.join("|")})]$`),Y=`(${D}: ${D})`,se=new RegExp(`^${Y}]$`),le=new RegExp(`^(${V.join("|")}(; ?)?){2,}]$`),ue=new RegExp(`^((${Y})(; )?){2,}]$`),ae=new RegExp(`^if ${D} \\??]`),F=class{constructor(e,t,n,l,a,m=new Set){this.indentation=e;this.column=t;this.type=n;this.align=l;this.prev=a;this.knownImports=m;this.insideString=!1;this.stringQuote=null;this.expectedImportName=!1}},q=new Set(["as","asm","assert","atomic","break","const","continue","defer","else","enum","fn","for","go","goto","if","import","in","interface","is","isreftype","lock","match","module","mut","none","or","pub","return","rlock","select","shared","sizeof","static","struct","spawn","type","typeof","union","unsafe","volatile","__global","__offsetof"]),de=new Set(["sql","chan","thread"]),ce=new Set(["#flag","#include","#pkgconfig"]),pe=new Set(["true","false","nil","print","println","exit","panic","error","dump"]),he=new Set(["bool","string","i8","i16","int","i32","i64","i128","u8","u16","u32","u64","u128","rune","f32","f64","isize","usize","voidptr"]);CodeMirror.defineMode("v",p=>{var w;let e=(w=p.indentUnit)!=null?w:0,t=/[+\-*&^%:=<>!?|\/]/,n=null;function l(i){return i.eatWhile(/[\w$_\xa1-\uffff]/),i.current()}function a(i,o){let s=i.next();if(s===null)return null;if(o.context.insideString&&s==="}")return i.eat("}"),o.tokenize=r(o.context.stringQuote),"end-interpolation";if(s==='"'||s==="'"||s==="`")return o.tokenize=r(s),o.tokenize(i,o);if((s==="r"||s==="c")&&(i.peek()=='"'||i.peek()=="'")){let k=i.next();return k===null||(o.tokenize=d(k)),"string"}if(s==="."&&!i.match(/^[0-9]+([eE][\-+]?[0-9]+)?/))return"operator";if(s==="["&&(i.match(re)||i.match(se)||i.match(le)||i.match(ue)||i.match(ae)))return"attribute";if(/[\d.]/.test(s))return s==="0"?i.match(/^[xX][0-9a-fA-F_]+/)||i.match(/^o[0-7_]+/)||i.match(/^b[0-1_]+/):i.match(/^[0-9_]*\.?[0-9_]*([eE][\-+]?[0-9_]+)?/),"number";if(/[\[\]{}(),;:.]/.test(s))return n=s,null;if(s==="/"){if(i.eat("*"))return o.tokenize=u,u(i,o);if(i.eat("/"))return i.skipToEnd(),"comment"}if(t.test(s))return i.eatWhile(t),"operator";if(s==="@")return l(i),"at-identifier";if(s==="$"){let k=l(i).slice(1);return q.has(k)?"keyword":"compile-time-identifier"}i.backUp(2);let f=i.next()===".";i.next();let h=l(i);if(h==="import"&&(o.context.expectedImportName=!0),q.has(h)||de.has(h))return"keyword";if(pe.has(h))return"atom";if(ce.has(h))return"hash-directive";if(!f&&he.has(h))return"builtin";if(h.length>0&&h[0].toUpperCase()===h[0])return"type";let y=i.peek();if(y==="("||y==="<")return"function";if(y==="["){i.next();let k=i.next();if(i.backUp(2),k!=null&&k.match(/[A-Z]/i))return"function"}return o.context.expectedImportName&&i.peek()!=="."?(o.context.expectedImportName=!1,o.context.knownImports===void 0&&(o.context.knownImports=new Set),o.context.knownImports.add(h),"import-name"):f?"property":o.context.knownImports.has(h)&&i.peek()=="."?"import-name":"variable"}function m(i,o){return i.match("}")?(o.tokenize=r(o.context.stringQuote),"end-interpolation"):(o.tokenize=a,o.tokenize(i,o))}function x(i,o){let s=i.next();if(s===" ")return o.tokenize=r(o.context.stringQuote),o.tokenize(i,o);if(s===".")return"operator";let f=l(i);if(f[0].toLowerCase()===f[0].toUpperCase())return o.tokenize=r(o.context.stringQuote),o.tokenize(i,o);let h=i.next();return i.backUp(1),h==="."?o.tokenize=x:o.tokenize=r(o.context.stringQuote),"variable"}function b(i,o){let s=i.next();return s==="$"&&i.eat("{")?(o.tokenize=m,"start-interpolation"):s==="$"?(o.tokenize=x,"start-interpolation"):"string"}function C(i,o){return i.next()==="\\"?(i.next(),o.tokenize=r(o.context.stringQuote),"valid-escape"):"string"}function v(i){return i==="n"||i==="t"||i==="r"||i==="\\"||i==='"'||i==="'"||i==="0"}function r(i){return function(o,s){s.context.insideString=!0,s.context.stringQuote=i;let f="",h=!1,y=!1;for(;(f=o.next())!=null;){if(f===i&&!h){y=!0;break}if(f==="$"&&!h&&o.eat("{"))return s.tokenize=b,o.backUp(2),"string";if(f==="$"&&!h)return s.tokenize=b,o.backUp(1),"string";if(h&&v(f))return o.backUp(2),s.tokenize=C,"string";h=!h&&f==="\\"}return(y||h)&&(s.tokenize=a),s.context.insideString=!1,s.context.stringQuote=null,"string"}}function d(i){return function(o,s){s.context.insideString=!0,s.context.stringQuote=i;let f="",h=!1,y=!1;for(;(f=o.next())!=null;){if(f===i&&!h){y=!0;break}h=!h&&f==="\\"}return(y||h)&&(s.tokenize=a),s.context.insideString=!1,s.context.stringQuote=null,"string"}}function u(i,o){let s=!1,f;for(;f=i.next();){if(f==="/"&&s){o.tokenize=a;break}s=f==="*"}return"comment"}function c(i,o,s){return i.context=new F(i.indention,o,s,null,i.context,i.context.knownImports)}function g(i){if(!i.context.prev)return;let o=i.context.type;return(o===")"||o==="]"||o==="}")&&(i.indention=i.context.indentation),i.context=i.context.prev,i.context}return{startState:function(){return{tokenize:null,context:new F(0,0,"top",!1),indention:0,startOfLine:!0}},token:function(i,o){let s=o.context;if(i.sol()&&(s.align==null&&(s.align=!1),o.indention=i.indentation(),o.startOfLine=!0),i.eatSpace())return null;n=null;let f=(o.tokenize||a)(i,o);return f==="comment"||(s.align==null&&(s.align=!0),n==="{"?c(o,i.column(),"}"):n==="["?c(o,i.column(),"]"):n==="("?c(o,i.column(),")"):(n==="}"&&s.type==="}"||n===s.type)&&g(o),o.startOfLine=!1),f},indent:function(i,o){if(i.tokenize!==a&&i.tokenize!=null||i.context.type=="top")return 0;let s=i.context,h=o.charAt(0)===s.type;return s.align?s.column+(h?0:1):s.indentation+(h?0:e)},electricChars:"{}):",closeBrackets:"()[]{}''\"\"``",fold:"brace",blockCommentStart:"/*",blockCommentEnd:"*/",lineComment:"//"}});CodeMirror.defineMIME("text/x-v","v");var A=class{constructor(e,t,n,l,a){this.indentation=e;this.column=t;this.type=n;this.align=l;this.prev=a;this.insideString=!1;this.stringQuote=null}},ge=new Set(["Module"]);CodeMirror.defineMode("vmod",p=>{var v;let e=(v=p.indentUnit)!=null?v:0,t=/[+\-*&^%:=<>!?|\/]/,n=null;function l(r){return r.eatWhile(/[\w$_\xa1-\uffff]/),r.current()}function a(r,d){let u=r.next();if(u===null)return null;if(u==='"'||u==="'"||u==="`")return d.tokenize=m(u),d.tokenize(r,d);if(u==="."&&!r.match(/^[0-9]+([eE][\-+]?[0-9]+)?/))return"operator";if(/[\d.]/.test(u))return u==="0"?r.match(/^[xX][0-9a-fA-F_]+/)||r.match(/^o[0-7_]+/)||r.match(/^b[0-1_]+/):r.match(/^[0-9_]*\.?[0-9_]*([eE][\-+]?[0-9_]+)?/),"number";if(/[\[\]{}(),;:.]/.test(u))return n=u,null;if(u==="/"){if(r.eat("*"))return d.tokenize=x,x(r,d);if(r.eat("/"))return r.skipToEnd(),"comment"}if(t.test(u))return r.eatWhile(t),"operator";let c=l(r);if(ge.has(c))return"keyword";let g=r.peek();return g==="("||g==="<"?"function":g===":"?"property":"variable"}function m(r){return function(d,u){u.context.insideString=!0,u.context.stringQuote=r;let c="",g=!1,w=!1;for(;(c=d.next())!=null;){if(c===r&&!g){w=!0;break}g=!g&&c==="\\"}return(w||g)&&(u.tokenize=a),u.context.insideString=!1,u.context.stringQuote=null,"string"}}function x(r,d){let u=!1,c;for(;c=r.next();){if(c==="/"&&u){d.tokenize=a;break}u=c==="*"}return"comment"}function b(r,d,u){return r.context=new A(r.indention,d,u,null,r.context)}function C(r){if(!r.context.prev)return;let d=r.context.type;return(d===")"||d==="]"||d==="}")&&(r.indention=r.context.indentation),r.context=r.context.prev,r.context}return{startState:function(){return{tokenize:null,context:new A(0,0,"top",!1),indention:0,startOfLine:!0}},token:function(r,d){let u=d.context;if(r.sol()&&(u.align==null&&(u.align=!1),d.indention=r.indentation(),d.startOfLine=!0),r.eatSpace())return null;n=null;let c=(d.tokenize||a)(r,d);return c==="comment"||(u.align==null&&(u.align=!0),n==="{"?b(d,r.column(),"}"):n==="["?b(d,r.column(),"]"):n==="("?b(d,r.column(),")"):(n==="}"&&u.type==="}"||n===u.type)&&C(d),d.startOfLine=!1),c},indent:function(r,d){if(r.tokenize!==a&&r.tokenize!=null||r.context.type=="top")return 0;let u=r.context,g=d.charAt(0)===u.type;return u.align?u.column+(g?0:1):u.indentation+(g?0:e)},electricChars:"{}):",closeBrackets:"()[]{}''\"\"``",fold:"brace",blockCommentStart:"/*",blockCommentEnd:"*/",lineComment:"//"}});CodeMirror.defineMIME("text/x-vmod","vmod");var z=class{constructor(e){this.hash=e}saveCode(e){}getCode(e){return this.getSharedCode(e)}getSharedCode(e){let t=new FormData;t.append("hash",this.hash),fetch("/query",{method:"post",body:t}).then(n=>n.json()).then(n=>n).then(n=>{if(console.log(n),!n.found){e({code:z.CODE_NOT_FOUND});return}if(n.error!=""){console.error(n.error),e({code:z.CODE_NOT_FOUND});return}e(n.snippet)}).catch(n=>{console.log(n)})}},O=z;O.QUERY_PARAM_NAME="query",O.CODE_NOT_FOUND="Not found.";var I=class{constructor(e){this.text=e}saveCode(e){}getCode(e){e({code:this.text})}};var U=class{constructor(e){this.onClose=null;this.onWrite=null;this.filters=[];this.element=e}registerCloseHandler(e){this.onClose=e}registerWriteHandler(e){this.onWrite=e}registerFilter(e){this.filters.push(e)}write(e){let t=e.split(`
`),n=this.getTerminalOutputElement(),a=t.filter(m=>this.filters.every(x=>x(m))).join(`
`);n.innerHTML+=a+`
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
`,this.onWrite!==null&&this.onWrite("")}writeOutputEqual(){let e=`
<span class="test-passed-line">
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8.50006" cy="8.5" r="6.70953" stroke="#38a13b"/>
        <path d="M5.06188 8.93582L8.00653 10.9566L11.4065 5.35109" stroke="#38a13b"/>
    </svg>

    <span>Output Equal</span>
</span>
`,t=this.getTerminalOutputElement();t.innerHTML+=e+`
`,this.onWrite!==null&&this.onWrite("")}clear(){this.getTerminalOutputElement().innerHTML=""}mount(){let e=this.element.querySelector(".js-terminal__close-button");e==null||this.onClose===null||e.addEventListener("click",this.onClose)}getTerminalOutputElement(){return this.element.querySelector(".js-terminal__output")}};var B=class{constructor(e){this.removedIndent=0;this.state=0;this.wasUnfolded=!1;this.foldedCode=null;this.unfoldedCode=null;this.currentCodeObtainer=()=>"";let t=this.normalizeCode(e);this.range=this.getSnippetRange(t),this.code=this.removeRangeMarkers(t)}registerCurrentCodeObtainer(e){this.currentCodeObtainer=e}noFolding(){return this.range.start==-1}getCode(){return this.noFolding()?this.code:this.state==1?this.getUnfoldedCode():this.getFoldedCode()}getRunnableCode(){return this.state==1?this.currentCodeObtainer():this.getUnfoldedCodeWithoutCaching()}getRunnableCodeWithMarkers(){return this.getUnfoldedCodeWithoutCaching(!0)}getUnfoldedCode(){return this.unfoldedCode!=null?this.unfoldedCode:this.getUnfoldedCodeWithoutCaching()}getUnfoldedCodeWithoutCaching(e=!1){if(this.noFolding())return this.currentCodeObtainer();let t=this.currentCodeObtainer(),n=" ".repeat(this.removedIndent),l=t.split(`
`).map(v=>n+v).join(`
`),a=this.code.split(`
`),m=a.slice(0,this.range.start).join(`
`),x=a.slice(a.length-this.range.startFromEnd).join(`
`),b=[];b.push(m),e&&b.push("//code::start"),b.push(l),e&&b.push("//code::end"),b.push(x);let C=b.join(`
`);return this.unfoldedCode=C,C}getFoldedCode(){if(this.noFolding())return this.currentCodeObtainer();if(this.foldedCode!=null)return this.foldedCode;this.wasUnfolded&&(this.code=this.currentCodeObtainer());let e=this.code.split(`
`),t=e.slice(this.range.start,e.length-this.range.startFromEnd).join(`
`),n=this.normalizeIndents(t);return this.foldedCode=n,n}toggle(){this.state==0?(this.state=1,this.wasUnfolded=!0,this.foldedCode=null):(this.state=0,this.unfoldedCode=null)}getSnippetRange(e){let t=e.split(`
`),n=t.findIndex(a=>a.trim().startsWith("//code::start")),l=t.findIndex(a=>a.trim().startsWith("//code::end"));return n==-1||l==-1?{start:-1,startFromEnd:0}:{start:n,startFromEnd:t.length-l-1}}normalizeCode(e){let t=this.normalizeIndents(e).split(`
`);if(t.length>1){let n=t[0],l=t[t.length-1];n.trim().length==0&&t.shift(),l.trim().length==0&&t.pop()}return t.join(`
`)}normalizeIndents(e){let t=e.split(`
`),n=t.map(m=>this.lineIndent(m)),l=Math.min(...n),a=t.map(m=>m.substring(l));return this.removedIndent=l,a.join(`
`)}lineIndent(e){for(let t=0;t<e.length;t++)if(e[t]!==" "&&e[t]!="	")return e.substring(0,t).replaceAll("	","    ").length;return Number.MAX_VALUE}removeRangeMarkers(e){return e.split(`
`).filter(l=>!l.trim().startsWith("//code::")).join(`
`)}};var j=class{constructor(e,t,n,l){this.code=e;this.buildArguments=t;this.runArguments=n;this.runConfiguration=l}toFormData(){let e=new FormData;return e.append("code",this.code),e.append("build-arguments",this.buildArguments.join(" ")),e.append("run-arguments",this.runArguments.join(" ")),e.append("run-configuration",this.runConfiguration.toString()),e}},S=class{static runCode(e){return fetch(this.buildUrl("run"),{method:"post",body:e.toFormData()}).then(t=>{if(t.status!=200)throw new Error("Can't run code");return t}).then(t=>t.json()).then(t=>t)}static runTest(e){return fetch(this.buildUrl("run_test"),{method:"post",body:e.toFormData()}).then(t=>{if(t.status!=200)throw new Error("Can't run test");return t}).then(t=>t.json()).then(t=>t)}static runCheckOutput(e,t){let n=e.toFormData();return n.append("expected-output",t),fetch(this.buildUrl("check_output"),{method:"post",body:n}).then(l=>{if(l.status!=200)throw new Error("Can't run output checking");return l}).then(l=>l.json()).then(l=>l)}static buildUrl(e){return this.server!==null&&this.server!==void 0?`${this.server.endsWith("/")?this.server.slice(0,-1):this.server}/${e}`:`/${e}`}};var P=class{constructor(e,t,n,l,a="v"){this.snippet=null;this.onTerminalOpen=[];this.onTerminalClose=[];this.onCodeChange=[];let m={mode:a,lineNumbers:l,matchBrackets:!0,extraKeys:{"Ctrl-/":"toggleComment"},indentWithTabs:!0,indentUnit:4,autoCloseBrackets:!0,showHint:!0,lint:{async:!0,lintOnChange:!0,delay:20},toggleLineComment:{indent:!0,padding:" "},theme:"dark",readOnly:n?"nocursor":!1,scrollbarStyle:"overlay"};this.wrapperElement=e;let x=e.querySelector("textarea");this.editor=CodeMirror.fromTextArea(x,m),this.repository=t,this.repository.getCode(C=>{if(C.code===O.CODE_NOT_FOUND){this.terminal.write("Code for shared link not found.");return}this.updateCode(C.code)}),this.editor.on("change",()=>{var v,r;let C=(r=(v=this.snippet)==null?void 0:v.getRunnableCode())!=null?r:this.editor.getValue();this.onCodeChange.forEach(d=>d(C))});let b=e.querySelector(".js-terminal");if(b==null)throw new Error("Terminal not found, please check that terminal inside editor element");this.terminal=new U(b),this.terminal.registerCloseHandler(()=>{this.closeTerminal(),this.editor.refresh()}),this.terminal.registerWriteHandler(C=>{this.openTerminal()}),this.terminal.registerFilter(C=>!C.trim().startsWith("Failed command")),this.terminal.mount(),this.closeTerminal()}updateCode(e){this.snippet=new B(e),this.snippet.registerCurrentCodeObtainer(()=>this.editor.getValue()),this.setCode(this.snippet.getCode())}setEditorFontSize(e){let t=this.wrapperElement.querySelector(".CodeMirror"),n=e;n.endsWith("px")&&(n=n.slice(0,-2)),t.style.fontSize=n+"px",this.refresh()}setCode(e,t=!1){let n=this.editor.getCursor();this.editor.setValue(e),this.repository.saveCode(e),t&&this.editor.setCursor(n)}getCode(){var e;return(e=this.snippet)==null?void 0:e.getCode()}copyCode(){let e=this.getCode();return navigator.clipboard.writeText(e)}getRunnableCodeSnippet(e,t,n){var l;return new j((l=this.snippet)==null?void 0:l.getRunnableCode(),e,t,n)}toggleSnippet(){if(this.snippet!==null){if(this.snippet.toggle(),this.setCode(this.snippet.getCode()),this.snippet.state==1){let t=this.snippet.getCode().split(`
`).length,n=this.snippet.range.start,l=t-this.snippet.range.startFromEnd;this.editor.markText({line:0,ch:0},{line:n,ch:0},{readOnly:!0,inclusiveLeft:!0,inclusiveRight:!1}),this.editor.markText({line:l,ch:0},{line:t,ch:0},{readOnly:!0,inclusiveLeft:!0,inclusiveRight:!1}),this.editor.operation(()=>{for(let a=0;a<n;a++)this.editor.addLineClass(a,"background","unmodifiable-line");for(let a=l;a<t;a++)this.editor.addLineClass(a,"background","unmodifiable-line")})}this.refresh()}}openTerminal(){this.terminalSsClosed()&&(this.wrapperElement.classList.remove("closed-terminal"),this.onTerminalOpen.forEach(e=>e()))}closeTerminal(){this.terminalSsClosed()||(this.wrapperElement.classList.add("closed-terminal"),this.onTerminalClose.forEach(e=>e()))}terminalSsClosed(){return this.wrapperElement.classList.contains("closed-terminal")}setTheme(e){var t;this.editor.setOption("theme",e.name()),(t=this.wrapperElement)==null||t.setAttribute("data-theme",e.name())}refresh(){this.editor.refresh()}registerOnTerminalOpen(e){this.onTerminalOpen.push(e)}registerOnTerminalClose(e){this.onTerminalClose.push(e)}registerOnCodeChange(e){this.onCodeChange.push(e)}};var K=`
<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="8.5" y1="2" x2="8.5" y2="15" stroke="black"/>
    <line x1="15" y1="8.5" x2="2" y2="8.5" stroke="black"/>
</svg>
`,Z=`
<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="3.90385" y1="3.9038" x2="13.0962" y2="13.0962" stroke="black"/>
    <line x1="13.0962" y1="3.90382" x2="3.90384" y2="13.0962" stroke="black"/>
</svg>
`,X=`<div class="js-playground v-playground">
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

      <div class="js-playground__action-copy copy-button bottom">
         <svg xmlns='http://www.w3.org/2000/svg'
              fill='none'
              height='20'
              width='20'
              stroke='rgba(128,128,128,1)'
              stroke-width='2'
              viewBox='0 0 24 24'>
              <path stroke-linecap='round' stroke-linejoin='round' d='M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2'/>
         </svg>
      </div>

      <!-- Place for CodeMirror editor -->
      <textarea aria-label="Code snippet area"></textarea>
    </div>

    <div class="js-terminal playground__terminal">
      <button class="js-terminal__close-button terminal__close-button">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect class="close-terminal-button-rect" x="1" y="8" width="13" height="1"/>
        </svg>
      </button>
      <pre class="js-terminal__output terminal__output"></pre>
    </div>
  </div>

  <div class="js-playground__footer playground__footer">
    <span class="js-playground-link playground-link">Playground \u2192</span>
  </div>
</div>
`;var M=class{name(){return"dark"}};var L=class{name(){return"light"}};var E=class{constructor(e=null){this.currentTheme=null;this.onChange=[];this.changeThemeButton=null;this.predefinedTheme=null;this.predefinedTheme=e,this.changeThemeButton=document.querySelector(".js-playground__action-change-theme")}registerOnChange(e){this.onChange.push(e)}loadTheme(){if(this.predefinedTheme!==null&&this.predefinedTheme!==void 0){this.turnTheme(this.predefinedTheme);return}this.turnTheme(new M)}turnTheme(e){this.currentTheme=e,this.onChange.forEach(t=>t(e))}turnDarkTheme(){this.turnTheme(new M)}turnLightTheme(){this.turnTheme(new L)}toggleTheme(){this.currentTheme&&(this.currentTheme.name()==="light"?this.turnDarkTheme():this.turnLightTheme())}static findTheme(e){let n=this.themes.filter(l=>l.name()===e)[0];if(n===void 0)throw new Error(`Theme ${e} not found`);return n}};E.themes=[new M,new L];var R=p=>{if(p!=null)return p==="true"},W=p=>Object.fromEntries(Object.entries(p).filter(([e,t])=>t!==void 0));var T=class{constructor(e){this.onSuccessfulRun=[];this.onFailedRun=[];this.onTerminalOpen=[];this.onTerminalClose=[];this.onCodeChange=[];var b,C,v,r,d,u;if(e.selector)this.playgroundElement=document.querySelector(e.selector);else if(e.element)this.playgroundElement=e.element;else throw new Error("No selector or element provided");let t=(C=(b=e.code)!=null?b:this.playgroundElement.textContent)!=null?C:"";this.mount(this.playgroundElement),this.runAsTests=e.configuration==="tests",this.runAsCheckOutput=e.configuration==="check-output",this.repository=new I(t);let n=this.playgroundElement.querySelector(".v-playground"),l=e.isModuleFile?"vmod":"v";this.editor=new P(n,this.repository,(v=e.highlightOnly)!=null?v:!1,(r=e.showLineNumbers)!=null?r:!0,l),e.fontSize&&this.editor.setEditorFontSize(e.fontSize),e.expectedOutput&&(this.expectedOutput=e.expectedOutput),this.editor.registerOnTerminalOpen(()=>{this.onTerminalOpen.forEach(c=>c())}),this.editor.registerOnTerminalClose(()=>{this.onTerminalClose.forEach(c=>c())}),this.editor.registerOnCodeChange(c=>{this.onCodeChange.forEach(g=>g(c))});let a=(d=e.theme)!=null?d:"light";if(this.themeManager=new E(E.findTheme(a)),this.themeManager.registerOnChange(c=>{this.setThemeImpl(c)}),this.themeManager.loadTheme(),this.registerRunAction(e.customRunButton,()=>{this.run()}),this.registerAction("copy",()=>{let c=this.editor.copyCode(),g=this.getActionElement("copy");c.then(w=>{g.classList.add("copy-success"),setTimeout(()=>{g.classList.remove("copy-success")},1e3)}).catch(w=>{g.classList.add("copy-error"),setTimeout(()=>{g.classList.remove("copy-error")},1e3),console.log(w),this.editor.terminal.clear(),this.editor.terminal.write("Failed to copy code to clipboard."),this.editor.terminal.write(w)})}),this.registerAction("show-all",()=>{var g;this.editor.toggleSnippet();let c=this.getActionElement("show-all");((g=this.editor.snippet)==null?void 0:g.state)===0?c.innerHTML=K:c.innerHTML=Z}),this.setupPlaygroundLink(),e.showFoldedCodeButton===!1||(u=this.editor.snippet)!=null&&u.noFolding()){let c=this.getActionElement("show-all");c.style.display="none"}let m=this.playgroundElement.querySelector(".js-playground__footer");e.showFooter===!1&&(m.style.display="none",n.classList.add("no-footer"));let x=this.getActionElement("copy");if(e.highlightOnly===!0){let c=this.getActionElement("run");c.style.display="none",e.showCopyButton===!0&&x.classList.remove("bottom"),m.style.display="none"}e.showCopyButton||(x.style.display="none"),e.server!==void 0&&(S.server=e.server)}setCode(e){this.editor.updateCode(e)}setTheme(e){this.setThemeImpl(E.findTheme(e))}setThemeImpl(e){this.editor.setTheme(e)}setupPlaygroundLink(){this.playgroundElement.querySelector(".js-playground-link").addEventListener("click",()=>{var m;let t="https://play.vosca.dev/?base64=",n=(m=this.editor.snippet)==null?void 0:m.getRunnableCode(),l=btoa(n),a=t+l;window.open(a,"_blank")})}static create(e,t){let n=this.getDefaultConfiguration(),l=this.getConfigurationFromElement(e);return new T(Q(_(_(_({},n),W(t!=null?t:{})),W(l)),{element:e}))}static getDefaultConfiguration(){return{configuration:"run",theme:"light",fontSize:"12px",showLineNumbers:!0,highlightOnly:!1,showFoldedCodeButton:!0,showFooter:!0,showCopyButton:!0,server:"https://play.vosca.dev/"}}static getConfigurationFromElement(e){var u,c,g,w,i,o,s;if(e===null)return{};let t=(u=e==null?void 0:e.getAttribute("data-configuration"))!=null?u:void 0,n=(c=e==null?void 0:e.getAttribute("data-theme"))!=null?c:void 0,l=(g=e.getAttribute("data-font-size"))!=null?g:void 0,a=R(e==null?void 0:e.getAttribute("data-show-line-numbers")),m=R(e.getAttribute("data-highlight-only")),x=R(e==null?void 0:e.getAttribute("data-show-folded-code-button")),b=R(e.getAttribute("data-show-footer")),C=R(e.getAttribute("data-show-copy-button")),v=(w=e==null?void 0:e.getAttribute("data-custom-run-button"))!=null?w:void 0,r=(i=e==null?void 0:e.getAttribute("data-server"))!=null?i:void 0,d=(o=e==null?void 0:e.getAttribute("data-expected-output"))!=null?o:void 0;return{configuration:t,theme:n,fontSize:l,showLineNumbers:a,highlightOnly:m,showFoldedCodeButton:x,showFooter:b,customRunButton:v,showCopyButton:C,server:r,expectedOutput:(s=d==null?void 0:d.split("\\n"))==null?void 0:s.join(`
`)}}registerOnSuccessfulRun(e){this.onSuccessfulRun.push(e)}registerOnFailedRun(e){this.onFailedRun.push(e)}registerRunAction(e,t){if(e){let n=document.querySelector(e);if(n===void 0)throw new Error(`Can't find custom button with selector ${e}`);n.addEventListener("click",t);let l=this.getActionElement("run");l.style.display="none";return}this.registerAction("run",t)}mount(e){e!==null&&(e.innerHTML=X)}registerAction(e,t){let n=this.playgroundElement.querySelector(`.js-playground__action-${e}`);if(n===void 0)throw new Error(`Can't find action button with class js-playground__action-${e}`);n.addEventListener("click",t)}getActionElement(e){return this.playgroundElement.querySelector(`.js-playground__action-${e}`)}run(){if(this.runAsTests){this.runTests();return}else if(this.runAsCheckOutput){this.runCheckOutput();return}this.runCode()}runCode(){this.clearTerminal(),this.writeToTerminal("Running code...");let e=this.getRunnableCodeSnippet();S.runCode(e).then(t=>{if(t.error!=""){this.writeToTerminal(t.error),this.onFailedRun.forEach(n=>n());return}this.clearTerminal(),this.writeToTerminal(t.output.split(`
`).slice(0,-1).join(`
`)),this.onRunFinished(t)}).catch(t=>{console.log(t),this.writeToTerminal("Can't run code. Please try again."),this.onFailedRun.forEach(n=>n())})}runTests(){this.clearTerminal(),this.writeToTerminal("Running tests...");let e=this.getRunnableCodeSnippet();S.runTest(e).then(t=>{if(this.clearTerminal(),t.error=="")this.editor.terminal.writeTestPassed();else{this.editor.terminal.writeTestFailed();let n=t.error.split(`
`).slice(2,-6).join(`
`);this.writeToTerminal(n)}this.onRunFinished(t)}).catch(t=>{console.log(t),this.writeToTerminal("Can't run tests. Please try again."),this.onFailedRun.forEach(n=>n())})}runCheckOutput(){var t;this.clearTerminal(),this.writeToTerminal("Running checking for output...");let e=this.getRunnableCodeSnippet();S.runCheckOutput(e,(t=this.expectedOutput)!=null?t:"").then(n=>{var l;if(n.error!=""){this.writeToTerminal(n.error),this.onFailedRun.forEach(a=>a());return}this.clearTerminal(),n.is_equal?this.editor.terminal.writeOutputEqual():(this.writeToTerminal("Output is not equal to expected:"),this.writeToTerminal("---- Output ----"),this.writeToTerminal(n.output+"&lt;end>"),this.writeToTerminal("----"),this.writeToTerminal("---- Expected Output ----"),this.writeToTerminal(((l=this.expectedOutput)!=null?l:"")+"&lt;end>"),this.writeToTerminal("----"),this.writeToTerminal(n.diff)),this.onRunFinished(n)}).catch(n=>{console.log(n),this.writeToTerminal("Can't check output. Please try again."),this.onFailedRun.forEach(l=>l())})}getRunnableCodeSnippet(){let e=0;return this.runAsTests&&(e=1),this.editor.getRunnableCodeSnippet([],[],e)}onRunFinished(e){e.error==""?this.onSuccessfulRun.forEach(t=>t()):this.onFailedRun.forEach(t=>t())}registerOnTerminalOpen(e){this.onTerminalOpen.push(e)}registerOnTerminalClose(e){this.onTerminalClose.push(e)}registerOnCodeChange(e){this.onCodeChange.push(e)}clearTerminal(){this.editor.terminal.clear()}writeToTerminal(e){this.editor.terminal.write(e)}openTerminal(){this.editor.openTerminal()}closeTerminal(){this.editor.closeTerminal()}setEditorFontSize(e){this.editor.setEditorFontSize(e)}};var H=document.currentScript,J,G=(J=H==null?void 0:H.getAttribute("data-selector"))!=null?J:null,me=T.getConfigurationFromElement(H);G&&window.addEventListener("DOMContentLoaded",()=>{document.querySelectorAll(G).forEach(p=>{T.create(p,me)})});window.Playground=T;})();
//# sourceMappingURL=playground.js.map
