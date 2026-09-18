const ids=['tree','star','book','bubble','clock'];
function openGame(id){document.getElementById('home').style.display='none';document.body.classList.add('game-open');ids.forEach(x=>document.getElementById(x).classList.remove('active'));document.getElementById(id).classList.add('active');if(id==='tree')newTree();if(id==='star')newStars();if(id==='book')newBooks();if(id==='bubble')newBubbles();if(id==='clock')startClock();scrollTo(0,0)}
function goHome(){ids.forEach(x=>document.getElementById(x).classList.remove('active'));document.getElementById('home').style.display='block';document.body.classList.remove('game-open');scrollTo(0,0)}
/* 苹果树：手指左右滑动，树干固定，只让树冠轻轻摇 */
let apples=0, basketApples=0, shakeCount=0, lastDir=0, shaking=false, lastX=0, swingsNeeded=3+Math.floor(Math.random()*3);
function newTree(){
 const old=document.querySelectorAll('#treeObj .apple,.fallingLeaf');old.forEach(x=>x.remove());
 apples=2+Math.floor(Math.random()*7); shakeCount=0; lastDir=0; swingsNeeded=3+Math.floor(Math.random()*3);
 for(let i=0;i<apples;i++){
   let a=document.createElement('div');a.className='apple';
   a.style.left=(18+Math.random()*65)+'%';a.style.top=(18+Math.random()*43)+'%';
   document.getElementById('treeObj').appendChild(a);
 }
 document.getElementById('treeDone').classList.remove('show');
 document.getElementById('treeNotice').textContent=tr('treeNotice');
}
function dropApple(){
 if(apples<=0)return;
 const list=[...document.querySelectorAll('#treeObj .apple:not(.falling)')]; if(!list.length)return;
 const a=list[Math.floor(Math.random()*list.length)];a.classList.add('falling');apples--;basketApples++;
 document.getElementById('basketCount').textContent=basketApples;appleSound();
 setTimeout(()=>{
   a.remove();
   if(apples===0){
     document.getElementById('treeDone').classList.add('show');
     document.getElementById('treeNotice').textContent=tr('treeDone');
   }
 },920);
}
function leafFall(){
 const t=document.getElementById('treeObj'), l=document.createElement('div');l.className='fallingLeaf';
 l.style.left=(24+Math.random()*54)+'%';l.style.top=(15+Math.random()*30)+'%';
 t.appendChild(l);setTimeout(()=>l.remove(),2300);
}
function registerSwing(dir){
 if(!shaking || dir===lastDir)return;
 lastDir=dir;shakeCount++;
 const t=document.getElementById('treeObj');
 t.classList.remove('sway-left','sway-right');void t.offsetWidth;
 t.classList.add(dir>0?'sway-right':'sway-left');
 if(Math.random()<.22)leafFall();
 if(shakeCount>=swingsNeeded){shakeCount=0;lastDir=0;swingsNeeded=3+Math.floor(Math.random()*3);dropApple();}
}
const treebox=document.getElementById('treebox');
treebox.addEventListener('pointerdown',e=>{
 if(apples===0 && document.getElementById('treeDone').classList.contains('show')){newTree();return;}
 shaking=true;lastX=e.clientX;lastDir=0;treebox.setPointerCapture?.(e.pointerId);
});
treebox.addEventListener('pointermove',e=>{
 if(!shaking)return;
 const dx=e.clientX-lastX;
 if(Math.abs(dx)>12){registerSwing(dx>0?1:-1);lastX=e.clientX;}
});
['pointerup','pointercancel','pointerleave'].forEach(ev=>treebox.addEventListener(ev,()=>{shaking=false;lastDir=0}));

let soundEnabled=localStorage.getItem('relaxSound')!=='off';
function updateSoundButton(){
  const b=document.getElementById('soundBtn');
  if(!b)return;
  b.textContent=soundEnabled?'🔊':'🔇';
  b.classList.toggle('off',!soundEnabled);
  b.title=soundEnabled?tr('soundOn'):tr('soundOff');
}
function toggleSound(){soundEnabled=!soundEnabled;localStorage.setItem('relaxSound',soundEnabled?'on':'off');updateSoundButton()}
function makeTone(type='soft'){
  if(!soundEnabled)return;
  try{
    const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
    const c=new C(),o=c.createOscillator(),g=c.createGain();
    o.type=type==='wood'?'triangle':'sine';
    o.frequency.setValueAtTime(type==='wood'?110:520,c.currentTime);
    o.frequency.exponentialRampToValueAtTime(type==='wood'?75:180,c.currentTime+.16);
    g.gain.setValueAtTime(type==='wood' ? .035 : .028,c.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.18);
    o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+.18);
  }catch(e){}
}
function woodSound(){makeTone('wood')}

function appleSound(){if(!soundEnabled)return;try{let c=new AudioContext(),o=c.createOscillator(),g=c.createGain();o.frequency.value=330;o.frequency.exponentialRampToValueAtTime(170,c.currentTime+.12);g.gain.value=.05;g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.14);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+.14)}catch(e){}}

/* 星星：点击真正的 ⭐，它会慢慢飘进瓶子，再展开纸条 */
const sayings=['你已经做得很好了，真的。','今天的你，也值得被温柔对待。','慢一点没有关系，你没有落后。','辛苦了。现在可以暂时把烦恼放下。','你身上有很多值得被肯定的地方。','希望这一颗小星星，替你保存一点好心情。','现在的你，也值得一句夸奖：做得漂亮。'];
const MAX_DAILY_STARS=11;
const starSayings=[
{zh:'今天也有一件做得不错的小事，值得给自己记一笔。',en:'There is at least one small thing you did well today. Let yourself count it.'},
{zh:'慢一点，不代表落后，只是你在按自己的节奏走。',en:'Going slowly does not mean falling behind. You are moving at your own pace.'},
{zh:'这一颗星星，送你一点轻松的心情。',en:'This little star is here to bring you a lighter feeling.'},
{zh:'你值得拥有一些不用赶时间的时刻。',en:'You deserve moments when there is nowhere you need to rush.'},
{zh:'愿今天有一件小事，让你觉得“嗯，还不错”。',en:'May one small thing today make you think, “That was pretty nice.”'},
{zh:'给今天的自己一个小小的赞：做得不错。',en:'A small compliment for today: you did well.'},
{zh:'不必把每件事都想明白，留一点空白也很好。',en:'You do not have to figure everything out. Leaving a little blank space is okay.'},
{zh:'你可以一边休息，一边慢慢想下一步。',en:'You can rest while you slowly figure out what comes next.'},
{zh:'今天也许没有特别的事，但平平静静也很珍贵。',en:'Maybe nothing special happened today. A quiet day can be precious too.'},
{zh:'愿这颗星星替你收好一点点好心情。',en:'Let this star keep a little bit of good feeling for you.'},
{zh:'今天辛苦啦，接下来可以轻松一点。',en:'You made it through today. You can take it a little easier now.'},
{zh:'有时候，什么都不做几分钟，也是一种很好的休息。',en:'Sometimes doing nothing for a few minutes is a perfectly good kind of rest.'},
{zh:'不用急着赶到哪里，慢慢走就好。',en:'You do not have to rush anywhere. Take your time.'},
{zh:'有些小开心不会提前通知你，它可能就在下一分钟出现。',en:'Little bits of happiness do not always announce themselves. One might arrive in the next minute.'},
{zh:'愿接下来遇到的小事，都比想象中顺利一点。',en:'I hope the little things ahead go a bit more smoothly than expected.'},
{zh:'一颗星星，一点亮光，刚刚好。',en:'One star, a little light, just enough.'},
{zh:'今天也可以对自己温柔一点。',en:'You can be a little gentler with yourself today.'},
{zh:'你可以先完成眼前这一小步，其他的以后再说。',en:'You can take the small step in front of you. The rest can wait.'},
{zh:'愿你今天碰见一点轻轻的小惊喜。',en:'May you run into a small, gentle surprise today.'},
{zh:'别忘了，开心的小事也值得被认真对待。',en:'Small happy things are worth noticing too.'},
{zh:'这一刻不用赶，星星也在慢慢走。',en:'There is no need to rush this moment. Even the stars move slowly.'},
{zh:'愿你的下一口呼吸，比上一口更轻松一点。',en:'May your next breath feel a little easier than the last.'},
{zh:'你可以把今天的小成功，偷偷收藏起来。',en:'You can quietly keep today’s little success for yourself.'},
{zh:'不管今天是什么样，接下来都可以重新开始一点点。',en:'Whatever today was like, you can begin again in small ways.'},
{zh:'给自己留一点时间，事情会慢慢变清楚。',en:'Give yourself a little time. Things can become clearer slowly.'},
{zh:'愿你今晚有一个舒服、安静的小片刻。',en:'May you have a comfortable, quiet little moment tonight.'},
{zh:'有些答案不用今天找到，明天也可以。',en:'Some answers do not have to be found today. Tomorrow is okay.'},
{zh:'小小的进步，也算进步。',en:'Small progress is still progress.'},
{zh:'愿你发现一个让自己嘴角微微上扬的小瞬间。',en:'May you notice one tiny moment that makes you smile.'},
{zh:'不用比较，每个人都有自己的时间表。',en:'There is no need to compare. Everyone has their own timeline.'},
{zh:'你可以先享受这一颗星星，再想其他事情。',en:'You can simply enjoy this star for a moment before thinking about anything else.'},
{zh:'今天给自己留一点“什么都不用做”的时间吧。',en:'Give yourself a little time today when you do not have to do anything.'},
{zh:'愿这颗星星让你的心情亮一点点。',en:'May this star make your mood a tiny bit brighter.'},
{zh:'谢谢你来到这里，慢慢玩就好。',en:'Thanks for stopping by. Take your time and enjoy the little moment.'},
{zh:'你不需要一直保持完美，普通的一天也很好。',en:'You do not have to be perfect. An ordinary day can be a good day too.'},
{zh:'你已经走过不少路了，偶尔停一下也没关系。',en:'You have already come a long way. It is okay to pause sometimes.'},
{zh:'有一点点空闲，就拿来看看天空吧。',en:'If you have a little spare time, give the sky a glance.'},
{zh:'你可以不急着回应世界，先照顾好自己的节奏。',en:'You do not have to answer the world right away. Keep your own rhythm first.'},
{zh:'今天已经够好了，剩下的慢慢来。',en:'Today is good enough. The rest can happen slowly.'},
{zh:'希望这一颗小星星，替你保存一点好心情。',en:'Let this little star save a little good feeling for you.'},
{zh:'你愿意给自己一点休息的时间，这很不错。',en:'Giving yourself a little time to rest is a good thing.'},
{zh:'愿接下来的几分钟，安静又舒服。',en:'May the next few minutes feel quiet and comfortable.'},
{zh:'偶尔发发呆也没关系，脑子也需要休息。',en:'It is okay to daydream sometimes. Your mind needs rest too.'},
{zh:'你可以把不重要的事情先放到一边。',en:'You can set the unimportant things aside for now.'},
{zh:'今天的你，也值得一句夸奖：做得漂亮。',en:'You deserve a little praise today: nicely done.'},
{zh:'你正在慢慢积累自己的力量，这件事很值得肯定。',en:'You are slowly building your own strength, and that is worth recognizing.'},
{zh:'愿你发现今天一个值得开心的小瞬间。',en:'May you notice one little moment today that is worth enjoying.'}
];
let usedStarSayingIndexes=[],currentSayingIndex=-1;
function starDayKey(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function loadStarProgress(){const today=starDayKey();if(localStorage.getItem('relaxStarDay')!==today){localStorage.setItem('relaxStarDay',today);localStorage.setItem('relaxStarCollected','0')}return Math.min(MAX_DAILY_STARS,parseInt(localStorage.getItem('relaxStarCollected')||'0',10)||0)}
function saveStarProgress(n){localStorage.setItem('relaxStarDay',starDayKey());localStorage.setItem('relaxStarCollected',String(Math.min(MAX_DAILY_STARS,n)))}
function clearBottleStars(){document.querySelectorAll('#bottle .bottleStars').forEach(x=>x.remove())}
function addBottleStar(){const b=document.getElementById('bottle'),s=document.createElement('span');s.className='bottleStars';s.textContent='⭐️';s.style.left=(18+Math.random()*64)+'%';s.style.top=(34+Math.random()*45)+'%';b.appendChild(s)}
function showStarFinished(){document.getElementById('messageText').textContent=currentLang==='en'?'You’ve picked all of today’s stars. Come back tomorrow.':'今日的星星已经摘取完了，明日再来吧。';document.getElementById('message').classList.add('show')}
function getStarSayingIndex(){let choices=[];for(let i=0;i<starSayings.length;i++)if(!usedStarSayingIndexes.includes(i))choices.push(i);if(!choices.length)choices=starSayings.map((_,i)=>i);const idx=choices[Math.floor(Math.random()*choices.length)];usedStarSayingIndexes.push(idx);return idx}
function newStars(){const sky=document.getElementById('sky');loadStarProgress();usedStarSayingIndexes=[];currentSayingIndex=-1;sky.querySelectorAll('.starpick,.shooting').forEach(x=>x.remove());document.getElementById('message').classList.remove('show');document.getElementById('messageText').textContent='';clearBottleStars();const collected=loadStarProgress();for(let i=0;i<collected;i++)addBottleStar();if(collected>=MAX_DAILY_STARS){showStarFinished();return}const remaining=MAX_DAILY_STARS-collected;for(let i=0;i<remaining;i++){let s=document.createElement('div');s.className='starpick';s.textContent='⭐️';s.style.left=(6+Math.random()*88)+'%';s.style.top=(5+Math.random()*68)+'%';s.style.animationDelay=Math.random()*2+'s';s.onclick=()=>collectStar(s);sky.appendChild(s)}for(let i=0;i<4;i++){let m=document.createElement('div');m.className='shooting';m.style.setProperty('--y',(5+Math.random()*38)+'%');m.style.setProperty('--delay',(i*2.4)+'s');sky.appendChild(m)}}
function collectStar(s){const sky=document.getElementById('sky'),b=document.getElementById('bottle');if(s.classList.contains('collecting')||loadStarProgress()>=MAX_DAILY_STARS)return;const sr=s.getBoundingClientRect(),br=b.getBoundingClientRect(),dx=(br.left+br.width/2)-(sr.left+sr.width/2),dy=(br.top+br.height/2)-(sr.top+sr.height/2);s.style.setProperty('--dx',dx*.35+'px');s.style.setProperty('--dy',dy*.35+'px');s.style.setProperty('--bx',dx+'px');s.style.setProperty('--by',dy+'px');s.classList.add('collecting');setTimeout(()=>{s.remove();const next=loadStarProgress()+1;saveStarProgress(next);addBottleStar();currentSayingIndex=getStarSayingIndex();document.getElementById('messageText').textContent=starSayings[currentSayingIndex][currentLang];document.getElementById('message').classList.add('show');if(next>=MAX_DAILY_STARS){sky.querySelectorAll('.starpick,.shooting').forEach(x=>x.remove());setTimeout(showStarFinished,1800)}},1500)}
function refreshStarMessageLanguage(){const m=document.getElementById('message');if(!m||!m.classList.contains('show'))return;if(loadStarProgress()>=MAX_DAILY_STARS){showStarFinished();return}if(currentSayingIndex>=0)document.getElementById('messageText').textContent=starSayings[currentSayingIndex][currentLang]}
function closeMessage(){document.getElementById('message').classList.remove('show')}

let starMidnightTimer=null;
function scheduleStarMidnightReset(){
  clearTimeout(starMidnightTimer);
  const now=new Date();
  const next=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1,0,0,1);
  starMidnightTimer=setTimeout(()=>{
    loadStarProgress();
    if(document.getElementById('star')?.classList.contains('active')) newStars();
    scheduleStarMidnightReset();
  },Math.max(1000,next-now));
}
scheduleStarMidnightReset();


/* 书架：直接用手指/鼠标拖书，放到哪里就到哪里；书本没有文字 */

let books=[];
let draggingBook=null;

function layoutBooks(){
  const row=document.getElementById('bookrow');
  if(!row)return;
  const width=row.clientWidth;
  const gap=Math.max(5,Math.min(12,width*0.018));
  const bookWidth=books[0]?.offsetWidth||30;
  const step=Math.max(bookWidth+gap, Math.min(78,(width-bookWidth)/Math.max(1,books.length-1)));
  books.forEach((b,i)=>{
    b.style.bottom='0px';
    b.style.left=Math.max(0,Math.min(width-bookWidth,i*step))+'px';
    b.style.transform='';
  });
}

function getBookInsertIndex(book){
  const row=document.getElementById('bookrow');
  const rr=row.getBoundingClientRect();
  const centerX=draggingBook.currentX-rr.left;
  const without=books.filter(x=>x!==book);
  let idx=without.length;
  for(let i=0;i<without.length;i++){
    const r=without[i].getBoundingClientRect();
    if(centerX < r.left-rr.left+r.width/2){idx=i;break;}
  }
  return idx;
}
function layoutBookOrder(order,skip){
  const row=document.getElementById('bookrow');
  if(!row)return;
  const width=row.clientWidth;
  const gap=Math.max(5,Math.min(12,width*0.018));
  const bookWidth=books[0]?.offsetWidth||30;
  const step=Math.max(bookWidth+gap,Math.min(78,(width-bookWidth)/Math.max(1,order.length-1)));
  order.forEach((b,i)=>{
    if(b===skip)return;
    b.style.bottom='0px';
    b.style.left=Math.max(0,Math.min(width-bookWidth,i*step))+'px';
    b.style.transform='';
  });
}
function previewBookGap(book){
  if(!draggingBook)return;
  const idx=getBookInsertIndex(book);
  const order=books.filter(x=>x!==book);
  order.splice(idx,0,book);
  layoutBookOrder(order,book);
}

function newBooks(){
  const row=document.getElementById('bookrow');
  if(!row)return;
  row.innerHTML='';
  books=[];
  const n=3+Math.floor(Math.random()*4);
  const fills=['#8da58d','#b28f79','#8999a9','#c2a078','#a58fa1','#8c9b78'];
  for(let i=0;i<n;i++){
    const b=document.createElement('div');
    b.className='book';
    b.style.height=(65+Math.random()*75)+'px';
    b.style.background=fills[i%fills.length];
    row.appendChild(b);
    books.push(b);
    makeDraggable(b,row);
  }
  requestAnimationFrame(layoutBooks);
}

function makeDraggable(el,row){
  let dragging=false,ox=0,oy=0,startIndex=0;
  el.addEventListener('pointerdown',e=>{
    dragging=true;
    draggingBook=el;
    startIndex=books.indexOf(el);
    el.classList.add('drag');
    const r=el.getBoundingClientRect();
    ox=e.clientX-r.left;
    oy=e.clientY-r.top;
    el.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  });
  el.addEventListener('pointermove',e=>{
    if(!dragging)return;
    const rr=row.getBoundingClientRect();
    const x=e.clientX-rr.left-ox;
    const y=e.clientY-rr.top-oy;
    const safeX=Math.max(0,Math.min(rr.width-el.offsetWidth,x));
    const safeY=Math.max(0,Math.min(rr.height-el.offsetHeight,y));
    el.style.left=safeX+'px';
    el.style.bottom=(rr.height-safeY-el.offsetHeight)+'px';
    el.style.zIndex='20';
    draggingBook.currentX=e.clientX;
    previewBookGap(el);
    e.preventDefault();
  });
  ['pointerup','pointercancel'].forEach(ev=>el.addEventListener(ev,e=>{
    if(!dragging)return;
    const idx=getBookInsertIndex(el);
    const order=books.filter(x=>x!==el);
    order.splice(idx,0,el);
    books=order;
    dragging=false;
    draggingBook=null;
    el.classList.remove('drag');
    el.style.zIndex='';
    layoutBooks();
    woodSound();
  }));
}


setLang(localStorage.getItem('relaxLang')||'zh');updateSoundButton();

let bubbleRoundTimer=null;
function bubblePopSound(){if(!soundEnabled)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=new C(),o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(520,c.currentTime);o.frequency.exponentialRampToValueAtTime(180,c.currentTime+.16);g.gain.setValueAtTime(.028,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.18);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+.18)}catch(e){}}
function newBubbles(){const field=document.getElementById('bubbleField');if(!field)return;clearTimeout(bubbleRoundTimer);field.querySelectorAll('.bubble').forEach(x=>x.remove());const count=2+Math.floor(Math.random()*4);for(let i=0;i<count;i++){const b=document.createElement('div');b.className='bubble';b.style.setProperty('--size',(62+Math.random()*50)+'px');b.style.setProperty('--left',(4+Math.random()*88)+'%');b.style.setProperty('--top',(5+Math.random()*80)+'%');const grow=4.7+Math.random()*2.3;b.style.setProperty('--grow',grow+'s');b.addEventListener('pointerdown',e=>{e.stopPropagation();popBubble(b)});field.appendChild(b);setTimeout(()=>{if(document.body.contains(b)&&!b.classList.contains('popping'))popBubble(b)},(grow+.15)*1000)}}
function popBubble(b){if(!b||b.classList.contains('popping'))return;b.classList.add('popping');bubblePopSound();setTimeout(()=>{b.remove();const field=document.getElementById('bubbleField');if(field&&!field.querySelector('.bubble'))bubbleRoundTimer=setTimeout(newBubbles,260)},340)}
