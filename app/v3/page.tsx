"use client";

import { useState, useEffect } from "react";

export default function HoraOS() {
  const [activeChart, setActiveChart] = useState("D1");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const gauges = [
    { label: "D1", value: 72, subtitle: "LAGNA CHART", color: "#FFB800" },
    { label: "D9", value: 58, subtitle: "NAVAMSHA", color: "#D35400" },
    { label: "D10", value: 84, subtitle: "DASHAMSHA", color: "#4A9EBF" },
  ];

  const planets = [
    { name: "Su", deg: "14°22'", sign: "Ari", house: "I", str: 82 },
    { name: "Mo", deg: "28°07'", sign: "Gem", house: "III", str: 67 },
    { name: "Ma", deg: "03°45'", sign: "Sco", house: "VIII", str: 91 },
    { name: "Ju", deg: "09°33'", sign: "Tau", house: "II", str: 88 },
    { name: "Ve", deg: "17°51'", sign: "Tau", house: "II", str: 74 },
    { name: "Sa", deg: "06°12'", sign: "Aqu", house: "XI", str: 79 },
    { name: "Me", deg: "22°18'", sign: "Pis", house: "XII", str: 45 },
    { name: "Ra", deg: "21°04'", sign: "Pis", house: "XII", str: 55 },
  ];

  const yogas = [
    { name: "Gajakesari", power: 94, color: "#FFD700" },
    { name: "Hamsa", power: 87, color: "#FFB800" },
    { name: "Budha-Aditya", power: 72, color: "#F39C12" },
    { name: "Vipareeta", power: 65, color: "#D35400" },
  ];

  const dashas = [
    { p: "Su", w: 8, c: "#FFB800", active: false },
    { p: "Mo", w: 12, c: "#C0C0C0", active: false },
    { p: "Ma", w: 7, c: "#D35400", active: true },
    { p: "Ra", w: 18, c: "#7B68EE", active: false },
    { p: "Ju", w: 16, c: "#FFD700", active: false },
    { p: "Sa", w: 19, c: "#4A9EBF", active: false },
    { p: "Me", w: 17, c: "#2ECC71", active: false },
    { p: "Ke", w: 7, c: "#9B59B6", active: false },
    { p: "Ve", w: 20, c: "#E74C3C", active: false },
  ];

  const Gauge = ({ label, value, subtitle, color }: { label: string; value: number; subtitle: string; color: string }) => {
    const r = 52, cx = 70, cy = 70;
    const startDeg = -210, totalDeg = 240;
    const fillDeg = (value / 100) * totalDeg;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const arc = (s: number, e: number) => {
      const sr = toRad(s), er = toRad(e);
      const x1 = cx + r * Math.cos(sr), y1 = cy + r * Math.sin(sr);
      const x2 = cx + r * Math.cos(er), y2 = cy + r * Math.sin(er);
      return `M ${x1} ${y1} A ${r} ${r} 0 ${e - s > 180 ? 1 : 0} 1 ${x2} ${y2}`;
    };
    const na = toRad(startDeg + fillDeg);
    const nx = cx + 44 * Math.cos(na), ny = cy + 44 * Math.sin(na);
    const isActive = activeChart === label;

    return (
      <div
        onClick={() => setActiveChart(label)}
        style={{
          cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "12px 8px", borderRadius: "14px",
          background: isActive ? "rgba(255,184,0,0.07)" : "rgba(255,255,255,0.02)",
          border: `1px solid ${isActive ? color + "55" : "rgba(255,255,255,0.06)"}`,
          transition: "all 0.3s",
          minWidth: "140px",
        }}
      >
        <svg width="140" height="140" viewBox="0 0 140 140">
          <defs>
            <filter id={`g${label}`}>
              <feGaussianBlur stdDeviation="2.5" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          {[60,48,36].map((rad,i) => (
            <circle key={i} cx={cx} cy={cy} r={rad} fill="none"
              stroke="rgba(255,255,255,0.04)" strokeWidth={i===0?"1.5":"0.5"}
              strokeDasharray={i===0?"3 3":"2 4"} />
          ))}
          <path d={arc(startDeg, startDeg + totalDeg)} fill="none"
            stroke="rgba(255,255,255,0.07)" strokeWidth="6" strokeLinecap="round"/>
          <path d={arc(startDeg, startDeg + fillDeg)} fill="none"
            stroke={color} strokeWidth="6" strokeLinecap="round"
            filter={`url(#g${label})`}/>
          <circle cx={cx} cy={cy} r={28} fill="rgba(12,14,26,0.9)"
            stroke={color} strokeWidth="0.5" strokeOpacity="0.4"/>
          <line x1={cx} y1={cy} x2={nx} y2={ny}
            stroke="#2ECC71" strokeWidth="2" strokeLinecap="round"
            filter={`url(#g${label})`}/>
          <circle cx={cx} cy={cy} r={3} fill="#2ECC71"/>
          <circle cx={cx} cy={cy} r={1.5} fill="white"/>
          <text x={cx} y={cy-4} textAnchor="middle" fill={color}
            fontSize="18" fontFamily="'Courier New',monospace" fontWeight="bold">{value}</text>
          <text x={cx} y={cy+10} textAnchor="middle" fill="rgba(255,255,255,0.3)"
            fontSize="6" fontFamily="'Courier New',monospace" letterSpacing="1.5">STR</text>
          {Array.from({length:11},(_,i)=>{
            const a = toRad(startDeg + (i/10)*totalDeg);
            const r1=56, r2=i%5===0?50:53;
            return <line key={i}
              x1={cx+r1*Math.cos(a)} y1={cy+r1*Math.sin(a)}
              x2={cx+r2*Math.cos(a)} y2={cy+r2*Math.sin(a)}
              stroke={i%5===0?color:"rgba(255,255,255,0.12)"}
              strokeWidth={i%5===0?1.5:0.75}/>;
          })}
        </svg>
        <div style={{color, fontSize:"12px", fontFamily:"'Courier New',monospace",
          letterSpacing:"4px", fontWeight:"bold", marginTop:"-6px"}}>{label}</div>
        <div style={{color:"rgba(255,255,255,0.25)", fontSize:"var(--type-label)",
          fontFamily:"'Courier New',monospace", letterSpacing:"1.5px", marginTop:"3px"}}>{subtitle}</div>
      </div>
    );
  };

  return (
    <div style={{
      width:"100%", minHeight:"100vh",
      display:"flex", fontFamily:"'Courier New',monospace", color:"white",
      position:"relative", overflow:"hidden",
    }}>
      <style>{`
        @keyframes twinkle{0%,100%{opacity:.2}50%{opacity:.9}}
        @keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}
        @keyframes goldPulse{0%,100%{box-shadow:0 0 6px rgba(255,184,0,.3)}50%{box-shadow:0 0 18px rgba(255,184,0,.7)}}
      `}</style>

      {/* Sidebar */}
      <div style={{
        width:"56px", minHeight:"100vh", background:"rgba(255,255,255,0.02)",
        borderRight:"1px solid rgba(255,184,0,.12)",
        display:"flex", flexDirection:"column", alignItems:"center",
        padding:"16px 0", gap:"6px", zIndex:10, flexShrink:0,
      }}>
        <div style={{marginBottom:"14px", animation:"goldPulse 3s ease-in-out infinite"}}>
          <svg width="36" height="36" viewBox="0 0 36 36">
            <defs>
              <radialGradient id="lg" cx="50%" cy="60%" r="60%">
                <stop offset="0%" stopColor="#FFD700"/>
                <stop offset="100%" stopColor="#D35400"/>
              </radialGradient>
            </defs>
            {Array.from({length:8},(_,i)=>{
              const a=(i/8)*Math.PI;
              return <line key={i}
                x1={18+9*Math.cos(a)} y1={18-9*Math.sin(a)}
                x2={18+13*Math.cos(a)} y2={18-13*Math.sin(a)}
                stroke="url(#lg)" strokeWidth="1.5" opacity=".7"/>;
            })}
            <circle cx="18" cy="18" r="6" fill="none" stroke="url(#lg)" strokeWidth="1"/>
            <text x="18" y="22" textAnchor="middle" fill="url(#lg)"
              fontSize="9" fontWeight="bold">H</text>
          </svg>
        </div>
        {["◉","⌖","⬡","⊕","✦"].map((icon,i)=>(
          <div key={i} style={{
            width:"36px", height:"36px", borderRadius:"9px",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"14px", cursor:"pointer",
            color: i===0?"#FFB800":"rgba(255,255,255,.22)",
            background: i===0?"rgba(255,184,0,.1)":"transparent",
            border: i===0?"1px solid rgba(255,184,0,.3)":"1px solid transparent",
          }}>{icon}</div>
        ))}
        <div style={{flex:1}}/>
        <div style={{
          width:"28px", height:"28px", borderRadius:"50%",
          background:"linear-gradient(135deg,#FFB800,#D35400)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:"var(--type-label)", fontWeight:"bold", color:"#0C0E1A",
        }}>MK</div>
      </div>

      {/* Main */}
      <div style={{flex:1, display:"flex", flexDirection:"column", zIndex:10, overflow:"hidden"}}>

        {/* Topbar */}
        <div style={{
          height:"48px", borderBottom:"1px solid rgba(255,184,0,.1)",
          display:"flex", alignItems:"center", padding:"0 16px", gap:"12px",
          background:"rgba(12,14,26,.85)", backdropFilter:"blur(10px)", flexShrink:0,
        }}>
          <span style={{color:"rgba(255,184,0,.7)", fontSize:"var(--type-mono)", letterSpacing:"3px", fontWeight:"bold"}}>HORA</span>
          <span style={{color:"rgba(255,255,255,.15)", fontSize:"var(--type-label)", letterSpacing:"2px"}}>// VEDIC INTELLIGENCE</span>
          <div style={{flex:1}}/>
          <div style={{
            flex:1, maxWidth:"420px", height:"24px",
            background:"rgba(255,255,255,.03)", borderRadius:"5px",
            border:"1px solid rgba(255,184,0,.12)",
            display:"flex", alignItems:"center", padding:"0 5px",
            gap:"2px", position:"relative", overflow:"hidden",
          }}>
            <div style={{
              position:"absolute", left:"38%", top:0, bottom:0, width:"1px",
              background:"rgba(255,184,0,.7)", boxShadow:"0 0 6px rgba(255,184,0,.8)",
            }}/>
            {dashas.map((d,i)=>(
              <div key={i} style={{
                flex:d.w, height:"14px", borderRadius:"3px",
                background: d.active?`${d.c}55`:`${d.c}14`,
                border: d.active?`1px solid ${d.c}70`:"none",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"var(--type-label)", color: d.active?d.c:`${d.c}55`,
                fontWeight: d.active?"bold":"normal",
              }}>{d.w>9?d.p:""}</div>
            ))}
          </div>
          <div style={{flex:1}}/>
          <div style={{textAlign:"right"}}>
            <div style={{color:"#FFB800", fontSize:"12px", letterSpacing:"1.5px"}}>
              {time.toLocaleTimeString("en-US",{hour12:false})}
            </div>
            <div style={{color:"rgba(255,255,255,.2)", fontSize:"var(--type-label)", letterSpacing:"1px"}}>
              {time.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}
            </div>
          </div>
          <div style={{
            padding:"3px 10px", borderRadius:"20px", fontSize:"var(--type-label)",
            background:"rgba(46,204,113,.1)", border:"1px solid rgba(46,204,113,.3)",
            color:"#2ECC71", letterSpacing:"2px",
            animation:"pulse 2s ease-in-out infinite",
          }}>● LIVE</div>
        </div>

        {/* Body */}
        <div style={{flex:1, display:"flex", overflow:"hidden"}}>

          {/* Left panel */}
          <div style={{
            width:"190px", borderRight:"1px solid rgba(255,184,0,.08)",
            padding:"14px 10px", display:"flex", flexDirection:"column",
            gap:"8px", overflowY:"auto", flexShrink:0,
          }}>
            <div style={{fontSize:"var(--type-label)", letterSpacing:"3px", color:"rgba(255,184,0,.5)",
              borderBottom:"1px solid rgba(255,184,0,.1)", paddingBottom:"7px"}}>
              PLANETARY POSITIONS
            </div>
            {planets.map(p=>(
              <div key={p.name} style={{
                display:"flex", alignItems:"center", gap:"7px",
                padding:"5px 7px", borderRadius:"7px",
                background:"rgba(255,255,255,.02)",
                border:"1px solid rgba(255,255,255,.04)",
              }}>
                <div style={{
                  width:"22px", height:"22px", borderRadius:"50%",
                  background:"rgba(255,184,0,.08)", border:"1px solid rgba(255,184,0,.2)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"var(--type-label)", color:"#FFB800", fontWeight:"bold", flexShrink:0,
                }}>{p.name}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex", justifyContent:"space-between", marginBottom:"3px"}}>
                    <span style={{fontSize:"var(--type-label)", color:"rgba(255,255,255,.65)"}}>{p.deg} {p.sign}</span>
                    <span style={{fontSize:"var(--type-label)", color:"rgba(255,184,0,.45)"}}>H{p.house}</span>
                  </div>
                  <div style={{height:"2px", background:"rgba(255,255,255,.05)", borderRadius:"2px"}}>
                    <div style={{
                      height:"100%", borderRadius:"2px", width:`${p.str}%`,
                      background: p.str>80?"#FFB800":p.str>60?"#2ECC71":"#D35400",
                      boxShadow:`0 0 4px ${p.str>80?"#FFB800":p.str>60?"#2ECC71":"#D35400"}50`,
                    }}/>
                  </div>
                </div>
              </div>
            ))}

            <div style={{
              marginTop:"6px", padding:"10px",
              background:"linear-gradient(135deg,rgba(211,84,0,.1),rgba(255,184,0,.05))",
              borderRadius:"9px", border:"1px solid rgba(211,84,0,.3)",
            }}>
              <div style={{fontSize:"var(--type-label)", letterSpacing:"2px", color:"rgba(255,184,0,.5)", marginBottom:"7px"}}>
                ACTIVE DASHA
              </div>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <div>
                  <div style={{color:"#D35400", fontSize:"16px", fontWeight:"bold"}}>Ma</div>
                  <div style={{color:"rgba(255,255,255,.25)", fontSize:"var(--type-label)"}}>MARS MAHADASHA</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{color:"#FFB800", fontSize:"var(--type-label)"}}>2yr 4mo</div>
                  <div style={{color:"rgba(255,255,255,.18)", fontSize:"var(--type-label)"}}>remaining</div>
                </div>
              </div>
              <div style={{marginTop:"7px", height:"2px", background:"rgba(255,255,255,.05)", borderRadius:"2px"}}>
                <div style={{
                  height:"100%", borderRadius:"2px", width:"62%",
                  background:"linear-gradient(90deg,#D35400,#FFB800)",
                  boxShadow:"0 0 8px rgba(211,84,0,.5)",
                }}/>
              </div>
            </div>
          </div>

          {/* Center */}
          <div style={{
            flex:1, padding:"16px", display:"flex",
            flexDirection:"column", gap:"14px", overflow:"hidden",
          }}>
            <div style={{display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap"}}>
              {gauges.map(g=><Gauge key={g.label} {...g}/>)}
            </div>

            <div style={{
              flex:1, padding:"14px", borderRadius:"11px",
              background:"rgba(255,255,255,.02)",
              border:"1px solid rgba(255,184,0,.09)",
            }}>
              <div style={{
                display:"flex", justifyContent:"space-between",
                alignItems:"center", marginBottom:"12px",
              }}>
                <div style={{color:"#FFB800", fontSize:"var(--type-label)", letterSpacing:"2px"}}>
                  {activeChart} // {activeChart==="D1"?"RASHI NATAL":activeChart==="D9"?"NAVAMSHA SOUL":"DASHAMSHA CAREER"}
                </div>
                <div style={{display:"flex", gap:"5px"}}>
                  {["HOUSES","ASPECTS","YOGAS"].map(t=>(
                    <div key={t} style={{
                      padding:"3px 8px", borderRadius:"20px", fontSize:"var(--type-label)",
                      letterSpacing:"1px", cursor:"pointer",
                      background:"rgba(255,184,0,.05)", border:"1px solid rgba(255,184,0,.13)",
                      color:"rgba(255,184,0,.5)",
                    }}>{t}</div>
                  ))}
                </div>
              </div>
              <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"6px"}}>
                {[
                  {h:"I",sign:"Ari",ps:["Su","As"]},
                  {h:"II",sign:"Tau",ps:["Ju","Ve"]},
                  {h:"III",sign:"Gem",ps:["Mo"]},
                  {h:"IV",sign:"Can",ps:[]},
                  {h:"V",sign:"Leo",ps:[]},
                  {h:"VI",sign:"Vir",ps:["Ke"]},
                  {h:"VII",sign:"Lib",ps:[]},
                  {h:"VIII",sign:"Sco",ps:["Ma"]},
                  {h:"IX",sign:"Sag",ps:[]},
                  {h:"X",sign:"Cap",ps:[]},
                  {h:"XI",sign:"Aqu",ps:["Sa"]},
                  {h:"XII",sign:"Pis",ps:["Me","Ra"]},
                ].map(hd=>(
                  <div key={hd.h} style={{
                    padding:"7px", borderRadius:"7px", minHeight:"52px",
                    background: hd.ps.length?"rgba(255,184,0,.04)":"rgba(255,255,255,.01)",
                    border: `1px solid ${hd.ps.length?"rgba(255,184,0,.13)":"rgba(255,255,255,.04)"}`,
                    position:"relative",
                  }}>
                    <div style={{
                      position:"absolute", top:"4px", right:"6px",
                      fontSize:"var(--type-label)", color:"rgba(255,255,255,.13)",
                    }}>{hd.h}</div>
                    <div style={{fontSize:"var(--type-label)", color:"rgba(255,184,0,.38)", marginBottom:"4px"}}>{hd.sign}</div>
                    <div style={{display:"flex", flexWrap:"wrap", gap:"2px"}}>
                      {hd.ps.map(pl=>(
                        <span key={pl} style={{
                          padding:"1px 4px", borderRadius:"3px", fontSize:"var(--type-label)",
                          background:"rgba(255,184,0,.14)", color:"#FFB800",
                          border:"1px solid rgba(255,184,0,.22)",
                        }}>{pl}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div style={{
            width:"175px", borderLeft:"1px solid rgba(255,184,0,.08)",
            padding:"14px 10px", display:"flex", flexDirection:"column",
            gap:"9px", flexShrink:0, overflowY:"auto",
          }}>
            <div style={{fontSize:"var(--type-label)", letterSpacing:"3px", color:"rgba(255,184,0,.5)",
              borderBottom:"1px solid rgba(255,184,0,.1)", paddingBottom:"7px"}}>
              ACTIVE YOGAS
            </div>
            {yogas.map(y=>(
              <div key={y.name} style={{
                padding:"9px", borderRadius:"7px",
                background:"rgba(255,255,255,.02)",
                border:`1px solid ${y.color}22`,
              }}>
                <div style={{display:"flex", justifyContent:"space-between", marginBottom:"3px"}}>
                  <div style={{fontSize:"var(--type-label)", color:"rgba(255,255,255,.7)", fontWeight:"bold"}}>{y.name}</div>
                  <div style={{fontSize:"var(--type-label)", color:y.color}}>{y.power}</div>
                </div>
                <div style={{height:"2px", background:"rgba(255,255,255,.05)", borderRadius:"2px"}}>
                  <div style={{
                    height:"100%", borderRadius:"2px", width:`${y.power}%`,
                    background:`linear-gradient(90deg,${y.color}70,${y.color})`,
                    boxShadow:`0 0 5px ${y.color}45`,
                  }}/>
                </div>
              </div>
            ))}

            <div style={{fontSize:"var(--type-label)", letterSpacing:"3px", color:"rgba(255,184,0,.5)",
              borderBottom:"1px solid rgba(255,184,0,.1)", paddingBottom:"7px", marginTop:"6px"}}>
              TRANSITS TODAY
            </div>
            {[
              {ev:"Ju trine Na",t:"14:22",type:"FAVORABLE"},
              {ev:"Ma sq Sa",t:"17:05",type:"TENSION"},
              {ev:"Ve enter Tau",t:"23:41",type:"INGRESS"},
            ].map(tr=>(
              <div key={tr.ev} style={{
                padding:"7px 8px", borderRadius:"6px",
                background:"rgba(255,255,255,.02)",
                border:"1px solid rgba(255,255,255,.04)",
              }}>
                <div style={{display:"flex", justifyContent:"space-between", marginBottom:"2px"}}>
                  <div style={{fontSize:"var(--type-label)", color:"rgba(255,255,255,.55)"}}>{tr.ev}</div>
                  <div style={{fontSize:"var(--type-label)", color:"#FFB800"}}>{tr.t}</div>
                </div>
                <div style={{
                  fontSize:"var(--type-label)", letterSpacing:"1.5px",
                  color: tr.type==="FAVORABLE"?"#2ECC71":tr.type==="TENSION"?"#D35400":"#4A9EBF",
                }}>{tr.type}</div>
              </div>
            ))}

            <div style={{display:"flex", justifyContent:"center", marginTop:"6px"}}>
              <svg width="110" height="100" viewBox="0 0 110 100">
                <defs>
                  <filter id="hxGlow">
                    <feGaussianBlur stdDeviation="1.5" result="b"/>
                    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>
                <polygon points="55,8 95,30 95,72 55,94 15,72 15,30"
                  fill="none" stroke="rgba(255,184,0,.1)" strokeWidth="1"/>
                {(() => {
                  const vals=[.82,.67,.91,.55,.88,.74];
                  const pts=vals.map((v,i)=>{
                    const a=(i/6)*2*Math.PI-Math.PI/2;
                    return `${55+v*38*Math.cos(a)},${50+v*38*Math.sin(a)}`;
                  }).join(" ");
                  return <polygon points={pts}
                    fill="rgba(255,184,0,.07)" stroke="#FFB800" strokeWidth="1"
                    filter="url(#hxGlow)"/>;
                })()}
                {["Su","Mo","Ma","Me","Ju","Ve"].map((pl,i)=>{
                  const a=(i/6)*2*Math.PI-Math.PI/2;
                  return <text key={pl}
                    x={55+46*Math.cos(a)} y={50+46*Math.sin(a)+3}
                    textAnchor="middle" fill="rgba(255,184,0,.45)"
                    fontSize="6" fontFamily="'Courier New',monospace">{pl}</text>;
                })}
                <text x="55" y="53" textAnchor="middle"
                  fill="rgba(255,184,0,.35)" fontSize="6"
                  fontFamily="'Courier New',monospace" letterSpacing="1">IDENTITY</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
