/* Roadpol - Alcohol: waarden-kaarten + meting-zoeker.
   Bedragen, uren en OIRB-regels staan allemaal in BANDS: hier aanpassen. */
(function(){
var RIJVERBOD='12 u';
var TOESLAG='+ 10,67 € toeslag';
var WHO={
  be:'Belg = vaste woon- of verblijfplaats in België (ingeschreven in het Rijksregister).',
  nb:'Niet-Belg = géén vaste woon- of verblijfplaats in België (niet in het Rijksregister).'
};
/* min/max in mg/l (max is exclusief). sev = kleurniveau 0-4. */
var BANDS=[
 {grp:'Resultaat ademanalyse', id:'pro', min:0.09, max:0.22, n:'0,09<br>– 0,21', tag:'Enkel professionele bestuurder', sev:0, oirb:false,
  be:{act:'OI € 116', sub:'Voorstel OI is verplicht', admin:true}, nb:{act:'OI € 116', sub:'Voorstel OI is verplicht', admin:true}},
 {id:'a', min:0.22, max:0.35, n:'0,22<br>– 0,34', sev:1, oirb:false,
  be:{act:'OI € 197', sub:'Met antwoordformulier', admin:true}, nb:{act:'OI € 197', admin:true}},
 {id:'b', min:0.35, max:0.44, n:'0,35<br>– 0,43', sev:2, oirb:true,
  be:{act:'PV', sub:'Met antwoordformulier'}, nb:{act:'OI € 462 + PV', admin:true}},
 {id:'c', min:0.44, max:0.50, n:'0,44<br>– 0,49', sev:3, oirb:true,
  be:{act:'PV', sub:'Met antwoordformulier'}, nb:{act:'OI € 636 + PV', admin:true}},
 {id:'d', min:0.50, max:99, n:'≥ 0,50', sev:4, oirb:true,
  be:{act:'PV', sub:'Met antwoordformulier'}, nb:{act:'Consignatie € 1.260 + PV'}},

 {grp:'Geen (geldig) resultaat', id:'w', w:'Weigering', tag:'AT / AA / bloedproef', sev:4, oirb:true,
  be:{act:'PV'}, nb:{act:'Consignatie € 1.260 + PV'}},
 {id:'o', w:'AT / AA niet mogelijk', tag:'Geen weigering + duidelijke tekenen van alcoholopname of dronkenschap', sev:4, oirb:true,
  be:{act:'PV', sub:'Procedure bloedproef uitvoeren'}, nb:{act:'Consignatie € 1.260 + PV', sub:'Procedure bloedproef uitvoeren'}},

 {grp:'Dronkenschap (art. 35 WVW)', id:'dr1', w:'Dronkenschap', tag:'AA ≥ 0,22 (of AT = A / P), geen speekseltest', sev:3, oirbTxt:'OIRB: ja bij AA ≥ 0,35 of AT = P', oirb:null,
  be:{act:'PV', sub:'In de praktijk wordt dronkenschap niet weerhouden: OI / consignatie volgens het eindresultaat van de AA.'}, same:true},
 {id:'dr2', w:'Dronkenschap', tag:'AA < 0,22 (of AT = S) en negatieve speekseltest', sev:3, oirb:true,
  be:{act:'PV'}, same:true}
];

var who='be';
var bandsEl=document.getElementById('al-bands'),
    whoEl=document.getElementById('al-who'),
    inp=document.getElementById('al-val'),
    fnd=document.getElementById('al-finder'),
    res=document.getElementById('al-res'),
    clr=document.getElementById('al-clr'),
    seg=document.getElementById('al-seg');
if(!bandsEl)return;

function chip(cls,t){return '<span class="ch'+(cls?' '+cls:'')+'">'+t+'</span>'}
function card(b){
  var a=(b.same?b.be:b[who]);
  var left=b.n?'<span class="n">'+b.n+'</span><small>mg/l</small>':'<span class="w">'+b.w+'</span>';
  var oi=b.oirbTxt?chip('on',b.oirbTxt):chip(b.oirb?'on':'no','OIRB: '+(b.oirb?'ja':'nee'));
  return '<article class="band s'+b.sev+'" data-id="'+b.id+'"><div class="bl">'+left+'</div><div class="br">'+
    (b.tag?'<div class="bt">'+b.tag+'</div>':'')+
    '<div class="ba">'+a.act+'</div>'+(a.sub?'<div class="bs">'+a.sub+'</div>':'')+
    '<div class="bc">'+chip('','Rijverbod '+RIJVERBOD)+oi+(a.admin?chip('',TOESLAG):'')+'</div></div></article>';
}
function render(){
  var h='';
  BANDS.forEach(function(b){ if(b.grp)h+='<div class="bgrp">'+b.grp+'</div>'; h+=card(b); });
  bandsEl.innerHTML=h;
  whoEl.textContent=WHO[who];
  seg.querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x.dataset.who===who)});
  find();
}
function parse(s){
  s=(s||'').replace(',','.').replace(/[^0-9.]/g,'');
  if(!s||s==='.')return null;
  var v=parseFloat(s); return isNaN(v)?null:v;
}
function find(){
  var v=parse(inp.value);
  fnd.classList.toggle('has',inp.value.length>0);
  bandsEl.classList.remove('has-hl');
  bandsEl.querySelectorAll('.hl').forEach(function(e){e.classList.remove('hl')});
  res.classList.remove('on');
  if(v===null)return;
  var vt=String(v).replace('.',',');
  if(v<0.09){res.innerHTML='<b>'+vt+' mg/l</b><br>Onder 0,09: geen alcoholovertreding.';res.classList.add('on');return}
  var hit=null;
  BANDS.forEach(function(b){ if(b.min!==undefined && v>=b.min && v<b.max)hit=b; });
  if(!hit)return;
  var a=hit[who];
  var el=bandsEl.querySelector('[data-id="'+hit.id+'"]');
  el.classList.add('hl'); bandsEl.classList.add('has-hl');
  var extra=hit.id==='pro'?'<br><small>Enkel van toepassing bij een professionele bestuurder, anders geen overtreding.</small>':'';
  res.innerHTML='<b>'+vt+' mg/l</b> → <b>'+a.act+'</b><br>Rijverbod '+RIJVERBOD+' · OIRB: '+(hit.oirb?'ja':'nee')+(a.admin?' · '+TOESLAG:'')+extra;
  res.classList.add('on');
}
seg.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;who=b.dataset.who;render()});
inp.addEventListener('input',find);
clr.addEventListener('click',function(){inp.value='';find();inp.focus()});
render();
})();
