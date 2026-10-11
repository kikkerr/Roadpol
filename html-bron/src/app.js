/* Roadpol - navigatie tussen onderdelen (zonder pagina's te herladen) */
(function(){
var TITLES={home:'Roadpol',wegcode:'Wegcode',drugs:'Drugs',alcohol:'Alcohol',keuring:'Keuring',inschrijving:'Inschrijving',verzekering:'Verzekering',tools:'Tools'};
var lockUntil=0,lastY=0,on=false;

function show(v){
  var views=document.querySelectorAll('.view');
  for(var i=0;i<views.length;i++)views[i].classList.toggle('on',views[i].id==='v-'+v);
  document.body.setAttribute('data-v',v);
  document.title=v==='home'?'Roadpol':'Roadpol – '+TITLES[v];
  var h=document.querySelectorAll('header');for(var j=0;j<h.length;j++)h[j].classList.remove('cx');
  document.body.classList.remove('scrolled');lastY=0;
  window.scrollTo({top:0,behavior:'instant'});
}
function route(){
  var m=/^#\/([a-z]*)/.exec(location.hash||'');
  var v=(m&&m[1])||'home';
  if(!TITLES[v])v='home';
  show(v);
}
window.addEventListener('hashchange',route);

/* links binnen een onderdeel (#algemeen, #al-proc, #top ...) scrollen soepel */
document.addEventListener('click',function(e){
  var a=e.target.closest&&e.target.closest('a[href^="#"]');
  if(!a)return;
  var href=a.getAttribute('href');
  if(href.indexOf('#/')===0)return;
  e.preventDefault();
  var id=href.slice(1);
  if(id==='top'){window.scrollTo({top:0,behavior:'smooth'});return}
  var t=document.getElementById(id);if(!t)return;
  lockUntil=Date.now()+1000;
  var hd=document.querySelector('.view.on header');if(hd)hd.classList.add('cx');
  t.scrollIntoView({behavior:'smooth',block:'start'});
});

/* kop klapt in bij scrollen, knop "naar boven" verschijnt */
window.addEventListener('scroll',function(){
  var y=window.scrollY,hd=document.querySelector('.view.on header');
  if(hd&&Date.now()>lockUntil){
    if(y>120)hd.classList.add('cx');else if(y<20)hd.classList.remove('cx');
  }
  var s=y>400;if(s!==on){on=s;document.body.classList.toggle('scrolled',s)}
},{passive:true});

/* zoek-knop in de kop van de wegcode */
var sb=document.getElementById('wc-search');
if(sb)sb.addEventListener('click',function(){
  window.scrollTo({top:0,behavior:'instant'});
  var hd=document.querySelector('#v-wegcode header');if(hd)hd.classList.remove('cx');
  var q=document.getElementById('q');if(q)q.focus();
});

/* splash */
var sp=document.getElementById('splash');
setTimeout(function(){if(!sp)return;sp.classList.add('out');setTimeout(function(){sp.remove()},600)},1200);
route();
})();
