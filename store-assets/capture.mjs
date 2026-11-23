// Flip Card Hero - store asset renderer (Chrome DevTools Protocol, no npm deps)
// Usage: node store-assets/capture.mjs [game|static|all]
import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';

const PROJECT = process.cwd();
const OUT = path.join(PROJECT, 'store-assets');
const SHOTS = path.join(OUT, 'screenshots');
const PORT = 9333;
const URL_BASE = 'http://127.0.0.1:8099';

const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function findChrome() {
  for (const p of CHROME_CANDIDATES) {
    try {
      await fs.access(p);
      return p;
    } catch {}
  }
  throw new Error('No Chrome/Edge binary found');
}

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP timeout: ${method}`));
        }
      }, 30000);
    });
  }
  async eval(expression) {
    const r = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (r.exceptionDetails) {
      throw new Error('Eval failed: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
    }
    return r.result?.value;
  }
  async shot(file, { settle = 350 } = {}) {
    await sleep(settle);
    const { data } = await this.send('Page.captureScreenshot', {
      format: 'png',
      fromSurface: true,
      captureBeyondViewport: false,
    });
    await fs.writeFile(path.join(OUT, file), Buffer.from(data, 'base64'));
    console.log('  wrote', file);
  }
  async metrics(width, height, scale = 1, mobile = true) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: scale,
      mobile,
      screenWidth: width,
      screenHeight: height,
    });
    await this.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 });
  }
}

async function waitForDevtools() {
  for (let i = 0; i < 80; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      if (r.ok) {
        const list = await r.json();
        const page = list.find((t) => t.type === 'page');
        if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
      }
    } catch {}
    await sleep(250);
  }
  throw new Error('DevTools did not become ready');
}

async function connect(url) {
  const ws = new WebSocket(url);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  return new Cdp(ws);
}

const GAME_SHOTS = [
  {
    file: 'screenshots/phone-01-menu.png',
    js: `(() => { const g = window.game; g.playerName = 'LEO'; g.updatePlayerNameDisplays(); g.switchScreen('main-menu'); return true; })()`,
  },
  {
    file: 'screenshots/phone-02-rps.png',
    js: `(() => {
      const g = window.game;
      g.switchScreen('game');
      g.hideModals();
      g.playerCards = 10; g.botCards = 10; g.currentRound = 1; g.lastRoundWinner = null;
      g.activeSmasher = 'player'; g.isGameEnded = false;
      g.updateScoreboard(); g.renderDecks();
      g.preparePot(1);
      g.openRpsModal();
      g.dom.rpsPlayerChoice.textContent = '✌️';
      g.dom.rpsBotChoice.textContent = '✊';
      g.dom.rpsStatus.innerHTML = '🎉 Bạn thắng! Bạn được quyền <b>ĐẬP TRƯỚC</b> ở Hiệp 1.';
      return true;
    })()`,
  },
  {
    file: 'screenshots/phone-04-arena.png',
    js: `(() => {
      const g = window.game;
      g.switchScreen('game'); g.hideModals();
      g.playerCards = 10; g.botCards = 8; g.currentRound = 3; g.lastRoundWinner = 'player';
      g.activeSmasher = 'player'; g.isGameEnded = false;
      g.updateScoreboard(); g.renderDecks();
      g.confirmStake(3);
      g.stopPointerMovement();
      g.sweetSpotStart = 68;
      g.dom.sweetSpot.style.left = '68%';
      g.pointerPos = 22;
      g.updatePointerDom();
      g.dom.arenaMessage.textContent = 'Tập trung! Canh đúng vạch VÀNG rồi bấm ĐẬP!';
      return true;
    })()`,
  },
  {
    file: 'screenshots/phone-05-hit.png',
    js: `(() => {
      const g = window.game;
      g.switchScreen('game'); g.hideModals();
      g.playerCards = 9; g.botCards = 9; g.currentRound = 4; g.lastRoundWinner = 'player';
      g.activeSmasher = 'player'; g.isGameEnded = false;
      g.updateScoreboard(); g.renderDecks();
      g.confirmStake(2);
      g.stopPointerMovement();
      g.sweetSpotStart = 55;
      g.dom.sweetSpot.style.left = '55%';
      g.pointerPos = 56;
      g.updatePointerDom();
      g.renderPotCards(true);
      g.showToast('🔥 BẠN ĐÃ LẬT BÀI THÀNH CÔNG!', 'success');
      return true;
    })()`,
  },
  {
    file: 'screenshots/phone-03-stake.png',
    js: `(() => {
      const g = window.game;
      g.switchScreen('game'); g.hideModals();
      g.playerCards = 8; g.botCards = 7; g.currentRound = 2; g.lastRoundWinner = 'player';
      g.isGameEnded = false;
      g.updateScoreboard(); g.renderDecks();
      g.preparePot(2);
      g.openStakeModal();
      return true;
    })()`,
  },
  {
    file: 'screenshots/phone-06-win.png',
    js: `(() => {
      const g = window.game;
      g.switchScreen('game'); g.hideModals();
      g.playerCards = 6; g.botCards = 0; g.currentRound = 4;
      g.updateScoreboard(); g.renderDecks(); g.renderPotCards(false);
      g.endGame('player_knockout');
      return true;
    })()`,
    settle: 900,
  },
];

async function run() {
  const mode = process.argv[2] || 'all';
  await fs.mkdir(SHOTS, { recursive: true });

  const chrome = await findChrome();
  const profile = path.join(OUT, '.chrome-profile');
  await fs.rm(profile, { recursive: true, force: true });
  await fs.mkdir(profile, { recursive: true });

  console.log('chrome:', chrome);
  const proc = spawn(
    chrome,
    [
      '--headless=new',
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${profile}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--allow-file-access-from-files',
      '--autoplay-policy=no-user-gesture-required',
      '--window-size=1296,2304',
      'about:blank',
    ],
    { stdio: 'ignore', windowsHide: true }
  );

  let cdp;
  try {
    cdp = await connect(await waitForDevtools());
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    if (mode === 'game' || mode === 'all') {
      await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
      await cdp.metrics(432, 768, 2.5);
      await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
        source: `try { localStorage.setItem('flipCardHero_playerName', 'LEO'); } catch (e) {}`,
      });
      await cdp.send('Page.navigate', { url: `${URL_BASE}/index.html` });
      await sleep(3200);
      const ready = await cdp.eval(`typeof window.game !== 'undefined'`);
      if (!ready) throw new Error('window.game not ready');

      for (const s of GAME_SHOTS) {
        console.log('shot:', s.file);
        await cdp.eval(s.js);
        await cdp.shot(s.file, { settle: s.settle ?? 500 });
      }
    }

    if (mode === 'static' || mode === 'all') {
      await cdp.metrics(512, 512, 1, false);
      await cdp.send('Page.navigate', { url: `file:///E:/Work/FlipCardHero/store-assets/src/icon.html` });
      await sleep(900);
      await cdp.shot('icon-512.png', { settle: 300 });

      await cdp.metrics(1024, 500, 1, false);
      await cdp.send('Page.navigate', { url: `file:///E:/Work/FlipCardHero/store-assets/src/feature.html` });
      await sleep(900);
      await cdp.shot('feature-graphic-1024x500.png', { settle: 300 });
    }

    if (mode === 'adaptive' || mode === 'all') {
      await fs.mkdir(path.join(OUT, 'render'), { recursive: true });
      await cdp.metrics(512, 512, 1, false);

      // Foreground có nền trong suốt (alpha) để launcher mask đè lên background
      await cdp.send('Emulation.setDefaultBackgroundColorOverride', {
        color: { r: 0, g: 0, b: 0, a: 0 },
      });
      await cdp.send('Page.navigate', {
        url: `file:///E:/Work/FlipCardHero/store-assets/src/adaptive-foreground.html`,
      });
      await sleep(900);
      await cdp.shot('render/adaptive-foreground-512.png', { settle: 300 });

      await cdp.send('Emulation.setDefaultBackgroundColorOverride', {});
      await cdp.send('Page.navigate', {
        url: `file:///E:/Work/FlipCardHero/store-assets/src/adaptive-background.html`,
      });
      await sleep(900);
      await cdp.shot('render/adaptive-background-512.png', { settle: 300 });
    }
  } finally {
    try {
      cdp?.ws.close();
    } catch {}
    proc.kill();
    await sleep(400);
    await fs.rm(profile, { recursive: true, force: true }).catch(() => {});
  }
}

run().then(
  () => {
    console.log('done');
    process.exit(0);
  },
  (e) => {
    console.error('FAILED:', e.message);
    process.exit(1);
  }
);
