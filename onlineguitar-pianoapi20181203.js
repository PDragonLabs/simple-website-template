var g_instrument = 'Piano';

function gasendevent(action,label) { return "ga('send', 'event', '" + g_instrument + "', '" + action + "', '" + label + "');"; }
function evallog(gastring) { eval(gastring); console.log(gastring); }
function galog(action,label) { evallog(gasendevent(action,label)); }
function threshold(n) { var log8ile = Math.log(n)/Math.log(8); return (log8ile == Math.floor(log8ile)); }

var AudioContext = window.AudioContext || window.webkitAudioContext;
var audiocontext = new AudioContext();
var piano7sounds = [];
for (var i=24; i<=108; i++) piano7sounds[i] = null;

function piano7loadsound(n)
{
 var request = new XMLHttpRequest();
 request.open("POST", 'index.php' , true);
 request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
 request.responseType = "arraybuffer";
 request.onload =
  function()
  {
   audiocontext.decodeAudioData
    (
      request.response,
      function(buffer)
      {
       if (!buffer) { console.error('error decoding file data ('+n+'): ' + url); return; }
       piano7sounds[n] = buffer;
      },
      function(error) { console.error('decodeAudioData error ('+n+'): ', error); }
    );
  }
 request.onerror = function() { console.error('BufferLoader: XHR error ('+n+')'); }
 request.send('n='+n);
}


function piano7loadbasic()
{
 piano7loadsound(51); piano7loadsound(58);
 piano7loadsound(65); piano7loadsound(72);
 piano7loadsound(79);
}

function piano7loadall()
{
 piano7loadsound(44); piano7loadsound(37);
 piano7loadsound(86); piano7loadsound(93);
 piano7loadsound(30); piano7loadsound(24);
}


function sustain_sourcestart(n,rate,delayInSeconds)
{
 if (audiocontext.state == 'suspended') audiocontext.resume();
 var source = audiocontext.createBufferSource();
 source.buffer = piano7sounds[n];
 source.playbackRate.setValueAtTime(rate,0);
 source.connect(audiocontext.destination);
 source.start(audiocontext.currentTime + delayInSeconds);
}

function sourcestart(n,rate,delayInSeconds)
{
 if (susbox.checked) { sustain_sourcestart(n,rate,delayInSeconds); return; }
 
 if (audiocontext.state == 'suspended') audiocontext.resume();
 
 var volume = 1;
 var duration = 0.6; // in seconds
 var start = audiocontext.currentTime + delayInSeconds;
 var stop = start + duration;
 
 var gainNode = audiocontext.createGain();
 gainNode.gain.setValueAtTime(volume, start);
 gainNode.gain.linearRampToValueAtTime(1, stop);
 gainNode.gain.linearRampToValueAtTime(0, stop+0.1);
 gainNode.connect(audiocontext.destination);
 var source = audiocontext.createBufferSource();
 source.buffer = piano7sounds[n];
 source.playbackRate.setValueAtTime(rate,0);
 source.connect(gainNode);
 source.start(start); 
}

function playpiano7sound(n,delayInSeconds)
{
 delayInSeconds = delayInSeconds || 0;
 if (delayInSeconds > 0) setTimeout( "recordnow("+n+");" , delayInSeconds*1000);	
  if (n <= 28) return sourcestart(24,Math.pow(2,(n-24)/12),delayInSeconds);
  if (n >= 93) return sourcestart(93,Math.pow(2,(n-93)/12),delayInSeconds);
  if (n%7 == 2) return sourcestart(n,1,delayInSeconds);
  if (n%7 == 3) return sourcestart(n-1,Math.pow(2,1/12),delayInSeconds);
  if (n%7 == 4) return sourcestart(n-2,Math.pow(2,2/12),delayInSeconds);
  if (n%7 == 5) return sourcestart(n-3,Math.pow(2,3/12),delayInSeconds);
  if (n%7 == 6) return sourcestart(n+3,Math.pow(2,-3/12),delayInSeconds);
  if (n%7 == 0) return sourcestart(n+2,Math.pow(2,-2/12),delayInSeconds);
  if (n%7 == 1) return sourcestart(n+1,Math.pow(2,-1/12),delayInSeconds);
}


function preloadoctaves(a,b)
{
 if (a<3 || b>4) piano7loadall();
}

function playpianosound(context,n,delayInSeconds)
{
 playpiano7sound(n,delayInSeconds);
}

// -----

function isblackkey(n)
{
 var i = n % 12;
 return (i==1 || i==3 || i==6 || i==8 || i==10);
}

function freq(n)
{
 var f = 440*Math.pow(2,(n-69)/12);
 return f.toFixed(1);
}

function soundletter(n,sharp)
{
 if (n<21 || n>109) { alert('wrong number for sound'); return '?'; }
 var names = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B','Cb'];
 if (sharp) names = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B','B#']; 
 return names[n%12];
}

function soundnumber(n,sharp)
{
 if (n<21 || n>109) { alert('wrong number for sound'); return '?'; }
 return Math.floor(n/12)-1;
}

function soundname(n,sharp)
{
 return soundletter(n,sharp)+'<sub>'+soundnumber(n,sharp)+'</sub>';
}

var ileplayaudio = 0;

function playaudio(n)
{
 playpianosound(audiocontext,n);
 document.title = '('+n+') ' + soundname(n).replace('<sub>','').replace('</sub>','');
 recordnow(n);
 if (threshold(++ileplayaudio)) galog('Playaudio', 'playaudio-'+ileplayaudio);
}

// piano keyboard

function keywidth(n)
{
 switch (n%12)
 {
  case 0 : return 23/(23+24+23)*100 + '%';
  case 2 : return 24/(23+24+23)*100 + '%';
  case 4 : return 23/(23+24+23)*100 + '%';
  
  case 1 : return 14/(23+24+23)*100 + '%';
  case 3 : return 14/(23+24+23)*100 + '%';
  
  case  5 : return 24/(24+23+23+24)*100 + '%';
  case  7 : return 23/(24+23+23+24)*100 + '%';
  case  9 : return 23/(24+23+23+24)*100 + '%';
  case 11 : return 24/(24+23+23+24)*100 + '%';
  
  case  6 : return 14/(24+23+23+24)*100 + '%';
  case  8 : return 14/(24+23+23+24)*100 + '%';
  case 10 : return 14/(24+23+23+24)*100 + '%';
 } 
}

function keywrite(n)
{
 var letter = soundletter(n);
 var number = soundnumber(n);
 var div = document.createElement('div');
 div.style.fontFamily = 'Arial';
 div.innerHTML =
  "<div style='float:left; width:60%;'>"
 +"<svg width='100%' height='100%' viewBox='0 0 11 20'>"
 +"<text x='0' y='13' fill='black'>"+letter+"</text></svg></div>"
 +"<div style='float:left; width:40%;'>"
 +"<svg width='100%' height='100%' viewBox='0 0 11 30'>"
 +"<text x='0' y='25' fill='black'>"+number+"</text></svg></div>";
 return div; 
}

function buttonpianostyle()
{
 var style = document.createElement('style');
 var text = '\n';
 text += ".whitekeybutton {";
 text += " opacity: 0.5; background: white; background: linear-gradient(lightgray,white);";
 text += " box-shadow: inset 1px 1px 6px 0px black, inset -1px -1px 6px 0px black, 1px 0px gray, -1px 0px gray; }";
 text += ".whitekeybutton:hover {";
 text += " opacity: 1; background: #eeeeee;";
 text += " box-shadow: inset 1px 1px 7px 0px rgba(0,0,0,1), inset -1px -1px 7px 0px rgba(0,0,0,1), 1px 0px gray, -1px 0px gray; }";
 text += " .blackkeybutton { background: #111; background: linear-gradient(#111, #444); }"; 
 text += ".blackkeybutton:hover { background: #555; }";
 
 text += "button.playback {";
 text += " background: linear-gradient(#eeeeee, #cccccc);";
 text += " height: 2em; font-weight: bold; font-family: Verdana;";
 text += " border: 1px solid darkgray; border-radius: 0.5em;";
 text += " cursor: pointer; margin: 0; outline: none;";
 text += "}";
 text += "button.playback:hover { box-shadow: inset 0px 0px 1em 0px #eeeeee; }";
 text += "button.chord {";
 text += " background: linear-gradient(#fafafa, #dddddd);";
 text += " height: 2em; font-family: Arial;";
 text += " border: 1px solid darkgray; border-radius: 0.5em;";
 text += " cursor: pointer; margin: 0; outline: none;";
 text += "} button.chord:hover { box-shadow: inset 0px 0px 1em 2em #eeeeee; }";

 text += ".przycisk";
 text += "{";
 text += " cursor: pointer;";
 text += " display: inline-block;";
 text += " margin: 0.5em;";
 text += " padding: 4px;";
 text += " border: 1px solid gray;";
 text += " border-radius: 4px;";
 text += " background: #eeeeee;";
 text += " font-family: Arial;";
 text += " font-size: 100%;"
 text += " line-height: 1;";
 //text += " vertical-align: middle;";
 text += "}";
 text += ".przycisk:hover { background: #fafafa; }";
  
 style.appendChild(document.createTextNode(text));
 return style;
}

function klawisz(n,extraC)
{
 var button = document.createElement('button');
 button.id = 'klawisz'+n;
 button.setAttribute('onmousedown', "presspianokey("+n+");");
 button.setAttribute('ontouchstart', "presspianokey("+n+");");
 button.setAttribute('onmouseup', "releasepianokey("+n+");");
 button.setAttribute('ontouchend', "releasepianokey("+n+");");
 button.setAttribute('onmouseleave', "releasepianokey("+n+");");
 button.style.width = extraC ? '100%' : keywidth(n);
 button.style.userSelect = 'none';
 button.style.outline = 'none';
 if (!isblackkey(n))
 {
  button.className = 'whitekeybutton';
  button.style.height = '100%';
  button.style.position = 'relative';
  button.style.margin = '0';
  button.style.padding = '0';
  button.style.border = 'none';
  button.style.borderRadius = '0 0 4px 4px';
  button.style.cursor = 'pointer';
  var napis = keywrite(n);
  napis.style.position = 'absolute';
  napis.style.bottom = '0';
  napis.style.left = '25%';
  napis.style.width = '50%';
  button.appendChild(napis);
  return button;
 }
 button.className = 'blackkeybutton';
 button.style.height = 2/3*100+'%';
 button.style.margin = '0';
 button.style.padding = '0';
 button.style.outline = 'none';
 button.style.border = 'none';
 button.style.cursor = 'pointer';
 button.style.position = 'absolute';
 button.style.top = '0';
 button.style.borderRadius = '0 0 3px 3px';
 var inkey = document.createElement('fieldset');
 inkey.className = 'blackinkey';
 inkey.style.height = '88%';
 inkey.style.margin = '0';
 inkey.style.marginLeft = '8%';
 inkey.style.marginRight = '8%';
 inkey.style.padding = '0';
 inkey.style.border = 'none';
 inkey.style.outline = 'none';
 inkey.style.background = 'inherit';
 inkey.style.boxShadow = '0px 2px 1px 0px #777';
 button.appendChild(inkey);
 return button;
}

function klawiatura(firstoctave,lastoctave)
{
 preloadoctaves(firstoctave,lastoctave);
 var box = document.createElement('div');
 var width = (lastoctave-firstoctave+1)*164+23;
 var height = 150;
 box.style.paddingTop = height / width * 100 + '%';
 box.style.position = 'relative';
 
 var innerbox = document.createElement('fieldset');
 innerbox.style.position = 'absolute';
 innerbox.style.top = '0';
 innerbox.style.left = '0';
 innerbox.style.border = 'none';
 innerbox.style.outline = 'none';
 innerbox.style.margin = '0';
 innerbox.style.padding = '0';
 innerbox.style.height = '100%';
 innerbox.style.width = '100%';
 
 var K = lastoctave-firstoctave+1;
 for (var i=firstoctave; i<=lastoctave; i++)
 {
  var td = document.createElement('fieldset');
  td.style.position = 'relative';
  td.style.display = 'inline-block';
  td.style.padding = '0';
  td.style.margin = '0';
  td.style.border = 'none';
  td.style.outline = 'none';
  td.style.width = 3/(7*K+1)*100+'%';
  td.style.height = '100%';
  var c = 12*i+12;
  td.appendChild(klawisz(c));
  td.appendChild(klawisz(c+2));
  td.appendChild(klawisz(c+4));
  var sharp = klawisz(c+1);
  sharp.style.left = 14/(23+24+23)*100+'%';
  td.appendChild(sharp);
  sharp = klawisz(c+3);
  sharp.style.right = 14/(23+24+23)*100+'%'; 
  td.appendChild(sharp);
  innerbox.appendChild(td);
  td = document.createElement('fieldset');
  td.style.position = 'relative';
  td.style.display = 'inline-block';
  td.style.padding = '0';
  td.style.margin = '0';
  td.style.border = 'none';
  td.style.outline = 'none';
  td.style.width = 4/(7*K+1)*100+'%';
  td.style.height = '100%';
  var f = 12*i+12+5;
  td.appendChild(klawisz(f));
  td.appendChild(klawisz(f+2));
  td.appendChild(klawisz(f+4));
  td.appendChild(klawisz(f+6));
  var sharp = klawisz(f+1);
  sharp.style.left = 13/(24+23+23+24)*100+'%';
  td.appendChild(sharp);
  sharp = klawisz(f+3);
  sharp.style.left = 40/(24+23+23+24)*100+'%'; 
  td.appendChild(sharp);
  sharp = klawisz(f+5);
  sharp.style.right = 13/(24+23+23+24)*100+'%'; 
  td.appendChild(sharp);
  innerbox.appendChild(td);
 }
 td = document.createElement('fieldset');
 td.style.display = 'inline-block';
 td.style.padding = '0';
 td.style.margin = '0';
 td.style.border = 'none';
 td.style.outline = 'none';
 td.style.width = 1/(7*K+1)*100+'%';
 td.style.height = '100%';
 var c = klawisz(12*(lastoctave+2),true);
 td.appendChild(c);
 innerbox.appendChild(td);
 
 box.appendChild(innerbox);
 box.setAttribute('ontouchstart','preventZoom(event);touchdevice();');
 box.setAttribute('ontouchmove', 'event.preventDefault();'); 
 return box;
}

function downpresspianokey(n)
{
 var key = document.getElementById('klawisz'+n);
 if (key) key.style.transform = 'translateY(6px)';
}

function activatepianokey(n)
{
 if (n>109) { activatepianokey(n-12); return; }
 if (n<21) { activatepianokey(n+12); return; }
 playaudio(n);
 downpresspianokey(n);
}

function releasepianokey(n)
{
 if (document.getElementById('rechord').checked) return;
 if (n>109) { releasepianokey(n-12); return; }
 if (n<21) { activatepianokey(n+12); return; }
 var key = document.getElementById('klawisz'+n);
 if (key) key.style.transform = 'none';
 var i = document.getElementById('melochords').selectedIndex;
 if (i>0) releaseallkeys();
}

function releaseallkeys()
{
 for (var i=21; i<=109; i++)
 {
  var key = document.getElementById('klawisz'+i);
  if (key) key.style.transform = 'none';  
 }
}

function playallpressedkeys()
{
 for (var n=21; n<=109; n++)
 {
  var key = document.getElementById('klawisz'+n);
  if (key && key.style.transform == 'translateY(6px)') playaudio(n);
 }
}

function presspianokey(n)
{
 if (audiocontext.state == 'suspended') audiocontext.resume();
 if (document.getElementById('rechord').checked)
 {
  var key = document.getElementById('klawisz'+n);
  key.style.transform = (key.style.transform != 'translateY(6px)') ? 'translateY(6px)' : 'none';  
  playallpressedkeys();
  return;
 }
 var i = document.getElementById('melochords').selectedIndex;
 if (i == 0) { activatepianokey(n); return; }
 if (i == 1) { activatepianokey(n); activatepianokey(n+4); activatepianokey(n+7); }
 if (i == 2) { activatepianokey(n); activatepianokey(n+3); activatepianokey(n+7); }
}

function press(k)
{
 var i = document.getElementById('octaveselector').selectedIndex;
 var n = k-1+(i+2)*12;
 presspianokey(n);
 return;
}

function unpress(k)
{
 var i = document.getElementById('octaveselector').selectedIndex;
 var n = k-1+(i+2)*12;
 releasepianokey(n);
 return;
}

function rechordonchange()
{
 var rechord = document.getElementById('rechord');
 if (rechord.checked == false)
 {
  var button = memorybutton(true);
  if (memorybuttons.innerHTML.charAt(0)=='t') memorybuttons.innerHTML = '';
  if (button) { memorybuttons.appendChild(button); flashmemorybuttons();  }
  releaseallkeys();
 }
}

function keysensoronkeydown(thiss)
{
 var keycode = event.which || event.keyCode;
 thiss.name = 'a'+keycode;
 thiss.value = keyCodes[keycode].toUpperCase();
 thiss.style.width = thiss.value.length + 'em';
}

function keysensor(id)
{
 var ks = document.createElement('input');
 ks.className = 'ks';
 ks.id = id+'keysensor';
 ks.name = '';
 ks.type = 'text';
 ks.style.fontFamily = 'Courier';
 ks.style.width = '1em';
 ks.setAttribute('onkeydown','keysensoronkeydown(this);return false;');
 return ks; 
}

var g_renameprompttext = 'A new name for this button:'; 

function onrename(id)
{
 var button = document.getElementById(id+'button');
 var newname = prompt(g_renameprompttext,button.innerHTML);  
 if (newname)
 {
  button.innerHTML = newname;
  galog('rename', 'rename');
 }
}

var g_renametext = 'rename';

function renamebutton(id)
{
 var button = document.createElement('button');
 button.style.marginRight = '1em';
 button.innerHTML = g_renametext;
 button.setAttribute('onclick','onrename("'+id+'");');
 return button;
}

function chordbutton(id)
{
 var name = '';
 var chordbuttonclick = "galog('Memorybutton', 'chordbutton-click');";
 var onmousedown = chordbuttonclick + id+"button.style.transform='translateY(4px)';"; 
 var onmouseup = id+"button.style.transform='none';";
 for (var n=21; n<=109; n++)
 {
  var key = document.getElementById('klawisz'+n);
  if (key && key.style.transform == 'translateY(6px)')
  {
   name += soundname(n,true);
   onmousedown += 'activatepianokey('+n+');';
   onmouseup += 'releasepianokey('+n+');'; 
  }
 }
 if (name == '') return null;
 var button = document.createElement('button');
 button.id = id+'button';
 button.className = 'chord';
 button.innerHTML = name;
 if (g_touchscreen == false) button.setAttribute('onmousedown',onmousedown);
 else                        button.setAttribute('ontouchstart',onmousedown);
 if (g_touchscreen == false) button.setAttribute('onmouseup',onmouseup);
 else                        button.setAttribute('ontouchend',onmouseup); 
 return button;
}

function trimrecording(arr)
{
 var newarr = [];
 var startms = arr[0].split('.')[1];
 for (var i=0; i<arr.length-1; i++)
 {
  var n = Math.floor(arr[i]);
  var ms = arr[i].split('.')[1];
  ms = ms - startms;
  newarr.push(n+'.'+ms);  
 }
 newarr.push('');
 return newarr;
}

var g_playbackbuttontext = 's &#9654;'; //' secs playback';

function playbackbutton(id)
{
 var tape = document.getElementById('recordedsounds').value;
 var arr = tape.split(' ');
 if (arr.length <=1 ) return;
 arr = trimrecording(arr);
 var duration = parseInt(arr[arr.length-2].split('.')[1]);

 var ga = "galog('Memorybutton', 'playback-click');"; 
 var action = ga;
 for (var i=0; i<arr.length-1; i++)
 {
  var n = Math.floor(arr[i]);
  var ms = arr[i].split('.')[1];
  var percent = parseInt(ms)/duration*100+'%';
  var background = "linear-gradient(to right, #ffffff, #ffffff "+percent+", #cccccc 0%, #cccccc)"; 
  action += 'setTimeout("'+id+'button.style.background='+"'"+background+"'"+';",'+ms+');' ; 
  action += "setTimeout('downpresspianokey("+n+");',"+ms+');' ;
  var delay = 222;
  action += "setTimeout('releasepianokey("+n+");',"+(parseInt(ms)+delay)+');' ;
  action += "playpianosound(audiocontext,"+n+","+ms/1000+");";
 }
 action += 'setTimeout("'+id+'button.style.background='+"'"+'linear-gradient(#eeeeee, #cccccc)'+"'"+';",'+duration+');' ;
 var button = document.createElement('button');
 button.id = id+'button';
 button.className = 'playback';
 button.innerHTML = (duration / 1000).toFixed(1) + g_playbackbuttontext;
 button.setAttribute('onmousedown','null');
 button.setAttribute('onmouseup',action);
 return button;
}

function deletebutton(id)
{
 document.getElementById("memorybuttons").removeChild(document.getElementById(id+'dragdiv'));
 savebutton.disabled = (memorybuttons.innerHTML == '');
}

var g_keytext = 'key:';
var g_deletetext = 'delete';

function horizontaleditor(id)
{
 var ok = document.createElement('button'); ok.innerHTML = 'OK';
 ok.style.marginRight = '1em';
 ok.setAttribute('onclick','document.getElementById("'+id+'editor").style.display="none";');
 var delet = document.createElement('button');
 delet.style.marginLeft = '1em'; delet.innerHTML = g_deletetext;
 delet.setAttribute('onclick','deletebutton("'+id+'");');

 var editor = document.createElement('div');
 editor.id = id+'editor';
 editor.style.display = 'none';
 editor.style.position = 'absolute';
 editor.style.zIndex = '10';
 editor.style.border = 'thick groove lightgray';
 editor.style.borderRadius = '0.5em';
 editor.style.padding = '0.4em';
 editor.style.background = '#f7f7f7';
 editor.setAttribute('onmouseleave','document.getElementById("'+id+'editor").style.display="none";');
 
 var table = document.createElement('table'); var tr = document.createElement('tr'); table.appendChild(tr);
 table.style.borderCollapse = 'collapse';
 var td = document.createElement('td'); tr.appendChild(td); td.appendChild(ok);
 var td = document.createElement('td'); tr.appendChild(td); td.appendChild(renamebutton(id));
 var td = document.createElement('td'); tr.appendChild(td); td.innerHTML = g_keytext;;
 var td = document.createElement('td'); tr.appendChild(td); td.appendChild(keysensor(id));
 var td = document.createElement('td'); tr.appendChild(td); td.appendChild(delet);
 var tds = tr.children; for (i=0; i<tds.length; i++) tds[i].style.padding = '0';
 editor.appendChild(table);
 return editor;
}

function memorybutton(rechord)
{
 var id = 'b'+Math.floor(Math.random()*100000)+Math.floor(Math.random()*100000);
 if (rechord) id += 'c';
 var button = rechord ? chordbutton(id) : playbackbutton(id);
 if (button == null) return null;

 var edit = settingsicon(); //size in pixels
 edit.style.display = 'block';
 edit.style.cursor = 'pointer';
 edit.setAttribute('onclick','document.getElementById("'+id+'editor").style.display="inline-block";');
 edit.setAttribute('draggable','false'); 
 
 var buttonedit = document.createElement('table'); buttonedit.id = id;
 buttonedit.style.borderCollapse = 'collapse'; buttonedit.style.display = 'inline-block';
 buttonedit.style.margin = '0.5em';
 var tr = document.createElement('tr'); var td = document.createElement('td');
 td.style.padding = '0'; td.appendChild(button); tr.appendChild(td);
 td = document.createElement('td'); td.style.padding = '0'; td.appendChild(horizontaleditor(id)); td.appendChild(edit);
 tr.appendChild(td);
 buttonedit.appendChild(tr);
 
 var dragdiv = document.createElement('div'); dragdiv.id = id + 'dragdiv';
 dragdiv.style.display = 'inline-block'; dragdiv.appendChild(buttonedit);
 dragdiv.setAttribute('draggable','true'); dragdiv.setAttribute('ondragstart',"drag(event)");
 applynoselect(dragdiv);
 
 savebutton.disabled = false;
 return dragdiv; 
}

function recordpanel()
{
 var box = document.createElement('input');
 box.type = 'checkbox';
 box.id = 'recordbox';
 box.setAttribute('onchange','recordonchange();');
 var starttime = document.createElement('input');
 starttime.type = 'text';
 starttime.id = 'starttime';
 starttime.style.display = 'none';
 var playback = document.createElement('button');
 playback.id = 'playbackbutton';
 playback.innerHTML = 'playback';
 playback.disabled = true;
 playback.setAttribute('onclick','startplayback();');
 playback.style.display = 'none';
 
 var rp = document.createElement('fieldset');
 rp.style.display = 'inline-block';
 rp.style.border = 'none';
 rp.style.margin = '0.5em';
 rp.style.padding = '0';
 rp.appendChild(box);
 var RECORD = document.createElement('span');
 RECORD.id = 'RECORDtext';
 RECORD.innerHTML = 'RECORD';
 rp.appendChild(RECORD);
 rp.appendChild(starttime);
 rp.appendChild(playback);
 return rp;
}
function recordonchange()
{
 if (document.getElementById('recordbox').checked)
 {
  document.getElementById('starttime').value = Date.now();
  document.getElementById('playbackbutton').disabled = true;
  document.getElementById('recordedsounds').value = '';
  return;
 }
 // stop recording
 if (memorybuttons.innerHTML.charAt(0)=='t') memorybuttons.innerHTML = '';
 if (recordedsounds.value) // something has been recorded
 {
  document.getElementById('memorybuttons').appendChild(memorybutton(false));
  flashmemorybuttons();
 }
}
function startplayback()
{
 var tape = document.getElementById('recordedsounds').value;
 var arr = tape.split(' ');
 if (arr.length<1) return;
 for (var i=0; i<arr.length-1; i++)
 {
  var n = Math.floor(arr[i]);
  var ms = arr[i].split('.')[1];
  setTimeout("playaudio("+n+");",ms);
 }
}
function recordnow(n)
{
 if (document.getElementById('recordbox').checked == false) return;
 var ms = Date.now() - document.getElementById('starttime').value;
 var tape = document.getElementById('recordedsounds');
 tape.value += n+'.'+ms+' ';
 document.getElementById('playbackbutton').disabled = false;
}

function loweroctave()
{
 var n,min,max;
 for (n=21; n<=109; n++) if (document.getElementById('klawisz'+n)) { min = n; break; }
 for (n=109; n>=21; n--) if (document.getElementById('klawisz'+n)) { max = n; break; }
 if (min < 36) return;
 var a = min/12-2;
 var b = max/12-2;
 keyboardspot.innerHTML = '';
 keyboardspot.appendChild(klawiatura(a,b));
 var rr = document.getElementById('loweroctavebutton');
 if (a == 1) { rr.disabled = true; rr.style.cursor = 'not-allowed'; }
 rlo.disabled = false; rho.disabled = false;
 rlo.style.cursor = 'pointer';
 rho.style.cursor = 'pointer';
 octavesPanel.style.display = 'none';
 galog( 'Octaves', 'lower');
 updatepianoessencewidth();
}

function higheroctave()
{
 var n,min,max;
 for (n=21; n<=109; n++) if (document.getElementById('klawisz'+n)) { min = n; break; }
 for (n=109; n>=21; n--) if (document.getElementById('klawisz'+n)) { max = n; break; }
 var a = min/12-1;
 var b = max/12-1;
 if (b == 8) return;
 keyboardspot.innerHTML = '';
 keyboardspot.appendChild(klawiatura(a,b));
 var rr = document.getElementById('higheroctavebutton');
 if (b == 7) { rr.disabled = true; rr.style.cursor = 'not-allowed'; }
 rlo.disabled = false; rho.disabled = false;
 rlo.style.cursor = 'pointer';
 rho.style.cursor = 'pointer';
 octavesPanel.style.display = 'none';
 galog( 'Octaves', 'higher');
 updatepianoessencewidth();
}

function removelowestoctave()
{
 var n,min,max;
 for (n=21; n<=109; n++) if (document.getElementById('klawisz'+n)) { min = n; break; }
 for (n=109; n>=21; n--) if (document.getElementById('klawisz'+n)) { max = n; break; }
 var a = min/12-1;
 var b = max/12-2;
 if (a == b) return;
 keyboardspot.innerHTML = '';
 keyboardspot.appendChild(klawiatura(a+1,b));
 var rr = document.getElementById('loweroctavebutton');
 rr.disabled = false; rr.style.cursor = 'pointer';
 if (a+1 == b)
 {
  rlo.disabled = true; rho.disabled = true;
  rlo.style.cursor = 'not-allowed';
  rho.style.cursor = 'not-allowed';
 }
 octavesPanel.style.display = 'none';
 galog( 'Octaves', 'lowest');
 updatepianoessencewidth();
}

function removehighestoctave()
{
 var n,min,max;
 for (n=21; n<=109; n++) if (document.getElementById('klawisz'+n)) { min = n; break; }
 for (n=109; n>=21; n--) if (document.getElementById('klawisz'+n)) { max = n; break; }
 var a = min/12-1;
 var b = max/12-2;
 if (a == b) return;
 keyboardspot.innerHTML = '';
 keyboardspot.appendChild(klawiatura(a,b-1));
 var rr = document.getElementById('higheroctavebutton');
 rr.disabled = false; rr.style.cursor = 'pointer';
 if (a == b-1)
 {
  rlo.disabled = true; rho.disabled = true;
  rlo.style.cursor = 'not-allowed';
  rho.style.cursor = 'not-allowed';
 }
 octavesPanel.style.display = 'none';
 galog( 'Octaves', 'highest');
 updatepianoessencewidth();
}

function octavespanel(a,b)
{
 var lob = document.createElement('button');
 lob.id = 'loweroctavebutton';
 lob.style.display = 'block';
 lob.style.margin = '0.75em';
 lob.style.width = '12em';
 lob.setAttribute('onclick','loweroctave();');
 lob.innerHTML = 'add lower octave';
 lob.style.cursor = 'pointer';
 if (a == 1) { lob.disabled = true; lob.style.cursor = 'not-allowed'; }
 
 var rr = document.createElement('button');
 rr.id = 'higheroctavebutton';
 rr.style.display = 'block';
 rr.style.margin = '0.75em';
 rr.style.width = '12em';
 rr.setAttribute('onclick','higheroctave();');
 rr.innerHTML = 'add higher octave';
 rr.style.cursor = 'pointer';
 if (b == 7) { rr.disabled = true; rr.style.cursor = 'not-allowed'; }
 
 var rlo = document.createElement('button');
 rlo.id = 'rlo';
 rlo.style.display = 'block';
 rlo.style.margin = '0.75em';
 rlo.style.width = '12em';
 rlo.setAttribute('onclick','removelowestoctave();');
 rlo.innerHTML = 'remove lowest octave';
 rlo.style.cursor = 'pointer';
 if (b == a) { rlo.disabled = true; rlo.style.cursor = 'not-allowed'; }

 var rho = document.createElement('button');
 rho.id = 'rho';
 rho.style.display = 'block';
 rho.style.margin = '0.75em';
 rho.style.width = '12em';
 rho.setAttribute('onclick','removehighestoctave();');
 rho.innerHTML = 'remove highest octave';
 rho.style.cursor = 'pointer';
 if (b == a) { rho.disabled = true; rho.style.cursor = 'not-allowed'; }

 var panel = document.createElement('div');
 panel.appendChild(lob);
 panel.appendChild(rr);
 panel.appendChild(rlo);
 panel.appendChild(rho);
 panel.id = 'octavesPanel';
 panel.style.display = 'none';
 panel.style.position = 'absolute';
 panel.style.border = 'thick groove lightgray';
 panel.style.borderRadius = '0.5em';
 panel.style.padding = '0.5em';
 panel.style.background = '#f7f7f7';
 panel.style.zIndex = '10';
 panel.setAttribute('onmouseleave','this.style.display="none";');
 panel.setAttribute('onclick','this.style.display="none";markQWE();');

 return panel;
}

function popupbutton()
{
 var button = document.createElement('button');
 button.id = 'popupguzik';
 button.className = 'przycisk';
 button.innerHTML = 'popup window';
 button.setAttribute('onclick','openpopup();');
 return button;
}

function openpopup()
{
 galog( 'popup', 'popup');

 var html = pianokeyboardpanel.innerHTML;
 html = '<div id="pianokeyboardpanel">'+html+'</div>';
 var width = pianokeyboardpanel.clientWidth + 16;
 var height = pianokeyboardpanel.clientHeight + 64;
 
 var keys = "<script>document.body.onkeydown = keydown; document.body.onkeyup = keyup;</scr"+"ipt>";
 var octsel = "<script>octaveselector.selectedIndex="+octaveselector.selectedIndex+";</scr"+"ipt>";
 var melo = "<script>melochords.selectedIndex="+melochords.selectedIndex+";</scr"+"ipt>"; 
 var adv = '<div id="advanced" style="display:none">' + advanced.innerHTML + '</div>';
 var sus = "<script>susbox.checked="+((susbox.checked)?"true":"false")+";</scr"+"ipt>";
 var preload = '<script>piano7loadall();</scr'+'ipt>';
 if (!savebutton.disabled)
 {
  adv = '<div id="advanced">' + advanced.innerHTML + '</div>';
  height += advanced.clientHeight;
  adv += '<script>advancedbox.checked=true;</scr'+'ipt>';
 }
 var head = document.head.innerHTML + '\n\n<script>g_instrument = "PopupPiano";</sc'+'ript>';
 var sendpageview = "ga('send', 'pageview');";
 var setpage = "ga('set', 'page', location.pathname);";
 head = head.replace(sendpageview, setpage+sendpageview);
 
 var doc = "<!DOCTYPE html><html>";
 doc += "<head><title>PIANO</title>"+head+"</head>\n\n<body style='margin-bottom:2em'>"+keys+html+octsel+melo+adv+sus+preload+"</body></html>";
 var popup = window.open('','','width='+width+',height='+height);
 popup.document.write(doc);
}

function playsfromga()
{
 var i = octaveselector.selectedIndex + 1;
 var label = 'C'+i+'-C'+(i+2);
 galog( 'Plays-from', label);
}
function meloga()
{
 var label, i = melochords.selectedIndex;
 switch(i)
 {
  case 0 : label = 'single'; break;
  case 1 : label = 'major'; break;
  case 2 : label = 'minor'; break;
  default: label = ''; 
 }
 galog( 'Melochords', label);
}

function sustainbox()
{
 var ss = document.createElement('input'); ss.id = 'susbox';
 ss.setAttribute("type", "checkbox");
 ss.checked = true; ss.setAttribute('checked','checked');
 ss.setAttribute('onchange','galog("sustain","sustain");');
 var aa = document.createElement('fieldset');
 aa.appendChild(ss);
 aa.innerHTML += 'sustain';
 aa.style.padding = '0'; aa.style.margin = '0'; aa.style.border = 'none';
 aa.style.display = 'inline';
 return aa;
}

function panel(a,b)
{
 document.head.appendChild(buttonpianostyle());
 document.body.onkeydown = keydown;
 document.body.onkeyup = keyup;
 var div = document.createElement('div');
 div.id = 'pianokeyboardpanel';
 
 var se = document.createElement('select');
 se.id = 'octaveselector';
 se.style.margin = '0.5em';
 for (var i=1; i<=6; i++)
 {
  var opt = document.createElement('option');
  opt.text = 'computer keyboard plays from ' + 'C'+i+' to C'+(i+2);
  se.add(opt);
 }
 se.selectedIndex = (a<=3 && b>=4) ? 2 : a-1;
 se.setAttribute('onchange','markQWE();playsfromga();piano7loadall();');

 var melo = document.createElement('select');
 melo.id = 'melochords';
 melo.style.margin = '0.5em';
 var opt = document.createElement('option');
 opt.text = 'single notes';
 melo.add(opt);
 opt = document.createElement('option');
 opt.text = 'major chords';
 melo.add(opt);
 opt = document.createElement('option');
 opt.text = 'minor chords';
 melo.add(opt);
 melo.setAttribute('onchange','meloga();');
 
 var octavesbutton = document.createElement('button');
 octavesbutton.id = 'octavesbutton';
 octavesbutton.className = 'przycisk';
 octavesbutton.innerHTML = 'octaves';
 octavesbutton.setAttribute('onclick','octavesPanel.style.display="block";');

 var spot = document.createElement('div');
 spot.id = 'keyboardspot';
 spot.style.clear = 'both';
 spot.style.marginTop = '0.5em';
 spot.appendChild(klawiatura(a,b));
 
 var reklama = document.createElement('div');
 reklama.id = 'podreklama';

 var box = document.createElement('input');
 box.id = 'advancedbox';
 box.checked = false;
 box.setAttribute("type", "checkbox");
 box.setAttribute('onclick','advanced.style.display=(this.checked)?"block":"none";');
 var advbox = document.createElement('span');
 advbox.id = 'advbox';
 advbox.appendChild(box);
 advbox.innerHTML += 'advanced';
 advbox.style.whiteSpace = 'nowrap';
 
 div.appendChild(octavespanel(a,b));
 div.appendChild(octavesbutton);
 div.appendChild(se);
 div.appendChild(melo);
 div.appendChild(sustainbox());
 div.appendChild(advbox);
 div.appendChild(donate());  
 div.appendChild(spot);
 div.appendChild(reklama);
 //div.appendChild(advancedpanel(a,b));
  
 applynoselect(div);
 return div;
} 

function advancedpanel(a,b)
{

 var chordpanel = document.createElement('fieldset');
 chordpanel.style.display = 'inline-block';
 chordpanel.style.border = 'none';
 chordpanel.style.margin = '0.5em';
 chordpanel.style.padding = '0';
 var rechord = document.createElement('input');
 rechord.type = 'checkbox';
 rechord.id = 'rechord';
 rechord.setAttribute('onchange','rechordonchange();');
 chordpanel.appendChild(rechord);
 var CHORD = document.createElement('span');
 CHORD.id = 'CHORDtext';
 CHORD.innerHTML = 'CHORD';
 chordpanel.appendChild(CHORD);
 
 var memorybuttons = document.createElement('div');
 memorybuttons.id = 'memorybuttons';
 memorybuttons.style.marginTop = '0.5em';
 memorybuttons.style.position = 'relative';
 memorybuttons.style.resize = 'both';
 memorybuttons.style.overflow = 'auto';
 memorybuttons.style.border = '1px dotted darkgray';
 memorybuttons.style.minHeight = '7em';
 memorybuttons.innerHTML = 'tick the CHORD and RECORD checkboxes on and off<br>to create chord buttons and playback buttons here';
 memorybuttons.setAttribute('ondrop',"drop(event)");
 memorybuttons.setAttribute('ondragover',"allowDrop(event)");
 memorybuttons.setAttribute('ontouchstart','preventZoom(event);');
 memorybuttons.setAttribute('ontouchmove', 'event.preventDefault();'); 

 var recordedsounds = document.createElement('textarea');
 recordedsounds.id = 'recordedsounds';
 recordedsounds.style.display = 'none';

 var advbuttons = document.createElement('div');
 advbuttons.style.textAlign = 'center';
 advbuttons.appendChild(chordpanel);
 advbuttons.appendChild(recordpanel());
 advbuttons.appendChild(savechordsform());
 advbuttons.appendChild(loadchordsbutton()); 
 advbuttons.appendChild(popupbutton());

 var adv = document.createElement('div');
 adv.id = 'advanced';
 adv.style.display = 'none';
 adv.appendChild(advbuttons);
 adv.appendChild(memorybuttons);
 adv.appendChild(recordedsounds);
 applynoselect(adv);
 return adv; 
}

function triggerbutton(button,onaction)
{
 var obaton = document.createElement('div');
 obaton.appendChild(button.cloneNode());
 var buttonhtml = obaton.innerHTML;
 var rex = new RegExp(onaction+'="[^"]+');
 var r = rex.exec(buttonhtml)[0];
 r = r.substr(onaction.length+2);
 r = r.replace(/&quot;/g,'"');
 r = r.replace('-click','-keypress');
 eval(r);
}

function userkeydownup(k,downup)
{
 var keysensors = document.querySelectorAll(".ks");
 if (keysensors.length == 0) return true;
 for (var i=0; i<keysensors.length; i++)
 {
  var keysensor = keysensors[i];
  if (''+k == keysensor.name.substr(1))
  {
   var buttonid = keysensor.id.replace('keysensor','button');
   var button = document.getElementById(buttonid);
   var onaction = (downup == 'down') ? 'onmousedown' : 'onmouseup';
   triggerbutton(button,onaction);
   return false;
  }
 }
 return true;
}

function keydown(e)
{
 if (e.repeat == true) return 0;
 if (document.activeElement.nodeName == 'TEXTAREA') return;
 if (document.activeElement.nodeName == 'INPUT')
 {
  if (document.activeElement.type != 'checkbox') return;
  document.activeElement.blur();
 }

 e = e || event;
 //document.title = e.keyCode;
 var k = e.keyCode;
 if (!userkeydownup(k,'down')) return false;
 
 gakeypress(k);
 
 if (k==9)  { press(1); return false; } //tab
 if (k==49) press(2); //1
 if (k==81) press(3); //q
 if (k==50) press(4); //2
 if (k==87) press(5); //w
 if (k==69) press(6); //e
 if (k==52) press(7); //4
 if (k==82) press(8); //r
 if (k==53) press(9); //5
 if (k==84) press(10); //t
 if (k==54) press(11); //6
 if (k==89) press(12); //y
 if (k==85) press(13); //u
 if (k==56) press(14); //8
 if (k==73) press(15); //i
 if (k==57) press(16); //9
 if (k==79) press(17); //o
 if (k==80) press(18); //p
 if (k==189 || k==173) press(19); //-
 if (k==219) press(20); //[
 if (k==187 || k==61) press(21); //=
 if (k==221) press(22); //]
 if (k==8) { press(23); return false; } //backspace
 if (k==13 || k==46) press(25); //enter
 if (k==220) press(24); //\

 if (k==20) { press(1); press(5); press(8); press(13); } //caps
 if (k==65) { press(3); press(6); press(10); press(15); } //a
 if (k==83) { press(5); press(8); press(12); press(17); } //s
 if (k==68) { press(6); press(10); press(13); press(18); } //d
 if (k==70) { press(8); press(12); press(15); press(20); } //f
 if (k==71) { press(10); press(13); press(17); press(22); } //g
 if (k==72) { press(12); press(15); press(20); press(24); } //h
 if (k==74) { press(13); press(17); press(20); press(25); } //j
 if (k==75) { press(15); press(18); press(22); press(27); } //k
 if (k==76) { press(17); press(20); press(24); press(29); } //l
 if (k==186 || k==59) { press(18); press(22); press(25); press(30); } //; colon
 if (k==222) { press(20); press(24); press(27); press(32); return false; } //' quote to prevent quickfind in firefox
 
 if (k==16 || k==226) { press(1); press(5); press(8); press(12); } //shift
 if (k==90) { press(3); press(6); press(10); press(13); } //z
 if (k==88) { press(5); press(8); press(12); press(15); } //x
 if (k==67) { press(6); press(10); press(13); press(17); } //c
 if (k==86) { press(8); press(12); press(15); press(18); } //v
 if (k==66) { press(10); press(13); press(17); press(20); } //b
 if (k==78) { press(12); press(15); press(18); press(22); } //n
 if (k==77) { press(13); press(17); press(20); press(24); } //m
 if (k==188) { press(15); press(18); press(22); press(25); } //, comma
 if (k==190) { press(17); press(20); press(24); press(27); } //. period
 if (k==191) { press(18); press(22); press(25); press(29); return false; } // / slash to prevent quickfind in firefox
}

function keyup(e)
{
 if (document.activeElement.nodeName == 'TEXTAREA') return;
 if (document.activeElement.nodeName == 'INPUT')
 {
  if (document.activeElement.type != 'checkbox') return;
  document.activeElement.blur();  
 }

 e = e || event;
 //document.title = e.keyCode;
 var k = e.keyCode;
  if (!userkeydownup(k,'up')) return false;
 if (k==9)  { unpress(1); return false; } //tab
 if (k==49) unpress(2); //1
 if (k==81) unpress(3); //q
 if (k==50) unpress(4); //2
 if (k==87) unpress(5); //w
 if (k==69) unpress(6); //e
 if (k==52) unpress(7); //4
 if (k==82) unpress(8); //r
 if (k==53) unpress(9); //5
 if (k==84) unpress(10); //t
 if (k==54) unpress(11); //6
 if (k==89) unpress(12); //y
 if (k==85) unpress(13); //u
 if (k==56) unpress(14); //8
 if (k==73) unpress(15); //i
 if (k==57) unpress(16); //9
 if (k==79) unpress(17); //o
 if (k==80) unpress(18); //p
 if (k==189 || k==173) unpress(19); //-
 if (k==219) unpress(20); //[
 if (k==187 || k==61) unpress(21); //=
 if (k==221) unpress(22); //]
 if (k==8) { unpress(23); return false; } //backspace
 if (k==13 || k==46) unpress(25); //enter
 if (k==220) unpress(24); //\

 if (k==20) { unpress(1); unpress(5); unpress(8); unpress(13); } //caps
 if (k==65) { unpress(3); unpress(6); unpress(10); unpress(15); } //a
 if (k==83) { unpress(5); unpress(8); unpress(12); unpress(17); } //s
 if (k==68) { unpress(6); unpress(10); unpress(13); unpress(18); } //d
 if (k==70) { unpress(8); unpress(12); unpress(15); unpress(20); } //f
 if (k==71) { unpress(10); unpress(13); unpress(17); unpress(22); } //g
 if (k==72) { unpress(12); unpress(15); unpress(20); unpress(24); } //h
 if (k==74) { unpress(13); unpress(17); unpress(20); unpress(25); } //j
 if (k==75) { unpress(15); unpress(18); unpress(22); unpress(27); } //k
 if (k==76) { unpress(17); unpress(20); unpress(24); unpress(29); } //l
 if (k==186 || k==59) { unpress(18); unpress(22); unpress(25); unpress(30); } //; colon
 if (k==222) { unpress(20); unpress(24); unpress(27); unpress(32); } //' quote

 if (k==16 || k==226) { unpress(1); unpress(5); unpress(8); unpress(12); } //shift
 if (k==90) { unpress(3); unpress(6); unpress(10); unpress(13); } //z
 if (k==88) { unpress(5); unpress(8); unpress(12); unpress(15); } //x
 if (k==67) { unpress(6); unpress(10); unpress(13); unpress(17); } //c
 if (k==86) { unpress(8); unpress(12); unpress(15); unpress(18); } //v
 if (k==66) { unpress(10); unpress(13); unpress(17); unpress(20); } //b
 if (k==78) { unpress(12); unpress(15); unpress(18); unpress(22); } //n
 if (k==77) { unpress(13); unpress(17); unpress(20); unpress(24); } //m
 if (k==188) { unpress(15); unpress(18); unpress(22); unpress(25); } //, comma
 if (k==190) { unpress(17); unpress(20); unpress(24); unpress(27); } //. period
 if (k==191) { unpress(18); unpress(22); unpress(25); unpress(29); return false; } // / slash to prevent quickfind in firefox
}

var keyCodes = {
  3 : "break",
  8 : "backspace",
  9 : "tab",
  12 : 'clear',
  13 : "enter",
  16 : "shift",
  17 : "ctrl",
  18 : "alt",
  19 : "pause/break",
  20 : "caps lock",
  27 : "escape",
  32 : "spacebar",
  33 : "page up",
  34 : "page down",
  35 : "end",
  36 : "home",
  37 : "left arrow",
  38 : "up arrow",
  39 : "right arrow",
  40 : "down arrow",
  41 : "select",
  42 : "print",
  43 : "execute",
  44 : "Print Screen",
  45 : "insert",
  46 : "delete",
  48 : "0",
  49 : "1",
  50 : "2",
  51 : "3",
  52 : "4",
  53 : "5",
  54 : "6",
  55 : "7",
  56 : "8",
  57 : "9",
  58 : ":",
  59 : "semicolon (firefox), equals",
  60 : "<",
  61 : "equals (firefox)",
  63 : "ÃŸ",
  64 : "@ (firefox)",
  65 : "a",
  66 : "b",
  67 : "c",
  68 : "d",
  69 : "e",
  70 : "f",
  71 : "g",
  72 : "h",
  73 : "i",
  74 : "j",
  75 : "k",
  76 : "l",
  77 : "m",
  78 : "n",
  79 : "o",
  80 : "p",
  81 : "q",
  82 : "r",
  83 : "s",
  84 : "t",
  85 : "u",
  86 : "v",
  87 : "w",
  88 : "x",
  89 : "y",
  90 : "z",
  91 : "Windows Key / Left ? / Chromebook Search key",
  92 : "right window key ",
  93 : "Windows Menu / Right ?",
  96 : "numpad 0",
  97 : "numpad 1",
  98 : "numpad 2",
  99 : "numpad 3",
  100 : "numpad 4",
  101 : "numpad 5",
  102 : "numpad 6",
  103 : "numpad 7",
  104 : "numpad 8",
  105 : "numpad 9",
  106 : "multiply",
  107 : "add",
  108 : "numpad period (firefox)",
  109 : "subtract ",
  110 : "decimal point",
  111 : "divide ",
  112 : "F1",
  113 : "F2",
  114 : "F3",
  115 : "F4",
  116 : "F5",
  117 : "F6",
  118 : "F7",
  119 : "F8",
  120 : "F9",
  121 : "F10",
  122 : "F11",
  123 : "F12",
  124 : "F13",
  125 : "F14",
  126 : "F15",
  127 : "F16",
  128 : "F17",
  129 : "F18",
  130 : "F19",
  131 : "F20",
  132 : "F21",
  133 : "F22",
  134 : "F23",
  135 : "F24",
  144 : "num lock",
  145 : "scroll lock",
  160 : "^",
  161: '!',
  163 : "#",
  164: '$',
  165: 'u',
  166 : "page backward",
  167 : "page forward",
  169 : "closing paren (AZERTY)",
  170: '*',
  171 : "~ + * key",
  173 : "minus (firefox), mute/unmute",
  174 : "decrease volume level",
  175 : "increase volume level",
  176 : "next",
  177 : "previous",
  178 : "stop",
  179 : "play/pause",
  180 : "e-mail",
  181 : "mute/unmute (firefox)",
  182 : "decrease volume level (firefox)",
  183 : "increase volume level (firefox)",
  186 : "semi-colon",
  187 : "equal sign",
  188 : "comma",
  189 : "dash",
  190 : "period",
  191 : "forward slash",
  192 : "grave accent",
  193 : "?, / or Â°",
  194 : "numpad period (chrome)",
  219 : "open bracket",
  220 : "back slash",
  221 : "close bracket",
  222 : "single quote",
  223 : "`",
  224 : "left or right ? key (firefox)",
  225 : "altgr",
  226 : "><|",
  230 : "GNOME Compose Key",
  231 : "Ã§",
  233 : "XF86Forward",
  234 : "XF86Back",
  255 : "toggle touchpad"
};


function savechordsform()
{
 var form = document.createElement('form');
 form.action = 'download.php';
 form.method = 'post';
 form.target = '_blank';
 form.style.display = 'inline-block';
 var txt = document.createElement('textarea');
 txt.id = 'chordstextarea';
 txt.name = 'outputarea';
 txt.style.display = 'none';
 form.appendChild(txt);
 var button = document.createElement('button');
 button.id = 'savebutton';
 button.className = 'przycisk';
 button.innerHTML = 'save';
 button.disabled = true;
 button.setAttribute('onclick','galog("save","save");document.getElementById("chordstextarea").value=document.getElementById("memorybuttons").innerHTML;return true;');
 form.appendChild(button);
 return form;
}

function loadchordsbutton()
{
 var loadspan = document.createElement('span');
 loadspan.id = 'loadtext';
 loadspan.innerHTML = 'load';
 var labaton = document.createElement('label');
 labaton.for = 'loadchordsinput';
 labaton.appendChild(loadspan);
 labaton.className = 'przycisk';
 var load = document.createElement('input');
 load.id = 'loadchordsinput';
 load.type = 'file';
 load.size = '1';
 load.style.display = 'none';
 load.addEventListener('change', readChordsFile, false);
 labaton.appendChild(load);
 return labaton;
}
function readChordsFile(evt)
{
 var f = evt.target.files[0]; 
 if (f)
 {
  var r = new FileReader();
  r.onload = function(e){document.getElementById('memorybuttons').innerHTML = e.target.result;logload();}
  r.readAsText(f);
 }
 else {alert("Failed to load file");}
}

function logload()
{
 galog("load","load"); 
}










function allowDrop(ev) { ev.preventDefault(); }
function drag(ev)
{
 ev.dataTransfer.setData("text", ev.target.id);
}
function drop(ev)
{
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var co = document.getElementById(data);
    var viewportOffset = memorybuttons.getBoundingClientRect();
    var top = viewportOffset.top;
    var left = viewportOffset.left;
    var width = co.clientWidth;
    var height = co.clientHeight;
    co.style.position = 'absolute';
    co.style.left = ev.clientX - width/2 - left + 'px';
    co.style.top = ev.clientY - height/2 - top + 'px';

 var a = co.id;    
 a = a.substr(0,a.length-7);
 if (a.charAt(a.length-1)=='c') // chord button
 {
  a = document.getElementById(a+'button');
  triggerbutton(a,'mouseup');
 }

 gadrop();
}

var iledrop = 0;

function gadrop()
{
 if (threshold(++iledrop)) galog( 'Dragdrop', 'dragdrop-'+iledrop );
}

var singlenote = 0;
var Arow = 0;
var Zrow = 0;

function gakeypress(k)
{ 
 if ((k==9) || (k==49) || (k==81) || (k==50) || (k==87) || (k==69) || (k==52) || (k==82) || (k==53) || (k==84) || (k==54) || (k==89) || (k==85) || (k==56) || (k==73)
 || (k==57) || (k==79) || (k==80) || (k==189 || k==173) || (k==219) || (k==187 || k==61) || (k==221) || (k==8) || (k==13) || (k==220))
 {
  if (threshold(++singlenote)) galog( 'Keypress', 'keypress-single-'+singlenote );
  return;
 }

 if ((k==20) || (k==65) || (k==83) || (k==68) || (k==70) || (k==71) || (k==72) || (k==74) || (k==75) || (k==76) || (k==186 || k==59) || (k==222))
 {
  if (threshold(++Arow)) galog( 'Keypress', 'keypress-Arow-'+Arow);
  return;
 }
 
 if ((k==16 || k==226) || (k==90) || (k==88) || (k==67) || (k==86) || (k==66) || (k==78) || (k==77) || (k==188) || (k==190) || (k==191))
 {
  if (threshold(++Zrow)) galog( 'Keypress', 'keypress-Zrow-'+Zrow);
  return;
 } 
}

var g_touchscreen = false;
function touchdevice()
{
 //if (touchscreen) return;
 g_touchscreen = true;
 octaveselector.style.display = 'none';
 for (var i=21; i<=109; i++)
 {
  var key = document.getElementById('klawisz'+i);
  if (key)
  {
   key.setAttribute('onmousedown','');
   key.setAttribute('onmouseup','');
  }  
 }
}

function preventZoom(e) {
  var t2 = e.timeStamp;
  var t1 = e.currentTarget.dataset.lastTouch || t2;
  var dt = t2 - t1;
  var fingers = e.touches.length;
  e.currentTarget.dataset.lastTouch = t2;
  if (!dt || dt > 500 || fingers > 1) return; // not double-tap
  e.preventDefault();
  //e.target.click();
}

function applynoselect(element)
{
 var aaa = document.getElementById('noselectstyle');
 if (!aaa)
 {
  var style = document.createElement('style');
  style.id = 'noselectstyle';
  var text = '.noselect { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }';
  style.appendChild(document.createTextNode(text));
  document.head.appendChild(style);
 } 
 var all = element.getElementsByTagName("*");
 for (var i=0; i<all.length; i++)
 {
  if (all[i].nodeName != 'SUB')
  {
   all[i].style.userSelect="none";
   all[i].classList.add("noselect");
  }
 }
}

function flashmemorybuttons()
{
 memorybuttons.style.transform = 'translateY(6px)';
 setTimeout("memorybuttons.style.transform = 'none';",300);
}

function settingsicon(size,black,white)
{
 size = size||16; white = white||'white'; black = black||'black';
 function svgelement(tag) { return document.createElementNS("http://www.w3.org/2000/svg",tag); }
 var svg = svgelement('svg');
 svg.setAttribute('width', size); svg.setAttribute('height', size);
 svg.setAttribute('viewBox', '-50 -50 101 101');
 var c = svgelement('circle'); svg.appendChild(c); 
 c.setAttribute('r',50); c.setAttribute('fill',black);
 var c = svgelement('circle'); svg.appendChild(c);
 c.setAttribute('r',25); c.setAttribute('fill',white);
 for (var n=0; n<8; n++)
 {
  var x = n*Math.PI/4;
  var c = svgelement('circle'); svg.appendChild(c);
  c.setAttribute('cx',(50*Math.cos(x)).toFixed(5)); c.setAttribute('cy',(50*Math.sin(x)).toFixed(5));
  c.setAttribute('r',10); c.setAttribute('fill',white);
 }
 return svg;
}

function markQWE()
{
 function kiki(svg)
 { var div = document.createElement('div'); div.className = 'kiki'; div.innerHTML = svg;
   div.style.position = 'absolute'; div.style.top = '2%'; return div;
 }
 function k(n) { return document.getElementById('klawisz'+n); }
 for (var n=24; n <= 108; n++) { var kk = k(n); if (kk) { var ki = kk.querySelector('.kiki'); if (ki) kk.removeChild(ki); } }
 var Q = octaveselector.selectedIndex*12+24+2;
 var ks = [k(Q-2),k(Q),k(Q+2),k(Q+3),k(Q+5),k(Q+7),k(Q+9),k(Q+10),k(Q+12),k(Q+14),k(Q+15),k(Q+17),k(Q+19),k(Q+21),k(Q+22)];
 var svgs = [];
 svgs.push("<svg width='100%' height='100%' viewBox='0 0 50 16'><text x='12' y='13' fill='black'>&#x21B9;</text></svg>");
 svgs.push("<svg width='100%' height='100%' viewBox='0 0 50 16'><text x='19' y='13' fill='black'>Q</text></svg>");
 svgs.push("<svg width='100%' height='100%' viewBox='0 0 50 16'><text x='26' y='13' fill='black'>W</text></svg>");
 svgs.push("<svg width='100%' height='100%' viewBox='0 0 50 16'><text x='10' y='13' fill='black'>E</text></svg>");
 svgs.push("<svg width='100%' height='100%' viewBox='0 0 50 16'><text x='16' y='13' fill='black'>R</text></svg>");
 svgs.push("<svg width='100%' height='100%' viewBox='0 0 50 16'><text x='24' y='13' fill='black'>T</text></svg>");
 svgs.push("<svg width='100%' height='100%' viewBox='0 0 50 16'><text x='31' y='13' fill='black'>Y</text></svg>");
 svgs.push("<svg width='100%' height='100%' viewBox='0 0 50 16'><text x='12' y='13' fill='black'>U</text></svg>");
 svgs.push("<svg width='100%' height='100%' viewBox='0 0 50 16'><text x='21' y='13' fill='black'>I</text></svg>");
 svgs.push("<svg width='100%' height='100%' viewBox='0 0 50 16'><text x='27' y='13' fill='black'>O</text></svg>");
 svgs.push("<svg width='100%' height='100%' viewBox='0 0 50 16'><text x='11' y='13' fill='black'>P</text></svg>");
 svgs.push("<svg width='100%' height='100%' viewBox='0 0 50 16'><text x='18' y='13' fill='black'>[</text></svg>");
 svgs.push("<svg width='100%' height='100%' viewBox='0 0 50 16'><text x='26' y='13' fill='black'>]</text></svg>");
 svgs.push("<svg width='100%' height='100%' viewBox='0 0 50 16'><text x='31' y='13' fill='black'>&bsol;</text></svg>");
 svgs.push("<svg width='100%' height='100%' viewBox='0 0 50 16'><text x='18' y='13' fill='black'>&#8617;</text></svg>");
 for (var i=0; i < svgs.length; i++) if (ks[i]) ks[i].appendChild(kiki(svgs[i]));
}
