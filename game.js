const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

const $ = id => document.getElementById(id);
const holes = [...document.querySelectorAll(".hole")];
const scoreEl = $("score"), timeEl = $("time"), bestEl = $("best");
const menu = $("menu"), finish = $("finish");
const mobs = ["zombie","skeleton","creeper","spider","piglin","sheep"];
const mobNames = {zombie:"ЗОМБІ",skeleton:"СКЕЛЕТ",creeper:"КРІПЕР",spider:"ПАВУК",piglin:"ПІГЛІН",sheep:"ВІВЦЯ"};
const colors = ["#ff3b3b","#25d9ff","#ffdc27","#bd58ff","#52ff76","#ff8b28","#ff65b7"];
let score=0, time=60, best=Number(localStorage.getItem("mobHunterBest")||0);
let running=false, activeHole=null, spawnTimer=null, clockTimer=null, hideTimer=null, soundOn=true;
bestEl.textContent=best;

function makeMob(type){
  const el=document.createElement("span");
  el.className=`mob ${type}`;
  el.innerHTML='<i class="head"></i><i class="body"></i><i class="legs"></i><i class="eyes"></i><i class="mouth"></i>';
  return el;
}
function clearActive(){
  if(activeHole!==null){
    holes[activeHole].classList.remove("active");
    holes[activeHole].innerHTML='<span class="mob"></span>';
    holes[activeHole].classList.remove("hit");
  }
  activeHole=null;
  clearTimeout(hideTimer);
}
function chooseType(){
  // Мирна вівця трапляється рідше за ворожих мобів.
  return Math.random()<0.16 ? "sheep" : mobs[Math.floor(Math.random()*5)];
}
function spawn(){
  if(!running) return;
  clearActive();
  const index=Math.floor(Math.random()*holes.length);
  activeHole=index;
  const type=chooseType();
  const hole=holes[index];
  hole.innerHTML="";
  hole.appendChild(makeMob(type));
  hole.dataset.type=type;
  hole.classList.add("active");
  const speed=Math.max(520,1250-(60-time)*11);
  hideTimer=setTimeout(()=>{
    if(running && activeHole===index) clearActive();
    scheduleSpawn();
  },speed);
}
function scheduleSpawn(){
  if(!running)return;
  const delay=Math.max(220,460-(60-time)*4)+Math.random()*220;
  spawnTimer=setTimeout(spawn,delay);
}
function shoot(hole){
  const type=hole.dataset.type;
  const rect=hole.getBoundingClientRect(), gameRect=$("game").getBoundingClientRect();
  const ball=document.createElement("div");
  const color=colors[Math.floor(Math.random()*colors.length)];
  ball.className="ball";ball.style.background=color;ball.style.color=color;
  ball.style.left=(gameRect.width/2-9)+"px";
  ball.style.top=(gameRect.height-125)+"px";
  ball.style.setProperty("--dx",(rect.left+rect.width/2-gameRect.left-gameRect.width/2)+"px");
  ball.style.setProperty("--dy",(rect.top+rect.height/2-gameRect.top-(gameRect.height-125))+"px");
  $("projectiles").appendChild(ball);setTimeout(()=>ball.remove(),300);
  const gained=type==="sheep"?5:10;
  score+=gained;scoreEl.textContent=score;
  $("toast").textContent=(type==="sheep"?"🐑 +5 БОНУС!":`+${gained} ${mobNames[type]}!`);
  setTimeout(()=>$("toast").textContent="",500);
  if(navigator.vibrate) navigator.vibrate(25);
  clearActive();
  clearTimeout(spawnTimer);
  scheduleSpawn();
}
holes.forEach(hole=>hole.addEventListener("click",()=>{
  if(!running || !hole.classList.contains("active"))return;
  shoot(hole);
}));
function startGame(){
  score=0;time=60;running=true;scoreEl.textContent=score;timeEl.textContent=time;
  menu.classList.add("hidden");finish.classList.add("hidden");
  clearActive();clearTimeout(spawnTimer);clearInterval(clockTimer);
  spawn();
  clockTimer=setInterval(()=>{
    time--;timeEl.textContent=time;
    if(time<=0)endGame();
  },1000);
}
function endGame(){
  running=false;clearInterval(clockTimer);clearTimeout(spawnTimer);clearActive();
  const record=score>best;
  if(record){best=score;localStorage.setItem("mobHunterBest",best);bestEl.textContent=best;}
  $("finalScore").textContent=score;
  $("recordText").textContent=record?"🎉 Новий рекорд!":"Найкращий результат: "+best;
  finish.classList.remove("hidden");
}
$("startBtn").addEventListener("click",startGame);
$("againBtn").addEventListener("click",startGame);
$("homeBtn").addEventListener("click",()=>{
  if(running){running=false;clearInterval(clockTimer);clearTimeout(spawnTimer);clearActive();}
  finish.classList.add("hidden");menu.classList.remove("hidden");
});
$("soundBtn").addEventListener("click",()=>{
  soundOn=!soundOn;$("soundBtn").textContent=soundOn?"🔊":"🔇";
});
