/*! Three.js 0.186.1
The MIT License

Copyright © 2010-2026 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

Land outlines: Natural Earth v5.1.2, public domain. */
(()=>{function Yc(i=globalThis.fetch?.bind(globalThis)){let e=new Map;async function t(r,a={},o=null){let l=new URLSearchParams;for(let[f,u]of Object.entries(a))u!=null&&l.set(f,u);let c=l.size?`${r}?${l}`:r,h=new AbortController;o&&(e.get(o)?.abort(),e.set(o,h));try{let f=await i(c,{signal:h.signal}),u=await f.text(),p=null;try{p=JSON.parse(u)}catch{}if(!f.ok){let _=u.trim(),b=_.length<200&&!_.startsWith("<")?_:"";throw new vr(p?.error?.message||b||`Request failed (${f.status}).`,f.status)}if(p===null)throw new vr("The server returned an unreadable response.",f.status);return p}finally{o&&e.get(o)===h&&e.delete(o)}}let n=r=>new Date(r).toISOString().replace(/\.\d+Z$/,"Z"),s=r=>r?{lat:r.lat,lon:r.lon,alt:r.alt}:{};return{groups:()=>t("/api/satellite-groups"),satellites:r=>t("/api/satellites",{group:r},"satellites"),search:r=>t("/api/v1/search",{q:r},"satellites"),track:(r,a,o)=>t("/api/v1/track",{norad_id:r,start:n(a),duration:"25h",step:"60s",...s(o)},`track:${r}`),report:r=>t("/api/v1/report",{norad_id:r},"report"),passes:(r,a,o)=>t("/api/v1/passes",{norad_id:r,start:n(o),duration:"48h",step:"30s",...s(a)},"passes"),tonight:(r,a,o)=>t("/api/v1/tonight",{norad_id:r,time:typeof o=="number"?n(o):o,...s(a)},"tonight"),sources:()=>t("/api/v1/sources",{},"sources"),spaceWeather:()=>t("/api/v1/space-weather",{},"space-weather"),launches:()=>t("/api/v1/launches",{},"launches"),satelliteDetails:r=>t("/api/v1/satellite-details",{norad_id:r},"satellite-details"),transmitters:r=>t("/api/v1/transmitters",{norad_id:r},"transmitters"),spaceWeatherHistory:()=>t("/api/v1/space-weather-history",{},"space-weather-history"),spaceEvents:()=>t("/api/v1/space-events",{},"space-events"),catalogRecord:r=>t("/api/v1/catalog-record",{norad_id:r},"catalog-record"),spaceTrack:r=>t("/api/v1/space-track",{norad_id:r},"space-track"),recentScenes:r=>t("/api/v1/recent-scenes",{norad_id:r},"recent-scenes"),cloudCover:r=>t("/api/v1/cloud-cover",{lat:r.lat,lon:r.lon},"cloud-cover"),look:(r,a,o,l)=>t("/api/v1/look",{norad_id:r,start:o,end:l,samples:64,...s(a)},"look")}}var vr=class extends Error{constructor(e,t){super(e),this.status=t}},Xn=i=>i?.name==="AbortError";/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */var ri={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},ai={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Eh=0,ml=1,Th=2;var Qs=1,Ah=2,hs=3,oi=0,Lt=1,bn=2,Sn=0,us=1,gl=2,_l=3,xl=4,Ch=5;var Mi=100,Rh=101,Ph=102,Ih=103,Lh=104,Dh=200,Nh=201,Uh=202,Fh=203,yl=204,vl=205,Oh=206,Bh=207,kh=208,zh=209,Vh=210,Gh=211,Hh=212,Wh=213,Xh=214,Yr=0,$r=1,Zr=2,Zi=3,Jr=4,Kr=5,jr=6,Qr=7,Aa=0,qh=1,Yh=2,un=0,bl=1,Sl=2,Ml=3,wl=4,El=5,Tl=6,Al=7;var Cl=300,li=301,wi=302,Ca=303,Ra=304,er=306,ea=1e3,xn=1001,ta=1002,Tt=1003,$h=1004;var tr=1005;var Pt=1006,Pa=1007;var ci=1008;var Yt=1009,Rl=1010,Pl=1011,ds=1012,Ia=1013,dn=1014,fn=1015,pn=1016,La=1017,Da=1018,fs=1020,Il=35902,Ll=35899,Dl=1021,Nl=1022,sn=1023,yn=1026,hi=1027,Ul=1028,Na=1029,ui=1030,Ua=1031;var Fa=1033,nr=33776,ir=33777,sr=33778,rr=33779,Oa=35840,Ba=35841,ka=35842,za=35843,Va=36196,Ga=37492,Ha=37496,Wa=37488,Xa=37489,ar=37490,qa=37491,Ya=37808,$a=37809,Za=37810,Ja=37811,Ka=37812,ja=37813,Qa=37814,eo=37815,to=37816,no=37817,io=37818,so=37819,ro=37820,ao=37821,oo=36492,lo=36494,co=36495,ho=36283,uo=36284,or=36285,fo=36286;var Ds=2300,na=2301,Wr=2302,al=2303,ol=2400,ll=2401,cl=2402;var Zh=3200;var po=0,Jh=1,kn="",Gt="srgb",Ns="srgb-linear",Us="linear",Qe="srgb";var Xr=7680;var Kh=519,jh=512,Qh=513,eu=514,mo=515,tu=516,nu=517,go=518,iu=519,su=35044;var Fl="300 es",cn=2e3,Ji=2001;function Dd(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Nd(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Ki(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function ru(){let i=Ki("canvas");return i.style.display="block",i}var $c={},ji=null;function Ol(...i){let e="THREE."+i.shift();ji?ji("log",e,...i):console.log(e,...i)}function au(i){let e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Ie(...i){i=au(i);let e="THREE."+i.shift();if(ji)ji("warn",e,...i);else{let t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function Ne(...i){i=au(i);let e="THREE."+i.shift();if(ji)ji("error",e,...i);else{let t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function bi(...i){let e=i.join(" ");e in $c||($c[e]=!0,Ie(...i))}function ou(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var lu={[Yr]:$r,[Zr]:jr,[Jr]:Qr,[Zi]:Kr,[$r]:Yr,[jr]:Zr,[Qr]:Jr,[Kr]:Zi},hn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}},Ft=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Zc=1234567,Is=Math.PI/180,Qi=180/Math.PI;function ps(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ft[i&255]+Ft[i>>8&255]+Ft[i>>16&255]+Ft[i>>24&255]+"-"+Ft[e&255]+Ft[e>>8&255]+"-"+Ft[e>>16&15|64]+Ft[e>>24&255]+"-"+Ft[t&63|128]+Ft[t>>8&255]+"-"+Ft[t>>16&255]+Ft[t>>24&255]+Ft[n&255]+Ft[n>>8&255]+Ft[n>>16&255]+Ft[n>>24&255]).toLowerCase()}function We(i,e,t){return Math.max(e,Math.min(t,i))}function Bl(i,e){return(i%e+e)%e}function Ud(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function Fd(i,e,t){return i!==e?(t-i)/(e-i):0}function Ls(i,e,t){return(1-t)*i+t*e}function Od(i,e,t,n){return Ls(i,e,1-Math.exp(-t*n))}function Bd(i,e=1){return e-Math.abs(Bl(i,e*2)-e)}function kd(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function zd(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function Vd(i,e){return i+Math.floor(Math.random()*(e-i+1))}function Gd(i,e){return i+Math.random()*(e-i)}function Hd(i){return i*(.5-Math.random())}function Wd(i){i!==void 0&&(Zc=i);let e=Zc+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Xd(i){return i*Is}function qd(i){return i*Qi}function Yd(i){return i>0&&Number.isInteger(i)&&2**Math.round(Math.log2(i))===i}function $d(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Zd(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Jd(i,e,t,n,s){let r=Math.cos,a=Math.sin,o=r(t/2),l=a(t/2),c=r((e+n)/2),h=a((e+n)/2),f=r((e-n)/2),u=a((e-n)/2),p=r((n-e)/2),_=a((n-e)/2);switch(s){case"XYX":i.set(o*h,l*f,l*u,o*c);break;case"YZY":i.set(l*u,o*h,l*f,o*c);break;case"ZXZ":i.set(l*f,l*u,o*h,o*c);break;case"XZX":i.set(o*h,l*_,l*p,o*c);break;case"YXY":i.set(l*p,o*h,l*_,o*c);break;case"ZYZ":i.set(l*_,l*p,o*h,o*c);break;default:Ie("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Yi(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Vt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var kl={DEG2RAD:Is,RAD2DEG:Qi,generateUUID:ps,clamp:We,euclideanModulo:Bl,mapLinear:Ud,inverseLerp:Fd,lerp:Ls,damp:Od,pingpong:Bd,smoothstep:kd,smootherstep:zd,randInt:Vd,randFloat:Gd,randFloatSpread:Hd,seededRandom:Wd,degToRad:Xd,radToDeg:qd,isPowerOfTwo:Yd,ceilPowerOfTwo:$d,floorPowerOfTwo:Zd,setQuaternionFromProperEuler:Jd,normalize:Vt,denormalize:Yi},Wl=class Wl{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=We(this.x,e.x,t.x),this.y=We(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=We(this.x,e,t),this.y=We(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(We(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(We(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Wl.prototype.isVector2=!0;var Ue=Wl,jt=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let l=n[s+0],c=n[s+1],h=n[s+2],f=n[s+3],u=r[a+0],p=r[a+1],_=r[a+2],b=r[a+3];if(f!==b||l!==u||c!==p||h!==_){let g=l*u+c*p+h*_+f*b;g<0&&(u=-u,p=-p,_=-_,b=-b,g=-g);let d=1-o;if(g<.9995){let T=Math.acos(g),I=Math.sin(T);d=Math.sin(d*T)/I,o=Math.sin(o*T)/I,l=l*d+u*o,c=c*d+p*o,h=h*d+_*o,f=f*d+b*o}else{l=l*d+u*o,c=c*d+p*o,h=h*d+_*o,f=f*d+b*o;let T=1/Math.sqrt(l*l+c*c+h*h+f*f);l*=T,c*=T,h*=T,f*=T}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=f}static multiplyQuaternionsFlat(e,t,n,s,r,a){let o=n[s],l=n[s+1],c=n[s+2],h=n[s+3],f=r[a],u=r[a+1],p=r[a+2],_=r[a+3];return e[t]=o*_+h*f+l*p-c*u,e[t+1]=l*_+h*u+c*f-o*p,e[t+2]=c*_+h*p+o*u-l*f,e[t+3]=h*_-o*f-l*u-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(s/2),f=o(r/2),u=l(n/2),p=l(s/2),_=l(r/2);switch(a){case"XYZ":this._x=u*h*f+c*p*_,this._y=c*p*f-u*h*_,this._z=c*h*_+u*p*f,this._w=c*h*f-u*p*_;break;case"YXZ":this._x=u*h*f+c*p*_,this._y=c*p*f-u*h*_,this._z=c*h*_-u*p*f,this._w=c*h*f+u*p*_;break;case"ZXY":this._x=u*h*f-c*p*_,this._y=c*p*f+u*h*_,this._z=c*h*_+u*p*f,this._w=c*h*f-u*p*_;break;case"ZYX":this._x=u*h*f-c*p*_,this._y=c*p*f+u*h*_,this._z=c*h*_-u*p*f,this._w=c*h*f+u*p*_;break;case"YZX":this._x=u*h*f+c*p*_,this._y=c*p*f+u*h*_,this._z=c*h*_-u*p*f,this._w=c*h*f-u*p*_;break;case"XZY":this._x=u*h*f-c*p*_,this._y=c*p*f-u*h*_,this._z=c*h*_+u*p*f,this._w=c*h*f+u*p*_;break;default:Ie("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],h=t[6],f=t[10],u=n+o+f;if(u>0){let p=.5/Math.sqrt(u+1);this._w=.25/p,this._x=(h-l)*p,this._y=(r-c)*p,this._z=(a-s)*p}else if(n>o&&n>f){let p=2*Math.sqrt(1+n-o-f);this._w=(h-l)/p,this._x=.25*p,this._y=(s+a)/p,this._z=(r+c)/p}else if(o>f){let p=2*Math.sqrt(1+o-n-f);this._w=(r-c)/p,this._x=(s+a)/p,this._y=.25*p,this._z=(l+h)/p}else{let p=2*Math.sqrt(1+f-n-o);this._w=(a-s)/p,this._x=(r+c)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(We(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+a*o+s*c-r*l,this._y=s*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-s*o,this._w=a*h-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let l=1-t;if(o<.9995){let c=Math.acos(o),h=Math.sin(c);l=Math.sin(l*c)/h,t=Math.sin(t*c)/h,this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},Xl=class Xl{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Jc.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Jc.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*n),h=2*(o*t-r*s),f=2*(r*n-a*t);return this.x=t+l*c+a*f-o*h,this.y=n+l*h+o*c-r*f,this.z=s+l*f+r*h-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=We(this.x,e.x,t.x),this.y=We(this.y,e.y,t.y),this.z=We(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=We(this.x,e,t),this.y=We(this.y,e,t),this.z=We(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(We(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Bo.copy(this).projectOnVector(e),this.sub(Bo)}reflect(e){return this.sub(Bo.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(We(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Xl.prototype.isVector3=!0;var U=Xl,Bo=new U,Jc=new jt,ql=class ql{constructor(e,t,n,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c)}set(e,t,n,s,r,a,o,l,c){let h=this.elements;return h[0]=e,h[1]=s,h[2]=o,h[3]=t,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],f=n[7],u=n[2],p=n[5],_=n[8],b=s[0],g=s[3],d=s[6],T=s[1],I=s[4],v=s[7],M=s[2],w=s[5],C=s[8];return r[0]=a*b+o*T+l*M,r[3]=a*g+o*I+l*w,r[6]=a*d+o*v+l*C,r[1]=c*b+h*T+f*M,r[4]=c*g+h*I+f*w,r[7]=c*d+h*v+f*C,r[2]=u*b+p*T+_*M,r[5]=u*g+p*I+_*w,r[8]=u*d+p*v+_*C,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8];return t*a*h-t*o*c-n*r*h+n*o*l+s*r*c-s*a*l}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],f=h*a-o*c,u=o*l-h*r,p=c*r-a*l,_=t*f+n*u+s*p;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);let b=1/_;return e[0]=f*b,e[1]=(s*c-h*n)*b,e[2]=(o*n-s*a)*b,e[3]=u*b,e[4]=(h*t-s*l)*b,e[5]=(s*r-o*t)*b,e[6]=p*b,e[7]=(n*l-c*t)*b,e[8]=(a*t-n*r)*b,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return bi("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(ko.makeScale(e,t)),this}rotate(e){return bi("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(ko.makeRotation(-e)),this}translate(e,t){return bi("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(ko.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};ql.prototype.isMatrix3=!0;var Oe=ql,ko=new Oe,Kc=new Oe().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),jc=new Oe().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Kd(){let i={enabled:!0,workingColorSpace:Ns,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===Qe&&(s.r=Nn(s.r),s.g=Nn(s.g),s.b=Nn(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===Qe&&(s.r=$i(s.r),s.g=$i(s.g),s.b=$i(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===kn?Us:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return bi("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return bi("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Ns]:{primaries:e,whitePoint:n,transfer:Us,toXYZ:Kc,fromXYZ:jc,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Gt},outputColorSpaceConfig:{drawingBufferColorSpace:Gt}},[Gt]:{primaries:e,whitePoint:n,transfer:Qe,toXYZ:Kc,fromXYZ:jc,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Gt}}}),i}var $e=Kd();function Nn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function $i(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Di,ia=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Di===void 0&&(Di=Ki("canvas")),Di.width=e.width,Di.height=e.height;let s=Di.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=Di}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Ki("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Nn(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Nn(t[n]/255)*255):t[n]=Nn(t[n]);return{data:t,width:e.width,height:e.height}}else return Ie("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},jd=0,es=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:jd++}),this.uuid=ps(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(zo(s[a].image)):r.push(zo(s[a]))}else r=zo(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function zo(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?ia.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Ie("Texture: Unable to serialize Texture."),{})}var Qd=0,Vo=new U,Wt=class i extends hn{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=xn,s=xn,r=Pt,a=ci,o=sn,l=Yt,c=i.DEFAULT_ANISOTROPY,h=kn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Qd++}),this.uuid=ps(),this.name="",this.source=new es(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Ue(0,0),this.repeat=new Ue(1,1),this.center=new Ue(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Oe,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Vo).x}get height(){return this.source.getSize(Vo).y}get depth(){return this.source.getSize(Vo).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){Ie(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Ie(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Cl)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ea:e.x=e.x-Math.floor(e.x);break;case xn:e.x=e.x<0?0:1;break;case ta:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case ea:e.y=e.y-Math.floor(e.y);break;case xn:e.y=e.y<0?0:1;break;case ta:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Wt.DEFAULT_IMAGE=null;Wt.DEFAULT_MAPPING=Cl;Wt.DEFAULT_ANISOTROPY=1;var Yl=class Yl{constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,l=e.elements,c=l[0],h=l[4],f=l[8],u=l[1],p=l[5],_=l[9],b=l[2],g=l[6],d=l[10];if(Math.abs(h-u)<.01&&Math.abs(f-b)<.01&&Math.abs(_-g)<.01){if(Math.abs(h+u)<.1&&Math.abs(f+b)<.1&&Math.abs(_+g)<.1&&Math.abs(c+p+d-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let I=(c+1)/2,v=(p+1)/2,M=(d+1)/2,w=(h+u)/4,C=(f+b)/4,y=(_+g)/4;return I>v&&I>M?I<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(I),s=w/n,r=C/n):v>M?v<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(v),n=w/s,r=y/s):M<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(M),n=C/r,s=y/r),this.set(n,s,r,t),this}let T=Math.sqrt((g-_)*(g-_)+(f-b)*(f-b)+(u-h)*(u-h));return Math.abs(T)<.001&&(T=1),this.x=(g-_)/T,this.y=(f-b)/T,this.z=(u-h)/T,this.w=Math.acos((c+p+d-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=We(this.x,e.x,t.x),this.y=We(this.y,e.y,t.y),this.z=We(this.z,e.z,t.z),this.w=We(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=We(this.x,e,t),this.y=We(this.y,e,t),this.z=We(this.z,e,t),this.w=We(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(We(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Yl.prototype.isVector4=!0;var dt=Yl,sa=class extends hn{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Pt,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new dt(0,0,e,t),this.scissorTest=!1,this.viewport=new dt(0,0,e,t),this.textures=[];let s={width:e,height:t,depth:n.depth},r=new Wt(s),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Pt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new es(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},qt=class extends sa{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Fs=class extends Wt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Tt,this.minFilter=Tt,this.wrapR=xn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var ra=class extends Wt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Tt,this.minFilter=Tt,this.wrapR=xn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var Ta=class Ta{constructor(e,t,n,s,r,a,o,l,c,h,f,u,p,_,b,g){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c,h,f,u,p,_,b,g)}set(e,t,n,s,r,a,o,l,c,h,f,u,p,_,b,g){let d=this.elements;return d[0]=e,d[4]=t,d[8]=n,d[12]=s,d[1]=r,d[5]=a,d[9]=o,d[13]=l,d[2]=c,d[6]=h,d[10]=f,d[14]=u,d[3]=p,d[7]=_,d[11]=b,d[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ta().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,s=1/Ni.setFromMatrixColumn(e,0).length(),r=1/Ni.setFromMatrixColumn(e,1).length(),a=1/Ni.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),f=Math.sin(r);if(e.order==="XYZ"){let u=a*h,p=a*f,_=o*h,b=o*f;t[0]=l*h,t[4]=-l*f,t[8]=c,t[1]=p+_*c,t[5]=u-b*c,t[9]=-o*l,t[2]=b-u*c,t[6]=_+p*c,t[10]=a*l}else if(e.order==="YXZ"){let u=l*h,p=l*f,_=c*h,b=c*f;t[0]=u+b*o,t[4]=_*o-p,t[8]=a*c,t[1]=a*f,t[5]=a*h,t[9]=-o,t[2]=p*o-_,t[6]=b+u*o,t[10]=a*l}else if(e.order==="ZXY"){let u=l*h,p=l*f,_=c*h,b=c*f;t[0]=u-b*o,t[4]=-a*f,t[8]=_+p*o,t[1]=p+_*o,t[5]=a*h,t[9]=b-u*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){let u=a*h,p=a*f,_=o*h,b=o*f;t[0]=l*h,t[4]=_*c-p,t[8]=u*c+b,t[1]=l*f,t[5]=b*c+u,t[9]=p*c-_,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){let u=a*l,p=a*c,_=o*l,b=o*c;t[0]=l*h,t[4]=b-u*f,t[8]=_*f+p,t[1]=f,t[5]=a*h,t[9]=-o*h,t[2]=-c*h,t[6]=p*f+_,t[10]=u-b*f}else if(e.order==="XZY"){let u=a*l,p=a*c,_=o*l,b=o*c;t[0]=l*h,t[4]=-f,t[8]=c*h,t[1]=u*f+b,t[5]=a*h,t[9]=p*f-_,t[2]=_*f-p,t[6]=o*h,t[10]=b*f+u}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(e1,e,t1)}lookAt(e,t,n){let s=this.elements;return Zt.subVectors(e,t),Zt.lengthSq()===0&&(Zt.z=1),Zt.normalize(),qn.crossVectors(n,Zt),qn.lengthSq()===0&&(Math.abs(n.z)===1?Zt.x+=1e-4:Zt.z+=1e-4,Zt.normalize(),qn.crossVectors(n,Zt)),qn.normalize(),br.crossVectors(Zt,qn),s[0]=qn.x,s[4]=br.x,s[8]=Zt.x,s[1]=qn.y,s[5]=br.y,s[9]=Zt.y,s[2]=qn.z,s[6]=br.z,s[10]=Zt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],f=n[5],u=n[9],p=n[13],_=n[2],b=n[6],g=n[10],d=n[14],T=n[3],I=n[7],v=n[11],M=n[15],w=s[0],C=s[4],y=s[8],E=s[12],D=s[1],O=s[5],V=s[9],X=s[13],N=s[2],H=s[6],K=s[10],Z=s[14],re=s[3],Y=s[7],te=s[11],F=s[15];return r[0]=a*w+o*D+l*N+c*re,r[4]=a*C+o*O+l*H+c*Y,r[8]=a*y+o*V+l*K+c*te,r[12]=a*E+o*X+l*Z+c*F,r[1]=h*w+f*D+u*N+p*re,r[5]=h*C+f*O+u*H+p*Y,r[9]=h*y+f*V+u*K+p*te,r[13]=h*E+f*X+u*Z+p*F,r[2]=_*w+b*D+g*N+d*re,r[6]=_*C+b*O+g*H+d*Y,r[10]=_*y+b*V+g*K+d*te,r[14]=_*E+b*X+g*Z+d*F,r[3]=T*w+I*D+v*N+M*re,r[7]=T*C+I*O+v*H+M*Y,r[11]=T*y+I*V+v*K+M*te,r[15]=T*E+I*X+v*Z+M*F,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],h=e[2],f=e[6],u=e[10],p=e[14],_=e[3],b=e[7],g=e[11],d=e[15],T=l*p-c*u,I=o*p-c*f,v=o*u-l*f,M=a*p-c*h,w=a*u-l*h,C=a*f-o*h;return t*(b*T-g*I+d*v)-n*(_*T-g*M+d*w)+s*(_*I-b*M+d*C)-r*(_*v-b*w+g*C)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],a=e[5],o=e[9],l=e[2],c=e[6],h=e[10];return t*(a*h-o*c)-n*(r*h-o*l)+s*(r*c-a*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],f=e[9],u=e[10],p=e[11],_=e[12],b=e[13],g=e[14],d=e[15],T=t*o-n*a,I=t*l-s*a,v=t*c-r*a,M=n*l-s*o,w=n*c-r*o,C=s*c-r*l,y=h*b-f*_,E=h*g-u*_,D=h*d-p*_,O=f*g-u*b,V=f*d-p*b,X=u*d-p*g,N=T*X-I*V+v*O+M*D-w*E+C*y;if(N===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let H=1/N;return e[0]=(o*X-l*V+c*O)*H,e[1]=(s*V-n*X-r*O)*H,e[2]=(b*C-g*w+d*M)*H,e[3]=(u*w-f*C-p*M)*H,e[4]=(l*D-a*X-c*E)*H,e[5]=(t*X-s*D+r*E)*H,e[6]=(g*v-_*C-d*I)*H,e[7]=(h*C-u*v+p*I)*H,e[8]=(a*V-o*D+c*y)*H,e[9]=(n*D-t*V-r*y)*H,e[10]=(_*w-b*v+d*T)*H,e[11]=(f*v-h*w-p*T)*H,e[12]=(o*E-a*O-l*y)*H,e[13]=(t*O-n*E+s*y)*H,e[14]=(b*I-_*M-g*T)*H,e[15]=(h*M-f*I+u*T)*H,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+n,h*l-s*a,0,c*l-s*o,h*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,h=a+a,f=o+o,u=r*c,p=r*h,_=r*f,b=a*h,g=a*f,d=o*f,T=l*c,I=l*h,v=l*f,M=n.x,w=n.y,C=n.z;return s[0]=(1-(b+d))*M,s[1]=(p+v)*M,s[2]=(_-I)*M,s[3]=0,s[4]=(p-v)*w,s[5]=(1-(u+d))*w,s[6]=(g+T)*w,s[7]=0,s[8]=(_+I)*C,s[9]=(g-T)*C,s[10]=(1-(u+b))*C,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let a=Ni.set(s[0],s[1],s[2]).length(),o=Ni.set(s[4],s[5],s[6]).length(),l=Ni.set(s[8],s[9],s[10]).length();r<0&&(a=-a),an.copy(this);let c=1/a,h=1/o,f=1/l;return an.elements[0]*=c,an.elements[1]*=c,an.elements[2]*=c,an.elements[4]*=h,an.elements[5]*=h,an.elements[6]*=h,an.elements[8]*=f,an.elements[9]*=f,an.elements[10]*=f,t.setFromRotationMatrix(an),n.x=a,n.y=o,n.z=l,this}makePerspective(e,t,n,s,r,a,o=cn,l=!1){let c=this.elements,h=2*r/(t-e),f=2*r/(n-s),u=(t+e)/(t-e),p=(n+s)/(n-s),_,b;if(l)_=r/(a-r),b=a*r/(a-r);else if(o===cn)_=-(a+r)/(a-r),b=-2*a*r/(a-r);else if(o===Ji)_=-a/(a-r),b=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=f,c[9]=p,c[13]=0,c[2]=0,c[6]=0,c[10]=_,c[14]=b,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=cn,l=!1){let c=this.elements,h=2/(t-e),f=2/(n-s),u=-(t+e)/(t-e),p=-(n+s)/(n-s),_,b;if(l)_=1/(a-r),b=a/(a-r);else if(o===cn)_=-2/(a-r),b=-(a+r)/(a-r);else if(o===Ji)_=-1/(a-r),b=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=f,c[9]=0,c[13]=p,c[2]=0,c[6]=0,c[10]=_,c[14]=b,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}};Ta.prototype.isMatrix4=!0;var lt=Ta,Ni=new U,an=new lt,e1=new U(0,0,0),t1=new U(1,1,1),qn=new U,br=new U,Zt=new U,Qc=new lt,eh=new jt,Un=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],h=s[9],f=s[2],u=s[6],p=s[10];switch(t){case"XYZ":this._y=Math.asin(We(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-We(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-f,r),this._z=0);break;case"ZXY":this._x=Math.asin(We(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-f,p),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-We(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(u,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(We(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-f,r)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-We(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:Ie("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Qc.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Qc,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return eh.setFromEuler(this),this.setFromQuaternion(eh,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Un.DEFAULT_ORDER="XYZ";var ts=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},n1=0,th=new U,Ui=new jt,Cn=new lt,Sr=new U,Ts=new U,i1=new U,s1=new jt,nh=new U(1,0,0),ih=new U(0,1,0),sh=new U(0,0,1),rh={type:"added"},r1={type:"removed"},Fi={type:"childadded",child:null},Go={type:"childremoved",child:null},It=class i extends hn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:n1++}),this.uuid=ps(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new U,t=new Un,n=new jt,s=new U(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new lt},normalMatrix:{value:new Oe}}),this.matrix=new lt,this.matrixWorld=new lt,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ts,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Ui.setFromAxisAngle(e,t),this.quaternion.multiply(Ui),this}rotateOnWorldAxis(e,t){return Ui.setFromAxisAngle(e,t),this.quaternion.premultiply(Ui),this}rotateX(e){return this.rotateOnAxis(nh,e)}rotateY(e){return this.rotateOnAxis(ih,e)}rotateZ(e){return this.rotateOnAxis(sh,e)}translateOnAxis(e,t){return th.copy(e).applyQuaternion(this.quaternion),this.position.add(th.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(nh,e)}translateY(e){return this.translateOnAxis(ih,e)}translateZ(e){return this.translateOnAxis(sh,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Cn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Sr.copy(e):Sr.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Ts.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Cn.lookAt(Ts,Sr,this.up):Cn.lookAt(Sr,Ts,this.up),this.quaternion.setFromRotationMatrix(Cn),s&&(Cn.extractRotation(s.matrixWorld),Ui.setFromRotationMatrix(Cn),this.quaternion.premultiply(Ui.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Ne("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(rh),Fi.child=e,this.dispatchEvent(Fi),Fi.child=null):Ne("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(r1),Go.child=e,this.dispatchEvent(Go),Go.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Cn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Cn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Cn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(rh),Fi.child=e,this.dispatchEvent(Fi),Fi.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ts,e,i1),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ts,s1,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let f=l[c];r(e.shapes,f)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){let o=a(e.geometries),l=a(e.materials),c=a(e.textures),h=a(e.images),f=a(e.shapes),u=a(e.skeletons),p=a(e.animations),_=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),f.length>0&&(n.shapes=f),u.length>0&&(n.skeletons=u),p.length>0&&(n.animations=p),_.length>0&&(n.nodes=_)}return n.object=s,n;function a(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};It.DEFAULT_UP=new U(0,1,0);It.DEFAULT_MATRIX_AUTO_UPDATE=!0;It.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Dn=class extends It{constructor(){super(),this.isGroup=!0,this.type="Group"}},a1={type:"move"},ns=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Dn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Dn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new U,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new U),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Dn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new U,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new U,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(let b of e.hand.values()){let g=t.getJointPose(b,n),d=this._getHandJoint(c,b);g!==null&&(d.matrix.fromArray(g.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=g.radius),d.visible=g!==null}let h=c.joints["index-finger-tip"],f=c.joints["thumb-tip"],u=h.position.distanceTo(f.position),p=.02,_=.005;c.inputState.pinching&&u>p+_?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&u<=p-_&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(a1)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Dn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},cu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Yn={h:0,s:0,l:0},Mr={h:0,s:0,l:0};function Ho(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var He=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Gt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,$e.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=$e.workingColorSpace){return this.r=e,this.g=t,this.b=n,$e.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=$e.workingColorSpace){if(e=Bl(e,1),t=We(t,0,1),n=We(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=Ho(a,r,e+1/3),this.g=Ho(a,r,e),this.b=Ho(a,r,e-1/3)}return $e.colorSpaceToWorking(this,s),this}setStyle(e,t=Gt){function n(r){r!==void 0&&parseFloat(r)<1&&Ie("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Ie("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);Ie("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Gt){let n=cu[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Ie("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Nn(e.r),this.g=Nn(e.g),this.b=Nn(e.b),this}copyLinearToSRGB(e){return this.r=$i(e.r),this.g=$i(e.g),this.b=$i(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Gt){return $e.workingToColorSpace(Ot.copy(this),e),Math.round(We(Ot.r*255,0,255))*65536+Math.round(We(Ot.g*255,0,255))*256+Math.round(We(Ot.b*255,0,255))}getHexString(e=Gt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=$e.workingColorSpace){$e.workingToColorSpace(Ot.copy(this),t);let n=Ot.r,s=Ot.g,r=Ot.b,a=Math.max(n,s,r),o=Math.min(n,s,r),l,c,h=(o+a)/2;if(o===a)l=0,c=0;else{let f=a-o;switch(c=h<=.5?f/(a+o):f/(2-a-o),a){case n:l=(s-r)/f+(s<r?6:0);break;case s:l=(r-n)/f+2;break;case r:l=(n-s)/f+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=$e.workingColorSpace){return $e.workingToColorSpace(Ot.copy(this),t),e.r=Ot.r,e.g=Ot.g,e.b=Ot.b,e}getStyle(e=Gt){$e.workingToColorSpace(Ot.copy(this),e);let t=Ot.r,n=Ot.g,s=Ot.b;return e!==Gt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Yn),this.setHSL(Yn.h+e,Yn.s+t,Yn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Yn),e.getHSL(Mr);let n=Ls(Yn.h,Mr.h,t),s=Ls(Yn.s,Mr.s,t),r=Ls(Yn.l,Mr.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Ot=new He;He.NAMES=cu;var Os=class extends It{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Un,this.environmentIntensity=1,this.environmentRotation=new Un,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},on=new U,Rn=new U,Wo=new U,Pn=new U,Oi=new U,Bi=new U,ah=new U,Xo=new U,qo=new U,Yo=new U,$o=new dt,Zo=new dt,Jo=new dt,Kn=class i{constructor(e=new U,t=new U,n=new U){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),on.subVectors(e,t),s.cross(on);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){on.subVectors(s,t),Rn.subVectors(n,t),Wo.subVectors(e,t);let a=on.dot(on),o=on.dot(Rn),l=on.dot(Wo),c=Rn.dot(Rn),h=Rn.dot(Wo),f=a*c-o*o;if(f===0)return r.set(0,0,0),null;let u=1/f,p=(c*l-o*h)*u,_=(a*h-o*l)*u;return r.set(1-p-_,_,p)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Pn)===null?!1:Pn.x>=0&&Pn.y>=0&&Pn.x+Pn.y<=1}static getInterpolation(e,t,n,s,r,a,o,l){return this.getBarycoord(e,t,n,s,Pn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Pn.x),l.addScaledVector(a,Pn.y),l.addScaledVector(o,Pn.z),l)}static getInterpolatedAttribute(e,t,n,s,r,a){return $o.setScalar(0),Zo.setScalar(0),Jo.setScalar(0),$o.fromBufferAttribute(e,t),Zo.fromBufferAttribute(e,n),Jo.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector($o,r.x),a.addScaledVector(Zo,r.y),a.addScaledVector(Jo,r.z),a}static isFrontFacing(e,t,n,s){return on.subVectors(n,t),Rn.subVectors(e,t),on.cross(Rn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return on.subVectors(this.c,this.b),Rn.subVectors(this.a,this.b),on.cross(Rn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,a,o;Oi.subVectors(s,n),Bi.subVectors(r,n),Xo.subVectors(e,n);let l=Oi.dot(Xo),c=Bi.dot(Xo);if(l<=0&&c<=0)return t.copy(n);qo.subVectors(e,s);let h=Oi.dot(qo),f=Bi.dot(qo);if(h>=0&&f<=h)return t.copy(s);let u=l*f-h*c;if(u<=0&&l>=0&&h<=0)return a=l/(l-h),t.copy(n).addScaledVector(Oi,a);Yo.subVectors(e,r);let p=Oi.dot(Yo),_=Bi.dot(Yo);if(_>=0&&p<=_)return t.copy(r);let b=p*c-l*_;if(b<=0&&c>=0&&_<=0)return o=c/(c-_),t.copy(n).addScaledVector(Bi,o);let g=h*_-p*f;if(g<=0&&f-h>=0&&p-_>=0)return ah.subVectors(r,s),o=(f-h)/(f-h+(p-_)),t.copy(s).addScaledVector(ah,o);let d=1/(g+b+u);return a=b*d,o=u*d,t.copy(n).addScaledVector(Oi,a).addScaledVector(Bi,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},jn=class{constructor(e=new U(1/0,1/0,1/0),t=new U(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(ln.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(ln.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=ln.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,ln):ln.fromBufferAttribute(r,a),ln.applyMatrix4(e.matrixWorld),this.expandByPoint(ln);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),wr.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),wr.copy(n.boundingBox)),wr.applyMatrix4(e.matrixWorld),this.union(wr)}let s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,ln),ln.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(As),Er.subVectors(this.max,As),ki.subVectors(e.a,As),zi.subVectors(e.b,As),Vi.subVectors(e.c,As),$n.subVectors(zi,ki),Zn.subVectors(Vi,zi),_i.subVectors(ki,Vi);let t=[0,-$n.z,$n.y,0,-Zn.z,Zn.y,0,-_i.z,_i.y,$n.z,0,-$n.x,Zn.z,0,-Zn.x,_i.z,0,-_i.x,-$n.y,$n.x,0,-Zn.y,Zn.x,0,-_i.y,_i.x,0];return!Ko(t,ki,zi,Vi,Er)||(t=[1,0,0,0,1,0,0,0,1],!Ko(t,ki,zi,Vi,Er))?!1:(Tr.crossVectors($n,Zn),t=[Tr.x,Tr.y,Tr.z],Ko(t,ki,zi,Vi,Er))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,ln).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(ln).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(In[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),In[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),In[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),In[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),In[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),In[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),In[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),In[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(In),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},In=[new U,new U,new U,new U,new U,new U,new U,new U],ln=new U,wr=new jn,ki=new U,zi=new U,Vi=new U,$n=new U,Zn=new U,_i=new U,As=new U,Er=new U,Tr=new U,xi=new U;function Ko(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){xi.fromArray(i,r);let o=s.x*Math.abs(xi.x)+s.y*Math.abs(xi.y)+s.z*Math.abs(xi.z),l=e.dot(xi),c=t.dot(xi),h=n.dot(xi);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var _t=new U,Ar=new Ue,o1=0,Ht=class extends hn{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:o1++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=su,this.updateRanges=[],this.gpuType=fn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Ar.fromBufferAttribute(this,t),Ar.applyMatrix3(e),this.setXY(t,Ar.x,Ar.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)_t.fromBufferAttribute(this,t),_t.applyMatrix3(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)_t.fromBufferAttribute(this,t),_t.applyMatrix4(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)_t.fromBufferAttribute(this,t),_t.applyNormalMatrix(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)_t.fromBufferAttribute(this,t),_t.transformDirection(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Yi(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Vt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Yi(t,this.array)),t}setX(e,t){return this.normalized&&(t=Vt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Yi(t,this.array)),t}setY(e,t){return this.normalized&&(t=Vt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Yi(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Vt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Yi(t,this.array)),t}setW(e,t){return this.normalized&&(t=Vt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Vt(t,this.array),n=Vt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=Vt(t,this.array),n=Vt(n,this.array),s=Vt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=Vt(t,this.array),n=Vt(n,this.array),s=Vt(s,this.array),r=Vt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}};var Bs=class extends Ht{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var ks=class extends Ht{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var xt=class extends Ht{constructor(e,t,n){super(new Float32Array(e),t,n)}},l1=new jn,Cs=new U,jo=new U,Qn=class{constructor(e=new U,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):l1.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Cs.subVectors(e,this.center);let t=Cs.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(Cs,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(jo.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Cs.copy(e.center).add(jo)),this.expandByPoint(Cs.copy(e.center).sub(jo))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},c1=0,nn=new lt,Qo=new It,Gi=new U,Jt=new jn,Rs=new jn,Et=new U,At=class i extends hn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:c1++}),this.uuid=ps(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Dd(e)?ks:Bs)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Oe().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return nn.makeRotationFromQuaternion(e),this.applyMatrix4(nn),this}rotateX(e){return nn.makeRotationX(e),this.applyMatrix4(nn),this}rotateY(e){return nn.makeRotationY(e),this.applyMatrix4(nn),this}rotateZ(e){return nn.makeRotationZ(e),this.applyMatrix4(nn),this}translate(e,t,n){return nn.makeTranslation(e,t,n),this.applyMatrix4(nn),this}scale(e,t,n){return nn.makeScale(e,t,n),this.applyMatrix4(nn),this}lookAt(e){return Qo.lookAt(e),Qo.updateMatrix(),this.applyMatrix4(Qo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Gi).negate(),this.translate(Gi.x,Gi.y,Gi.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new xt(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Ie("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new jn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ne("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new U(-1/0,-1/0,-1/0),new U(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];Jt.setFromBufferAttribute(r),this.morphTargetsRelative?(Et.addVectors(this.boundingBox.min,Jt.min),this.boundingBox.expandByPoint(Et),Et.addVectors(this.boundingBox.max,Jt.max),this.boundingBox.expandByPoint(Et)):(this.boundingBox.expandByPoint(Jt.min),this.boundingBox.expandByPoint(Jt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ne('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Qn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ne("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new U,1/0);return}if(e){let n=this.boundingSphere.center;if(Jt.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];Rs.setFromBufferAttribute(o),this.morphTargetsRelative?(Et.addVectors(Jt.min,Rs.min),Jt.expandByPoint(Et),Et.addVectors(Jt.max,Rs.max),Jt.expandByPoint(Et)):(Jt.expandByPoint(Rs.min),Jt.expandByPoint(Rs.max))}Jt.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)Et.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Et));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)Et.fromBufferAttribute(o,c),l&&(Gi.fromBufferAttribute(e,c),Et.add(Gi)),s=Math.max(s,n.distanceToSquared(Et))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Ne('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Ne("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new Ht(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],l=[];for(let y=0;y<n.count;y++)o[y]=new U,l[y]=new U;let c=new U,h=new U,f=new U,u=new Ue,p=new Ue,_=new Ue,b=new U,g=new U;function d(y,E,D){c.fromBufferAttribute(n,y),h.fromBufferAttribute(n,E),f.fromBufferAttribute(n,D),u.fromBufferAttribute(r,y),p.fromBufferAttribute(r,E),_.fromBufferAttribute(r,D),h.sub(c),f.sub(c),p.sub(u),_.sub(u);let O=1/(p.x*_.y-_.x*p.y);isFinite(O)&&(b.copy(h).multiplyScalar(_.y).addScaledVector(f,-p.y).multiplyScalar(O),g.copy(f).multiplyScalar(p.x).addScaledVector(h,-_.x).multiplyScalar(O),o[y].add(b),o[E].add(b),o[D].add(b),l[y].add(g),l[E].add(g),l[D].add(g))}let T=this.groups;T.length===0&&(T=[{start:0,count:e.count}]);for(let y=0,E=T.length;y<E;++y){let D=T[y],O=D.start,V=D.count;for(let X=O,N=O+V;X<N;X+=3)d(e.getX(X+0),e.getX(X+1),e.getX(X+2))}let I=new U,v=new U,M=new U,w=new U;function C(y){M.fromBufferAttribute(s,y),w.copy(M);let E=o[y];I.copy(E),I.sub(M.multiplyScalar(M.dot(E))).normalize(),v.crossVectors(w,E);let O=v.dot(l[y])<0?-1:1;a.setXYZW(y,I.x,I.y,I.z,O)}for(let y=0,E=T.length;y<E;++y){let D=T[y],O=D.start,V=D.count;for(let X=O,N=O+V;X<N;X+=3)C(e.getX(X+0)),C(e.getX(X+1)),C(e.getX(X+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new Ht(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let u=0,p=n.count;u<p;u++)n.setXYZ(u,0,0,0);let s=new U,r=new U,a=new U,o=new U,l=new U,c=new U,h=new U,f=new U;if(e)for(let u=0,p=e.count;u<p;u+=3){let _=e.getX(u+0),b=e.getX(u+1),g=e.getX(u+2);s.fromBufferAttribute(t,_),r.fromBufferAttribute(t,b),a.fromBufferAttribute(t,g),h.subVectors(a,r),f.subVectors(s,r),h.cross(f),o.fromBufferAttribute(n,_),l.fromBufferAttribute(n,b),c.fromBufferAttribute(n,g),o.add(h),l.add(h),c.add(h),n.setXYZ(_,o.x,o.y,o.z),n.setXYZ(b,l.x,l.y,l.z),n.setXYZ(g,c.x,c.y,c.z)}else for(let u=0,p=t.count;u<p;u+=3)s.fromBufferAttribute(t,u+0),r.fromBufferAttribute(t,u+1),a.fromBufferAttribute(t,u+2),h.subVectors(a,r),f.subVectors(s,r),h.cross(f),n.setXYZ(u+0,h.x,h.y,h.z),n.setXYZ(u+1,h.x,h.y,h.z),n.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Et.fromBufferAttribute(e,t),Et.normalize(),e.setXYZ(t,Et.x,Et.y,Et.z)}toNonIndexed(){function e(o,l){let c=o.array,h=o.itemSize,f=o.normalized,u=new c.constructor(l.length*h),p=0,_=0;for(let b=0,g=l.length;b<g;b++){o.isInterleavedBufferAttribute?p=l[b]*o.data.stride+o.offset:p=l[b]*h;for(let d=0;d<h;d++)u[_++]=c[p++]}return new Ht(u,h,f)}if(this.index===null)return Ie("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=e(l,n);t.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let h=0,f=c.length;h<f;h++){let u=c[h],p=e(u,n);l.push(p)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let f=0,u=c.length;f<u;f++){let p=c[f];h.push(p.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(t))}let r=e.morphAttributes;for(let c in r){let h=[],f=r[c];for(let u=0,p=f.length;u<p;u++)h.push(f[u].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let c=0,h=a.length;c<h;c++){let f=a[c];this.addGroup(f.start,f.count,f.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var el=new U,h1=new U,u1=new Oe,Kt=class{constructor(e=new U(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=el.subVectors(n,t).cross(h1.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let s=e.delta(el),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||u1.getNormalMatrix(e),s=this.coplanarPoint(el).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},d1=0,vn=class extends hn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:d1++}),this.uuid=ps(),this.name="",this.type="Material",this.blending=us,this.side=oi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=yl,this.blendDst=vl,this.blendEquation=Mi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new He(0,0,0),this.blendAlpha=0,this.depthFunc=Zi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Kh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Xr,this.stencilZFail=Xr,this.stencilZPass=Xr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){Ie(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Ie(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(t){let r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new He().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new Kt().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Ue().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Ue().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var Ln=new U,tl=new U,Cr=new U,Rr=new U,Fn=class{constructor(e=new U,t=new U(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Ln)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Ln.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Ln.copy(this.origin).addScaledVector(this.direction,t),Ln.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){tl.copy(e).add(t).multiplyScalar(.5),Cr.copy(t).sub(e).normalize(),Rr.copy(this.origin).sub(tl);let r=e.distanceTo(t)*.5,a=-this.direction.dot(Cr),o=Rr.dot(this.direction),l=-Rr.dot(Cr),c=Rr.lengthSq(),h=Math.abs(1-a*a),f,u,p,_;if(h>0)if(f=a*l-o,u=a*o-l,_=r*h,f>=0)if(u>=-_)if(u<=_){let b=1/h;f*=b,u*=b,p=f*(f+a*u+2*o)+u*(a*f+u+2*l)+c}else u=r,f=Math.max(0,-(a*u+o)),p=-f*f+u*(u+2*l)+c;else u=-r,f=Math.max(0,-(a*u+o)),p=-f*f+u*(u+2*l)+c;else u<=-_?(f=Math.max(0,-(-a*r+o)),u=f>0?-r:Math.min(Math.max(-r,-l),r),p=-f*f+u*(u+2*l)+c):u<=_?(f=0,u=Math.min(Math.max(-r,-l),r),p=u*(u+2*l)+c):(f=Math.max(0,-(a*r+o)),u=f>0?r:Math.min(Math.max(-r,-l),r),p=-f*f+u*(u+2*l)+c);else u=a>0?-r:r,f=Math.max(0,-(a*u+o)),p=-f*f+u*(u+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,f),s&&s.copy(tl).addScaledVector(Cr,u),p}intersectSphere(e,t){if(e.radius<0)return null;Ln.subVectors(e.center,this.origin);let n=Ln.dot(this.direction),s=Ln.dot(Ln)-n*n,r=e.radius*e.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,l,c=1/this.direction.x,h=1/this.direction.y,f=1/this.direction.z,u=this.origin;return c>=0?(n=(e.min.x-u.x)*c,s=(e.max.x-u.x)*c):(n=(e.max.x-u.x)*c,s=(e.min.x-u.x)*c),h>=0?(r=(e.min.y-u.y)*h,a=(e.max.y-u.y)*h):(r=(e.max.y-u.y)*h,a=(e.min.y-u.y)*h),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),f>=0?(o=(e.min.z-u.z)*f,l=(e.max.z-u.z)*f):(o=(e.max.z-u.z)*f,l=(e.min.z-u.z)*f),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,Ln)!==null}intersectTriangle(e,t,n,s,r){let a=this.origin,o=this.direction,l=o.x,c=o.y,h=o.z,f=e.x-a.x,u=e.y-a.y,p=e.z-a.z,_=t.x-a.x,b=t.y-a.y,g=t.z-a.z,d=n.x-a.x,T=n.y-a.y,I=n.z-a.z,v=Math.abs(l),M=Math.abs(c),w=Math.abs(h),C,y,E,D,O,V,X,N,H,K,Z,re;if(v>=M&&v>=w?(E=l,V=f,H=_,re=d,l>=0?(C=c,y=h,D=u,O=p,X=b,N=g,K=T,Z=I):(C=h,y=c,D=p,O=u,X=g,N=b,K=I,Z=T)):M>=w?(E=c,V=u,H=b,re=T,c>=0?(C=h,y=l,D=p,O=f,X=g,N=_,K=I,Z=d):(C=l,y=h,D=f,O=p,X=_,N=g,K=d,Z=I)):(E=h,V=p,H=g,re=I,h>=0?(C=l,y=c,D=f,O=u,X=_,N=b,K=d,Z=T):(C=c,y=l,D=u,O=f,X=b,N=_,K=T,Z=d)),E===0)return null;let Y=C/E,te=y/E,F=1/E,ne=D-Y*V,ae=O-te*V,Be=X-Y*H,De=N-te*H,Fe=K-Y*re,q=Z-te*re,j=Fe*De-q*Be,xe=ne*q-ae*Fe,Pe=Be*ae-De*ne;if(s){if(j<0||xe<0||Pe<0)return null}else if((j<0||xe<0||Pe<0)&&(j>0||xe>0||Pe>0))return null;let ye=j+xe+Pe;if(ye===0)return null;let ke=F*(j*V+xe*H+Pe*re);return(ye>0?ke<0:ke>0)?null:this.at(ke/ye,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},On=class extends vn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new He(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Un,this.combine=Aa,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},oh=new lt,yi=new Fn,Pr=new Qn,lh=new U,Ir=new U,Lr=new U,Dr=new U,nl=new U,Nr=new U,ch=new U,Ur=new U,Ct=class extends It{constructor(e=new At,t=new On){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(r&&o){Nr.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=o[l],f=r[l];h!==0&&(nl.fromBufferAttribute(f,e),a?Nr.addScaledVector(nl,h):Nr.addScaledVector(nl.sub(t),h))}t.add(Nr)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Pr.copy(n.boundingSphere),Pr.applyMatrix4(r),yi.copy(e.ray).recast(e.near),!(Pr.containsPoint(yi.origin)===!1&&(yi.intersectSphere(Pr,lh)===null||yi.origin.distanceToSquared(lh)>(e.far-e.near)**2))&&(oh.copy(r).invert(),yi.copy(e.ray).applyMatrix4(oh),!(n.boundingBox!==null&&yi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,yi)))}_computeIntersections(e,t,n){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,f=r.attributes.normal,u=r.groups,p=r.drawRange;if(o!==null)if(Array.isArray(a))for(let _=0,b=u.length;_<b;_++){let g=u[_],d=a[g.materialIndex],T=Math.max(g.start,p.start),I=Math.min(o.count,Math.min(g.start+g.count,p.start+p.count));for(let v=T,M=I;v<M;v+=3){let w=o.getX(v),C=o.getX(v+1),y=o.getX(v+2);s=Fr(this,d,e,n,c,h,f,w,C,y),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=g.materialIndex,t.push(s))}}else{let _=Math.max(0,p.start),b=Math.min(o.count,p.start+p.count);for(let g=_,d=b;g<d;g+=3){let T=o.getX(g),I=o.getX(g+1),v=o.getX(g+2);s=Fr(this,a,e,n,c,h,f,T,I,v),s&&(s.faceIndex=Math.floor(g/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let _=0,b=u.length;_<b;_++){let g=u[_],d=a[g.materialIndex],T=Math.max(g.start,p.start),I=Math.min(l.count,Math.min(g.start+g.count,p.start+p.count));for(let v=T,M=I;v<M;v+=3){let w=v,C=v+1,y=v+2;s=Fr(this,d,e,n,c,h,f,w,C,y),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=g.materialIndex,t.push(s))}}else{let _=Math.max(0,p.start),b=Math.min(l.count,p.start+p.count);for(let g=_,d=b;g<d;g+=3){let T=g,I=g+1,v=g+2;s=Fr(this,a,e,n,c,h,f,T,I,v),s&&(s.faceIndex=Math.floor(g/3),t.push(s))}}}};function f1(i,e,t,n,s,r,a,o){let l;if(e.side===Lt?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,e.side===oi,o),l===null)return null;Ur.copy(o),Ur.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(Ur);return c<t.near||c>t.far?null:{distance:c,point:Ur.clone(),object:i}}function Fr(i,e,t,n,s,r,a,o,l,c){i.getVertexPosition(o,Ir),i.getVertexPosition(l,Lr),i.getVertexPosition(c,Dr);let h=f1(i,e,t,n,Ir,Lr,Dr,ch);if(h){let f=new U;Kn.getBarycoord(ch,Ir,Lr,Dr,f),s&&(h.uv=Kn.getInterpolatedAttribute(s,o,l,c,f,new Ue)),r&&(h.uv1=Kn.getInterpolatedAttribute(r,o,l,c,f,new Ue)),a&&(h.normal=Kn.getInterpolatedAttribute(a,o,l,c,f,new U),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let u={a:o,b:l,c,normal:new U,materialIndex:0};Kn.getNormal(Ir,Lr,Dr,u.normal),h.face=u,h.barycoord=f}return h}var aa=class extends Wt{constructor(e=null,t=1,n=1,s,r,a,o,l,c=Tt,h=Tt,f,u){super(null,a,o,l,c,h,s,r,f,u),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var vi=new Qn,p1=new Ue(.5,.5),Or=new U,is=class{constructor(e=new Kt,t=new Kt,n=new Kt,s=new Kt,r=new Kt,a=new Kt){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=cn,n=!1){let s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],h=r[4],f=r[5],u=r[6],p=r[7],_=r[8],b=r[9],g=r[10],d=r[11],T=r[12],I=r[13],v=r[14],M=r[15];if(s[0].setComponents(c-a,p-h,d-_,M-T).normalize(),s[1].setComponents(c+a,p+h,d+_,M+T).normalize(),s[2].setComponents(c+o,p+f,d+b,M+I).normalize(),s[3].setComponents(c-o,p-f,d-b,M-I).normalize(),n)s[4].setComponents(l,u,g,v).normalize(),s[5].setComponents(c-l,p-u,d-g,M-v).normalize();else if(s[4].setComponents(c-l,p-u,d-g,M-v).normalize(),t===cn)s[5].setComponents(c+l,p+u,d+g,M+v).normalize();else if(t===Ji)s[5].setComponents(l,u,g,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),vi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),vi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(vi)}intersectsSprite(e){vi.center.set(0,0,0);let t=p1.distanceTo(e.center);return vi.radius=.7071067811865476+t,vi.applyMatrix4(e.matrixWorld),this.intersectsSphere(vi)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(Or.x=s.normal.x>0?e.max.x:e.min.x,Or.y=s.normal.y>0?e.max.y:e.min.y,Or.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Or)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var ei=class extends vn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new He(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},oa=new U,la=new U,hh=new lt,Ps=new Fn,Br=new Qn,il=new U,uh=new U,Si=class extends It{constructor(e=new At,t=new ei){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)oa.fromBufferAttribute(t,s-1),la.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=oa.distanceTo(la);e.setAttribute("lineDistance",new xt(n,1))}else Ie("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Br.copy(n.boundingSphere),Br.applyMatrix4(s),Br.radius+=r,e.ray.intersectsSphere(Br)===!1)return;hh.copy(s).invert(),Ps.copy(e.ray).applyMatrix4(hh);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=n.index,u=n.attributes.position;if(h!==null){let p=Math.max(0,a.start),_=Math.min(h.count,a.start+a.count);for(let b=p,g=_-1;b<g;b+=c){let d=h.getX(b),T=h.getX(b+1),I=kr(this,e,Ps,l,d,T,b);I&&t.push(I)}if(this.isLineLoop){let b=h.getX(_-1),g=h.getX(p),d=kr(this,e,Ps,l,b,g,_-1);d&&t.push(d)}}else{let p=Math.max(0,a.start),_=Math.min(u.count,a.start+a.count);for(let b=p,g=_-1;b<g;b+=c){let d=kr(this,e,Ps,l,b,b+1,b);d&&t.push(d)}if(this.isLineLoop){let b=kr(this,e,Ps,l,_-1,p,_-1);b&&t.push(b)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function kr(i,e,t,n,s,r,a){let o=i.geometry.attributes.position;if(oa.fromBufferAttribute(o,s),la.fromBufferAttribute(o,r),t.distanceSqToSegment(oa,la,il,uh)>n)return;il.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(il);if(!(c<e.near||c>e.far))return{distance:c,point:uh.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}var dh=new U,fh=new U,zs=class extends Si{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)dh.fromBufferAttribute(t,s),fh.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+dh.distanceTo(fh);e.setAttribute("lineDistance",new xt(n,1))}else Ie("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var ss=class extends vn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new He(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},ph=new lt,hl=new Fn,zr=new Qn,Vr=new U,Vs=class extends It{constructor(e=new At,t=new ss){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),zr.copy(n.boundingSphere),zr.applyMatrix4(s),zr.radius+=r,e.ray.intersectsSphere(zr)===!1)return;ph.copy(s).invert(),hl.copy(e.ray).applyMatrix4(ph);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,f=n.attributes.position;if(c!==null){let u=Math.max(0,a.start),p=Math.min(c.count,a.start+a.count);for(let _=u,b=p;_<b;_++){let g=c.getX(_);Vr.fromBufferAttribute(f,g),mh(Vr,g,l,s,e,t,this)}}else{let u=Math.max(0,a.start),p=Math.min(f.count,a.start+a.count);for(let _=u,b=p;_<b;_++)Vr.fromBufferAttribute(f,_),mh(Vr,_,l,s,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function mh(i,e,t,n,s,r,a){let o=hl.distanceSqToPoint(i);if(o<t){let l=new U;hl.closestPointToPoint(i,l),l.applyMatrix4(n);let c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}var Gs=class extends Wt{constructor(e=[],t=li,n,s,r,a,o,l,c,h){super(e,t,n,s,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}};var ti=class extends Wt{constructor(e,t,n=dn,s,r,a,o=Tt,l=Tt,c,h=yn,f=1){if(h!==yn&&h!==hi)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:e,height:t,depth:f};super(u,s,r,a,o,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new es(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},ca=class extends ti{constructor(e,t=dn,n=li,s,r,a=Tt,o=Tt,l,c=yn){let h={width:e,height:e,depth:1},f=[h,h,h,h,h,h];super(e,e,t,n,s,r,a,o,l,c),this.image=f,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Hs=class extends Wt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},rs=class i extends At{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],h=[],f=[],u=0,p=0;_("z","y","x",-1,-1,n,t,e,a,r,0),_("z","y","x",1,-1,n,t,-e,a,r,1),_("x","z","y",1,1,e,n,t,s,a,2),_("x","z","y",1,-1,e,n,-t,s,a,3),_("x","y","z",1,-1,e,t,n,s,r,4),_("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new xt(c,3)),this.setAttribute("normal",new xt(h,3)),this.setAttribute("uv",new xt(f,2));function _(b,g,d,T,I,v,M,w,C,y,E){let D=v/C,O=M/y,V=v/2,X=M/2,N=w/2,H=C+1,K=y+1,Z=0,re=0,Y=new U;for(let te=0;te<K;te++){let F=te*O-X;for(let ne=0;ne<H;ne++){let ae=ne*D-V;Y[b]=ae*T,Y[g]=F*I,Y[d]=N,c.push(Y.x,Y.y,Y.z),Y[b]=0,Y[g]=0,Y[d]=w>0?1:-1,h.push(Y.x,Y.y,Y.z),f.push(ne/C),f.push(1-te/y),Z+=1}}for(let te=0;te<y;te++)for(let F=0;F<C;F++){let ne=u+F+H*te,ae=u+F+H*(te+1),Be=u+(F+1)+H*(te+1),De=u+(F+1)+H*te;l.push(ne,ae,De),l.push(ae,Be,De),re+=6}o.addGroup(p,re,E),p+=re,u+=Z}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var Ws=class i extends At{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(s),c=o+1,h=l+1,f=e/o,u=t/l,p=[],_=[],b=[],g=[];for(let d=0;d<h;d++){let T=d*u-a;for(let I=0;I<c;I++){let v=I*f-r;_.push(v,-T,0),b.push(0,0,1),g.push(I/o),g.push(1-d/l)}}for(let d=0;d<l;d++)for(let T=0;T<o;T++){let I=T+c*d,v=T+c*(d+1),M=T+1+c*(d+1),w=T+1+c*d;p.push(I,v,w),p.push(v,M,w)}this.setIndex(p),this.setAttribute("position",new xt(_,3)),this.setAttribute("normal",new xt(b,3)),this.setAttribute("uv",new xt(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}};var Bn=class i extends At{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(a+o,Math.PI),c=0,h=[],f=new U,u=new U,p=[],_=[],b=[],g=[];for(let d=0;d<=n;d++){let T=[],I=d/n,v=a+I*o,M=e*Math.cos(v),w=Math.sqrt(e*e-M*M),C=0;d===0&&a===0?C=.5/t:d===n&&l===Math.PI&&(C=-.5/t);for(let y=0;y<=t;y++){let E=y/t,D=s+E*r;f.x=-w*Math.cos(D),f.y=M,f.z=w*Math.sin(D),_.push(f.x,f.y,f.z),u.copy(f).normalize(),b.push(u.x,u.y,u.z),g.push(E+C,1-I),T.push(c++)}h.push(T)}for(let d=0;d<n;d++)for(let T=0;T<t;T++){let I=h[d][T+1],v=h[d][T],M=h[d+1][T],w=h[d+1][T+1];(d!==0||a>0)&&p.push(I,v,w),(d!==n-1||l<Math.PI)&&p.push(v,M,w)}this.setIndex(p),this.setAttribute("position",new xt(_,3)),this.setAttribute("normal",new xt(b,3)),this.setAttribute("uv",new xt(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};function Ei(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];if(gh(s))s.isRenderTargetTexture?(Ie("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(gh(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function kt(i){let e={};for(let t=0;t<i.length;t++){let n=Ei(i[t]);for(let s in n)e[s]=n[s]}return e}function gh(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function m1(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function zl(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:$e.workingColorSpace}var hu={clone:Ei,merge:kt},g1=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,_1=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Qt=class extends vn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=g1,this.fragmentShader=_1,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ei(e.uniforms),this.uniformsGroups=m1(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new He().setHex(s.value);break;case"v2":this.uniforms[n].value=new Ue().fromArray(s.value);break;case"v3":this.uniforms[n].value=new U().fromArray(s.value);break;case"v4":this.uniforms[n].value=new dt().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Oe().fromArray(s.value);break;case"m4":this.uniforms[n].value=new lt().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},ha=class extends Qt{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}};var as=class extends vn{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new He(16777215),this.specular=new He(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new He(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=po,this.normalScale=new Ue(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Un,this.combine=Aa,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var ua=class extends vn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Zh,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},da=class extends vn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Hi(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function sl(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}var ni=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let a;t:{i:if(!(e<s)){for(let o=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=t[++n],e<s)break e}a=t.length;break t}if(!(e>=r)){let o=t[1];e<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break e}a=n,n=0;break t}break n}for(;n<a;){let o=n+a>>>1;e<t[o]?a=o:n=o+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},fa=class extends ni{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:ol,endingEnd:ol}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,a=e+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case ll:r=e,o=2*t-n;break;case cl:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case ll:a=e,l=2*n-t;break;case cl:a=1,l=n+s[1]-s[0];break;default:a=e-1,l=t}let c=(n-t)*.5,h=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this._offsetPrev,f=this._offsetNext,u=this._weightPrev,p=this._weightNext,_=(n-t)/(s-t),b=_*_,g=b*_,d=-u*g+2*u*b-u*_,T=(1+u)*g+(-1.5-2*u)*b+(-.5+u)*_+1,I=(-1-p)*g+(1.5+p)*b+.5*_,v=p*g-p*b;for(let M=0;M!==o;++M)r[M]=d*a[h+M]+T*a[c+M]+I*a[l+M]+v*a[f+M];return r}},pa=class extends ni{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=(n-t)/(s-t),f=1-h;for(let u=0;u!==o;++u)r[u]=a[c+u]*f+a[l+u]*h;return r}},ma=class extends ni{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},ga=class extends ni{interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this.inTangents,f=this.outTangents;if(!h||!f){let _=(n-t)/(s-t),b=1-_;for(let g=0;g!==o;++g)r[g]=a[c+g]*b+a[l+g]*_;return r}let u=o*2,p=e-1;for(let _=0;_!==o;++_){let b=a[c+_],g=a[l+_],d=p*u+_*2,T=f[d],I=f[d+1],v=e*u+_*2,M=h[v],w=h[v+1],C=y1(n,t,T,M,s);r[_]=uu(C,b,I,w,g)}return r}};function uu(i,e,t,n,s){let r=1-i;return r*r*r*e+3*r*r*i*t+3*r*i*i*n+i*i*i*s}function x1(i,e,t,n,s){let r=1-i;return 3*r*r*(t-e)+6*r*i*(n-t)+3*i*i*(s-n)}function y1(i,e,t,n,s){let r=(i-e)/(s-e);for(let a=0;a<8;a++){let o=uu(r,e,t,n,s)-i;if(Math.abs(o)<1e-10)break;let l=x1(r,e,t,n,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-o/l))}return r}var en=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Hi(t,this.TimeBufferType),this.values=Hi(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Hi(e.times,Array),values:Hi(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s),sl(e.settings)&&(n.settings={inTangents:Hi(e.settings.inTangents,Array),outTangents:Hi(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new ma(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new pa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new fa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new ga(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Ds:t=this.InterpolantFactoryMethodDiscrete;break;case na:t=this.InterpolantFactoryMethodLinear;break;case Wr:t=this.InterpolantFactoryMethodSmooth;break;case al:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Ie("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Ds;case this.InterpolantFactoryMethodLinear:return na;case this.InterpolantFactoryMethodSmooth:return Wr;case this.InterpolantFactoryMethodBezier:return al}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e;sl(this.settings)&&(_h(this.settings.inTangents,e),_h(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(Ne("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(Ne("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){Ne("KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){Ne("KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(s!==void 0&&Nd(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){Ne("KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Wr,r=e.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=e[o],h=e[o+1];if(c!==h&&(o!==1||c!==e[0]))if(s)l=!0;else{let f=o*n,u=f-n,p=f+n;for(let _=0;_!==n;++_){let b=t[f+_];if(b!==t[u+_]||b!==t[p+_]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];let f=o*n,u=a*n;for(let p=0;p!==n;++p)t[u+p]=t[f+p]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,sl(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function _h(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]*=e}en.prototype.ValueTypeName="";en.prototype.TimeBufferType=Float32Array;en.prototype.ValueBufferType=Float32Array;en.prototype.DefaultInterpolation=na;var ii=class extends en{constructor(e,t,n){super(e,t,n)}};ii.prototype.ValueTypeName="bool";ii.prototype.ValueBufferType=Array;ii.prototype.DefaultInterpolation=Ds;ii.prototype.InterpolantFactoryMethodLinear=void 0;ii.prototype.InterpolantFactoryMethodSmooth=void 0;var _a=class extends en{constructor(e,t,n,s){super(e,t,n,s)}};_a.prototype.ValueTypeName="color";var xa=class extends en{constructor(e,t,n,s){super(e,t,n,s)}};xa.prototype.ValueTypeName="number";var ya=class extends ni{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-t)/(s-t),c=e*o;for(let h=c+o;c!==h;c+=4)jt.slerpFlat(r,0,a,c-o,a,c,l);return r}},Xs=class extends en{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new ya(this.times,this.values,this.getValueSize(),e)}};Xs.prototype.ValueTypeName="quaternion";Xs.prototype.InterpolantFactoryMethodSmooth=void 0;var si=class extends en{constructor(e,t,n){super(e,t,n)}};si.prototype.ValueTypeName="string";si.prototype.ValueBufferType=Array;si.prototype.DefaultInterpolation=Ds;si.prototype.InterpolantFactoryMethodLinear=void 0;si.prototype.InterpolantFactoryMethodSmooth=void 0;var va=class extends en{constructor(e,t,n,s){super(e,t,n,s)}};va.prototype.ValueTypeName="vector";var qr={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(xh(i)||(this.files[i]=e))},get:function(i){if(this.enabled!==!1&&!xh(i))return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};function xh(i){try{let e=i.slice(i.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}var ba=class{constructor(e,t,n){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(h){o++,r===!1&&s.onStart!==void 0&&s.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,s.onProgress!==void 0&&s.onProgress(h,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,f){return c.push(h,f),this},this.removeHandler=function(h){let f=c.indexOf(h);return f!==-1&&c.splice(f,2),this},this.getHandler=function(h){for(let f=0,u=c.length;f<u;f+=2){let p=c[f],_=c[f+1];if(p.global&&(p.lastIndex=0),p.test(h))return _}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},du=new ba,os=class{constructor(e){this.manager=e!==void 0?e:du,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};os.DEFAULT_MATERIAL_NAME="__DEFAULT";var Wi=new WeakMap,Sa=class extends os{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,a=qr.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0);else{let f=Wi.get(a);f===void 0&&(f=[],Wi.set(a,f)),f.push({onLoad:t,onError:s})}return a}let o=Ki("img");function l(){h(),t&&t(this);let f=Wi.get(this)||[];for(let u=0;u<f.length;u++){let p=f[u];p.onLoad&&p.onLoad(this)}Wi.delete(this),r.manager.itemEnd(e)}function c(f){h(),s&&s(f),qr.remove(`image:${e}`);let u=Wi.get(this)||[];for(let p=0;p<u.length;p++){let _=u[p];_.onError&&_.onError(f)}Wi.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){o.removeEventListener("load",l,!1),o.removeEventListener("error",c,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),qr.add(`image:${e}`,o),r.manager.itemStart(e),o.src=e,o}};var qs=class extends os{constructor(e){super(e)}load(e,t,n,s){let r=new Wt,a=new Sa(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){r.image=o,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}},Ys=class extends It{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new He(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}};var rl=new lt,yh=new U,vh=new U,Ma=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ue(512,512),this.mapType=Yt,this.map=null,this.mapPass=null,this.matrix=new lt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new is,this._frameExtents=new Ue(1,1),this._viewportCount=1,this._viewports=[new dt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;yh.setFromMatrixPosition(e.matrixWorld),t.position.copy(yh),vh.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(vh),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,s){rl.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(rl,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;e.coordinateSystem===Ji||e.reversedDepth?t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(rl)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Gr=new U,Hr=new jt,_n=new U,$s=class extends It{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new lt,this.projectionMatrix=new lt,this.projectionMatrixInverse=new lt,this.coordinateSystem=cn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Gr,Hr,_n),_n.x===1&&_n.y===1&&_n.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Gr,Hr,_n.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Gr,Hr,_n),_n.x===1&&_n.y===1&&_n.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Gr,Hr,_n.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Jn=new U,bh=new Ue,Sh=new Ue,Bt=class extends $s{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Qi*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Is*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Qi*2*Math.atan(Math.tan(Is*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Jn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Jn.x,Jn.y).multiplyScalar(-e/Jn.z),Jn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Jn.x,Jn.y).multiplyScalar(-e/Jn.z)}getViewSize(e,t){return this.getViewBounds(e,bh,Sh),t.subVectors(Sh,bh)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Is*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}};var ls=class extends $s{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,a=n+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},ul=class extends Ma{constructor(){super(new ls(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Zs=class extends Ys{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(It.DEFAULT_UP),this.updateMatrix(),this.target=new It,this.shadow=new ul}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},Js=class extends Ys{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}};var Xi=-90,qi=1,wa=class extends It{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Bt(Xi,qi,e,t);s.layers=this.layers,this.add(s);let r=new Bt(Xi,qi,e,t);r.layers=this.layers,this.add(r);let a=new Bt(Xi,qi,e,t);a.layers=this.layers,this.add(a);let o=new Bt(Xi,qi,e,t);o.layers=this.layers,this.add(o);let l=new Bt(Xi,qi,e,t);l.layers=this.layers,this.add(l);let c=new Bt(Xi,qi,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,l]=t;for(let c of t)this.remove(c);if(e===cn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Ji)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,h]=this.children,f=e.getRenderTarget(),u=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),_=e.xr.enabled;e.xr.enabled=!1;let b=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let g=!1;e.isWebGLRenderer===!0?g=e.state.buffers.depth.getReversed():g=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=b,e.setRenderTarget(n,5,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,h),e.setRenderTarget(f,u,p),e.xr.enabled=_,n.texture.needsPMREMUpdate=!0}},Ea=class extends Bt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var Vl="\\[\\]\\.:\\/",v1=new RegExp("["+Vl+"]","g"),Gl="[^"+Vl+"]",b1="[^"+Vl.replace("\\.","")+"]",S1=/((?:WC+[\/:])*)/.source.replace("WC",Gl),M1=/(WCOD+)?/.source.replace("WCOD",b1),w1=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Gl),E1=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Gl),T1=new RegExp("^"+S1+M1+w1+E1+"$"),A1=["material","materials","bones","map"],dl=class{constructor(e,t,n){let s=n||ht.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},ht=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(v1,"")}static parseTrackName(e){let t=T1.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);A1.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let l=n(o.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Ie("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){Ne("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){Ne("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){Ne("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){Ne("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){Ne("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){Ne("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){Ne("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let a=e[s];if(a===void 0){let c=t.nodeName;Ne("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){Ne("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){Ne("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};ht.Composite=dl;ht.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ht.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ht.prototype.GetterByBindingType=[ht.prototype._getValue_direct,ht.prototype._getValue_array,ht.prototype._getValue_arrayElement,ht.prototype._getValue_toArray];ht.prototype.SetterByBindingTypeAndVersioning=[[ht.prototype._setValue_direct,ht.prototype._setValue_direct_setNeedsUpdate,ht.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ht.prototype._setValue_array,ht.prototype._setValue_array_setNeedsUpdate,ht.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ht.prototype._setValue_arrayElement,ht.prototype._setValue_arrayElement_setNeedsUpdate,ht.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ht.prototype._setValue_fromArray,ht.prototype._setValue_fromArray_setNeedsUpdate,ht.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var M3=new Float32Array(1);var Mh=new lt,Ks=class{constructor(e,t,n=0,s=1/0){this.ray=new Fn(e,t),this.near=n,this.far=s,this.camera=null,this.layers=new ts,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):Ne("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Mh.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Mh),this}intersectObject(e,t=!0,n=[]){return fl(e,this,n,t),n.sort(wh),n}intersectObjects(e,t=!0,n=[]){for(let s=0,r=e.length;s<r;s++)fl(e[s],this,n,t);return n.sort(wh),n}};function wh(i,e){return i.distance-e.distance}function fl(i,e,t,n){let s=!0;if(i.layers.test(e.layers)&&i.raycast(e,t)===!1&&(s=!1),s===!0&&n===!0){let r=i.children;for(let a=0,o=r.length;a<o;a++)fl(r[a],e,t,!0)}}var cs=class{constructor(e=1,t=0,n=0){this.radius=e,this.phi=t,this.theta=n}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=We(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(We(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var $l=class $l{constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=s,this}};$l.prototype.isMatrix2=!0;var pl=$l;var js=class extends hn{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}};function Hl(i,e,t,n){let s=C1(n);switch(t){case Dl:return i*e;case Ul:return i*e/s.components*s.byteLength;case Na:return i*e/s.components*s.byteLength;case ui:return i*e*2/s.components*s.byteLength;case Ua:return i*e*2/s.components*s.byteLength;case Nl:return i*e*3/s.components*s.byteLength;case sn:return i*e*4/s.components*s.byteLength;case Fa:return i*e*4/s.components*s.byteLength;case nr:case ir:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case sr:case rr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ba:case za:return Math.max(i,16)*Math.max(e,8)/4;case Oa:case ka:return Math.max(i,8)*Math.max(e,8)/2;case Va:case Ga:case Wa:case Xa:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Ha:case ar:case qa:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ya:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case $a:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Za:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Ja:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Ka:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case ja:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Qa:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case eo:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case to:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case no:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case io:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case so:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case ro:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case ao:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case oo:case lo:case co:return Math.ceil(i/4)*Math.ceil(e/4)*16;case ho:case uo:return Math.ceil(i/4)*Math.ceil(e/4)*8;case or:case fo:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function C1(i){switch(i){case Yt:case Rl:return{byteLength:1,components:1};case ds:case Pl:case pn:return{byteLength:2,components:1};case La:case Da:return{byteLength:2,components:4};case dn:case Ia:case fn:return{byteLength:4,components:1};case Il:case Ll:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Ie("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Nu(){let i=null,e=!1,t=null,n=null;function s(r,a){n=i.requestAnimationFrame(s),t(r,a)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function P1(i){let e=new WeakMap;function t(o,l){let c=o.array,h=o.usage,f=c.byteLength,u=i.createBuffer();i.bindBuffer(l,u),i.bufferData(l,c,h),o.onUploadCallback();let p;if(c instanceof Float32Array)p=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)p=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=i.SHORT;else if(c instanceof Uint32Array)p=i.UNSIGNED_INT;else if(c instanceof Int32Array)p=i.INT;else if(c instanceof Int8Array)p=i.BYTE;else if(c instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:f}}function n(o,l,c){let h=l.array,f=l.updateRanges;if(i.bindBuffer(c,o),f.length===0)i.bufferSubData(c,0,h);else{f.sort((p,_)=>p.start-_.start);let u=0;for(let p=1;p<f.length;p++){let _=f[u],b=f[p];b.start<=_.start+_.count+1?_.count=Math.max(_.count,b.start+b.count-_.start):(++u,f[u]=b)}f.length=u+1;for(let p=0,_=f.length;p<_;p++){let b=f[p];i.bufferSubData(c,b.start*h.BYTES_PER_ELEMENT,h,b.start,b.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var I1=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,L1=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,D1=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,N1=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,U1=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,F1=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,O1=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,B1=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,k1=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,z1=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,V1=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,G1=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,H1=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,W1=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,X1=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,q1=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Y1=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,$1=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Z1=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,J1=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,K1=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,j1=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Q1=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,ef=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,tf=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,nf=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,sf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,rf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,af=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,of=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,lf="gl_FragColor = linearToOutputTexel( gl_FragColor );",cf=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,hf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,uf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,df=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,ff=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,pf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,mf=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,gf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,_f=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,xf=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,yf=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,vf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,bf=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Sf=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Mf=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,wf=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,Ef=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Tf=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Af=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Cf=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Rf=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Pf=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,If=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Lf=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Df=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Nf=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,Uf=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Ff=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Of=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Bf=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,kf=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,zf=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Vf=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Gf=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Hf=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Wf=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Xf=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,qf=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Yf=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,$f=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Zf=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Jf=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Kf=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,jf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Qf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,e0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,t0=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,n0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,i0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,s0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,r0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,a0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,o0=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,l0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,c0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,h0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,u0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,d0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,f0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,p0=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,m0=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,g0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,_0=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,x0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,y0=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,v0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,b0=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,S0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,M0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,w0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,E0=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,T0=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,A0=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,C0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,R0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,P0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,I0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,L0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,D0=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,N0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,U0=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,F0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,O0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,B0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,k0=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,z0=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,V0=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,G0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,H0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,W0=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,X0=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,q0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Y0=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,$0=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Z0=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,J0=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,K0=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,j0=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Q0=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,ep=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,tp=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,np=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,ip=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,sp=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,rp=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ap=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,op=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,lp=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,cp=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,hp=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,up=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ge={alphahash_fragment:I1,alphahash_pars_fragment:L1,alphamap_fragment:D1,alphamap_pars_fragment:N1,alphatest_fragment:U1,alphatest_pars_fragment:F1,aomap_fragment:O1,aomap_pars_fragment:B1,batching_pars_vertex:k1,batching_vertex:z1,begin_vertex:V1,beginnormal_vertex:G1,bsdfs:H1,iridescence_fragment:W1,bumpmap_pars_fragment:X1,clipping_planes_fragment:q1,clipping_planes_pars_fragment:Y1,clipping_planes_pars_vertex:$1,clipping_planes_vertex:Z1,color_fragment:J1,color_pars_fragment:K1,color_pars_vertex:j1,color_vertex:Q1,common:ef,cube_uv_reflection_fragment:tf,defaultnormal_vertex:nf,displacementmap_pars_vertex:sf,displacementmap_vertex:rf,emissivemap_fragment:af,emissivemap_pars_fragment:of,colorspace_fragment:lf,colorspace_pars_fragment:cf,envmap_fragment:hf,envmap_common_pars_fragment:uf,envmap_pars_fragment:df,envmap_pars_vertex:ff,envmap_physical_pars_fragment:wf,envmap_vertex:pf,fog_vertex:mf,fog_pars_vertex:gf,fog_fragment:_f,fog_pars_fragment:xf,gradientmap_pars_fragment:yf,lightmap_pars_fragment:vf,lights_lambert_fragment:bf,lights_lambert_pars_fragment:Sf,lights_pars_begin:Mf,lights_toon_fragment:Ef,lights_toon_pars_fragment:Tf,lights_phong_fragment:Af,lights_phong_pars_fragment:Cf,lights_physical_fragment:Rf,lights_physical_pars_fragment:Pf,lights_fragment_begin:If,lights_fragment_maps:Lf,lights_fragment_end:Df,lightprobes_pars_fragment:Nf,logdepthbuf_fragment:Uf,logdepthbuf_pars_fragment:Ff,logdepthbuf_pars_vertex:Of,logdepthbuf_vertex:Bf,map_fragment:kf,map_pars_fragment:zf,map_particle_fragment:Vf,map_particle_pars_fragment:Gf,metalnessmap_fragment:Hf,metalnessmap_pars_fragment:Wf,morphinstance_vertex:Xf,morphcolor_vertex:qf,morphnormal_vertex:Yf,morphtarget_pars_vertex:$f,morphtarget_vertex:Zf,normal_fragment_begin:Jf,normal_fragment_maps:Kf,normal_pars_fragment:jf,normal_pars_vertex:Qf,normal_vertex:e0,normalmap_pars_fragment:t0,clearcoat_normal_fragment_begin:n0,clearcoat_normal_fragment_maps:i0,clearcoat_pars_fragment:s0,iridescence_pars_fragment:r0,opaque_fragment:a0,packing:o0,premultiplied_alpha_fragment:l0,project_vertex:c0,dithering_fragment:h0,dithering_pars_fragment:u0,roughnessmap_fragment:d0,roughnessmap_pars_fragment:f0,shadowmap_pars_fragment:p0,shadowmap_pars_vertex:m0,shadowmap_vertex:g0,shadowmask_pars_fragment:_0,skinbase_vertex:x0,skinning_pars_vertex:y0,skinning_vertex:v0,skinnormal_vertex:b0,specularmap_fragment:S0,specularmap_pars_fragment:M0,tonemapping_fragment:w0,tonemapping_pars_fragment:E0,transmission_fragment:T0,transmission_pars_fragment:A0,uv_pars_fragment:C0,uv_pars_vertex:R0,uv_vertex:P0,worldpos_vertex:I0,background_vert:L0,background_frag:D0,backgroundCube_vert:N0,backgroundCube_frag:U0,cube_vert:F0,cube_frag:O0,depth_vert:B0,depth_frag:k0,distance_vert:z0,distance_frag:V0,equirect_vert:G0,equirect_frag:H0,linedashed_vert:W0,linedashed_frag:X0,meshbasic_vert:q0,meshbasic_frag:Y0,meshlambert_vert:$0,meshlambert_frag:Z0,meshmatcap_vert:J0,meshmatcap_frag:K0,meshnormal_vert:j0,meshnormal_frag:Q0,meshphong_vert:ep,meshphong_frag:tp,meshphysical_vert:np,meshphysical_frag:ip,meshtoon_vert:sp,meshtoon_frag:rp,points_vert:ap,points_frag:op,shadow_vert:lp,shadow_frag:cp,sprite_vert:hp,sprite_frag:up},me={common:{diffuse:{value:new He(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Oe},alphaMap:{value:null},alphaMapTransform:{value:new Oe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Oe}},envmap:{envMap:{value:null},envMapRotation:{value:new Oe},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Oe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Oe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Oe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Oe},normalScale:{value:new Ue(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Oe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Oe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Oe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Oe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new He(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new U},probesMax:{value:new U},probesResolution:{value:new U}},points:{diffuse:{value:new He(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Oe},alphaTest:{value:0},uvTransform:{value:new Oe}},sprite:{diffuse:{value:new He(16777215)},opacity:{value:1},center:{value:new Ue(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Oe},alphaMap:{value:null},alphaMapTransform:{value:new Oe},alphaTest:{value:0}}},wn={basic:{uniforms:kt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.fog]),vertexShader:Ge.meshbasic_vert,fragmentShader:Ge.meshbasic_frag},lambert:{uniforms:kt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.fog,me.lights,{emissive:{value:new He(0)},envMapIntensity:{value:1}}]),vertexShader:Ge.meshlambert_vert,fragmentShader:Ge.meshlambert_frag},phong:{uniforms:kt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.fog,me.lights,{emissive:{value:new He(0)},specular:{value:new He(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Ge.meshphong_vert,fragmentShader:Ge.meshphong_frag},standard:{uniforms:kt([me.common,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.roughnessmap,me.metalnessmap,me.fog,me.lights,{emissive:{value:new He(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ge.meshphysical_vert,fragmentShader:Ge.meshphysical_frag},toon:{uniforms:kt([me.common,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.gradientmap,me.fog,me.lights,{emissive:{value:new He(0)}}]),vertexShader:Ge.meshtoon_vert,fragmentShader:Ge.meshtoon_frag},matcap:{uniforms:kt([me.common,me.bumpmap,me.normalmap,me.displacementmap,me.fog,{matcap:{value:null}}]),vertexShader:Ge.meshmatcap_vert,fragmentShader:Ge.meshmatcap_frag},points:{uniforms:kt([me.points,me.fog]),vertexShader:Ge.points_vert,fragmentShader:Ge.points_frag},dashed:{uniforms:kt([me.common,me.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ge.linedashed_vert,fragmentShader:Ge.linedashed_frag},depth:{uniforms:kt([me.common,me.displacementmap]),vertexShader:Ge.depth_vert,fragmentShader:Ge.depth_frag},normal:{uniforms:kt([me.common,me.bumpmap,me.normalmap,me.displacementmap,{opacity:{value:1}}]),vertexShader:Ge.meshnormal_vert,fragmentShader:Ge.meshnormal_frag},sprite:{uniforms:kt([me.sprite,me.fog]),vertexShader:Ge.sprite_vert,fragmentShader:Ge.sprite_frag},background:{uniforms:{uvTransform:{value:new Oe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ge.background_vert,fragmentShader:Ge.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Oe}},vertexShader:Ge.backgroundCube_vert,fragmentShader:Ge.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ge.cube_vert,fragmentShader:Ge.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ge.equirect_vert,fragmentShader:Ge.equirect_frag},distance:{uniforms:kt([me.common,me.displacementmap,{referencePosition:{value:new U},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ge.distance_vert,fragmentShader:Ge.distance_frag},shadow:{uniforms:kt([me.lights,me.fog,{color:{value:new He(0)},opacity:{value:1}}]),vertexShader:Ge.shadow_vert,fragmentShader:Ge.shadow_frag}};wn.physical={uniforms:kt([wn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Oe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Oe},clearcoatNormalScale:{value:new Ue(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Oe},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Oe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Oe},sheen:{value:0},sheenColor:{value:new He(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Oe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Oe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Oe},transmissionSamplerSize:{value:new Ue},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Oe},attenuationDistance:{value:0},attenuationColor:{value:new He(0)},specularColor:{value:new He(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Oe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Oe},anisotropyVector:{value:new Ue},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Oe}}]),vertexShader:Ge.meshphysical_vert,fragmentShader:Ge.meshphysical_frag};var _o={r:0,b:0,g:0},dp=new lt,Uu=new Oe;Uu.set(-1,0,0,0,1,0,0,0,1);function fp(i,e,t,n,s,r){let a=new He(0),o=s===!0?0:1,l,c,h=null,f=0,u=null;function p(T){let I=T.isScene===!0?T.background:null;if(I&&I.isTexture){let v=T.backgroundBlurriness>0;I=e.get(I,v)}return I}function _(T){let I=!1,v=p(T);v===null?g(a,o):v&&v.isColor&&(g(v,1),I=!0);let M=i.xr.getEnvironmentBlendMode();M==="additive"?t.buffers.color.setClear(0,0,0,1,r):M==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||I)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function b(T,I){let v=p(I);v&&(v.isCubeTexture||v.mapping===er)?(c===void 0&&(c=new Ct(new rs(1,1,1),new Qt({name:"BackgroundCubeMaterial",uniforms:Ei(wn.backgroundCube.uniforms),vertexShader:wn.backgroundCube.vertexShader,fragmentShader:wn.backgroundCube.fragmentShader,side:Lt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(M,w,C){this.matrixWorld.copyPosition(C.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=v,c.material.uniforms.backgroundBlurriness.value=I.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=I.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(dp.makeRotationFromEuler(I.backgroundRotation)).transpose(),v.isCubeTexture&&v.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Uu),c.material.toneMapped=$e.getTransfer(v.colorSpace)!==Qe,(h!==v||f!==v.version||u!==i.toneMapping)&&(c.material.needsUpdate=!0,h=v,f=v.version,u=i.toneMapping),c.layers.enableAll(),T.unshift(c,c.geometry,c.material,0,0,null)):v&&v.isTexture&&(l===void 0&&(l=new Ct(new Ws(2,2),new Qt({name:"BackgroundMaterial",uniforms:Ei(wn.background.uniforms),vertexShader:wn.background.vertexShader,fragmentShader:wn.background.fragmentShader,side:oi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=v,l.material.uniforms.backgroundIntensity.value=I.backgroundIntensity,l.material.toneMapped=$e.getTransfer(v.colorSpace)!==Qe,v.matrixAutoUpdate===!0&&v.updateMatrix(),l.material.uniforms.uvTransform.value.copy(v.matrix),(h!==v||f!==v.version||u!==i.toneMapping)&&(l.material.needsUpdate=!0,h=v,f=v.version,u=i.toneMapping),l.layers.enableAll(),T.unshift(l,l.geometry,l.material,0,0,null))}function g(T,I){T.getRGB(_o,zl(i)),t.buffers.color.setClear(_o.r,_o.g,_o.b,I,r)}function d(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(T,I=1){a.set(T),o=I,g(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(T){o=T,g(a,o)},render:_,addToRenderList:b,dispose:d}}function pp(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=u(null),r=s,a=!1;function o(O,V,X,N,H){let K=!1,Z=f(O,N,X,V);r!==Z&&(r=Z,c(r.object)),K=p(O,N,X,H),K&&_(O,N,X,H),H!==null&&e.update(H,i.ELEMENT_ARRAY_BUFFER),(K||a)&&(a=!1,v(O,V,X,N),H!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(H).buffer))}function l(){return i.createVertexArray()}function c(O){return i.bindVertexArray(O)}function h(O){return i.deleteVertexArray(O)}function f(O,V,X,N){let H=N.wireframe===!0,K=n[V.id];K===void 0&&(K={},n[V.id]=K);let Z=O.isInstancedMesh===!0?O.id:0,re=K[Z];re===void 0&&(re={},K[Z]=re);let Y=re[X.id];Y===void 0&&(Y={},re[X.id]=Y);let te=Y[H];return te===void 0&&(te=u(l()),Y[H]=te),te}function u(O){let V=[],X=[],N=[];for(let H=0;H<t;H++)V[H]=0,X[H]=0,N[H]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:V,enabledAttributes:X,attributeDivisors:N,object:O,attributes:{},index:null}}function p(O,V,X,N){let H=r.attributes,K=V.attributes,Z=0,re=X.getAttributes();for(let Y in re)if(re[Y].location>=0){let F=H[Y],ne=K[Y];if(ne===void 0&&(Y==="instanceMatrix"&&O.instanceMatrix&&(ne=O.instanceMatrix),Y==="instanceColor"&&O.instanceColor&&(ne=O.instanceColor)),F===void 0||F.attribute!==ne||ne&&F.data!==ne.data)return!0;Z++}return r.attributesNum!==Z||r.index!==N}function _(O,V,X,N){let H={},K=V.attributes,Z=0,re=X.getAttributes();for(let Y in re)if(re[Y].location>=0){let F=K[Y];F===void 0&&(Y==="instanceMatrix"&&O.instanceMatrix&&(F=O.instanceMatrix),Y==="instanceColor"&&O.instanceColor&&(F=O.instanceColor));let ne={};ne.attribute=F,F&&F.data&&(ne.data=F.data),H[Y]=ne,Z++}r.attributes=H,r.attributesNum=Z,r.index=N}function b(){let O=r.newAttributes;for(let V=0,X=O.length;V<X;V++)O[V]=0}function g(O){d(O,0)}function d(O,V){let X=r.newAttributes,N=r.enabledAttributes,H=r.attributeDivisors;X[O]=1,N[O]===0&&(i.enableVertexAttribArray(O),N[O]=1),H[O]!==V&&(i.vertexAttribDivisor(O,V),H[O]=V)}function T(){let O=r.newAttributes,V=r.enabledAttributes;for(let X=0,N=V.length;X<N;X++)V[X]!==O[X]&&(i.disableVertexAttribArray(X),V[X]=0)}function I(O,V,X,N,H,K,Z){Z===!0?i.vertexAttribIPointer(O,V,X,H,K):i.vertexAttribPointer(O,V,X,N,H,K)}function v(O,V,X,N){b();let H=N.attributes,K=X.getAttributes(),Z=V.defaultAttributeValues;for(let re in K){let Y=K[re];if(Y.location>=0){let te=H[re];if(te===void 0&&(re==="instanceMatrix"&&O.instanceMatrix&&(te=O.instanceMatrix),re==="instanceColor"&&O.instanceColor&&(te=O.instanceColor)),te!==void 0){let F=te.normalized,ne=te.itemSize,ae=e.get(te);if(ae===void 0)continue;let Be=ae.buffer,De=ae.type,Fe=ae.bytesPerElement,q=De===i.INT||De===i.UNSIGNED_INT||te.gpuType===Ia;if(te.isInterleavedBufferAttribute){let j=te.data,xe=j.stride,Pe=te.offset;if(j.isInstancedInterleavedBuffer){for(let ye=0;ye<Y.locationSize;ye++)d(Y.location+ye,j.meshPerAttribute);O.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=j.meshPerAttribute*j.count)}else for(let ye=0;ye<Y.locationSize;ye++)g(Y.location+ye);i.bindBuffer(i.ARRAY_BUFFER,Be);for(let ye=0;ye<Y.locationSize;ye++)I(Y.location+ye,ne/Y.locationSize,De,F,xe*Fe,(Pe+ne/Y.locationSize*ye)*Fe,q)}else{if(te.isInstancedBufferAttribute){for(let j=0;j<Y.locationSize;j++)d(Y.location+j,te.meshPerAttribute);O.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=te.meshPerAttribute*te.count)}else for(let j=0;j<Y.locationSize;j++)g(Y.location+j);i.bindBuffer(i.ARRAY_BUFFER,Be);for(let j=0;j<Y.locationSize;j++)I(Y.location+j,ne/Y.locationSize,De,F,ne*Fe,ne/Y.locationSize*j*Fe,q)}}else if(Z!==void 0){let F=Z[re];if(F!==void 0)switch(F.length){case 2:i.vertexAttrib2fv(Y.location,F);break;case 3:i.vertexAttrib3fv(Y.location,F);break;case 4:i.vertexAttrib4fv(Y.location,F);break;default:i.vertexAttrib1fv(Y.location,F)}}}}T()}function M(){E();for(let O in n){let V=n[O];for(let X in V){let N=V[X];for(let H in N){let K=N[H];for(let Z in K)h(K[Z].object),delete K[Z];delete N[H]}}delete n[O]}}function w(O){if(n[O.id]===void 0)return;let V=n[O.id];for(let X in V){let N=V[X];for(let H in N){let K=N[H];for(let Z in K)h(K[Z].object),delete K[Z];delete N[H]}}delete n[O.id]}function C(O){for(let V in n){let X=n[V];for(let N in X){let H=X[N];if(H[O.id]===void 0)continue;let K=H[O.id];for(let Z in K)h(K[Z].object),delete K[Z];delete H[O.id]}}}function y(O){for(let V in n){let X=n[V],N=O.isInstancedMesh===!0?O.id:0,H=X[N];if(H!==void 0){for(let K in H){let Z=H[K];for(let re in Z)h(Z[re].object),delete Z[re];delete H[K]}delete X[N],Object.keys(X).length===0&&delete n[V]}}}function E(){D(),a=!0,r!==s&&(r=s,c(r.object))}function D(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:E,resetDefaultState:D,dispose:M,releaseStatesOfGeometry:w,releaseStatesOfObject:y,releaseStatesOfProgram:C,initAttributes:b,enableAttribute:g,disableUnusedAttributes:T}}function mp(i,e,t){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function a(l,c,h){h!==0&&(i.drawArraysInstanced(n,l,c,h),t.update(c,n,h))}function o(l,c,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,h);let u=0;for(let p=0;p<h;p++)u+=c[p];t.update(u,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function gp(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let C=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(C){return!(C!==sn&&n.convert(C)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(C){let y=C===pn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(C!==Yt&&C!==fn&&!y&&n.convert(C)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(C){if(C==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";C="mediump"}return C==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",h=l(c);h!==c&&(Ie("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let f=t.logarithmicDepthBuffer===!0,u=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&u===!1&&Ie("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),b=i.getParameter(i.MAX_TEXTURE_SIZE),g=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),d=i.getParameter(i.MAX_VERTEX_ATTRIBS),T=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),I=i.getParameter(i.MAX_VARYING_VECTORS),v=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),M=i.getParameter(i.MAX_SAMPLES),w=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:f,reversedDepthBuffer:u,maxTextures:p,maxVertexTextures:_,maxTextureSize:b,maxCubemapSize:g,maxAttributes:d,maxVertexUniforms:T,maxVaryings:I,maxFragmentUniforms:v,maxSamples:M,samples:w}}function _p(i){let e=this,t=null,n=0,s=!1,r=!1,a=new Kt,o=new Oe,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(f,u){let p=f.length!==0||u||n!==0||s;return s=u,n=f.length,p},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,u){t=h(f,u,0)},this.setState=function(f,u,p){let _=f.clippingPlanes,b=f.clipIntersection,g=f.clipShadows,d=i.get(f);if(!s||_===null||_.length===0||r&&!g)r?h(null):c();else{let T=r?0:n,I=T*4,v=d.clippingState||null;l.value=v,v=h(_,u,I,p);for(let M=0;M!==I;++M)v[M]=t[M];d.clippingState=v,this.numIntersection=b?this.numPlanes:0,this.numPlanes+=T}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(f,u,p,_){let b=f!==null?f.length:0,g=null;if(b!==0){if(g=l.value,_!==!0||g===null){let d=p+b*4,T=u.matrixWorldInverse;o.getNormalMatrix(T),(g===null||g.length<d)&&(g=new Float32Array(d));for(let I=0,v=p;I!==b;++I,v+=4)a.copy(f[I]).applyMatrix4(T,o),a.normal.toArray(g,v),g[v+3]=a.constant}l.value=g,l.needsUpdate=!0}return e.numPlanes=b,e.numIntersection=0,g}}var gs=4,xp=6,yp=20,vp=256,lr=new ls,fu=new He,Zl=null,Jl=0,Kl=0,jl=!1,bp=new U,Ti=new U,yo=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){let{size:a=256,position:o=bp}=r;Zl=this._renderer.getRenderTarget(),Jl=this._renderer.getActiveCubeFace(),Kl=this._renderer.getActiveMipmapLevel(),jl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,s,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=gu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=mu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Zl,Jl,Kl),this._renderer.xr.enabled=jl,e.scissorTest=!1,ms(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===li||e.mapping===wi?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Zl=this._renderer.getRenderTarget(),Jl=this._renderer.getActiveCubeFace(),Kl=this._renderer.getActiveMipmapLevel(),jl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Pt,minFilter:Pt,generateMipmaps:!1,type:pn,format:sn,colorSpace:Ns,depthBuffer:!1},s=pu(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=pu(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=Sp(r)),this._blurMaterial=wp(r,e,t),this._ggxMaterial=Mp(r,e,t)}return s}_compileMaterial(e){let t=new Ct(new At,e);this._renderer.compile(t,lr)}_sceneToCubeUV(e,t,n,s,r){let l=new Bt(90,1,t,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],f=this._renderer,u=f.autoClear,p=f.toneMapping;f.getClearColor(fu),f.toneMapping=un,f.autoClear=!1,f.state.buffers.depth.getReversed()&&(f.setRenderTarget(s),f.clearDepth(),f.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Ct(new rs,new On({name:"PMREM.Background",side:Lt,depthWrite:!1,depthTest:!1})));let b=this._backgroundBox,g=b.material,d=!1,T=e.background;T?T.isColor&&(g.color.copy(T),e.background=null,d=!0):(g.color.copy(fu),d=!0);for(let I=0;I<6;I++){let v=I%3;v===0?(l.up.set(0,c[I],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[I],r.y,r.z)):v===1?(l.up.set(0,0,c[I]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[I],r.z)):(l.up.set(0,c[I],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[I]));let M=this._cubeSize;ms(s,v*M,I>2?M:0,M,M),f.setRenderTarget(s),d&&f.render(b,l),f.render(e,l)}f.toneMapping=p,f.autoClear=u,e.background=T}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===li||e.mapping===wi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=gu()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=mu());let r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=e;let l=this._cubeSize;ms(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(a,lr)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){let s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let l=a.uniforms,c=n/(this._lodMeshes.length-1),h=t/(this._lodMeshes.length-1),f=Math.sqrt(c*c-h*h),u=c*1.25,p=f*u,{_lodMax:_}=this,b=this._sizeLods[n],g=3*b*(n>_-gs?n-_+gs:0),d=4*(this._cubeSize-b);l.envMap.value=e.texture,l.roughness.value=p,l.mipInt.value=_-t,ms(r,g,d,3*b,2*b),s.setRenderTarget(r),s.render(o,lr),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=_-n,ms(e,g,d,3*b,2*b),s.setRenderTarget(e),s.render(o,lr)}_blur(e,t,n,s){let r=this._pingPongRenderTarget,a=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(e,r,t,n,a),this._blurPass(r,e,n,n,a)}_blurPass(e,t,n,s,r){let a=this._renderer,o=this._blurMaterial,l=this._lodMeshes[s];l.material=o;let c=o.uniforms;c.envMap.value=e.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-n;let h=this._sizeLods[s],f=3*h*(s>this._lodMax-gs?s-this._lodMax+gs:0),u=4*(this._cubeSize-h);ms(t,f,u,3*h,2*h),a.setRenderTarget(t),a.render(l,lr)}};function Sp(i){let e=[],t=[],n=i,s=i-gs+1+xp;for(let r=0;r<s;r++){let a=Math.pow(2,n);e.push(a);let o=1/(a-2),l=-o,c=1+o,h=[l,l,c,l,c,c,l,l,c,c,l,c],f=6,u=6,p=3,_=new Float32Array(p*u*f),b=new Float32Array(p*u*f);for(let d=0;d<f;d++){let T=d%3*2/3-1,I=d>2?0:-1,v=[T,I,0,T+2/3,I,0,T+2/3,I+1,0,T,I,0,T+2/3,I+1,0,T,I+1,0];_.set(v,p*u*d);for(let M=0;M<u;M++){let w=h[M*2]*2-1,C=h[M*2+1]*2-1;d===0?Ti.set(1,C,w):d===1?Ti.set(-w,1,-C):d===2?Ti.set(-w,C,1):d===3?Ti.set(-1,C,-w):d===4?Ti.set(-w,-1,C):Ti.set(w,C,-1),Ti.toArray(b,(d*u+M)*p)}}let g=new At;g.setAttribute("position",new Ht(_,p)),g.setAttribute("outputDirection",new Ht(b,p)),t.push(new Ct(g,null)),n>gs&&n--}return{lodMeshes:t,sizeLods:e}}function pu(i,e,t){let n=new qt(i,e,t);return n.texture.mapping=er,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function ms(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function Mp(i,e,t){return new Qt({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:vp,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:So(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Sn,depthTest:!1,depthWrite:!1})}function wp(i,e,t){return new Qt({name:"SphericalGaussianBlur",defines:{SAMPLES:yp,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:So(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:Sn,depthTest:!1,depthWrite:!1})}function mu(){return new Qt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:So(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Sn,depthTest:!1,depthWrite:!1})}function gu(){return new Qt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:So(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Sn,depthTest:!1,depthWrite:!1})}function So(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var vo=class extends qt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Gs(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new rs(5,5,5),r=new Qt({name:"CubemapFromEquirect",uniforms:Ei(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Lt,blending:Sn});r.uniforms.tEquirect.value=t;let a=new Ct(s,r),o=t.minFilter;return t.minFilter===ci&&(t.minFilter=Pt),new wa(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}};function Ep(i){let e=new WeakMap,t=new WeakMap,n=null;function s(u,p=!1){return u==null?null:p?a(u):r(u)}function r(u){if(u&&u.isTexture){let p=u.mapping;if(p===Ca||p===Ra)if(e.has(u)){let _=e.get(u).texture;return o(_,u.mapping)}else{let _=u.image;if(_&&_.height>0){let b=new vo(_.height);return b.fromEquirectangularTexture(i,u),e.set(u,b),u.addEventListener("dispose",c),o(b.texture,u.mapping)}else return null}}return u}function a(u){if(u&&u.isTexture){let p=u.mapping,_=p===Ca||p===Ra,b=p===li||p===wi;if(_||b){let g=t.get(u),d=g!==void 0?g.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==d)return n===null&&(n=new yo(i)),g=_?n.fromEquirectangular(u,g):n.fromCubemap(u,g),g.texture.pmremVersion=u.pmremVersion,t.set(u,g),g.texture;if(g!==void 0)return g.texture;{let T=u.image;return _&&T&&T.height>0||b&&T&&l(T)?(n===null&&(n=new yo(i)),g=_?n.fromEquirectangular(u):n.fromCubemap(u),g.texture.pmremVersion=u.pmremVersion,t.set(u,g),u.addEventListener("dispose",h),g.texture):null}}}return u}function o(u,p){return p===Ca?u.mapping=li:p===Ra&&(u.mapping=wi),u}function l(u){let p=0,_=6;for(let b=0;b<_;b++)u[b]!==void 0&&p++;return p===_}function c(u){let p=u.target;p.removeEventListener("dispose",c);let _=e.get(p);_!==void 0&&(e.delete(p),_.dispose())}function h(u){let p=u.target;p.removeEventListener("dispose",h);let _=t.get(p);_!==void 0&&(t.delete(p),_.dispose())}function f(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:f}}function Tp(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&bi("WebGLRenderer: "+n+" extension not supported."),s}}}function Ap(i,e,t,n){let s={},r=new WeakMap;function a(f){let u=f.target;u.index!==null&&e.remove(u.index);for(let _ in u.attributes)e.remove(u.attributes[_]);u.removeEventListener("dispose",a),delete s[u.id];let p=r.get(u);p&&(e.remove(p),r.delete(u)),n.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,t.memory.geometries--}function o(f,u){return s[u.id]===!0||(u.addEventListener("dispose",a),s[u.id]=!0,t.memory.geometries++),u}function l(f){let u=f.attributes;for(let p in u)e.update(u[p],i.ARRAY_BUFFER)}function c(f){let u=[],p=f.index,_=f.attributes.position,b=0;if(_===void 0)return;if(p!==null){let T=p.array;b=p.version;for(let I=0,v=T.length;I<v;I+=3){let M=T[I+0],w=T[I+1],C=T[I+2];u.push(M,w,w,C,C,M)}}else{let T=_.array;b=_.version;for(let I=0,v=T.length/3-1;I<v;I+=3){let M=I+0,w=I+1,C=I+2;u.push(M,w,w,C,C,M)}}let g=new(_.count>=65535?ks:Bs)(u,1);g.version=b;let d=r.get(f);d&&e.remove(d),r.set(f,g)}function h(f){let u=r.get(f);if(u){let p=f.index;p!==null&&u.version<p.version&&c(f)}else c(f);return r.get(f)}return{get:o,update:l,getWireframeAttribute:h}}function Cp(i,e,t){let n;function s(f){n=f}let r,a;function o(f){r=f.type,a=f.bytesPerElement}function l(f,u){i.drawElements(n,u,r,f*a),t.update(u,n,1)}function c(f,u,p){p!==0&&(i.drawElementsInstanced(n,u,r,f*a,p),t.update(u,n,p))}function h(f,u,p){if(p===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,u,0,r,f,0,p);let b=0;for(let g=0;g<p;g++)b+=u[g];t.update(b,n,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function Rp(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:Ne("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function Pp(i,e,t){let n=new WeakMap,s=new dt;function r(a,o,l){let c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,f=h!==void 0?h.length:0,u=n.get(o);if(u===void 0||u.count!==f){let E=function(){C.dispose(),n.delete(o),o.removeEventListener("dispose",E)};u!==void 0&&u.texture.dispose();let p=o.morphAttributes.position!==void 0,_=o.morphAttributes.normal!==void 0,b=o.morphAttributes.color!==void 0,g=o.morphAttributes.position||[],d=o.morphAttributes.normal||[],T=o.morphAttributes.color||[],I=0;p===!0&&(I=1),_===!0&&(I=2),b===!0&&(I=3);let v=o.attributes.position.count*I,M=1;v>e.maxTextureSize&&(M=Math.ceil(v/e.maxTextureSize),v=e.maxTextureSize);let w=new Float32Array(v*M*4*f),C=new Fs(w,v,M,f);C.type=fn,C.needsUpdate=!0;let y=I*4;for(let D=0;D<f;D++){let O=g[D],V=d[D],X=T[D],N=v*M*4*D;for(let H=0;H<O.count;H++){let K=H*y;p===!0&&(s.fromBufferAttribute(O,H),w[N+K+0]=s.x,w[N+K+1]=s.y,w[N+K+2]=s.z,w[N+K+3]=0),_===!0&&(s.fromBufferAttribute(V,H),w[N+K+4]=s.x,w[N+K+5]=s.y,w[N+K+6]=s.z,w[N+K+7]=0),b===!0&&(s.fromBufferAttribute(X,H),w[N+K+8]=s.x,w[N+K+9]=s.y,w[N+K+10]=s.z,w[N+K+11]=X.itemSize===4?s.w:1)}}u={count:f,texture:C,size:new Ue(v,M)},n.set(o,u),o.addEventListener("dispose",E)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let p=0;for(let b=0;b<c.length;b++)p+=c[b];let _=o.morphTargetsRelative?1:1-p;l.getUniforms().setValue(i,"morphTargetBaseInfluence",_),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",u.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",u.size)}return{update:r}}function Ip(i,e,t,n,s){let r=new WeakMap;function a(c){let h=s.render.frame,f=c.geometry,u=e.get(c,f);if(r.get(u)!==h&&(e.update(u),r.set(u,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){let p=c.skeleton;r.get(p)!==h&&(p.update(),r.set(p,h))}return u}function o(){r=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),n.releaseStatesOfObject(h),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:a,dispose:o}}var Lp={[bl]:"LINEAR_TONE_MAPPING",[Sl]:"REINHARD_TONE_MAPPING",[Ml]:"CINEON_TONE_MAPPING",[wl]:"ACES_FILMIC_TONE_MAPPING",[Tl]:"AGX_TONE_MAPPING",[Al]:"NEUTRAL_TONE_MAPPING",[El]:"CUSTOM_TONE_MAPPING"};function Dp(i,e,t,n,s,r){let a=new qt(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=new At;c.setAttribute("position",new xt([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new xt([0,2,0,0,2,0],2));let h=new ha({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),f=new Ct(c,h),u=new ls(-1,1,1,-1,0,1),p=null,_=null,b=!1,g,d=null,T=[],I=!1;this.setSize=function(v,M){a.setSize(v,M),o!==null&&o.setSize(v,M),l!==null&&l.setSize(v,M);for(let w=0;w<T.length;w++){let C=T[w];C.setSize&&C.setSize(v,M)}},this.setEffects=function(v){T=v,I=T.length>0&&T[0].isRenderPass===!0;let M=a.width,w=a.height;T.length>0&&o===null&&(o=new qt(M,w,{type:pn,depthBuffer:!1,stencilBuffer:!1}),l=new qt(M,w,{type:pn,depthBuffer:!1,stencilBuffer:!1}));for(let C=0;C<T.length;C++){let y=T[C];y.setSize&&y.setSize(M,w)}},this.begin=function(v,M){if(b||v.toneMapping===un&&T.length===0)return!1;if(d=M,M!==null){let w=M.width,C=M.height;(a.width!==w||a.height!==C)&&this.setSize(w,C)}return I===!1&&v.setRenderTarget(a),g=v.toneMapping,v.toneMapping=un,!0},this.hasRenderPass=function(){return I},this.end=function(v,M){v.toneMapping=g,b=!0;let w=a,C=o;for(let y=0;y<T.length;y++){let E=T[y];E.enabled!==!1&&(E.render(v,C,w,M),E.needsSwap!==!1&&(w=C,C=C===o?l:o))}if(p!==v.outputColorSpace||_!==v.toneMapping){p=v.outputColorSpace,_=v.toneMapping,h.defines={},$e.getTransfer(p)===Qe&&(h.defines.SRGB_TRANSFER="");let y=Lp[_];y&&(h.defines[y]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=w.texture,v.setRenderTarget(d),v.render(f,u),d=null,b=!1},this.isCompositing=function(){return b},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),c.dispose(),h.dispose()}}var Fu=new Wt,tc=new ti(1,1),Ou=new Fs,Bu=new ra,ku=new Gs,_u=[],xu=[],yu=new Float32Array(16),vu=new Float32Array(9),bu=new Float32Array(4);function xs(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=_u[s];if(r===void 0&&(r=new Float32Array(s),_u[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function bt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function St(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Mo(i,e){let t=xu[e];t===void 0&&(t=new Int32Array(e),xu[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function Np(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function Up(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(bt(t,e))return;i.uniform2fv(this.addr,e),St(t,e)}}function Fp(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(bt(t,e))return;i.uniform3fv(this.addr,e),St(t,e)}}function Op(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(bt(t,e))return;i.uniform4fv(this.addr,e),St(t,e)}}function Bp(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(bt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),St(t,e)}else{if(bt(t,n))return;bu.set(n),i.uniformMatrix2fv(this.addr,!1,bu),St(t,n)}}function kp(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(bt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),St(t,e)}else{if(bt(t,n))return;vu.set(n),i.uniformMatrix3fv(this.addr,!1,vu),St(t,n)}}function zp(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(bt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),St(t,e)}else{if(bt(t,n))return;yu.set(n),i.uniformMatrix4fv(this.addr,!1,yu),St(t,n)}}function Vp(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function Gp(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(bt(t,e))return;i.uniform2iv(this.addr,e),St(t,e)}}function Hp(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(bt(t,e))return;i.uniform3iv(this.addr,e),St(t,e)}}function Wp(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(bt(t,e))return;i.uniform4iv(this.addr,e),St(t,e)}}function Xp(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function qp(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(bt(t,e))return;i.uniform2uiv(this.addr,e),St(t,e)}}function Yp(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(bt(t,e))return;i.uniform3uiv(this.addr,e),St(t,e)}}function $p(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(bt(t,e))return;i.uniform4uiv(this.addr,e),St(t,e)}}function Zp(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(tc.compareFunction=t.isReversedDepthBuffer()?go:mo,r=tc):r=Fu,t.setTexture2D(e||r,s)}function Jp(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Bu,s)}function Kp(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||ku,s)}function jp(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||Ou,s)}function Qp(i){switch(i){case 5126:return Np;case 35664:return Up;case 35665:return Fp;case 35666:return Op;case 35674:return Bp;case 35675:return kp;case 35676:return zp;case 5124:case 35670:return Vp;case 35667:case 35671:return Gp;case 35668:case 35672:return Hp;case 35669:case 35673:return Wp;case 5125:return Xp;case 36294:return qp;case 36295:return Yp;case 36296:return $p;case 35678:case 36198:case 36298:case 36306:case 35682:return Zp;case 35679:case 36299:case 36307:return Jp;case 35680:case 36300:case 36308:case 36293:return Kp;case 36289:case 36303:case 36311:case 36292:return jp}}function e2(i,e){i.uniform1fv(this.addr,e)}function t2(i,e){let t=xs(e,this.size,2);i.uniform2fv(this.addr,t)}function n2(i,e){let t=xs(e,this.size,3);i.uniform3fv(this.addr,t)}function i2(i,e){let t=xs(e,this.size,4);i.uniform4fv(this.addr,t)}function s2(i,e){let t=xs(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function r2(i,e){let t=xs(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function a2(i,e){let t=xs(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function o2(i,e){i.uniform1iv(this.addr,e)}function l2(i,e){i.uniform2iv(this.addr,e)}function c2(i,e){i.uniform3iv(this.addr,e)}function h2(i,e){i.uniform4iv(this.addr,e)}function u2(i,e){i.uniform1uiv(this.addr,e)}function d2(i,e){i.uniform2uiv(this.addr,e)}function f2(i,e){i.uniform3uiv(this.addr,e)}function p2(i,e){i.uniform4uiv(this.addr,e)}function m2(i,e,t){let n=this.cache,s=e.length,r=Mo(t,s);bt(n,r)||(i.uniform1iv(this.addr,r),St(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=tc:a=Fu;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function g2(i,e,t){let n=this.cache,s=e.length,r=Mo(t,s);bt(n,r)||(i.uniform1iv(this.addr,r),St(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||Bu,r[a])}function _2(i,e,t){let n=this.cache,s=e.length,r=Mo(t,s);bt(n,r)||(i.uniform1iv(this.addr,r),St(n,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||ku,r[a])}function x2(i,e,t){let n=this.cache,s=e.length,r=Mo(t,s);bt(n,r)||(i.uniform1iv(this.addr,r),St(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||Ou,r[a])}function y2(i){switch(i){case 5126:return e2;case 35664:return t2;case 35665:return n2;case 35666:return i2;case 35674:return s2;case 35675:return r2;case 35676:return a2;case 5124:case 35670:return o2;case 35667:case 35671:return l2;case 35668:case 35672:return c2;case 35669:case 35673:return h2;case 5125:return u2;case 36294:return d2;case 36295:return f2;case 36296:return p2;case 35678:case 36198:case 36298:case 36306:case 35682:return m2;case 35679:case 36299:case 36307:return g2;case 35680:case 36300:case 36308:case 36293:return _2;case 36289:case 36303:case 36311:case 36292:return x2}}var nc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Qp(t.type)}},ic=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=y2(t.type)}},sc=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(e,t[o.id],n)}}},Ql=/(\w+)(\])?(\[|\.)?/g;function Su(i,e){i.seq.push(e),i.map[e.id]=e}function v2(i,e,t){let n=i.name,s=n.length;for(Ql.lastIndex=0;;){let r=Ql.exec(n),a=Ql.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){Su(t,c===void 0?new nc(o,i,e):new ic(o,i,e));break}else{let f=t.map[o];f===void 0&&(f=new sc(o),Su(t,f)),t=f}}}var _s=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);v2(o,l,this)}let s=[],r=[];for(let a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){let o=t[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let a=e[s];a.id in t&&n.push(a)}return n}};function Mu(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var b2=37297,S2=0;function M2(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}var wu=new Oe;function w2(i){$e._getMatrix(wu,$e.workingColorSpace,i);let e=`mat3( ${wu.elements.map(t=>t.toFixed(4))} )`;switch($e.getTransfer(i)){case Us:return[e,"LinearTransferOETF"];case Qe:return[e,"sRGBTransferOETF"];default:return Ie("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Eu(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+M2(i.getShaderSource(e),o)}else return r}function E2(i,e){let t=w2(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var T2={[bl]:"Linear",[Sl]:"Reinhard",[Ml]:"Cineon",[wl]:"ACESFilmic",[Tl]:"AgX",[Al]:"Neutral",[El]:"Custom"};function A2(i,e){let t=T2[e];return t===void 0?(Ie("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var xo=new U;function C2(){$e.getLuminanceCoefficients(xo);let i=xo.x.toFixed(4),e=xo.y.toFixed(4),t=xo.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function R2(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(hr).join(`
`)}function P2(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function I2(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function hr(i){return i!==""}function Tu(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Au(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var L2=/^[ \t]*#include +<([\w\d./]+)>/gm;function rc(i){return i.replace(L2,N2)}var D2=new Map;function N2(i,e){let t=Ge[e];if(t===void 0){let n=D2.get(e);if(n!==void 0)t=Ge[n],Ie('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return rc(t)}var U2=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Cu(i){return i.replace(U2,F2)}function F2(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Ru(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}var O2={[Qs]:"SHADOWMAP_TYPE_PCF",[hs]:"SHADOWMAP_TYPE_VSM"};function B2(i){return O2[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var k2={[li]:"ENVMAP_TYPE_CUBE",[wi]:"ENVMAP_TYPE_CUBE",[er]:"ENVMAP_TYPE_CUBE_UV"};function z2(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":k2[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var V2={[wi]:"ENVMAP_MODE_REFRACTION"};function G2(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":V2[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var H2={[Aa]:"ENVMAP_BLENDING_MULTIPLY",[qh]:"ENVMAP_BLENDING_MIX",[Yh]:"ENVMAP_BLENDING_ADD"};function W2(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":H2[i.combine]||"ENVMAP_BLENDING_NONE"}function X2(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function q2(i,e,t,n){let s=i.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,l=B2(t),c=z2(t),h=G2(t),f=W2(t),u=X2(t),p=R2(t),_=P2(r),b=s.createProgram(),g,d,T=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(hr).join(`
`),g.length>0&&(g+=`
`),d=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(hr).join(`
`),d.length>0&&(d+=`
`)):(g=[Ru(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(hr).join(`
`),d=[Ru(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+f:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==un?"#define TONE_MAPPING":"",t.toneMapping!==un?Ge.tonemapping_pars_fragment:"",t.toneMapping!==un?A2("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ge.colorspace_pars_fragment,E2("linearToOutputTexel",t.outputColorSpace),C2(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(hr).join(`
`)),a=rc(a),a=Tu(a,t),a=Au(a,t),o=rc(o),o=Tu(o,t),o=Au(o,t),a=Cu(a),o=Cu(o),t.isRawShaderMaterial!==!0&&(T=`#version 300 es
`,g=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,d=["#define varying in",t.glslVersion===Fl?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Fl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);let I=T+g+a,v=T+d+o,M=Mu(s,s.VERTEX_SHADER,I),w=Mu(s,s.FRAGMENT_SHADER,v);s.attachShader(b,M),s.attachShader(b,w),t.index0AttributeName!==void 0?s.bindAttribLocation(b,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(b,0,"position"),s.linkProgram(b);function C(O){if(i.debug.checkShaderErrors){let V=s.getProgramInfoLog(b)||"",X=s.getShaderInfoLog(M)||"",N=s.getShaderInfoLog(w)||"",H=V.trim(),K=X.trim(),Z=N.trim(),re=!0,Y=!0;if(s.getProgramParameter(b,s.LINK_STATUS)===!1)if(re=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,b,M,w);else{let te=Eu(s,M,"vertex"),F=Eu(s,w,"fragment");Ne("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(b,s.VALIDATE_STATUS)+`

Material Name: `+O.name+`
Material Type: `+O.type+`

Program Info Log: `+H+`
`+te+`
`+F)}else H!==""?Ie("WebGLProgram: Program Info Log:",H):(K===""||Z==="")&&(Y=!1);Y&&(O.diagnostics={runnable:re,programLog:H,vertexShader:{log:K,prefix:g},fragmentShader:{log:Z,prefix:d}})}s.deleteShader(M),s.deleteShader(w),y=new _s(s,b),E=I2(s,b)}let y;this.getUniforms=function(){return y===void 0&&C(this),y};let E;this.getAttributes=function(){return E===void 0&&C(this),E};let D=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return D===!1&&(D=s.getProgramParameter(b,b2)),D},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(b),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=S2++,this.cacheKey=e,this.usedTimes=1,this.program=b,this.vertexShader=M,this.fragmentShader=w,this}var Y2=0,ac=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new oc(e),t.set(e,n)),n}},oc=class{constructor(e){this.id=Y2++,this.code=e,this.usedTimes=0}};function $2(i){return i===ui||i===ar||i===or}function Z2(i,e,t,n,s,r){let a=new ts,o=new ac,l=new Set,c=[],h=new Map,f=n.logarithmicDepthBuffer,u=n.precision,p={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(y){return l.add(y),y===0?"uv":`uv${y}`}function b(y,E,D,O,V,X){let N=O.fog,H=V.geometry,K=y.isMeshStandardMaterial||y.isMeshLambertMaterial||y.isMeshPhongMaterial?O.environment:null,Z=y.isMeshStandardMaterial||y.isMeshLambertMaterial&&!y.envMap||y.isMeshPhongMaterial&&!y.envMap,re=e.get(y.envMap||K,Z),Y=re&&re.mapping===er?re.image.height:null,te=p[y.type];y.precision!==null&&(u=n.getMaxPrecision(y.precision),u!==y.precision&&Ie("WebGLProgram.getParameters:",y.precision,"not supported, using",u,"instead."));let F=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,ne=F!==void 0?F.length:0,ae=0;H.morphAttributes.position!==void 0&&(ae=1),H.morphAttributes.normal!==void 0&&(ae=2),H.morphAttributes.color!==void 0&&(ae=3);let Be,De,Fe,q;if(te){let at=wn[te];Be=at.vertexShader,De=at.fragmentShader}else{Be=y.vertexShader,De=y.fragmentShader;let at=o.getVertexShaderStage(y),Ke=o.getFragmentShaderStage(y);o.update(y,at,Ke),Fe=at.id,q=Ke.id}let j=i.getRenderTarget(),xe=i.state.buffers.depth.getReversed(),Pe=V.isInstancedMesh===!0,ye=V.isBatchedMesh===!0,ke=!!y.map,vt=!!y.matcap,Xe=!!re,Je=!!y.aoMap,rt=!!y.lightMap,Ye=!!y.bumpMap&&y.wireframe===!1,ut=!!y.normalMap,wt=!!y.displacementMap,Xt=!!y.emissiveMap,ft=!!y.metalnessMap,mt=!!y.roughnessMap,L=y.anisotropy>0,Nt=y.clearcoat>0,et=y.dispersion>0,S=y.retroreflectivity>0,m=y.iridescence>0,B=y.sheen>0,G=y.transmission>0,$=L&&!!y.anisotropyMap,le=Nt&&!!y.clearcoatMap,ce=Nt&&!!y.clearcoatNormalMap,J=Nt&&!!y.clearcoatRoughnessMap,ee=m&&!!y.iridescenceMap,he=m&&!!y.iridescenceThicknessMap,Ae=B&&!!y.sheenColorMap,pe=B&&!!y.sheenRoughnessMap,ue=!!y.specularMap,Ce=!!y.specularColorMap,Le=!!y.specularIntensityMap,ze=G&&!!y.transmissionMap,P=G&&!!y.thicknessMap,de=!!y.gradientMap,Q=!!y.alphaMap,fe=y.alphaTest>0,ve=!!y.alphaHash,se=!!y.extensions,Re=un;y.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(Re=i.toneMapping);let Ee={shaderID:te,shaderType:y.type,shaderName:y.name,vertexShader:Be,fragmentShader:De,defines:y.defines,customVertexShaderID:Fe,customFragmentShaderID:q,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:u,batching:ye,batchingColor:ye&&V._colorsTexture!==null,instancing:Pe,instancingColor:Pe&&V.instanceColor!==null,instancingMorph:Pe&&V.morphTexture!==null,outputColorSpace:j===null?i.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:$e.workingColorSpace,alphaToCoverage:!!y.alphaToCoverage,map:ke,matcap:vt,envMap:Xe,envMapMode:Xe&&re.mapping,envMapCubeUVHeight:Y,aoMap:Je,lightMap:rt,bumpMap:Ye,normalMap:ut,displacementMap:wt,emissiveMap:Xt,normalMapObjectSpace:ut&&y.normalMapType===Jh,normalMapTangentSpace:ut&&y.normalMapType===po,packedNormalMap:ut&&y.normalMapType===po&&$2(y.normalMap.format),metalnessMap:ft,roughnessMap:mt,anisotropy:L,anisotropyMap:$,clearcoat:Nt,clearcoatMap:le,clearcoatNormalMap:ce,clearcoatRoughnessMap:J,dispersion:et,retroreflection:S,iridescence:m,iridescenceMap:ee,iridescenceThicknessMap:he,sheen:B,sheenColorMap:Ae,sheenRoughnessMap:pe,specularMap:ue,specularColorMap:Ce,specularIntensityMap:Le,transmission:G,transmissionMap:ze,thicknessMap:P,gradientMap:de,opaque:y.transparent===!1&&y.blending===us&&y.alphaToCoverage===!1,alphaMap:Q,alphaTest:fe,alphaHash:ve,combine:y.combine,mapUv:ke&&_(y.map.channel),aoMapUv:Je&&_(y.aoMap.channel),lightMapUv:rt&&_(y.lightMap.channel),bumpMapUv:Ye&&_(y.bumpMap.channel),normalMapUv:ut&&_(y.normalMap.channel),displacementMapUv:wt&&_(y.displacementMap.channel),emissiveMapUv:Xt&&_(y.emissiveMap.channel),metalnessMapUv:ft&&_(y.metalnessMap.channel),roughnessMapUv:mt&&_(y.roughnessMap.channel),anisotropyMapUv:$&&_(y.anisotropyMap.channel),clearcoatMapUv:le&&_(y.clearcoatMap.channel),clearcoatNormalMapUv:ce&&_(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:J&&_(y.clearcoatRoughnessMap.channel),iridescenceMapUv:ee&&_(y.iridescenceMap.channel),iridescenceThicknessMapUv:he&&_(y.iridescenceThicknessMap.channel),sheenColorMapUv:Ae&&_(y.sheenColorMap.channel),sheenRoughnessMapUv:pe&&_(y.sheenRoughnessMap.channel),specularMapUv:ue&&_(y.specularMap.channel),specularColorMapUv:Ce&&_(y.specularColorMap.channel),specularIntensityMapUv:Le&&_(y.specularIntensityMap.channel),transmissionMapUv:ze&&_(y.transmissionMap.channel),thicknessMapUv:P&&_(y.thicknessMap.channel),alphaMapUv:Q&&_(y.alphaMap.channel),vertexTangents:!!H.attributes.tangent&&(ut||L),vertexNormals:!!H.attributes.normal,vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,pointsUvs:V.isPoints===!0&&!!H.attributes.uv&&(ke||Q),fog:!!N,useFog:y.fog===!0,fogExp2:!!N&&N.isFogExp2,flatShading:y.wireframe===!1&&(y.flatShading===!0||H.attributes.normal===void 0&&ut===!1&&(y.isMeshLambertMaterial||y.isMeshPhongMaterial||y.isMeshStandardMaterial||y.isMeshPhysicalMaterial)),sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:f,reversedDepthBuffer:xe,skinning:V.isSkinnedMesh===!0,hasPositionAttribute:H.attributes.position!==void 0,morphTargets:H.morphAttributes.position!==void 0,morphNormals:H.morphAttributes.normal!==void 0,morphColors:H.morphAttributes.color!==void 0,morphTargetsCount:ne,morphTextureStride:ae,numSunLights:E.sun.length,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numSunLightShadows:E.sunShadowMap.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numLightProbeGrids:X.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:y.dithering,shadowMapEnabled:i.shadowMap.enabled&&D.length>0,shadowMapType:i.shadowMap.type,toneMapping:Re,decodeVideoTexture:ke&&y.map.isVideoTexture===!0&&$e.getTransfer(y.map.colorSpace)===Qe,decodeVideoTextureEmissive:Xt&&y.emissiveMap.isVideoTexture===!0&&$e.getTransfer(y.emissiveMap.colorSpace)===Qe,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===bn,flipSided:y.side===Lt,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionClipCullDistance:se&&y.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(se&&y.extensions.multiDraw===!0||ye)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()};return Ee.vertexUv1s=l.has(1),Ee.vertexUv2s=l.has(2),Ee.vertexUv3s=l.has(3),l.clear(),Ee}function g(y){let E=[];if(y.shaderID?E.push(y.shaderID):(E.push(y.customVertexShaderID),E.push(y.customFragmentShaderID)),y.defines!==void 0)for(let D in y.defines)E.push(D),E.push(y.defines[D]);return y.isRawShaderMaterial===!1&&(d(E,y),T(E,y),E.push(i.outputColorSpace)),E.push(y.customProgramCacheKey),E.join()}function d(y,E){y.push(E.precision),y.push(E.outputColorSpace),y.push(E.envMapMode),y.push(E.envMapCubeUVHeight),y.push(E.mapUv),y.push(E.alphaMapUv),y.push(E.lightMapUv),y.push(E.aoMapUv),y.push(E.bumpMapUv),y.push(E.normalMapUv),y.push(E.displacementMapUv),y.push(E.emissiveMapUv),y.push(E.metalnessMapUv),y.push(E.roughnessMapUv),y.push(E.anisotropyMapUv),y.push(E.clearcoatMapUv),y.push(E.clearcoatNormalMapUv),y.push(E.clearcoatRoughnessMapUv),y.push(E.iridescenceMapUv),y.push(E.iridescenceThicknessMapUv),y.push(E.sheenColorMapUv),y.push(E.sheenRoughnessMapUv),y.push(E.specularMapUv),y.push(E.specularColorMapUv),y.push(E.specularIntensityMapUv),y.push(E.transmissionMapUv),y.push(E.thicknessMapUv),y.push(E.combine),y.push(E.fogExp2),y.push(E.sizeAttenuation),y.push(E.morphTargetsCount),y.push(E.morphAttributeCount),y.push(E.numSunLights),y.push(E.numDirLights),y.push(E.numPointLights),y.push(E.numSpotLights),y.push(E.numSpotLightMaps),y.push(E.numHemiLights),y.push(E.numRectAreaLights),y.push(E.numSunLightShadows),y.push(E.numDirLightShadows),y.push(E.numPointLightShadows),y.push(E.numSpotLightShadows),y.push(E.numSpotLightShadowsWithMaps),y.push(E.numLightProbes),y.push(E.shadowMapType),y.push(E.toneMapping),y.push(E.numClippingPlanes),y.push(E.numClipIntersection),y.push(E.depthPacking)}function T(y,E){a.disableAll(),E.instancing&&a.enable(0),E.instancingColor&&a.enable(1),E.instancingMorph&&a.enable(2),E.matcap&&a.enable(3),E.envMap&&a.enable(4),E.normalMapObjectSpace&&a.enable(5),E.normalMapTangentSpace&&a.enable(6),E.clearcoat&&a.enable(7),E.iridescence&&a.enable(8),E.alphaTest&&a.enable(9),E.vertexColors&&a.enable(10),E.vertexAlphas&&a.enable(11),E.vertexUv1s&&a.enable(12),E.vertexUv2s&&a.enable(13),E.vertexUv3s&&a.enable(14),E.vertexTangents&&a.enable(15),E.anisotropy&&a.enable(16),E.alphaHash&&a.enable(17),E.batching&&a.enable(18),E.dispersion&&a.enable(19),E.retroreflection&&a.enable(24),E.batchingColor&&a.enable(20),E.gradientMap&&a.enable(21),E.packedNormalMap&&a.enable(22),E.vertexNormals&&a.enable(23),y.push(a.mask),a.disableAll(),E.fog&&a.enable(0),E.useFog&&a.enable(1),E.flatShading&&a.enable(2),E.logarithmicDepthBuffer&&a.enable(3),E.reversedDepthBuffer&&a.enable(4),E.skinning&&a.enable(5),E.morphTargets&&a.enable(6),E.morphNormals&&a.enable(7),E.morphColors&&a.enable(8),E.premultipliedAlpha&&a.enable(9),E.shadowMapEnabled&&a.enable(10),E.doubleSided&&a.enable(11),E.flipSided&&a.enable(12),E.useDepthPacking&&a.enable(13),E.dithering&&a.enable(14),E.transmission&&a.enable(15),E.sheen&&a.enable(16),E.opaque&&a.enable(17),E.pointsUvs&&a.enable(18),E.decodeVideoTexture&&a.enable(19),E.decodeVideoTextureEmissive&&a.enable(20),E.alphaToCoverage&&a.enable(21),E.numLightProbeGrids>0&&a.enable(22),E.hasPositionAttribute&&a.enable(23),y.push(a.mask)}function I(y){let E=p[y.type],D;if(E){let O=wn[E];D=hu.clone(O.uniforms)}else D=y.uniforms;return D}function v(y,E){let D=h.get(E);return D!==void 0?++D.usedTimes:(D=new q2(i,E,y,s),c.push(D),h.set(E,D)),D}function M(y){if(--y.usedTimes===0){let E=c.indexOf(y);c[E]=c[c.length-1],c.pop(),h.delete(y.cacheKey),y.destroy()}}function w(y){o.remove(y)}function C(){o.dispose()}return{getParameters:b,getProgramCacheKey:g,getUniforms:I,acquireProgram:v,releaseProgram:M,releaseShaderCache:w,programs:c,dispose:C}}function J2(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function K2(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function Pu(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Iu(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(u){let p=0;return u.isInstancedMesh&&(p+=2),u.isSkinnedMesh&&(p+=1),p}function o(u,p,_,b,g,d){let T=i[e];return T===void 0?(T={id:u.id,object:u,geometry:p,material:_,materialVariant:a(u),groupOrder:b,renderOrder:u.renderOrder,z:g,group:d},i[e]=T):(T.id=u.id,T.object=u,T.geometry=p,T.material=_,T.materialVariant=a(u),T.groupOrder=b,T.renderOrder=u.renderOrder,T.z=g,T.group=d),e++,T}function l(u,p,_,b,g,d,T){T.reversedDepth===!0&&(g=-g);let I=o(u,p,_,b,g,d);_.transmission>0?n.push(I):_.transparent===!0?s.push(I):t.push(I)}function c(u,p,_,b,g,d){let T=o(u,p,_,b,g,d);_.transmission>0?n.unshift(T):_.transparent===!0?s.unshift(T):t.unshift(T)}function h(u,p){t.length>1&&t.sort(u||K2),n.length>1&&n.sort(p||Pu),s.length>1&&s.sort(p||Pu)}function f(){for(let u=e,p=i.length;u<p;u++){let _=i[u];if(_.id===null)break;_.id=null,_.object=null,_.geometry=null,_.material=null,_.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:f,sort:h}}function j2(){let i=new WeakMap;function e(n,s){let r=i.get(n),a;return r===void 0?(a=new Iu,i.set(n,[a])):s>=r.length?(a=new Iu,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function Q2(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new U,color:new He};break;case"SpotLight":t={position:new U,direction:new U,color:new He,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new U,color:new He,distance:0,decay:0};break;case"HemisphereLight":t={direction:new U,skyColor:new He,groundColor:new He};break;case"RectAreaLight":t={color:new He,position:new U,halfWidth:new U,halfHeight:new U};break}return i[e.id]=t,t}}}function em(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ue};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ue};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ue,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var tm=0;function nm(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function im(i){let e=new Q2,t=em(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new U);let s=new U,r=new lt,a=new lt;function o(c){let h=0,f=0,u=0;for(let V=0;V<9;V++)n.probe[V].set(0,0,0);let p=0,_=0,b=0,g=0,d=0,T=0,I=0,v=0,M=0,w=0,C=0,y=0,E=0,D=0;c.sort(nm);for(let V=0,X=c.length;V<X;V++){let N=c[V],H=N.color,K=N.intensity,Z=N.distance,re=null;if(N.shadow&&N.shadow.map&&(N.shadow.map.texture.format===ui?re=N.shadow.map.texture:re=N.shadow.map.depthTexture||N.shadow.map.texture),N.isAmbientLight)h+=H.r*K,f+=H.g*K,u+=H.b*K;else if(N.isLightProbe){for(let Y=0;Y<9;Y++)n.probe[Y].addScaledVector(N.sh.coefficients[Y],K);D++}else if(N.isSunLight){let Y=e.get(N);if(Y.color.copy(N.color).multiplyScalar(N.intensity),N.castShadow){let te=N.shadow,F=t.get(N);F.shadowIntensity=te.intensity,F.shadowBias=te.bias,F.shadowNormalBias=te.normalBias,F.shadowRadius=te.radius,F.shadowMapSize.copy(te.mapSize).multiply(te.getFrameExtents()),n.sunShadow[_]=F,n.sunShadowMap[_]=re;let ne=te.getViewportCount();for(let ae=0;ae<ne;ae++)n.sunShadowMatrix[b+ae]=te.getMatrix(ae),n.sunShadowCascade[b+ae]=te._cascadeData[ae];b+=ne,_++}n.sun[p]=Y,p++}else if(N.isDirectionalLight){let Y=e.get(N);if(Y.color.copy(N.color).multiplyScalar(N.intensity),N.castShadow){let te=N.shadow,F=t.get(N);F.shadowIntensity=te.intensity,F.shadowBias=te.bias,F.shadowNormalBias=te.normalBias,F.shadowRadius=te.radius,F.shadowMapSize=te.mapSize,n.directionalShadow[g]=F,n.directionalShadowMap[g]=re,n.directionalShadowMatrix[g]=N.shadow.matrix,M++}n.directional[g]=Y,g++}else if(N.isSpotLight){let Y=e.get(N);Y.position.setFromMatrixPosition(N.matrixWorld),Y.color.copy(H).multiplyScalar(K),Y.distance=Z,Y.coneCos=Math.cos(N.angle),Y.penumbraCos=Math.cos(N.angle*(1-N.penumbra)),Y.decay=N.decay,n.spot[T]=Y;let te=N.shadow;if(N.map&&(n.spotLightMap[y]=N.map,y++,te.updateMatrices(N),N.castShadow&&E++),n.spotLightMatrix[T]=te.matrix,N.castShadow){let F=t.get(N);F.shadowIntensity=te.intensity,F.shadowBias=te.bias,F.shadowNormalBias=te.normalBias,F.shadowRadius=te.radius,F.shadowMapSize=te.mapSize,n.spotShadow[T]=F,n.spotShadowMap[T]=re,C++}T++}else if(N.isRectAreaLight){let Y=e.get(N);Y.color.copy(H).multiplyScalar(K),Y.halfWidth.set(N.width*.5,0,0),Y.halfHeight.set(0,N.height*.5,0),n.rectArea[I]=Y,I++}else if(N.isPointLight){let Y=e.get(N);if(Y.color.copy(N.color).multiplyScalar(N.intensity),Y.distance=N.distance,Y.decay=N.decay,N.castShadow){let te=N.shadow,F=t.get(N);F.shadowIntensity=te.intensity,F.shadowBias=te.bias,F.shadowNormalBias=te.normalBias,F.shadowRadius=te.radius,F.shadowMapSize=te.mapSize,F.shadowCameraNear=te.camera.near,F.shadowCameraFar=te.camera.far,n.pointShadow[d]=F,n.pointShadowMap[d]=re,n.pointShadowMatrix[d]=N.shadow.matrix,w++}n.point[d]=Y,d++}else if(N.isHemisphereLight){let Y=e.get(N);Y.skyColor.copy(N.color).multiplyScalar(K),Y.groundColor.copy(N.groundColor).multiplyScalar(K),n.hemi[v]=Y,v++}}I>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=me.LTC_FLOAT_1,n.rectAreaLTC2=me.LTC_FLOAT_2):(n.rectAreaLTC1=me.LTC_HALF_1,n.rectAreaLTC2=me.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=f,n.ambient[2]=u;let O=n.hash;(O.sunLength!==p||O.directionalLength!==g||O.pointLength!==d||O.spotLength!==T||O.rectAreaLength!==I||O.hemiLength!==v||O.numSunShadows!==_||O.numDirectionalShadows!==M||O.numPointShadows!==w||O.numSpotShadows!==C||O.numSpotMaps!==y||O.numLightProbes!==D)&&(n.sun.length=p,n.directional.length=g,n.spot.length=T,n.rectArea.length=I,n.point.length=d,n.hemi.length=v,n.sunShadow.length=_,n.sunShadowMap.length=_,n.sunShadowMatrix.length=b,n.sunShadowCascade.length=b,n.directionalShadow.length=M,n.directionalShadowMap.length=M,n.directionalShadowMatrix.length=M,n.pointShadow.length=w,n.pointShadowMap.length=w,n.pointShadowMatrix.length=w,n.spotShadow.length=C,n.spotShadowMap.length=C,n.spotLightMatrix.length=C+y-E,n.spotLightMap.length=y,n.numSpotLightShadowsWithMaps=E,n.numLightProbes=D,O.sunLength=p,O.directionalLength=g,O.pointLength=d,O.spotLength=T,O.rectAreaLength=I,O.hemiLength=v,O.numSunShadows=_,O.numDirectionalShadows=M,O.numPointShadows=w,O.numSpotShadows=C,O.numSpotMaps=y,O.numLightProbes=D,n.version=tm++)}function l(c,h){let f=0,u=0,p=0,_=0,b=0,g=0,d=h.matrixWorldInverse;for(let T=0,I=c.length;T<I;T++){let v=c[T];if(v.isSunLight){let M=n.sun[f];M.direction.setFromMatrixPosition(v.matrixWorld),M.direction.transformDirection(d),f++}else if(v.isDirectionalLight){let M=n.directional[u];M.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(d),u++}else if(v.isSpotLight){let M=n.spot[_];M.position.setFromMatrixPosition(v.matrixWorld),M.position.applyMatrix4(d),M.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(d),_++}else if(v.isRectAreaLight){let M=n.rectArea[b];M.position.setFromMatrixPosition(v.matrixWorld),M.position.applyMatrix4(d),a.identity(),r.copy(v.matrixWorld),r.premultiply(d),a.extractRotation(r),M.halfWidth.set(v.width*.5,0,0),M.halfHeight.set(0,v.height*.5,0),M.halfWidth.applyMatrix4(a),M.halfHeight.applyMatrix4(a),b++}else if(v.isPointLight){let M=n.point[p];M.position.setFromMatrixPosition(v.matrixWorld),M.position.applyMatrix4(d),p++}else if(v.isHemisphereLight){let M=n.hemi[g];M.direction.setFromMatrixPosition(v.matrixWorld),M.direction.transformDirection(d),g++}}}return{setup:o,setupView:l,state:n}}function Lu(i){let e=new im(i),t=[],n=[],s=[];function r(u){f.camera=u,t.length=0,n.length=0,s.length=0}function a(u){t.push(u)}function o(u){n.push(u)}function l(u){s.push(u)}function c(){e.setup(t)}function h(u){e.setupView(t,u)}let f={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:f,setupLights:c,setupLightsView:h,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function sm(i){let e=new WeakMap;function t(s,r=0){let a=e.get(s),o;return a===void 0?(o=new Lu(i),e.set(s,[o])):r>=a.length?(o=new Lu(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}var rm=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,am=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,om=[new U(1,0,0),new U(-1,0,0),new U(0,1,0),new U(0,-1,0),new U(0,0,1),new U(0,0,-1)],lm=[new U(0,-1,0),new U(0,-1,0),new U(0,0,1),new U(0,0,-1),new U(0,-1,0),new U(0,-1,0)],Du=new lt,cr=new U,ec=new U;function cm(i,e,t){let n=new is,s=new Ue,r=new Ue,a=new dt,o=new ua,l=new da,c={},h=t.maxTextureSize,f={[oi]:Lt,[Lt]:oi,[bn]:bn},u=new Qt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ue},radius:{value:4}},vertexShader:rm,fragmentShader:am}),p=u.clone();p.defines.HORIZONTAL_PASS=1;let _=new At;_.setAttribute("position",new Ht(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let b=new Ct(_,u),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Qs;let d=this.type;this.render=function(w,C,y){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||w.length===0)return;this.type===Ah&&(Ie("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Qs);let E=i.getRenderTarget(),D=i.getActiveCubeFace(),O=i.getActiveMipmapLevel(),V=i.state;V.setBlending(Sn),V.buffers.depth.getReversed()===!0?V.buffers.color.setClear(0,0,0,0):V.buffers.color.setClear(1,1,1,1),V.buffers.depth.setTest(!0),V.setScissorTest(!1);let X=d!==this.type;X&&C.traverse(function(N){N.material&&(Array.isArray(N.material)?N.material.forEach(H=>H.needsUpdate=!0):N.material.needsUpdate=!0)});for(let N=0,H=w.length;N<H;N++){let K=w[N],Z=K.shadow;if(Z===void 0){Ie("WebGLShadowMap:",K,"has no shadow.");continue}if(Z.autoUpdate===!1&&Z.needsUpdate===!1)continue;s.copy(Z.mapSize);let re=Z.getFrameExtents();s.multiply(re),r.copy(Z.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/re.x),s.x=r.x*re.x,Z.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/re.y),s.y=r.y*re.y,Z.mapSize.y=r.y));let Y=i.state.buffers.depth.getReversed();if(Z.camera._reversedDepth=Y,Z.map===null||X===!0){if(Z.map!==null&&(Z.map.depthTexture!==null&&(Z.map.depthTexture.dispose(),Z.map.depthTexture=null),Z.map.dispose()),this.type===hs){if(K.isPointLight){Ie("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}Z.map=new qt(s.x,s.y,{format:ui,type:pn,minFilter:Pt,magFilter:Pt,generateMipmaps:!1}),Z.map.texture.name=K.name+".shadowMap",Z.map.depthTexture=new ti(s.x,s.y,fn),Z.map.depthTexture.name=K.name+".shadowMapDepth",Z.map.depthTexture.format=yn,Z.map.depthTexture.compareFunction=null,Z.map.depthTexture.minFilter=Tt,Z.map.depthTexture.magFilter=Tt}else K.isPointLight?(Z.map=new vo(s.x),Z.map.depthTexture=new ca(s.x,dn)):(Z.map=new qt(s.x,s.y),Z.map.depthTexture=new ti(s.x,s.y,dn)),Z.map.depthTexture.name=K.name+".shadowMap",Z.map.depthTexture.format=yn,this.type===Qs?(Z.map.depthTexture.compareFunction=Y?go:mo,Z.map.depthTexture.minFilter=Pt,Z.map.depthTexture.magFilter=Pt):(Z.map.depthTexture.compareFunction=null,Z.map.depthTexture.minFilter=Tt,Z.map.depthTexture.magFilter=Tt);Z.camera.updateProjectionMatrix()}Z.map.isWebGLCubeRenderTarget!==!0&&(Z.map.width!==s.x||Z.map.height!==s.y)&&Z.map.setSize(s.x,s.y);let te=Z.map.isWebGLCubeRenderTarget?6:Z.getViewportCount();K.isPointLight!==!0&&Z.updateMatrices(K,y);for(let F=0;F<te;F++){let ne=Z.getCamera(F);if(K.isPointLight){let ae=Z.camera,Be=Z.matrix,De=K.distance||ae.far;De!==ae.far&&(ae.far=De,ae.updateProjectionMatrix()),cr.setFromMatrixPosition(K.matrixWorld),ae.position.copy(cr),ec.copy(ae.position),ec.add(om[F]),ae.up.copy(lm[F]),ae.lookAt(ec),ae.updateMatrixWorld(),Be.makeTranslation(-cr.x,-cr.y,-cr.z),Du.multiplyMatrices(ae.projectionMatrix,ae.matrixWorldInverse),Z._frustum.setFromProjectionMatrix(Du,ae.coordinateSystem,ae.reversedDepth)}if(Z.map.isWebGLCubeRenderTarget)i.setRenderTarget(Z.map,F),i.clear();else{F===0&&(i.setRenderTarget(Z.map),i.clear());let ae=Z.getViewport(F);a.set(r.x*ae.x,r.y*ae.y,r.x*ae.z,r.y*ae.w),V.viewport(a)}n=Z.getFrustum(F),v(C,y,ne,K,this.type)}Z.isPointLightShadow!==!0&&this.type===hs&&T(Z,y),Z.needsUpdate=!1}d=this.type,g.needsUpdate=!1,i.setRenderTarget(E,D,O)};function T(w,C){let y=e.update(b);u.defines.VSM_SAMPLES!==w.blurSamples&&(u.defines.VSM_SAMPLES=w.blurSamples,p.defines.VSM_SAMPLES=w.blurSamples,u.needsUpdate=!0,p.needsUpdate=!0),w.mapPass===null?w.mapPass=new qt(s.x,s.y,{format:ui,type:pn}):(w.mapPass.width!==w.map.width||w.mapPass.height!==w.map.height)&&w.mapPass.setSize(w.map.width,w.map.height),u.uniforms.shadow_pass.value=w.map.depthTexture,u.uniforms.resolution.value.set(w.map.width,w.map.height),u.uniforms.radius.value=w.radius,i.setRenderTarget(w.mapPass),i.clear(),i.renderBufferDirect(C,null,y,u,b,null),p.uniforms.shadow_pass.value=w.mapPass.texture,p.uniforms.resolution.value.set(w.map.width,w.map.height),p.uniforms.radius.value=w.radius,i.setRenderTarget(w.map),i.clear(),i.renderBufferDirect(C,null,y,p,b,null)}function I(w,C,y,E){let D=null,O=y.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(O!==void 0)D=O;else if(D=y.isPointLight===!0?l:o,i.localClippingEnabled&&C.clipShadows===!0&&Array.isArray(C.clippingPlanes)&&C.clippingPlanes.length!==0||C.displacementMap&&C.displacementScale!==0||C.alphaMap&&C.alphaTest>0||C.map&&C.alphaTest>0||C.alphaToCoverage===!0){let V=D.uuid,X=C.uuid,N=c[V];N===void 0&&(N={},c[V]=N);let H=N[X];H===void 0&&(H=D.clone(),N[X]=H,C.addEventListener("dispose",M)),D=H}if(D.visible=C.visible,D.wireframe=C.wireframe,E===hs?D.side=C.shadowSide!==null?C.shadowSide:C.side:D.side=C.shadowSide!==null?C.shadowSide:f[C.side],D.alphaMap=C.alphaMap,D.alphaTest=C.alphaToCoverage===!0?.5:C.alphaTest,D.map=C.map,D.clipShadows=C.clipShadows,D.clippingPlanes=C.clippingPlanes,D.clipIntersection=C.clipIntersection,D.displacementMap=C.displacementMap,D.displacementScale=C.displacementScale,D.displacementBias=C.displacementBias,D.wireframeLinewidth=C.wireframeLinewidth,D.linewidth=C.linewidth,y.isPointLight===!0&&D.isMeshDistanceMaterial===!0){let V=i.properties.get(D);V.light=y}return D}function v(w,C,y,E,D){if(w.visible===!1)return;if(w.layers.test(C.layers)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&D===hs)&&(!w.frustumCulled||w.intersectsFrustum(n))){w.modelViewMatrix.multiplyMatrices(y.matrixWorldInverse,w.matrixWorld);let X=e.update(w),N=w.material;if(Array.isArray(N)){let H=X.groups;for(let K=0,Z=H.length;K<Z;K++){let re=H[K],Y=N[re.materialIndex];if(Y&&Y.visible){let te=I(w,Y,E,D);w.onBeforeShadow(i,w,C,y,X,te,re),i.renderBufferDirect(y,null,X,te,w,re),w.onAfterShadow(i,w,C,y,X,te,re)}}}else if(N.visible){let H=I(w,N,E,D);w.onBeforeShadow(i,w,C,y,X,H,null),i.renderBufferDirect(y,null,X,H,w,null),w.onAfterShadow(i,w,C,y,X,H,null)}}let V=w.children;for(let X=0,N=V.length;X<N;X++)v(V[X],C,y,E,D)}function M(w){w.target.removeEventListener("dispose",M);for(let y in c){let E=c[y],D=w.target.uuid;D in E&&(E[D].dispose(),delete E[D])}}}function hm(i,e){function t(){let P=!1,de=new dt,Q=null,fe=new dt(0,0,0,0);return{setMask:function(ve){Q!==ve&&!P&&(i.colorMask(ve,ve,ve,ve),Q=ve)},setLocked:function(ve){P=ve},setClear:function(ve,se,Re,Ee,at){at===!0&&(ve*=Ee,se*=Ee,Re*=Ee),de.set(ve,se,Re,Ee),fe.equals(de)===!1&&(i.clearColor(ve,se,Re,Ee),fe.copy(de))},reset:function(){P=!1,Q=null,fe.set(-1,0,0,0)}}}function n(){let P=!1,de=!1,Q=null,fe=null,ve=null;return{setReversed:function(se){if(de!==se){let Re=e.get("EXT_clip_control");se?Re.clipControlEXT(Re.LOWER_LEFT_EXT,Re.ZERO_TO_ONE_EXT):Re.clipControlEXT(Re.LOWER_LEFT_EXT,Re.NEGATIVE_ONE_TO_ONE_EXT),de=se;let Ee=ve;ve=null,this.setClear(Ee)}},getReversed:function(){return de},setTest:function(se){se?j(i.DEPTH_TEST):xe(i.DEPTH_TEST)},setMask:function(se){Q!==se&&!P&&(i.depthMask(se),Q=se)},setFunc:function(se){if(de&&(se=lu[se]),fe!==se){switch(se){case Yr:i.depthFunc(i.NEVER);break;case $r:i.depthFunc(i.ALWAYS);break;case Zr:i.depthFunc(i.LESS);break;case Zi:i.depthFunc(i.LEQUAL);break;case Jr:i.depthFunc(i.EQUAL);break;case Kr:i.depthFunc(i.GEQUAL);break;case jr:i.depthFunc(i.GREATER);break;case Qr:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}fe=se}},setLocked:function(se){P=se},setClear:function(se){ve!==se&&(ve=se,de&&(se=1-se),i.clearDepth(se))},reset:function(){P=!1,Q=null,fe=null,ve=null,de=!1}}}function s(){let P=!1,de=null,Q=null,fe=null,ve=null,se=null,Re=null,Ee=null,at=null;return{setTest:function(Ke){P||(Ke?j(i.STENCIL_TEST):xe(i.STENCIL_TEST))},setMask:function(Ke){de!==Ke&&!P&&(i.stencilMask(Ke),de=Ke)},setFunc:function(Ke,rn,mn){(Q!==Ke||fe!==rn||ve!==mn)&&(i.stencilFunc(Ke,rn,mn),Q=Ke,fe=rn,ve=mn)},setOp:function(Ke,rn,mn){(se!==Ke||Re!==rn||Ee!==mn)&&(i.stencilOp(Ke,rn,mn),se=Ke,Re=rn,Ee=mn)},setLocked:function(Ke){P=Ke},setClear:function(Ke){at!==Ke&&(i.clearStencil(Ke),at=Ke)},reset:function(){P=!1,de=null,Q=null,fe=null,ve=null,se=null,Re=null,Ee=null,at=null}}}let r=new t,a=new n,o=new s,l=new WeakMap,c=new WeakMap,h={},f={},u={},p=new WeakMap,_=[],b=null,g=!1,d=null,T=null,I=null,v=null,M=null,w=null,C=null,y=new He(0,0,0),E=0,D=!1,O=null,V=null,X=null,N=null,H=null,K=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),Z=!1,re=0,Y=i.getParameter(i.VERSION);Y.indexOf("WebGL")!==-1?(re=parseFloat(/^WebGL (\d)/.exec(Y)[1]),Z=re>=1):Y.indexOf("OpenGL ES")!==-1&&(re=parseFloat(/^OpenGL ES (\d)/.exec(Y)[1]),Z=re>=2);let te=null,F={},ne=i.getParameter(i.SCISSOR_BOX),ae=i.getParameter(i.VIEWPORT),Be=new dt().fromArray(ne),De=new dt().fromArray(ae);function Fe(P,de,Q,fe){let ve=new Uint8Array(4),se=i.createTexture();i.bindTexture(P,se),i.texParameteri(P,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(P,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Re=0;Re<Q;Re++)P===i.TEXTURE_3D||P===i.TEXTURE_2D_ARRAY?i.texImage3D(de,0,i.RGBA,1,1,fe,0,i.RGBA,i.UNSIGNED_BYTE,ve):i.texImage2D(de+Re,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ve);return se}let q={};q[i.TEXTURE_2D]=Fe(i.TEXTURE_2D,i.TEXTURE_2D,1),q[i.TEXTURE_CUBE_MAP]=Fe(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),q[i.TEXTURE_2D_ARRAY]=Fe(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),q[i.TEXTURE_3D]=Fe(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),j(i.DEPTH_TEST),a.setFunc(Zi),Ye(!1),ut(ml),j(i.CULL_FACE),Je(Sn);function j(P){h[P]!==!0&&(i.enable(P),h[P]=!0)}function xe(P){h[P]!==!1&&(i.disable(P),h[P]=!1)}function Pe(P,de){return u[P]!==de?(i.bindFramebuffer(P,de),u[P]=de,P===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=de),P===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=de),!0):!1}function ye(P,de){let Q=_,fe=!1;if(P){Q=p.get(de),Q===void 0&&(Q=[],p.set(de,Q));let ve=P.textures;if(Q.length!==ve.length||Q[0]!==i.COLOR_ATTACHMENT0){for(let se=0,Re=ve.length;se<Re;se++)Q[se]=i.COLOR_ATTACHMENT0+se;Q.length=ve.length,fe=!0}}else Q[0]!==i.BACK&&(Q[0]=i.BACK,fe=!0);fe&&i.drawBuffers(Q)}function ke(P){return b!==P?(i.useProgram(P),b=P,!0):!1}let vt={[Mi]:i.FUNC_ADD,[Rh]:i.FUNC_SUBTRACT,[Ph]:i.FUNC_REVERSE_SUBTRACT};vt[Ih]=i.MIN,vt[Lh]=i.MAX;let Xe={[Dh]:i.ZERO,[Nh]:i.ONE,[Uh]:i.SRC_COLOR,[yl]:i.SRC_ALPHA,[Vh]:i.SRC_ALPHA_SATURATE,[kh]:i.DST_COLOR,[Oh]:i.DST_ALPHA,[Fh]:i.ONE_MINUS_SRC_COLOR,[vl]:i.ONE_MINUS_SRC_ALPHA,[zh]:i.ONE_MINUS_DST_COLOR,[Bh]:i.ONE_MINUS_DST_ALPHA,[Gh]:i.CONSTANT_COLOR,[Hh]:i.ONE_MINUS_CONSTANT_COLOR,[Wh]:i.CONSTANT_ALPHA,[Xh]:i.ONE_MINUS_CONSTANT_ALPHA};function Je(P,de,Q,fe,ve,se,Re,Ee,at,Ke){if(P===Sn){g===!0&&(xe(i.BLEND),g=!1);return}if(g===!1&&(j(i.BLEND),g=!0),P!==Ch){if(P!==d||Ke!==D){if((T!==Mi||M!==Mi)&&(i.blendEquation(i.FUNC_ADD),T=Mi,M=Mi),Ke)switch(P){case us:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case gl:i.blendFunc(i.ONE,i.ONE);break;case _l:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case xl:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Ne("WebGLState: Invalid blending: ",P);break}else switch(P){case us:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case gl:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case _l:Ne("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case xl:Ne("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ne("WebGLState: Invalid blending: ",P);break}I=null,v=null,w=null,C=null,y.set(0,0,0),E=0,d=P,D=Ke}return}ve=ve||de,se=se||Q,Re=Re||fe,(de!==T||ve!==M)&&(i.blendEquationSeparate(vt[de],vt[ve]),T=de,M=ve),(Q!==I||fe!==v||se!==w||Re!==C)&&(i.blendFuncSeparate(Xe[Q],Xe[fe],Xe[se],Xe[Re]),I=Q,v=fe,w=se,C=Re),(Ee.equals(y)===!1||at!==E)&&(i.blendColor(Ee.r,Ee.g,Ee.b,at),y.copy(Ee),E=at),d=P,D=!1}function rt(P,de){P.side===bn?xe(i.CULL_FACE):j(i.CULL_FACE);let Q=P.side===Lt;de&&(Q=!Q),Ye(Q),P.blending===us&&P.transparent===!1?Je(Sn):Je(P.blending,P.blendEquation,P.blendSrc,P.blendDst,P.blendEquationAlpha,P.blendSrcAlpha,P.blendDstAlpha,P.blendColor,P.blendAlpha,P.premultipliedAlpha),a.setFunc(P.depthFunc),a.setTest(P.depthTest),a.setMask(P.depthWrite),r.setMask(P.colorWrite);let fe=P.stencilWrite;o.setTest(fe),fe&&(o.setMask(P.stencilWriteMask),o.setFunc(P.stencilFunc,P.stencilRef,P.stencilFuncMask),o.setOp(P.stencilFail,P.stencilZFail,P.stencilZPass)),Xt(P.polygonOffset,P.polygonOffsetFactor,P.polygonOffsetUnits),P.alphaToCoverage===!0?j(i.SAMPLE_ALPHA_TO_COVERAGE):xe(i.SAMPLE_ALPHA_TO_COVERAGE)}function Ye(P){O!==P&&(P?i.frontFace(i.CW):i.frontFace(i.CCW),O=P)}function ut(P){P!==Eh?(j(i.CULL_FACE),P!==V&&(P===ml?i.cullFace(i.BACK):P===Th?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):xe(i.CULL_FACE),V=P}function wt(P){P!==X&&(Z&&i.lineWidth(P),X=P)}function Xt(P,de,Q){P?(j(i.POLYGON_OFFSET_FILL),(N!==de||H!==Q)&&(N=de,H=Q,a.getReversed()&&(de=-de),i.polygonOffset(de,Q))):xe(i.POLYGON_OFFSET_FILL)}function ft(P){P?j(i.SCISSOR_TEST):xe(i.SCISSOR_TEST)}function mt(P){P===void 0&&(P=i.TEXTURE0+K-1),te!==P&&(i.activeTexture(P),te=P)}function L(P,de,Q){Q===void 0&&(te===null?Q=i.TEXTURE0+K-1:Q=te);let fe=F[Q];fe===void 0&&(fe={type:void 0,texture:void 0},F[Q]=fe),(fe.type!==P||fe.texture!==de)&&(te!==Q&&(i.activeTexture(Q),te=Q),i.bindTexture(P,de||q[P]),fe.type=P,fe.texture=de)}function Nt(){let P=F[te];P!==void 0&&P.type!==void 0&&(i.bindTexture(P.type,null),P.type=void 0,P.texture=void 0)}function et(){try{i.compressedTexImage2D(...arguments)}catch(P){Ne("WebGLState:",P)}}function S(){try{i.compressedTexImage3D(...arguments)}catch(P){Ne("WebGLState:",P)}}function m(){try{i.texSubImage2D(...arguments)}catch(P){Ne("WebGLState:",P)}}function B(){try{i.texSubImage3D(...arguments)}catch(P){Ne("WebGLState:",P)}}function G(){try{i.compressedTexSubImage2D(...arguments)}catch(P){Ne("WebGLState:",P)}}function $(){try{i.compressedTexSubImage3D(...arguments)}catch(P){Ne("WebGLState:",P)}}function le(){try{i.texStorage2D(...arguments)}catch(P){Ne("WebGLState:",P)}}function ce(){try{i.texStorage3D(...arguments)}catch(P){Ne("WebGLState:",P)}}function J(){try{i.texImage2D(...arguments)}catch(P){Ne("WebGLState:",P)}}function ee(){try{i.texImage3D(...arguments)}catch(P){Ne("WebGLState:",P)}}function he(P){return f[P]!==void 0?f[P]:i.getParameter(P)}function Ae(P,de){f[P]!==de&&(i.pixelStorei(P,de),f[P]=de)}function pe(P){Be.equals(P)===!1&&(i.scissor(P.x,P.y,P.z,P.w),Be.copy(P))}function ue(P){De.equals(P)===!1&&(i.viewport(P.x,P.y,P.z,P.w),De.copy(P))}function Ce(P,de){let Q=c.get(de);Q===void 0&&(Q=new WeakMap,c.set(de,Q));let fe=Q.get(P);fe===void 0&&(fe=i.getUniformBlockIndex(de,P.name),Q.set(P,fe))}function Le(P,de){let fe=c.get(de).get(P);l.get(de)!==fe&&(i.uniformBlockBinding(de,fe,P.__bindingPointIndex),l.set(de,fe))}function ze(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),h={},f={},te=null,F={},u={},p=new WeakMap,_=[],b=null,g=!1,d=null,T=null,I=null,v=null,M=null,w=null,C=null,y=new He(0,0,0),E=0,D=!1,O=null,V=null,X=null,N=null,H=null,Be.set(0,0,i.canvas.width,i.canvas.height),De.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:j,disable:xe,bindFramebuffer:Pe,drawBuffers:ye,useProgram:ke,setBlending:Je,setMaterial:rt,setFlipSided:Ye,setCullFace:ut,setLineWidth:wt,setPolygonOffset:Xt,setScissorTest:ft,activeTexture:mt,bindTexture:L,unbindTexture:Nt,compressedTexImage2D:et,compressedTexImage3D:S,texImage2D:J,texImage3D:ee,pixelStorei:Ae,getParameter:he,updateUBOMapping:Ce,uniformBlockBinding:Le,texStorage2D:le,texStorage3D:ce,texSubImage2D:m,texSubImage3D:B,compressedTexSubImage2D:G,compressedTexSubImage3D:$,scissor:pe,viewport:ue,reset:ze}}function um(i,e,t,n,s,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Ue,h=new WeakMap,f=new Set,u,p=new WeakMap,_=!1;try{_=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function b(S,m){return _?new OffscreenCanvas(S,m):Ki("canvas")}function g(S,m,B){let G=1,$=et(S);if(($.width>B||$.height>B)&&(G=B/Math.max($.width,$.height)),G<1)if(typeof HTMLImageElement<"u"&&S instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&S instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&S instanceof ImageBitmap||typeof VideoFrame<"u"&&S instanceof VideoFrame){let le=Math.floor(G*$.width),ce=Math.floor(G*$.height);u===void 0&&(u=b(le,ce));let J=m?b(le,ce):u;return J.width=le,J.height=ce,J.getContext("2d").drawImage(S,0,0,le,ce),Ie("WebGLRenderer: Texture has been resized from ("+$.width+"x"+$.height+") to ("+le+"x"+ce+")."),J}else return"data"in S&&Ie("WebGLRenderer: Image in DataTexture is too big ("+$.width+"x"+$.height+")."),S;return S}function d(S){return S.generateMipmaps}function T(S){i.generateMipmap(S)}function I(S){return S.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:S.isWebGL3DRenderTarget?i.TEXTURE_3D:S.isWebGLArrayRenderTarget||S.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function v(S,m,B,G,$,le=!1){if(S!==null){if(i[S]!==void 0)return i[S];Ie("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+S+"'")}let ce;G&&(ce=e.get("EXT_texture_norm16"),ce||Ie("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let J=m;if(m===i.RED&&(B===i.FLOAT&&(J=i.R32F),B===i.HALF_FLOAT&&(J=i.R16F),B===i.UNSIGNED_BYTE&&(J=i.R8),B===i.UNSIGNED_SHORT&&ce&&(J=ce.R16_EXT),B===i.SHORT&&ce&&(J=ce.R16_SNORM_EXT)),m===i.RED_INTEGER&&(B===i.UNSIGNED_BYTE&&(J=i.R8UI),B===i.UNSIGNED_SHORT&&(J=i.R16UI),B===i.UNSIGNED_INT&&(J=i.R32UI),B===i.BYTE&&(J=i.R8I),B===i.SHORT&&(J=i.R16I),B===i.INT&&(J=i.R32I)),m===i.RG&&(B===i.FLOAT&&(J=i.RG32F),B===i.HALF_FLOAT&&(J=i.RG16F),B===i.UNSIGNED_BYTE&&(J=i.RG8),B===i.UNSIGNED_SHORT&&ce&&(J=ce.RG16_EXT),B===i.SHORT&&ce&&(J=ce.RG16_SNORM_EXT)),m===i.RG_INTEGER&&(B===i.UNSIGNED_BYTE&&(J=i.RG8UI),B===i.UNSIGNED_SHORT&&(J=i.RG16UI),B===i.UNSIGNED_INT&&(J=i.RG32UI),B===i.BYTE&&(J=i.RG8I),B===i.SHORT&&(J=i.RG16I),B===i.INT&&(J=i.RG32I)),m===i.RGB_INTEGER&&(B===i.UNSIGNED_BYTE&&(J=i.RGB8UI),B===i.UNSIGNED_SHORT&&(J=i.RGB16UI),B===i.UNSIGNED_INT&&(J=i.RGB32UI),B===i.BYTE&&(J=i.RGB8I),B===i.SHORT&&(J=i.RGB16I),B===i.INT&&(J=i.RGB32I)),m===i.RGBA_INTEGER&&(B===i.UNSIGNED_BYTE&&(J=i.RGBA8UI),B===i.UNSIGNED_SHORT&&(J=i.RGBA16UI),B===i.UNSIGNED_INT&&(J=i.RGBA32UI),B===i.BYTE&&(J=i.RGBA8I),B===i.SHORT&&(J=i.RGBA16I),B===i.INT&&(J=i.RGBA32I)),m===i.RGB&&(B===i.UNSIGNED_SHORT&&ce&&(J=ce.RGB16_EXT),B===i.SHORT&&ce&&(J=ce.RGB16_SNORM_EXT),B===i.UNSIGNED_INT_5_9_9_9_REV&&(J=i.RGB9_E5),B===i.UNSIGNED_INT_10F_11F_11F_REV&&(J=i.R11F_G11F_B10F)),m===i.RGBA){let ee=le?Us:$e.getTransfer($);B===i.FLOAT&&(J=i.RGBA32F),B===i.HALF_FLOAT&&(J=i.RGBA16F),B===i.UNSIGNED_BYTE&&(J=ee===Qe?i.SRGB8_ALPHA8:i.RGBA8),B===i.UNSIGNED_SHORT&&ce&&(J=ce.RGBA16_EXT),B===i.SHORT&&ce&&(J=ce.RGBA16_SNORM_EXT),B===i.UNSIGNED_SHORT_4_4_4_4&&(J=i.RGBA4),B===i.UNSIGNED_SHORT_5_5_5_1&&(J=i.RGB5_A1)}return(J===i.R16F||J===i.R32F||J===i.RG16F||J===i.RG32F||J===i.RGBA16F||J===i.RGBA32F)&&e.get("EXT_color_buffer_float"),J}function M(S,m){let B;return S?m===null||m===dn||m===fs?B=i.DEPTH24_STENCIL8:m===fn?B=i.DEPTH32F_STENCIL8:m===ds&&(B=i.DEPTH24_STENCIL8,Ie("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):m===null||m===dn||m===fs?B=i.DEPTH_COMPONENT24:m===fn?B=i.DEPTH_COMPONENT32F:m===ds&&(B=i.DEPTH_COMPONENT16),B}function w(S,m){return d(S)===!0||S.isFramebufferTexture&&S.minFilter!==Tt&&S.minFilter!==Pt?Math.log2(Math.max(m.width,m.height))+1:S.mipmaps!==void 0&&S.mipmaps.length>0?S.mipmaps.length:S.isCompressedTexture&&Array.isArray(S.image)?m.mipmaps.length:1}function C(S){let m=S.target;m.removeEventListener("dispose",C),E(m),m.isVideoTexture&&h.delete(m),m.isHTMLTexture&&f.delete(m)}function y(S){let m=S.target;m.removeEventListener("dispose",y),O(m)}function E(S){let m=n.get(S);if(m.__webglInit===void 0)return;let B=S.source,G=p.get(B);if(G){let $=G[m.__cacheKey];$.usedTimes--,$.usedTimes===0&&D(S),Object.keys(G).length===0&&p.delete(B)}n.remove(S)}function D(S){let m=n.get(S);i.deleteTexture(m.__webglTexture);let B=S.source,G=p.get(B);delete G[m.__cacheKey],a.memory.textures--}function O(S){let m=n.get(S);if(S.depthTexture&&(S.depthTexture.dispose(),n.remove(S.depthTexture)),S.isWebGLCubeRenderTarget)for(let G=0;G<6;G++){if(Array.isArray(m.__webglFramebuffer[G]))for(let $=0;$<m.__webglFramebuffer[G].length;$++)i.deleteFramebuffer(m.__webglFramebuffer[G][$]);else i.deleteFramebuffer(m.__webglFramebuffer[G]);m.__webglDepthbuffer&&i.deleteRenderbuffer(m.__webglDepthbuffer[G])}else{if(Array.isArray(m.__webglFramebuffer))for(let G=0;G<m.__webglFramebuffer.length;G++)i.deleteFramebuffer(m.__webglFramebuffer[G]);else i.deleteFramebuffer(m.__webglFramebuffer);if(m.__webglDepthbuffer&&i.deleteRenderbuffer(m.__webglDepthbuffer),m.__webglMultisampledFramebuffer&&i.deleteFramebuffer(m.__webglMultisampledFramebuffer),m.__webglColorRenderbuffer)for(let G=0;G<m.__webglColorRenderbuffer.length;G++)m.__webglColorRenderbuffer[G]&&i.deleteRenderbuffer(m.__webglColorRenderbuffer[G]);m.__webglDepthRenderbuffer&&i.deleteRenderbuffer(m.__webglDepthRenderbuffer)}let B=S.textures;for(let G=0,$=B.length;G<$;G++){let le=n.get(B[G]);le.__webglTexture&&(i.deleteTexture(le.__webglTexture),a.memory.textures--),n.remove(B[G])}n.remove(S)}let V=0;function X(){V=0}function N(){return V}function H(S){V=S}function K(){let S=V;return S>=s.maxTextures&&Ie("WebGLTextures: Trying to use "+(S+1)+" texture units while this GPU supports only "+s.maxTextures),V+=1,S}function Z(S){let m=[];return m.push(S.wrapS),m.push(S.wrapT),m.push(S.wrapR||0),m.push(S.magFilter),m.push(S.minFilter),m.push(S.anisotropy),m.push(S.internalFormat),m.push(S.format),m.push(S.type),m.push(S.generateMipmaps),m.push(S.premultiplyAlpha),m.push(S.flipY),m.push(S.unpackAlignment),m.push(S.colorSpace),m.join()}function re(S,m){let B=n.get(S);if(S.isVideoTexture&&L(S),S.isRenderTargetTexture===!1&&S.isExternalTexture!==!0&&S.version>0&&B.__version!==S.version){let G=S.image;if(G===null)Ie("WebGLRenderer: Texture marked for update but no image data found.");else if(G.complete===!1)Ie("WebGLRenderer: Texture marked for update but image is incomplete");else{xe(B,S,m);return}}else S.isExternalTexture&&(B.__webglTexture=S.sourceTexture?S.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,B.__webglTexture,i.TEXTURE0+m)}function Y(S,m){let B=n.get(S);if(S.isRenderTargetTexture===!1&&S.version>0&&B.__version!==S.version){xe(B,S,m);return}else S.isExternalTexture&&(B.__webglTexture=S.sourceTexture?S.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,B.__webglTexture,i.TEXTURE0+m)}function te(S,m){let B=n.get(S);if(S.isRenderTargetTexture===!1&&S.version>0&&B.__version!==S.version){xe(B,S,m);return}t.bindTexture(i.TEXTURE_3D,B.__webglTexture,i.TEXTURE0+m)}function F(S,m){let B=n.get(S);if(S.isCubeDepthTexture!==!0&&S.version>0&&B.__version!==S.version){Pe(B,S,m);return}t.bindTexture(i.TEXTURE_CUBE_MAP,B.__webglTexture,i.TEXTURE0+m)}let ne={[ea]:i.REPEAT,[xn]:i.CLAMP_TO_EDGE,[ta]:i.MIRRORED_REPEAT},ae={[Tt]:i.NEAREST,[$h]:i.NEAREST_MIPMAP_NEAREST,[tr]:i.NEAREST_MIPMAP_LINEAR,[Pt]:i.LINEAR,[Pa]:i.LINEAR_MIPMAP_NEAREST,[ci]:i.LINEAR_MIPMAP_LINEAR},Be={[jh]:i.NEVER,[iu]:i.ALWAYS,[Qh]:i.LESS,[mo]:i.LEQUAL,[eu]:i.EQUAL,[go]:i.GEQUAL,[tu]:i.GREATER,[nu]:i.NOTEQUAL};function De(S,m){if(m.type===fn&&e.has("OES_texture_float_linear")===!1&&(m.magFilter===Pt||m.magFilter===Pa||m.magFilter===tr||m.magFilter===ci||m.minFilter===Pt||m.minFilter===Pa||m.minFilter===tr||m.minFilter===ci)&&Ie("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(S,i.TEXTURE_WRAP_S,ne[m.wrapS]),i.texParameteri(S,i.TEXTURE_WRAP_T,ne[m.wrapT]),(S===i.TEXTURE_3D||S===i.TEXTURE_2D_ARRAY)&&i.texParameteri(S,i.TEXTURE_WRAP_R,ne[m.wrapR]),i.texParameteri(S,i.TEXTURE_MAG_FILTER,ae[m.magFilter]),i.texParameteri(S,i.TEXTURE_MIN_FILTER,ae[m.minFilter]),m.compareFunction&&(i.texParameteri(S,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(S,i.TEXTURE_COMPARE_FUNC,Be[m.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(m.magFilter===Tt||m.minFilter!==tr&&m.minFilter!==ci||m.type===fn&&e.has("OES_texture_float_linear")===!1)return;if(m.anisotropy>1||n.get(m).__currentAnisotropy){let B=e.get("EXT_texture_filter_anisotropic");i.texParameterf(S,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(m.anisotropy,s.getMaxAnisotropy())),n.get(m).__currentAnisotropy=m.anisotropy}}}function Fe(S,m){let B=!1;S.__webglInit===void 0&&(S.__webglInit=!0,m.addEventListener("dispose",C));let G=m.source,$=p.get(G);$===void 0&&($={},p.set(G,$));let le=Z(m);if(le!==S.__cacheKey){$[le]===void 0&&($[le]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,B=!0),$[le].usedTimes++;let ce=$[S.__cacheKey];ce!==void 0&&($[S.__cacheKey].usedTimes--,ce.usedTimes===0&&D(m)),S.__cacheKey=le,S.__webglTexture=$[le].texture}return B}function q(S,m,B){return Math.floor(Math.floor(S/B)/m)}function j(S,m,B,G){let le=S.updateRanges;if(le.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,m.width,m.height,B,G,m.data);else{le.sort((Ae,pe)=>Ae.start-pe.start);let ce=0;for(let Ae=1;Ae<le.length;Ae++){let pe=le[ce],ue=le[Ae],Ce=pe.start+pe.count,Le=q(ue.start,m.width,4),ze=q(pe.start,m.width,4);ue.start<=Ce+1&&Le===ze&&q(ue.start+ue.count-1,m.width,4)===Le?pe.count=Math.max(pe.count,ue.start+ue.count-pe.start):(++ce,le[ce]=ue)}le.length=ce+1;let J=t.getParameter(i.UNPACK_ROW_LENGTH),ee=t.getParameter(i.UNPACK_SKIP_PIXELS),he=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,m.width);for(let Ae=0,pe=le.length;Ae<pe;Ae++){let ue=le[Ae],Ce=Math.floor(ue.start/4),Le=Math.ceil(ue.count/4),ze=Ce%m.width,P=Math.floor(Ce/m.width),de=Le,Q=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,ze),t.pixelStorei(i.UNPACK_SKIP_ROWS,P),t.texSubImage2D(i.TEXTURE_2D,0,ze,P,de,Q,B,G,m.data)}S.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,J),t.pixelStorei(i.UNPACK_SKIP_PIXELS,ee),t.pixelStorei(i.UNPACK_SKIP_ROWS,he)}}function xe(S,m,B){let G=i.TEXTURE_2D;(m.isDataArrayTexture||m.isCompressedArrayTexture)&&(G=i.TEXTURE_2D_ARRAY),m.isData3DTexture&&(G=i.TEXTURE_3D);let $=Fe(S,m),le=m.source;t.bindTexture(G,S.__webglTexture,i.TEXTURE0+B);let ce=n.get(le);if(le.version!==ce.__version||$===!0){if(t.activeTexture(i.TEXTURE0+B),(typeof ImageBitmap<"u"&&m.image instanceof ImageBitmap)===!1){let Q=$e.getPrimaries($e.workingColorSpace),fe=m.colorSpace===kn?null:$e.getPrimaries(m.colorSpace),ve=m.colorSpace===kn||Q===fe?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,m.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,m.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ve)}t.pixelStorei(i.UNPACK_ALIGNMENT,m.unpackAlignment);let ee=g(m.image,!1,s.maxTextureSize);ee=Nt(m,ee);let he=r.convert(m.format,m.colorSpace),Ae=r.convert(m.type),pe=v(m.internalFormat,he,Ae,m.normalized,m.colorSpace,m.isVideoTexture);De(G,m);let ue,Ce=m.mipmaps,Le=m.isVideoTexture!==!0,ze=ce.__version===void 0||$===!0,P=le.dataReady,de=w(m,ee);if(m.isDepthTexture)pe=M(m.format===hi,m.type),ze&&(Le?t.texStorage2D(i.TEXTURE_2D,1,pe,ee.width,ee.height):t.texImage2D(i.TEXTURE_2D,0,pe,ee.width,ee.height,0,he,Ae,null));else if(m.isDataTexture)if(Ce.length>0){Le&&ze&&t.texStorage2D(i.TEXTURE_2D,de,pe,Ce[0].width,Ce[0].height);for(let Q=0,fe=Ce.length;Q<fe;Q++)ue=Ce[Q],Le?P&&t.texSubImage2D(i.TEXTURE_2D,Q,0,0,ue.width,ue.height,he,Ae,ue.data):t.texImage2D(i.TEXTURE_2D,Q,pe,ue.width,ue.height,0,he,Ae,ue.data);m.generateMipmaps=!1}else Le?(ze&&t.texStorage2D(i.TEXTURE_2D,de,pe,ee.width,ee.height),P&&j(m,ee,he,Ae)):t.texImage2D(i.TEXTURE_2D,0,pe,ee.width,ee.height,0,he,Ae,ee.data);else if(m.isCompressedTexture)if(m.isCompressedArrayTexture){Le&&ze&&t.texStorage3D(i.TEXTURE_2D_ARRAY,de,pe,Ce[0].width,Ce[0].height,ee.depth);for(let Q=0,fe=Ce.length;Q<fe;Q++)if(ue=Ce[Q],m.format!==sn)if(he!==null)if(Le){if(P)if(m.layerUpdates.size>0){let ve=Hl(ue.width,ue.height,m.format,m.type);for(let se of m.layerUpdates){let Re=ue.data.subarray(se*ve/ue.data.BYTES_PER_ELEMENT,(se+1)*ve/ue.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,se,ue.width,ue.height,1,he,Re)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,0,ue.width,ue.height,ee.depth,he,ue.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,Q,pe,ue.width,ue.height,ee.depth,0,ue.data,0,0);else Ie("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Le?P&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,0,ue.width,ue.height,ee.depth,he,Ae,ue.data):t.texImage3D(i.TEXTURE_2D_ARRAY,Q,pe,ue.width,ue.height,ee.depth,0,he,Ae,ue.data);m.layerUpdates.size>0&&m.clearLayerUpdates()}else{Le&&ze&&t.texStorage2D(i.TEXTURE_2D,de,pe,Ce[0].width,Ce[0].height);for(let Q=0,fe=Ce.length;Q<fe;Q++)ue=Ce[Q],m.format!==sn?he!==null?Le?P&&t.compressedTexSubImage2D(i.TEXTURE_2D,Q,0,0,ue.width,ue.height,he,ue.data):t.compressedTexImage2D(i.TEXTURE_2D,Q,pe,ue.width,ue.height,0,ue.data):Ie("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Le?P&&t.texSubImage2D(i.TEXTURE_2D,Q,0,0,ue.width,ue.height,he,Ae,ue.data):t.texImage2D(i.TEXTURE_2D,Q,pe,ue.width,ue.height,0,he,Ae,ue.data)}else if(m.isDataArrayTexture)if(Le){if(ze&&t.texStorage3D(i.TEXTURE_2D_ARRAY,de,pe,ee.width,ee.height,ee.depth),P)if(m.layerUpdates.size>0){let Q=Hl(ee.width,ee.height,m.format,m.type);for(let fe of m.layerUpdates){let ve=ee.data.subarray(fe*Q/ee.data.BYTES_PER_ELEMENT,(fe+1)*Q/ee.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,fe,ee.width,ee.height,1,he,Ae,ve)}m.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ee.width,ee.height,ee.depth,he,Ae,ee.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,pe,ee.width,ee.height,ee.depth,0,he,Ae,ee.data);else if(m.isData3DTexture)Le?(ze&&t.texStorage3D(i.TEXTURE_3D,de,pe,ee.width,ee.height,ee.depth),P&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ee.width,ee.height,ee.depth,he,Ae,ee.data)):t.texImage3D(i.TEXTURE_3D,0,pe,ee.width,ee.height,ee.depth,0,he,Ae,ee.data);else if(m.isFramebufferTexture){if(ze)if(Le)t.texStorage2D(i.TEXTURE_2D,de,pe,ee.width,ee.height);else{let Q=ee.width,fe=ee.height;for(let ve=0;ve<de;ve++)t.texImage2D(i.TEXTURE_2D,ve,pe,Q,fe,0,he,Ae,null),Q>>=1,fe>>=1}}else if(m.isHTMLTexture){if("texElementImage2D"in i){let Q=i.canvas;if(Q.hasAttribute("layoutsubtree")||Q.setAttribute("layoutsubtree","true"),ee.parentNode!==Q){Q.appendChild(ee),f.add(m),Q.onpaint=fe=>{let ve=fe.changedElements;for(let se of f)ve.includes(se.image)&&(se.needsUpdate=!0)},Q.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,ee);else{let ve=i.RGBA,se=i.RGBA,Re=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,ve,se,Re,ee)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Ce.length>0){if(Le&&ze){let Q=et(Ce[0]);t.texStorage2D(i.TEXTURE_2D,de,pe,Q.width,Q.height)}for(let Q=0,fe=Ce.length;Q<fe;Q++)ue=Ce[Q],Le?P&&t.texSubImage2D(i.TEXTURE_2D,Q,0,0,he,Ae,ue):t.texImage2D(i.TEXTURE_2D,Q,pe,he,Ae,ue);m.generateMipmaps=!1}else if(Le){if(ze){let Q=et(ee);t.texStorage2D(i.TEXTURE_2D,de,pe,Q.width,Q.height)}P&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,he,Ae,ee)}else t.texImage2D(i.TEXTURE_2D,0,pe,he,Ae,ee);d(m)&&T(G),ce.__version=le.version,m.onUpdate&&m.onUpdate(m)}S.__version=m.version}function Pe(S,m,B){if(m.image.length!==6)return;let G=Fe(S,m),$=m.source;t.bindTexture(i.TEXTURE_CUBE_MAP,S.__webglTexture,i.TEXTURE0+B);let le=n.get($);if($.version!==le.__version||G===!0){t.activeTexture(i.TEXTURE0+B);let ce=$e.getPrimaries($e.workingColorSpace),J=m.colorSpace===kn?null:$e.getPrimaries(m.colorSpace),ee=m.colorSpace===kn||ce===J?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,m.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,m.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,m.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ee);let he=m.isCompressedTexture||m.image[0].isCompressedTexture,Ae=m.image[0]&&m.image[0].isDataTexture,pe=[];for(let se=0;se<6;se++)!he&&!Ae?pe[se]=g(m.image[se],!0,s.maxCubemapSize):pe[se]=Ae?m.image[se].image:m.image[se],pe[se]=Nt(m,pe[se]);let ue=pe[0],Ce=r.convert(m.format,m.colorSpace),Le=r.convert(m.type),ze=v(m.internalFormat,Ce,Le,m.normalized,m.colorSpace),P=m.isVideoTexture!==!0,de=le.__version===void 0||G===!0,Q=$.dataReady,fe=w(m,ue);De(i.TEXTURE_CUBE_MAP,m);let ve;if(he){P&&de&&t.texStorage2D(i.TEXTURE_CUBE_MAP,fe,ze,ue.width,ue.height);for(let se=0;se<6;se++){ve=pe[se].mipmaps;for(let Re=0;Re<ve.length;Re++){let Ee=ve[Re];m.format!==sn?Ce!==null?P?Q&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Re,0,0,Ee.width,Ee.height,Ce,Ee.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Re,ze,Ee.width,Ee.height,0,Ee.data):Ie("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):P?Q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Re,0,0,Ee.width,Ee.height,Ce,Le,Ee.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Re,ze,Ee.width,Ee.height,0,Ce,Le,Ee.data)}}}else{if(ve=m.mipmaps,P&&de){ve.length>0&&fe++;let se=et(pe[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,fe,ze,se.width,se.height)}for(let se=0;se<6;se++)if(Ae){P?Q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,0,0,0,pe[se].width,pe[se].height,Ce,Le,pe[se].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,0,ze,pe[se].width,pe[se].height,0,Ce,Le,pe[se].data);for(let Re=0;Re<ve.length;Re++){let at=ve[Re].image[se].image;P?Q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Re+1,0,0,at.width,at.height,Ce,Le,at.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Re+1,ze,at.width,at.height,0,Ce,Le,at.data)}}else{P?Q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,0,0,0,Ce,Le,pe[se]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,0,ze,Ce,Le,pe[se]);for(let Re=0;Re<ve.length;Re++){let Ee=ve[Re];P?Q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Re+1,0,0,Ce,Le,Ee.image[se]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Re+1,ze,Ce,Le,Ee.image[se])}}}d(m)&&T(i.TEXTURE_CUBE_MAP),le.__version=$.version,m.onUpdate&&m.onUpdate(m)}S.__version=m.version}function ye(S,m,B,G,$,le){let ce=r.convert(B.format,B.colorSpace),J=r.convert(B.type),ee=v(B.internalFormat,ce,J,B.normalized,B.colorSpace),he=n.get(m),Ae=n.get(B);if(Ae.__renderTarget=m,!he.__hasExternalTextures){let pe=Math.max(1,m.width>>le),ue=Math.max(1,m.height>>le);$===i.TEXTURE_3D||$===i.TEXTURE_2D_ARRAY?t.texImage3D($,le,ee,pe,ue,m.depth,0,ce,J,null):t.texImage2D($,le,ee,pe,ue,0,ce,J,null)}t.bindFramebuffer(i.FRAMEBUFFER,S),mt(m)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,G,$,Ae.__webglTexture,0,ft(m)):($===i.TEXTURE_2D||$>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&$<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,G,$,Ae.__webglTexture,le),t.bindFramebuffer(i.FRAMEBUFFER,null)}function ke(S,m,B){if(i.bindRenderbuffer(i.RENDERBUFFER,S),m.depthBuffer){let G=m.depthTexture,$=G&&G.isDepthTexture?G.type:null,le=M(m.stencilBuffer,$),ce=m.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;mt(m)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ft(m),le,m.width,m.height):B?i.renderbufferStorageMultisample(i.RENDERBUFFER,ft(m),le,m.width,m.height):i.renderbufferStorage(i.RENDERBUFFER,le,m.width,m.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,ce,i.RENDERBUFFER,S)}else{let G=m.textures;for(let $=0;$<G.length;$++){let le=G[$],ce=r.convert(le.format,le.colorSpace),J=r.convert(le.type),ee=v(le.internalFormat,ce,J,le.normalized,le.colorSpace);mt(m)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ft(m),ee,m.width,m.height):B?i.renderbufferStorageMultisample(i.RENDERBUFFER,ft(m),ee,m.width,m.height):i.renderbufferStorage(i.RENDERBUFFER,ee,m.width,m.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function vt(S,m,B){let G=m.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,S),!(m.depthTexture&&m.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let $=n.get(m.depthTexture);if($.__renderTarget=m,(!$.__webglTexture||m.depthTexture.image.width!==m.width||m.depthTexture.image.height!==m.height)&&(m.depthTexture.image.width=m.width,m.depthTexture.image.height=m.height,m.depthTexture.needsUpdate=!0),G){if($.__webglInit===void 0&&($.__webglInit=!0,m.depthTexture.addEventListener("dispose",C)),$.__webglTexture===void 0){$.__webglTexture=i.createTexture(),t.bindTexture(i.TEXTURE_CUBE_MAP,$.__webglTexture),De(i.TEXTURE_CUBE_MAP,m.depthTexture);let he=r.convert(m.depthTexture.format),Ae=r.convert(m.depthTexture.type),pe;m.depthTexture.format===yn?pe=i.DEPTH_COMPONENT24:m.depthTexture.format===hi&&(pe=i.DEPTH24_STENCIL8);for(let ue=0;ue<6;ue++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ue,0,pe,m.width,m.height,0,he,Ae,null)}}else re(m.depthTexture,0);let le=$.__webglTexture,ce=ft(m),J=G?i.TEXTURE_CUBE_MAP_POSITIVE_X+B:i.TEXTURE_2D,ee=m.depthTexture.format===hi?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(m.depthTexture.format===yn)mt(m)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ee,J,le,0,ce):i.framebufferTexture2D(i.FRAMEBUFFER,ee,J,le,0);else if(m.depthTexture.format===hi)mt(m)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ee,J,le,0,ce):i.framebufferTexture2D(i.FRAMEBUFFER,ee,J,le,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Xe(S){let m=n.get(S),B=S.isWebGLCubeRenderTarget===!0;if(m.__boundDepthTexture!==S.depthTexture){let G=S.depthTexture;if(m.__depthDisposeCallback&&m.__depthDisposeCallback(),G){let $=()=>{delete m.__boundDepthTexture,delete m.__depthDisposeCallback,G.removeEventListener("dispose",$)};G.addEventListener("dispose",$),m.__depthDisposeCallback=$}m.__boundDepthTexture=G}if(S.depthTexture&&!m.__autoAllocateDepthBuffer)if(B)for(let G=0;G<6;G++)vt(m.__webglFramebuffer[G],S,G);else{let G=S.texture.mipmaps;G&&G.length>0?vt(m.__webglFramebuffer[0],S,0):vt(m.__webglFramebuffer,S,0)}else if(B){m.__webglDepthbuffer=[];for(let G=0;G<6;G++)if(t.bindFramebuffer(i.FRAMEBUFFER,m.__webglFramebuffer[G]),m.__webglDepthbuffer[G]===void 0)m.__webglDepthbuffer[G]=i.createRenderbuffer(),ke(m.__webglDepthbuffer[G],S,!1);else{let $=S.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,le=m.__webglDepthbuffer[G];i.bindRenderbuffer(i.RENDERBUFFER,le),i.framebufferRenderbuffer(i.FRAMEBUFFER,$,i.RENDERBUFFER,le)}}else{let G=S.texture.mipmaps;if(G&&G.length>0?t.bindFramebuffer(i.FRAMEBUFFER,m.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,m.__webglFramebuffer),m.__webglDepthbuffer===void 0)m.__webglDepthbuffer=i.createRenderbuffer(),ke(m.__webglDepthbuffer,S,!1);else{let $=S.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,le=m.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,le),i.framebufferRenderbuffer(i.FRAMEBUFFER,$,i.RENDERBUFFER,le)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Je(S,m,B){let G=n.get(S);m!==void 0&&ye(G.__webglFramebuffer,S,S.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),B!==void 0&&Xe(S)}function rt(S){let m=S.texture,B=n.get(S),G=n.get(m);S.addEventListener("dispose",y);let $=S.textures,le=S.isWebGLCubeRenderTarget===!0,ce=$.length>1;if(ce||(G.__webglTexture===void 0&&(G.__webglTexture=i.createTexture()),G.__version=m.version,a.memory.textures++),le){B.__webglFramebuffer=[];for(let J=0;J<6;J++)if(m.mipmaps&&m.mipmaps.length>0){B.__webglFramebuffer[J]=[];for(let ee=0;ee<m.mipmaps.length;ee++)B.__webglFramebuffer[J][ee]=i.createFramebuffer()}else B.__webglFramebuffer[J]=i.createFramebuffer()}else{if(m.mipmaps&&m.mipmaps.length>0){B.__webglFramebuffer=[];for(let J=0;J<m.mipmaps.length;J++)B.__webglFramebuffer[J]=i.createFramebuffer()}else B.__webglFramebuffer=i.createFramebuffer();if(ce)for(let J=0,ee=$.length;J<ee;J++){let he=n.get($[J]);he.__webglTexture===void 0&&(he.__webglTexture=i.createTexture(),a.memory.textures++)}if(S.samples>0&&mt(S)===!1){B.__webglMultisampledFramebuffer=i.createFramebuffer(),B.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let J=0;J<$.length;J++){let ee=$[J];B.__webglColorRenderbuffer[J]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,B.__webglColorRenderbuffer[J]);let he=r.convert(ee.format,ee.colorSpace),Ae=r.convert(ee.type),pe=v(ee.internalFormat,he,Ae,ee.normalized,ee.colorSpace,S.isXRRenderTarget===!0),ue=ft(S);i.renderbufferStorageMultisample(i.RENDERBUFFER,ue,pe,S.width,S.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+J,i.RENDERBUFFER,B.__webglColorRenderbuffer[J])}i.bindRenderbuffer(i.RENDERBUFFER,null),S.depthBuffer&&(B.__webglDepthRenderbuffer=i.createRenderbuffer(),ke(B.__webglDepthRenderbuffer,S,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(le){t.bindTexture(i.TEXTURE_CUBE_MAP,G.__webglTexture),De(i.TEXTURE_CUBE_MAP,m);for(let J=0;J<6;J++)if(m.mipmaps&&m.mipmaps.length>0)for(let ee=0;ee<m.mipmaps.length;ee++)ye(B.__webglFramebuffer[J][ee],S,m,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+J,ee);else ye(B.__webglFramebuffer[J],S,m,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0);d(m)&&T(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ce){for(let J=0,ee=$.length;J<ee;J++){let he=$[J],Ae=n.get(he),pe=i.TEXTURE_2D;(S.isWebGL3DRenderTarget||S.isWebGLArrayRenderTarget)&&(pe=S.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(pe,Ae.__webglTexture),De(pe,he),ye(B.__webglFramebuffer,S,he,i.COLOR_ATTACHMENT0+J,pe,0),d(he)&&T(pe)}t.unbindTexture()}else{let J=i.TEXTURE_2D;if((S.isWebGL3DRenderTarget||S.isWebGLArrayRenderTarget)&&(J=S.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(J,G.__webglTexture),De(J,m),m.mipmaps&&m.mipmaps.length>0)for(let ee=0;ee<m.mipmaps.length;ee++)ye(B.__webglFramebuffer[ee],S,m,i.COLOR_ATTACHMENT0,J,ee);else ye(B.__webglFramebuffer,S,m,i.COLOR_ATTACHMENT0,J,0);d(m)&&T(J),t.unbindTexture()}S.depthBuffer&&Xe(S)}function Ye(S){let m=S.textures;for(let B=0,G=m.length;B<G;B++){let $=m[B];if(d($)){let le=I(S),ce=n.get($).__webglTexture;t.bindTexture(le,ce),T(le),t.unbindTexture()}}}let ut=[],wt=[];function Xt(S){if(S.samples>0){if(mt(S)===!1){let m=S.textures,B=S.width,G=S.height,$=i.COLOR_BUFFER_BIT,le=S.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ce=n.get(S),J=m.length>1;if(J)for(let he=0;he<m.length;he++)t.bindFramebuffer(i.FRAMEBUFFER,ce.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+he,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,ce.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+he,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,ce.__webglMultisampledFramebuffer);let ee=S.texture.mipmaps;ee&&ee.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ce.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ce.__webglFramebuffer);for(let he=0;he<m.length;he++){if(S.resolveDepthBuffer&&(S.depthBuffer&&($|=i.DEPTH_BUFFER_BIT),S.stencilBuffer&&S.resolveStencilBuffer&&($|=i.STENCIL_BUFFER_BIT)),J){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ce.__webglColorRenderbuffer[he]);let Ae=n.get(m[he]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Ae,0)}i.blitFramebuffer(0,0,B,G,0,0,B,G,$,i.NEAREST),l===!0&&(ut.length=0,wt.length=0,ut.push(i.COLOR_ATTACHMENT0+he),S.depthBuffer&&S.storeMultisampledDepthBuffer===!1&&(ut.push(le),wt.push(le),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,wt)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,ut))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),J)for(let he=0;he<m.length;he++){t.bindFramebuffer(i.FRAMEBUFFER,ce.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+he,i.RENDERBUFFER,ce.__webglColorRenderbuffer[he]);let Ae=n.get(m[he]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,ce.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+he,i.TEXTURE_2D,Ae,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ce.__webglMultisampledFramebuffer)}else if(S.depthBuffer&&S.storeMultisampledDepthBuffer===!1&&l){let m=S.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[m])}}}function ft(S){return Math.min(s.maxSamples,S.samples)}function mt(S){let m=n.get(S);return S.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&m.__useRenderToTexture!==!1}function L(S){let m=a.render.frame;h.get(S)!==m&&(h.set(S,m),S.update())}function Nt(S,m){let B=S.colorSpace,G=S.format,$=S.type;return S.isCompressedTexture===!0||S.isVideoTexture===!0||B!==Ns&&B!==kn&&($e.getTransfer(B)===Qe?(G!==sn||$!==Yt)&&Ie("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ne("WebGLTextures: Unsupported texture color space:",B)),m}function et(S){return typeof HTMLImageElement<"u"&&S instanceof HTMLImageElement?(c.width=S.naturalWidth||S.width,c.height=S.naturalHeight||S.height):typeof VideoFrame<"u"&&S instanceof VideoFrame?(c.width=S.displayWidth,c.height=S.displayHeight):(c.width=S.width,c.height=S.height),c}this.allocateTextureUnit=K,this.resetTextureUnits=X,this.getTextureUnits=N,this.setTextureUnits=H,this.setTexture2D=re,this.setTexture2DArray=Y,this.setTexture3D=te,this.setTextureCube=F,this.rebindTextures=Je,this.setupRenderTarget=rt,this.updateRenderTargetMipmap=Ye,this.updateMultisampleRenderTarget=Xt,this.setupDepthRenderbuffer=Xe,this.setupFrameBufferTexture=ye,this.useMultisampledRTT=mt,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function dm(i,e){function t(n,s=kn){let r,a=$e.getTransfer(s);if(n===Yt)return i.UNSIGNED_BYTE;if(n===La)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Da)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Il)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Ll)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Rl)return i.BYTE;if(n===Pl)return i.SHORT;if(n===ds)return i.UNSIGNED_SHORT;if(n===Ia)return i.INT;if(n===dn)return i.UNSIGNED_INT;if(n===fn)return i.FLOAT;if(n===pn)return i.HALF_FLOAT;if(n===Dl)return i.ALPHA;if(n===Nl)return i.RGB;if(n===sn)return i.RGBA;if(n===yn)return i.DEPTH_COMPONENT;if(n===hi)return i.DEPTH_STENCIL;if(n===Ul)return i.RED;if(n===Na)return i.RED_INTEGER;if(n===ui)return i.RG;if(n===Ua)return i.RG_INTEGER;if(n===Fa)return i.RGBA_INTEGER;if(n===nr||n===ir||n===sr||n===rr)if(a===Qe)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===nr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===ir)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===sr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===rr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===nr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===ir)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===sr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===rr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Oa||n===Ba||n===ka||n===za)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Oa)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Ba)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===ka)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===za)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Va||n===Ga||n===Ha||n===Wa||n===Xa||n===ar||n===qa)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Va||n===Ga)return a===Qe?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Ha)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Wa)return r.COMPRESSED_R11_EAC;if(n===Xa)return r.COMPRESSED_SIGNED_R11_EAC;if(n===ar)return r.COMPRESSED_RG11_EAC;if(n===qa)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Ya||n===$a||n===Za||n===Ja||n===Ka||n===ja||n===Qa||n===eo||n===to||n===no||n===io||n===so||n===ro||n===ao)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Ya)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===$a)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Za)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Ja)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Ka)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===ja)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Qa)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===eo)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===to)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===no)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===io)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===so)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===ro)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===ao)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===oo||n===lo||n===co)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===oo)return a===Qe?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===lo)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===co)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===ho||n===uo||n===or||n===fo)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===ho)return r.COMPRESSED_RED_RGTC1_EXT;if(n===uo)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===or)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===fo)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===fs?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var fm=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,pm=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,lc=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Hs(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Qt({vertexShader:fm,fragmentShader:pm,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Ct(new Ws(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},cc=class extends hn{constructor(e,t){super();let n=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,f=null,u=null,p=null,_=null,b=typeof XRWebGLBinding<"u",g=new lc,d={},T=t.getContextAttributes(),I=null,v=null,M=[],w=[],C=new Ue,y=null,E=null,D=new Bt;D.viewport=new dt;let O=new Bt;O.viewport=new dt;let V=[D,O],X=new Ea,N=null,H=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let j=M[q];return j===void 0&&(j=new ns,M[q]=j),j.getTargetRaySpace()},this.getControllerGrip=function(q){let j=M[q];return j===void 0&&(j=new ns,M[q]=j),j.getGripSpace()},this.getHand=function(q){let j=M[q];return j===void 0&&(j=new ns,M[q]=j),j.getHandSpace()};function K(q){let j=w.indexOf(q.inputSource);if(j===-1)return;let xe=M[j];xe!==void 0&&(xe.update(q.inputSource,q.frame,c||a),xe.dispatchEvent({type:q.type,data:q.inputSource}))}function Z(){s.removeEventListener("select",K),s.removeEventListener("selectstart",K),s.removeEventListener("selectend",K),s.removeEventListener("squeeze",K),s.removeEventListener("squeezestart",K),s.removeEventListener("squeezeend",K),s.removeEventListener("end",Z),s.removeEventListener("inputsourceschange",re);for(let q=0;q<M.length;q++){let j=w[q];j!==null&&(w[q]=null,M[q].disconnect(j))}N=null,H=null,g.reset();for(let q in d)delete d[q];if(e.setRenderTarget(I),p=null,u=null,f=null,s=null,v=null,Fe.stop(),n.isPresenting=!1,e.setPixelRatio(y),e.setSize(C.width,C.height,!1),E!==null){let q=E.camera;q.fov=E.fov,q.zoom=E.zoom,q.updateProjectionMatrix(),E=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){r=q,n.isPresenting===!0&&Ie("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){o=q,n.isPresenting===!0&&Ie("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(q){c=q},this.getBaseLayer=function(){return u!==null?u:p},this.getBinding=function(){return f===null&&b&&(f=new XRWebGLBinding(s,t)),f},this.getFrame=function(){return _},this.getSession=function(){return s},this.setSession=async function(q){if(s=q,s!==null){if(I=e.getRenderTarget(),s.addEventListener("select",K),s.addEventListener("selectstart",K),s.addEventListener("selectend",K),s.addEventListener("squeeze",K),s.addEventListener("squeezestart",K),s.addEventListener("squeezeend",K),s.addEventListener("end",Z),s.addEventListener("inputsourceschange",re),T.xrCompatible!==!0&&await t.makeXRCompatible(),y=e.getPixelRatio(),e.getSize(C),b&&"createProjectionLayer"in XRWebGLBinding.prototype){let xe=null,Pe=null,ye=null;T.depth&&(ye=T.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,xe=T.stencil?hi:yn,Pe=T.stencil?fs:dn);let ke={colorFormat:t.RGBA8,depthFormat:ye,scaleFactor:r};f=this.getBinding(),u=f.createProjectionLayer(ke),s.updateRenderState({layers:[u]}),e.setPixelRatio(1),e.setSize(u.textureWidth,u.textureHeight,!1),v=new qt(u.textureWidth,u.textureHeight,{format:sn,type:Yt,depthTexture:new ti(u.textureWidth,u.textureHeight,Pe,void 0,void 0,void 0,void 0,void 0,void 0,xe),stencilBuffer:T.stencil,colorSpace:e.outputColorSpace,samples:T.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}else{let xe={antialias:T.antialias,alpha:!0,depth:T.depth,stencil:T.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,t,xe),s.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),v=new qt(p.framebufferWidth,p.framebufferHeight,{format:sn,type:Yt,colorSpace:e.outputColorSpace,stencilBuffer:T.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1,storeMultisampledDepthBuffer:p.ignoreDepthValues===!1,storeMultisampledStencilBuffer:p.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),Fe.setContext(s),Fe.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function re(q){for(let j=0;j<q.removed.length;j++){let xe=q.removed[j],Pe=w.indexOf(xe);Pe>=0&&(w[Pe]=null,M[Pe].disconnect(xe))}for(let j=0;j<q.added.length;j++){let xe=q.added[j],Pe=w.indexOf(xe);if(Pe===-1){for(let ke=0;ke<M.length;ke++)if(ke>=w.length){w.push(xe),Pe=ke;break}else if(w[ke]===null){w[ke]=xe,Pe=ke;break}if(Pe===-1)break}let ye=M[Pe];ye&&ye.connect(xe)}}let Y=new U,te=new U;function F(q,j,xe){Y.setFromMatrixPosition(j.matrixWorld),te.setFromMatrixPosition(xe.matrixWorld);let Pe=Y.distanceTo(te),ye=j.projectionMatrix.elements,ke=xe.projectionMatrix.elements,vt=ye[14]/(ye[10]-1),Xe=ye[14]/(ye[10]+1),Je=(ye[9]+1)/ye[5],rt=(ye[9]-1)/ye[5],Ye=(ye[8]-1)/ye[0],ut=(ke[8]+1)/ke[0],wt=vt*Ye,Xt=vt*ut,ft=Pe/(-Ye+ut),mt=ft*-Ye;if(j.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX(mt),q.translateZ(ft),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert(),ye[10]===-1)q.projectionMatrix.copy(j.projectionMatrix),q.projectionMatrixInverse.copy(j.projectionMatrixInverse);else{let L=vt+ft,Nt=Xe+ft,et=wt-mt,S=Xt+(Pe-mt),m=Je*Xe/Nt*L,B=rt*Xe/Nt*L;q.projectionMatrix.makePerspective(et,S,m,B,L,Nt),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}}function ne(q,j){j===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(j.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(s===null)return;let j=q.near,xe=q.far;g.texture!==null&&(g.depthNear>0&&(j=g.depthNear),g.depthFar>0&&(xe=g.depthFar)),X.near=O.near=D.near=j,X.far=O.far=D.far=xe,(N!==X.near||H!==X.far)&&(s.updateRenderState({depthNear:X.near,depthFar:X.far}),N=X.near,H=X.far),X.layers.mask=q.layers.mask|6,D.layers.mask=X.layers.mask&-5,O.layers.mask=X.layers.mask&-3;let Pe=q.parent,ye=X.cameras;ne(X,Pe);for(let ke=0;ke<ye.length;ke++)ne(ye[ke],Pe);ye.length===2?F(X,D,O):X.projectionMatrix.copy(D.projectionMatrix),E===null&&q.isPerspectiveCamera&&(E={camera:q,fov:q.fov,zoom:q.zoom}),ae(q,X,Pe)};function ae(q,j,xe){xe===null?q.matrix.copy(j.matrixWorld):(q.matrix.copy(xe.matrixWorld),q.matrix.invert(),q.matrix.multiply(j.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(j.projectionMatrix),q.projectionMatrixInverse.copy(j.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=Qi*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return X},this.getFoveation=function(){if(!(u===null&&p===null))return l},this.setFoveation=function(q){l=q,u!==null&&(u.fixedFoveation=q),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=q)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(X)},this.getCameraTexture=function(q){return d[q]};let Be=null;function De(q,j){if(h=j.getViewerPose(c||a),_=j,h!==null){let xe=h.views;p!==null&&(e.setRenderTargetFramebuffer(v,p.framebuffer),e.setRenderTarget(v));let Pe=!1;xe.length!==X.cameras.length&&(X.cameras.length=0,Pe=!0);for(let Xe=0;Xe<xe.length;Xe++){let Je=xe[Xe],rt=null;if(p!==null)rt=p.getViewport(Je);else{let ut=f.getViewSubImage(u,Je);rt=ut.viewport,Xe===0&&(e.setRenderTargetTextures(v,ut.colorTexture,ut.depthStencilTexture),e.setRenderTarget(v))}let Ye=V[Xe];Ye===void 0&&(Ye=new Bt,Ye.layers.enable(Xe),Ye.viewport=new dt,V[Xe]=Ye),Ye.matrix.fromArray(Je.transform.matrix),Ye.matrix.decompose(Ye.position,Ye.quaternion,Ye.scale),Ye.projectionMatrix.fromArray(Je.projectionMatrix),Ye.projectionMatrixInverse.copy(Ye.projectionMatrix).invert(),Ye.viewport.set(rt.x,rt.y,rt.width,rt.height),Xe===0&&(X.matrix.copy(Ye.matrix),X.matrix.decompose(X.position,X.quaternion,X.scale)),Pe===!0&&X.cameras.push(Ye)}let ye=s.enabledFeatures;if(ye&&ye.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&b){f=n.getBinding();let Xe=f.getDepthInformation(xe[0]);Xe&&Xe.isValid&&Xe.texture&&g.init(Xe,s.renderState)}if(ye&&ye.includes("camera-access")&&b){e.state.unbindTexture(),f=n.getBinding();for(let Xe=0;Xe<xe.length;Xe++){let Je=xe[Xe].camera;if(Je){let rt=d[Je];rt||(rt=new Hs,d[Je]=rt);let Ye=f.getCameraImage(Je);rt.sourceTexture=Ye}}}}for(let xe=0;xe<M.length;xe++){let Pe=w[xe],ye=M[xe];Pe!==null&&ye!==void 0&&ye.update(Pe,j,c||a)}Be&&Be(q,j),j.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:j}),_=null}let Fe=new Nu;Fe.setAnimationLoop(De),this.setAnimationLoop=function(q){Be=q},this.dispose=function(){}}},mm=new lt,zu=new Oe;zu.set(-1,0,0,0,1,0,0,0,1);function gm(i,e){function t(g,d){g.matrixAutoUpdate===!0&&g.updateMatrix(),d.value.copy(g.matrix)}function n(g,d){d.color.getRGB(g.fogColor.value,zl(i)),d.isFog?(g.fogNear.value=d.near,g.fogFar.value=d.far):d.isFogExp2&&(g.fogDensity.value=d.density)}function s(g,d,T,I,v){d.isNodeMaterial?d.uniformsNeedUpdate=!1:d.isMeshBasicMaterial?r(g,d):d.isMeshLambertMaterial?(r(g,d),d.envMap&&(g.envMapIntensity.value=d.envMapIntensity)):d.isMeshToonMaterial?(r(g,d),f(g,d)):d.isMeshPhongMaterial?(r(g,d),h(g,d),d.envMap&&(g.envMapIntensity.value=d.envMapIntensity)):d.isMeshStandardMaterial?(r(g,d),u(g,d),d.isMeshPhysicalMaterial&&p(g,d,v)):d.isMeshMatcapMaterial?(r(g,d),_(g,d)):d.isMeshDepthMaterial?r(g,d):d.isMeshDistanceMaterial?(r(g,d),b(g,d)):d.isMeshNormalMaterial?r(g,d):d.isLineBasicMaterial?(a(g,d),d.isLineDashedMaterial&&o(g,d)):d.isPointsMaterial?l(g,d,T,I):d.isSpriteMaterial?c(g,d):d.isShadowMaterial?(g.color.value.copy(d.color),g.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function r(g,d){g.opacity.value=d.opacity,d.color&&g.diffuse.value.copy(d.color),d.emissive&&g.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(g.map.value=d.map,t(d.map,g.mapTransform)),d.alphaMap&&(g.alphaMap.value=d.alphaMap,t(d.alphaMap,g.alphaMapTransform)),d.bumpMap&&(g.bumpMap.value=d.bumpMap,t(d.bumpMap,g.bumpMapTransform),g.bumpScale.value=d.bumpScale,d.side===Lt&&(g.bumpScale.value*=-1)),d.normalMap&&(g.normalMap.value=d.normalMap,t(d.normalMap,g.normalMapTransform),g.normalScale.value.copy(d.normalScale),d.side===Lt&&g.normalScale.value.negate()),d.displacementMap&&(g.displacementMap.value=d.displacementMap,t(d.displacementMap,g.displacementMapTransform),g.displacementScale.value=d.displacementScale,g.displacementBias.value=d.displacementBias),d.emissiveMap&&(g.emissiveMap.value=d.emissiveMap,t(d.emissiveMap,g.emissiveMapTransform)),d.specularMap&&(g.specularMap.value=d.specularMap,t(d.specularMap,g.specularMapTransform)),d.alphaTest>0&&(g.alphaTest.value=d.alphaTest);let T=e.get(d),I=T.envMap,v=T.envMapRotation;I&&(g.envMap.value=I,g.envMapRotation.value.setFromMatrix4(mm.makeRotationFromEuler(v)).transpose(),I.isCubeTexture&&I.isRenderTargetTexture===!1&&g.envMapRotation.value.premultiply(zu),g.reflectivity.value=d.reflectivity,g.ior.value=d.ior,g.refractionRatio.value=d.refractionRatio),d.lightMap&&(g.lightMap.value=d.lightMap,g.lightMapIntensity.value=d.lightMapIntensity,t(d.lightMap,g.lightMapTransform)),d.aoMap&&(g.aoMap.value=d.aoMap,g.aoMapIntensity.value=d.aoMapIntensity,t(d.aoMap,g.aoMapTransform))}function a(g,d){g.diffuse.value.copy(d.color),g.opacity.value=d.opacity,d.map&&(g.map.value=d.map,t(d.map,g.mapTransform))}function o(g,d){g.dashSize.value=d.dashSize,g.totalSize.value=d.dashSize+d.gapSize,g.scale.value=d.scale}function l(g,d,T,I){g.diffuse.value.copy(d.color),g.opacity.value=d.opacity,g.size.value=d.size*T,g.scale.value=I*.5,d.map&&(g.map.value=d.map,t(d.map,g.uvTransform)),d.alphaMap&&(g.alphaMap.value=d.alphaMap,t(d.alphaMap,g.alphaMapTransform)),d.alphaTest>0&&(g.alphaTest.value=d.alphaTest)}function c(g,d){g.diffuse.value.copy(d.color),g.opacity.value=d.opacity,g.rotation.value=d.rotation,d.map&&(g.map.value=d.map,t(d.map,g.mapTransform)),d.alphaMap&&(g.alphaMap.value=d.alphaMap,t(d.alphaMap,g.alphaMapTransform)),d.alphaTest>0&&(g.alphaTest.value=d.alphaTest)}function h(g,d){g.specular.value.copy(d.specular),g.shininess.value=Math.max(d.shininess,1e-4)}function f(g,d){d.gradientMap&&(g.gradientMap.value=d.gradientMap)}function u(g,d){g.metalness.value=d.metalness,d.metalnessMap&&(g.metalnessMap.value=d.metalnessMap,t(d.metalnessMap,g.metalnessMapTransform)),g.roughness.value=d.roughness,d.roughnessMap&&(g.roughnessMap.value=d.roughnessMap,t(d.roughnessMap,g.roughnessMapTransform)),d.envMap&&(g.envMapIntensity.value=d.envMapIntensity)}function p(g,d,T){g.ior.value=d.ior,d.sheen>0&&(g.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),g.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(g.sheenColorMap.value=d.sheenColorMap,t(d.sheenColorMap,g.sheenColorMapTransform)),d.sheenRoughnessMap&&(g.sheenRoughnessMap.value=d.sheenRoughnessMap,t(d.sheenRoughnessMap,g.sheenRoughnessMapTransform))),d.clearcoat>0&&(g.clearcoat.value=d.clearcoat,g.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(g.clearcoatMap.value=d.clearcoatMap,t(d.clearcoatMap,g.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,t(d.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(g.clearcoatNormalMap.value=d.clearcoatNormalMap,t(d.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===Lt&&g.clearcoatNormalScale.value.negate())),d.dispersion>0&&(g.dispersion.value=d.dispersion),d.retroreflectivity>0&&(g.retroreflectivity.value=d.retroreflectivity),d.iridescence>0&&(g.iridescence.value=d.iridescence,g.iridescenceIOR.value=d.iridescenceIOR,g.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(g.iridescenceMap.value=d.iridescenceMap,t(d.iridescenceMap,g.iridescenceMapTransform)),d.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=d.iridescenceThicknessMap,t(d.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),d.transmission>0&&(g.transmission.value=d.transmission,g.transmissionSamplerMap.value=T.texture,g.transmissionSamplerSize.value.set(T.width,T.height),d.transmissionMap&&(g.transmissionMap.value=d.transmissionMap,t(d.transmissionMap,g.transmissionMapTransform)),g.thickness.value=d.thickness,d.thicknessMap&&(g.thicknessMap.value=d.thicknessMap,t(d.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=d.attenuationDistance,g.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(g.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(g.anisotropyMap.value=d.anisotropyMap,t(d.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=d.specularIntensity,g.specularColor.value.copy(d.specularColor),d.specularColorMap&&(g.specularColorMap.value=d.specularColorMap,t(d.specularColorMap,g.specularColorMapTransform)),d.specularIntensityMap&&(g.specularIntensityMap.value=d.specularIntensityMap,t(d.specularIntensityMap,g.specularIntensityMapTransform))}function _(g,d){d.matcap&&(g.matcap.value=d.matcap)}function b(g,d){let T=e.get(d).light;g.referencePosition.value.setFromMatrixPosition(T.matrixWorld),g.nearDistance.value=T.shadow.camera.near,g.farDistance.value=T.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function _m(i,e,t,n){let s={},r={},a=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(v,M){let w=M.program;n.uniformBlockBinding(v,w)}function c(v,M){let w=s[v.id];w===void 0&&(g(v),w=h(v),s[v.id]=w,v.addEventListener("dispose",T));let C=M.program;n.updateUBOMapping(v,C);let y=e.render.frame;r[v.id]!==y&&(u(v),r[v.id]=y)}function h(v){let M=f();v.__bindingPointIndex=M;let w=i.createBuffer(),C=v.__size,y=v.usage;return i.bindBuffer(i.UNIFORM_BUFFER,w),i.bufferData(i.UNIFORM_BUFFER,C,y),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,M,w),w}function f(){for(let v=0;v<o;v++)if(a.indexOf(v)===-1)return a.push(v),v;return Ne("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(v){let M=s[v.id],w=v.uniforms,C=v.__cache;i.bindBuffer(i.UNIFORM_BUFFER,M);for(let y=0,E=w.length;y<E;y++){let D=w[y];if(Array.isArray(D))for(let O=0,V=D.length;O<V;O++)p(D[O],y,O,C);else p(D,y,0,C)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(v,M,w,C){if(b(v,M,w,C)===!0){let y=v.__offset,E=v.value;if(Array.isArray(E)){let D=0;for(let O=0;O<E.length;O++){let V=E[O],X=d(V);_(V,v.__data,D),typeof V!="number"&&typeof V!="boolean"&&!V.isMatrix3&&!ArrayBuffer.isView(V)&&(D+=X.storage/Float32Array.BYTES_PER_ELEMENT)}}else _(E,v.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,y,v.__data)}}function _(v,M,w){typeof v=="number"||typeof v=="boolean"?M[0]=v:v.isMatrix3?(M[0]=v.elements[0],M[1]=v.elements[1],M[2]=v.elements[2],M[3]=0,M[4]=v.elements[3],M[5]=v.elements[4],M[6]=v.elements[5],M[7]=0,M[8]=v.elements[6],M[9]=v.elements[7],M[10]=v.elements[8],M[11]=0):ArrayBuffer.isView(v)?M.set(new v.constructor(v.buffer,v.byteOffset,M.length)):v.toArray(M,w)}function b(v,M,w,C){let y=v.value,E=M+"_"+w;if(C[E]===void 0)return typeof y=="number"||typeof y=="boolean"?C[E]=y:ArrayBuffer.isView(y)?C[E]=y.slice():C[E]=y.clone(),!0;{let D=C[E];if(typeof y=="number"||typeof y=="boolean"){if(D!==y)return C[E]=y,!0}else{if(ArrayBuffer.isView(y))return!0;if(D.equals(y)===!1)return D.copy(y),!0}}return!1}function g(v){let M=v.uniforms,w=0,C=16;for(let E=0,D=M.length;E<D;E++){let O=Array.isArray(M[E])?M[E]:[M[E]];for(let V=0,X=O.length;V<X;V++){let N=O[V],H=Array.isArray(N.value)?N.value:[N.value];for(let K=0,Z=H.length;K<Z;K++){let re=H[K],Y=d(re),te=w%C,F=te%Y.boundary,ne=te+F;w+=F,ne!==0&&C-ne<Y.storage&&(w+=C-ne),N.__data=new Float32Array(Y.storage/Float32Array.BYTES_PER_ELEMENT),N.__offset=w,w+=Y.storage}}}let y=w%C;return y>0&&(w+=C-y),v.__size=w,v.__cache={},this}function d(v){let M={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(M.boundary=4,M.storage=4):v.isVector2?(M.boundary=8,M.storage=8):v.isVector3||v.isColor?(M.boundary=16,M.storage=12):v.isVector4?(M.boundary=16,M.storage=16):v.isMatrix3?(M.boundary=48,M.storage=48):v.isMatrix4?(M.boundary=64,M.storage=64):v.isTexture?Ie("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(v)?(M.boundary=16,M.storage=v.byteLength):Ie("WebGLRenderer: Unsupported uniform value type.",v),M}function T(v){let M=v.target;M.removeEventListener("dispose",T);let w=a.indexOf(M.__bindingPointIndex);a.splice(w,1),i.deleteBuffer(s[M.id]),delete s[M.id],delete r[M.id]}function I(){for(let v in s)i.deleteBuffer(s[v]);a=[],s={},r={}}return{bind:l,update:c,dispose:I}}var xm=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Mn=null;function ym(){return Mn===null&&(Mn=new aa(xm,16,16,ui,pn),Mn.name="DFG_LUT",Mn.minFilter=Pt,Mn.magFilter=Pt,Mn.wrapS=xn,Mn.wrapT=xn,Mn.generateMipmaps=!1,Mn.needsUpdate=!0),Mn}var bo=class{constructor(e={}){let{canvas:t=ru(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:u=!1,outputBufferType:p=Yt}=e;this.isWebGLRenderer=!0;let _;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");_=n.getContextAttributes().alpha}else _=a;let b=p,g=new Set([Fa,Ua,Na]),d=new Set([Yt,dn,ds,fs,La,Da]),T=new Uint32Array(4),I=new Int32Array(4),v=new U,M=null,w=null,C=[],y=[],E=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=un,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let D=this,O=!1,V=null,X=null,N=null,H=null;this._outputColorSpace=Gt;let K=0,Z=0,re=null,Y=-1,te=null,F=new dt,ne=new dt,ae=null,Be=new He(0),De=0,Fe=t.width,q=t.height,j=1,xe=null,Pe=null,ye=new dt(0,0,Fe,q),ke=new dt(0,0,Fe,q),vt=!1,Xe=new is,Je=!1,rt=!1,Ye=new lt,ut=new U,wt=new dt,Xt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},ft=!1;function mt(){return re===null?j:1}let L=n;function Nt(x,R){return t.getContext(x,R)}let et,S,m,B,G,$,le,ce,J,ee,he,Ae,pe,ue,Ce,Le,ze,P,de,Q,fe,ve,se;try{let x={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:f};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"186"}`),t.addEventListener("webglcontextlost",at,!1),t.addEventListener("webglcontextrestored",Ke,!1),t.addEventListener("webglcontextcreationerror",rn,!1),L===null){let R="webgl2";if(L=Nt(R,x),L===null)throw Nt(R)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Re()}catch(x){throw t.removeEventListener("webglcontextlost",at,!1),t.removeEventListener("webglcontextrestored",Ke,!1),t.removeEventListener("webglcontextcreationerror",rn,!1),Ne("WebGLRenderer: "+x.message),x}function Re(){et=new Tp(L),et.init(),fe=new dm(L,et),S=new gp(L,et,e,fe),m=new hm(L,et),S.reversedDepthBuffer&&u&&m.buffers.depth.setReversed(!0),X=L.createFramebuffer(),N=L.createFramebuffer(),H=L.createFramebuffer(),B=new Rp(L),G=new J2,$=new um(L,et,m,G,S,fe,B),le=new Ep(D),ce=new P1(L),ve=new pp(L,ce),J=new Ap(L,ce,B,ve),ee=new Ip(L,J,ce,ve,B),P=new Pp(L,S,$),Ce=new _p(G),he=new Z2(D,le,et,S,ve,Ce),Ae=new gm(D,G),pe=new j2,ue=new sm(et),ze=new fp(D,le,m,ee,_,l),Le=new cm(D,ee,S),se=new _m(L,B,S,m),de=new mp(L,et,B),Q=new Cp(L,et,B),B.programs=he.programs,D.capabilities=S,D.extensions=et,D.properties=G,D.renderLists=pe,D.shadowMap=Le,D.state=m,D.info=B}b!==Yt&&(E=new Dp(b,t.width,t.height,o,s,r));let Ee=new cc(D,L);this.xr=Ee,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){let x=et.get("WEBGL_lose_context");x&&x.loseContext()},this.forceContextRestore=function(){let x=et.get("WEBGL_lose_context");x&&x.restoreContext()},this.getPixelRatio=function(){return j},this.setPixelRatio=function(x){x!==void 0&&(j=x,this.setSize(Fe,q,!1))},this.getSize=function(x){return x.set(Fe,q)},this.setSize=function(x,R,W=!0){if(Ee.isPresenting){Ie("WebGLRenderer: Can't change size while VR device is presenting.");return}Fe=x,q=R,t.width=Math.floor(x*j),t.height=Math.floor(R*j),W===!0&&(t.style.width=x+"px",t.style.height=R+"px"),E!==null&&E.setSize(t.width,t.height),this.setViewport(0,0,x,R)},this.getDrawingBufferSize=function(x){return x.set(Fe*j,q*j).floor()},this.setDrawingBufferSize=function(x,R,W){Fe=x,q=R,j=W,t.width=Math.floor(x*W),t.height=Math.floor(R*W),this.setViewport(0,0,x,R)},this.setEffects=function(x){if(b===Yt){Ne("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(x){for(let R=0;R<x.length;R++)if(x[R].isOutputPass===!0){Ie("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}E.setEffects(x||[])},this.getCurrentViewport=function(x){return x.copy(F)},this.getViewport=function(x){return x.copy(ye)},this.setViewport=function(x,R,W,k){x.isVector4?ye.set(x.x,x.y,x.z,x.w):ye.set(x,R,W,k),m.viewport(F.copy(ye).multiplyScalar(j).round())},this.getScissor=function(x){return x.copy(ke)},this.setScissor=function(x,R,W,k){x.isVector4?ke.set(x.x,x.y,x.z,x.w):ke.set(x,R,W,k),m.scissor(ne.copy(ke).multiplyScalar(j).round())},this.getScissorTest=function(){return vt},this.setScissorTest=function(x){m.setScissorTest(vt=x)},this.setOpaqueSort=function(x){xe=x},this.setTransparentSort=function(x){Pe=x},this.getClearColor=function(x){return x.copy(ze.getClearColor())},this.setClearColor=function(){ze.setClearColor(...arguments)},this.getClearAlpha=function(){return ze.getClearAlpha()},this.setClearAlpha=function(){ze.setClearAlpha(...arguments)},this.clear=function(x=!0,R=!0,W=!0){let k=0;if(x){let z=!1;if(re!==null){let _e=re.texture.format;z=g.has(_e)}if(z){let _e=re.texture.type,Se=d.has(_e),ge=ze.getClearColor(),Me=ze.getClearAlpha(),Te=ge.r,Ve=ge.g,qe=ge.b;Se?(T[0]=Te,T[1]=Ve,T[2]=qe,T[3]=Me,L.clearBufferuiv(L.COLOR,0,T)):(I[0]=Te,I[1]=Ve,I[2]=qe,I[3]=Me,L.clearBufferiv(L.COLOR,0,I))}else k|=L.COLOR_BUFFER_BIT}R&&(k|=L.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),W&&(k|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),k!==0&&L.clear(k)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(x){x.setRenderer(this),V=x},this.dispose=function(){t.removeEventListener("webglcontextlost",at,!1),t.removeEventListener("webglcontextrestored",Ke,!1),t.removeEventListener("webglcontextcreationerror",rn,!1),ze.dispose(),pe.dispose(),ue.dispose(),G.dispose(),le.dispose(),ee.dispose(),ve.dispose(),se.dispose(),he.dispose(),Ee.dispose(),Ee.removeEventListener("sessionstart",Bc),Ee.removeEventListener("sessionend",kc),gi.stop()};function at(x){x.preventDefault(),Ol("WebGLRenderer: Context Lost."),O=!0}function Ke(){Ol("WebGLRenderer: Context Restored."),O=!1;let x=B.autoReset,R=Le.enabled,W=Le.autoUpdate,k=Le.needsUpdate,z=Le.type;Re(),B.autoReset=x,Le.enabled=R,Le.autoUpdate=W,Le.needsUpdate=k,Le.type=z}function rn(x){Ne("WebGLRenderer: A WebGL context could not be created. Reason: ",x.statusMessage)}function mn(x){let R=x.target;R.removeEventListener("dispose",mn),Td(R)}function Td(x){Ad(x),G.remove(x)}function Ad(x){let R=G.get(x).programs;R!==void 0&&(R.forEach(function(W){he.releaseProgram(W)}),x.isShaderMaterial&&he.releaseShaderCache(x))}this.renderBufferDirect=function(x,R,W,k,z,_e){R===null&&(R=Xt);let Se=z.isMesh&&z.matrixWorld.determinantAffine()<0,ge=Pd(x,R,W,k,z);m.setMaterial(k,Se);let Me=W.index,Te=1;if(k.wireframe===!0){if(Me=J.getWireframeAttribute(W),Me===void 0)return;Te=2}let Ve=W.drawRange,qe=W.attributes.position,we=Ve.start*Te,je=(Ve.start+Ve.count)*Te;_e!==null&&(we=Math.max(we,_e.start*Te),je=Math.min(je,(_e.start+_e.count)*Te)),Me!==null?(we=Math.max(we,0),je=Math.min(je,Me.count)):qe!=null&&(we=Math.max(we,0),je=Math.min(je,qe.count));let gt=je-we;if(gt<0||gt===1/0)return;ve.setup(z,k,ge,W,Me);let ct,st=de;if(Me!==null&&(ct=ce.get(Me),st=Q,st.setIndex(ct)),z.isMesh)k.wireframe===!0?(m.setLineWidth(k.wireframeLinewidth*mt()),st.setMode(L.LINES)):st.setMode(L.TRIANGLES);else if(z.isLine){let Ut=k.linewidth;Ut===void 0&&(Ut=1),m.setLineWidth(Ut*mt()),z.isLineSegments?st.setMode(L.LINES):z.isLineLoop?st.setMode(L.LINE_LOOP):st.setMode(L.LINE_STRIP)}else z.isPoints?st.setMode(L.POINTS):z.isSprite&&st.setMode(L.TRIANGLES);if(z.isBatchedMesh)if(et.get("WEBGL_multi_draw"))st.renderMultiDraw(z._multiDrawStarts,z._multiDrawCounts,z._multiDrawCount);else{let Ut=z._multiDrawStarts,be=z._multiDrawCounts,zt=z._multiDrawCount,Ze=Me?ce.get(Me).bytesPerElement:1,tn=G.get(k).currentProgram.getUniforms();for(let gn=0;gn<zt;gn++)tn.setValue(L,"_gl_DrawID",gn),st.render(Ut[gn]/Ze,be[gn])}else if(z.isInstancedMesh)st.renderInstances(we,gt,z.count);else if(W.isInstancedBufferGeometry){let Ut=W._maxInstanceCount!==void 0?W._maxInstanceCount:1/0,be=Math.min(W.instanceCount,Ut);st.renderInstances(we,gt,be)}else st.render(we,gt)};function Oc(x,R,W,k){V!==null&&x.isNodeMaterial&&V.setObject(k,x),Je===!0&&Ce.setState(x,W,!1),x.transparent===!0&&x.side===bn&&x.forceSinglePass===!1?(x.side=Lt,x.needsUpdate=!0,yr(x,R,k),x.side=oi,x.needsUpdate=!0,yr(x,R,k),x.side=bn):yr(x,R,k)}this.compile=function(x,R,W=null){W===null&&(W=x),V!==null&&V.renderStart(x,R,W),w=ue.get(W),w.init(R),y.push(w),W.traverseVisible(function(z){z.isLight&&z.layers.test(R.layers)&&(w.pushLight(z),z.castShadow&&w.pushShadow(z))}),x!==W&&x.traverseVisible(function(z){z.isLight&&z.layers.test(R.layers)&&(w.pushLight(z),z.castShadow&&w.pushShadow(z))}),w.setupLights(),V!==null&&V.updateLights(w.state.lightsArray),rt=this.localClippingEnabled,Je=Ce.init(this.clippingPlanes,rt),Je===!0&&Ce.setGlobalState(this.clippingPlanes,R),V!==null&&Le.render(w.state.shadowsArray,W,R);let k=new Set;return x.traverse(function(z){if(!(z.isMesh||z.isPoints||z.isLine||z.isSprite))return;let _e=z.material;if(_e)if(Array.isArray(_e))for(let Se=0;Se<_e.length;Se++){let ge=_e[Se];Oc(ge,W,R,z),k.add(ge)}else Oc(_e,W,R,z),k.add(_e)}),w=y.pop(),V!==null&&V.renderEnd(),k},this.compileAsync=function(x,R,W=null){let k=this.compile(x,R,W);return new Promise(z=>{function _e(){if(k.forEach(function(Se){let Me=G.get(Se).currentProgram;(Me===void 0||Me.isReady())&&k.delete(Se)}),k.size===0){z(x);return}setTimeout(_e,10)}et.get("KHR_parallel_shader_compile")!==null?_e():setTimeout(_e,10)})};let Fo=null;function Cd(x){Fo&&Fo(x)}function Bc(){gi.stop()}function kc(){gi.start()}let gi=new Nu;gi.setAnimationLoop(Cd),typeof self<"u"&&gi.setContext(self),this.setAnimationLoop=function(x){Fo=x,Ee.setAnimationLoop(x),x===null?gi.stop():gi.start()},Ee.addEventListener("sessionstart",Bc),Ee.addEventListener("sessionend",kc),this.render=function(x,R){if(R!==void 0&&R.isCamera!==!0){Ne("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(O===!0)return;V!==null&&V.renderStart(x,R);let W=Ee.enabled===!0&&Ee.isPresenting===!0,k=E!==null&&(re===null||W)&&E.begin(D,re);if(x.matrixWorldAutoUpdate===!0&&x.updateMatrixWorld(),R.parent===null&&R.matrixWorldAutoUpdate===!0&&R.updateMatrixWorld(),Ee.enabled===!0&&Ee.isPresenting===!0&&(E===null||E.isCompositing()===!1)&&(Ee.cameraAutoUpdate===!0&&Ee.updateCamera(R),R=Ee.getCamera()),x.isScene===!0&&x.onBeforeRender(D,x,R,re),w=ue.get(x,y.length),w.init(R),w.state.textureUnits=$.getTextureUnits(),y.push(w),Ye.multiplyMatrices(R.projectionMatrix,R.matrixWorldInverse),Xe.setFromProjectionMatrix(Ye,cn,R.reversedDepth),rt=this.localClippingEnabled,Je=Ce.init(this.clippingPlanes,rt),M=pe.get(x,C.length),M.init(),C.push(M),Ee.enabled===!0&&Ee.isPresenting===!0){let Se=D.xr.getDepthSensingMesh();Se!==null&&Oo(Se,R,-1/0,D.sortObjects)}Oo(x,R,0,D.sortObjects),M.finish(),V!==null&&V.updateLights(w.state.lightsArray),D.sortObjects===!0&&M.sort(xe,Pe),ft=Ee.enabled===!1||Ee.isPresenting===!1||Ee.hasDepthSensing()===!1,ft&&ze.addToRenderList(M,x),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Je===!0&&Ce.beginShadows();let z=w.state.shadowsArray;if(Le.render(z,x,R),Je===!0&&Ce.endShadows(),(k&&E.hasRenderPass())===!1){let Se=M.opaque,ge=M.transmissive;if(w.setupLights(),R.isArrayCamera){let Me=R.cameras;if(ge.length>0)for(let Te=0,Ve=Me.length;Te<Ve;Te++){let qe=Me[Te];Vc(Se,ge,x,qe)}ft&&ze.render(x);for(let Te=0,Ve=Me.length;Te<Ve;Te++){let qe=Me[Te];zc(M,x,qe,qe.viewport)}}else ge.length>0&&Vc(Se,ge,x,R),ft&&ze.render(x),zc(M,x,R)}re!==null&&Z===0&&($.updateMultisampleRenderTarget(re),$.updateRenderTargetMipmap(re)),k&&E.end(D),x.isScene===!0&&x.onAfterRender(D,x,R),ve.resetDefaultState(),Y=-1,te=null,y.pop(),y.length>0?(w=y[y.length-1],$.setTextureUnits(w.state.textureUnits),Je===!0&&Ce.setGlobalState(D.clippingPlanes,w.state.camera)):w=null,C.pop(),C.length>0?M=C[C.length-1]:M=null,V!==null&&V.renderEnd()};function Oo(x,R,W,k){if(x.visible===!1)return;if(x.layers.test(R.layers)){if(x.isGroup)W=x.renderOrder;else if(x.isLOD)x.autoUpdate===!0&&x.update(R);else if(x.isLightProbeGrid)w.pushLightProbeGrid(x);else if(x.isLight)w.pushLight(x),x.castShadow&&w.pushShadow(x);else if(x.isSprite){if(!x.frustumCulled||x.intersectsFrustum(Xe)){k&&wt.setFromMatrixPosition(x.matrixWorld).applyMatrix4(Ye);let Se=ee.update(x),ge=x.material;ge.visible&&M.push(x,Se,ge,W,wt.z,null,R)}}else if((x.isMesh||x.isLine||x.isPoints)&&(!x.frustumCulled||x.intersectsFrustum(Xe))){let Se=ee.update(x),ge=x.material;if(k&&(x.boundingSphere!==void 0?(x.boundingSphere===null&&x.computeBoundingSphere(),wt.copy(x.boundingSphere.center)):(Se.boundingSphere===null&&Se.computeBoundingSphere(),wt.copy(Se.boundingSphere.center)),wt.applyMatrix4(x.matrixWorld).applyMatrix4(Ye)),Array.isArray(ge)){let Me=Se.groups;for(let Te=0,Ve=Me.length;Te<Ve;Te++){let qe=Me[Te],we=ge[qe.materialIndex];we&&we.visible&&M.push(x,Se,we,W,wt.z,qe,R)}}else ge.visible&&M.push(x,Se,ge,W,wt.z,null,R)}}let _e=x.children;for(let Se=0,ge=_e.length;Se<ge;Se++)Oo(_e[Se],R,W,k)}function zc(x,R,W,k){let{opaque:z,transmissive:_e,transparent:Se}=x;w.setupLightsView(W),Je===!0&&Ce.setGlobalState(D.clippingPlanes,W),k&&m.viewport(F.copy(k)),z.length>0&&xr(z,R,W),_e.length>0&&xr(_e,R,W),Se.length>0&&xr(Se,R,W),m.buffers.depth.setTest(!0),m.buffers.depth.setMask(!0),m.buffers.color.setMask(!0),m.setPolygonOffset(!1)}function Vc(x,R,W,k){if((W.isScene===!0?W.overrideMaterial:null)!==null)return;if(w.state.transmissionRenderTarget[k.id]===void 0){let we=et.has("EXT_color_buffer_half_float")||et.has("EXT_color_buffer_float");w.state.transmissionRenderTarget[k.id]=new qt(1,1,{generateMipmaps:!0,type:we?pn:Yt,minFilter:ci,samples:Math.max(4,S.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:$e.workingColorSpace})}let _e=w.state.transmissionRenderTarget[k.id],Se=k.viewport||F;_e.setSize(Se.z*D.transmissionResolutionScale,Se.w*D.transmissionResolutionScale);let ge=D.getRenderTarget(),Me=D.getActiveCubeFace(),Te=D.getActiveMipmapLevel();D.setRenderTarget(_e),D.getClearColor(Be),De=D.getClearAlpha(),De<1&&D.setClearColor(16777215,.5),D.clear(),ft&&ze.render(W);let Ve=D.toneMapping;D.toneMapping=un;let qe=k.viewport;if(k.viewport!==void 0&&(k.viewport=void 0),w.setupLightsView(k),Je===!0&&Ce.setGlobalState(D.clippingPlanes,k),xr(x,W,k),$.updateMultisampleRenderTarget(_e),$.updateRenderTargetMipmap(_e),et.has("WEBGL_multisampled_render_to_texture")===!1){let we=!1;for(let je=0,gt=R.length;je<gt;je++){let ct=R[je],{object:st,geometry:Ut,material:be,group:zt}=ct;if(be.side===bn&&st.layers.test(k.layers)){let Ze=be.side;be.side=Lt,be.needsUpdate=!0,Gc(st,W,k,Ut,be,zt),be.side=Ze,be.needsUpdate=!0,we=!0}}we===!0&&($.updateMultisampleRenderTarget(_e),$.updateRenderTargetMipmap(_e))}D.setRenderTarget(ge,Me,Te),D.setClearColor(Be,De),qe!==void 0&&(k.viewport=qe),D.toneMapping=Ve}function xr(x,R,W){let k=R.isScene===!0?R.overrideMaterial:null;for(let z=0,_e=x.length;z<_e;z++){let Se=x[z],{object:ge,geometry:Me,group:Te}=Se,Ve=Se.material;Ve.allowOverride===!0&&k!==null&&(Ve=k),ge.layers.test(W.layers)&&Gc(ge,R,W,Me,Ve,Te)}}function Gc(x,R,W,k,z,_e){V!==null&&z.isNodeMaterial&&V.setObject(x,z),x.onBeforeRender(D,R,W,k,z,_e),x.modelViewMatrix.multiplyMatrices(W.matrixWorldInverse,x.matrixWorld),x.normalMatrix.getNormalMatrix(x.modelViewMatrix),z.onBeforeRender(D,R,W,k,x,_e),z.transparent===!0&&z.side===bn&&z.forceSinglePass===!1?(z.side=Lt,z.needsUpdate=!0,D.renderBufferDirect(W,R,k,z,x,_e),z.side=oi,z.needsUpdate=!0,D.renderBufferDirect(W,R,k,z,x,_e),z.side=bn):D.renderBufferDirect(W,R,k,z,x,_e),x.onAfterRender(D,R,W,k,z,_e)}function yr(x,R,W){R.isScene!==!0&&(R=Xt);let k=G.get(x),z=w.state.lights,_e=w.state.shadowsArray,Se=z.state.version,ge=he.getParameters(x,z.state,_e,R,W,w.state.lightProbeGridArray),Me=he.getProgramCacheKey(ge),Te=k.programs;k.environment=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?R.environment:null,k.fog=R.fog;let Ve=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap;k.envMap=le.get(x.envMap||k.environment,Ve),k.envMapRotation=k.environment!==null&&x.envMap===null?R.environmentRotation:x.envMapRotation,Te===void 0&&(x.addEventListener("dispose",mn),Te=new Map,k.programs=Te);let qe=Te.get(Me);if(qe!==void 0){if(k.currentProgram===qe&&k.lightsStateVersion===Se)return Wc(x,ge),qe}else ge.uniforms=he.getUniforms(x),V!==null&&x.isNodeMaterial&&V.build(x,W,ge),x.onBeforeCompile(ge,D),qe=he.acquireProgram(ge,Me),Te.set(Me,qe),k.uniforms=ge.uniforms;let we=k.uniforms;return(!x.isShaderMaterial&&!x.isRawShaderMaterial||x.clipping===!0)&&(we.clippingPlanes=Ce.uniform),Wc(x,ge),k.needsLights=Ld(x),k.lightsStateVersion=Se,k.needsLights&&(we.ambientLightColor.value=z.state.ambient,we.lightProbe.value=z.state.probe,we.sunLights.value=z.state.sun,we.sunLightShadows.value=z.state.sunShadow,we.directionalLights.value=z.state.directional,we.directionalLightShadows.value=z.state.directionalShadow,we.spotLights.value=z.state.spot,we.spotLightShadows.value=z.state.spotShadow,we.rectAreaLights.value=z.state.rectArea,we.ltc_1.value=z.state.rectAreaLTC1,we.ltc_2.value=z.state.rectAreaLTC2,we.pointLights.value=z.state.point,we.pointLightShadows.value=z.state.pointShadow,we.hemisphereLights.value=z.state.hemi,we.sunShadowMatrix.value=z.state.sunShadowMatrix,we.sunShadowCascade.value=z.state.sunShadowCascade,we.directionalShadowMatrix.value=z.state.directionalShadowMatrix,we.spotLightMatrix.value=z.state.spotLightMatrix,we.spotLightMap.value=z.state.spotLightMap,we.pointShadowMatrix.value=z.state.pointShadowMatrix),k.lightProbeGrid=w.state.lightProbeGridArray.length>0,k.currentProgram=qe,k.uniformsList=null,qe}function Hc(x){if(x.uniformsList===null){let R=x.currentProgram.getUniforms();x.uniformsList=_s.seqWithValue(R.seq,x.uniforms)}return x.uniformsList}function Wc(x,R){let W=G.get(x);W.outputColorSpace=R.outputColorSpace,W.batching=R.batching,W.batchingColor=R.batchingColor,W.instancing=R.instancing,W.instancingColor=R.instancingColor,W.instancingMorph=R.instancingMorph,W.skinning=R.skinning,W.morphTargets=R.morphTargets,W.morphNormals=R.morphNormals,W.morphColors=R.morphColors,W.morphTargetsCount=R.morphTargetsCount,W.numClippingPlanes=R.numClippingPlanes,W.numIntersection=R.numClipIntersection,W.vertexAlphas=R.vertexAlphas,W.vertexTangents=R.vertexTangents,W.toneMapping=R.toneMapping}function Rd(x,R){if(x.length===0)return null;if(x.length===1)return x[0].texture!==null?x[0]:null;v.setFromMatrixPosition(R.matrixWorld);for(let W=0,k=x.length;W<k;W++){let z=x[W];if(z.texture!==null&&z.boundingBox.containsPoint(v))return z}return null}function Pd(x,R,W,k,z){R.isScene!==!0&&(R=Xt),$.resetTextureUnits();let _e=R.fog,Se=k.isMeshStandardMaterial||k.isMeshLambertMaterial||k.isMeshPhongMaterial?R.environment:null,ge=re===null?D.outputColorSpace:re.isXRRenderTarget===!0?re.texture.colorSpace:$e.workingColorSpace,Me=k.isMeshStandardMaterial||k.isMeshLambertMaterial&&!k.envMap||k.isMeshPhongMaterial&&!k.envMap,Te=le.get(k.envMap||Se,Me),Ve=k.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,qe=!!W.attributes.tangent&&(!!k.normalMap||k.anisotropy>0),we=!!W.morphAttributes.position,je=!!W.morphAttributes.normal,gt=!!W.morphAttributes.color,ct=un;k.toneMapped&&(re===null||re.isXRRenderTarget===!0)&&(ct=D.toneMapping);let st=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,Ut=st!==void 0?st.length:0,be=G.get(k),zt=w.state.lights;if(Je===!0&&(rt===!0||x!==te)){let ot=x===te&&k.id===Y;Ce.setState(k,x,ot)}let Ze=!1;k.version===be.__version?(be.needsLights&&be.lightsStateVersion!==zt.state.version||be.outputColorSpace!==ge||z.isBatchedMesh&&be.batching===!1||!z.isBatchedMesh&&be.batching===!0||z.isBatchedMesh&&be.batchingColor===!0&&z._colorsTexture===null||z.isBatchedMesh&&be.batchingColor===!1&&z._colorsTexture!==null||z.isInstancedMesh&&be.instancing===!1||!z.isInstancedMesh&&be.instancing===!0||z.isSkinnedMesh&&be.skinning===!1||!z.isSkinnedMesh&&be.skinning===!0||z.isInstancedMesh&&be.instancingColor===!0&&z.instanceColor===null||z.isInstancedMesh&&be.instancingColor===!1&&z.instanceColor!==null||z.isInstancedMesh&&be.instancingMorph===!0&&z.morphTexture===null||z.isInstancedMesh&&be.instancingMorph===!1&&z.morphTexture!==null||be.envMap!==Te||k.fog===!0&&be.fog!==_e||be.numClippingPlanes!==void 0&&(be.numClippingPlanes!==Ce.numPlanes||be.numIntersection!==Ce.numIntersection)||be.vertexAlphas!==Ve||be.vertexTangents!==qe||be.morphTargets!==we||be.morphNormals!==je||be.morphColors!==gt||be.toneMapping!==ct||be.morphTargetsCount!==Ut||!!be.lightProbeGrid!=w.state.lightProbeGridArray.length>0)&&(Ze=!0):(Ze=!0,be.__version=k.version);let tn=be.currentProgram;Ze===!0&&(tn=yr(k,R,z),V&&k.isNodeMaterial&&V.onUpdateProgram(k,tn,be));let gn=!1,Gn=!1,Ii=!1,it=tn.getUniforms(),pt=be.uniforms;if(m.useProgram(tn.program)&&(gn=!0,Gn=!0,Ii=!0),k.id!==Y&&(Y=k.id,Gn=!0),be.needsLights){let ot=Rd(w.state.lightProbeGridArray,z);be.lightProbeGrid!==ot&&(be.lightProbeGrid=ot,Gn=!0)}if(gn||te!==x){m.buffers.depth.getReversed()&&x.reversedDepth!==!0&&(x._reversedDepth=!0,x.updateProjectionMatrix()),it.setValue(L,"projectionMatrix",x.projectionMatrix),it.setValue(L,"viewMatrix",x.matrixWorldInverse);let Wn=it.map.cameraPosition;Wn!==void 0&&Wn.setValue(L,ut.setFromMatrixPosition(x.matrixWorld)),S.logarithmicDepthBuffer&&it.setValue(L,"logDepthBufFC",2/(Math.log(x.far+1)/Math.LN2)),(k.isMeshPhongMaterial||k.isMeshToonMaterial||k.isMeshLambertMaterial||k.isMeshBasicMaterial||k.isMeshStandardMaterial||k.isShaderMaterial)&&it.setValue(L,"isOrthographic",x.isOrthographicCamera===!0),te!==x&&(te=x,Gn=!0,Ii=!0)}if(be.needsLights&&(zt.state.sunShadowMap.length>0&&it.setValue(L,"sunShadowMap",zt.state.sunShadowMap,$),zt.state.directionalShadowMap.length>0&&it.setValue(L,"directionalShadowMap",zt.state.directionalShadowMap,$),zt.state.spotShadowMap.length>0&&it.setValue(L,"spotShadowMap",zt.state.spotShadowMap,$),zt.state.pointShadowMap.length>0&&it.setValue(L,"pointShadowMap",zt.state.pointShadowMap,$)),z.isSkinnedMesh){it.setOptional(L,z,"bindMatrix"),it.setOptional(L,z,"bindMatrixInverse");let ot=z.skeleton;ot&&(ot.boneTexture===null&&ot.computeBoneTexture(),it.setValue(L,"boneTexture",ot.boneTexture,$))}z.isBatchedMesh&&(it.setOptional(L,z,"batchingTexture"),it.setValue(L,"batchingTexture",z._matricesTexture,$),it.setOptional(L,z,"batchingIdTexture"),it.setValue(L,"batchingIdTexture",z._indirectTexture,$),it.setOptional(L,z,"batchingColorTexture"),z._colorsTexture!==null&&it.setValue(L,"batchingColorTexture",z._colorsTexture,$));let Hn=W.morphAttributes;if((Hn.position!==void 0||Hn.normal!==void 0||Hn.color!==void 0)&&P.update(z,W,tn),(Gn||be.receiveShadow!==z.receiveShadow)&&(be.receiveShadow=z.receiveShadow,it.setValue(L,"receiveShadow",z.receiveShadow)),(k.isMeshStandardMaterial||k.isMeshLambertMaterial||k.isMeshPhongMaterial)&&k.envMap===null&&R.environment!==null&&(pt.envMapIntensity.value=R.environmentIntensity),pt.dfgLUT!==void 0&&(pt.dfgLUT.value=ym()),Gn){if(it.setValue(L,"toneMappingExposure",D.toneMappingExposure),be.needsLights&&Id(pt,Ii),_e&&k.fog===!0&&Ae.refreshFogUniforms(pt,_e),Ae.refreshMaterialUniforms(pt,k,j,q,w.state.transmissionRenderTarget[x.id]),be.needsLights&&be.lightProbeGrid){let ot=be.lightProbeGrid;pt.probesSH.value=ot.texture,pt.probesMin.value.copy(ot.boundingBox.min),pt.probesMax.value.copy(ot.boundingBox.max),pt.probesResolution.value.copy(ot.resolution)}_s.upload(L,Hc(be),pt,$)}if(k.isShaderMaterial&&k.uniformsNeedUpdate===!0&&(_s.upload(L,Hc(be),pt,$),k.uniformsNeedUpdate=!1),k.isSpriteMaterial&&it.setValue(L,"center",z.center),it.setValue(L,"modelViewMatrix",z.modelViewMatrix),it.setValue(L,"normalMatrix",z.normalMatrix),it.setValue(L,"modelMatrix",z.matrixWorld),k.uniformsGroups!==void 0){let ot=k.uniformsGroups;for(let Wn=0,Li=ot.length;Wn<Li;Wn++){let qc=ot[Wn];se.update(qc,tn),se.bind(qc,tn)}}return tn}function Id(x,R){x.ambientLightColor.needsUpdate=R,x.lightProbe.needsUpdate=R,x.sunLights.needsUpdate=R,x.sunLightShadows.needsUpdate=R,x.directionalLights.needsUpdate=R,x.directionalLightShadows.needsUpdate=R,x.pointLights.needsUpdate=R,x.pointLightShadows.needsUpdate=R,x.spotLights.needsUpdate=R,x.spotLightShadows.needsUpdate=R,x.rectAreaLights.needsUpdate=R,x.hemisphereLights.needsUpdate=R}function Ld(x){return x.isMeshLambertMaterial||x.isMeshToonMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isShadowMaterial||x.isShaderMaterial&&x.lights===!0}this.getActiveCubeFace=function(){return K},this.getActiveMipmapLevel=function(){return Z},this.getRenderTarget=function(){return re},this.setRenderTargetTextures=function(x,R,W){let k=G.get(x);k.__autoAllocateDepthBuffer=x.resolveDepthBuffer===!1,k.__autoAllocateDepthBuffer===!1&&(k.__useRenderToTexture=!1),G.get(x.texture).__webglTexture=R,G.get(x.depthTexture).__webglTexture=k.__autoAllocateDepthBuffer?void 0:W,k.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(x,R){let W=G.get(x);W.__webglFramebuffer=R,W.__useDefaultFramebuffer=R===void 0},this.setRenderTarget=function(x,R=0,W=0){re=x,K=R,Z=W;let k=null,z=!1,_e=!1;if(x){let ge=G.get(x);if(ge.__useDefaultFramebuffer!==void 0){m.bindFramebuffer(L.FRAMEBUFFER,ge.__webglFramebuffer),F.copy(x.viewport),ne.copy(x.scissor),ae=x.scissorTest,m.viewport(F),m.scissor(ne),m.setScissorTest(ae),Y=-1;return}else if(ge.__webglFramebuffer===void 0)$.setupRenderTarget(x);else if(ge.__hasExternalTextures)$.rebindTextures(x,G.get(x.texture).__webglTexture,G.get(x.depthTexture).__webglTexture);else if(x.depthBuffer){let Ve=x.depthTexture;if(ge.__boundDepthTexture!==Ve){if(Ve!==null&&G.has(Ve)&&(x.width!==Ve.image.width||x.height!==Ve.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");$.setupDepthRenderbuffer(x)}}let Me=x.texture;(Me.isData3DTexture||Me.isDataArrayTexture||Me.isCompressedArrayTexture)&&(_e=!0);let Te=G.get(x).__webglFramebuffer;x.isWebGLCubeRenderTarget?(Array.isArray(Te[R])?k=Te[R][W]:k=Te[R],z=!0):x.samples>0&&$.useMultisampledRTT(x)===!1?k=G.get(x).__webglMultisampledFramebuffer:Array.isArray(Te)?k=Te[W]:k=Te,F.copy(x.viewport),ne.copy(x.scissor),ae=x.scissorTest}else F.copy(ye).multiplyScalar(j).floor(),ne.copy(ke).multiplyScalar(j).floor(),ae=vt;if(W!==0&&(k=X),m.bindFramebuffer(L.FRAMEBUFFER,k)&&m.drawBuffers(x,k),m.viewport(F),m.scissor(ne),m.setScissorTest(ae),z){let ge=G.get(x.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+R,ge.__webglTexture,W)}else if(_e){let ge=R;for(let Me=0;Me<x.textures.length;Me++){let Te=G.get(x.textures[Me]);L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0+Me,Te.__webglTexture,W,ge)}}else if(x!==null&&W!==0){let ge=G.get(x.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,ge.__webglTexture,W)}Y=-1};function Xc(x){let R=G.get(x);return(R.__readFormat!==x.format||R.__readType!==x.type)&&(R.__readFormat=x.format,R.__readType=x.type,R.__formatReadable=S.textureFormatReadable(x.format),R.__typeReadable=S.textureTypeReadable(x.type)),R}this.readRenderTargetPixels=function(x,R,W,k,z,_e,Se,ge=0){if(!(x&&x.isWebGLRenderTarget)){Ne("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Me=G.get(x).__webglFramebuffer;if(x.isWebGLCubeRenderTarget&&Se!==void 0&&(Me=Me[Se]),Me){m.bindFramebuffer(L.FRAMEBUFFER,Me);try{let Te=x.textures[ge],Ve=Te.format,qe=Te.type;x.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+ge);let we=Xc(Te);if(we.__formatReadable===!1){Ne("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(we.__typeReadable===!1){Ne("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}R>=0&&R<=x.width-k&&W>=0&&W<=x.height-z&&L.readPixels(R,W,k,z,fe.convert(Ve),fe.convert(qe),_e)}finally{let Te=re!==null?G.get(re).__webglFramebuffer:null;m.bindFramebuffer(L.FRAMEBUFFER,Te)}}},this.readRenderTargetPixelsAsync=async function(x,R,W,k,z,_e,Se,ge=0){if(!(x&&x.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Me=G.get(x).__webglFramebuffer;if(x.isWebGLCubeRenderTarget&&Se!==void 0&&(Me=Me[Se]),Me)if(R>=0&&R<=x.width-k&&W>=0&&W<=x.height-z){m.bindFramebuffer(L.FRAMEBUFFER,Me);let Te=x.textures[ge],Ve=Te.format,qe=Te.type;x.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+ge);let we=Xc(Te);if(we.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(we.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let je=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,je),L.bufferData(L.PIXEL_PACK_BUFFER,_e.byteLength,L.STREAM_READ),L.readPixels(R,W,k,z,fe.convert(Ve),fe.convert(qe),0),L.bindBuffer(L.PIXEL_PACK_BUFFER,null);let gt=re!==null?G.get(re).__webglFramebuffer:null;m.bindFramebuffer(L.FRAMEBUFFER,gt);let ct=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await ou(L,ct,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,je),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,_e),L.bindBuffer(L.PIXEL_PACK_BUFFER,null),L.deleteBuffer(je),L.deleteSync(ct),_e}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(x,R=null,W=0){let k=Math.pow(2,-W),z=Math.floor(x.image.width*k),_e=Math.floor(x.image.height*k),Se=R!==null?R.x:0,ge=R!==null?R.y:0;$.setTexture2D(x,0),L.copyTexSubImage2D(L.TEXTURE_2D,W,0,0,Se,ge,z,_e),m.unbindTexture()},this.copyTextureToTexture=function(x,R,W=null,k=null,z=0,_e=0){let Se,ge,Me,Te,Ve,qe,we,je,gt,ct=x.isCompressedTexture?x.mipmaps[_e]:x.image;if(W!==null)Se=W.max.x-W.min.x,ge=W.max.y-W.min.y,Me=W.isBox3?W.max.z-W.min.z:1,Te=W.min.x,Ve=W.min.y,qe=W.isBox3?W.min.z:0;else{let pt=Math.pow(2,-z);Se=Math.floor(ct.width*pt),ge=Math.floor(ct.height*pt),x.isDataArrayTexture?Me=ct.depth:x.isData3DTexture?Me=Math.floor(ct.depth*pt):Me=1,Te=0,Ve=0,qe=0}k!==null?(we=k.x,je=k.y,gt=k.z):(we=0,je=0,gt=0);let st=fe.convert(R.format),Ut=fe.convert(R.type),be;R.isData3DTexture?($.setTexture3D(R,0),be=L.TEXTURE_3D):R.isDataArrayTexture||R.isCompressedArrayTexture?($.setTexture2DArray(R,0),be=L.TEXTURE_2D_ARRAY):($.setTexture2D(R,0),be=L.TEXTURE_2D),m.activeTexture(L.TEXTURE0),m.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,R.flipY),m.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,R.premultiplyAlpha),m.pixelStorei(L.UNPACK_ALIGNMENT,R.unpackAlignment);let zt=m.getParameter(L.UNPACK_ROW_LENGTH),Ze=m.getParameter(L.UNPACK_IMAGE_HEIGHT),tn=m.getParameter(L.UNPACK_SKIP_PIXELS),gn=m.getParameter(L.UNPACK_SKIP_ROWS),Gn=m.getParameter(L.UNPACK_SKIP_IMAGES);m.pixelStorei(L.UNPACK_ROW_LENGTH,ct.width),m.pixelStorei(L.UNPACK_IMAGE_HEIGHT,ct.height),m.pixelStorei(L.UNPACK_SKIP_PIXELS,Te),m.pixelStorei(L.UNPACK_SKIP_ROWS,Ve),m.pixelStorei(L.UNPACK_SKIP_IMAGES,qe);let Ii=x.isDataArrayTexture||x.isData3DTexture,it=R.isDataArrayTexture||R.isData3DTexture;if(x.isDepthTexture){let pt=G.get(x),Hn=G.get(R),ot=G.get(pt.__renderTarget),Wn=G.get(Hn.__renderTarget);m.bindFramebuffer(L.READ_FRAMEBUFFER,ot.__webglFramebuffer),m.bindFramebuffer(L.DRAW_FRAMEBUFFER,Wn.__webglFramebuffer);for(let Li=0;Li<Me;Li++)Ii&&(L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,G.get(x).__webglTexture,z,qe+Li),L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,G.get(R).__webglTexture,_e,gt+Li)),L.blitFramebuffer(Te,Ve,Se,ge,we,je,Se,ge,L.DEPTH_BUFFER_BIT,L.NEAREST);m.bindFramebuffer(L.READ_FRAMEBUFFER,null),m.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else if(z!==0||x.isRenderTargetTexture||G.has(x)){let pt=G.get(x),Hn=G.get(R);m.bindFramebuffer(L.READ_FRAMEBUFFER,N),m.bindFramebuffer(L.DRAW_FRAMEBUFFER,H);for(let ot=0;ot<Me;ot++)Ii?L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,pt.__webglTexture,z,qe+ot):L.framebufferTexture2D(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,pt.__webglTexture,z),it?L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Hn.__webglTexture,_e,gt+ot):L.framebufferTexture2D(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Hn.__webglTexture,_e),z!==0?L.blitFramebuffer(Te,Ve,Se,ge,we,je,Se,ge,L.COLOR_BUFFER_BIT,L.NEAREST):it?L.copyTexSubImage3D(be,_e,we,je,gt+ot,Te,Ve,Se,ge):L.copyTexSubImage2D(be,_e,we,je,Te,Ve,Se,ge);m.bindFramebuffer(L.READ_FRAMEBUFFER,null),m.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else it?x.isDataTexture||x.isData3DTexture?L.texSubImage3D(be,_e,we,je,gt,Se,ge,Me,st,Ut,ct.data):R.isCompressedArrayTexture?L.compressedTexSubImage3D(be,_e,we,je,gt,Se,ge,Me,st,ct.data):L.texSubImage3D(be,_e,we,je,gt,Se,ge,Me,st,Ut,ct):x.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,_e,we,je,Se,ge,st,Ut,ct.data):x.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,_e,we,je,ct.width,ct.height,st,ct.data):L.texSubImage2D(L.TEXTURE_2D,_e,we,je,Se,ge,st,Ut,ct);m.pixelStorei(L.UNPACK_ROW_LENGTH,zt),m.pixelStorei(L.UNPACK_IMAGE_HEIGHT,Ze),m.pixelStorei(L.UNPACK_SKIP_PIXELS,tn),m.pixelStorei(L.UNPACK_SKIP_ROWS,gn),m.pixelStorei(L.UNPACK_SKIP_IMAGES,Gn),_e===0&&R.generateMipmaps&&L.generateMipmap(be),m.unbindTexture()},this.initRenderTarget=function(x){G.get(x).__webglFramebuffer===void 0&&$.setupRenderTarget(x)},this.initTexture=function(x){x.isCubeTexture?$.setTextureCube(x,0):x.isData3DTexture?$.setTexture3D(x,0):x.isDataArrayTexture||x.isCompressedArrayTexture?$.setTexture2DArray(x,0):$.setTexture2D(x,0),m.unbindTexture()},this.resetState=function(){K=0,Z=0,re=null,m.reset(),ve.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return cn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=$e._getDrawingBufferColorSpace(e),t.unpackColorSpace=$e._getUnpackColorSpace()}};var Vu={type:"change"},uc={type:"start"},Hu={type:"end"},wo=new Fn,Gu=new Kt,vm=Math.cos(70*kl.DEG2RAD),Mt=new U,$t=2*Math.PI,tt={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},hc=1e-6,Eo=class extends js{constructor(e,t=null){super(e,t),this.state=tt.NONE,this.target=new U,this.cursor=new U,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:ri.ROTATE,MIDDLE:ri.DOLLY,RIGHT:ri.PAN},this.touches={ONE:ai.ROTATE,TWO:ai.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new U,this._lastQuaternion=new jt,this._lastTargetPosition=new U,this._quat=new jt().setFromUnitVectors(e.up,new U(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new cs,this._sphericalDelta=new cs,this._scale=1,this._panOffset=new U,this._rotateStart=new Ue,this._rotateEnd=new Ue,this._rotateDelta=new Ue,this._panStart=new Ue,this._panEnd=new Ue,this._panDelta=new Ue,this._dollyStart=new Ue,this._dollyEnd=new Ue,this._dollyDelta=new Ue,this._dollyDirection=new U,this._mouse=new Ue,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=Sm.bind(this),this._onPointerDown=bm.bind(this),this._onPointerUp=Mm.bind(this),this._onContextMenu=Pm.bind(this),this._onMouseWheel=Tm.bind(this),this._onKeyDown=Am.bind(this),this._onTouchStart=Cm.bind(this),this._onTouchMove=Rm.bind(this),this._onMouseDown=wm.bind(this),this._onMouseMove=Em.bind(this),this._interceptControlDown=Im.bind(this),this._interceptControlUp=Lm.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.state=tt.NONE,this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents();let e=this.domElement.getRootNode();e.removeEventListener("keydown",this._interceptControlDown,{capture:!0}),e.removeEventListener("keyup",this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction="",this.domElement.style.cursor="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Vu),this.update(),this.state=tt.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){let t=this.object.position;Mt.copy(t).sub(this.target),Mt.applyQuaternion(this._quat),this._spherical.setFromVector3(Mt),this.autoRotate&&this.state===tt.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=$t:n>Math.PI&&(n-=$t),s<-Math.PI?s+=$t:s>Math.PI&&(s-=$t),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=a!=this._spherical.radius}if(Mt.setFromSpherical(this._spherical),Mt.applyQuaternion(this._quatInverse),t.copy(this.target).add(Mt),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){let o=Mt.length();a=this._clampDistance(o*this._scale);let l=o-a;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){let o=new U(this._mouse.x,this._mouse.y,0);o.unproject(this.object);let l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;let c=new U(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(o),this.object.updateMatrixWorld(),a=Mt.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(wo.origin.copy(this.object.position),wo.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(wo.direction))<vm?this.object.lookAt(this.target):(Gu.setFromNormalAndCoplanarPoint(this.object.up,this.target),wo.intersectPlane(Gu,this.target))))}else if(this.object.isOrthographicCamera){let a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>hc||8*(1-this._lastQuaternion.dot(this.object.quaternion))>hc||this._lastTargetPosition.distanceToSquared(this.target)>hc?(this.dispatchEvent(Vu),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?$t/60*this.autoRotateSpeed*e:$t/60/60*this.autoRotateSpeed}_getZoomScale(e){let t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Mt.setFromMatrixColumn(t,0),Mt.multiplyScalar(-e),this._panOffset.add(Mt)}_panUp(e,t){this.screenSpacePanning===!0?Mt.setFromMatrixColumn(t,1):(Mt.setFromMatrixColumn(t,0),Mt.crossVectors(this.object.up,Mt)),Mt.multiplyScalar(e),this._panOffset.add(Mt)}_pan(e,t){let n=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;Mt.copy(s).sub(this.target);let r=Mt.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/n.clientHeight,this.object.matrix),this._panUp(2*t*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),s=e-n.left,r=t-n.top,a=n.width,o=n.height;this._mouse.x=s/a*2-1,this._mouse.y=-(r/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft($t*this._rotateDelta.x/t.clientHeight),this._rotateUp($t*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp($t*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-$t*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft($t*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-$t*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panStart.set(n,s)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(n*n+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let n=this._getSecondPointerPosition(e),s=.5*(e.pageX+n.x),r=.5*(e.pageY+n.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft($t*this._rotateDelta.x/t.clientHeight),this._rotateUp($t*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let a=(e.pageX+t.x)*.5,o=(e.pageY+t.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new Ue,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,n={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function bm(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function Sm(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function Mm(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Hu),this.state=tt.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:let e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function wm(i){let e;switch(i.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case ri.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=tt.DOLLY;break;case ri.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=tt.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=tt.ROTATE}break;case ri.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=tt.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=tt.PAN}break;default:this.state=tt.NONE}this.state!==tt.NONE&&this.dispatchEvent(uc)}function Em(i){switch(this.state){case tt.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case tt.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case tt.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function Tm(i){this.enabled===!1||this.enableZoom===!1||this.state!==tt.NONE||(i.preventDefault(),this.dispatchEvent(uc),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(Hu))}function Am(i){this.enabled!==!1&&this._handleKeyDown(i)}function Cm(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case ai.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(i),this.state=tt.TOUCH_ROTATE;break;case ai.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(i),this.state=tt.TOUCH_PAN;break;default:this.state=tt.NONE}break;case 2:switch(this.touches.TWO){case ai.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=tt.TOUCH_DOLLY_PAN;break;case ai.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=tt.TOUCH_DOLLY_ROTATE;break;default:this.state=tt.NONE}break;default:this.state=tt.NONE}this.state!==tt.NONE&&this.dispatchEvent(uc)}function Rm(i){switch(this._trackPointer(i),this.state){case tt.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case tt.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case tt.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case tt.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=tt.NONE}}function Pm(i){this.enabled!==!1&&i.preventDefault()}function Im(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function Lm(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var Wu={type:"FeatureCollection",name:"ne_110m_land",crs:{type:"name",properties:{name:"urn:ogc:def:crs:OGC:1.3:CRS84"}},features:[{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[-66.290031,-81.000327,-59.572095,-79.628679],geometry:{type:"Polygon",coordinates:[[[-59.572095,-80.040179],[-59.865849,-80.549657],[-60.159656,-81.000327],[-62.255393,-80.863178],[-64.488125,-80.921934],[-65.741666,-80.588827],[-65.741666,-80.549657],[-66.290031,-80.255773],[-64.037688,-80.294944],[-61.883246,-80.39287],[-61.138976,-79.981371],[-60.610119,-79.628679],[-59.572095,-80.040179]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[-163.712896,-79.634209,-159.208184,-78.223338],geometry:{type:"Polygon",coordinates:[[[-159.208184,-79.497059],[-161.127601,-79.634209],[-162.439847,-79.281465],[-163.027408,-78.928774],[-163.066604,-78.869966],[-163.712896,-78.595667],[-163.712896,-78.595667],[-163.105801,-78.223338],[-161.245113,-78.380176],[-160.246208,-78.693645],[-159.482405,-79.046338],[-159.208184,-79.497059]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:0},bbox:[-54.164259,-81.025442,-43.333267,-77.831476],geometry:{type:"Polygon",coordinates:[[[-45.154758,-78.04707],[-43.920828,-78.478103],[-43.48995,-79.08556],[-43.372438,-79.516645],[-43.333267,-80.026123],[-44.880537,-80.339644],[-46.506174,-80.594357],[-48.386421,-80.829485],[-50.482107,-81.025442],[-52.851988,-80.966685],[-54.164259,-80.633528],[-53.987991,-80.222028],[-51.853134,-79.94773],[-50.991326,-79.614623],[-50.364595,-79.183487],[-49.914131,-78.811209],[-49.306959,-78.458569],[-48.660616,-78.047018],[-48.660616,-78.047019],[-48.151396,-78.04707],[-46.662857,-77.831476],[-45.154758,-78.04707]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[-122.621735,-74.08881,-118.724143,-73.324619],geometry:{type:"Polygon",coordinates:[[[-121.211511,-73.50099],[-119.918851,-73.657725],[-118.724143,-73.481353],[-119.292119,-73.834097],[-120.232217,-74.08881],[-121.62283,-74.010468],[-122.621735,-73.657778],[-122.621735,-73.657777],[-122.406245,-73.324619],[-121.211511,-73.50099]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[-127.28313,-73.873268,-124.031882,-73.246226],geometry:{type:"Polygon",coordinates:[[[-125.559566,-73.481353],[-124.031882,-73.873268],[-124.619469,-73.834097],[-125.912181,-73.736118],[-127.28313,-73.461769],[-127.28313,-73.461768],[-126.558472,-73.246226],[-125.559566,-73.481353]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[-102.330725,-72.521205,-96.20035,-71.717792],geometry:{type:"Polygon",coordinates:[[[-98.98155,-71.933334],[-97.884743,-72.070535],[-96.787937,-71.952971],[-96.20035,-72.521205],[-96.983765,-72.442864],[-98.198083,-72.482035],[-99.432013,-72.442864],[-100.783455,-72.50162],[-101.801868,-72.305663],[-102.330725,-71.894164],[-102.330725,-71.894164],[-101.703967,-71.717792],[-100.430919,-71.854993],[-98.98155,-71.933334]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[-75.012625,-72.503842,-68.333834,-68.87874],geometry:{type:"Polygon",coordinates:[[[-68.451346,-70.955823],[-68.333834,-71.406493],[-68.510128,-71.798407],[-68.784297,-72.170736],[-69.959471,-72.307885],[-71.075889,-72.503842],[-72.388134,-72.484257],[-71.8985,-72.092343],[-73.073622,-72.229492],[-74.19004,-72.366693],[-74.953895,-72.072757],[-75.012625,-71.661258],[-73.915819,-71.269345],[-73.915819,-71.269344],[-73.230331,-71.15178],[-72.074717,-71.190951],[-71.780962,-70.681473],[-71.72218,-70.309196],[-71.741791,-69.505782],[-71.173815,-69.035475],[-70.253252,-68.87874],[-69.724447,-69.251017],[-69.489422,-69.623346],[-69.058518,-70.074016],[-68.725541,-70.505153],[-68.451346,-70.955823]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[-180,-90,180,-63.27066],geometry:{type:"Polygon",coordinates:[[[-58.614143,-64.152467],[-59.045073,-64.36801],[-59.789342,-64.211223],[-60.611928,-64.309202],[-61.297416,-64.54433],[-62.0221,-64.799094],[-62.51176,-65.09303],[-62.648858,-65.484942],[-62.590128,-65.857219],[-62.120079,-66.190326],[-62.805567,-66.425505],[-63.74569,-66.503847],[-64.294106,-66.837004],[-64.881693,-67.150474],[-65.508425,-67.58161],[-65.665082,-67.953887],[-65.312545,-68.365335],[-64.783715,-68.678908],[-63.961103,-68.913984],[-63.1973,-69.227556],[-62.785955,-69.619419],[-62.570516,-69.991747],[-62.276736,-70.383661],[-61.806661,-70.716768],[-61.512906,-71.089045],[-61.375809,-72.010074],[-61.081977,-72.382351],[-61.003661,-72.774265],[-60.690269,-73.166179],[-60.827367,-73.695242],[-61.375809,-74.106742],[-61.96337,-74.439848],[-63.295201,-74.576997],[-63.74569,-74.92974],[-64.352836,-75.262847],[-65.860987,-75.635124],[-67.192818,-75.79191],[-68.446282,-76.007452],[-69.797724,-76.222995],[-70.600724,-76.634494],[-72.206776,-76.673665],[-73.969536,-76.634494],[-75.555977,-76.712887],[-77.24037,-76.712887],[-76.926979,-77.104802],[-75.399294,-77.28107],[-74.282876,-77.55542],[-73.656119,-77.908112],[-74.772536,-78.221633],[-76.4961,-78.123654],[-77.925858,-78.378419],[-77.984666,-78.789918],[-78.023785,-79.181833],[-76.848637,-79.514939],[-76.633224,-79.887216],[-75.360097,-80.259545],[-73.244852,-80.416331],[-71.442946,-80.69063],[-70.013163,-81.004151],[-68.191646,-81.317672],[-65.704279,-81.474458],[-63.25603,-81.748757],[-61.552026,-82.042692],[-59.691416,-82.37585],[-58.712121,-82.846106],[-58.222487,-83.218434],[-57.008117,-82.865691],[-55.362894,-82.571755],[-53.619771,-82.258235],[-51.543644,-82.003521],[-49.76135,-81.729171],[-47.273931,-81.709586],[-44.825708,-81.846735],[-42.808363,-82.081915],[-42.16202,-81.65083],[-40.771433,-81.356894],[-38.244818,-81.337309],[-36.26667,-81.121715],[-34.386397,-80.906172],[-32.310296,-80.769023],[-30.097098,-80.592651],[-28.549802,-80.337938],[-29.254901,-79.985195],[-29.685805,-79.632503],[-29.685805,-79.260226],[-31.624808,-79.299397],[-33.681324,-79.456132],[-35.639912,-79.456132],[-35.914107,-79.083855],[-35.77701,-78.339248],[-35.326546,-78.123654],[-33.896763,-77.888526],[-32.212369,-77.65345],[-30.998051,-77.359515],[-29.783732,-77.065579],[-28.882779,-76.673665],[-27.511752,-76.497345],[-26.160336,-76.360144],[-25.474822,-76.281803],[-23.927552,-76.24258],[-22.458598,-76.105431],[-21.224694,-75.909474],[-20.010375,-75.674346],[-18.913543,-75.439218],[-17.522982,-75.125698],[-16.641589,-74.79254],[-15.701491,-74.498604],[-15.40771,-74.106742],[-16.46532,-73.871614],[-16.112784,-73.460114],[-15.446855,-73.146542],[-14.408805,-72.950585],[-13.311973,-72.715457],[-12.293508,-72.401936],[-11.510067,-72.010074],[-11.020433,-71.539767],[-10.295774,-71.265416],[-9.101015,-71.324224],[-8.611381,-71.65733],[-7.416622,-71.696501],[-7.377451,-71.324224],[-6.868232,-70.93231],[-5.790985,-71.030289],[-5.536375,-71.402617],[-4.341667,-71.461373],[-3.048981,-71.285053],[-1.795492,-71.167438],[-.659489,-71.226246],[-.228637,-71.637745],[.868195,-71.304639],[1.886686,-71.128267],[3.022638,-70.991118],[4.139055,-70.853917],[5.157546,-70.618789],[6.273912,-70.462055],[7.13572,-70.246512],[7.742866,-69.893769],[8.48711,-70.148534],[9.525135,-70.011333],[10.249845,-70.48164],[10.817821,-70.834332],[11.953824,-70.638375],[12.404287,-70.246512],[13.422778,-69.972162],[14.734998,-70.030918],[15.126757,-70.403247],[15.949342,-70.030918],[17.026589,-69.913354],[18.201711,-69.874183],[19.259373,-69.893769],[20.375739,-70.011333],[21.452985,-70.07014],[21.923034,-70.403247],[22.569403,-70.697182],[23.666184,-70.520811],[24.841357,-70.48164],[25.977309,-70.48164],[27.093726,-70.462055],[28.09258,-70.324854],[29.150242,-70.20729],[30.031583,-69.93294],[30.971733,-69.75662],[31.990172,-69.658641],[32.754053,-69.384291],[33.302443,-68.835642],[33.870419,-68.502588],[34.908495,-68.659271],[35.300202,-69.012014],[36.16201,-69.247142],[37.200035,-69.168748],[37.905108,-69.52144],[38.649404,-69.776205],[39.667894,-69.541077],[40.020431,-69.109941],[40.921358,-68.933621],[41.959434,-68.600514],[42.938702,-68.463313],[44.113876,-68.267408],[44.897291,-68.051866],[45.719928,-67.816738],[46.503343,-67.601196],[47.44344,-67.718759],[48.344419,-67.366068],[48.990736,-67.091718],[49.930885,-67.111303],[50.753471,-66.876175],[50.949325,-66.523484],[51.791547,-66.249133],[52.614133,-66.053176],[53.613038,-65.89639],[54.53355,-65.818049],[55.414943,-65.876805],[56.355041,-65.974783],[57.158093,-66.249133],[57.255968,-66.680218],[58.137361,-67.013324],[58.744508,-67.287675],[59.939318,-67.405239],[60.605221,-67.679589],[61.427806,-67.953887],[62.387489,-68.012695],[63.19049,-67.816738],[64.052349,-67.405239],[64.992447,-67.620729],[65.971715,-67.738345],[66.911864,-67.855909],[67.891133,-67.934302],[68.890038,-67.934302],[69.712624,-68.972791],[69.673453,-69.227556],[69.555941,-69.678226],[68.596258,-69.93294],[67.81274,-70.305268],[67.949889,-70.697182],[69.066307,-70.677545],[68.929157,-71.069459],[68.419989,-71.441788],[67.949889,-71.853287],[68.71377,-72.166808],[69.869307,-72.264787],[71.024895,-72.088415],[71.573285,-71.696501],[71.906288,-71.324224],[72.454627,-71.010703],[73.08141,-70.716768],[73.33602,-70.364024],[73.864877,-69.874183],[74.491557,-69.776205],[75.62756,-69.737034],[76.626465,-69.619419],[77.644904,-69.462684],[78.134539,-69.07077],[78.428371,-68.698441],[79.113859,-68.326216],[80.093127,-68.071503],[80.93535,-67.875546],[81.483792,-67.542388],[82.051767,-67.366068],[82.776426,-67.209282],[83.775331,-67.30726],[84.676206,-67.209282],[85.655527,-67.091718],[86.752359,-67.150474],[87.477017,-66.876175],[87.986289,-66.209911],[88.358411,-66.484261],[88.828408,-66.954568],[89.67063,-67.150474],[90.630365,-67.228867],[91.5901,-67.111303],[92.608539,-67.189696],[93.548637,-67.209282],[94.17542,-67.111303],[95.017591,-67.170111],[95.781472,-67.385653],[96.682399,-67.248504],[97.759646,-67.248504],[98.68021,-67.111303],[99.718182,-67.248504],[100.384188,-66.915346],[100.893356,-66.58224],[101.578896,-66.30789],[102.832411,-65.563284],[103.478676,-65.700485],[104.242557,-65.974783],[104.90846,-66.327527],[106.181561,-66.934931],[107.160881,-66.954568],[108.081393,-66.954568],[109.15864,-66.837004],[110.235835,-66.699804],[111.058472,-66.425505],[111.74396,-66.13157],[112.860378,-66.092347],[113.604673,-65.876805],[114.388088,-66.072762],[114.897308,-66.386283],[115.602381,-66.699804],[116.699161,-66.660633],[117.384701,-66.915346],[118.57946,-67.170111],[119.832924,-67.268089],[120.871,-67.189696],[121.654415,-66.876175],[122.320369,-66.562654],[123.221296,-66.484261],[124.122274,-66.621462],[125.160247,-66.719389],[126.100396,-66.562654],[127.001427,-66.562654],[127.882768,-66.660633],[128.80328,-66.758611],[129.704259,-66.58224],[130.781454,-66.425505],[131.799945,-66.386283],[132.935896,-66.386283],[133.85646,-66.288304],[134.757387,-66.209963],[135.031582,-65.72007],[135.070753,-65.308571],[135.697485,-65.582869],[135.873805,-66.033591],[136.206705,-66.44509],[136.618049,-66.778197],[137.460271,-66.954568],[138.596223,-66.895761],[139.908442,-66.876175],[140.809421,-66.817367],[142.121692,-66.817367],[143.061842,-66.797782],[144.374061,-66.837004],[145.490427,-66.915346],[146.195552,-67.228867],[145.999699,-67.601196],[146.646067,-67.895131],[147.723263,-68.130259],[148.839629,-68.385024],[150.132314,-68.561292],[151.483705,-68.71813],[152.502247,-68.874813],[153.638199,-68.894502],[154.284567,-68.561292],[155.165857,-68.835642],[155.92979,-69.149215],[156.811132,-69.384291],[158.025528,-69.482269],[159.181013,-69.599833],[159.670699,-69.991747],[160.80665,-70.226875],[161.570479,-70.579618],[162.686897,-70.736353],[163.842434,-70.716768],[164.919681,-70.775524],[166.11444,-70.755938],[167.309095,-70.834332],[168.425616,-70.971481],[169.463589,-71.20666],[170.501665,-71.402617],[171.20679,-71.696501],[171.089227,-72.088415],[170.560422,-72.441159],[170.109958,-72.891829],[169.75737,-73.24452],[169.287321,-73.65602],[167.975101,-73.812806],[167.387489,-74.165498],[166.094803,-74.38104],[165.644391,-74.772954],[164.958851,-75.145283],[164.234193,-75.458804],[163.822797,-75.870303],[163.568239,-76.24258],[163.47026,-76.693302],[163.489897,-77.065579],[164.057873,-77.457442],[164.273363,-77.82977],[164.743464,-78.182514],[166.604126,-78.319611],[166.995781,-78.750748],[165.193876,-78.907483],[163.666217,-79.123025],[161.766385,-79.162248],[160.924162,-79.730482],[160.747894,-80.200737],[160.316964,-80.573066],[159.788211,-80.945395],[161.120016,-81.278501],[161.629287,-81.690001],[162.490992,-82.062278],[163.705336,-82.395435],[165.095949,-82.708956],[166.604126,-83.022477],[168.895665,-83.335998],[169.404782,-83.825891],[172.283934,-84.041433],[172.477049,-84.117914],[173.224083,-84.41371],[175.985672,-84.158997],[178.277212,-84.472518],[180,-84.71338],[180,-90],[-180,-90],[-180,-84.71338],[-179.942499,-84.721443],[-179.058677,-84.139412],[-177.256772,-84.452933],[-177.140807,-84.417941],[-176.861993,-84.333812],[-176.523952,-84.231811],[-176.230303,-84.143203],[-176.084673,-84.099259],[-175.934101,-84.101591],[-175.829882,-84.117914],[-174.382503,-84.534323],[-173.116559,-84.117914],[-172.889106,-84.061019],[-169.951223,-83.884647],[-168.999989,-84.117914],[-168.530199,-84.23739],[-167.022099,-84.570497],[-164.182144,-84.82521],[-161.929775,-85.138731],[-158.07138,-85.37391],[-155.192253,-85.09956],[-150.942099,-85.295517],[-148.533073,-85.609038],[-145.888918,-85.315102],[-143.107718,-85.040752],[-142.892279,-84.570497],[-146.829068,-84.531274],[-150.060732,-84.296146],[-150.902928,-83.904232],[-153.586201,-83.68869],[-153.409907,-83.23802],[-153.037759,-82.82652],[-152.665637,-82.454192],[-152.861517,-82.042692],[-154.526299,-81.768394],[-155.29018,-81.41565],[-156.83745,-81.102129],[-154.408787,-81.160937],[-152.097662,-81.004151],[-150.648293,-81.337309],[-148.865998,-81.043373],[-147.22075,-80.671045],[-146.417749,-80.337938],[-146.770286,-79.926439],[-148.062947,-79.652089],[-149.531901,-79.358205],[-151.588416,-79.299397],[-153.390322,-79.162248],[-155.329376,-79.064269],[-155.975668,-78.69194],[-157.268302,-78.378419],[-158.051768,-78.025676],[-158.365134,-76.889207],[-157.875474,-76.987238],[-156.974573,-77.300759],[-155.329376,-77.202728],[-153.742832,-77.065579],[-152.920247,-77.496664],[-151.33378,-77.398737],[-150.00195,-77.183143],[-148.748486,-76.908845],[-147.612483,-76.575738],[-146.104409,-76.47776],[-146.143528,-76.105431],[-146.496091,-75.733154],[-146.20231,-75.380411],[-144.909624,-75.204039],[-144.322037,-75.537197],[-142.794353,-75.34124],[-141.638764,-75.086475],[-140.209007,-75.06689],[-138.85759,-74.968911],[-137.5062,-74.733783],[-136.428901,-74.518241],[-135.214583,-74.302699],[-134.431194,-74.361455],[-133.745654,-74.439848],[-132.257168,-74.302699],[-130.925311,-74.479019],[-129.554284,-74.459433],[-128.242038,-74.322284],[-126.890622,-74.420263],[-125.402082,-74.518241],[-124.011496,-74.479019],[-122.562152,-74.498604],[-121.073613,-74.518241],[-119.70256,-74.479019],[-118.684145,-74.185083],[-117.469801,-74.028348],[-116.216312,-74.243891],[-115.021552,-74.067519],[-113.944331,-73.714828],[-113.297988,-74.028348],[-112.945452,-74.38104],[-112.299083,-74.714198],[-111.261059,-74.420263],[-110.066325,-74.79254],[-108.714909,-74.910103],[-107.559346,-75.184454],[-106.149148,-75.125698],[-104.876074,-74.949326],[-103.367949,-74.988497],[-102.016507,-75.125698],[-100.645531,-75.302018],[-100.1167,-74.870933],[-100.763043,-74.537826],[-101.252703,-74.185083],[-102.545337,-74.106742],[-103.113313,-73.734413],[-103.328752,-73.362084],[-103.681289,-72.61753],[-102.917485,-72.754679],[-101.60524,-72.813436],[-100.312528,-72.754679],[-99.13738,-72.911414],[-98.118889,-73.20535],[-97.688037,-73.558041],[-96.336595,-73.616849],[-95.043961,-73.4797],[-93.672907,-73.283743],[-92.439003,-73.166179],[-91.420564,-73.401307],[-90.088733,-73.322914],[-89.226951,-72.558722],[-88.423951,-73.009393],[-87.268337,-73.185764],[-86.014822,-73.087786],[-85.192236,-73.4797],[-83.879991,-73.518871],[-82.665646,-73.636434],[-81.470913,-73.851977],[-80.687447,-73.4797],[-80.295791,-73.126956],[-79.296886,-73.518871],[-77.925858,-73.420892],[-76.907367,-73.636434],[-76.221879,-73.969541],[-74.890049,-73.871614],[-73.852024,-73.65602],[-72.833533,-73.401307],[-71.619215,-73.264157],[-70.209042,-73.146542],[-68.935916,-73.009393],[-67.956622,-72.79385],[-67.369061,-72.480329],[-67.134036,-72.049244],[-67.251548,-71.637745],[-67.56494,-71.245831],[-67.917477,-70.853917],[-68.230843,-70.462055],[-68.485452,-70.109311],[-68.544209,-69.717397],[-68.446282,-69.325535],[-67.976233,-68.953206],[-67.5845,-68.541707],[-67.427843,-68.149844],[-67.62367,-67.718759],[-67.741183,-67.326845],[-67.251548,-66.876175],[-66.703184,-66.58224],[-66.056815,-66.209963],[-65.371327,-65.89639],[-64.568276,-65.602506],[-64.176542,-65.171423],[-63.628152,-64.897073],[-63.001394,-64.642308],[-62.041686,-64.583552],[-61.414928,-64.270031],[-60.709855,-64.074074],[-59.887269,-63.95651],[-59.162585,-63.701745],[-58.594557,-63.388224],[-57.811143,-63.27066],[-57.223582,-63.525425],[-57.59573,-63.858532],[-58.614143,-64.152467]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[-74.66253,-55.61183,-65.05,-52.5183],geometry:{type:"Polygon",coordinates:[[[-67.75,-53.85],[-66.45,-54.45],[-65.05,-54.7],[-65.5,-55.2],[-66.45,-55.25],[-66.95992,-54.89681],[-67.29103,-55.30124],[-68.14863,-55.61183],[-69.2321,-55.49906],[-69.95809,-55.19843],[-71.00568,-55.05383],[-72.2639,-54.49514],[-73.2852,-53.95752],[-74.66253,-52.83749],[-73.8381,-53.04743],[-72.43418,-53.7154],[-71.10773,-54.07433],[-70.59178,-53.61583],[-70.26748,-52.93123],[-69.34565,-52.5183],[-68.63411,-52.63625],[-68.63401,-52.63637],[-68.25,-53.1],[-67.75,-53.85]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:.5},bbox:[-61.2,-52.3,-57.75,-51.1],geometry:{type:"Polygon",coordinates:[[[-58.55,-51.1],[-57.75,-51.55],[-58.05,-51.9],[-59.4,-52.2],[-59.85,-51.85],[-60.7,-52.3],[-61.2,-51.85],[-60,-51.25],[-59.15,-51.5],[-58.55,-51.1]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:.5},bbox:[68.72,-49.775,70.56,-48.625],geometry:{type:"Polygon",coordinates:[[[70.28,-49.71],[68.745,-49.775],[68.72,-49.2425],[68.8675,-48.83],[68.935,-48.625],[69.58,-48.94],[70.525,-49.065],[70.56,-49.255],[70.28,-49.71]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[144.718071,-43.634597,148.359865,-40.703975],geometry:{type:"Polygon",coordinates:[[[145.397978,-40.792549],[146.364121,-41.137695],[146.908584,-41.000546],[147.689259,-40.808258],[148.289068,-40.875438],[148.359865,-42.062445],[148.017301,-42.407024],[147.914052,-43.211522],[147.564564,-42.937689],[146.870343,-43.634597],[146.663327,-43.580854],[146.048378,-43.549745],[145.43193,-42.693776],[145.29509,-42.03361],[144.718071,-41.162552],[144.743755,-40.703975],[145.397978,-40.792549]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[166.509144,-46.641235,174.248517,-40.493962],geometry:{type:"Polygon",coordinates:[[[173.020375,-40.919052],[173.247234,-41.331999],[173.958405,-40.926701],[174.247587,-41.349155],[174.248517,-41.770008],[173.876447,-42.233184],[173.22274,-42.970038],[172.711246,-43.372288],[173.080113,-43.853344],[172.308584,-43.865694],[171.452925,-44.242519],[171.185138,-44.897104],[170.616697,-45.908929],[169.831422,-46.355775],[169.332331,-46.641235],[168.411354,-46.619945],[167.763745,-46.290197],[166.676886,-46.219917],[166.509144,-45.852705],[167.046424,-45.110941],[168.303763,-44.123973],[168.949409,-43.935819],[169.667815,-43.555326],[170.52492,-43.031688],[171.12509,-42.512754],[171.569714,-41.767424],[171.948709,-41.514417],[172.097227,-40.956104],[172.79858,-40.493962],[173.020375,-40.919052]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[172.636005,-41.688308,178.517094,-34.450662],geometry:{type:"Polygon",coordinates:[[[174.612009,-36.156397],[175.336616,-37.209098],[175.357596,-36.526194],[175.808887,-36.798942],[175.95849,-37.555382],[176.763195,-37.881253],[177.438813,-37.961248],[178.010354,-37.579825],[178.517094,-37.695373],[178.274731,-38.582813],[177.97046,-39.166343],[177.206993,-39.145776],[176.939981,-39.449736],[177.032946,-39.879943],[176.885824,-40.065978],[176.508017,-40.604808],[176.01244,-41.289624],[175.239567,-41.688308],[175.067898,-41.425895],[174.650973,-41.281821],[175.22763,-40.459236],[174.900157,-39.908933],[173.824047,-39.508854],[173.852262,-39.146602],[174.574802,-38.797683],[174.743474,-38.027808],[174.697017,-37.381129],[174.292028,-36.711092],[174.319004,-36.534824],[173.840997,-36.121981],[173.054171,-35.237125],[172.636005,-34.529107],[173.007042,-34.450662],[173.551298,-35.006183],[174.32939,-35.265496],[174.612009,-36.156397]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[164.029606,-22.399976,167.120011,-20.105646],geometry:{type:"Polygon",coordinates:[[[167.120011,-22.159991],[166.740035,-22.399976],[166.189732,-22.129708],[165.474375,-21.679607],[164.829815,-21.14982],[164.167995,-20.444747],[164.029606,-20.105646],[164.459967,-20.120012],[165.020036,-20.459991],[165.460009,-20.800022],[165.77999,-21.080005],[166.599991,-21.700019],[167.120011,-22.159991]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:.5},bbox:[177.28504,-18.28799,178.71806,-17.33992],geometry:{type:"Polygon",coordinates:[[[178.3736,-17.33992],[178.71806,-17.62846],[178.55271,-18.15059],[177.93266,-18.28799],[177.38146,-18.16432],[177.28504,-17.72465],[177.67087,-17.38114],[178.12557,-17.50481],[178.3736,-17.33992]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:1.5},bbox:[178.596839,-17.012042,180,-16.067133],geometry:{type:"Polygon",coordinates:[[[179.364143,-16.801354],[178.725059,-17.012042],[178.596839,-16.63915],[179.096609,-16.433984],[179.413509,-16.379054],[180,-16.067133],[180,-16.555217],[179.364143,-16.801354]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1.5},bbox:[-180,-16.555217,-179.79332,-16.020882],geometry:{type:"Polygon",coordinates:[[[-179.917369,-16.501783],[-180,-16.555217],[-180,-16.067133],[-179.79332,-16.020882],[-179.917369,-16.501783]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1.5},bbox:[167.180008,-16.59785,167.844877,-15.891846],geometry:{type:"Polygon",coordinates:[[[167.844877,-16.466333],[167.515181,-16.59785],[167.180008,-16.159995],[167.216801,-15.891846],[167.844877,-16.466333]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[166.629137,-15.740021,167.270028,-14.626497],geometry:{type:"Polygon",coordinates:[[[167.107712,-14.93392],[167.270028,-15.740021],[167.001207,-15.614602],[166.793158,-15.668811],[166.649859,-15.392704],[166.629137,-14.626497],[167.107712,-14.93392]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[43.254187,-25.601434,50.476537,-12.040557],geometry:{type:"Polygon",coordinates:[[[50.056511,-13.555761],[50.217431,-14.758789],[50.476537,-15.226512],[50.377111,-15.706069],[50.200275,-16.000263],[49.860606,-15.414253],[49.672607,-15.710204],[49.863344,-16.451037],[49.774564,-16.875042],[49.498612,-17.106036],[49.435619,-17.953064],[49.041792,-19.118781],[48.548541,-20.496888],[47.930749,-22.391501],[47.547723,-23.781959],[47.095761,-24.94163],[46.282478,-25.178463],[45.409508,-25.601434],[44.833574,-25.346101],[44.03972,-24.988345],[43.763768,-24.460677],[43.697778,-23.574116],[43.345654,-22.776904],[43.254187,-22.057413],[43.433298,-21.336475],[43.893683,-21.163307],[43.89637,-20.830459],[44.374325,-20.072366],[44.464397,-19.435454],[44.232422,-18.961995],[44.042976,-18.331387],[43.963084,-17.409945],[44.312469,-16.850496],[44.446517,-16.216219],[44.944937,-16.179374],[45.502732,-15.974373],[45.872994,-15.793454],[46.312243,-15.780018],[46.882183,-15.210182],[47.70513,-14.594303],[48.005215,-14.091233],[47.869047,-13.663869],[48.293828,-13.784068],[48.84506,-13.089175],[48.863509,-12.487868],[49.194651,-12.040557],[49.543519,-12.469833],[49.808981,-12.895285],[50.056511,-13.555761]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[113.338953,-39.035757,153.569469,-10.668186],geometry:{type:"Polygon",coordinates:[[[143.561811,-13.763656],[143.922099,-14.548311],[144.563714,-14.171176],[144.894908,-14.594458],[145.374724,-14.984976],[145.271991,-15.428205],[145.48526,-16.285672],[145.637033,-16.784918],[145.888904,-16.906926],[146.160309,-17.761655],[146.063674,-18.280073],[146.387478,-18.958274],[147.471082,-19.480723],[148.177602,-19.955939],[148.848414,-20.39121],[148.717465,-20.633469],[149.28942,-21.260511],[149.678337,-22.342512],[150.077382,-22.122784],[150.482939,-22.556142],[150.727265,-22.402405],[150.899554,-23.462237],[151.609175,-24.076256],[152.07354,-24.457887],[152.855197,-25.267501],[153.136162,-26.071173],[153.161949,-26.641319],[153.092909,-27.2603],[153.569469,-28.110067],[153.512108,-28.995077],[153.339095,-29.458202],[153.069241,-30.35024],[153.089602,-30.923642],[152.891578,-31.640446],[152.450002,-32.550003],[151.709117,-33.041342],[151.343972,-33.816023],[151.010555,-34.31036],[150.714139,-35.17346],[150.32822,-35.671879],[150.075212,-36.420206],[149.946124,-37.109052],[149.997284,-37.425261],[149.423882,-37.772681],[148.304622,-37.809061],[147.381733,-38.219217],[146.922123,-38.606532],[146.317922,-39.035757],[145.489652,-38.593768],[144.876976,-38.417448],[145.032212,-37.896188],[144.485682,-38.085324],[143.609974,-38.809465],[142.745427,-38.538268],[142.17833,-38.380034],[141.606582,-38.308514],[140.638579,-38.019333],[139.992158,-37.402936],[139.806588,-36.643603],[139.574148,-36.138362],[139.082808,-35.732754],[138.120748,-35.612296],[138.449462,-35.127261],[138.207564,-34.384723],[137.71917,-35.076825],[136.829406,-35.260535],[137.352371,-34.707339],[137.503886,-34.130268],[137.890116,-33.640479],[137.810328,-32.900007],[136.996837,-33.752771],[136.372069,-34.094766],[135.989043,-34.890118],[135.208213,-34.47867],[135.239218,-33.947953],[134.613417,-33.222778],[134.085904,-32.848072],[134.273903,-32.617234],[132.990777,-32.011224],[132.288081,-31.982647],[131.326331,-31.495803],[129.535794,-31.590423],[128.240938,-31.948489],[127.102867,-32.282267],[126.148714,-32.215966],[125.088623,-32.728751],[124.221648,-32.959487],[124.028947,-33.483847],[123.659667,-33.890179],[122.811036,-33.914467],[122.183064,-34.003402],[121.299191,-33.821036],[120.580268,-33.930177],[119.893695,-33.976065],[119.298899,-34.509366],[119.007341,-34.464149],[118.505718,-34.746819],[118.024972,-35.064733],[117.295507,-35.025459],[116.625109,-35.025097],[115.564347,-34.386428],[115.026809,-34.196517],[115.048616,-33.623425],[115.545123,-33.487258],[115.714674,-33.259572],[115.679379,-32.900369],[115.801645,-32.205062],[115.689611,-31.612437],[115.160909,-30.601594],[114.997043,-30.030725],[115.040038,-29.461095],[114.641974,-28.810231],[114.616498,-28.516399],[114.173579,-28.118077],[114.048884,-27.334765],[113.477498,-26.543134],[113.338953,-26.116545],[113.778358,-26.549025],[113.440962,-25.621278],[113.936901,-25.911235],[114.232852,-26.298446],[114.216161,-25.786281],[113.721255,-24.998939],[113.625344,-24.683971],[113.393523,-24.384764],[113.502044,-23.80635],[113.706993,-23.560215],[113.843418,-23.059987],[113.736552,-22.475475],[114.149756,-21.755881],[114.225307,-22.517488],[114.647762,-21.82952],[115.460167,-21.495173],[115.947373,-21.068688],[116.711615,-20.701682],[117.166316,-20.623599],[117.441545,-20.746899],[118.229559,-20.374208],[118.836085,-20.263311],[118.987807,-20.044203],[119.252494,-19.952942],[119.805225,-19.976506],[120.85622,-19.683708],[121.399856,-19.239756],[121.655138,-18.705318],[122.241665,-18.197649],[122.286624,-17.798603],[122.312772,-17.254967],[123.012574,-16.4052],[123.433789,-17.268558],[123.859345,-17.069035],[123.503242,-16.596506],[123.817073,-16.111316],[124.258287,-16.327944],[124.379726,-15.56706],[124.926153,-15.0751],[125.167275,-14.680396],[125.670087,-14.51007],[125.685796,-14.230656],[126.125149,-14.347341],[126.142823,-14.095987],[126.582589,-13.952791],[127.065867,-13.817968],[127.804633,-14.276906],[128.35969,-14.86917],[128.985543,-14.875991],[129.621473,-14.969784],[129.4096,-14.42067],[129.888641,-13.618703],[130.339466,-13.357376],[130.183506,-13.10752],[130.617795,-12.536392],[131.223495,-12.183649],[131.735091,-12.302453],[132.575298,-12.114041],[132.557212,-11.603012],[131.824698,-11.273782],[132.357224,-11.128519],[133.019561,-11.376411],[133.550846,-11.786515],[134.393068,-12.042365],[134.678632,-11.941183],[135.298491,-12.248606],[135.882693,-11.962267],[136.258381,-12.049342],[136.492475,-11.857209],[136.95162,-12.351959],[136.685125,-12.887223],[136.305407,-13.29123],[135.961758,-13.324509],[136.077617,-13.724278],[135.783836,-14.223989],[135.428664,-14.715432],[135.500184,-14.997741],[136.295175,-15.550265],[137.06536,-15.870762],[137.580471,-16.215082],[138.303217,-16.807604],[138.585164,-16.806622],[139.108543,-17.062679],[139.260575,-17.371601],[140.215245,-17.710805],[140.875463,-17.369069],[141.07111,-16.832047],[141.274095,-16.38887],[141.398222,-15.840532],[141.702183,-15.044921],[141.56338,-14.561333],[141.63552,-14.270395],[141.519869,-13.698078],[141.65092,-12.944688],[141.842691,-12.741548],[141.68699,-12.407614],[141.928629,-11.877466],[142.118488,-11.328042],[142.143706,-11.042737],[142.51526,-10.668186],[142.79731,-11.157355],[142.866763,-11.784707],[143.115947,-11.90563],[143.158632,-12.325656],[143.522124,-12.834358],[143.597158,-13.400422],[143.561811,-13.763656]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1.5},bbox:[161.319797,-10.826367,162.398646,-10.204751],geometry:{type:"Polygon",coordinates:[[[162.119025,-10.482719],[162.398646,-10.826367],[161.700032,-10.820011],[161.319797,-10.204751],[161.917383,-10.446701],[162.119025,-10.482719]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1.5},bbox:[118.967808,-10.25865,120.775502,-9.36134],geometry:{type:"Polygon",coordinates:[[[120.715609,-10.239581],[120.295014,-10.25865],[118.967808,-9.557969],[119.90031,-9.36134],[120.425756,-9.665921],[120.775502,-9.969675],[120.715609,-10.239581]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[159.640003,-9.89521,160.852229,-9.24295],geometry:{type:"Polygon",coordinates:[[[160.852229,-9.872937],[160.462588,-9.89521],[159.849447,-9.794027],[159.640003,-9.63998],[159.702945,-9.24295],[160.362956,-9.400304],[160.688518,-9.610162],[160.852229,-9.872937]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1.5},bbox:[160.579997,-9.784312,161.679982,-8.320009],geometry:{type:"Polygon",coordinates:[[[161.679982,-9.599982],[161.529397,-9.784312],[160.788253,-8.917543],[160.579997,-8.320009],[160.920028,-8.320009],[161.280006,-9.120011],[161.679982,-9.599982]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[123.459989,-10.359987,127.335928,-8.273345],geometry:{type:"Polygon",coordinates:[[[124.43595,-10.140001],[123.579982,-10.359987],[123.459989,-10.239995],[123.550009,-9.900016],[123.980009,-9.290027],[124.968682,-8.89279],[125.086246,-8.656887],[125.947072,-8.432095],[126.644704,-8.398247],[126.957243,-8.273345],[127.335928,-8.397317],[126.967992,-8.668256],[125.925885,-9.106007],[125.08852,-9.393173],[124.43595,-10.140001]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[116.740141,-9.040895,119.126507,-8.095681],geometry:{type:"Polygon",coordinates:[[[117.900018,-8.095681],[118.260616,-8.362383],[118.87846,-8.280683],[119.126507,-8.705825],[117.970402,-8.906639],[117.277731,-9.040895],[116.740141,-9.032937],[117.083737,-8.457158],[117.632024,-8.449303],[117.900018,-8.095681]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[119.920929,-8.933666,122.903537,-8.094234],geometry:{type:"Polygon",coordinates:[[[122.903537,-8.094234],[122.756983,-8.649808],[121.254491,-8.933666],[119.924391,-8.810418],[119.920929,-8.444859],[120.715092,-8.236965],[121.341669,-8.53674],[122.007365,-8.46062],[122.903537,-8.094234]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[158.21115,-8.53829,159.917402,-7.320018],geometry:{type:"Polygon",coordinates:[[[159.875027,-8.33732],[159.917402,-8.53829],[159.133677,-8.114181],[158.586114,-7.754824],[158.21115,-7.421872],[158.359978,-7.320018],[158.820001,-7.560003],[159.640003,-8.020027],[159.875027,-8.33732]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1.5},bbox:[156.491358,-7.404767,157.538426,-6.599338],geometry:{type:"Polygon",coordinates:[[[157.538426,-7.34782],[157.33942,-7.404767],[156.90203,-7.176874],[156.491358,-6.765943],[156.542828,-6.599338],[157.14,-7.021638],[157.538426,-7.34782]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[105.365486,-8.751817,115.705527,-5.895919],geometry:{type:"Polygon",coordinates:[[[108.623479,-6.777674],[110.539227,-6.877358],[110.759576,-6.465186],[112.614811,-6.946036],[112.978768,-7.594213],[114.478935,-7.776528],[115.705527,-8.370807],[114.564511,-8.751817],[113.464734,-8.348947],[112.559672,-8.376181],[111.522061,-8.302129],[110.58615,-8.122605],[109.427667,-7.740664],[108.693655,-7.6416],[108.277763,-7.766657],[106.454102,-7.3549],[106.280624,-6.9249],[105.365486,-6.851416],[106.051646,-5.895919],[107.265009,-5.954985],[108.072091,-6.345762],[108.486846,-6.421985],[108.623479,-6.777674]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1.5},bbox:[134.112776,-6.895238,134.727002,-5.445042],geometry:{type:"Polygon",coordinates:[[[134.724624,-6.214401],[134.210134,-6.895238],[134.112776,-6.142467],[134.290336,-5.783058],[134.499625,-5.445042],[134.727002,-5.737582],[134.724624,-6.214401]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[154.514114,-6.919991,156.019965,-5.042431],geometry:{type:"Polygon",coordinates:[[[155.880026,-6.819997],[155.599991,-6.919991],[155.166994,-6.535931],[154.729192,-5.900828],[154.514114,-5.139118],[154.652504,-5.042431],[154.759991,-5.339984],[155.062918,-5.566792],[155.547746,-6.200655],[156.019965,-6.540014],[155.880026,-6.819997]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[148.318937,-6.317754,152.338743,-4.14879],geometry:{type:"Polygon",coordinates:[[[151.982796,-5.478063],[151.459107,-5.56028],[151.30139,-5.840728],[150.754447,-6.083763],[150.241197,-6.317754],[149.709963,-6.316513],[148.890065,-6.02604],[148.318937,-5.747142],[148.401826,-5.437756],[149.298412,-5.583742],[149.845562,-5.505503],[149.99625,-5.026101],[150.139756,-5.001348],[150.236908,-5.53222],[150.807467,-5.455842],[151.089672,-5.113693],[151.647881,-4.757074],[151.537862,-4.167807],[152.136792,-4.14879],[152.338743,-4.312966],[152.318693,-4.867661],[151.982796,-5.478063]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1.5},bbox:[125.989034,-3.790983,127.249215,-3.129318],geometry:{type:"Polygon",coordinates:[[[127.249215,-3.459065],[126.874923,-3.790983],[126.183802,-3.607376],[125.989034,-3.177273],[127.000651,-3.129318],[127.249215,-3.459065]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[127.898891,-3.858472,130.834836,-2.802154],geometry:{type:"Polygon",coordinates:[[[130.471344,-3.093764],[130.834836,-3.858472],[129.990547,-3.446301],[129.155249,-3.362637],[128.590684,-3.428679],[127.898891,-3.393436],[128.135879,-2.84365],[129.370998,-2.802154],[130.471344,-3.093764]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1.5},bbox:[150.66205,-4.766427,153.140038,-2.500002],geometry:{type:"Polygon",coordinates:[[[153.140038,-4.499983],[152.827292,-4.766427],[152.638673,-4.176127],[152.406026,-3.789743],[151.953237,-3.462062],[151.384279,-3.035422],[150.66205,-2.741486],[150.939965,-2.500002],[151.479984,-2.779985],[151.820015,-2.999972],[152.239989,-3.240009],[152.640017,-3.659983],[153.019994,-3.980015],[153.140038,-4.499983]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[130.519558,-10.652476,150.801628,-.369538],geometry:{type:"Polygon",coordinates:[[[134.143368,-1.151867],[134.422627,-2.769185],[135.457603,-3.367753],[136.293314,-2.307042],[137.440738,-1.703513],[138.329727,-1.702686],[139.184921,-2.051296],[139.926684,-2.409052],[141.00021,-2.600151],[142.735247,-3.289153],[144.583971,-3.861418],[145.27318,-4.373738],[145.829786,-4.876498],[145.981922,-5.465609],[147.648073,-6.083659],[147.891108,-6.614015],[146.970905,-6.721657],[147.191874,-7.388024],[148.084636,-8.044108],[148.734105,-9.104664],[149.306835,-9.071436],[149.266631,-9.514406],[150.038728,-9.684318],[149.738798,-9.872937],[150.801628,-10.293687],[150.690575,-10.582713],[150.028393,-10.652476],[149.78231,-10.393267],[148.923138,-10.280923],[147.913018,-10.130441],[147.135443,-9.492444],[146.567881,-8.942555],[146.048481,-8.067414],[144.744168,-7.630128],[143.897088,-7.91533],[143.286376,-8.245491],[143.413913,-8.983069],[142.628431,-9.326821],[142.068259,-9.159596],[141.033852,-9.117893],[140.143415,-8.297168],[139.127767,-8.096043],[138.881477,-8.380935],[137.614474,-8.411683],[138.039099,-7.597882],[138.668621,-7.320225],[138.407914,-6.232849],[137.92784,-5.393366],[135.98925,-4.546544],[135.164598,-4.462931],[133.66288,-3.538853],[133.367705,-4.024819],[132.983956,-4.112979],[132.756941,-3.746283],[132.753789,-3.311787],[131.989804,-2.820551],[133.066845,-2.460418],[133.780031,-2.479848],[133.696212,-2.214542],[132.232373,-2.212526],[131.836222,-1.617162],[130.94284,-1.432522],[130.519558,-.93772],[131.867538,-.695461],[132.380116,-.369538],[133.985548,-.78021],[134.143368,-1.151867]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[118.767769,-5.6734,125.240501,1.643259],geometry:{type:"Polygon",coordinates:[[[125.240501,1.419836],[124.437035,.427881],[123.685505,.235593],[122.723083,.431137],[121.056725,.381217],[120.183083,.237247],[120.04087,-.519658],[120.935905,-1.408906],[121.475821,-.955962],[123.340565,-.615673],[123.258399,-1.076213],[122.822715,-.930951],[122.38853,-1.516858],[121.508274,-1.904483],[122.454572,-3.186058],[122.271896,-3.5295],[123.170963,-4.683693],[123.162333,-5.340604],[122.628515,-5.634591],[122.236394,-5.282933],[122.719569,-4.464172],[121.738234,-4.851331],[121.489463,-4.574553],[121.619171,-4.188478],[120.898182,-3.602105],[120.972389,-2.627643],[120.305453,-2.931604],[120.390047,-4.097579],[120.430717,-5.528241],[119.796543,-5.6734],[119.366906,-5.379878],[119.653606,-4.459417],[119.498835,-3.494412],[119.078344,-3.487022],[118.767769,-2.801999],[119.180974,-2.147104],[119.323394,-1.353147],[119.825999,.154254],[120.035702,.566477],[120.885779,1.309223],[121.666817,1.013944],[122.927567,.875192],[124.077522,.917102],[125.065989,1.643259],[125.240501,1.419836]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[127.39949,-.899996,128.688249,2.174596],geometry:{type:"Polygon",coordinates:[[[128.688249,1.132386],[128.635952,.258486],[128.12017,.356413],[127.968034,-.252077],[128.379999,-.780004],[128.100016,-.899996],[127.696475,-.266598],[127.39949,1.011722],[127.600512,1.810691],[127.932378,2.174596],[128.004156,1.628531],[128.594559,1.540811],[128.688249,1.132386]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[95.293026,-5.873285,106.108593,5.479821],geometry:{type:"Polygon",coordinates:[[[105.817655,-5.852356],[104.710384,-5.873285],[103.868213,-5.037315],[102.584261,-4.220259],[102.156173,-3.614146],[101.399113,-2.799777],[100.902503,-2.050262],[100.141981,-.650348],[99.26374,.183142],[98.970011,1.042882],[98.601351,1.823507],[97.699598,2.453184],[97.176942,3.308791],[96.424017,3.86886],[95.380876,4.970782],[95.293026,5.479821],[95.936863,5.439513],[97.484882,5.246321],[98.369169,4.26837],[99.142559,3.59035],[99.693998,3.174329],[100.641434,2.099381],[101.658012,2.083697],[102.498271,1.3987],[103.07684,.561361],[103.838396,.104542],[103.437645,-.711946],[104.010789,-1.059212],[104.369991,-1.084843],[104.53949,-1.782372],[104.887893,-2.340425],[105.622111,-2.428844],[106.108593,-3.061777],[105.857446,-4.305525],[105.817655,-5.852356]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[108.952658,-4.106984,119.181904,6.928053],geometry:{type:"Polygon",coordinates:[[[117.875627,1.827641],[118.996747,.902219],[117.811858,.784242],[117.478339,.102475],[117.521644,-.803723],[116.560048,-1.487661],[116.533797,-2.483517],[116.148084,-4.012726],[116.000858,-3.657037],[114.864803,-4.106984],[114.468652,-3.495704],[113.755672,-3.43917],[113.256994,-3.118776],[112.068126,-3.478392],[111.703291,-2.994442],[111.04824,-3.049426],[110.223846,-2.934032],[110.070936,-1.592874],[109.571948,-1.314907],[109.091874,-.459507],[108.952658,.415375],[109.069136,1.341934],[109.66326,2.006467],[110.396135,1.663775],[111.168853,1.850637],[111.370081,2.697303],[111.796928,2.885897],[112.995615,3.102395],[113.712935,3.893509],[114.204017,4.525874],[114.599961,4.900011],[115.45071,5.44773],[116.220741,6.143191],[116.725103,6.924771],[117.129626,6.928053],[117.643393,6.422166],[117.689075,5.98749],[118.347691,5.708696],[119.181904,5.407836],[119.110694,5.016128],[118.439727,4.966519],[118.618321,4.478202],[117.882035,4.137551],[117.313232,3.234428],[118.04833,2.28769],[117.875627,1.827641]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[121.919928,5.581003,126.537424,9.760335],geometry:{type:"Polygon",coordinates:[[[126.376814,8.414706],[126.478513,7.750354],[126.537424,7.189381],[126.196773,6.274294],[125.831421,7.293715],[125.363852,6.786485],[125.683161,6.049657],[125.396512,5.581003],[124.219788,6.161355],[123.93872,6.885136],[124.243662,7.36061],[123.610212,7.833527],[123.296071,7.418876],[122.825506,7.457375],[122.085499,6.899424],[121.919928,7.192119],[122.312359,8.034962],[122.942398,8.316237],[123.487688,8.69301],[123.841154,8.240324],[124.60147,8.514158],[124.764612,8.960409],[125.471391,8.986997],[125.412118,9.760335],[126.222714,9.286074],[126.306637,8.782487],[126.376814,8.414706]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[79.695167,5.96837,81.787959,9.824078],geometry:{type:"Polygon",coordinates:[[[81.21802,6.197141],[80.348357,5.96837],[79.872469,6.763463],[79.695167,8.200843],[80.147801,9.824078],[80.838818,9.268427],[81.304319,8.564206],[81.787959,7.523055],[81.637322,6.481775],[81.21802,6.197141]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:1},bbox:[-61.95,10,-60.895,10.89],geometry:{type:"Polygon",coordinates:[[[-60.935,10.11],[-61.77,10],[-61.95,10.09],[-61.66,10.365],[-61.68,10.76],[-61.105,10.89],[-60.895,10.855],[-60.935,10.11]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[122.380055,9.022189,124.077936,11.232726],geometry:{type:"Polygon",coordinates:[[[123.982438,10.278779],[123.623183,9.950091],[123.309921,9.318269],[122.995883,9.022189],[122.380055,9.713361],[122.586089,9.981045],[122.837081,10.261157],[122.947411,10.881868],[123.49885,10.940624],[123.337774,10.267384],[124.077936,11.232726],[123.982438,10.278779]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[117.174275,8.3675,119.689677,11.369668],geometry:{type:"Polygon",coordinates:[[[118.504581,9.316383],[117.174275,8.3675],[117.664477,9.066889],[118.386914,9.6845],[118.987342,10.376292],[119.511496,11.369668],[119.689677,10.554291],[119.029458,10.003653],[118.504581,9.316383]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[121.883548,10.441017,123.120217,11.891755],geometry:{type:"Polygon",coordinates:[[[121.883548,11.891755],[122.483821,11.582187],[123.120217,11.58366],[123.100838,11.165934],[122.637714,10.741308],[122.00261,10.441017],[121.967367,10.905691],[122.03837,11.415841],[121.883548,11.891755]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[124.266762,10.134679,125.783465,12.557761],geometry:{type:"Polygon",coordinates:[[[125.502552,12.162695],[125.783465,11.046122],[125.011884,11.311455],[125.032761,10.975816],[125.277449,10.358722],[124.801819,10.134679],[124.760168,10.837995],[124.459101,10.88993],[124.302522,11.495371],[124.891013,11.415583],[124.87799,11.79419],[124.266762,12.557761],[125.227116,12.535721],[125.502552,12.162695]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1.5},bbox:[120.323436,12.20556,121.527394,13.466413],geometry:{type:"Polygon",coordinates:[[[121.527394,13.06959],[121.26219,12.20556],[120.833896,12.704496],[120.323436,13.466413],[121.180128,13.429697],[121.527394,13.06959]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[119.883773,12.536677,124.181289,18.505227],geometry:{type:"Polygon",coordinates:[[[121.321308,18.504065],[121.937601,18.218552],[122.246006,18.47895],[122.336957,18.224883],[122.174279,17.810283],[122.515654,17.093505],[122.252311,16.262444],[121.662786,15.931018],[121.50507,15.124814],[121.728829,14.328376],[122.258925,14.218202],[122.701276,14.336541],[123.950295,13.782131],[123.855107,13.237771],[124.181289,12.997527],[124.077419,12.536677],[123.298035,13.027526],[122.928652,13.55292],[122.671355,13.185836],[122.03465,13.784482],[121.126385,13.636687],[120.628637,13.857656],[120.679384,14.271016],[120.991819,14.525393],[120.693336,14.756671],[120.564145,14.396279],[120.070429,14.970869],[119.920929,15.406347],[119.883773,16.363704],[120.286488,16.034629],[120.390047,17.599081],[120.715867,18.505227],[121.321308,18.504065]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[-67.242428,17.946553,-65.591004,18.520601],geometry:{type:"Polygon",coordinates:[[[-65.591004,18.228035],[-65.847164,17.975906],[-66.599934,17.981823],[-67.184162,17.946553],[-67.242428,18.37446],[-67.100679,18.520601],[-66.282434,18.514762],[-65.771303,18.426679],[-65.591004,18.228035]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[-78.337719,17.701116,-76.199659,18.524218],geometry:{type:"Polygon",coordinates:[[[-76.902561,17.868238],[-77.206341,17.701116],[-77.766023,17.861597],[-78.337719,18.225968],[-78.217727,18.454533],[-77.797365,18.524218],[-77.569601,18.490525],[-76.896619,18.400867],[-76.365359,18.160701],[-76.199659,17.886867],[-76.902561,17.868238]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[-74.458034,17.598564,-68.317943,19.915684],geometry:{type:"Polygon",coordinates:[[[-72.579673,19.871501],[-71.712361,19.714456],[-71.587304,19.884911],[-70.806706,19.880286],[-70.214365,19.622885],[-69.950815,19.648],[-69.76925,19.293267],[-69.222126,19.313214],[-69.254346,19.015196],[-68.809412,18.979074],[-68.317943,18.612198],[-68.689316,18.205142],[-69.164946,18.422648],[-69.623988,18.380713],[-69.952934,18.428307],[-70.133233,18.245915],[-70.517137,18.184291],[-70.669298,18.426886],[-70.99995,18.283329],[-71.40021,17.598564],[-71.657662,17.757573],[-71.708305,18.044997],[-72.372476,18.214961],[-72.844411,18.145611],[-73.454555,18.217906],[-73.922433,18.030993],[-74.458034,18.34255],[-74.369925,18.664908],[-73.449542,18.526053],[-72.694937,18.445799],[-72.334882,18.668422],[-72.79165,19.101625],[-72.784105,19.483591],[-73.415022,19.639551],[-73.189791,19.915684],[-72.579673,19.871501]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[108.626217,18.197701,111.010051,20.101254],geometry:{type:"Polygon",coordinates:[[[110.339188,18.678395],[109.47521,18.197701],[108.655208,18.507682],[108.626217,19.367888],[109.119056,19.821039],[110.211599,20.101254],[110.786551,20.077534],[111.010051,19.69593],[110.570647,19.255879],[110.339188,18.678395]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:.5},bbox:[-156.07347,18.91619,-154.80741,20.26721],geometry:{type:"Polygon",coordinates:[[[-155.54211,19.08348],[-155.68817,18.91619],[-155.93665,19.05939],[-155.90806,19.33888],[-156.07347,19.70294],[-156.02368,19.81422],[-155.85008,19.97729],[-155.91907,20.17395],[-155.86108,20.26721],[-155.78505,20.2487],[-155.40214,20.07975],[-155.22452,19.99302],[-155.06226,19.8591],[-154.80741,19.50871],[-154.83147,19.45328],[-155.22217,19.23972],[-155.54211,19.08348]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:1.5},bbox:[-156.71055,20.57241,-155.99566,21.01249],geometry:{type:"Polygon",coordinates:[[[-156.07926,20.64397],[-156.41445,20.57241],[-156.58673,20.783],[-156.70167,20.8643],[-156.71055,20.92676],[-156.61258,21.01249],[-156.25711,20.91745],[-155.99566,20.76404],[-156.07926,20.64397]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:1.5},bbox:[-157.32521,21.06873,-156.75824,21.21958],geometry:{type:"Polygon",coordinates:[[[-156.75824,21.17684],[-156.78933,21.06873],[-157.32521,21.09777],[-157.25027,21.21958],[-156.75824,21.17684]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:1},bbox:[-158.29265,21.26442,-157.65283,21.71696],geometry:{type:"Polygon",coordinates:[[[-157.65283,21.32217],[-157.70703,21.26442],[-157.7786,21.27729],[-158.12667,21.31244],[-158.2538,21.53919],[-158.29265,21.57912],[-158.0252,21.71696],[-157.94161,21.65272],[-157.65283,21.32217]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:1.5},bbox:[-159.80051,21.88299,-159.34512,22.23618],geometry:{type:"Polygon",coordinates:[[[-159.34512,21.982],[-159.46372,21.88299],[-159.80051,22.06533],[-159.74877,22.1382],[-159.5962,22.23618],[-159.36569,22.21494],[-159.34512,21.982]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[-84.974911,19.855481,-74.178025,23.188611],geometry:{type:"Polygon",coordinates:[[[-79.679524,22.765303],[-79.281486,22.399202],[-78.347434,22.512166],[-77.993296,22.277194],[-77.146422,21.657851],[-76.523825,21.20682],[-76.19462,21.220565],[-75.598222,21.016624],[-75.67106,20.735091],[-74.933896,20.693905],[-74.178025,20.284628],[-74.296648,20.050379],[-74.961595,19.923435],[-75.63468,19.873774],[-76.323656,19.952891],[-77.755481,19.855481],[-77.085108,20.413354],[-77.492655,20.673105],[-78.137292,20.739949],[-78.482827,21.028613],[-78.719867,21.598114],[-79.285,21.559175],[-80.217475,21.827324],[-80.517535,22.037079],[-81.820943,22.192057],[-82.169992,22.387109],[-81.795002,22.636965],[-82.775898,22.68815],[-83.494459,22.168518],[-83.9088,22.154565],[-84.052151,21.910575],[-84.54703,21.801228],[-84.974911,21.896028],[-84.447062,22.20495],[-84.230357,22.565755],[-83.77824,22.788118],[-83.267548,22.983042],[-82.510436,23.078747],[-82.268151,23.188611],[-81.404457,23.117271],[-80.618769,23.10598],[-79.679524,22.765303]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:1},bbox:[-78.40848,23.71,-77.53466,25.2103],geometry:{type:"Polygon",coordinates:[[[-77.53466,23.75975],[-77.78,23.71],[-78.03405,24.28615],[-78.40848,24.57564],[-78.19087,25.2103],[-77.89,25.17],[-77.54,24.34],[-77.53466,23.75975]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[120.106189,21.970571,121.951244,25.295459],geometry:{type:"Polygon",coordinates:[[[121.175632,22.790857],[120.74708,21.970571],[120.220083,22.814861],[120.106189,23.556263],[120.69468,24.538451],[121.495044,25.295459],[121.951244,24.997596],[121.777818,24.394274],[121.175632,22.790857]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:1.5},bbox:[-78.98,26.42,-77.82,26.87],geometry:{type:"Polygon",coordinates:[[[-77.82,26.58],[-78.91,26.42],[-78.98,26.79],[-78.51,26.87],[-77.85,26.84],[-77.82,26.58]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:1.5},bbox:[-77.79,25.87918,-77,27.04],geometry:{type:"Polygon",coordinates:[[[-77,26.59],[-77.17255,25.87918],[-77.35641,26.00735],[-77.34,26.53],[-77.78802,26.92516],[-77.79,27.04],[-77,26.59]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1.5},bbox:[132.363115,32.704567,134.766379,34.364931],geometry:{type:"Polygon",coordinates:[[[134.638428,34.149234],[134.766379,33.806335],[134.203416,33.201178],[133.79295,33.521985],[133.280268,33.28957],[133.014858,32.704567],[132.363115,32.989382],[132.371176,33.463642],[132.924373,34.060299],[133.492968,33.944621],[133.904106,34.364931],[134.638428,34.149234]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[32.256667,34.571869,34.576474,35.671596],geometry:{type:"Polygon",coordinates:[[[34.576474,35.671596],[33.900804,35.245756],[33.973617,35.058506],[34.004881,34.978098],[32.979827,34.571869],[32.490296,34.701655],[32.256667,35.103232],[32.73178,35.140026],[32.802474,35.145504],[32.946961,35.386703],[33.667227,35.373216],[34.576474,35.671596]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[23.514978,34.919988,26.290003,35.705004],geometry:{type:"Polygon",coordinates:[[[23.69998,35.705004],[24.246665,35.368022],[25.025015,35.424996],[25.769208,35.354018],[25.745023,35.179998],[26.290003,35.29999],[26.164998,35.004995],[24.724982,34.919988],[24.735007,35.084991],[23.514978,35.279992],[23.69998,35.705004]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[12.431004,36.619987,15.520376,38.231155],geometry:{type:"Polygon",coordinates:[[[15.520376,38.231155],[15.160243,37.444046],[15.309898,37.134219],[15.099988,36.619987],[14.335229,36.996631],[13.826733,37.104531],[12.431004,37.61295],[12.570944,38.126381],[13.741156,38.034966],[14.761249,38.143874],[15.520376,38.231155]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[8.159998,38.906618,9.809975,41.209991],geometry:{type:"Polygon",coordinates:[[[9.210012,41.209991],[9.809975,40.500009],[9.669519,39.177376],[9.214818,39.240473],[8.806936,38.906618],[8.428302,39.171847],[8.388253,40.378311],[8.159998,40.950007],[8.709991,40.899984],[9.210012,41.209991]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[129.408463,31.029579,141.914263,41.37856],geometry:{type:"Polygon",coordinates:[[[140.976388,37.142074],[140.59977,36.343983],[140.774074,35.842877],[140.253279,35.138114],[138.975528,34.6676],[137.217599,34.606286],[135.792983,33.464805],[135.120983,33.849071],[135.079435,34.596545],[133.340316,34.375938],[132.156771,33.904933],[130.986145,33.885761],[132.000036,33.149992],[131.33279,31.450355],[130.686318,31.029579],[130.20242,31.418238],[130.447676,32.319475],[129.814692,32.61031],[129.408463,33.296056],[130.353935,33.604151],[130.878451,34.232743],[131.884229,34.749714],[132.617673,35.433393],[134.608301,35.731618],[135.677538,35.527134],[136.723831,37.304984],[137.390612,36.827391],[138.857602,37.827485],[139.426405,38.215962],[140.05479,39.438807],[139.883379,40.563312],[140.305783,41.195005],[141.368973,41.37856],[141.914263,39.991616],[141.884601,39.180865],[140.959489,38.174001],[140.976388,37.142074]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[8.544213,41.380007,9.560016,43.009985],geometry:{type:"Polygon",coordinates:[[[9.560016,42.152492],[9.229752,41.380007],[8.775723,41.583612],[8.544213,42.256517],[8.746009,42.628122],[9.390001,43.009985],[9.560016,42.152492]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[139.817544,41.569556,145.543137,45.551483],geometry:{type:"Polygon",coordinates:[[[143.910162,44.1741],[144.613427,43.960883],[145.320825,44.384733],[145.543137,43.262088],[144.059662,42.988358],[143.18385,41.995215],[141.611491,42.678791],[141.067286,41.584594],[139.955106,41.569556],[139.817544,42.563759],[140.312087,43.333273],[141.380549,43.388825],[141.671952,44.772125],[141.967645,45.551483],[143.14287,44.510358],[143.910162,44.1741]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:1},bbox:[-64.39261,45.96818,-62.01208,47.03601],geometry:{type:"Polygon",coordinates:[[[-63.6645,46.55001],[-62.9393,46.41587],[-62.01208,46.44314],[-62.50391,46.03339],[-62.87433,45.96818],[-64.1428,46.39265],[-64.39261,46.72747],[-64.01486,47.03601],[-63.6645,46.55001]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:1},bbox:[-64.51912,49.08717,-61.806305,49.95718],geometry:{type:"Polygon",coordinates:[[[-61.806305,49.10506],[-62.29318,49.08717],[-63.58926,49.40069],[-64.51912,49.87304],[-64.17322,49.95718],[-62.85829,49.70641],[-61.835585,49.28855],[-61.806305,49.10506]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[-128.444584,48.370846,-123.510002,50.770648],geometry:{type:"Polygon",coordinates:[[[-123.510002,48.510011],[-124.012891,48.370846],[-125.655013,48.825005],[-125.954994,49.179996],[-126.850004,49.53],[-127.029993,49.814996],[-128.059336,49.994959],[-128.444584,50.539138],[-128.358414,50.770648],[-127.308581,50.552574],[-126.695001,50.400903],[-125.755007,50.295018],[-125.415002,49.950001],[-124.920768,49.475275],[-123.922509,49.062484],[-123.510002,48.510011]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[-59.419494,46.618292,-52.648099,51.632094],geometry:{type:"Polygon",coordinates:[[[-56.134036,50.68701],[-56.795882,49.812309],[-56.143105,50.150117],[-55.471492,49.935815],[-55.822401,49.587129],[-54.935143,49.313011],[-54.473775,49.556691],[-53.476549,49.249139],[-53.786014,48.516781],[-53.086134,48.687804],[-52.958648,48.157164],[-52.648099,47.535548],[-53.069158,46.655499],[-53.521456,46.618292],[-54.178936,46.807066],[-53.961869,47.625207],[-54.240482,47.752279],[-55.400773,46.884994],[-55.997481,46.91972],[-55.291219,47.389562],[-56.250799,47.632545],[-57.325229,47.572807],[-59.266015,47.603348],[-59.419494,47.899454],[-58.796586,48.251525],[-59.231625,48.523188],[-58.391805,49.125581],[-57.35869,50.718274],[-56.73865,51.287438],[-55.870977,51.632094],[-55.406974,51.588273],[-55.600218,51.317075],[-56.134036,50.68701]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[-133.239664,52.180433,-131.179043,54.169975],geometry:{type:"Polygon",coordinates:[[[-132.710008,54.040009],[-132.710009,54.040009],[-132.710008,54.040009],[-132.710008,54.040009],[-131.74999,54.120004],[-132.04948,52.984621],[-131.179043,52.180433],[-131.57783,52.182371],[-132.180428,52.639707],[-132.549992,53.100015],[-133.054611,53.411469],[-133.239664,53.85108],[-133.180004,54.169975],[-132.710008,54.040009]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[141.594076,45.966755,144.654148,54.365881],geometry:{type:"Polygon",coordinates:[[[143.648007,50.7476],[144.654148,48.976391],[143.173928,49.306551],[142.558668,47.861575],[143.533492,46.836728],[143.505277,46.137908],[142.747701,46.740765],[142.09203,45.966755],[141.906925,46.805929],[142.018443,47.780133],[141.904445,48.859189],[142.1358,49.615163],[142.179983,50.952342],[141.594076,51.935435],[141.682546,53.301966],[142.606934,53.762145],[142.209749,54.225476],[142.654786,54.365881],[142.914616,53.704578],[143.260848,52.74076],[143.235268,51.75666],[143.648007,50.7476]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[-9.977086,51.669301,-5.661949,55.17286],geometry:{type:"Polygon",coordinates:[[[-6.788857,52.260118],[-8.561617,51.669301],[-9.977086,51.820455],[-9.166283,52.864629],[-9.688525,53.881363],[-8.327987,54.664519],[-7.572168,55.131622],[-6.733847,55.17286],[-5.661949,54.554603],[-6.197885,53.867565],[-6.032985,53.153164],[-6.788857,52.260118]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[10.903914,54.800015,12.690006,56.111407],geometry:{type:"Polygon",coordinates:[[[12.690006,55.609991],[12.089991,54.800015],[11.043543,55.364864],[10.903914,55.779955],[12.370904,56.111407],[12.690006,55.609991]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[-154.670993,56.734677,-152.141147,57.968968],geometry:{type:"Polygon",coordinates:[[[-153.006314,57.115842],[-154.00509,56.734677],[-154.516403,56.992749],[-154.670993,57.461196],[-153.76278,57.816575],[-153.228729,57.968968],[-152.564791,57.901427],[-152.141147,57.591059],[-153.006314,57.115842]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[-6.149981,49.96,1.681531,58.635],geometry:{type:"Polygon",coordinates:[[[-3.005005,58.635],[-4.073828,57.553025],[-3.055002,57.690019],[-1.959281,57.6848],[-2.219988,56.870017],[-3.119003,55.973793],[-2.085009,55.909998],[-1.114991,54.624986],[-.430485,54.464376],[.184981,53.325014],[.469977,52.929999],[1.681531,52.73952],[1.559988,52.099998],[1.050562,51.806761],[1.449865,51.289428],[.550334,50.765739],[-.787517,50.774989],[-2.489998,50.500019],[-2.956274,50.69688],[-3.617448,50.228356],[-4.542508,50.341837],[-5.245023,49.96],[-5.776567,50.159678],[-4.30999,51.210001],[-3.414851,51.426009],[-4.984367,51.593466],[-5.267296,51.9914],[-4.222347,52.301356],[-4.770013,52.840005],[-4.579999,53.495004],[-3.09208,53.404441],[-2.945009,53.985],[-3.630005,54.615013],[-4.844169,54.790971],[-5.082527,55.061601],[-4.719112,55.508473],[-5.047981,55.783986],[-5.586398,55.311146],[-5.644999,56.275015],[-6.149981,56.78501],[-5.786825,57.818848],[-5.009999,58.630013],[-4.211495,58.550845],[-3.005005,58.635]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:1.5},bbox:[-167.455277,59.754441,-165.579164,60.38417],geometry:{type:"Polygon",coordinates:[[[-165.579164,59.909987],[-166.19277,59.754441],[-166.848337,59.941406],[-167.455277,60.213069],[-166.467792,60.38417],[-165.67443,60.293607],[-165.579164,59.909987]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:1.5},bbox:[-80.36215,61.63308,-79.26582,62.3856],geometry:{type:"Polygon",coordinates:[[[-79.26582,62.158675],[-79.65752,61.63308],[-80.09956,61.7181],[-80.36215,62.01649],[-80.315395,62.085565],[-79.92939,62.3856],[-79.52002,62.36371],[-79.26582,62.158675]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:1.5},bbox:[-83.99367,62.15922,-81.87699,62.91409],geometry:{type:"Polygon",coordinates:[[[-81.89825,62.7108],[-83.06857,62.15922],[-83.77462,62.18231],[-83.99367,62.4528],[-83.25048,62.91409],[-81.87699,62.90458],[-81.89825,62.7108]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1.5},bbox:[-171.791111,62.976931,-168.689439,63.782515],geometry:{type:"Polygon",coordinates:[[[-171.731657,63.782515],[-171.114434,63.592191],[-170.491112,63.694975],[-169.682505,63.431116],[-168.689439,63.297506],[-168.771941,63.188598],[-169.52944,62.976931],[-170.290556,63.194438],[-170.671386,63.375822],[-171.553063,63.317789],[-171.791111,63.405846],[-171.731657,63.782515]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:.5},bbox:[-87.221983,63.052379,-80.103451,65.738778],geometry:{type:"Polygon",coordinates:[[[-85.161308,65.657285],[-84.975764,65.217518],[-84.464012,65.371772],[-83.882626,65.109618],[-82.787577,64.766693],[-81.642014,64.455136],[-81.55344,63.979609],[-80.817361,64.057486],[-80.103451,63.725981],[-80.99102,63.411246],[-82.547178,63.651722],[-83.108798,64.101876],[-84.100417,63.569712],[-85.523405,63.052379],[-85.866769,63.637253],[-87.221983,63.541238],[-86.35276,64.035833],[-86.224886,64.822917],[-85.883848,65.738778],[-85.161308,65.657285]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[-24.326184,63.496383,-13.609732,66.526792],geometry:{type:"Polygon",coordinates:[[[-14.508695,66.455892],[-14.739637,65.808748],[-13.609732,65.126671],[-14.909834,64.364082],[-17.794438,63.678749],[-18.656246,63.496383],[-19.972755,63.643635],[-22.762972,63.960179],[-21.778484,64.402116],[-23.955044,64.89113],[-22.184403,65.084968],[-22.227423,65.378594],[-24.326184,65.611189],[-23.650515,66.262519],[-22.134922,66.410469],[-20.576284,65.732112],[-19.056842,66.276601],[-17.798624,65.993853],[-16.167819,66.526792],[-14.508695,66.455892]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:1},bbox:[-77.2364,67.09873,-75.10333,68.28721],geometry:{type:"Polygon",coordinates:[[[-75.86588,67.14886],[-76.98687,67.09873],[-77.2364,67.58809],[-76.81166,68.14856],[-75.89521,68.28721],[-75.1145,68.01036],[-75.10333,67.58202],[-75.21597,67.44425],[-75.86588,67.14886]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[-180,64.25269,-169.89958,68.963636],geometry:{type:"Polygon",coordinates:[[[-175.01425,66.58435],[-174.33983,66.33556],[-174.57182,67.06219],[-171.85731,66.91308],[-169.89958,65.97724],[-170.89107,65.54139],[-172.53025,65.43791],[-172.555,64.46079],[-172.95533,64.25269],[-173.89184,64.2826],[-174.65392,64.63125],[-175.98353,64.92288],[-176.20716,65.35667],[-177.22266,65.52024],[-178.35993,65.39052],[-178.90332,65.74044],[-178.68611,66.11211],[-179.88377,65.87456],[-179.43268,65.40411],[-180,64.979709],[-180,68.963636],[-177.55,68.2],[-174.92825,67.20589],[-175.01425,66.58435]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1.5},bbox:[-99.797401,68.75704,-95.647681,70.14354],geometry:{type:"Polygon",coordinates:[[[-95.647681,69.10769],[-96.269521,68.75704],[-97.617401,69.06003],[-98.431801,68.9507],[-99.797401,69.40003],[-98.917401,69.71003],[-98.218261,70.14354],[-97.157401,69.86003],[-96.557401,69.68003],[-96.257401,69.49003],[-95.647681,69.10769]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:1},bbox:[178.7253,70.78114,180,71.515714],geometry:{type:"Polygon",coordinates:[[[180,70.832199],[178.903425,70.78114],[178.7253,71.0988],[180,71.515714],[180,70.832199]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[-180,70.832199,-177.577945,71.55762],geometry:{type:"Polygon",coordinates:[[[-178.69378,70.89302],[-180,70.832199],[-180,71.515714],[-179.871875,71.55762],[-179.02433,71.55553],[-177.577945,71.26948],[-177.663575,71.13277],[-178.69378,70.89302]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[-168.110474,-53.856384,-34.72998,71.920471],geometry:{type:"Polygon",coordinates:[[[-90.547119,69.497681],[-90.551514,68.475098],[-89.215088,69.258728],[-88.019592,68.615112],[-88.317505,67.873474],[-87.350098,67.19873],[-86.306091,67.921509],[-85.576599,68.784485],[-85.521912,69.88208],[-84.100769,69.805481],[-82.622498,69.658325],[-81.280396,69.162109],[-81.220215,68.66571],[-81.964294,68.132507],[-81.259277,67.59729],[-81.386475,67.110901],[-83.344482,66.411682],[-84.735413,66.257324],[-85.769409,66.558289],[-86.067627,66.056274],[-87.031372,65.213074],[-87.323181,64.775696],[-88.48291,64.099121],[-89.914429,64.032715],[-90.703979,63.610291],[-90.77002,62.960327],[-91.933411,62.835083],[-93.156982,62.024719],[-94.241516,60.898682],[-94.629272,60.110291],[-94.684509,58.948914],[-93.215027,58.782104],[-92.764587,57.845703],[-92.296997,57.087097],[-90.897705,57.284729],[-89.03949,56.851685],[-88.039795,56.47168],[-87.324219,55.999084],[-86.071228,55.723877],[-85.01178,55.302673],[-83.360474,55.244873],[-82.272827,55.148315],[-82.436218,54.282288],[-82.125,53.2771],[-81.400696,52.157898],[-79.912903,51.208496],[-79.143005,51.533875],[-78.601929,52.562073],[-79.124207,54.141479],[-79.82959,54.667725],[-78.228699,55.136475],[-77.095581,55.837524],[-76.541382,56.534302],[-76.623108,57.202698],[-77.302185,58.052124],[-78.516907,58.804688],[-77.33667,59.852722],[-77.772705,60.757874],[-78.106812,62.319702],[-77.410583,62.550476],[-75.696228,62.278503],[-74.668213,62.181091],[-73.839905,62.443909],[-72.908508,62.105103],[-71.677002,61.52533],[-71.373718,61.137085],[-69.590393,61.061523],[-69.6203,60.221313],[-69.287903,58.957275],[-68.374512,58.801086],[-67.64978,58.212097],[-66.201782,58.767273],[-65.245178,59.870728],[-64.583496,60.335693],[-63.804687,59.442688],[-62.50238,58.167114],[-61.396484,56.967529],[-61.798584,56.339478],[-60.468506,55.775513],[-59.56958,55.204102],[-57.975098,54.945496],[-57.333191,54.626526],[-56.93689,53.780273],[-56.158081,53.647522],[-55.756287,53.270508],[-55.683289,52.146729],[-56.40918,51.770691],[-57.126892,51.419678],[-58.77478,51.06427],[-60.033081,50.24292],[-61.723572,50.080505],[-63.862488,50.291077],[-65.363281,50.298279],[-66.398987,50.228882],[-67.236328,49.511475],[-68.511108,49.068481],[-69.953613,47.744873],[-71.104492,46.821716],[-70.255188,46.986084],[-68.650024,48.30011],[-66.552429,49.133118],[-65.056213,49.23291],[-64.171021,48.742493],[-65.115479,48.070923],[-64.798523,46.993103],[-64.472107,46.238525],[-63.173279,45.739075],[-61.520691,45.883911],[-60.518127,47.007874],[-60.448608,46.282715],[-59.802795,45.920471],[-61.039795,45.26532],[-63.2547,44.670288],[-64.246582,44.265503],[-65.364075,43.545288],[-66.123413,43.618713],[-66.161682,44.465088],[-64.425476,45.292114],[-66.026001,45.259277],[-67.13739,45.137512],[-66.9646,44.809692],[-68.032471,44.325317],[-69.059998,43.980103],[-70.116089,43.684082],[-70.690002,43.03009],[-70.81488,42.865295],[-70.825012,42.335083],[-70.494995,41.805115],[-70.080017,41.78009],[-70.184998,42.145081],[-69.884888,41.922913],[-69.965027,41.637085],[-70.640015,41.475098],[-71.1203,41.494507],[-71.859985,41.320129],[-72.294983,41.270081],[-72.876404,41.220703],[-73.710022,40.931091],[-72.241211,41.119507],[-71.945007,40.930115],[-73.34491,40.630127],[-73.981995,40.628113],[-73.952271,40.750671],[-74.256714,40.473511],[-73.962402,40.427673],[-74.178406,39.70929],[-74.906006,38.939514],[-74.980408,39.196472],[-75.200012,39.248474],[-75.528076,39.498474],[-75.320007,38.960083],[-75.083496,38.781311],[-75.056702,38.404114],[-75.37738,38.015503],[-75.940186,37.216919],[-76.031189,37.256714],[-75.721985,37.937073],[-76.232788,38.319275],[-76.349976,39.150085],[-76.542725,38.717712],[-76.329285,38.083313],[-76.960022,38.23291],[-76.301575,37.918091],[-76.258728,36.966492],[-75.971802,36.897278],[-75.867981,36.551331],[-75.727478,35.55072],[-76.363098,34.808472],[-77.397583,34.512085],[-78.054871,33.925476],[-78.554321,33.861328],[-79.060608,33.49408],[-79.203491,33.158508],[-80.30127,32.509277],[-80.86499,32.033325],[-81.336304,31.440491],[-81.490417,30.730103],[-81.313721,30.035522],[-80.97998,29.180115],[-80.535583,28.472107],[-80.530029,28.0401],[-80.056519,26.880127],[-80.088013,26.205688],[-80.13147,25.816895],[-80.380981,25.206299],[-80.679993,25.080078],[-81.172119,25.201294],[-81.330017,25.640076],[-81.710022,25.870117],[-82.23999,26.730103],[-82.705078,27.495117],[-82.855286,27.886292],[-82.650024,28.55011],[-82.929993,29.100098],[-83.709595,29.936707],[-84.099976,30.090088],[-85.108826,29.636292],[-85.287781,29.686096],[-85.77301,30.15271],[-86.400024,30.400085],[-87.530273,30.274475],[-88.417786,30.384888],[-89.180481,30.316101],[-89.604919,30.176331],[-89.413696,29.894287],[-89.429993,29.488708],[-89.21759,29.291077],[-89.408203,29.159729],[-89.779297,29.307129],[-90.154602,29.117493],[-90.880188,29.148682],[-91.626709,29.677124],[-92.499084,29.552307],[-93.226379,29.783875],[-93.848389,29.713684],[-94.690002,29.480103],[-95.600281,28.738708],[-96.593994,28.307495],[-97.140015,27.830078],[-97.369995,27.380127],[-97.380005,26.690125],[-97.330017,26.210083],[-97.140198,25.869507],[-97.138611,25.86792],[-97.141785,25.865906],[-97.528076,24.992126],[-97.702881,24.272278],[-97.776001,22.932678],[-97.872375,22.444275],[-97.698975,21.898682],[-97.388977,21.411072],[-97.18927,20.635498],[-96.525513,19.89093],[-96.292114,19.320496],[-95.900879,18.828125],[-94.838989,18.562683],[-94.42572,18.144287],[-93.548584,18.423889],[-92.786072,18.524902],[-92.037292,18.704712],[-91.407898,18.876099],[-90.77179,19.284119],[-90.533508,19.867493],[-90.451477,20.70752],[-90.278625,20.999878],[-89.601318,21.261719],[-88.543884,21.493713],[-87.658386,21.458923],[-87.05188,21.543518],[-86.812012,21.331482],[-86.845886,20.849915],[-87.383301,20.255493],[-87.620972,19.646484],[-87.436707,19.472473],[-87.586487,19.0401],[-87.837219,18.259888],[-88.090576,18.516724],[-88.299988,18.500122],[-88.296326,18.353271],[-88.106812,18.348694],[-88.123413,18.076721],[-88.285278,17.644287],[-88.197876,17.489502],[-88.302612,17.131714],[-88.239502,17.036072],[-88.355408,16.530884],[-88.551819,16.265503],[-88.732422,16.233704],[-88.930603,15.887329],[-88.604614,15.706482],[-88.518311,15.85553],[-88.224976,15.727722],[-88.121094,15.688721],[-87.901794,15.864502],[-87.615601,15.878906],[-87.522888,15.797302],[-87.367676,15.846924],[-86.903198,15.756714],[-86.440918,15.782898],[-86.119202,15.893494],[-86.001892,16.005493],[-85.683289,15.953674],[-85.44397,15.885681],[-85.182373,15.909302],[-84.983704,15.995911],[-84.526978,15.8573],[-84.368225,15.835083],[-84.062988,15.648315],[-83.773987,15.424072],[-83.4104,15.270874],[-83.147217,14.995911],[-83.233215,14.899902],[-83.28418,14.676697],[-83.182129,14.31073],[-83.412476,13.970093],[-83.519775,13.567688],[-83.552185,13.127075],[-83.498474,12.869324],[-83.473328,12.419128],[-83.626099,12.320923],[-83.719604,11.893127],[-83.650879,11.629089],[-83.855408,11.373291],[-83.808899,11.103088],[-83.655579,10.938904],[-83.402283,10.395508],[-83.015686,9.993103],[-82.546204,9.566284],[-82.187073,9.20752],[-82.207581,8.995728],[-81.808594,8.950684],[-81.714111,9.032104],[-81.439209,8.786316],[-80.947327,8.858521],[-80.521912,9.111084],[-79.914612,9.312683],[-79.573303,9.611694],[-79.021179,9.552917],[-79.058411,9.454712],[-78.500916,9.420471],[-78.055908,9.247681],[-77.729492,8.946899],[-77.353271,8.670471],[-76.836609,8.638672],[-76.086304,9.336914],[-75.674622,9.443298],[-75.664673,9.774109],[-75.480408,10.61908],[-74.906921,11.08313],[-74.276672,11.102112],[-74.197205,11.310486],[-73.414673,11.227112],[-72.627808,11.732117],[-72.23822,11.955688],[-71.754089,12.437317],[-71.39978,12.376099],[-71.13739,12.113098],[-71.331604,11.776306],[-71.359985,11.5401],[-71.947021,11.423279],[-71.620789,10.969482],[-71.632996,10.446472],[-72.074097,9.865723],[-71.695618,9.072327],[-71.264587,9.137329],[-71.039978,9.860107],[-71.350098,10.211914],[-71.400574,10.969116],[-70.155212,11.375488],[-70.293823,11.846924],[-69.943176,12.162292],[-69.58429,11.459717],[-68.882996,11.443481],[-68.233276,10.885681],[-68.194092,10.554688],[-67.296204,10.545898],[-66.227783,10.648682],[-65.655212,10.200928],[-64.890381,10.077271],[-64.329407,10.389709],[-64.317993,10.641479],[-63.079285,10.701721],[-61.88092,10.715698],[-62.730103,10.420288],[-62.388489,9.948303],[-61.588684,9.873108],[-60.830505,9.381287],[-60.671204,8.580322],[-60.150085,8.602905],[-59.758301,8.367126],[-59.101685,7.999329],[-58.48291,7.347717],[-58.454895,6.832886],[-58.078125,6.809082],[-57.542175,6.321289],[-57.1474,5.973083],[-55.94928,5.772888],[-55.841797,5.953125],[-55.033203,6.02533],[-53.958008,5.756531],[-53.618408,5.646484],[-52.88208,5.409912],[-51.823303,4.565918],[-51.657776,4.156311],[-51.317078,4.203491],[-51.069702,3.650513],[-50.508789,1.901489],[-49.973999,1.736511],[-49.947083,1.046326],[-50.69928,.223083],[-50.388184,-.078369],[-48.620483,-.235413],[-48.584412,-1.237793],[-47.82489,-.581604],[-46.566589,-.940979],[-44.905701,-1.551697],[-44.417603,-2.137695],[-44.581604,-2.691284],[-43.418701,-2.383118],[-41.472595,-2.911987],[-39.978577,-2.872986],[-38.500305,-3.700623],[-37.223206,-4.820923],[-36.452881,-5.109375],[-35.597778,-5.149475],[-35.235413,-5.464905],[-34.895996,-6.73822],[-34.72998,-7.343201],[-35.128174,-8.996399],[-35.636902,-9.649292],[-37.046509,-11.04071],[-37.683594,-12.171204],[-38.423889,-13.038086],[-38.673889,-13.057678],[-38.953186,-13.793396],[-38.882324,-15.666992],[-39.161011,-17.208374],[-39.267273,-17.867676],[-39.583496,-18.262207],[-39.760803,-19.599121],[-40.774719,-20.90448],[-40.944702,-21.937317],[-41.754089,-22.370605],[-41.988281,-22.970093],[-43.074707,-22.967712],[-44.647827,-23.35199],[-45.352112,-23.796814],[-46.472107,-24.088989],[-47.648987,-24.885193],[-48.495483,-25.877014],[-48.640991,-26.623718],[-48.47467,-27.175903],[-48.661499,-28.186096],[-48.888428,-28.674072],[-49.58728,-29.224487],[-50.696899,-30.984375],[-51.576172,-31.77771],[-52.256104,-32.2453],[-52.712097,-33.196594],[-53.373596,-33.768311],[-53.806396,-34.39679],[-54.935791,-34.952576],[-55.674011,-34.752686],[-56.21521,-34.859802],[-57.139709,-34.430481],[-57.81781,-34.462524],[-58.427002,-33.909485],[-58.495422,-34.431519],[-57.225769,-35.288025],[-57.362305,-35.977417],[-56.737488,-36.413086],[-56.788208,-36.901489],[-57.749084,-38.183899],[-59.231812,-38.720215],[-61.237427,-38.928406],[-62.335876,-38.827698],[-62.125793,-39.424072],[-62.330505,-40.172607],[-62.145996,-40.67688],[-62.745789,-41.028687],[-63.770508,-41.166809],[-64.732117,-40.802612],[-65.117981,-41.06427],[-64.978577,-42.057983],[-64.303406,-42.359009],[-63.75592,-42.043701],[-63.458008,-42.56311],[-64.378784,-42.873474],[-65.181824,-43.4953],[-65.328796,-44.501282],[-65.565186,-45.036804],[-66.509888,-45.039612],[-67.293823,-45.55188],[-67.580505,-46.301697],[-66.596985,-47.033875],[-65.640991,-47.236084],[-65.985107,-48.133301],[-67.166199,-48.697327],[-67.816101,-49.86969],[-68.728699,-50.264221],[-69.138489,-50.732483],[-68.815491,-51.771118],[-68.150024,-52.349976],[-68.571472,-52.299377],[-69.461304,-52.29187],[-69.942688,-52.537903],[-70.845093,-52.89917],[-71.006287,-53.833191],[-71.42981,-53.856384],[-72.557922,-53.531372],[-73.702698,-52.835083],[-74.946777,-52.262695],[-75.26001,-51.629272],[-74.976624,-51.043396],[-75.479675,-50.378296],[-75.607971,-48.673706],[-75.182678,-47.711914],[-74.126587,-46.939209],[-75.644409,-46.647583],[-74.692078,-45.763977],[-74.351685,-44.103027],[-73.240295,-44.454895],[-72.717712,-42.383301],[-73.388916,-42.117493],[-73.701294,-43.365784],[-74.331909,-43.224976],[-74.017883,-41.7948],[-73.677124,-39.9422],[-73.21759,-39.258606],[-73.505493,-38.282898],[-73.588013,-37.156311],[-73.166687,-37.123779],[-72.553101,-35.508789],[-71.861694,-33.909119],[-71.438477,-32.418884],[-71.668701,-30.920593],[-71.369995,-30.095703],[-71.489807,-28.861389],[-70.90509,-27.640381],[-70.724976,-25.705872],[-70.403992,-23.628906],[-70.091187,-21.393311],[-70.164429,-19.756409],[-70.372498,-18.3479],[-71.375183,-17.773804],[-71.461975,-17.363403],[-73.444519,-16.359375],[-75.237793,-15.265686],[-76.009216,-14.649292],[-76.423401,-13.823181],[-76.259216,-13.534973],[-77.106201,-12.222717],[-78.092102,-10.377686],[-79.036926,-8.386597],[-79.445923,-7.930786],[-79.760498,-7.194275],[-80.537476,-6.541687],[-81.25,-6.13678],[-80.92627,-5.690491],[-81.410889,-4.736694],[-81.099609,-4.036377],[-80.30249,-3.404785],[-79.770203,-2.657471],[-79.986511,-2.220703],[-80.368713,-2.685181],[-80.967712,-2.246887],[-80.764771,-1.965027],[-80.933594,-1.057373],[-80.583313,-.906677],[-80.399292,-.283691],[-80.020813,.360474],[-80.090576,.768494],[-79.542786,.98291],[-78.855286,1.38092],[-78.990906,1.691284],[-78.617798,1.766479],[-78.662109,2.267273],[-78.427612,2.6297],[-77.931519,2.696716],[-77.510376,3.325073],[-77.127686,3.84967],[-77.496277,4.087708],[-77.307617,4.668091],[-77.533203,5.582886],[-77.318787,5.845276],[-77.476685,6.691101],[-77.881592,7.223877],[-78.214905,7.512329],[-78.429077,8.052124],[-78.182007,8.319275],[-78.435486,8.387695],[-78.62207,8.718079],[-79.1203,8.996094],[-79.5578,8.932495],[-79.760498,8.584473],[-80.16449,8.333313],[-80.382629,8.298523],[-80.480713,8.090271],[-80.003601,7.547485],[-80.276611,7.419678],[-80.421082,7.271484],[-80.886414,7.22052],[-81.059509,7.817871],[-81.189697,7.647888],[-81.51947,7.706726],[-81.721313,8.108887],[-82.131409,8.175476],[-82.390869,8.29248],[-82.820007,8.290894],[-82.850891,8.073914],[-82.965698,8.225098],[-83.508423,8.446899],[-83.711487,8.656921],[-83.596313,8.830505],[-83.632629,9.051514],[-83.909912,9.290894],[-84.303406,9.487488],[-84.647583,9.615479],[-84.713379,9.908081],[-84.975586,10.086731],[-84.911377,9.796082],[-85.110901,9.557129],[-85.339478,9.834473],[-85.660706,9.933289],[-85.797424,10.134888],[-85.791687,10.43927],[-85.659302,10.754272],[-85.941711,10.895325],[-85.712524,11.088501],[-86.058411,11.403503],[-86.525879,11.806885],[-86.745911,12.144104],[-87.16748,12.458313],[-87.668518,12.909912],[-87.557495,13.064697],[-87.392395,12.914124],[-87.316589,12.98468],[-87.48938,13.297485],[-87.793091,13.384521],[-87.904114,13.149109],[-88.483276,13.163879],[-88.843201,13.259705],[-89.256714,13.458679],[-89.812378,13.520691],[-90.095581,13.735474],[-90.608582,13.909912],[-91.232422,13.927917],[-91.689697,14.126282],[-92.227722,14.538879],[-93.359375,15.615479],[-93.875183,15.940308],[-94.691589,16.201111],[-95.250183,16.128296],[-96.053406,15.752075],[-96.557373,15.653503],[-97.263611,15.917114],[-98.013,16.1073],[-98.947693,16.566101],[-99.697388,16.706299],[-100.829529,17.171082],[-101.666077,17.649109],[-101.918518,17.916077],[-102.478088,17.975891],[-103.500977,18.292297],[-103.91748,18.748718],[-104.992004,19.316284],[-105.492981,19.946899],[-105.731384,20.434082],[-105.397705,20.531677],[-105.50061,20.816895],[-105.270691,21.076294],[-105.265808,21.422119],[-105.603088,21.871277],[-105.69342,22.269104],[-106.028687,22.773682],[-106.909912,23.767883],[-107.915405,24.548889],[-108.401917,25.172302],[-109.260193,25.580688],[-109.444092,25.82489],[-109.291626,26.442871],[-109.801392,26.676086],[-110.391724,27.162109],[-110.640991,27.859924],[-111.178894,27.941284],[-111.759583,28.468079],[-112.22821,28.954529],[-112.27179,29.266907],[-112.809509,30.021118],[-113.163818,30.786926],[-113.148682,31.171082],[-113.871887,31.567688],[-114.205688,31.524109],[-114.776428,31.799683],[-114.936707,31.393494],[-114.771179,30.913696],[-114.673889,30.16272],[-114.330994,29.750488],[-113.588806,29.061707],[-113.424011,28.826294],[-113.271912,28.754883],[-113.140015,28.411316],[-112.96228,28.425293],[-112.761597,27.780273],[-112.457886,27.525879],[-112.244873,27.171875],[-111.616516,26.662903],[-111.284607,25.732727],[-110.987793,25.294678],[-110.710022,24.826111],[-110.655029,24.298706],[-110.172791,24.265686],[-109.77179,23.811279],[-109.409119,23.364685],[-109.433411,23.18573],[-109.854187,22.818298],[-110.031311,22.82312],[-110.294983,23.431091],[-110.949524,24.001099],[-111.670593,24.484497],[-112.182007,24.738525],[-112.148987,25.470276],[-112.30072,26.012085],[-112.777283,26.322083],[-113.4646,26.768311],[-113.59668,26.639526],[-113.848877,26.900085],[-114.465698,27.14209],[-115.055115,27.722717],[-114.982178,27.798279],[-114.570312,27.741516],[-114.19928,28.115112],[-114.161987,28.566101],[-114.931824,29.27948],[-115.518677,29.556274],[-115.88739,30.180908],[-116.258301,30.836487],[-116.721497,31.635681],[-117.127686,32.535278],[-117.295898,33.046326],[-117.943909,33.621277],[-118.410583,33.740906],[-118.519897,34.027893],[-119.080994,34.078125],[-119.438782,34.348511],[-120.367798,34.447083],[-120.622803,34.608521],[-120.744324,35.156921],[-121.7146,36.161682],[-122.547485,37.55188],[-122.512024,37.783508],[-122.953186,38.113708],[-123.727112,38.951721],[-123.865112,39.76709],[-124.39801,40.313293],[-124.178772,41.14209],[-124.213684,41.999695],[-124.532776,42.766113],[-124.14209,43.708496],[-123.898926,45.523499],[-124.07959,46.864685],[-124.395691,47.720276],[-124.687195,48.184509],[-124.566101,48.3797],[-123.119995,48.0401],[-122.58728,47.09613],[-122.340027,47.360107],[-122.5,48.180115],[-122.840027,49.000122],[-122.974182,49.002686],[-124.910217,49.98468],[-125.624573,50.416687],[-127.435608,50.830688],[-127.992676,51.715881],[-127.850281,52.329712],[-129.1297,52.755493],[-129.305176,53.561707],[-130.514893,54.28772],[-130.536072,54.802673],[-131.085815,55.178894],[-131.967224,55.497925],[-132.25,56.370117],[-133.539185,57.178894],[-134.078003,58.123108],[-135.038208,58.187683],[-136.627991,58.21228],[-137.799988,58.500122],[-139.867798,59.537903],[-140.825195,59.727478],[-142.574402,60.084473],[-143.958801,59.999329],[-145.925476,60.458679],[-147.11438,60.884705],[-148.224304,60.673096],[-148.018005,59.978271],[-148.570801,59.914307],[-149.727783,59.705688],[-150.608215,59.368286],[-151.716309,59.155884],[-151.859375,59.745117],[-151.409729,60.725891],[-150.346924,61.033691],[-150.621094,61.284485],[-151.895813,60.727295],[-152.578308,60.061707],[-154.019104,59.350281],[-153.287476,58.864685],[-154.232483,58.146484],[-155.307495,57.727905],[-156.308289,57.422913],[-156.556091,56.980103],[-158.117187,56.463684],[-158.433289,55.99408],[-159.603271,55.566711],[-160.289673,55.643677],[-161.223022,55.364685],[-162.237793,55.024292],[-163.069397,54.68988],[-164.785583,54.404297],[-164.9422,54.572327],[-163.848328,55.03949],[-162.869995,55.348083],[-161.804199,55.895081],[-160.563599,56.008118],[-160.070496,56.418091],[-158.684387,57.016724],[-158.461121,57.216919],[-157.722778,57.570129],[-157.550293,58.328308],[-157.041687,58.918884],[-158.194702,58.615906],[-158.517212,58.787903],[-159.058594,58.424316],[-159.711609,58.931519],[-159.981201,58.572693],[-160.355286,59.071106],[-161.35498,58.670898],[-161.968811,58.671692],[-162.054993,59.266907],[-161.874084,59.633728],[-162.518005,59.989685],[-163.818298,59.798096],[-164.66217,60.267517],[-165.346375,60.507507],[-165.350769,61.073914],[-166.121399,61.500122],[-165.734375,62.075073],[-164.919189,62.633118],[-164.5625,63.146484],[-163.753296,63.219482],[-163.0672,63.059509],[-162.260498,63.54187],[-161.534424,63.455872],[-160.772522,63.766113],[-160.958313,64.2229],[-161.518005,64.402893],[-160.77771,64.788696],[-161.391907,64.777283],[-162.453003,64.559509],[-162.757813,64.338684],[-163.546387,64.559082],[-164.960815,64.447083],[-166.425293,64.686707],[-166.844971,65.088928],[-168.110474,65.670105],[-166.7052,66.088318],[-164.47467,66.576721],[-163.652527,66.576721],[-163.788513,66.077271],[-161.677795,66.116089],[-162.489685,66.735474],[-163.719727,67.116516],[-164.430908,67.616272],[-165.390198,68.042908],[-166.764404,68.358887],[-166.204712,68.883118],[-164.430786,68.915527],[-163.168579,69.371094],[-162.930481,69.858093],[-161.908875,70.333313],[-160.934814,70.447693],[-159.039185,70.891724],[-158.11969,70.824707],[-156.580811,71.35791],[-155.06781,71.147888],[-154.344177,70.696472],[-153.900024,70.890076],[-152.210022,70.830078],[-152.27002,70.600098],[-150.73999,70.430115],[-149.719971,70.53009],[-147.613281,70.214111],[-145.690002,70.120117],[-144.919983,69.990112],[-143.589417,70.152527],[-142.07251,69.851929],[-140.985901,69.712097],[-139.120483,69.47113],[-137.546387,68.990112],[-136.503601,68.898071],[-135.625671,69.315125],[-134.414612,69.627502],[-132.929199,69.50531],[-131.431274,69.944519],[-129.794678,70.193726],[-129.107727,69.779297],[-128.361511,70.012878],[-128.138184,70.483887],[-127.447083,70.377319],[-125.756287,69.480713],[-124.424805,70.158508],[-124.289612,69.399719],[-123.061096,69.563721],[-122.683411,69.85553],[-121.47229,69.797913],[-119.94281,69.37793],[-117.6026,69.011292],[-116.226379,68.841492],[-115.246887,68.905884],[-113.897888,68.398926],[-115.30481,67.90271],[-113.497192,67.688293],[-110.797913,67.806091],[-109.946106,67.981079],[-108.880188,67.381531],[-107.792419,67.887512],[-108.812988,68.311707],[-108.167175,68.653931],[-106.950012,68.700073],[-106.150024,68.80011],[-105.342773,68.561279],[-104.337891,68.018127],[-103.221069,68.0979],[-101.454285,67.646912],[-99.901978,67.805725],[-98.443176,67.781677],[-98.558594,68.403931],[-97.669495,68.578674],[-96.119873,68.239502],[-96.125793,67.293518],[-95.48938,68.090698],[-94.684998,68.063904],[-94.232788,69.069092],[-95.304077,69.68573],[-96.471313,70.089905],[-96.391113,71.194885],[-95.208801,71.920471],[-93.889893,71.760071],[-92.878113,71.318726],[-91.519592,70.191284],[-92.406921,69.700073],[-90.547119,69.497681]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[-119.40199,68.53554,-100.98078,73.31459],geometry:{type:"Polygon",coordinates:[[[-114.16717,73.12145],[-114.66634,72.65277],[-112.44102,72.9554],[-111.05039,72.4504],[-109.92035,72.96113],[-109.00654,72.63335],[-108.18835,71.65089],[-107.68599,72.06548],[-108.39639,73.08953],[-107.51645,73.23598],[-106.52259,73.07601],[-105.40246,72.67259],[-104.77484,71.6984],[-104.46476,70.99297],[-102.78537,70.49776],[-100.98078,70.02432],[-101.08929,69.58447],[-102.73116,69.50402],[-102.09329,69.11962],[-102.43024,68.75282],[-104.24,68.91],[-105.96,69.18],[-107.12254,69.11922],[-109,68.78],[-111.9668,68.60446],[-113.3132,68.53554],[-113.85496,69.00744],[-115.22,69.28],[-116.10794,69.16821],[-117.34,69.96],[-116.67473,70.06655],[-115.13112,70.2373],[-113.72141,70.19237],[-112.4161,70.36638],[-114.35,70.6],[-116.48684,70.52045],[-117.9048,70.54056],[-118.43238,70.9092],[-116.11311,71.30918],[-117.65568,71.2952],[-119.40199,71.55859],[-118.56267,72.30785],[-117.86642,72.70594],[-115.18909,73.31459],[-114.16717,73.12145]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:1.5},bbox:[-106.94,72.76,-104.5,73.64],geometry:{type:"Polygon",coordinates:[[[-104.5,73.42],[-105.38,72.76],[-106.94,73.46],[-106.6,73.6],[-105.26,73.64],[-104.5,73.42]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:1},bbox:[-80.876099,72.742203,-76.251404,73.75972],geometry:{type:"Polygon",coordinates:[[[-76.34,73.102685],[-76.251404,72.826385],[-77.314438,72.855545],[-78.39167,72.876656],[-79.486252,72.742203],[-79.775833,72.802902],[-80.876099,73.333183],[-80.833885,73.693184],[-80.353058,73.75972],[-78.064438,73.651932],[-76.34,73.102685]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[-90.20516,61.930897,-61.851981,73.803816],geometry:{type:"Polygon",coordinates:[[[-86.562179,73.157447],[-85.774371,72.534126],[-84.850112,73.340278],[-82.31559,73.750951],[-80.600088,72.716544],[-80.748942,72.061907],[-78.770639,72.352173],[-77.824624,72.749617],[-75.605845,72.243678],[-74.228616,71.767144],[-74.099141,71.33084],[-72.242226,71.556925],[-71.200015,70.920013],[-68.786054,70.525024],[-67.91497,70.121948],[-66.969033,69.186087],[-68.805123,68.720198],[-66.449866,68.067163],[-64.862314,67.847539],[-63.424934,66.928473],[-61.851981,66.862121],[-62.163177,66.160251],[-63.918444,64.998669],[-65.14886,65.426033],[-66.721219,66.388041],[-68.015016,66.262726],[-68.141287,65.689789],[-67.089646,65.108455],[-65.73208,64.648406],[-65.320168,64.382737],[-64.669406,63.392927],[-65.013804,62.674185],[-66.275045,62.945099],[-68.783186,63.74567],[-67.369681,62.883966],[-66.328297,62.280075],[-66.165568,61.930897],[-68.877367,62.330149],[-71.023437,62.910708],[-72.235379,63.397836],[-71.886278,63.679989],[-73.378306,64.193963],[-74.834419,64.679076],[-74.818503,64.389093],[-77.70998,64.229542],[-78.555949,64.572906],[-77.897281,65.309192],[-76.018274,65.326969],[-73.959795,65.454765],[-74.293883,65.811771],[-73.944912,66.310578],[-72.651167,67.284576],[-72.92606,67.726926],[-73.311618,68.069437],[-74.843307,68.554627],[-76.869101,68.894736],[-76.228649,69.147769],[-77.28737,69.76954],[-78.168634,69.826488],[-78.957242,70.16688],[-79.492455,69.871808],[-81.305471,69.743185],[-84.944706,69.966634],[-87.060003,70.260001],[-88.681713,70.410741],[-89.51342,70.762038],[-88.467721,71.218186],[-89.888151,71.222552],[-90.20516,72.235074],[-89.436577,73.129464],[-88.408242,73.537889],[-85.826151,73.803816],[-86.562179,73.157447]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[-102.5,71.27285,-96.54,73.84389],geometry:{type:"Polygon",coordinates:[[[-100.35642,73.84389],[-99.16387,73.63339],[-97.38,73.76],[-97.12,73.47],[-98.05359,72.99052],[-96.54,72.56],[-96.72,71.66],[-98.35966,71.27285],[-99.32286,71.35639],[-100.01482,71.73827],[-102.5,72.51],[-102.48,72.83],[-100.43836,72.70588],[-101.54,73.36],[-100.35642,73.84389]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:1},bbox:[139.86312,73.20544,143.60385,73.85758],geometry:{type:"Polygon",coordinates:[[[143.60385,73.21244],[142.08763,73.20544],[140.038155,73.31692],[139.86312,73.36983],[140.81171,73.76506],[142.06207,73.85758],[143.48283,73.47525],[143.60385,73.21244]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:.5},bbox:[-96.033745,72.024596,-90.509793,74.134907],geometry:{type:"Polygon",coordinates:[[[-93.196296,72.771992],[-94.269047,72.024596],[-95.409856,72.061881],[-96.033745,72.940277],[-96.018268,73.43743],[-95.495793,73.862417],[-94.503658,74.134907],[-92.420012,74.100025],[-90.509793,73.856732],[-92.003965,72.966244],[-93.196296,72.771992]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[-125.92896,70.90164,-115.51081,74.44893],geometry:{type:"Polygon",coordinates:[[[-120.46,71.4],[-123.09219,70.90164],[-123.62,71.34],[-125.92896,71.86868],[-125.59271,72.19452],[-124.80729,73.02256],[-123.94,73.68],[-124.91775,74.29275],[-121.53788,74.44893],[-120.10978,74.24135],[-117.55564,74.18577],[-116.58442,73.89607],[-115.51081,73.47519],[-116.76794,73.22292],[-119.22,72.52],[-120.46,71.82],[-120.46,71.4]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:1},bbox:[146.11919,74.68892,150.73167,75.49682],geometry:{type:"Polygon",coordinates:[[[150.73167,75.08406],[149.575925,74.68892],[147.977465,74.778355],[146.11919,75.17298],[146.358485,75.49682],[148.22223,75.345845],[150.73167,75.08406]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1.5},bbox:[-96.820932,74.592347,-93.612756,75.647218],geometry:{type:"Polygon",coordinates:[[[-93.612756,74.979997],[-94.156909,74.592347],[-95.608681,74.666864],[-96.820932,74.927623],[-96.288587,75.377828],[-94.85082,75.647218],[-93.977747,75.29649],[-93.612756,74.979997]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[136.97439,74.61148,145.086285,76.13676],geometry:{type:"Polygon",coordinates:[[[145.086285,75.562625],[144.3,74.82],[140.61381,74.84768],[138.95544,74.61148],[136.97439,75.26167],[137.51176,75.94917],[138.831075,76.13676],[141.471615,76.09289],[145.086285,75.562625]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[-102.56552,74.89744,-97.704415,76.72],geometry:{type:"Polygon",coordinates:[[[-98.5,76.72],[-97.735585,76.25656],[-97.704415,75.74344],[-98.16,75],[-99.80874,74.89744],[-100.88366,75.05736],[-100.86292,75.64075],[-102.50209,75.5638],[-102.56552,76.3366],[-101.48973,76.30537],[-99.98349,76.64634],[-98.57699,76.58859],[-98.5,76.72]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[-117.7104,74.39427,-105.70498,76.79417],geometry:{type:"Polygon",coordinates:[[[-108.21141,76.20168],[-107.81943,75.84552],[-106.92893,76.01282],[-105.881,75.9694],[-105.70498,75.47951],[-106.31347,75.00527],[-109.7,74.85],[-112.22307,74.41696],[-113.74381,74.39427],[-113.87135,74.72029],[-111.79421,75.1625],[-116.31221,75.04343],[-117.7104,75.2222],[-116.34602,76.19903],[-115.40487,76.47887],[-112.59056,76.14134],[-110.81422,75.54919],[-109.0671,75.47321],[-110.49726,76.42982],[-109.5811,76.79417],[-108.54859,76.67832],[-108.21141,76.20168]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[51.455754,70.632743,68.852211,76.939697],geometry:{type:"Polygon",coordinates:[[[57.535693,70.720464],[56.944979,70.632743],[53.677375,70.762658],[53.412017,71.206662],[51.601895,71.474759],[51.455754,72.014881],[52.478275,72.229442],[52.444169,72.774731],[54.427614,73.627548],[53.50829,73.749814],[55.902459,74.627486],[55.631933,75.081412],[57.868644,75.60939],[61.170044,76.251883],[64.498368,76.439055],[66.210977,76.809782],[68.15706,76.939697],[68.852211,76.544811],[68.180573,76.233642],[64.637326,75.737755],[61.583508,75.260885],[58.477082,74.309056],[56.986786,73.333044],[55.419336,72.371268],[55.622838,71.540595],[57.535693,70.720464]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[-97.121379,74.392307,-79.833933,77.161389],geometry:{type:"Polygon",coordinates:[[[-94.684086,77.097878],[-93.573921,76.776296],[-91.605023,76.778518],[-90.741846,76.449597],[-90.969661,76.074013],[-89.822238,75.847774],[-89.187083,75.610166],[-87.838276,75.566189],[-86.379192,75.482421],[-84.789625,75.699204],[-82.753445,75.784315],[-81.128531,75.713983],[-80.057511,75.336849],[-79.833933,74.923127],[-80.457771,74.657304],[-81.948843,74.442459],[-83.228894,74.564028],[-86.097452,74.410032],[-88.15035,74.392307],[-89.764722,74.515555],[-92.422441,74.837758],[-92.768285,75.38682],[-92.889906,75.882655],[-93.893824,76.319244],[-95.962457,76.441381],[-97.121379,76.751078],[-96.745123,77.161389],[-94.684086,77.097878]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:.5},bbox:[-122.854925,75.900019,-116.198587,77.645287],geometry:{type:"Polygon",coordinates:[[[-116.198587,77.645287],[-116.335813,76.876962],[-117.106051,76.530032],[-118.040412,76.481172],[-119.899318,76.053213],[-121.499995,75.900019],[-122.854924,76.116543],[-122.854925,76.116543],[-121.157535,76.864508],[-119.103939,77.51222],[-117.570131,77.498319],[-116.198587,77.645287]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[-17.625,-34.819092,180,77.697876],geometry:{type:"Polygon",coordinates:[[[106.970276,76.974304],[107.240112,76.480103],[108.153931,76.723328],[111.077271,76.710083],[113.331482,76.22229],[114.134277,75.847717],[113.885498,75.327881],[112.779297,75.031921],[110.151306,74.476685],[109.400085,74.180115],[110.640076,74.0401],[112.119324,73.78772],[113.01947,73.976929],[113.529724,73.335083],[113.968872,73.59491],[115.567871,73.75293],[118.776306,73.587708],[119.020081,73.120117],[123.200684,72.971313],[123.257874,73.735107],[125.380127,73.56012],[126.976501,73.565491],[128.591309,73.038696],[129.051697,72.398682],[128.460083,71.980103],[129.716125,71.193115],[131.288696,70.787109],[132.253479,71.836304],[133.857727,71.386475],[135.562073,71.655273],[137.497681,71.347717],[138.234131,71.628113],[139.869873,71.487915],[139.147888,72.416321],[140.468079,72.849487],[149.500122,72.200073],[150.351318,71.606506],[152.968872,70.842285],[157.006897,71.031494],[158.997925,70.866699],[159.830322,70.453308],[159.708679,69.722107],[160.940674,69.437317],[162.279114,69.64209],[164.05249,69.668274],[165.940491,69.472107],[167.835693,69.582703],[169.577698,68.693909],[170.816895,69.013672],[170.008301,69.652893],[170.453491,70.097107],[173.643921,69.817505],[175.724121,69.877319],[178.600098,69.400085],[180,68.963722],[180,64.979584],[179.99292,64.974304],[178.707275,64.534912],[177.411316,64.608276],[178.31311,64.075928],[178.908325,63.252075],[179.370483,62.982727],[179.486511,62.569092],[179.228271,62.304077],[177.364319,62.521912],[174.569275,61.769287],[173.680115,61.65271],[172.150085,60.950073],[170.698486,60.336304],[170.330872,59.881897],[168.900513,60.573486],[166.295105,59.788696],[165.840088,60.160095],[164.876892,59.731689],[163.539307,59.868713],[163.217102,59.211121],[162.017273,58.243286],[162.053101,57.839111],[163.191895,57.615112],[163.057922,56.159302],[162.1297,56.122314],[161.701477,55.285706],[162.117493,54.855286],[160.368896,54.344482],[160.021729,53.202698],[158.530884,52.958679],[158.231323,51.942688],[156.789917,51.011108],[156.420105,51.700073],[155.991882,53.158875],[155.433716,55.381104],[155.91449,56.767883],[156.758301,57.364685],[156.810486,57.832092],[158.364319,58.055725],[160.150696,59.31488],[161.87207,60.343079],[163.669678,61.14093],[164.473694,62.55072],[163.258484,62.466309],[162.657898,61.642517],[160.121521,60.544312],[159.302307,61.774109],[156.720703,61.434509],[154.218079,59.758301],[155.043884,59.145081],[152.81189,58.883911],[151.265686,58.780884],[151.338074,59.504089],[149.783691,59.655701],[148.544922,59.16449],[145.487305,59.336487],[142.197876,59.0401],[138.958496,57.088074],[135.126282,54.729675],[136.701721,54.603699],[137.193481,53.977295],[138.164673,53.755127],[138.804688,54.2547],[139.901489,54.189697],[141.345276,53.089722],[141.379272,52.238892],[140.597473,51.239685],[140.513123,50.045471],[140.062073,48.446716],[138.554688,46.999695],[138.219727,46.307922],[136.862305,45.143494],[135.51532,43.989075],[134.869507,43.398315],[133.536926,42.811523],[132.906311,42.798523],[132.278076,43.284485],[130.935913,42.552673],[130.78009,42.220093],[130.400085,42.28009],[129.965881,41.941284],[129.66748,41.601074],[129.705322,40.882874],[129.18811,40.661926],[129.010498,40.485474],[128.633484,40.18988],[127.967529,40.025513],[127.533508,39.756897],[127.502075,39.323914],[127.385498,39.213501],[127.783325,39.050903],[128.34967,38.612305],[129.212891,37.432495],[129.46051,36.784302],[129.468323,35.63208],[129.091492,35.08252],[128.185913,34.890503],[127.386475,34.475708],[126.485718,34.390076],[126.373901,34.934692],[126.559326,35.684692],[126.117493,36.725525],[126.860291,36.893921],[126.174683,37.749695],[125.689087,37.940125],[125.568481,37.752075],[125.27533,37.669128],[125.240112,37.8573],[124.981079,37.948914],[124.71228,38.108276],[124.986084,38.548523],[125.221924,38.665894],[125.132874,38.848694],[125.386719,39.387878],[125.321106,39.551514],[124.737488,39.660278],[124.265686,39.928528],[122.867676,39.637878],[122.131531,39.170471],[121.054688,38.897522],[121.586121,39.360901],[121.376892,39.750305],[122.168701,40.422485],[121.640503,40.946472],[120.768677,40.593506],[119.639709,39.898071],[119.023499,39.252319],[118.042725,39.204285],[117.532715,38.737671],[118.059692,38.061523],[118.878296,37.897278],[118.911682,37.448486],[119.702881,37.156494],[120.823486,37.870483],[121.711304,37.481079],[122.35791,37.454529],[122.520081,36.930725],[121.104309,36.651306],[120.637085,36.111511],[119.664673,35.609924],[119.151306,34.909912],[120.227478,34.360474],[120.620483,33.376709],[121.229126,32.460327],[121.908081,31.692322],[121.891907,30.94928],[121.264282,30.676331],[121.503479,30.142883],[122.092102,29.83252],[121.938477,29.018127],[121.684509,28.225525],[121.125671,28.135681],[120.395508,27.053284],[119.58551,25.740906],[118.656921,24.547485],[117.281677,23.624512],[115.890686,22.782898],[114.763916,22.668091],[114.152527,22.223877],[113.806885,22.548279],[113.241089,22.051514],[111.843689,21.550476],[110.785522,21.397278],[110.444092,20.341125],[109.889893,20.282471],[109.627686,21.008301],[109.864502,21.395081],[108.522888,21.715271],[108.050293,21.55249],[106.715088,20.696899],[105.881714,19.752075],[105.662109,19.058289],[106.42688,18.004089],[107.361877,16.69751],[108.26947,16.079712],[108.877075,15.276672],[109.335327,13.426086],[109.200073,11.66687],[108.366089,11.008301],[107.220886,10.364502],[106.40509,9.530884],[105.158325,8.59967],[104.795288,9.241089],[105.076294,9.918518],[104.334473,10.486694],[103.497314,10.63269],[103.090698,11.153687],[102.585083,12.186707],[101.687073,12.645874],[100.831909,12.627075],[100.978516,13.41272],[100.0979,13.406921],[100.018677,12.307129],[99.478882,10.846497],[99.153687,9.963074],[99.222473,9.239319],[99.873901,9.207886],[100.279724,8.295288],[100.45929,7.429687],[101.017273,6.856873],[101.623108,6.740723],[102.141296,6.22168],[102.371277,6.128296],[102.961731,5.524475],[103.381287,4.855103],[103.438721,4.181702],[103.332092,3.726685],[103.429504,3.382874],[103.502502,2.791077],[103.854675,2.515503],[104.247925,1.631287],[104.228882,1.293091],[103.519714,1.226318],[102.57373,1.967102],[101.390686,2.760925],[101.273682,3.270325],[100.695496,3.939087],[100.557495,4.767273],[100.196716,5.3125],[100.306274,6.04071],[100.085876,6.464478],[99.690674,6.848328],[99.519714,7.343506],[98.988281,7.908081],[98.503906,8.382324],[98.339722,7.794495],[98.150085,8.350098],[98.259277,8.973877],[98.553528,9.933105],[98.457275,10.675293],[98.764526,11.441284],[98.428284,12.033081],[98.509705,13.122498],[98.103699,13.640503],[97.77771,14.83728],[97.597107,16.100708],[97.164673,16.928711],[96.50592,16.427307],[95.369324,15.714478],[94.808472,15.803528],[94.188904,16.038086],[94.533508,17.277283],[94.32489,18.213501],[93.541077,19.366516],[93.66333,19.727112],[93.078308,19.855286],[92.36853,20.670898],[92.082886,21.192322],[92.02533,21.701721],[91.8349,22.182922],[91.417114,22.765076],[90.496094,22.805115],[90.587097,22.392883],[90.272888,21.836487],[89.847473,22.039124],[89.702087,21.857117],[89.418884,21.966309],[89.032104,22.055725],[88.888916,21.690674],[88.208496,21.703308],[86.975708,21.495483],[87.033081,20.743286],[86.499329,20.151672],[85.060303,19.478699],[83.941101,18.302124],[83.18927,17.671326],[82.192871,17.016724],[82.191284,16.556702],[81.692688,16.310303],[80.792114,15.952087],[80.32489,15.899292],[80.025085,15.136475],[80.233276,13.835876],[80.286316,13.006287],[79.862488,12.056274],[79.858093,10.3573],[79.340515,10.308899],[78.885498,9.546082],[79.189697,9.216675],[78.278076,8.933105],[77.941284,8.25293],[77.539917,7.965515],[76.593079,8.899292],[76.130127,10.299683],[75.746521,11.308289],[75.396118,11.781311],[74.864929,12.741882],[74.616699,13.992676],[74.443909,14.61731],[73.534302,15.990723],[73.119873,17.928711],[72.820923,19.208313],[72.824524,20.419495],[72.630676,21.356079],[71.175293,20.757507],[70.47052,20.877319],[69.164124,22.089294],[69.644897,22.450684],[69.34967,22.843323],[68.176697,23.692078],[67.443726,23.944885],[67.145508,24.663696],[66.372925,25.425293],[64.530518,25.237122],[62.905701,25.218506],[61.497498,25.078308],[59.616089,25.380127],[58.525879,25.610107],[57.397278,25.739929],[56.970886,26.966125],[56.492126,27.143311],[55.723694,26.964722],[54.715088,26.480713],[53.493103,26.8125],[52.483704,27.580872],[51.520874,27.865723],[50.853088,28.814514],[50.115112,30.147888],[49.576904,29.985718],[48.941284,30.317078],[48.568115,29.92688],[47.974487,29.975891],[48.183289,29.534485],[48.093872,29.306274],[48.416077,28.552124],[48.807678,27.689697],[49.299683,27.461304],[49.470886,27.110107],[50.152527,26.689697],[50.213074,26.2771],[50.113281,25.944092],[50.239929,25.608093],[50.527527,25.327881],[50.660706,24.999878],[50.81012,24.754883],[50.743896,25.482483],[51.013489,26.00708],[51.286499,26.114685],[51.589111,25.801086],[51.606689,25.215698],[51.389709,24.627502],[51.579529,24.245483],[51.757507,24.294128],[51.794495,24.019897],[52.577087,24.17749],[53.404114,24.151306],[54.008118,24.121887],[54.693115,24.797913],[55.439087,25.439087],[56.070923,26.055481],[56.362122,26.395874],[56.485718,26.309082],[56.391479,25.896118],[56.261108,25.714722],[56.396912,24.924683],[56.845276,24.241699],[57.403503,23.878723],[58.137085,23.747925],[58.729309,23.565674],[59.180481,22.992493],[59.450073,22.660278],[59.808105,22.533691],[59.806274,22.310486],[59.442322,21.714478],[59.282471,21.433899],[58.861084,21.114075],[58.488098,20.429077],[58.034302,20.481506],[57.826477,20.243103],[57.665894,19.736084],[57.788696,19.067688],[57.694519,18.944702],[57.234314,18.94812],[56.60968,18.57428],[56.512329,18.087097],[56.283508,17.876099],[55.661499,17.884277],[55.270081,17.632324],[55.274902,17.228271],[54.791077,16.950684],[54.239319,17.045105],[53.570496,16.707703],[53.108704,16.651123],[52.385315,16.382507],[52.191711,15.938477],[52.168274,15.597473],[51.172485,15.175293],[49.574707,14.708679],[48.679321,14.003296],[48.239075,13.94812],[47.938904,14.007324],[47.354492,13.592285],[46.717102,13.399719],[45.877686,13.3479],[45.625122,13.291077],[45.406494,13.026917],[45.144287,12.953918],[44.989685,12.699707],[44.49469,12.72168],[44.17511,12.585876],[43.483093,12.636902],[43.2229,13.220886],[43.251526,13.7677],[43.088074,14.062683],[42.892273,14.802307],[42.604919,15.213318],[42.805115,15.262085],[42.702515,15.718872],[42.82373,15.911682],[42.77948,16.3479],[42.649719,16.774719],[42.348083,17.075928],[42.270874,17.47467],[41.754517,17.83313],[41.221497,18.671692],[40.93927,19.486511],[40.247681,20.174683],[39.801697,20.338928],[39.139526,21.29187],[39.023682,21.986877],[39.066284,22.579712],[38.49292,23.688477],[38.023926,24.078674],[37.483704,24.285522],[37.154907,24.858521],[37.209473,25.084473],[36.931702,25.603088],[36.639709,25.826294],[36.249084,26.570129],[35.64032,27.376526],[35.13031,28.063477],[34.632324,28.058472],[34.787903,28.607483],[34.832275,28.95752],[34.956116,29.356689],[34.922729,29.501282],[34.641724,29.099487],[34.426697,28.344116],[34.15448,27.823303],[33.921509,27.648682],[33.588074,27.971497],[33.136902,28.417725],[32.423279,29.851074],[32.320496,29.760498],[32.734924,28.705322],[33.348877,27.69989],[34.104675,26.142273],[34.473877,25.598694],[34.795105,25.033875],[35.692505,23.926697],[35.493713,23.752502],[35.526123,23.102478],[36.690674,22.204895],[36.866272,22.000122],[37.188721,21.018921],[36.969482,20.837524],[37.114685,19.808105],[37.481873,18.614075],[37.862671,18.36792],[38.410095,17.998291],[38.990723,16.840698],[39.266113,15.922729],[39.81427,15.43573],[41.179321,14.491089],[41.734924,13.921082],[42.276917,13.344116],[42.589722,13.000488],[43.081299,12.699707],[43.317871,12.390076],[43.286499,11.974915],[42.715881,11.735718],[43.145325,11.462097],[43.470703,11.27771],[43.666687,10.864319],[44.11792,10.445679],[44.614319,10.442322],[45.556885,10.69812],[46.645508,10.816528],[47.525696,11.127319],[48.021729,11.193115],[48.378906,11.375488],[48.948303,11.410706],[49.267883,11.430481],[49.728699,11.578918],[50.258911,11.679688],[50.732117,12.021912],[51.111328,12.024719],[51.133911,11.748291],[51.041504,11.166504],[51.045288,10.64093],[50.83429,10.279724],[50.55249,9.19873],[50.070923,8.081726],[49.452698,6.804688],[48.594482,5.339111],[47.740906,4.219482],[46.56488,2.855286],[45.564087,2.045898],[44.068298,1.052917],[43.136108,.292297],[42.041687,-.919189],[41.811096,-1.446411],[41.585083,-1.683228],[40.884888,-2.08252],[40.637878,-2.499817],[40.263123,-2.57312],[40.121277,-3.27771],[39.80011,-3.681091],[39.604919,-4.346497],[39.202271,-4.676697],[38.740479,-5.908875],[38.799683,-6.475586],[39.440125,-6.840027],[39.470093,-7.099976],[39.194702,-7.703918],[39.252075,-8.007812],[39.186523,-8.485474],[39.535889,-9.112305],[39.949707,-10.098389],[40.316711,-10.317078],[40.478516,-10.765381],[40.437317,-11.761719],[40.560913,-12.639099],[40.59967,-14.201904],[40.775513,-14.691711],[40.477295,-15.406311],[40.089294,-16.100708],[39.452698,-16.720886],[38.53833,-17.101013],[37.411072,-17.586304],[36.281311,-18.659607],[35.896484,-18.842285],[35.198486,-19.552795],[34.786499,-19.783997],[34.701904,-20.497009],[35.176086,-21.254272],[35.373474,-21.84082],[35.385925,-22.140015],[35.562683,-22.090027],[35.533875,-23.070801],[35.371887,-23.535278],[35.607483,-23.706482],[35.458679,-24.12262],[35.04071,-24.478271],[34.215881,-24.816284],[33.013306,-25.357483],[32.574707,-25.727295],[32.660278,-26.148499],[32.916077,-26.215881],[32.830078,-26.742188],[32.580322,-27.470093],[32.46228,-28.301025],[32.203491,-28.75238],[31.521118,-29.257385],[31.325684,-29.401978],[30.901672,-29.909912],[30.622925,-30.423706],[30.055725,-31.140198],[28.925476,-32.171997],[28.219727,-32.771912],[27.464722,-33.22699],[26.419495,-33.614929],[25.909729,-33.666992],[25.780701,-33.94458],[25.172913,-33.796875],[24.677917,-33.987183],[23.594116,-33.794495],[22.988281,-33.916382],[22.57428,-33.864075],[21.542908,-34.258789],[20.689087,-34.417175],[20.071289,-34.795105],[19.616516,-34.819092],[19.193298,-34.462585],[18.855286,-34.444275],[18.424683,-33.997803],[18.377502,-34.136475],[18.244507,-33.867676],[18.250122,-33.281372],[17.925293,-32.611206],[18.247925,-32.429077],[18.22168,-31.661621],[17.566895,-30.725708],[17.064514,-29.878601],[17.062927,-29.875977],[16.345093,-28.576721],[15.601929,-27.821228],[15.21051,-27.090881],[14.989685,-26.11731],[14.743286,-25.392883],[14.408081,-23.853027],[14.385681,-22.656677],[14.25769,-22.111206],[13.868713,-21.698975],[13.352478,-20.872803],[12.826904,-19.673096],[12.608704,-19.045288],[11.794922,-18.069092],[11.734314,-17.30188],[11.640076,-16.673096],[11.778687,-15.793823],[12.123718,-14.878296],[12.17572,-14.449097],[12.500122,-13.547729],[12.738525,-13.137878],[13.312927,-12.483582],[13.633728,-12.038574],[13.738708,-11.297791],[13.686523,-10.731079],[13.387329,-10.373596],[13.121094,-9.766907],[12.875488,-9.16687],[12.929077,-8.959106],[13.236511,-8.562622],[12.933105,-7.596497],[12.728271,-6.927124],[12.227478,-6.294373],[12.32251,-6.100098],[12.182312,-5.789917],[11.9151,-5.037903],[11.093689,-3.978821],[10.066284,-2.969482],[9.405273,-2.144287],[8.798096,-1.111328],[8.830078,-.778992],[9.048523,-.45929],[9.291321,.268677],[9.49292,1.010071],[9.305725,1.160889],[9.649292,2.283875],[9.795288,3.073486],[9.40448,3.734497],[8.94812,3.904114],[8.744873,4.352295],[8.488892,4.495728],[8.500305,4.772095],[7.462097,4.412109],[7.082703,4.464722],[6.69812,4.240723],[5.898315,4.262512],[5.362915,4.888123],[5.033691,5.611877],[4.325684,6.270691],[3.57428,6.258301],[2.691711,6.258911],[1.865295,6.142273],[1.06012,5.928894],[-.507629,5.343506],[-1.063599,5.000488],[-1.964722,4.71051],[-2.856079,4.994507],[-3.311096,4.984314],[-4.008789,5.179871],[-4.649902,5.168274],[-5.834412,4.993713],[-6.528687,4.705078],[-7.518921,4.338318],[-7.712097,4.364685],[-7.974121,4.355896],[-9.004822,4.83252],[-9.913391,5.593689],[-10.765381,6.140686],[-11.438782,6.785889],[-11.708191,6.860107],[-12.428101,7.262878],[-12.948975,7.798706],[-13.124023,8.163879],[-13.246521,8.903076],[-13.685181,9.494873],[-14.073975,9.886292],[-14.330078,10.015686],[-14.579712,10.214478],[-14.693176,10.656311],[-14.839478,10.876709],[-15.13031,11.040527],[-15.664185,11.458496],[-16.085205,11.524719],[-16.314697,11.806519],[-16.308899,11.958679],[-16.61377,12.170898],[-16.677429,12.384888],[-16.841492,13.151489],[-16.713684,13.595093],[-17.126099,14.373474],[-17.625,14.729675],[-17.185181,14.919495],[-16.700684,15.621521],[-16.463013,16.135071],[-16.549683,16.673889],[-16.270508,17.167114],[-16.146301,18.108521],[-16.256897,19.09668],[-16.377625,19.593872],[-16.277771,20.092529],[-16.536316,20.567871],[-17.063416,20.999878],[-17.020386,21.422302],[-16.973206,21.885681],[-16.589111,22.158325],[-16.261902,22.679321],[-16.326416,23.017883],[-15.982605,23.723511],[-15.426025,24.359131],[-15.089294,24.520325],[-14.824585,25.103516],[-14.800903,25.636292],[-14.43988,26.254517],[-13.773804,26.618896],[-13.139893,27.640076],[-12.618774,28.03833],[-11.688904,28.148682],[-10.900879,28.832275],[-10.399597,29.098694],[-9.564819,29.933716],[-9.814697,31.177673],[-9.434814,32.038086],[-9.30072,32.564697],[-8.65741,33.240295],[-7.654175,33.697083],[-6.912476,34.110474],[-6.244324,35.145874],[-5.929993,35.760071],[-5.193787,35.75531],[-4.591003,35.330688],[-3.640076,35.399902],[-2.604309,35.179077],[-2.169922,35.168518],[-1.208618,35.714905],[-.12738,35.888672],[.503906,36.301331],[1.466919,36.605713],[3.161682,36.783875],[4.815674,36.865112],[5.320129,36.716492],[6.261902,37.110718],[7.330505,37.11853],[7.737122,36.885681],[8.421082,36.946472],[9.510071,37.350098],[10.210083,37.230103],[10.180725,36.724121],[11.028931,37.092102],[11.100098,36.900085],[10.600098,36.410095],[10.593323,35.94751],[10.939514,35.699097],[10.807922,34.833496],[10.149719,34.330688],[10.339722,33.785889],[10.856873,33.768677],[11.108521,33.293274],[11.488892,33.137085],[12.66333,32.792908],[13.083313,32.878906],[13.918701,32.712097],[15.245728,32.265076],[15.713928,31.376282],[16.611694,31.182312],[18.021118,30.763489],[19.086487,30.266479],[19.574097,30.525879],[20.053284,30.985901],[19.820312,31.751892],[20.134094,32.238281],[20.854492,32.706909],[21.543091,32.843323],[22.895874,32.638489],[23.236877,32.191528],[23.609131,32.187317],[23.92749,32.016724],[24.921082,31.899475],[25.164917,31.569275],[26.4953,31.585693],[27.457703,31.321289],[28.4505,31.025879],[28.913513,30.870117],[29.683472,31.18689],[30.095093,31.473511],[30.976929,31.555908],[31.68811,31.429688],[31.96051,30.933716],[32.192505,31.260315],[32.993896,31.024109],[33.773499,30.967529],[34.265503,31.219482],[34.556519,31.548889],[34.488098,31.60553],[34.752686,32.072876],[34.955505,32.827515],[35.098511,33.080688],[35.126099,33.090881],[35.4823,33.905518],[35.979675,34.610107],[35.998474,34.644897],[35.90509,35.410095],[36.149902,35.821472],[35.782104,36.275085],[36.160889,36.650696],[35.551086,36.565491],[34.714478,36.795471],[34.026917,36.220093],[32.509277,36.107483],[31.699707,36.644287],[30.621704,36.677917],[30.391113,36.263123],[29.700073,36.144287],[28.73291,36.67688],[27.641296,36.658875],[27.048889,37.653503],[26.318298,38.20813],[26.804688,38.985901],[26.170898,39.463684],[27.28009,40.420105],[28.820129,40.460083],[29.240112,41.220093],[31.145874,41.087708],[32.348083,41.736328],[33.513306,42.019104],[35.167725,42.040283],[36.913086,41.33551],[38.347717,40.94873],[39.512695,41.102905],[40.373474,41.013672],[41.554077,41.535706],[41.703308,41.963074],[41.453491,42.645081],[40.875488,43.013672],[40.321472,43.128723],[39.955078,43.43512],[38.680115,44.28009],[37.539124,44.657288],[36.675476,45.24469],[37.40332,45.40448],[38.233093,46.240906],[37.673706,46.636719],[39.147705,47.044678],[39.121277,47.263489],[38.223694,47.102295],[37.42511,47.022278],[36.759888,46.69873],[35.82373,46.645874],[34.96228,46.273315],[35.020874,45.651306],[35.510071,45.410095],[36.53009,45.470093],[36.334717,45.113281],[35.240112,44.940125],[33.882507,44.361511],[33.326477,44.56488],[33.546875,45.034912],[32.454285,45.327515],[32.63092,45.519287],[33.588074,45.851685],[33.298706,46.080688],[31.74408,46.333496],[31.675293,46.706299],[30.748901,46.58313],[30.377686,46.032471],[29.603271,45.293274],[29.626526,45.035522],[29.141724,44.820312],[28.837891,44.913879],[28.558105,43.70752],[28.039124,43.293274],[27.673889,42.577881],[27.996704,42.007507],[28.115479,41.622925],[28.988525,41.299927],[28.806519,41.054871],[27.61908,40.999878],[27.192505,40.690674],[26.358093,40.1521],[26.043274,40.617676],[26.056885,40.824097],[25.447693,40.852478],[24.925903,40.947083],[23.714905,40.687073],[24.408081,40.125122],[23.900085,39.962097],[23.343079,39.961121],[22.814087,40.476074],[22.626282,40.256531],[22.84967,39.659302],[23.350098,39.190125],[22.973083,38.970886],[23.53009,38.510071],[24.025085,38.220093],[24.0401,37.65509],[23.115112,37.920105],[23.410095,37.410095],[22.775085,37.305115],[23.154297,36.422485],[22.490112,36.410095],[21.670105,36.845093],[21.295105,37.645081],[21.120117,38.310303],[20.730103,38.770081],[20.217712,39.340271],[20.150085,39.625122],[19.980103,39.695129],[19.960083,39.9151],[19.406128,40.250916],[19.319092,40.727295],[19.403687,41.409485],[19.5401,41.720093],[19.371887,41.877686],[19.162476,41.955078],[18.88208,42.281494],[18.450073,42.480103],[17.509888,42.850098],[16.930115,43.210083],[16.015503,43.507324],[15.1745,44.243286],[15.376282,44.317871],[14.920288,44.738525],[14.901672,45.076111],[14.258728,45.233887],[13.952271,44.802124],[13.657104,45.137085],[13.679504,45.484131],[13.715088,45.500305],[13.937683,45.591125],[13.141724,45.736694],[12.328674,45.381897],[12.383911,44.885498],[12.261475,44.600525],[12.589294,44.091492],[13.526917,43.587708],[14.029907,42.761108],[15.1427,41.955078],[15.926331,41.961304],[16.169922,41.740295],[15.889282,41.541077],[16.785095,41.179688],[17.519287,40.877075],[18.376709,40.355713],[18.480286,40.168884],[18.293518,39.810913],[17.738525,40.27771],[16.86969,40.442322],[16.44873,39.795471],[17.171509,39.424683],[17.052917,38.902893],[16.635071,38.843689],[16.101074,37.985901],[15.684082,37.908875],[15.68811,38.214722],[15.89209,38.750916],[16.109314,38.964478],[15.718872,39.544128],[15.413696,40.048279],[14.998474,40.173096],[14.703308,40.604675],[14.06073,40.786499],[13.628113,41.188293],[12.888123,41.253113],[12.106689,41.704529],[11.191895,42.35553],[10.512085,42.931519],[10.200073,43.920105],[9.702515,44.036316],[8.888916,44.366272],[8.428711,44.231323],[7.850891,43.767273],[7.435303,43.693909],[6.529297,43.128906],[4.556885,43.399719],[3.100525,43.075317],[2.986084,42.473083],[3.03949,41.89209],[2.091919,41.226074],[.810486,41.014709],[.721313,40.678284],[.106689,40.124084],[-.278687,39.31012],[.111328,38.738525],[-.467102,38.29248],[-.683411,37.642273],[-1.438293,37.443115],[-2.146423,36.674072],[-3.41571,36.658875],[-4.368896,36.677917],[-4.995178,36.324707],[-5.377075,35.946899],[-5.866394,36.029907],[-6.236694,36.367676],[-6.520203,36.942871],[-7.453674,37.0979],[-7.855591,36.838318],[-8.382812,36.978882],[-8.898804,36.868896],[-8.746094,37.651489],[-8.840027,38.266296],[-9.287476,38.358521],[-9.526489,38.737488],[-9.446899,39.39209],[-9.048279,39.755127],[-8.977295,40.159302],[-8.768677,40.760681],[-8.790771,41.184326],[-8.990784,41.543518],[-9.03479,41.880676],[-8.984375,42.592896],[-9.392883,43.026672],[-7.97821,43.748474],[-6.754517,43.567871],[-5.411804,43.57428],[-4.347778,43.403503],[-3.517517,43.455872],[-1.901306,43.422913],[-1.384216,44.022705],[-1.193787,46.014893],[-2.225708,47.064514],[-2.963196,47.570312],[-4.491577,47.955078],[-4.592285,48.684082],[-3.295776,48.901672],[-1.616516,48.64447],[-1.933411,49.776489],[-.98938,49.347473],[1.338684,50.127319],[1.639099,50.946716],[2.513489,51.148499],[3.315125,51.345886],[3.830322,51.620483],[4.706116,53.091919],[6.07428,53.510498],[6.905273,53.4823],[7.100525,53.693909],[7.936279,53.748291],[8.121704,53.527893],[8.80072,54.020874],[8.572083,54.395691],[8.526306,54.962891],[8.1203,55.5177],[8.090088,56.5401],[8.256714,56.81012],[8.543518,57.110107],[9.4245,57.172119],[9.775696,57.447876],[10.580078,57.730103],[10.546082,57.215881],[10.250122,56.890076],[10.370117,56.610107],[10.912292,56.458679],[10.667908,56.081482],[10.370117,56.190125],[9.650085,55.470093],[9.921875,54.983093],[9.939697,54.59668],[10.950073,54.363708],[10.939514,54.008728],[11.956299,54.196472],[12.518494,54.47052],[13.647522,54.0755],[14.11969,53.75708],[14.802917,54.05072],[16.363525,54.513306],[17.622925,54.851685],[18.620911,54.682678],[18.696289,54.438721],[19.660706,54.426086],[19.888489,54.866089],[21.268494,55.190491],[21.055908,56.031128],[21.090515,56.783875],[21.581909,57.411926],[22.524475,57.753479],[23.318481,57.006287],[24.120728,57.025696],[24.312927,57.793518],[24.429077,58.383484],[24.061279,58.257507],[23.426697,58.612671],[23.339905,59.187317],[24.604309,59.465881],[25.864319,59.611084],[26.94928,59.445923],[27.981079,59.475525],[29.117676,60.028076],[28.070129,60.503479],[26.25531,60.423889],[24.496704,60.057312],[22.86969,59.846497],[22.290894,60.391907],[21.322327,60.720276],[21.544922,61.705322],[21.059326,62.607483],[21.536072,63.18988],[22.442688,63.817871],[24.73053,64.902283],[25.398071,65.111511],[25.294128,65.534485],[23.903503,66.006897],[22.183289,65.723877],[21.213501,65.026123],[21.36969,64.413696],[19.778931,63.60968],[17.8479,62.749512],[17.11969,61.341309],[17.831482,60.636719],[18.78772,60.081909],[17.869324,58.953918],[16.829285,58.71991],[16.447693,57.041077],[15.879883,56.104309],[14.666687,56.200928],[14.100708,55.407898],[12.942871,55.361877],[12.625122,56.307129],[11.788086,57.441895],[11.027283,58.856079],[10.356689,59.46991],[8.38208,58.313293],[7.048889,58.078918],[5.665894,58.588074],[5.308289,59.66333],[4.992126,61.97113],[5.912903,62.614502],[8.553528,63.454102],[10.52771,64.486084],[12.358276,65.8797],[14.761292,67.81073],[16.435913,68.563293],[19.184082,69.817505],[21.378479,70.25531],[23.023682,70.202087],[24.546692,71.030518],[26.370117,70.986328],[28.165527,71.185486],[31.293518,70.453918],[30.005493,70.186279],[31.101074,69.558105],[32.13269,69.905884],[33.775513,69.301514],[36.514099,69.063477],[40.29248,67.932495],[41.059875,67.457275],[41.126099,66.791687],[40.01593,66.266296],[38.382874,65.999512],[33.918701,66.759705],[33.184509,66.632507],[34.81488,65.900085],[34.943909,64.41449],[36.231323,64.109497],[37.012878,63.849915],[37.14209,64.334717],[36.5177,64.780273],[37.176086,65.143311],[39.593506,64.520874],[40.43573,64.764526],[39.762695,65.496887],[42.093079,66.476318],[43.016113,66.418701],[43.94989,66.069092],[44.532288,66.756287],[43.698486,67.352478],[44.187927,67.9505],[43.452881,68.570923],[46.250122,68.250122],[46.821289,67.68988],[45.555298,67.566528],[45.562073,67.010071],[46.349121,66.667725],[47.894287,66.884521],[48.138672,67.522522],[50.227722,67.998718],[53.717529,68.857483],[54.47168,68.808289],[53.485901,68.201294],[54.726318,68.097107],[55.442688,68.438721],[57.317078,68.466309],[58.802124,68.88092],[59.941528,68.278503],[61.077881,68.940674],[60.03009,69.520081],[60.55011,69.850098],[63.504089,69.547485],[64.888123,69.234924],[68.512085,68.092285],[69.180725,68.615723],[68.16449,69.144287],[68.135315,69.356506],[66.930115,69.454712],[67.259888,69.928711],[66.724915,70.708923],[66.694702,71.029114],[68.5401,71.934509],[69.196289,72.843506],[69.940125,73.0401],[72.587524,72.776306],[72.796082,72.220093],[71.848083,71.409119],[72.470093,71.090271],[72.79187,70.391113],[72.564697,69.020874],[73.667908,68.407898],[73.238708,67.740479],[71.28009,66.320129],[72.423096,66.172729],[72.820679,66.532715],[73.921082,66.78949],[74.186523,67.284302],[75.052124,67.760498],[74.469299,68.329102],[74.935913,68.989319],[73.842285,69.071472],[73.601929,69.627686],[74.399902,70.631897],[73.101074,71.447083],[74.89093,72.121277],[74.659302,72.832275],[75.158081,72.855103],[75.683472,72.300476],[75.289124,71.335693],[76.359131,71.152893],[75.903076,71.874084],[77.576721,72.267273],[79.6521,72.320129],[81.500122,71.750122],[80.610718,72.582886],[80.511108,73.648315],[82.250122,73.850098],[84.655273,73.805908],[86.822327,73.93689],[86.009705,74.459717],[87.16687,75.116516],[88.315674,75.143921],[90.260071,75.640076],[92.900696,75.773315],[93.234314,76.047302],[95.860107,76.140076],[96.678284,75.915527],[98.922485,76.446899],[100.759705,76.430298],[101.035278,76.861877],[101.990906,77.287476],[104.351685,77.697876],[106.066711,77.373901],[104.705078,77.127502],[106.970276,76.974304]],[[49.110291,41.282288],[49.618896,40.572876],[50.0849,40.526306],[50.392883,40.256531],[49.569275,40.176086],[49.395325,39.399475],[49.223328,39.049316],[48.856506,38.815491],[48.883301,38.320313],[49.199707,37.582886],[50.147888,37.374695],[50.842285,36.872925],[52.264099,36.7005],[53.825928,36.965088],[53.921692,37.198914],[53.735474,37.906128],[53.88092,38.952087],[53.101074,39.29071],[53.35791,39.975281],[52.694092,40.033691],[52.915283,40.876526],[53.858276,40.631104],[54.736877,40.951111],[54.008301,41.551331],[53.72168,42.123291],[52.916687,41.868103],[52.814697,41.135498],[52.502502,41.783325],[52.446289,42.027283],[52.692078,42.443909],[52.501526,42.792297],[51.342529,43.133118],[50.891296,44.031128],[50.339111,44.284119],[50.305725,44.609924],[51.278503,44.514893],[51.316895,45.246094],[52.16748,45.408508],[53.040894,45.259094],[53.220886,46.23468],[53.042725,46.853088],[52.042114,46.804687],[51.192078,47.048706],[50.034119,46.609131],[49.101318,46.399475],[48.645508,45.806274],[47.675903,45.641479],[46.682129,44.609314],[47.590881,43.660278],[47.492493,42.986694],[48.584473,41.808899],[49.110291,41.282288]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1.5},bbox:[-96.436304,77.491343,-93.720656,77.834629],geometry:{type:"Polygon",coordinates:[[[-93.840003,77.519997],[-94.295608,77.491343],[-96.169654,77.555111],[-96.436304,77.834629],[-94.422577,77.820005],[-93.720656,77.634331],[-93.840003,77.519997]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[-113.534279,77.409229,-109.854452,78.152956],geometry:{type:"Polygon",coordinates:[[[-110.186938,77.697015],[-112.051191,77.409229],[-113.534279,77.732207],[-112.724587,78.05105],[-111.264443,78.152956],[-109.854452,77.996325],[-110.186938,77.697015]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[20.72601,77.44493,24.72412,78.45494],geometry:{type:"Polygon",coordinates:[[[24.72412,77.85385],[22.49032,77.44493],[20.72601,77.67704],[21.41611,77.93504],[20.8119,78.25463],[22.88426,78.45494],[23.28134,78.07954],[24.72412,77.85385]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1.5},bbox:[-112.542091,78.40692,-109.663146,78.849994],geometry:{type:"Polygon",coordinates:[[[-109.663146,78.601973],[-110.881314,78.40692],[-112.542091,78.407902],[-112.525891,78.550555],[-111.50001,78.849994],[-110.963661,78.804441],[-109.663146,78.601973]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[-98.631984,77.850597,-95.559278,78.87193],geometry:{type:"Polygon",coordinates:[[[-95.830295,78.056941],[-97.309843,77.850597],[-98.124289,78.082857],[-98.552868,78.458105],[-98.631984,78.87193],[-97.337231,78.831984],[-96.754399,78.765813],[-95.559278,78.418315],[-95.830295,78.056941]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:.5},bbox:[-105.492289,77.907545,-99.670939,79.301594],geometry:{type:"Polygon",coordinates:[[[-100.060192,78.324754],[-99.670939,77.907545],[-101.30394,78.018985],[-102.949809,78.343229],[-105.176133,78.380332],[-104.210429,78.67742],[-105.41958,78.918336],[-105.492289,79.301594],[-103.529282,79.165349],[-100.825158,78.800462],[-100.060192,78.324754]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:.5},bbox:[99.43814,77.921,105.37243,79.34641],geometry:{type:"Polygon",coordinates:[[[105.07547,78.30689],[99.43814,77.921],[101.2649,79.23399],[102.08635,79.34641],[102.837815,79.28129],[105.37243,78.71334],[105.07547,78.30689]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[10.44453,76.77045,21.54383,80.05086],geometry:{type:"Polygon",coordinates:[[[18.25183,79.70175],[21.54383,78.95611],[19.02737,78.5626],[18.47172,77.82669],[17.59441,77.63796],[17.1182,76.80941],[15.91315,76.77045],[13.76259,77.38035],[14.66956,77.73565],[13.1706,78.02493],[11.22231,78.8693],[10.44453,79.65239],[13.17077,80.01046],[13.71852,79.66039],[15.14282,79.67431],[15.52255,80.01608],[16.99085,80.05086],[18.25183,79.70175]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[17.368015,79.400012,27.407506,80.657144],geometry:{type:"Polygon",coordinates:[[[25.447625,80.40734],[27.407506,80.056406],[25.924651,79.517834],[23.024466,79.400012],[20.075188,79.566823],[19.897266,79.842362],[18.462264,79.85988],[17.368015,80.318896],[20.455992,80.598156],[21.907945,80.357679],[22.919253,80.657144],[25.447625,80.40734]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:1,min_zoom:1},bbox:[44.846958,80.010181,51.522933,80.918885],geometry:{type:"Polygon",coordinates:[[[51.136187,80.54728],[49.793685,80.415428],[48.894411,80.339567],[48.754937,80.175468],[47.586119,80.010181],[46.502826,80.247247],[47.072455,80.559424],[44.846958,80.58981],[46.799139,80.771918],[48.318477,80.78401],[48.522806,80.514569],[49.09719,80.753986],[50.039768,80.918885],[51.522933,80.699726],[51.136187,80.54728]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[91.18107,78.7562,100.186655,81.2504],geometry:{type:"Polygon",coordinates:[[[99.93976,78.88094],[97.75794,78.7562],[94.97259,79.044745],[93.31288,79.4265],[92.5454,80.14379],[91.18107,80.34146],[93.77766,81.0246],[95.940895,81.2504],[97.88385,80.746975],[100.186655,79.780135],[99.93976,78.88094]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[-96.70972,78.21533,-85.81435,81.25739],geometry:{type:"Polygon",coordinates:[[[-87.02,79.66],[-85.81435,79.3369],[-87.18756,79.0393],[-89.03535,78.28723],[-90.80436,78.21533],[-92.87669,78.34333],[-93.95116,78.75099],[-93.93574,79.11373],[-93.14524,79.3801],[-94.974,79.37248],[-96.07614,79.70502],[-96.70972,80.15777],[-96.01644,80.60233],[-95.32345,80.90729],[-94.29843,80.97727],[-94.73542,81.20646],[-92.40984,81.25739],[-91.13289,80.72345],[-89.45,80.509322],[-87.81,80.32],[-87.02,79.66]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[-91.58702,76.17812,-61.85,83.23324],geometry:{type:"Polygon",coordinates:[[[-68.5,83.106322],[-65.82735,83.02801],[-63.68,82.9],[-61.85,82.6286],[-61.89388,82.36165],[-64.334,81.92775],[-66.75342,81.72527],[-67.65755,81.50141],[-65.48031,81.50657],[-67.84,80.9],[-69.4697,80.61683],[-71.18,79.8],[-73.2428,79.63415],[-73.88,79.430162],[-76.90773,79.32309],[-75.52924,79.19766],[-76.22046,79.01907],[-75.39345,78.52581],[-76.34354,78.18296],[-77.88851,77.89991],[-78.36269,77.50859],[-79.75951,77.20968],[-79.61965,76.98336],[-77.91089,77.022045],[-77.88911,76.777955],[-80.56125,76.17812],[-83.17439,76.45403],[-86.11184,76.29901],[-87.6,76.42],[-89.49068,76.47239],[-89.6161,76.95213],[-87.76739,77.17833],[-88.26,77.9],[-87.65,77.970222],[-84.97634,77.53873],[-86.34,78.18],[-87.96192,78.37181],[-87.15198,78.75867],[-85.37868,78.9969],[-85.09495,79.34543],[-86.50734,79.73624],[-86.93179,80.25145],[-84.19844,80.20836],[-83.408696,80.1],[-81.84823,80.46442],[-84.1,80.58],[-87.59895,80.51627],[-89.36663,80.85569],[-90.2,81.26],[-91.36786,81.5531],[-91.58702,81.89429],[-90.1,82.085],[-88.93227,82.11751],[-86.97024,82.27961],[-85.5,82.652273],[-84.260005,82.6],[-83.18,82.32],[-82.42,82.86],[-81.1,83.02],[-79.30664,83.13056],[-76.25,83.172059],[-75.71878,83.06404],[-72.83153,83.23324],[-70.665765,83.169781],[-68.5,83.106322]]]}},{type:"Feature",properties:{featurecla:"Land",scalerank:0,min_zoom:0},bbox:[-73.297,60.03676,-12.20855,83.64513],geometry:{type:"Polygon",coordinates:[[[-27.10046,83.51966],[-20.84539,82.72669],[-22.69182,82.34165],[-26.51753,82.29765],[-31.9,82.2],[-31.39646,82.02154],[-27.85666,82.13178],[-24.84448,81.78697],[-22.90328,82.09317],[-22.07175,81.73449],[-23.16961,81.15271],[-20.62363,81.52462],[-15.76818,81.91245],[-12.77018,81.71885],[-12.20855,81.29154],[-16.28533,80.58004],[-16.85,80.35],[-20.04624,80.17708],[-17.73035,80.12912],[-18.9,79.4],[-19.70499,78.75128],[-19.67353,77.63859],[-18.47285,76.98565],[-20.03503,76.94434],[-21.67944,76.62795],[-19.83407,76.09808],[-19.59896,75.24838],[-20.66818,75.15585],[-19.37281,74.29561],[-21.59422,74.22382],[-20.43454,73.81713],[-20.76234,73.46436],[-22.17221,73.30955],[-23.56593,73.30663],[-22.31311,72.62928],[-22.29954,72.18409],[-24.27834,72.59788],[-24.79296,72.3302],[-23.44296,72.08016],[-22.13281,71.46898],[-21.75356,70.66369],[-23.53603,70.471],[-24.30702,70.85649],[-25.54341,71.43094],[-25.20135,70.75226],[-26.36276,70.22646],[-23.72742,70.18401],[-22.34902,70.12946],[-25.02927,69.2588],[-27.74737,68.47046],[-30.67371,68.12503],[-31.77665,68.12078],[-32.81105,67.73547],[-34.20196,66.67974],[-36.35284,65.9789],[-37.04378,65.93768],[-38.37505,65.69213],[-39.81222,65.45848],[-40.66899,64.83997],[-40.68281,64.13902],[-41.1887,63.48246],[-42.81938,62.68233],[-42.41666,61.90093],[-42.86619,61.07404],[-43.3784,60.09772],[-44.7875,60.03676],[-46.26364,60.85328],[-48.26294,60.85843],[-49.23308,61.40681],[-49.90039,62.38336],[-51.63325,63.62691],[-52.14014,64.27842],[-52.27659,65.1767],[-53.66166,66.09957],[-53.30161,66.8365],[-53.96911,67.18899],[-52.9804,68.35759],[-51.47536,68.72958],[-51.08041,69.14781],[-50.87122,69.9291],[-52.013585,69.574925],[-52.55792,69.42616],[-53.45629,69.283625],[-54.68336,69.61003],[-54.75001,70.28932],[-54.35884,70.821315],[-53.431315,70.835755],[-51.39014,70.56978],[-53.10937,71.20485],[-54.00422,71.54719],[-55,71.406537],[-55.83468,71.65444],[-54.71819,72.58625],[-55.32634,72.95861],[-56.12003,73.64977],[-57.32363,74.71026],[-58.59679,75.09861],[-58.58516,75.51727],[-61.26861,76.10238],[-63.39165,76.1752],[-66.06427,76.13486],[-68.50438,76.06141],[-69.66485,76.37975],[-71.40257,77.00857],[-68.77671,77.32312],[-66.76397,77.37595],[-71.04293,77.63595],[-73.297,78.04419],[-73.15938,78.43271],[-69.37345,78.91388],[-65.7107,79.39436],[-65.3239,79.75814],[-68.02298,80.11721],[-67.15129,80.51582],[-63.68925,81.21396],[-62.23444,81.3211],[-62.65116,81.77042],[-60.28249,82.03363],[-57.20744,82.19074],[-54.13442,82.19962],[-53.04328,81.88833],[-50.39061,82.43883],[-48.00386,82.06481],[-46.59984,81.985945],[-44.523,81.6607],[-46.9007,82.19979],[-46.76379,82.62796],[-43.40644,83.22516],[-39.89753,83.18018],[-38.62214,83.54905],[-35.08787,83.64513],[-27.10046,83.51966]]]}}],bbox:[-180,-90,180,83.64513]};function Ai(i,e){return(i%e+e)%e}function Nm(i,e,t,n){return i+(Ai(e-i+n/2,n)-n/2)*t}function dc(i){let e=(i/864e5+24405875e-1-2451545)/36525,t=-62e-7*e**3+.093104*e**2+(876600*3600+8640184812866e-6)*e+67310.54841;return Ai(t*Math.PI/180/240,Math.PI*2)}function To(i,e){let t=0,n=i.length-1;for(;n-t>1;){let h=t+n>>1;Date.parse(i[h].time)<=e?t=h:n=h}let s=i[t],r=i[n],a=Date.parse(s.time),o=Date.parse(r.time),l=Math.max(0,Math.min(1,(e-a)/(o-a))),c={};for(let h of["x","y","z","latitude_deg","altitude_km","speed_km_s"])c[h]=s[h]+(r[h]-s[h])*l;return c.longitude_deg=Ai(Nm(s.longitude_deg,r.longitude_deg,l,360)+180,360)-180,c.gmst_rad=dc(a+(o-a)*l),c}var fi=8,fc=["#66ccff","#ff8066","#9be564","#d69cff","#ffd166","#72e0c1","#f28cb1","#b8c0ff"],Xu=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];function zn(i){return Xu[Math.floor(Ai(i,360)/22.5+.5)%Xu.length]}function Vn(i){return/\b403\b/.test(i)?"CelesTrak is limiting downloads of this data for now. Try again later.":/Failed to fetch|NetworkError|Load failed/.test(i)?"The Khonsu server could not be reached.":i}function qu(i){let e=(t,n)=>{try{return t(i())}catch{return n}};return{getItem:t=>e(n=>n.getItem(t),null),setItem:(t,n)=>e(s=>s.setItem(t,n)),removeItem:t=>e(n=>n.removeItem(t))}}function pc(i){return/^\d{1,9}$/.test(i)&&Number(i)>=1}function di(i){return String(i).replace(/^0+(?=\d)/,"")}function Yu(i){let e=new URLSearchParams(i),t=new Set,n=[];for(let r of(e.get("sats")||"").split(",")){let a=di(r.trim());pc(a)&&!t.has(a)&&n.length<fi&&(t.add(a),n.push(a))}let s=di(e.get("selected")||"");return{ids:n,selected:t.has(s)?s:n[0]??null}}function $u(i,e){if(!i.length)return"";let t=new URLSearchParams;return t.set("sats",i.join(",")),e&&e!==i[0]&&t.set("selected",e),`?${t.toString().replaceAll("%2C",",")}`}function Zu(i){return fc.find(e=>!i.includes(e))??fc[i.length%fc.length]}function mc({lat:i,lon:e,alt:t}){let n=Number(i),s=Number(e),r=t===""||t===void 0||t===null?0:Number(t);return String(i).trim()===""||!Number.isFinite(n)||n<-90||n>90?{error:"Latitude must be between -90 and 90 degrees."}:String(e).trim()===""||!Number.isFinite(s)||s<-180||s>180?{error:"Longitude must be between -180 and 180 degrees."}:!Number.isFinite(r)||r<-1||r>100?{error:"Altitude must be between -1 and 100 km."}:{observer:{lat:n,lon:s,alt:r}}}function Ju(i){for(let e of["observer","utc"]){let t=i.getItem(`tlego.${e}`);t!==null&&(i.getItem(`khonsu.${e}`)===null&&i.setItem(`khonsu.${e}`,t),i.removeItem(`tlego.${e}`))}}function Ku(i){try{let e=JSON.parse(i.getItem("khonsu.observer"));return typeof e?.lat!="number"||typeof e?.lon!="number"?null:mc(e).observer??null}catch{return null}}function ju(i,e){let t=e.trim().toLowerCase();return t?i.filter(n=>n.name.toLowerCase().includes(t)||n.norad_id.includes(t)):i}function gc(i,e){if(!i.length||i[0].elevation_deg===void 0)return null;let t=0,n=i.length-1;for(;n-t>1;){let c=t+n>>1;Date.parse(i[c].time)<=e?t=c:n=c}let s=i[t],r=i[n],a=Date.parse(r.time)-Date.parse(s.time),o=a>0?Math.max(0,Math.min(1,(e-Date.parse(s.time))/a)):0;return{azimuth:Ai(s.azimuth_deg+(Ai(r.azimuth_deg-s.azimuth_deg+180,360)-180)*o,360),elevation:s.elevation_deg+(r.elevation_deg-s.elevation_deg)*o}}function Qu(i,e){let t=i[0]?.sunlit??!0;for(let n of i){if(Date.parse(n.time)>e)break;t=n.sunlit}return t}function ed(i,e,t){let n=t*3e4,s=i.length,r=-1;return i.forEach((a,o)=>{let l=Date.parse(a.time);l>=e-n&&l<=e+n&&(s=Math.min(s,o),r=o)}),r<s?{first:0,count:i.length}:{first:s,count:r-s+1}}function td(i,e,t){return Math.min(t,Math.max(e,i))}function nd(i,e){return i.map(t=>({...t,visible:e.find(n=>Date.parse(n.start.at)<=Date.parse(t.end)&&Date.parse(n.end.at)>=Date.parse(t.start))??null}))}function id(i){let e=Math.max(0,Math.round(i/1e3)),t=Math.floor(e/3600),n=Math.floor(e%3600/60);return t>=48?`${Math.round(t/24)} days`:t>0?`${t} h ${n} min`:n>0?`${n} min ${e%60} s`:`${e} s`}function _c(i,e){let t=i-e;if(t<=0)return"now";if(t<6e4)return"in under a minute";let n=Math.round(t/6e4);return n<60?`in ${n} min`:`in ${Math.floor(n/60)} h ${n%60} min`}function Ao(i,e){return Date.parse(i.start)<=Date.parse(e.end)&&Date.parse(i.end)>=Date.parse(e.start)}function xc(i,e,t){let n=Math.abs(i).toFixed(1);return`${n}\xB0 ${i>=0||Number(n)===0?e:t}`}function ys(i,e){return new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1,timeZone:e?"UTC":void 0}).format(i)}function vs(i,e){return new Intl.DateTimeFormat("en-GB",{weekday:"short",day:"numeric",month:"short",timeZone:e?"UTC":void 0}).format(i)}function sd(i){return i>=5?"Geomagnetic storm":i>=4?"Active":"Quiet"}function rd(i){return!Number.isFinite(i)||i<=0?null:i>=1e9?`${(i/1e9).toFixed(3)} GHz`:`${(i/1e6).toFixed(3)} MHz`}function ad(i){if(!i.length)return null;let e=i.reduce((n,s)=>s.kp_max>n.kp_max?s:n),t=i.reduce((n,s)=>n+s.f107,0)/i.length;return{strongest:e,meanFlux:t}}function od(i){let e=i.slice(0,24);if(!e.length)return null;let t=e.reduce((n,s)=>s.percent<n.percent?s:n);return{now:e[0].percent,clearest:t}}function yc(i,e){let t=Math.max(0,Math.round((e-new Date(i).getTime())/6e4));if(t<1)return"just now";if(t<60)return`${t} min ago`;let n=Math.round(t/60);return n<48?`${n} h ago`:`${Math.round(n/24)} days ago`}function vc(i){return i?"UTC":"local"}function ld(i,e){return(e-Date.parse(i))/864e5}function bc(i,e,t){return`${Math.abs(i).toFixed(3)}\xB0 ${i>=0?e:t}`}var Um=36e5,Fm=25*36e5;function Sc(i){let e=Math.floor((i-Um)/1e3)*1e3;return{start:e,end:e+Fm}}function Mc(i,e){return e<i.start||e>i.end-2*36e5}var wc=6378.137,Ec=i=>new U(i.x/wc,i.z/wc,-i.y/wc);function Co(i,e,t=1.002){let n=e*Math.PI/180,s=i*Math.PI/180;return new U(t*Math.cos(s)*Math.cos(n),t*Math.sin(s),-t*Math.cos(s)*Math.sin(n))}function cd(i,e,t){let n=[];for(let r of i)for(let a=0;a<r.length-1;a+=1)n.push(r[a].x,r[a].y,r[a].z,r[a+1].x,r[a+1].y,r[a+1].z);let s=new At;return s.setAttribute("position",new xt(n,3)),new zs(s,new ei({color:e,transparent:!0,opacity:t}))}function Om(){let i=new Dn;i.add(new Ct(new Bn(1,96,64),new as({color:1195868,specular:2381422,shininess:14})));let e=[];for(let n=-60;n<=60;n+=30){let s=[];for(let r=-180;r<=180;r+=3)s.push(Co(n,r));e.push(s)}for(let n=0;n<360;n+=30){let s=[];for(let r=-90;r<=90;r+=3)s.push(Co(r,n));e.push(s)}i.add(cd(e,7910597,.1));let t=[];for(let n of Wu.features){let s=n.geometry.type==="Polygon"?[n.geometry.coordinates]:n.geometry.coordinates;for(let r of s)for(let a of r)t.push(a.map(([o,l])=>Co(l,o)))}return i.add(cd(t,14278378,.8)),i}function Bm(){let i=[],e=7,t=()=>(e=e*16807%2147483647,e/2147483647);for(let s=0;s<1600;s+=1){let r=t()*2-1,a=t()*Math.PI*2,o=Math.sqrt(1-r*r)*400;i.push(o*Math.cos(a),o*Math.sin(a),r*400)}let n=new At;return n.setAttribute("position",new xt(i,3)),new Vs(n,new ss({color:11452364,size:1.1,sizeAttenuation:!1,transparent:!0,opacity:.6}))}function hd(i,{onPick:e,onSelect:t}){let n=new Os,s=new Bt(40,1,.01,2e3),r=new bo({antialias:!0,alpha:!0});r.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),i.append(r.domElement);let a=r.domElement;a.setAttribute("role","img"),a.setAttribute("aria-label","Earth with the tracked satellites. Drag to rotate and scroll to zoom. The readouts beside the globe give the same information as text.");let o=new Eo(s,a);o.enableDamping=!0,o.enablePan=!1,o.minDistance=1.2,o.maxDistance=60,n.add(Bm());let l=Om();n.add(l);let c=new Ct(new Bn(1.025,64,48),new On({color:4892888,transparent:!0,opacity:.09,side:Lt}));n.add(c),n.add(new Js(12111840,.55));let h=new Zs(16774368,2.6);h.position.set(4,3,5),n.add(h);let f=new Ct(new Bn(.012,12,10),new On({color:16777215}));f.visible=!1,l.add(f);let u=new At;u.setAttribute("position",new Ht(new Float32Array(6),3));let p=new Si(u,new ei({color:16777215,transparent:!0,opacity:.55}));p.visible=!1,p.frustumCulled=!1,n.add(p);let _=new Map,b=null,g=!1,d=!1,T=0,I=new qs,v=null,M=0;function w(){v&&(l.remove(v),v.material.map?.dispose(),v.material.dispose(),v.geometry.dispose(),v=null)}function C(F,ne=!1){let ae=++M;return F?new Promise((Be,De)=>{I.load(F,Fe=>{if(ae!==M){Fe.dispose(),Be();return}Fe.colorSpace=Gt,w(),v=new Ct(new Bn(1.001,96,64),new as({map:Fe,transparent:ne,specular:1118481,shininess:6})),l.add(v),Be()},void 0,()=>De(new Error("The image could not be loaded.")))}):(w(),Promise.resolve())}function y(F=b){let ne=_.get(F),ae=ne?ne.marker.position.clone():new U(.68,.42,.76);ae.lengthSq()<1e-6&&ae.set(.68,.42,.76);let Be=Math.max(3.6,Math.min(o.maxDistance,ae.length()*2.6));s.position.copy(ae.normalize().add(new U(0,.35,0)).normalize().multiplyScalar(Be)),o.target.set(0,0,0),o.update()}function E(F,ne,ae){D(F);let Be=new Float32Array(ne.samples.length*3);ne.samples.forEach((xe,Pe)=>{let ye=Ec(xe);Be.set([ye.x,ye.y,ye.z],Pe*3)});let De=new At;De.setAttribute("position",new Ht(Be,3));let Fe=new Si(De,new ei({color:ae,transparent:!0,opacity:.4}));Fe.frustumCulled=!1;let q=new Ct(new Bn(.014,16,12),new On({color:ae}));n.add(Fe,q),_.set(F,{line:Fe,marker:q,track:ne});let j=Ec(ne.sun_km);h.position.copy(j.normalize().multiplyScalar(10)),V(T)}function D(F){let ne=_.get(F);ne&&(n.remove(ne.line,ne.marker),ne.line.geometry.dispose(),ne.line.material.dispose(),ne.marker.geometry.dispose(),ne.marker.material.dispose(),_.delete(F))}function O(){for(let[F,ne]of _){let ae=F===b;ne.line.material.opacity=ae?.95:.3,ne.marker.scale.setScalar(ae?1.5:1)}}function V(F){T=F,l.rotation.y=dc(F);for(let ne of _.values()){let{samples:ae}=ne.track;if(ne.marker.position.copy(Ec(To(ae,F))),ne.rangeAt===void 0||Math.abs(F-ne.rangeAt)>15e3){let Be=ed(ae,F,ne.track.period_minutes);ne.line.geometry.setDrawRange(Be.first,Be.count),ne.rangeAt=F}}if(g&&_.has(b)){let ne=_.get(b).marker.position,ae=Math.max(s.position.length(),ne.length()*1.3);s.position.copy(ne.clone().normalize().multiplyScalar(ae))}O()}function X(F){f.visible=!!F,F&&f.position.copy(Co(F.lat,F.lon,1.003))}function N(F){let ne=_.get(b);if(p.visible=!!(F&&ne&&f.visible),!p.visible)return;l.updateMatrixWorld();let ae=f.getWorldPosition(new U);u.attributes.position.setXYZ(0,ae.x,ae.y,ae.z),u.attributes.position.setXYZ(1,ne.marker.position.x,ne.marker.position.y,ne.marker.position.z),u.attributes.position.needsUpdate=!0}function H(F){let ne=a.getBoundingClientRect(),ae=F.clone().project(s);return ae.z>1?null:{x:(ae.x+1)/2*ne.width,y:(1-ae.y)/2*ne.height}}function K(F){let ne=F.clone().sub(s.position),ae=ne.length(),Be=ne.normalize(),De=s.position.dot(Be),Fe=De*De-s.position.lengthSq()+1;if(Fe<0)return!1;let q=-De-Math.sqrt(Fe);return q>0&&q<ae}function Z(){let F=_.get(b);return!F||K(F.marker.position)?null:H(F.marker.position)}function re(F){let ne=a.getBoundingClientRect(),ae=new Ue((F.clientX-ne.left)/ne.width*2-1,1-(F.clientY-ne.top)/ne.height*2),Be=new Ks;Be.setFromCamera(ae,s);let{origin:De,direction:Fe}=Be.ray,q=De.dot(Fe),j=q*q-De.lengthSq()+1;if(j<0)return null;let xe=De.clone().add(Fe.clone().multiplyScalar(-q-Math.sqrt(j))),Pe=l.worldToLocal(xe),ye=Math.asin(Math.max(-1,Math.min(1,Pe.y/Pe.length())))*180/Math.PI,ke=Math.atan2(-Pe.z,Pe.x)*180/Math.PI;return ke>=180&&(ke-=360),{lat:ye,lon:ke}}function Y(F){let ne=a.getBoundingClientRect(),ae=F.clientX-ne.left,Be=F.clientY-ne.top,De=null,Fe=18;for(let[q,j]of _){if(K(j.marker.position))continue;let xe=H(j.marker.position);if(!xe)continue;let Pe=Math.hypot(xe.x-ae,xe.y-Be);Pe<Fe&&(De=q,Fe=Pe)}return De}let te=null;return a.addEventListener("pointerdown",F=>{te={x:F.clientX,y:F.clientY}}),a.addEventListener("pointerup",F=>{if(!te||Math.hypot(F.clientX-te.x,F.clientY-te.y)>5)return;if(d){let ae=re(F);ae&&e(ae);return}let ne=Y(F);ne&&t(ne)}),new ResizeObserver(()=>{let F=i.getBoundingClientRect();!F.width||!F.height||(s.aspect=F.width/F.height,s.updateProjectionMatrix(),r.setSize(F.width,F.height))}).observe(i),s.position.set(2.4,1.2,2.8),o.update(),{setImagery:C,setTrack:E,removeTrack:D,update:V,setObserver:X,setSightLine:N,selectedScreenPosition:Z,home:y,select(F){b=F,O()},setFollowing(F){g=F,o.enableRotate=!F},setPicking(F){d=F,a.classList.toggle("is-picking",F)},zoom(F){s.position.multiplyScalar(F);let ne=s.position.length();s.position.setLength(Math.max(o.minDistance,Math.min(o.maxDistance,ne))),o.update()},render(F){o.update(F),r.render(n,s)},onContextChange(F,ne){a.addEventListener("webglcontextlost",ae=>{ae.preventDefault(),F()}),a.addEventListener("webglcontextrestored",ne)}}}var km="http://www.w3.org/2000/svg",ur=220,Rt=ur/2,Ci=92;function En(i,e,t){let n=document.createElementNS(km,i);for(let[s,r]of Object.entries(e))n.setAttribute(s,r);return t?.append(n),n}function Tc(i,e){let t=Ci*(90-Math.max(0,Math.min(90,e)))/90,n=i*Math.PI/180;return[Rt+t*Math.sin(n),Rt-t*Math.cos(n)]}function ud(i,e,t,n){i.replaceChildren();let s=En("svg",{viewBox:`0 0 ${ur} ${ur}`,class:"sky-plot",role:"img"},i),r=e.filter(c=>c.elevation_deg>=0),a=r.reduce((c,h)=>!c||h.elevation_deg>c.elevation_deg?h:c,null);En("title",{},s).textContent=a?`Sky path peaking at ${Math.round(a.elevation_deg)} degrees in the ${zn(a.azimuth_deg)}`:"Sky plot";for(let c of[0,30,60])En("circle",{cx:Rt,cy:Rt,r:Ci*(90-c)/90,class:c===0?"sky-horizon":"sky-ring"},s);En("line",{x1:Rt,y1:Rt-Ci,x2:Rt,y2:Rt+Ci,class:"sky-ring"},s),En("line",{x1:Rt-Ci,y1:Rt,x2:Rt+Ci,y2:Rt,class:"sky-ring"},s);for(let[c,h,f]of[["N",Rt,12],["E",ur-8,Rt+4],["S",Rt,ur-4],["W",8,Rt+4]])En("text",{x:h,y:f,class:"sky-label"},s).textContent=c;for(let[c,h]of[[30,"30\xB0"],[60,"60\xB0"]])En("text",{x:Rt+3,y:Rt-Ci*(90-c)/90-2,class:"sky-scale"},s).textContent=h;if(!r.length)return;let o=r.map(c=>Tc(c.azimuth_deg,c.elevation_deg).map(h=>h.toFixed(1)).join(",")).join(" ");if(En("polyline",{points:o,fill:"none",stroke:t,"stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"},s),n){let c=r.filter(h=>{let f=Date.parse(h.at);return f>=Date.parse(n.start.at)&&f<=Date.parse(n.end.at)});c.length>1&&En("polyline",{points:c.map(h=>Tc(h.azimuth_deg,h.elevation_deg).map(f=>f.toFixed(1)).join(",")).join(" "),fill:"none",class:"sky-visible"},s)}let l=(c,h,f)=>{let[u,p]=Tc(c.azimuth_deg,c.elevation_deg);En("circle",{cx:u,cy:p,r:h,class:f,fill:t},s)};l(r[0],3,"sky-start"),l(a,4.5,"sky-peak")}var Ac=200,zm=10*6e4,Vm="25544",Gm=6e4,Hm=15e3,Do=48,Wm=1500,oe=i=>document.getElementById(i),yt=Yc(),ws=qu(()=>window.localStorage);Ju(ws);var A={tracked:new Map,selected:null,observer:Ku(ws),utc:ws.getItem("khonsu.utc")==="1",imagery:null,window:Sc(Date.now()),time:Date.now(),live:!0,playing:!1,groups:[],items:[],isSearchResult:!1,tab:"now",report:null,plan:null,planError:null,planLoading:!1,planFor:null,planAt:0,activePass:null},nt=null,dd=0,fd=0,pd=!1;function Pc(i,e,t){let n=document.activeElement,s=n&&i.contains(n)?n.dataset.focus:null;if(e(),!s)return;([...i.querySelectorAll("[data-focus]")].find(a=>a.dataset.focus===s)??t)?.focus({preventScroll:!0})}function ie(i,e,t){let n=document.createElement(i);return e&&(n.className=e),t!==void 0&&(n.textContent=t),n}function _d(){return[...A.tracked.keys()]}function An(){return A.tracked.get(A.selected)??null}function xd(){history.replaceState(null,"",$u(_d(),A.selected)||location.pathname)}function Pi(i){return`${vs(i,A.utc)} ${ys(i,A.utc)}`}async function No(i){i.error=null,i.loading=!0,clearTimeout(i.retryTimer),i.request=(i.request??0)+1;let e=i.request;dr();try{let t=await yt.track(i.id,A.window.start,A.observer);if(A.tracked.get(i.id)!==i)return;i.track=t.data,i.name=t.data.name||i.name,i.provenance=t.provenance,i.warnings=t.warnings,i.lookStale=!1,nt?.setTrack(i.id,t.data,i.color),nt?.select(A.selected),i.framePending&&(i.framePending=!1,i.id===A.selected&&nt?.home(i.id))}catch(t){if(Xn(t))return;i.error=Vn(t.message),i.retryTimer=setTimeout(()=>{A.tracked.get(i.id)===i&&i.error&&No(i)},Gm)}finally{i.request===e&&(i.loading=!1),A.tracked.get(i.id)===i&&i.request===e&&(dr(),mi(),gr(),Uo())}}function Po(i,e,{selectIt:t=!0}={}){let n=di(i);if(A.tracked.has(n)){t&&Es(n);return}if(A.tracked.size>=fi){pi(`You can track up to ${fi} satellites. Remove one to add another.`,"is-warning");return}let s={id:n,name:e||`NORAD ${n}`,color:Zu([...A.tracked.values()].map(r=>r.color)),track:null,error:null,loading:!0,framePending:!0};A.tracked.set(n,s),t&&Es(n),No(s)}function yd(i){clearTimeout(A.tracked.get(i)?.retryTimer),A.tracked.delete(i),nt?.removeTrack(i),A.selected===i?Es(_d()[0]??null):(xd(),dr(),mi(),Uo())}function Es(i){let e=A.selected!==i;A.selected=i,nt?.select(i),e&&(A.report=null,A.plan=null,A.planFor=null,A.planError=null,A.activePass=null,i&&A.tracked.get(i)?.track&&nt?.home(i)),xd(),dr(),mi(),gr(),Uo(),mr(),Md()}function vd(){for(let i of A.tracked.values())No(i)}function Ic(i){A.window=Sc(i),Dc(),vd()}function pi(i,e=""){let t=oe("catalog-status");t.textContent=i,t.className=`note ${e}`}async function Xm(){try{if(A.groups=await yt.groups(),!Array.isArray(A.groups))throw new Error("The server returned an unexpected response.")}catch(t){A.groups=[],Xn(t)||pi(`Could not load satellite groups: ${Vn(t.message)}`,"is-error");return}let i=oe("group-select");i.replaceChildren(...A.groups.map(t=>{let n=ie("option","",t);return n.value=t,n}));let e=A.groups.find(t=>t==="Space Stations")??A.groups[0];e&&(i.value=e,await Cc(e))}async function Cc(i){A.items=[],A.isSearchResult=!1,mi(),pi(`Loading ${i}\u2026`);try{A.items=await yt.satellites(i),pi("")}catch(e){if(Xn(e))return;pi(`Could not load ${i}: ${Vn(e.message)}`,"is-error")}mi()}async function qm(i){A.items=[],A.isSearchResult=!0,mi(),pi("Searching every group. The first search can take up to a minute.");try{let e=await yt.search(i);A.items=e.satellites??[];let t=e.groups_covered<e.groups_total;pi(t?`Searched ${e.groups_covered} of ${e.groups_total} groups, so more matches may exist.`:`${e.satellites.length} matches across all groups.`,t?"is-warning":"")}catch(e){if(Xn(e))return;pi(`Search failed: ${Vn(e.message)}`,"is-error")}mi()}function mi(){let i=oe("filter-input").value,e=A.isSearchResult?A.items:ju(A.items,i),t=oe("catalog-list"),n=A.tracked.size>=fi;Pc(t,()=>{t.replaceChildren(...e.slice(0,Ac).map(a=>{let o=di(a.norad_id),l=A.tracked.has(o),c=ie("li"),h=ie("button","catalog-row");h.type="button",h.setAttribute("aria-pressed",String(l)),h.disabled=!l&&n,h.dataset.focus=`catalog:${o}`,h.title=l?`Stop tracking ${a.name}`:n?`You can track up to ${fi} satellites`:`Track ${a.name}`;let f=ie("span","catalog-mark",l?"\u2713":"+");return f.setAttribute("aria-hidden","true"),h.append(f,ie("span","catalog-name",a.name),ie("span","catalog-id",a.norad_id)),h.addEventListener("click",()=>l?yd(o):Po(o,a.name)),c.append(h),c})),e.length>Ac&&t.append(ie("li","note",`Showing ${Ac} of ${e.length}. Filter to narrow the list.`)),n&&t.prepend(ie("li","note",`You can track up to ${fi} satellites. Remove one to add another.`))},oe("filter-input"));let s=oe("catalog-actions");s.replaceChildren();let r=i.trim();if(pc(r)&&!A.tracked.has(di(r))){let a=ie("button","text-button",`Track NORAD ${di(r)}`);a.type="button",a.disabled=A.tracked.size>=fi,a.addEventListener("click",()=>Po(r)),s.append(a)}if(r&&!A.isSearchResult){let a=ie("button","text-button","Search all groups");a.type="button",a.addEventListener("click",()=>qm(r)),s.append(a)}}function dr(){let i=oe("tracked-list");if(!A.tracked.size){i.replaceChildren(ie("li","note","Nothing yet. Pick a satellite below."));return}Pc(i,()=>i.replaceChildren(...[...A.tracked.values()].map(e=>{let t=ie("li",`tracked-row${e.id===A.selected?" is-selected":""}`),n=ie("button","tracked-select");n.type="button",n.setAttribute("aria-current",String(e.id===A.selected)),n.dataset.focus=`tracked:${e.id}`;let s=ie("span","dot");s.style.setProperty("--color",e.color),n.append(s,ie("span","tracked-name",e.loading&&!e.track?`${e.name} \xB7 loading`:e.name)),e.error&&n.append(ie("span","tracked-error",e.error)),n.addEventListener("click",()=>Es(e.id));let r=ie("button","row-action","\xD7");if(r.type="button",r.setAttribute("aria-label",`Stop tracking ${e.name}`),r.dataset.focus=`remove:${e.id}`,r.title=`Stop tracking ${e.name}`,r.addEventListener("click",()=>yd(e.id)),t.append(n,r),e.error){let a=ie("button","text-button tracked-retry","Try again");a.type="button",a.dataset.focus=`retry:${e.id}`,a.setAttribute("aria-label",`Try loading ${e.name} again`),a.addEventListener("click",()=>No(e)),t.append(a)}return t})),oe("filter-input"))}function Ri(i,e){for(;i.children.length>e.length;)i.lastElementChild.remove();e.forEach(([t,n,s],r)=>{let a=i.children[r];a||(a=ie("div"),a.append(ie("dt"),ie("dd")),i.append(a)),a.children[0].textContent=t,a.children[1].textContent=n,a.children[1].className=s||""})}function Lc(){let i=An(),e=oe("now-note"),t=i?.track?.samples;if(!t?.length){Ri(oe("now-readouts"),[]),e.textContent=i?.error??(i?"Loading\u2026":"Add a satellite to see its position."),e.className=`note${i?.error?" is-error":""}`;return}let n=Date.parse(t.at(-1).time);if(A.time>n+6e4&&i.warnings?.some(h=>h.code==="propagation_stopped")){Ri(oe("now-readouts"),[]),e.textContent=`This orbit cannot be predicted past ${Pi(n)}. The satellite may have decayed.`,e.className="note is-warning";return}let s=td(A.time,Date.parse(t[0].time),n),r=To(t,s),a=[["Latitude",bc(r.latitude_deg,"N","S")],["Longitude",bc(r.longitude_deg,"E","W")],["Altitude",`${r.altitude_km.toFixed(1)} km`],["Speed",`${r.speed_km_s.toFixed(3)} km/s`],["Sunlight",Qu(t,s)?"Sunlit":"In Earth\u2019s shadow"]],o=i.lookStale?null:gc(t,s);o&&(a.push(["Direction",`${zn(o.azimuth)} (${o.azimuth.toFixed(1)}\xB0)`]),a.push(["Elevation",`${o.elevation.toFixed(1)}\xB0`,o.elevation>0?"is-good":""])),Ri(oe("now-readouts"),a);let l=i.provenance?ld(i.provenance.element_epoch,s):0,c=[];A.observer||c.push("Set your location to see where to look."),Math.abs(l)>3&&c.push(`These elements are ${Math.abs(l).toFixed(0)} days from the displayed time, so positions may be well off.`);for(let h of i.warnings??[])c.push(h.message);e.textContent=c.join(" "),e.className=`note${Math.abs(l)>3||i.warnings?.length?" is-warning":""}`}function Ym(){let i=An(),e=i?.track?.samples,t=e?.length&&!i.lookStale&&A.time<=Date.parse(e.at(-1).time)?gc(e,A.time):null;nt?.setSightLine(!!(t&&t.elevation>0))}function $m(i){let e=ie("div","pass-summary");e.append(ie("strong","","Where are you?"),ie("span","","Set your location to see when this satellite passes overhead.")),i.append(e);let t=ie("button","text-button","Set location");t.type="button",t.style.marginTop="10px",t.addEventListener("click",pr),i.append(t)}function bd(){return(A.plan?.visible??[]).find(e=>Date.parse(e.end.at)>Date.now())??null}function Sd(){let{tonight:i}=A.plan,e=bd(),t=ie("div",`pass-summary${e?" is-visible":""}`);if(t.id="pass-summary",e){let n=Date.parse(e.start.at);t.append(ie("strong","",Date.now()>=n?"Visible now":`Visible ${_c(n,Date.now())}`),ie("span","",`${Pi(n)}, up to ${Math.round(e.peak.elevation_deg)}\xB0 in the ${zn(e.peak.azimuth_deg)}.`))}else i.dark_start?t.append(ie("strong","",`No visible passes in the next ${Do} hours`),ie("span","",`The next dark sky starts ${Pi(Date.parse(i.dark_start))}.`)):t.append(ie("strong","","No dark sky soon"),ie("span","","The Sun stays too high for the next 24 hours."));return t}function bs(){let i=oe("passes-content");Pc(i,()=>Zm(i))}function Zm(i){if(i.replaceChildren(),!An()){i.append(ie("p","note","Add a satellite to see its passes."));return}if(!A.observer){$m(i);return}if(A.planError&&!A.plan){i.append(ie("p","note is-error",A.planError));let r=ie("button","text-button","Try again");r.type="button",r.addEventListener("click",()=>mr(!0)),i.append(r);return}if(!A.plan){i.append(ie("p","note","Calculating passes\u2026"));return}let{visible:t,passes:n}=A.plan;if(A.planError&&i.append(ie("p","note is-warning",`Could not update this list: ${A.planError}`)),i.append(Sd(),ie("h2","eyebrow section-title",`Next ${Do} hours \xB7 ${vc(A.utc)} time`)),!n.length){i.append(ie("p","note","No passes above your horizon in this period."));return}let s=nd(n,t);for(let r of s.slice(0,40)){let a=!!(A.activePass&&Ao(A.activePass.pass,r)),o=ie("button","pass-row");o.type="button",o.dataset.focus=`pass:${r.maximum_at}`,o.setAttribute("aria-pressed",String(a));let l=Date.parse(r.start),c=Date.parse(r.end);o.append(ie("span","pass-time",`${vs(l,A.utc)} ${ys(l,A.utc).slice(0,5)}`),ie("span","pass-elevation",`${Math.round(r.maximum_elevation_deg)}\xB0`),ie("span","pass-detail",`${zn(r.start_azimuth_deg)} to ${zn(r.end_azimuth_deg)} \xB7 ${id(c-l)}`)),r.visible&&o.append(ie("span","badge","Visible")),o.addEventListener("click",()=>Km(r)),i.append(o),a&&i.append(Jm())}i.append(ie("p","note","Visible means sunlit, in a dark sky and at least 10\xB0 high. Weather and brightness are not considered."))}function Jm(){let i=ie("div","sky"),{pass:e,points:t,error:n}=A.activePass;if(n)return i.append(ie("p","note is-error",n)),i;if(!t)return i.append(ie("p","note","Loading sky path\u2026")),i;let s=ie("div");ud(s,t,An()?.color??"#ebd193",e.visible);let r=ie("div","sky-actions"),a=ie("button","text-button","Show on globe");return a.type="button",a.dataset.focus="show-on-globe",a.addEventListener("click",()=>{jm(Date.parse(e.maximum_at)),document.querySelector(".viewport").scrollIntoView({block:"nearest"})}),r.append(a),i.append(s,r),i}async function Km(i){if(A.activePass&&Ao(A.activePass.pass,i)){A.activePass=null,bs();return}A.activePass={pass:i,points:null},bs();let e=A.selected;try{let t=await yt.look(e,A.observer,i.start,i.end);A.activePass?.pass===i&&A.selected===e&&(A.activePass.points=t.data.points,bs())}catch(t){if(Xn(t)||A.activePass?.pass!==i)return;A.activePass.error=Vn(t.message),bs()}}async function mr(i=!1){let e=A.selected;if(!e||!A.observer){Io();return}let t=`${e}|${A.observer.lat}|${A.observer.lon}|${A.observer.alt}`;if(!(!i&&A.planFor===t&&Date.now()-A.planAt<zm)){A.planFor=t,A.planAt=Date.now(),A.planError=null;try{let n=yt.passes(e,A.observer,Date.now());n.catch(()=>{});let s=await yt.tonight(e,A.observer,Date.now()),r=[...s.data.passes],a=s.data,o=Date.now()+Do*36e5;for(;a.dark_end&&!a.dark_end_clipped&&Date.parse(a.dark_end)<o;){let c=await yt.tonight(e,A.observer,a.dark_end);if(A.planFor!==t)return;r.push(...c.data.passes),a=c.data}let l=await n;if(A.planFor!==t)return;A.plan={tonight:s.data,visible:r,passes:l.data.passes},A.activePass&&!A.plan.passes.some(c=>Ao(A.activePass.pass,c))&&(A.activePass=null)}catch(n){if(Xn(n)||A.planFor!==t)return;A.planError=Vn(n.message)}bs(),Io()}}async function Md(){let i=A.selected;if(!i){Rc();return}try{let e=await yt.report(i);if(A.selected!==i)return;A.report=e}catch(e){if(Xn(e)||A.selected!==i)return;A.report={error:Vn(e.message)}}Rc()}function Rc(){let i=oe("orbit-readouts"),e=oe("orbit-note"),t=oe("orbit-links");if(t.replaceChildren(),e.textContent="",e.className="note",!A.selected){Ri(i,[]),e.textContent="Add a satellite to see its orbit.";return}if(A.report?.error){Ri(i,[]),e.textContent=A.report.error,e.className="note is-error";return}if(!A.report){Ri(i,[]),e.textContent="Loading\u2026";return}let{data:n,provenance:s}=A.report,r=n.orbit;Ri(i,[["Class (estimate)",r.orbit_class_estimate],["Period",`${r.period_minutes.toFixed(1)} min`],["Inclination",`${r.inclination_deg.toFixed(2)}\xB0`],["Apogee",`${r.apogee_km.toFixed(0)} km`],["Perigee",`${r.perigee_km.toFixed(0)} km`],["Eccentricity",r.eccentricity.toFixed(5)],["Element epoch",Pi(Date.parse(s.element_epoch))],["Data source",`${s.source} (${s.cache_status})`]]),e.textContent="Apogee and perigee are two-body estimates.";let a=ie("a","","Download JSON report");if(a.href=`/api/v1/report?norad_id=${encodeURIComponent(A.selected)}`,a.download=`khonsu-${A.selected}.json`,t.append(a),n.map_url){let o=ie("a","","Current position on a map");o.href=n.map_url,o.target="_blank",o.rel="noopener noreferrer",t.append(o)}}function gr(){let i=An();oe("selected-name").textContent=i?.name??"No satellite",oe("selected-id").textContent=i?`NORAD ${i.id}`:"",oe("selected-swatch").style.setProperty("--color",i?.color??"transparent"),document.title=i?`${i.name} \xB7 Khonsu`:"Khonsu",Lc(),bs(),Rc(),Io()}function Io(){let i=oe("headline");i.replaceChildren();let e=An();if(!e)return;if(e.loading&&!e.track){i.append(ie("p","headline-title",e.name),ie("p","headline-main","Fetching its orbit\u2026"),ie("p","headline-sub","The first request can take a few seconds. After that it is saved."));return}if(!A.observer){i.append(ie("p","headline-title","See it yourself"),ie("p","headline-main","When can you see it?"));let n=ie("button","text-button","Set your location");n.type="button",n.dataset.focus="headline-location",n.addEventListener("click",pr),i.append(n);return}if(!A.plan)return;let t=bd();if(t){let n=Date.parse(t.start.at),s=Date.now()>=n;i.append(ie("p","headline-title",`${s?"Visible now":"Next visible pass"} \xB7 ${e.name}`),ie("p","headline-main",`${Pi(n).slice(0,-3)}${s?"":` \xB7 ${_c(n,Date.now())}`}`),ie("p","headline-sub",`Up to ${Math.round(t.peak.elevation_deg)}\xB0 in the ${zn(t.peak.azimuth_deg)}, starting in the ${zn(t.start.azimuth_deg)}.`));return}i.append(ie("p","headline-title",e.name),ie("p","headline-main",A.plan.tonight.dark_start?`No visible passes in the next ${Do} hours`:"No dark sky soon"))}function Uo(){let i=oe("data-status"),e=An();if(i.classList.remove("is-warning"),!e?.provenance){i.textContent="";return}let{provenance:t}=e;if(t.cache_status==="stale"){i.textContent=e.warnings?.[0]?.message??"Showing saved elements.",i.classList.add("is-warning");return}i.textContent=t.source==="file"?"Using elements from a local file. No provider requests are made.":`Satellite data from CelesTrak, epoch ${Pi(Date.parse(t.element_epoch))}.`}function wd(){oe("observer-open").classList.toggle("is-set",!!A.observer),oe("observer-label").textContent=A.observer?`${xc(A.observer.lat,"N","S")}, ${xc(A.observer.lon,"E","W")}`:"Set location"}function Dc(){let i=oe("time-slider");i.max=String(Math.round((A.window.end-A.window.start)/1e3)),oe("time-start").textContent=`${vs(A.window.start,A.utc)} ${ys(A.window.start,A.utc).slice(0,5)}`,oe("time-end").textContent=`${vs(A.window.end,A.utc)} ${ys(A.window.end,A.utc).slice(0,5)}`}function Ro(i){A.live=i;let e=oe("live-button");e.classList.toggle("is-live",i),e.setAttribute("aria-pressed",String(i)),i&&(Ss(!1),Mc(A.window,Date.now())&&Ic(Date.now()))}function Ss(i){A.playing=i;let e=oe("play-button");e.textContent=i?"\u275A\u275A":"\u25B6";let t=i?"Pause timeline":"Play timeline";e.setAttribute("aria-label",t),e.title=t}function jm(i){if(Ro(!1),Ss(!1),A.time=i,i<A.window.start||i>A.window.end){let e=An();e&&(e.framePending=!0),Ic(i)}else nt?.update(A.time),nt?.home();fr()}function fr(){let i=oe("time-slider"),e=Math.round((A.time-A.window.start)/1e3);(document.activeElement!==i||A.live||A.playing)&&(i.value=String(e));let t=`${Pi(A.time)} ${A.utc?"UTC":""}`.trim();i.setAttribute("aria-valuetext",t),oe("time-current").textContent=t}function Qm(){let i=oe("sat-label"),e=nt?.selectedScreenPosition(),t=An();if(!e||!t?.track){i.hidden=!0;return}i.hidden=!1,i.textContent=t.name,i.style.left=`${e.x}px`,i.style.top=`${e.y}px`}function e3(){if(!A.plan)return;oe("headline").contains(document.activeElement)||Io(),oe("pass-summary")?.replaceWith(Sd())}function Ed(i,e){let t=e?Math.min(i-e,1e3):0;A.live?(A.time=Date.now(),Mc(A.window,A.time)&&Ic(A.time)):A.playing&&(A.time+=t*Number(oe("speed-select").value),A.time>=A.window.end&&(A.time=A.window.end,Ss(!1)));try{nt&&(nt.update(A.time),Ym(),nt.render(t/1e3),Qm()),i-dd>250&&(dd=i,fr(),A.tab==="now"&&Lc()),i-fd>Hm&&(fd=i,e3())}catch(n){pd||console.error(n),pd=!0}requestAnimationFrame(n=>Ed(n,i))}function md(i){A.observer=i,i?ws.setItem("khonsu.observer",JSON.stringify(i)):ws.removeItem("khonsu.observer"),nt?.setObserver(i);for(let e of A.tracked.values())e.lookStale=!0;A.plan=null,A.planFor=null,A.planError=null,A.activePass=null,wd(),vd(),gr(),mr(!0)}function pr(){Lo(!1),oe("observer-lat").value=A.observer?.lat??"",oe("observer-lon").value=A.observer?.lon??"",oe("observer-alt").value=A.observer?.alt||"",oe("observer-error").textContent="",oe("observer-dialog").showModal()}function Lo(i){oe("pick-hint").hidden=!i,nt?.setPicking(i)}var Ms=0,Nc=[];function Dt(i){let e=[i.source.credit,i.source.nature,`updated ${yc(i.fetched_at,Date.now())}`];i.stale&&e.push("saved copy");let t=ie("p","data-credit",e.join(" \xB7 "));return i.warning?[t,ie("p","note is-warning",i.warning)]:[t]}function t3(i){return ie("p","note is-warning",Vn(i.message||"")||"This source could not be reached.")}function _r(i){let e=Date.parse(i);return`${vs(e,A.utc)} ${ys(e,A.utc).slice(0,5)} ${vc(A.utc)}`}function Uc(...i){let e=ie("div","data-values");for(let[t,n]of i){let s=ie("span",null,`${t} `);s.append(ie("strong",null,n)),e.append(s)}return e}function n3(i){let{kp:e,flux:t,scales:n,alerts:s}=i.data,r=e.at(-1),a=[["Kp",`${r.kp.toFixed(1)} ${sd(r.kp)}`]];t.length&&a.push(["F10.7",String(Math.round(t.at(-1).flux))]),n&&a.push(["Scales",`G${n.geomagnetic.level} S${n.solar.level} R${n.radio.level}`]);let o=[Uc(...a)];if(s.length){let l=ie("ul");l.append(...s.slice(0,3).map(c=>ie("li",null,`${_r(c.issued_at)}: ${c.headline}`))),o.push(l)}return[...o,...Dt(i)]}function i3(i){if(!i.data.length)return[ie("p","note","No upcoming launches are listed."),...Dt(i)];let e=ie("ul");return e.append(...i.data.slice(0,3).map(t=>ie("li",null,`${_r(t.net)}: ${t.name} (${t.status})`))),[e,...Dt(i)]}function Fc(i){let e=ie("ul");return e.append(...i.filter(([,t])=>t).map(([t,n])=>ie("li",null,`${t}: ${n}`))),e}function s3(i){let[e]=i.data;return e?[Fc([["Name",e.name],["Type",e.types.join(", ")],["Operator",e.operators.join(", ")],["Country",e.countries.join(", ")],["Launched",e.launch_date]]),...Dt(i)]:[ie("p","note","Wikidata has no entry for this satellite."),...Dt(i)]}function r3(i){let e=i.data;return e?[Fc([["Name",e.name],["Kind",e.kind],["Bus",e.bus],["Mass",e.mass_kg?`${e.mass_kg.toLocaleString("en-GB")} kg`:null],["Launched",e.launch_date],["Owner code",e.owner],["Manufacturer code",e.manufacturer],["Orbit class",e.orbit_class]]),...Dt(i)]:[ie("p","note","GCAT has no entry for this satellite."),...Dt(i)]}function a3(i){let[e]=i.data;return e?[Fc([["Name",e.name],["Object type",e.object_type],["Radar size",e.rcs_size],["Country code",e.country],["Launched",e.launch_date],["Decayed",e.decay_date],["Element epoch",e.epoch]]),...Dt(i)]:[ie("p","note","Space-Track has no record for this satellite."),...Dt(i)]}function o3(i){if(!i.data.length)return[ie("p","note","Earth Search lists scenes from Sentinel-2 and Landsat satellites. This satellite is not one of them.")];let e=ie("ul");return e.append(...i.data.map(t=>{let n=t.cloud_cover===null?"":`, ${Math.round(t.cloud_cover)}% cloud`;return ie("li",null,`${_r(t.time)}: near ${t.center_lat.toFixed(1)}\xB0, ${t.center_lon.toFixed(1)}\xB0${n}`)})),[e,...Dt(i)]}function l3(i){let e=ad(i.data);return e?[Uc(["Past year, strongest Kp",`${e.strongest.kp_max.toFixed(1)} on ${e.strongest.date}`],["Average F10.7",String(Math.round(e.meanFlux))]),...Dt(i)]:[ie("p","note","No observed days are available.")]}function c3(i){if(!i.data.length)return[ie("p","note","No events in the past two weeks."),...Dt(i)];let e=ie("ul");return e.append(...i.data.slice(0,4).map(t=>ie("li",null,`${_r(t.time)}: ${t.kind}${t.detail?` (${t.detail})`:""}`))),[e,...Dt(i)]}function h3(i){let e=od(i.data);return e?[Uc(["Cloud cover now",`${Math.round(e.now)}%`],["Clearest in the next day",`${Math.round(e.clearest.percent)}% at ${_r(e.clearest.time)}`]),...Dt(i)]:[ie("p","note","No forecast is available."),...Dt(i)]}function u3(i){let e=oe("data-feed-open-meteo");if(!e)return;if(!A.observer){e.replaceChildren(ie("p","note","Set your location to check cloud cover."));return}let t=ie("button","text-button","Check clouds near me");t.type="button";let n=ie("div");n.id="data-feed-open-meteo-result",t.addEventListener("click",()=>{t.textContent="Check again",Tn(i,"open-meteo-result",()=>yt.cloudCover(A.observer),h3)}),e.replaceChildren(t,n)}async function d3(i){if(!nt)return;A.imagery=i;let e=oe("imagery-credit");if(!i){e.hidden=!0,await nt.setImagery(null);return}let t=Nc.find(s=>s.id===i);e.hidden=!1,e.textContent=`Loading ${t.name}\u2026`;let n=`/api/v1/imagery?layer=${encodeURIComponent(i)}`;try{if(await nt.setImagery(n,t.transparent),A.imagery!==i)return;let{headers:s}=await fetch(n,{method:"HEAD"});if(A.imagery!==i)return;let r=[t.name,t.credit],a=s.get("X-Khonsu-Fetched-At");a&&r.push(`updated ${yc(a,Date.now())}`),s.get("X-Khonsu-Stale")==="true"&&r.push("saved copy"),e.textContent=r.join(" \xB7 ")}catch{if(A.imagery!==i)return;e.textContent=`${t.name} could not be loaded.`;try{await nt.setImagery(null)}catch{}}}function f3(){let i=ie("label","field imagery-control");i.append(ie("span",null,"Show on the globe"));let e=ie("select"),t=ie("option",null,"Plain globe");return t.value="",e.append(t,...Nc.map(n=>{let s=ie("option",null,n.name);return s.value=n.id,s})),e.value=A.imagery??"",e.addEventListener("change",()=>d3(e.value||null)),i.append(e),i}function p3(i){let e=i.data.filter(s=>s.alive&&s.status==="active");if(!e.length)return[ie("p","note","SatNOGS lists no active transmitters for this satellite."),...Dt(i)];let t=ie("ul");return t.append(...e.slice(0,4).map(s=>{let r=[rd(s.downlink_hz),s.mode].filter(Boolean).join(" \xB7 ");return ie("li",null,r?`${s.description}: ${r}`:s.description)})),[ie("p","note",`${e.length} active transmitter${e.length===1?"":"s"}`),t,...Dt(i)]}async function Tn(i,e,t,n){let s=oe(`data-feed-${e}`);if(s){s.replaceChildren(ie("p","note","Loading\u2026"));try{let r=await t();i===Ms&&s.replaceChildren(...n(r))}catch(r){i===Ms&&r.name!=="AbortError"&&s.replaceChildren(t3(r))}}}function m3(i,e){oe("data-categories").replaceChildren(...i.map(t=>{let n=ie("section","data-category");n.append(ie("h3",null,t.title),ie("p","note",t.description)),t.id==="earth-imagery"&&e&&nt&&n.append(f3());for(let s of t.sources){let r=ie("div","data-source"),a=ie("a",null,s.name);a.href=s.url,a.target="_blank",a.rel="noreferrer";let o=s.status==="live";r.append(a,ie("span",`data-status${o?" is-live":""}`,o?"Live":"Needs account"),ie("p","note",`${s.summary} ${s.refresh}.`));let l=ie("div","data-feed");l.id=`data-feed-${s.id}`,n.append(r,l)}return n}))}async function g3(){let i=++Ms,e=oe("data-status-note");e.textContent="",e.classList.remove("is-warning"),oe("data-dialog").showModal();let t;try{t=await yt.sources()}catch(s){i===Ms&&s.name!=="AbortError"&&(e.textContent=s.message,e.classList.add("is-warning"));return}if(i!==Ms)return;if(Nc=t.imagery_layers,m3(t.categories,t.live_data),!t.live_data){e.textContent="Live data is off while serving a local file, so no provider requests are made.";return}Tn(i,"noaa-swpc",()=>yt.spaceWeather(),n3),Tn(i,"celestrak-space-weather",()=>yt.spaceWeatherHistory(),l3),Tn(i,"nasa-donki",()=>yt.spaceEvents(),c3),Tn(i,"launch-library",()=>yt.launches(),i3),u3(i);let n=t.categories.flatMap(s=>s.sources).some(s=>s.id==="space-track"&&s.status==="live");if(n||oe("data-feed-space-track").replaceChildren(ie("p","note","Set KHONSU_SPACE_TRACK_USER and KHONSU_SPACE_TRACK_PASSWORD before starting Khonsu to use your account.")),!An()){e.textContent="Add a satellite to see its details here.";return}Tn(i,"wikidata",()=>yt.satelliteDetails(A.selected),s3),Tn(i,"gcat",()=>yt.catalogRecord(A.selected),r3),Tn(i,"satnogs",()=>yt.transmitters(A.selected),p3),Tn(i,"earth-search",()=>yt.recentScenes(A.selected),o3),n&&Tn(i,"space-track",()=>yt.spaceTrack(A.selected),a3)}function _3(){let i=oe("data-dialog");oe("data-open").addEventListener("click",g3),oe("data-close").addEventListener("click",()=>i.close()),i.addEventListener("close",()=>{Ms+=1,oe("data-open").focus()})}function x3(){let i=oe("observer-dialog");oe("observer-open").addEventListener("click",pr),oe("observer-cancel").addEventListener("click",()=>i.close()),i.addEventListener("close",()=>{(!document.activeElement||document.activeElement===document.body)&&oe("observer-open").focus()}),oe("observer-clear").addEventListener("click",()=>{md(null),i.close()}),oe("observer-form").addEventListener("submit",t=>{t.preventDefault();let n=mc({lat:oe("observer-lat").value,lon:oe("observer-lon").value,alt:oe("observer-alt").value});if(n.error){oe("observer-error").textContent=n.error;return}md(n.observer),i.close()}),oe("observer-locate").addEventListener("click",()=>{let t=oe("observer-error");if(!navigator.geolocation){t.textContent="This browser cannot share a location. Enter it instead.";return}t.textContent="",navigator.geolocation.getCurrentPosition(({coords:n})=>{oe("observer-lat").value=n.latitude.toFixed(4),oe("observer-lon").value=n.longitude.toFixed(4)},()=>{t.textContent="The browser did not share a location. Enter it instead."},{timeout:1e4})});let e=oe("observer-pick");e.addEventListener("click",()=>{i.close(),Lo(!0)}),nt||(e.disabled=!0),document.addEventListener("keydown",t=>{t.key==="Escape"&&!oe("pick-hint").hidden&&(t.preventDefault(),Lo(!1),setTimeout(pr))})}function y3(){let i=["now","passes","orbit"],e=(t,n=!1)=>{A.tab=t;for(let s of i){let r=oe(`tab-${s}`),a=s===t;r.setAttribute("aria-selected",String(a)),r.tabIndex=a?0:-1,oe(`panel-${s}`).hidden=!a,a&&n&&r.focus()}t==="passes"&&mr(),t==="orbit"&&Md()};i.forEach((t,n)=>{let s=oe(`tab-${t}`);s.addEventListener("click",()=>e(t)),s.addEventListener("keydown",r=>{r.key==="ArrowRight"&&e(i[(n+1)%i.length],!0),r.key==="ArrowLeft"&&e(i[(n+i.length-1)%i.length],!0)})})}function v3(){oe("live-button").addEventListener("click",()=>Ro(!0)),oe("play-button").addEventListener("click",()=>{if(A.playing){Ss(!1);return}A.live&&Ro(!1),A.time>=A.window.end&&(A.time=A.window.start),Ss(!0)}),oe("time-slider").addEventListener("input",n=>{Ro(!1),Ss(!1),A.time=A.window.start+Number(n.target.value)*1e3,fr(),Lc()});let i=oe("zone-toggle"),e=()=>{i.textContent=A.utc?"UTC":"Local time",i.setAttribute("aria-pressed",String(A.utc))};e(),i.addEventListener("click",()=>{A.utc=!A.utc,ws.setItem("khonsu.utc",A.utc?"1":"0"),e(),Dc(),fr(),gr(),Uo()}),oe("group-select").addEventListener("change",n=>{oe("filter-input").value="",Cc(n.target.value)}),oe("filter-input").addEventListener("input",()=>{if(A.isSearchResult){Cc(oe("group-select").value);return}mi()}),oe("camera-home").addEventListener("click",()=>nt?.home()),oe("zoom-in").addEventListener("click",()=>nt?.zoom(.8)),oe("zoom-out").addEventListener("click",()=>nt?.zoom(1.25));let t=oe("camera-follow");t.addEventListener("click",()=>{let n=t.getAttribute("aria-pressed")!=="true";t.setAttribute("aria-pressed",String(n)),nt?.setFollowing(n)})}function gd(i){let e=oe("scene-error");e.hidden=!1,e.textContent=i}async function b3(){try{nt=hd(oe("scene"),{onPick(t){Lo(!1),pr(),oe("observer-lat").value=t.lat.toFixed(4),oe("observer-lon").value=t.lon.toFixed(4)},onSelect:t=>Es(t)}),nt.setObserver(A.observer),nt.onContextChange(()=>gd("The graphics context was lost. The globe will return if the browser restores it. Reload if it does not. The readouts still work."),()=>{oe("scene-error").hidden=!0})}catch(t){nt=null,console.error(t),gd("3D rendering is unavailable, so the globe is hidden. Enable WebGL in your browser and reload. Satellite details and passes still work.");for(let n of["camera-follow","camera-home","zoom-in","zoom-out"])oe(n).disabled=!0}y3(),v3(),x3(),_3(),wd(),Dc(),dr(),gr(),fr(),requestAnimationFrame(t=>Ed(t,0)),setInterval(()=>mr(),6e4);let i=Yu(location.search),e=Xm();if(i.ids.length){await Promise.race([e,new Promise(t=>setTimeout(t,Wm))]);for(let t of i.ids)Po(t,void 0,{selectIt:!1});Es(i.selected)}if(await e,!i.ids.length&&!A.tracked.size){let t=A.items.find(n=>di(n.norad_id)===Vm)??A.items[0];t&&Po(t.norad_id,t.name)}}b3();})();
