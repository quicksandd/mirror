export class WhatsAppParser {
    constructor(){
      this.re = /^\[(\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2})\] ~?([^:]+): (.+)$/;
      this.reAlt = /^(\d{1,2}\/\d{1,2}\/\d{2}, \d{1,2}:\d{2}) - ([^:]+): (.+)$/;
      this.system = [
        'end-to-end encrypted','Video call','Missed video call','Missed voice call','Voice call',
        '<Media omitted>','Messages to this chat and calls are now secured','changed the subject',
        'added','left','removed','null'
      ];
    }
    isWA(t){
      return /\[\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2}\]/.test(t)
        || /\d{1,2}\/\d{1,2}\/\d{2}, \d{1,2}:\d{2} - /.test(t);
    }
    parse(txt){
      const lines = txt.split('\n');
      const out = []; const authors = new Set();
      let cur = null, buf = [];
      for(let raw of lines){
        let line = raw.trim(); if(!line) continue;
        let m = this.re.exec(line), alt = false;
        if(!m){ m = this.reAlt.exec(line); alt = !!m; }
        if(m){
          if(cur && buf.length && !this._sys(buf.join('\n'))){
            cur.text = buf.join('\n'); out.push(cur); authors.add(cur.from);
          }
          const [, ts, sender, msg] = m; const date = this._ts(ts, alt);
          cur = {
            from: sender.replace(/^~/,''),
            from_id: this._hash(sender),
            text: msg, date: date.toISOString(),
            id: Date.now() + Math.random().toString(36).slice(2)
          };
          buf = [msg];
        } else if(cur){ buf.push(line); }
      }
      if(cur && buf.length && !this._sys(buf.join('\n'))){
        cur.text = buf.join('\n'); out.push(cur); authors.add(cur.from);
      }
      return { messages: out, authors: [...authors] };
    }
    _sys(t){ return this.system.some(s => t.includes(s) || t.includes('\u200e')) }
    _ts(ts, alt){
      if(alt){
        const [d,t] = ts.split(', '); const [mm,dd,yy] = d.split('/'); const [hh,mi] = t.split(':');
        const full = +yy < 50 ? 2000 + +yy : 1900 + +yy; return new Date(full, +mm-1, +dd, +hh, +mi, 0);
      }
      const [d,t] = ts.split(', '); const [dd,mm,yy] = d.split('/'); const [hh,mi,ss] = t.split(':');
      return new Date(+yy, +mm-1, +dd, +hh, +mi, +ss);
    }
    _hash(s){ let h=0; for(const c of s) h=(h<<5)-h+c.charCodeAt(0), h|=0; return String(Math.abs(h)); }
  }
  