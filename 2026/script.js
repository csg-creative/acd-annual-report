(function(){
  var root=document.documentElement, still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var QUOTE='M26.2 0C10.1 11.3.4 27.1.4 45.3c0 16.9 11.4 26.6 23.9 26.6 11.6 0 21.5-9.7 21.5-21.7 0-11.5-8.1-19.1-18-19.1-2.2 0-4.3.4-5.3.8 2.7-7.9 12.1-16.9 18.7-19.8L26.2 0ZM77.1 0C61 11.3 51.3 27.1 51.3 45.3c0 16.9 11.4 26.6 23.9 26.6 11.6 0 21.5-9.7 21.5-21.7 0-11.5-8.1-19.1-18-19.1-2.2 0-4.3.4-5.3.8 2.6-7.9 12.1-16.9 18.7-19.8L77.1 0Z';

  // Decorate quote frames
  document.querySelectorAll('.q').forEach(function(q){
    var html=['t','r','bt','lf'].map(function(c){return '<i class="l '+c+'"></i>'}).join('');
    ['o','e'].forEach(function(c){html+='<svg class="m '+c+'" viewBox="0 0 97 72" aria-hidden="true"><path d="'+QUOTE+'"/></svg>'});
    q.insertAdjacentHTML('beforeend',html);
  });

  // Stagger children of .st
  document.querySelectorAll('.st').forEach(function(g){
    Array.prototype.forEach.call(g.children,function(c,i){
      if(!c.hasAttribute('data-r')) c.setAttribute('data-r','');
      c.style.setProperty('--d',Math.min(i,8)*.09+'s');
    });
  });

  // Number roll-up. The HTML always holds the final value.
  function roll(el){
    var txt=el.textContent, m=txt.match(/[\d,]*\.?\d+/);
    if(!m||still) return;
    var end=parseFloat(m[0].replace(/,/g,'')), dec=(m[0].split('.')[1]||'').length, comma=m[0].indexOf(',')>-1;
    var pre=txt.slice(0,m.index), post=txt.slice(m.index+m[0].length), dur=Math.min(2000,900+end/40), t0=null;
    function fmt(v){var s=v.toFixed(dec);return comma?s.replace(/\B(?=(\d{3})+(?!\d))/g,','):s}
    function step(t){
      if(t0===null) t0=t;
      var p=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-p,4);
      el.textContent=p<1?pre+fmt(end*e)+post:txt;
      if(p<1) requestAnimationFrame(step);
    }
    el.textContent=pre+fmt(0)+post;
    setTimeout(function(){requestAnimationFrame(step)},parseFloat(getComputedStyle(el.closest('[data-r]')||el).getPropertyValue('--d'))*1000||0);
  }

  // Reveal on scroll
  var targets='[data-r],.band,.q,.tri';
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting) return;
        e.target.classList.add('rv'); io.unobserve(e.target);
        e.target.querySelectorAll('.n').forEach(roll);
        if(e.target.classList.contains('n')) roll(e.target);
      });
    },{rootMargin:'0px 0px -9% 0px',threshold:.05});
    document.querySelectorAll(targets).forEach(function(el){
      if(!el.closest('.car-s')) io.observe(el); else el.classList.add('rv');
    });
  } else document.querySelectorAll(targets).forEach(function(el){el.classList.add('rv')});

  // Carousels
  document.querySelectorAll('.car').forEach(function(car){
    var view=car.querySelector('.car-v'), track=car.querySelector('.car-t'), slides=[].slice.call(track.children), i=0, timer=null, playing=car.hasAttribute('data-auto')&&!still;
    var nav=document.createElement('div'); nav.className='car-nav';
    var mk=function(cls,label,txt){var b=document.createElement('button');b.type='button';b.className=cls;b.setAttribute('aria-label',label);b.textContent=txt||'';return b};
    var prev=mk('arr','Previous slide','←'), next=mk('arr','Next slide','→'), dots=slides.map(function(_,n){var d=mk('dot','Go to slide '+(n+1));d.onclick=function(){go(n);stop()};return d});
    nav.appendChild(prev); dots.forEach(function(d){nav.appendChild(d)}); nav.appendChild(next);
    var pz=null;
    if(car.hasAttribute('data-auto')&&!still){ pz=mk('pz','Pause testimonials','❚❚'); pz.style.fontSize='11px'; nav.appendChild(pz);
      pz.onclick=function(){ if(playing){stop()} else {playing=true;pz.textContent='❚❚';pz.setAttribute('aria-label','Pause testimonials');arm()} }; }
    car.appendChild(nav);
    function size(){view.style.height=slides[i].offsetHeight+'px'}
    function go(n){
      i=(n+slides.length)%slides.length;
      track.style.transform='translateX('+(-100*i)+'%)';
      slides.forEach(function(s,k){s.classList.toggle('on',k===i); s.inert=k!==i});
      dots.forEach(function(d,k){d.setAttribute('aria-current',k===i)});
      size();
    }
    function arm(){clearInterval(timer); if(playing) timer=setInterval(function(){go(i+1)},7500)}
    function stop(){playing=false;clearInterval(timer); if(pz){pz.textContent='▶';pz.setAttribute('aria-label','Play testimonials')}}
    prev.onclick=function(){go(i-1);stop()}; next.onclick=function(){go(i+1);stop()};
    car.addEventListener('mouseenter',function(){clearInterval(timer)}); car.addEventListener('mouseleave',arm);
    car.addEventListener('focusin',function(){clearInterval(timer)}); car.addEventListener('focusout',arm);
    var sx=null;
    track.addEventListener('pointerdown',function(e){sx=e.clientX});
    track.addEventListener('pointerup',function(e){ if(sx===null)return; var dx=e.clientX-sx; sx=null; if(Math.abs(dx)>50){go(i+(dx<0?1:-1));stop()} });
    go(0); arm();
    addEventListener('resize',size); addEventListener('load',size);
    if(window.ResizeObserver) new ResizeObserver(size).observe(slides[0].parentNode);
  });

  // Scroll progress + hero parallax
  var bar=document.getElementById('bar'), hero=document.querySelector('.hero-photo img'), tick=false;
  function frame(){
    tick=false;
    var y=scrollY, max=root.scrollHeight-innerHeight;
    bar.style.transform='scaleX('+(max>0?y/max:0)+')';
    if(!still&&hero&&y<innerHeight*1.5) hero.style.transform='translateY('+(y*.07)+'px)';
  }
  addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(frame)}},{passive:true});
  frame();
  requestAnimationFrame(function(){requestAnimationFrame(function(){root.classList.add('ready')})});
})();
