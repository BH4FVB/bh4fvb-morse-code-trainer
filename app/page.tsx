"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const MORSE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "，": "--..--", "：": "---...", "?": "..--..", "？": "..--..", "‘": ".----.", "-": "-....-", "（": "-.--.", "）": "-.--.-", "/": "-..-.", "=": "-...-", "+": ".-.-.", "“": ".-..-.", "*": "-..-", "@": ".--.-.",
};
const PROSIGNS: Record<string, string> = { AR: ".-.-.", SK: "...-.-", KN: "-.--.", AS: ".-...", CL: "-.-..-.." };

const kochOrder = ["K", "M", "R", "S", "U", "A", "P", "T", "L", "O", "W", "I", ".", "N", "J", "E", "F", "0", "Y", ",", "V", "G", "/", "Q", "9", "Z", "H", "3", "8", "B", "?", "4", "2", "7", "C", "1", "D", "6", "X", "5"];
const kochPhases = ["阶段 01–10", "阶段 11–20", "阶段 21–30", "阶段 31–40"];

type Lesson = { id: number; phase: string; title: string; added: string[]; chars: string[] };
const lessons: Lesson[] = [{
  id: 1,
  phase: kochPhases[0],
  title: "从 K 与 M 开始",
  added: kochOrder.slice(0, 2),
  chars: kochOrder.slice(0, 2),
}];
kochOrder.slice(2).forEach((character, i) => {
  const id = i + 2;
  lessons.push({
    id,
    phase: kochPhases[Math.floor((id - 1) / 10)],
    title: `加入 ${character}`,
    added: [character],
    chars: kochOrder.slice(0, i + 3),
  });
});

const operatingSets = [
  ["CQ", "DE", "K", "KN", "AR", "SK", "CL", "AS", "R"],
  ["RST", "599", "579", "559", "339", "5NN"],
  ["GM", "GA", "GE", "OM", "YL", "NAME", "QTH"],
  ["UR", "MY", "FB", "TNX", "PSE", "AGN", "RPT", "HW", "BK"],
  ["73", "88", "TU", "GL", "HPE", "CUL", "WX", "RIG", "ANT", "PWR"],
];
const qCodeSets = [
  ["QRL", "QRM", "QRN", "QRG"],
  ["QRO", "QRP", "QRQ", "QRS"],
  ["QRT", "QRU", "QRV", "QRX"],
  ["QRZ", "QSB", "QSL", "QSO"],
  ["QSP", "QSY", "QTH", "QTR", "QSK", "QTC"],
];
const advancedMeaning: Record<string, string> = {
  CQ:"呼叫任何电台", DE:"这里是／来自", K:"请回答", KN:"仅指定台回答", AR:"报文结束", SK:"联络结束", CL:"关闭电台", AS:"请等待", R:"完全收妥",
  RST:"可辨度·强度·音调", "599":"最佳信号报告", "579":"清晰强信号", "559":"清晰中强信号", "339":"较难辨认弱信号", "5NN":"599 的竞赛简写",
  GM:"早上好", GA:"下午好", GE:"晚上好", OM:"男无线电爱好者", YL:"女无线电爱好者", NAME:"姓名", QTH:"电台位置", UR:"你的", MY:"我的", FB:"很好", TNX:"谢谢", PSE:"请", AGN:"再来一次", RPT:"重复", HW:"怎么样", BK:"插入／交还", "73":"致以良好祝愿", "88":"爱与亲吻", TU:"谢谢你", GL:"祝好运", HPE:"希望", CUL:"回头见", WX:"天气", RIG:"设备", ANT:"天线", PWR:"功率",
  QRL:"我正忙／频率忙吗", QRM:"受到人为干扰", QRN:"受到天电干扰", QRG:"准确频率", QRO:"增加功率", QRP:"降低功率", QRQ:"发快些", QRS:"发慢些", QRT:"停止发送", QRU:"没有消息", QRV:"准备好了", QRX:"请等待", QRZ:"谁在呼叫我", QSB:"信号衰落", QSL:"确认收妥", QSO:"进行通信", QSP:"转报", QSY:"改变频率", QTR:"准确时间", QSK:"可在字符间听收", QTC:"有报文待发",
};
let operatingLearned: string[] = [];
operatingSets.forEach((set, i) => { operatingLearned = [...operatingLearned, ...set]; lessons.push({ id: 41 + i, phase: "通联", title: ["呼叫与控制", "RST 信号报告", "基本寒暄", "抄收与重复", "结束与台站资料"][i], added: set, chars: [...operatingLearned] }); });
let qLearned: string[] = [];
qCodeSets.forEach((set, i) => { qLearned = [...qLearned, ...set]; lessons.push({ id: 46 + i, phase: "Q简语", title: ["频率与干扰", "功率与速度", "工作状态", "呼叫与确认", "转报与操作"][i], added: set, chars: [...qLearned] }); });

const labelOf = (c: string) => ({ "，": "逗号", "：": "冒号", "？": "问号", "‘": "撇号", "（": "左括号", "）": "右括号", "/": "斜杠", "=": "等号", "+": "加号", "“": "引号", "*": "乘号", "@": "艾特" }[c] || c);

export default function Home() {
  const [lessonId, setLessonId] = useState(1);
  const [phaseFilter, setPhaseFilter] = useState(kochPhases[0]);
  const [freeMode, setFreeMode] = useState(false);
  const [freeText, setFreeText] = useState("CQ CQ CQ DE BH4FVB K");
  const [viewportMode, setViewportMode] = useState<"desktop" | "mobile">("desktop");
  const [mobilePathOpen, setMobilePathOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);
  const [wpm, setWpm] = useState(20);
  const [effective, setEffective] = useState(10);
  const [frequency, setFrequency] = useState(600);
  const [groupSize, setGroupSize] = useState(5);
  const [looping, setLooping] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [sequence, setSequence] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<"idle" | "playing" | "paused" | "done">("idle");
  const [score, setScore] = useState<number | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const answerRef = useRef("");
  const timersRef = useRef<number[]>([]);
  const runRef = useRef(0);
  const posRef = useRef(0);
  const lesson = lessons.find(item => item.id === lessonId) || lessons[0];
  const isAdvanced = lessonId > 40;
  const unit = 1.2 / wpm;
  const farnsworth = Math.max(unit, 1.2 / effective);

  useEffect(() => {
    if (window.matchMedia("(max-width: 700px)").matches) setViewportMode("mobile");
    const raw = localStorage.getItem("cw-trainer-settings");
    if (raw) { try { const s = JSON.parse(raw); const savedLesson = s.lessonId || 1; const savedCourse = lessons.find(item => item.id === savedLesson) || lessons[0]; setWpm(s.wpm || 20); setEffective(s.effective || 10); setFrequency(s.frequency || 600); setGroupSize(s.groupSize || 5); setLessonId(savedCourse.id); setPhaseFilter(savedCourse.phase); } catch {} }
  }, []);
  useEffect(() => { localStorage.setItem("cw-trainer-settings", JSON.stringify({ wpm, effective, frequency, groupSize, lessonId })); }, [wpm, effective, frequency, groupSize, lessonId]);
  useEffect(() => () => stopAll(false), []);

  const newlyAdded = useMemo(() => new Set(lesson.added), [lesson]);
  function ctx() { if (!audioRef.current) audioRef.current = new AudioContext(); return audioRef.current; }
  function clearTimers() { timersRef.current.forEach(window.clearTimeout); timersRef.current = []; }
  function stopAll(update = true) { runRef.current++; clearTimers(); oscillatorsRef.current.forEach(o => { try { o.stop(); } catch {} }); oscillatorsRef.current = []; posRef.current = 0; if (update) { setLooping(null); setStatus("idle"); } }

  function scheduleTone(start: number, duration: number) {
    const ac = ctx(); const osc = ac.createOscillator(); const gain = ac.createGain();
    osc.type = "sine"; osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(0.18, start + 0.006); gain.gain.setValueAtTime(0.18, Math.max(start + 0.006, start + duration - 0.006)); gain.gain.linearRampToValueAtTime(0, start + duration);
    osc.connect(gain).connect(ac.destination); oscillatorsRef.current.push(osc); osc.start(start); osc.stop(start + duration + 0.01);
  }
  function playChar(char: string, startAt?: number) {
    const ac = ctx(); ac.resume(); let t = startAt ?? ac.currentTime + 0.05;
    [...MORSE[char]].forEach((symbol, i) => { const d = symbol === "." ? unit : 3 * unit; scheduleTone(t, d); t += d + (i < MORSE[char].length - 1 ? unit : 0); });
    return t;
  }
  function playToken(token: string, startAt?: number) {
    let t = startAt ?? ctx().currentTime + 0.05;
    if (PROSIGNS[token]) {
      [...PROSIGNS[token]].forEach((symbol, i) => { const d = symbol === "." ? unit : 3 * unit; scheduleTone(t, d); t += d + (i < PROSIGNS[token].length - 1 ? unit : 0); });
      return t;
    }
    [...token].forEach((char, i) => { t = playChar(char, t); if (i < token.length - 1) t += 3 * farnsworth; });
    return t;
  }
  function toggleLoop(char: string) {
    stopAll(); if (looping === char) return;
    const token = ++runRef.current; setLooping(char);
    const repeat = () => { if (runRef.current !== token) return; const end = playToken(char); const wait = Math.max(100, (end - ctx().currentTime + 3 * farnsworth) * 1000); timersRef.current.push(window.setTimeout(repeat, wait)); };
    repeat();
  }
  function makeSequence() { return Array.from({ length: 20 }, () => lesson.chars[Math.floor(Math.random() * lesson.chars.length)]); }
  function startDictation() { stopAll(); const seq = makeSequence(); setSequence(seq); setAnswer(""); answerRef.current = ""; setScore(null); setModal(true); setStatus("playing"); posRef.current = 0; window.setTimeout(() => playFrom(0, seq), 80); }
  function playFrom(startIndex: number, seq = sequence) {
    stopAll(false); const token = ++runRef.current; setStatus("playing"); let t = ctx().currentTime + 0.12;
    for (let i = startIndex; i < seq.length; i++) { posRef.current = i; t = playToken(seq[i], t); t += ((i + 1) % groupSize === 0 ? 7 : 3) * farnsworth; }
    const ms = Math.max(0, (t - ctx().currentTime) * 1000);
    timersRef.current.push(window.setTimeout(() => { if (runRef.current === token) { posRef.current = seq.length; setStatus("done"); finishScore(seq); } }, ms));
  }
  function pause() { if (status === "playing") { const at = posRef.current; stopAll(false); posRef.current = at; setStatus("paused"); } else if (status === "paused") { playFrom(posRef.current); } }
  function replay() { ctx().resume(); posRef.current = 0; playFrom(0); }
  function finishScore(seq = sequence) { const raw = answerRef.current.toUpperCase().trim(); const normalized = isAdvanced ? raw.split(/[\s,，]+/).filter(Boolean) : [...raw.replace(/[\s,]/g, "").replace(/\(/g, "（").replace(/\)/g, "）")]; let correct = 0; seq.forEach((c, i) => { if (normalized[i] === c) correct++; }); setScore(Math.round(correct / seq.length * 100)); }
  function closeModal() { stopAll(); setModal(false); }
  function normalizedFreeText() {
    return freeText.toUpperCase().replace(/,/g, "，").replace(/:/g, "：").replace(/\?/g, "？").replace(/'/g, "‘").replace(/\(/g, "（").replace(/\)/g, "）").replace(/"/g, "“");
  }
  function playFreeText() {
    stopAll(); const chars = [...normalizedFreeText()].filter(c => MORSE[c] || /\s/.test(c)); if (!chars.some(c => MORSE[c])) return;
    const token = ++runRef.current; setStatus("playing"); let t = ctx().currentTime + 0.12;
    chars.forEach(c => { if (/\s/.test(c)) t += 7 * farnsworth; else { t = playChar(c, t); t += 3 * farnsworth; } });
    timersRef.current.push(window.setTimeout(() => { if (runRef.current === token) setStatus("done"); }, Math.max(0, (t - ctx().currentTime) * 1000)));
  }

  return (
    <main className={viewportMode === "mobile" ? "mobilePreview" : "desktopPreview"}>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="BH4FVB电码练习器首页"><span className="brandMark">CW</span><span><b>BH4FVB电码练习器</b><small>BH4FVB Morse Code Trainer</small></span></a>
        <p className="credit">在 BH4FVB/JL1IXG 的领导下，由 Codex 完成</p>
      </header>
      <div className="viewportBar">
        <div className="viewportSwitch" aria-label="界面模式预览">
          <button className={viewportMode === "desktop" ? "active" : ""} onClick={() => setViewportMode("desktop")} aria-pressed={viewportMode === "desktop"}>桌面模式</button>
          <button className={viewportMode === "mobile" ? "active" : ""} onClick={() => setViewportMode("mobile")} aria-pressed={viewportMode === "mobile"}>手机模式</button>
        </div>
      </div>

      <div className="pageFlow">
      <section className="hero" id="top">
        <div className="heroIntro"><p className="eyebrow">{freeMode ? "FREE PLAY · 自由模式" : isAdvanced ? `ADVANCED ${String(lessonId - 40).padStart(2, "0")} / 10` : `COURSE ${String(lessonId).padStart(2, "0")} / 40`}</p><p className="intro">遵循经典 Koch 40 符号练习顺序，从 K 开始逐项加入核心字符。另有 10 节进阶训练与自由播放，建立听觉条件反射。</p></div>
        <div className="settingGrid heroSettings">
          <Slider label="字符速度" value={wpm} min={15} max={50} step={1} unit="WPM" note="点划本身的发送速度" onChange={setWpm}/>
          <Slider label="有效速度" value={effective} min={5} max={30} step={1} unit="WPM" note="控制字符与组之间的留白" onChange={setEffective}/>
          <Slider label="音调频率" value={frequency} min={400} max={900} step={50} unit="Hz" note="CW 音频的音高" onChange={setFrequency}/>
          <Slider label="每组字符" value={groupSize} min={5} max={20} step={5} unit="个" note="组末会有更长停顿" onChange={setGroupSize}/>
        </div>
      </section>

      <section className="workspace">
        <aside className={`lessonsPanel ${freeMode ? "freeActive" : ""} ${!mobilePathOpen ? "pathCollapsed" : ""}`}>
          <div className="sectionTitle pathTitle"><span>01</span><div><h2>课程路径</h2><p>循序解锁全部字符</p></div><button className="pathToggle" onClick={() => setMobilePathOpen(v => !v)} aria-expanded={mobilePathOpen}>{mobilePathOpen ? "收起课程 ▲" : `展开课程 · ${lesson.phase} ▼`}</button></div>
          <div className="modeSwitch"><button className={!isAdvanced && !freeMode ? "active" : ""} onClick={() => { stopAll(); setFreeMode(false); setLessonId(1); setPhaseFilter(kochPhases[0]); }}>基础课程</button><button className={isAdvanced && !freeMode ? "active" : ""} onClick={() => { stopAll(); setFreeMode(false); setLessonId(41); setPhaseFilter("通联"); }}>进阶训练</button><button className={freeMode ? "active" : ""} onClick={() => { stopAll(); setFreeMode(true); }}>自由模式</button></div>
          <div className="phaseTabs" aria-label="按阶段筛选课程">
            {(isAdvanced ? ["通联", "Q简语"] : kochPhases).map(phase =>
              <button key={phase} className={phaseFilter === phase ? "active" : ""} onClick={() => setPhaseFilter(phase)} aria-pressed={phaseFilter === phase}>{phase}</button>
            )}
          </div>
          <div className="lessonList">
            {lessons.filter(l => l.phase === phaseFilter).map(l => <button key={l.id} className={l.id === lessonId ? "selected" : ""} onClick={() => { stopAll(); setLessonId(l.id); if (viewportMode === "mobile") setMobilePathOpen(false); }}><span>{String(l.id).padStart(2, "0")}</span><div><b>{l.title}</b><small>{l.phase} · 共 {l.chars.length} 个字符</small></div><i>{l.id === lessonId ? "ON AIR" : "→"}</i></button>)}
          </div>
        </aside>

        <div className={`training ${freeMode ? "freeActive" : ""}`}>
          {freeMode && <div className="freePanel">
            <div className="sectionTitle"><span>02</span><div><h2>自由播放</h2><p>输入任意可用字符，转换为等幅电报码</p></div></div>
            <div className="freeEditor">
              <div className="freeEditorHead"><span>发送内容</span><small>{[...normalizedFreeText()].filter(c => MORSE[c]).length} 个有效字符</small></div>
              <textarea value={freeText} onChange={e => setFreeText(e.target.value)} placeholder="输入 A–Z、0–9 或常用标点……" spellCheck={false}/>
              <div className="freePreview">{[...normalizedFreeText()].map((c, i) => MORSE[c] ? <span key={i}><b>{c}</b><small>{MORSE[c].replace(/\./g,"•").replace(/-/g,"—")}</small></span> : /\s/.test(c) ? <i key={i}/> : null)}</div>
            </div>
            <div className="freeControls"><button className="primary" onClick={playFreeText} disabled={![...normalizedFreeText()].some(c => MORSE[c])}>{status === "playing" ? "从头播放" : "播放电码"} <span>▶</span></button><button className="stopLoop" onClick={() => stopAll()} disabled={status !== "playing"}><span>■</span> 停止播放</button></div>
            <p className="freeNote">空格会产生词间停顿；中文及其他不支持的字符将自动跳过。</p>
          </div>}
          <div className="sectionTitle"><span>02</span><div><h2>条件反射</h2><p>点击字符，反复听到熟悉为止</p></div></div>
          <div className="courseHead"><div><span className="phasePill">{lesson.phase}阶段</span><h3>{isAdvanced ? `进阶 ${lesson.id - 40}` : `第 ${lesson.id} 课`} · {lesson.title}</h3><p>本课新增 <b>{lesson.added.map(labelOf).join("、")}</b>，复习此前所有{isAdvanced ? "组合" : "字符"}。</p></div><div className="counter"><strong>{lesson.chars.length}</strong><span>已学{isAdvanced ? "组合" : "字符"}</span></div></div>
          <div className={`characterGrid ${isAdvanced ? "advancedGrid" : ""}`}>
            {lesson.chars.map(c => <button key={c} className={`${newlyAdded.has(c) ? "newChar" : ""} ${looping === c ? "playing" : ""} ${c.length > 1 ? "comboCard" : ""}`} onClick={() => toggleLoop(c)} aria-label={`播放 ${labelOf(c)}`} title={advancedMeaning[c]}><span className="char">{c}</span><span className="code">{c.length > 1 ? advancedMeaning[c] : MORSE[c].replace(/\./g,"•").replace(/-/g,"—")}</span>{newlyAdded.has(c) && <i>NEW</i>}<span className="soundIcon">{looping === c ? "■" : "▶"}</span></button>)}
          </div>
          <button className="stopLoop" onClick={() => stopAll()} disabled={!looping}><span>■</span> 停止循环</button>

          <div className="dictationCard">
            <div><span className="stepLabel">STEP 02</span><h3>20 {isAdvanced ? "组合" : "字符"}听写</h3><p>从已学{isAdvanced ? "组合" : "字符"}中随机抽取。准备好纸笔，或者直接在弹窗中输入。</p></div>
            <div className="miniStats"><span><b>20</b>{isAdvanced ? "组合" : "字符"}</span><span><b>{groupSize}</b>{isAdvanced ? "组合" : "字符"} / 组</span><span><b>{effective}</b>有效 WPM</span></div>
            <button className="primary" onClick={startDictation}>开始听写 <span>→</span></button>
          </div>
        </div>
      </section>
      </div>

      <section className="supportCard" aria-label="赞赏支持">
        <div><p className="eyebrow">SUPPORT · 73</p><p>如果练习器对你有所帮助，欢迎送来一份鼓励。非常感谢，美好的 73 送至您的身边。</p><button onClick={() => setDonateOpen(true)}>查看赞赏码 <span>→</span></button></div>
        <button className="tipThumb" onClick={() => setDonateOpen(true)} aria-label="放大赞赏码"><img src="bh4fvb-tip-code.jpg" alt="VladimirIS 的赞赏码" /></button>
      </section>
      <footer><span>BH4FVB电码练习器 · BH4FVB Morse Code Trainer · v0.9.0 Beta</span></footer>

      {donateOpen && <div className="tipModal" role="dialog" aria-modal="true" aria-label="赞赏码" onClick={() => setDonateOpen(false)}><div onClick={e => e.stopPropagation()}><button className="close" onClick={() => setDonateOpen(false)}>×</button><img src="bh4fvb-tip-code.jpg" alt="VladimirIS 的赞赏码：非常感谢，美好的73送至您的身边" /></div></div>}

      {modal && <div className="modalBackdrop" role="dialog" aria-modal="true" aria-label="听写练习">
        <div className="modal">
          <button className="close" onClick={closeModal}>×</button>
          <p className="eyebrow">DICTATION · LESSON {String(lessonId).padStart(2,"0")}</p>
          <h2>{status === "done" ? "本次抄收完成" : "保持专注，听声音写字符"}</h2>
          <div className={`radioDisplay ${status === "playing" ? "isPlaying" : ""}`}><span/><span/><span/><span/><span/></div>
          <div className="transport"><button onClick={pause} disabled={status === "done"}>{status === "paused" ? "▶ 继续播放" : "Ⅱ 暂停"}</button><button onClick={replay}>↻ 重新播放</button><button onClick={() => { stopAll(); setStatus("done"); finishScore(); }}>■ 停止并评分</button></div>
          <label className="answerLabel">输入听到的{isAdvanced ? "组合（空格分隔）" : "字符"} <span>{isAdvanced ? answer.trim().split(/\s+/).filter(Boolean).length : answer.replace(/\s/g,"").length} / 20</span></label>
          <textarea autoFocus value={answer} onChange={e => { setAnswer(e.target.value); answerRef.current = e.target.value; }} onBlur={() => status === "done" && finishScore()} placeholder={isAdvanced ? "例如：CQ DE 599 73……" : "在这里连续输入字符，空格会被忽略……"} />
          {status === "done" && <div className="result"><div className="scoreRing"><strong>{score ?? 0}<small>%</small></strong></div><div><span>正确答案</span><code>{sequence.map((c,i) => <b key={i}>{c}{isAdvanced || (i+1)%groupSize===0 ? " " : ""}</b>)}</code><p>{(score ?? 0) >= 80 ? "抄收稳定，可以继续保持。" : `再听几轮本课${isAdvanced ? "组合" : "字符"}，声音会越来越清晰。`}</p></div></div>}
        </div>
      </div>}
    </main>
  );
}

function Slider({ label, value, min, max, step, unit, note, onChange }: { label: string; value: number; min: number; max: number; step: number; unit: string; note: string; onChange: (n:number)=>void }) {
  const pct = (value-min)/(max-min)*100;
  return <div className="sliderCard"><div className="sliderTop"><div><h3>{label}</h3><p>{note}</p></div><output>{value}<small>{unit}</small></output></div><input type="range" min={min} max={max} step={step} value={value} style={{"--pct": `${pct}%`} as React.CSSProperties} onChange={e => onChange(Number(e.target.value))}/><div className="rangeLabels"><span>{min}</span><span>{max}</span></div></div>
}
