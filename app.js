/* 2026-09-29 오름유형검사 질문별 점수표, 시트1 A3:E30 기준. */
const TYPES=['가성비 남녀노소','쉬운데 뷰 유명','힘든데 뷰 유명','쉬운데 뷰 안유명','힘든데 뷰 안유명','숲길','바다','한라산','노을맛집'];
const Q=[
 {title:'제주 날씨는 어떤가요?',weight:20,options:[
  ['☀️ 햇살 쨍! 맑은 날이에요',[0,1,2,3,6,8]],['🌥 구름 끼고 흐려요',[5]],['🌧 비가 오고 있어요',[5]]]},
 {title:'언제 오르실 건가요?',weight:5,options:[
  ['🌞 상쾌한 오전 산책',[2,4,5,7,6,3,1,0]],['🌤 여유로운 오후 나들이',[7,6,5,4,3,2,1,0]],['🌅 노을 보러 갑니다!',[1,3,6,8]]]},
 {title:'누구랑 가세요?',weight:5,options:[
  ['🚶‍♂️ 혼자 조용히 걷고 싶어요',[0,1,2]],['💑 친구나 연인과 함께 가요',[1,2,3,4,5,6,7,8]],['👨‍👩‍👧 부모님이나 아이랑 가요',[0,5,6,8]]]},
 {title:'소요시간은 어느 정도가 좋아요?',weight:5,options:[
  ['⚡ 10분 안에 가고 싶어요',[0,1]],['🥾 20분 내외 산책 느낌 좋죠',[3,6]],['⛰ 30분 이상도 좋아요!',[2,4,5,7]]]},
 {title:'체력 솔직하게(?) 말해볼까요!',weight:30,options:[
  ['🐌 진짜 쉬운 곳만 가능',[0,1,3,5,6,8]],['🏃 적당히 걷는 정도는 ok',[1,3,5,7,8]],['🧗 좀 힘들어도 괜찮아요',[2,4,7]]]},
 {title:'오름에 가는 목적은요?',weight:20,options:[
  ['📸 인생샷 찍으러 갑니다',[1,3,6,8]],['🌿 산책하고~ 휴식하고~',[0,5]],['🥾 제대로 걷고 싶어요',[2,4,7]]]},
 {title:'어떤 풍경을 보고 싶나요?',weight:30,options:[
  ['🌄 동서남북 탁 트인 전망',[4,3,2,1]],['🌳 숲이 있는 오름',[5]],['🌊 바다가 보이는 오름',[6]],['🗻 한라산 뷰',[7]],['🌅 노을이 예쁜 오름',[8]],['🤷 아무거나 좋아요',[0,1,2,3,4,5,6,7,8]]]},
 {title:'오름의 유명도는 어느 정도가 좋으세요?',weight:30,options:[
  ['📍 네! 유명해도 괜찮아요 (뷰만 좋다면 어디든!!)',[0,2,1,6,8]],['🤫 오늘은 조용한 데로 갈래요 (뷰는 살짝 아쉬워도 괜춘~!)',[3,4,5,7]],['😌 아무데나 상관없어요',[0,1,2,3,4,5,6,7,8]]]}
];
const app=document.getElementById('app');
const kiosk=new URLSearchParams(location.search).get('mode')==='kiosk';
let page='start',step=0,answers=[],portrait='',stream=null,result=null,printing=false;
const config=window.OREUMER_CONFIG||{results:{}};
function el(tag,attrs={},children=[]){const node=document.createElement(tag);for(const [key,val] of Object.entries(attrs)){if(key==='class')node.className=val;else if(key==='text')node.textContent=val;else if(key==='onclick')node.addEventListener('click',val);else node.setAttribute(key,val)}for(const c of children)node.append(c);return node}
function brand(){return el('div',{class:'brand'},[el('span',{class:'arc',text:'☺'}),el('span',{text:'I am oreumer!'})])}
function button(label,action,kind=''){return el('button',{class:'button '+kind,type:'button',text:label,onclick:action})}
function show(name){page=name;render()}
function cleanupCamera(){if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}}
function reset(){cleanupCamera();answers=[];portrait='';result=null;step=0;show('start')}
function camera(){show('camera');const video=app.querySelector('video');const status=app.querySelector('.status');if(!navigator.mediaDevices?.getUserMedia){status.textContent='카메라를 사용할 수 없습니다. 사진 없이 계속 진행해 주세요.';return}navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false}).then(s=>{if(page!=='camera'){s.getTracks().forEach(t=>t.stop());return}stream=s;video.srcObject=s;video.play().catch(()=>{})}).catch(()=>{status.textContent='카메라 권한을 확인하거나 사진 없이 계속 진행해 주세요.'})}
function snap(){const video=app.querySelector('video');if(!video?.videoWidth)return;const canvas=document.createElement('canvas');canvas.width=640;canvas.height=480;const ctx=canvas.getContext('2d');ctx.translate(640,0);ctx.scale(-1,1);ctx.drawImage(video,0,0,640,480);portrait=canvas.toDataURL('image/jpeg',.82);cleanupCamera();show('confirm')}
function skipPhoto(){cleanupCamera();portrait='';step=0;show('question')}
function back(){if(step>0){step--;answers.length=step;show('question')}else camera()}
function select(index){answers[step]=index;if(step<Q.length-1){step++;show('question')}else{result=calculate();show('result')}}
function calculate(){const scores=TYPES.map(()=>0);answers.forEach((choice,qi)=>Q[qi].options[choice][1].forEach(i=>scores[i]+=Q[qi].weight));let candidates=scores.map((score,i)=>score===Math.max(...scores)?i:-1).filter(i=>i>=0);for(const qi of [6,4,7]){if(candidates.length<2)break;const matched=candidates.filter(i=>Q[qi].options[answers[qi]][1].includes(i));if(matched.length)candidates=matched}const index=candidates[Math.floor(Math.random()*candidates.length)];return{name:TYPES[index],scores}}
function printResult(){if(printing)return;printing=true;window.print();setTimeout(()=>printing=false,1200)}
function render(){app.replaceChildren();app.className='shell enter';if(page==='start'){
  app.append(brand(),el('section',{class:'hero'},[el('h1',{text:'오늘 어디 오름 갈까? 🤔\n제주 오름 추천 테스트'}),el('p',{text:'여러분은 선택만 하세요.\n오르머가 딱 맞는 오름을 추천해드릴게요!'})]),el('div',{class:'actions'},[button('❯   오름 추천 받기',camera)]));
 }else if(page==='camera'){
  app.append(brand(),el('section',{class:'camera'},[el('h1',{text:'사진을 남겨볼까요? 📸'}),el('p',{text:'사진은 이 기기에서만 결과에 사용됩니다.\n촬영하지 않아도 검사를 진행할 수 있어요.'}),el('video',{autoplay:'',playsinline:'',muted:''}),el('p',{class:'status'}),button('사진 촬영하기',snap),button('촬영하지 않고 건너뛰기',skipPhoto,'secondary')]));
 }else if(page==='confirm'){
  app.append(brand(),el('section',{class:'camera'},[el('h1',{text:'이 사진으로 시작할까요?'}),el('img',{src:portrait,alt:'촬영한 사진'}),button('이 사진으로 시작하기',()=>{step=0;show('question')}),button('다시 촬영하기',()=>{portrait='';camera()},'secondary')]));
 }else if(page==='question'){
  const bar=el('div',{class:'progress'},[el('i',{style:`width:${(step+1)/Q.length*100}%`})]);const choices=el('div',{class:'choices'},Q[step].options.map(([label],i)=>button(label,()=>select(i))));
  app.append(brand(),el('div',{class:'progress-wrap'},[el('button',{class:'back',type:'button','aria-label':'이전 질문',text:'‹',onclick:back}),bar]),el('span',{class:'count',text:`${step+1}/${Q.length}`}),el('section',{class:'question'},[el('h2',{text:`Q${step+1}.`}),el('p',{text:Q[step].title}),choices]));
 }else if(page==='result'){
  const data=config.results[result.name]||{};const cover=el('div',{class:'cover'});if(data.image)cover.append(el('img',{src:data.image,alt:`${result.name} 대표사진`}));else cover.append(el('div',{class:'placeholder',text:'oreumer\n대표사진 자리'}));
  const content=[el('h1',{text:'당신의 유형은'}),el('h2',{text:result.name}),el('div',{class:'line'})];if(portrait)content.push(el('img',{class:'portrait',src:portrait,alt:'촬영한 사진'}));content.push(el('p',{class:'intro',text:data.intro||'이 유형의 소개 문구를 입력해 주세요.'}));
  if(kiosk){if(data.url){const qr=el('div',{class:'qr-block'},[el('img',{src:'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data='+encodeURIComponent(data.url),alt:'오름 소개 페이지 QR코드'}),el('p',{text:'QR을 찍고 추천 오름을 만나보세요'})]);content.push(qr)}else content.push(el('p',{class:'note',text:'QR코드 링크 준비 중'}))}
  const actions=el('div',{class:'result-actions'});if(kiosk)actions.append(button('🖨️ 결과 인쇄하기',printResult));else if(data.url)actions.append(button('오름 소개 보러 가기 ↗',()=>window.open(data.url,'_blank','noopener')));else actions.append(button('오름 소개 페이지 준비 중',()=>{},'secondary'));
  actions.append(button('↺ 다시 시작하기',reset,'secondary'));content.push(actions);app.append(el('section',{class:'result'},[cover,el('div',{class:'result-inner'},content)]));
 }}
render();
