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

function separator() {
  return '----------------------------------------';
}

function saveAndOpenErrorLog() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFileName = `make-api-private-crash-${timestamp}.log`;
    const logDir = app.getPath('logs');
    const logFilePath = path.join(logDir, logFileName);

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logContent = `Make API Private 崩溃日志
生成时间: ${new Date().toLocaleString('zh-CN')}
平台: ${process.platform}
架构: ${process.arch}
应用版本: ${app.getVersion()}

${separator()}

完整错误日志:

${serverErrorLogs.join('\n')}

${separator()}

日志文件位置: ${logFilePath}
`;

    fs.writeFileSync(logFilePath, logContent, 'utf8');

    shell.openPath(logFilePath).then((error) => {
      if (error) {
        console.error('Failed to open log file:', error);
        shell.showItemInFolder(logFilePath);
      }
    });

    return logFilePath;
  } catch (err) {
    console.error('Failed to save error log:', err);
    return null;
  }
}

function analyzeError(errorLogs) {
  const allLogs = errorLogs.join('\n');

  if (allLogs.includes('failed to start HTTP server') ||
      allLogs.includes('bind: address already in use') ||
      (allLogs.includes('listen tcp') && allLogs.includes('bind: address already in use'))) {
    return {
      type: '端口被占用',
      title: `端口 ${PORT} 被占用`,
      message: '无法启动服务器，端口已被其他程序占用',
      solution: `可能的解决方案：\n\n1. 关闭占用端口 ${PORT} 的其他程序\n2. 检查是否已经运行了另一个 Make API Private 实例\n3. 使用以下命令查找占用端口的进程：\n   Mac/Linux: lsof -i :${PORT}\n   Windows: netstat -ano | findstr :${PORT}\n4. 重启电脑释放端口`
    };
  }

  if (allLogs.includes('database is locked') ||
      allLogs.includes('unable to open database')) {
    return {
      type: '数据文件被占用',
      title: '无法访问数据文件',
      message: '应用的数据文件正被其他程序占用',
      solution: '可能的解决方案：\n\n1. 检查是否已经打开了另一个 Make API Private 窗口\n   - 查看任务栏/Dock 中是否有其他 Make API Private 图标\n   - 查看系统托盘（Windows）或菜单栏（Mac）中是否有 Make API Private 图标\n\n2. 如果刚刚关闭过应用，请等待 10 秒后再试\n\n3. 重启电脑释放被占用的文件\n\n4. 如果问题持续，可以尝试：\n   - 退出所有 Make API Private 实例\n   - 删除数据目录中的临时文件（.db-shm 和 .db-wal）\n   - 重新启动应用'
    };
  }

  if (allLogs.includes('permission denied') ||
      allLogs.includes('access denied')) {
    return {
      type: '权限错误',
      title: '权限不足',
      message: '程序没有足够的权限执行操作',
      solution: '可能的解决方案：\n\n1. 以管理员/root 权限运行程序\n2. 检查数据目录的读写权限\n3. 检查可执行文件的权限\n4. 在 Mac 上，检查安全性与隐私设置'
    };
  }

  if (allLogs.includes('network is unreachable') ||
      allLogs.includes('no such host') ||
      allLogs.includes('connection refused')) {
    return {
      type: '网络错误',
      title: '网络连接失败',
      message: '无法建立网络连接',
      solution: '可能的解决方案：\n\n1. 检查网络连接是否正常\n2. 检查防火墙设置\n3. 检查代理配置\n4. 确认目标服务器地址正确'
    };
  }

  if (allLogs.includes('invalid configuration') ||
      allLogs.includes('failed to parse config') ||
      allLogs.includes('yaml') ||
      (allLogs.includes('json') && allLogs.includes('parse'))) {
    return {
      type: '配置错误',
      title: '配置文件错误',
      message: '配置文件格式不正确或包含无效配置',
      solution: '可能的解决方案：\n\n1. 检查配置文件格式是否正确\n2. 恢复默认配置\n3. 删除配置文件让程序重新生成\n4. 查看文档了解正确的配置格式'
    };
  }

  if (allLogs.includes('out of memory') ||
      allLogs.includes('cannot allocate memory')) {
    return {
      type: '内存不足',
      title: '系统内存不足',
      message: '程序运行时内存不足',
      solution: '可能的解决方案：\n\n1. 关闭其他占用内存的程序\n2. 增加系统可用内存\n3. 重启电脑释放内存\n4. 检查是否存在内存泄漏'
    };
  }

  if (allLogs.includes('no such file or directory') ||
      allLogs.includes('cannot find the file')) {
    return {
      type: '文件缺失',
      title: '找不到必需的文件',
      message: '缺少程序运行所需的文件',
      solution: '可能的解决方案：\n\n1. 重新安装应用程序\n2. 检查安装目录是否完整\n3. 确保所有依赖文件都存在\n4. 检查文件路径是否正确'
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

function checkServerAvailability(port, maxRetries = 30, retryDelay = 1000) {
  return new Promise((resolve, reject) => {
    let currentAttempt = 0;

    const tryConnect = () => {
      currentAttempt++;

      if (currentAttempt % 5 === 1 && currentAttempt > 1) {
        console.log(`Attempting to connect to port ${port}... (attempt ${currentAttempt}/${maxRetries})`);
      }

      const req = http.get({
        hostname: '127.0.0.1',
        port: port,
        timeout: 10000
      }, (res) => {
        req.destroy();
        console.log(`Connected to port ${port} (status: ${res.statusCode})`);
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

function buildLogSavedMessage(logPath) {
  return logPath
    ? `日志已保存到:\n${logPath}\n\n日志文件已在默认文本编辑器中打开。\n\n点击“退出”关闭应用程序。`
    : '日志保存失败，但已在控制台输出。\n\n点击“退出”关闭应用程序。';
}

function showLogSavedDialog(logPath, quit = true) {
  dialog.showMessageBox({
    type: 'info',
    title: '日志已保存',
    message: buildLogSavedMessage(logPath),
    buttons: ['退出'],
    defaultId: 0
  }).then(() => {
    if (quit) {
      app.isQuitting = true;
      app.quit();
    }
  });
}

function startServer() {
  return new Promise((resolve, reject) => {
    const isDev = process.env.NODE_ENV === 'development';

    const userDataPath = app.getPath('userData');
    const dataDir = path.join(userDataPath, 'data');

    process.env.ELECTRON_DATA_DIR = dataDir;

    if (isDev) {
      console.log('Development mode: skipping server startup');
      console.log('Please make sure you have started:');
      console.log('  1. Go backend: go run main.go (port 3000)');
      console.log('  2. Frontend dev server: cd web && bun dev (port 5173)');
      console.log('');
      console.log('Checking if servers are running...');

      checkServerAvailability(DEV_FRONTEND_PORT)
        .then(() => {
          console.log('Frontend dev server is accessible on port 5173');
          resolve();
        })
        .catch((err) => {
          console.error(`Cannot connect to frontend dev server on port ${DEV_FRONTEND_PORT}`);
          console.error('Please make sure the frontend dev server is running:');
          console.error('  cd web && bun dev');
          reject(err);
        });
      return;
    }

    const env = { ...process.env, PORT: PORT.toString() };

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    env.SQLITE_PATH = path.join(dataDir, 'make-api-private.db');

    console.log(separator());
    console.log('Your data storage location:');
    console.log('   ' + dataDir);
    console.log('Backup tip: copy this directory to back up all data.');
    console.log(separator());

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
      if (serverErrorLogs.length > 100) {
        serverErrorLogs.shift();
      }
    });

    serverProcess.on('error', (err) => {
      console.error('Failed to start server:', err);
      reject(err);
    });

    serverProcess.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);

      if (code !== 0 && code !== null) {
        const errorDetails = serverErrorLogs.length > 0
          ? serverErrorLogs.slice(-20).join('\n')
          : '没有捕获到错误日志';

        const knownError = analyzeError(serverErrorLogs);

        const dialogOptions = knownError ? {
          type: 'error',
          title: knownError.title,
          message: knownError.message,
          detail: `${knownError.solution}\n\n${separator()}\n\n退出代码: ${code}\n\n错误类型: ${knownError.type}\n\n最近的错误日志:\n${errorDetails}`,
          buttons: ['退出应用', '查看完整日志'],
          defaultId: 0,
          cancelId: 0
        } : {
          type: 'error',
          title: '服务器崩溃',
          message: '服务器进程异常退出',
          detail: `退出代码: ${code}\n\n最近的错误信息:\n${errorDetails}`,
          buttons: ['退出应用', '查看完整日志'],
          defaultId: 0,
          cancelId: 0
        };

        dialog.showMessageBox(dialogOptions).then((result) => {
          if (result.response === 1) {
            const logPath = saveAndOpenErrorLog();
            showLogSavedDialog(logPath);
            console.log('=== 完整错误日志 ===');
            console.log(serverErrorLogs.join('\n'));
          } else {
            app.isQuitting = true;
            app.quit();
          }
        });
      } else if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.close();
      }
    });

    checkServerAvailability(PORT)
      .then(() => {
        console.log('Backend server is accessible on port 3000');
        resolve();
      })
      .catch((err) => {
        console.error('Failed to connect to backend server');
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

    const knownError = analyzeError(serverErrorLogs);

    if (knownError) {
      dialog.showMessageBox({
        type: 'error',
        title: knownError.title,
        message: `启动失败: ${knownError.message}`,
        detail: `${knownError.solution}\n\n${separator()}\n\n错误信息: ${err.message}\n\n错误类型: ${knownError.type}`,
        buttons: ['退出', '查看完整日志'],
        defaultId: 0,
        cancelId: 0
      }).then((result) => {
        if (result.response === 1) {
          const logPath = saveAndOpenErrorLog();
          showLogSavedDialog(logPath, false);
          console.log('=== 完整错误日志 ===');
          console.log(serverErrorLogs.join('\n'));
        } else {
          app.quit();
        }
      });
    } else {
      dialog.showMessageBox({
        type: 'error',
        title: '启动失败',
        message: '无法启动服务器',
        detail: `错误信息: ${err.message}\n\n请检查日志获取更多信息。`,
        buttons: ['退出', '查看完整日志'],
        defaultId: 0,
        cancelId: 0
      }).then((result) => {
        if (result.response === 1) {
          const logPath = saveAndOpenErrorLog();
          showLogSavedDialog(logPath, false);
          console.log('=== 完整错误日志 ===');
          console.log(serverErrorLogs.join('\n'));
        } else {
          app.quit();
        }
      });
    }
  }
});

app.on('window-all-closed', () => {
  // Keep running in tray until the user explicitly chooses Quit.
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
