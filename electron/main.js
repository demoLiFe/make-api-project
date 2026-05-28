const { app, BrowserWindow, dialog, Tray, Menu, shell } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');
const fs = require('fs');

let mainWindow;
let serverProcess;
let tray = null;
let serverErrorLogs = [];
const PORT = 3000;
const DEV_FRONTEND_PORT = 5173; // Vite dev server port

// 淇濆瓨鏃ュ織鍒版枃浠跺苟鎵撳紑
function saveAndOpenErrorLog() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFileName = `make-api-private-crash-${timestamp}.log`;
    const logDir = app.getPath('logs');
    const logFilePath = path.join(logDir, logFileName);
    
    // 纭繚鏃ュ織鐩綍瀛樺湪
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // 鍐欏叆鏃ュ織
    const logContent = `Make API Private 宕╂簝鏃ュ織
鐢熸垚鏃堕棿: ${new Date().toLocaleString('zh-CN')}
骞冲彴: ${process.platform}
鏋舵瀯: ${process.arch}
搴旂敤鐗堟湰: ${app.getVersion()}

鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣

瀹屾暣閿欒鏃ュ織:

${serverErrorLogs.join('\n')}

鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣

鏃ュ織鏂囦欢浣嶇疆: ${logFilePath}
`;
    
    fs.writeFileSync(logFilePath, logContent, 'utf8');
    
    // 鎵撳紑鏃ュ織鏂囦欢
    shell.openPath(logFilePath).then((error) => {
      if (error) {
        console.error('Failed to open log file:', error);
        // 濡傛灉鎵撳紑鏂囦欢澶辫触锛岃嚦灏戞樉绀烘枃浠朵綅缃?        shell.showItemInFolder(logFilePath);
      }
    });
    
    return logFilePath;
  } catch (err) {
    console.error('Failed to save error log:', err);
    return null;
  }
}

// 鍒嗘瀽閿欒鏃ュ織锛岃瘑鍒父瑙侀敊璇苟鎻愪緵瑙ｅ喅鏂规
function analyzeError(errorLogs) {
  const allLogs = errorLogs.join('\n');
  
  // 妫€娴嬬鍙ｅ崰鐢ㄩ敊璇?  if (allLogs.includes('failed to start HTTP server') || 
      allLogs.includes('bind: address already in use') ||
      allLogs.includes('listen tcp') && allLogs.includes('bind: address already in use')) {
    return {
      type: '绔彛琚崰鐢?,
      title: '绔彛 ' + PORT + ' 琚崰鐢?,
      message: '鏃犳硶鍚姩鏈嶅姟鍣紝绔彛宸茶鍏朵粬绋嬪簭鍗犵敤',
      solution: `鍙兘鐨勮В鍐虫柟妗堬細\n\n1. 鍏抽棴鍗犵敤绔彛 ${PORT} 鐨勫叾浠栫▼搴廫n2. 妫€鏌ユ槸鍚﹀凡缁忚繍琛屼簡鍙︿竴涓?Make API Private 瀹炰緥\n3. 浣跨敤浠ヤ笅鍛戒护鏌ユ壘鍗犵敤绔彛鐨勮繘绋嬶細\n   Mac/Linux: lsof -i :${PORT}\n   Windows: netstat -ano | findstr :${PORT}\n4. 閲嶅惎鐢佃剳浠ラ噴鏀剧鍙
    };
  }
  
  // 妫€娴嬫暟鎹簱閿欒
  if (allLogs.includes('database is locked') || 
      allLogs.includes('unable to open database')) {
    return {
      type: '鏁版嵁鏂囦欢琚崰鐢?,
      title: '鏃犳硶璁块棶鏁版嵁鏂囦欢',
      message: '搴旂敤鐨勬暟鎹枃浠舵琚叾浠栫▼搴忓崰鐢?,
      solution: '鍙兘鐨勮В鍐虫柟妗堬細\n\n1. 妫€鏌ユ槸鍚﹀凡缁忔墦寮€浜嗗彟涓€涓?Make API Private 绐楀彛\n   - 鏌ョ湅浠诲姟鏍?Dock 涓槸鍚︽湁鍏朵粬 Make API Private 鍥炬爣\n   - 鏌ョ湅绯荤粺鎵樼洏锛圵indows锛夋垨鑿滃崟鏍忥紙Mac锛変腑鏄惁鏈?Make API Private 鍥炬爣\n\n2. 濡傛灉鍒氬垰鍏抽棴杩囧簲鐢紝璇风瓑寰?10 绉掑悗鍐嶈瘯\n\n3. 閲嶅惎鐢佃剳浠ラ噴鏀捐鍗犵敤鐨勬枃浠禱n\n4. 濡傛灉闂鎸佺画锛屽彲浠ュ皾璇曪細\n   - 閫€鍑烘墍鏈?Make API Private 瀹炰緥\n   - 鍒犻櫎鏁版嵁鐩綍涓殑涓存椂鏂囦欢锛?db-shm 鍜?.db-wal锛塡n   - 閲嶆柊鍚姩搴旂敤'
    };
  }
  
  // 妫€娴嬫潈闄愰敊璇?  if (allLogs.includes('permission denied') || 
      allLogs.includes('access denied')) {
    return {
      type: '鏉冮檺閿欒',
      title: '鏉冮檺涓嶈冻',
      message: '绋嬪簭娌℃湁瓒冲鐨勬潈闄愭墽琛屾搷浣?,
      solution: '鍙兘鐨勮В鍐虫柟妗堬細\n\n1. 浠ョ鐞嗗憳/root鏉冮檺杩愯绋嬪簭\n2. 妫€鏌ユ暟鎹洰褰曠殑璇诲啓鏉冮檺\n3. 妫€鏌ュ彲鎵ц鏂囦欢鐨勬潈闄怽n4. 鍦?Mac 涓婏紝妫€鏌ュ畨鍏ㄦ€т笌闅愮璁剧疆'
    };
  }
  
  // 妫€娴嬬綉缁滈敊璇?  if (allLogs.includes('network is unreachable') || 
      allLogs.includes('no such host') ||
      allLogs.includes('connection refused')) {
    return {
      type: '缃戠粶閿欒',
      title: '缃戠粶杩炴帴澶辫触',
      message: '鏃犳硶寤虹珛缃戠粶杩炴帴',
      solution: '鍙兘鐨勮В鍐虫柟妗堬細\n\n1. 妫€鏌ョ綉缁滆繛鎺ユ槸鍚︽甯竆n2. 妫€鏌ラ槻鐏璁剧疆\n3. 妫€鏌ヤ唬鐞嗛厤缃甛n4. 纭鐩爣鏈嶅姟鍣ㄥ湴鍧€姝ｇ‘'
    };
  }
  
  // 妫€娴嬮厤缃枃浠堕敊璇?  if (allLogs.includes('invalid configuration') || 
      allLogs.includes('failed to parse config') ||
      allLogs.includes('yaml') || allLogs.includes('json') && allLogs.includes('parse')) {
    return {
      type: '閰嶇疆閿欒',
      title: '閰嶇疆鏂囦欢閿欒',
      message: '閰嶇疆鏂囦欢鏍煎紡涓嶆纭垨鍖呭惈鏃犳晥閰嶇疆',
      solution: '鍙兘鐨勮В鍐虫柟妗堬細\n\n1. 妫€鏌ラ厤缃枃浠舵牸寮忔槸鍚︽纭甛n2. 鎭㈠榛樿閰嶇疆\n3. 鍒犻櫎閰嶇疆鏂囦欢璁╃▼搴忛噸鏂扮敓鎴怽n4. 鏌ョ湅鏂囨。浜嗚В姝ｇ‘鐨勯厤缃牸寮?
    };
  }
  
  // 妫€娴嬪唴瀛樹笉瓒?  if (allLogs.includes('out of memory') || 
      allLogs.includes('cannot allocate memory')) {
    return {
      type: '鍐呭瓨涓嶈冻',
      title: '绯荤粺鍐呭瓨涓嶈冻',
      message: '绋嬪簭杩愯鏃跺唴瀛樹笉瓒?,
      solution: '鍙兘鐨勮В鍐虫柟妗堬細\n\n1. 鍏抽棴鍏朵粬鍗犵敤鍐呭瓨鐨勭▼搴廫n2. 澧炲姞绯荤粺鍙敤鍐呭瓨\n3. 閲嶅惎鐢佃剳閲婃斁鍐呭瓨\n4. 妫€鏌ユ槸鍚﹀瓨鍦ㄥ唴瀛樻硠婕?
    };
  }
  
  // 妫€娴嬫枃浠朵笉瀛樺湪閿欒
  if (allLogs.includes('no such file or directory') || 
      allLogs.includes('cannot find the file')) {
    return {
      type: '鏂囦欢缂哄け',
      title: '鎵句笉鍒板繀闇€鐨勬枃浠?,
      message: '缂哄皯绋嬪簭杩愯鎵€闇€鐨勬枃浠?,
      solution: '鍙兘鐨勮В鍐虫柟妗堬細\n\n1. 閲嶆柊瀹夎搴旂敤绋嬪簭\n2. 妫€鏌ュ畨瑁呯洰褰曟槸鍚﹀畬鏁碶n3. 纭繚鎵€鏈変緷璧栨枃浠堕兘瀛樺湪\n4. 妫€鏌ユ枃浠惰矾寰勬槸鍚︽纭?
    };
  }
  
  return null;
}

function getBinaryPath() {
  const isDev = process.env.NODE_ENV === 'development';
  const platform = process.platform;

  if (isDev) {
    const binaryName = platform === 'win32' ? 'make-api-private.exe' : 'make-api-private';
    return path.join(__dirname, '..', binaryName);
  }

  let binaryName;
  switch (platform) {
    case 'win32':
      binaryName = 'make-api-private.exe';
      break;
    case 'darwin':
      binaryName = 'make-api-private';
      break;
    case 'linux':
      binaryName = 'make-api-private';
      break;
    default:
      binaryName = 'make-api-private';
  }

  return path.join(process.resourcesPath, 'bin', binaryName);
}

// Check if a server is available with retry logic
function checkServerAvailability(port, maxRetries = 30, retryDelay = 1000) {
  return new Promise((resolve, reject) => {
    let currentAttempt = 0;
    
    const tryConnect = () => {
      currentAttempt++;
      
      if (currentAttempt % 5 === 1 && currentAttempt > 1) {
        console.log(`Attempting to connect to port ${port}... (attempt ${currentAttempt}/${maxRetries})`);
      }
      
      const req = http.get({
        hostname: '127.0.0.1', // Use IPv4 explicitly instead of 'localhost' to avoid IPv6 issues
        port: port,
        timeout: 10000
      }, (res) => {
        // Server responded, connection successful
        req.destroy();
        console.log(`鉁?Successfully connected to port ${port} (status: ${res.statusCode})`);
        resolve();
      });

      req.on('error', (err) => {
        if (currentAttempt >= maxRetries) {
          reject(new Error(`Failed to connect to port ${port} after ${maxRetries} attempts: ${err.message}`));
        } else {
          setTimeout(tryConnect, retryDelay);
        }
      });

      req.on('timeout', () => {
        req.destroy();
        if (currentAttempt >= maxRetries) {
          reject(new Error(`Connection timeout on port ${port} after ${maxRetries} attempts`));
        } else {
          setTimeout(tryConnect, retryDelay);
        }
      });
    };
    
    tryConnect();
  });
}

function startServer() {
  return new Promise((resolve, reject) => {
    const isDev = process.env.NODE_ENV === 'development';

    const userDataPath = app.getPath('userData');
    const dataDir = path.join(userDataPath, 'data');
    
    // 璁剧疆鐜鍙橀噺渚?preload.js 浣跨敤
    process.env.ELECTRON_DATA_DIR = dataDir;
    
    if (isDev) {
      // 寮€鍙戞ā寮忥細鍋囪寮€鍙戣€呮墜鍔ㄥ惎鍔ㄤ簡 Go 鍚庣鍜屽墠绔紑鍙戞湇鍔″櫒
      // 鍙渶瑕佺瓑寰呭墠绔紑鍙戞湇鍔″櫒灏辩华
      console.log('Development mode: skipping server startup');
      console.log('Please make sure you have started:');
      console.log('  1. Go backend: go run main.go (port 3000)');
      console.log('  2. Frontend dev server: cd web && bun dev (port 5173)');
      console.log('');
      console.log('Checking if servers are running...');
      
      // First check if both servers are accessible
      checkServerAvailability(DEV_FRONTEND_PORT)
        .then(() => {
          console.log('鉁?Frontend dev server is accessible on port 5173');
          resolve();
        })
        .catch((err) => {
          console.error(`鉁?Cannot connect to frontend dev server on port ${DEV_FRONTEND_PORT}`);
          console.error('Please make sure the frontend dev server is running:');
          console.error('  cd web && bun dev');
          reject(err);
        });
      return;
    }

    // 鐢熶骇妯″紡锛氬惎鍔ㄤ簩杩涘埗鏈嶅姟鍣?    const env = { ...process.env, PORT: PORT.toString() };

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    env.SQLITE_PATH = path.join(dataDir, 'make-api-private.db');
    
    console.log('鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣');
    console.log('馃搧 鎮ㄧ殑鏁版嵁瀛樺偍浣嶇疆锛?);
    console.log('   ' + dataDir);
    console.log('   馃挕 澶囦唤鎻愮ず锛氬鍒舵鐩綍鍗冲彲澶囦唤鎵€鏈夋暟鎹?);
    console.log('鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣');

    const binaryPath = getBinaryPath();
    const workingDir = process.resourcesPath;
    
    console.log('Starting server from:', binaryPath);

    serverProcess = spawn(binaryPath, [], {
      env,
      cwd: workingDir
    });

    serverProcess.stdout.on('data', (data) => {
      console.log(`Server: ${data}`);
    });

    serverProcess.stderr.on('data', (data) => {
      const errorMsg = data.toString();
      console.error(`Server Error: ${errorMsg}`);
      serverErrorLogs.push(errorMsg);
      // 鍙繚鐣欐渶杩戠殑100鏉￠敊璇棩蹇?      if (serverErrorLogs.length > 100) {
        serverErrorLogs.shift();
      }
    });

    serverProcess.on('error', (err) => {
      console.error('Failed to start server:', err);
      reject(err);
    });

    serverProcess.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);
      
      // 濡傛灉閫€鍑轰唬鐮佷笉鏄?锛岃鏄庢湇鍔″櫒寮傚父閫€鍑?      if (code !== 0 && code !== null) {
        const errorDetails = serverErrorLogs.length > 0 
          ? serverErrorLogs.slice(-20).join('\n') 
          : '娌℃湁鎹曡幏鍒伴敊璇棩蹇?;
        
        // 鍒嗘瀽閿欒绫诲瀷
        const knownError = analyzeError(serverErrorLogs);
        
        let dialogOptions;
        if (knownError) {
          // 璇嗗埆鍒板凡鐭ラ敊璇紝鏄剧ず鍙嬪ソ鐨勯敊璇俊鎭拰瑙ｅ喅鏂规
          dialogOptions = {
            type: 'error',
            title: knownError.title,
            message: knownError.message,
            detail: `${knownError.solution}\n\n鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣\n\n閫€鍑轰唬鐮? ${code}\n\n閿欒绫诲瀷: ${knownError.type}\n\n鏈€杩戠殑閿欒鏃ュ織:\n${errorDetails}`,
            buttons: ['閫€鍑哄簲鐢?, '鏌ョ湅瀹屾暣鏃ュ織'],
            defaultId: 0,
            cancelId: 0
          };
        } else {
          // 鏈瘑鍒殑閿欒锛屾樉绀洪€氱敤閿欒淇℃伅
          dialogOptions = {
            type: 'error',
            title: '鏈嶅姟鍣ㄥ穿婧?,
            message: '鏈嶅姟鍣ㄨ繘绋嬪紓甯搁€€鍑?,
            detail: `閫€鍑轰唬鐮? ${code}\n\n鏈€杩戠殑閿欒淇℃伅:\n${errorDetails}`,
            buttons: ['閫€鍑哄簲鐢?, '鏌ョ湅瀹屾暣鏃ュ織'],
            defaultId: 0,
            cancelId: 0
          };
        }
        
        dialog.showMessageBox(dialogOptions).then((result) => {
          if (result.response === 1) {
            // 鐢ㄦ埛閫夋嫨鏌ョ湅璇︽儏锛屼繚瀛樺苟鎵撳紑鏃ュ織鏂囦欢
            const logPath = saveAndOpenErrorLog();
            
            // 鏄剧ず纭瀵硅瘽妗?            const confirmMessage = logPath 
              ? `鏃ュ織宸蹭繚瀛樺埌:\n${logPath}\n\n鏃ュ織鏂囦欢宸插湪榛樿鏂囨湰缂栬緫鍣ㄤ腑鎵撳紑銆俓n\n鐐瑰嚮"閫€鍑?鍏抽棴搴旂敤绋嬪簭銆俙
              : '鏃ュ織淇濆瓨澶辫触锛屼絾宸插湪鎺у埗鍙拌緭鍑恒€俓n\n鐐瑰嚮"閫€鍑?鍏抽棴搴旂敤绋嬪簭銆?;
            
            dialog.showMessageBox({
              type: 'info',
              title: '鏃ュ織宸蹭繚瀛?,
              message: confirmMessage,
              buttons: ['閫€鍑?],
              defaultId: 0
            }).then(() => {
              app.isQuitting = true;
              app.quit();
            });
            
            // 鍚屾椂鍦ㄦ帶鍒跺彴杈撳嚭
            console.log('=== 瀹屾暣閿欒鏃ュ織 ===');
            console.log(serverErrorLogs.join('\n'));
          } else {
            // 鐢ㄦ埛閫夋嫨鐩存帴閫€鍑?            app.isQuitting = true;
            app.quit();
          }
        });
      } else {
        // 姝ｅ父閫€鍑猴紙code涓?鎴杗ull锛夛紝鐩存帴鍏抽棴绐楀彛
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.close();
        }
      }
    });

    checkServerAvailability(PORT)
      .then(() => {
        console.log('鉁?Backend server is accessible on port 3000');
        resolve();
      })
      .catch((err) => {
        console.error('鉁?Failed to connect to backend server');
        reject(err);
      });
  });
}

function createWindow() {
  const isDev = process.env.NODE_ENV === 'development';
  const loadPort = isDev ? DEV_FRONTEND_PORT : PORT;
  
  mainWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    title: 'Make API Private',
    icon: path.join(__dirname, 'icon.png')
  });

  mainWindow.loadURL(`http://127.0.0.1:${loadPort}`);
  
  console.log(`Loading from: http://127.0.0.1:${loadPort}`);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Close to tray instead of quitting
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      if (process.platform === 'darwin') {
        app.dock.hide();
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  // Use template icon for macOS (black with transparency, auto-adapts to theme)
  // Use colored icon for Windows
  const trayIconPath = process.platform === 'darwin'
    ? path.join(__dirname, 'tray-iconTemplate.png')
    : path.join(__dirname, 'tray-icon-windows.png');

  tray = new Tray(trayIconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Make API Private',
      click: () => {
        if (mainWindow === null) {
          createWindow();
        } else {
          mainWindow.show();
          if (process.platform === 'darwin') {
            app.dock.show();
          }
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Make API Private');
  tray.setContextMenu(contextMenu);

  // On macOS, clicking the tray icon shows the window
  tray.on('click', () => {
    if (mainWindow === null) {
      createWindow();
    } else {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
      if (mainWindow.isVisible() && process.platform === 'darwin') {
        app.dock.show();
      }
    }
  });
}

app.whenReady().then(async () => {
  try {
    await startServer();
    createTray();
    createWindow();
  } catch (err) {
    console.error('Failed to start application:', err);
    
    // 鍒嗘瀽鍚姩澶辫触鐨勯敊璇?    const knownError = analyzeError(serverErrorLogs);
    
    if (knownError) {
      dialog.showMessageBox({
        type: 'error',
        title: knownError.title,
        message: `鍚姩澶辫触: ${knownError.message}`,
        detail: `${knownError.solution}\n\n鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣\n\n閿欒淇℃伅: ${err.message}\n\n閿欒绫诲瀷: ${knownError.type}`,
        buttons: ['閫€鍑?, '鏌ョ湅瀹屾暣鏃ュ織'],
        defaultId: 0,
        cancelId: 0
      }).then((result) => {
        if (result.response === 1) {
          // 鐢ㄦ埛閫夋嫨鏌ョ湅鏃ュ織
          const logPath = saveAndOpenErrorLog();
          
          const confirmMessage = logPath 
            ? `鏃ュ織宸蹭繚瀛樺埌:\n${logPath}\n\n鏃ュ織鏂囦欢宸插湪榛樿鏂囨湰缂栬緫鍣ㄤ腑鎵撳紑銆俓n\n鐐瑰嚮"閫€鍑?鍏抽棴搴旂敤绋嬪簭銆俙
            : '鏃ュ織淇濆瓨澶辫触锛屼絾宸插湪鎺у埗鍙拌緭鍑恒€俓n\n鐐瑰嚮"閫€鍑?鍏抽棴搴旂敤绋嬪簭銆?;
          
          dialog.showMessageBox({
            type: 'info',
            title: '鏃ュ織宸蹭繚瀛?,
            message: confirmMessage,
            buttons: ['閫€鍑?],
            defaultId: 0
          }).then(() => {
            app.quit();
          });
          
          console.log('=== 瀹屾暣閿欒鏃ュ織 ===');
          console.log(serverErrorLogs.join('\n'));
        } else {
          app.quit();
        }
      });
    } else {
      dialog.showMessageBox({
        type: 'error',
        title: '鍚姩澶辫触',
        message: '鏃犳硶鍚姩鏈嶅姟鍣?,
        detail: `閿欒淇℃伅: ${err.message}\n\n璇锋鏌ユ棩蹇楄幏鍙栨洿澶氫俊鎭€俙,
        buttons: ['閫€鍑?, '鏌ョ湅瀹屾暣鏃ュ織'],
        defaultId: 0,
        cancelId: 0
      }).then((result) => {
        if (result.response === 1) {
          // 鐢ㄦ埛閫夋嫨鏌ョ湅鏃ュ織
          const logPath = saveAndOpenErrorLog();
          
          const confirmMessage = logPath 
            ? `鏃ュ織宸蹭繚瀛樺埌:\n${logPath}\n\n鏃ュ織鏂囦欢宸插湪榛樿鏂囨湰缂栬緫鍣ㄤ腑鎵撳紑銆俓n\n鐐瑰嚮"閫€鍑?鍏抽棴搴旂敤绋嬪簭銆俙
            : '鏃ュ織淇濆瓨澶辫触锛屼絾宸插湪鎺у埗鍙拌緭鍑恒€俓n\n鐐瑰嚮"閫€鍑?鍏抽棴搴旂敤绋嬪簭銆?;
          
          dialog.showMessageBox({
            type: 'info',
            title: '鏃ュ織宸蹭繚瀛?,
            message: confirmMessage,
            buttons: ['閫€鍑?],
            defaultId: 0
          }).then(() => {
            app.quit();
          });
          
          console.log('=== 瀹屾暣閿欒鏃ュ織 ===');
          console.log(serverErrorLogs.join('\n'));
        } else {
          app.quit();
        }
      });
    }
  }
});

app.on('window-all-closed', () => {
  // Don't quit when window is closed, keep running in tray
  // Only quit when explicitly choosing Quit from tray menu
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', (event) => {
  if (serverProcess) {
    event.preventDefault();

    console.log('Shutting down server...');
    serverProcess.kill('SIGTERM');

    setTimeout(() => {
      if (serverProcess) {
        serverProcess.kill('SIGKILL');
      }
      app.exit();
    }, 5000);

    serverProcess.on('close', () => {
      serverProcess = null;
      app.exit();
    });
  }
});
