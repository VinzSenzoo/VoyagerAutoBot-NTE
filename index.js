import axios from 'axios';
import cfonts from 'cfonts';
import gradient from 'gradient-string';
import chalk from 'chalk';
import fs from 'fs/promises';
import readline from 'readline';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import ProgressBar from 'progress';
import ora from 'ora';
import boxen from 'boxen';
import { ethers } from 'ethers';
import { SiweMessage } from 'siwe';

const API_KEY = 'AIzaSyDgDDykbRrhbdfWUpm1BUgj4ga7d_-wy_g';
const APP_CHECK_TOKEN = 'eyJraWQiOiJrTFRMakEiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxOjU0MzEyMzE3NDQyOndlYjo1ODVmNjIzNTRkYjUzYzE0MmJlZDFiIiwiYXVkIjpbInByb2plY3RzXC81NDMxMjMxNzQ0MiIsInByb2plY3RzXC9nYW1lLXByZXZpZXctNTFjMmEiXSwicHJvdmlkZXIiOiJyZWNhcHRjaGFfdjMiLCJpc3MiOiJodHRwczpcL1wvZmlyZWJhc2VhcHBjaGVjay5nb29nbGVhcGlzLmNvbVwvNTQzMTIzMTc0NDIiLCJleHAiOjE3NTAxMDE0NTUsImlhdCI6MTc1MDAxNTA1NSwianRpIjoiZTdjTkdtSlg5NFFDRl9QMUJEc3BUdnFUd2xDbnlDbzBJU2hpRnNpNzZFMCJ9.Qe0RNIuJOmkCO2ovyk9tJEZO1OBKkzZg8P4KmBC3qskl6w5A6rYPJdeF7w6KdL76WQQD5mEzhbMOU6oIKr2q6-g3XjiXLmPwEr2jrfYWMB8uVVbf2Qxq6aANpeiuN_J7qYlARdhL5jbof_nReuAthLyJBmyfag2L1N8KFslai_HZJb2SK2ZWZJEgxrZ-a44ePqGaBlQmqFRQlOIhvDv07k-G9Lx15dU_1_tNR5u7FZ1wsdNVg6d1bnUFfLumEH4kil-ycm-fsNHsF06VK_35ZF7PwJUCeUpT23kb1ZdQzIpX6WTmioJRH5bgcaydSXnBQb35Pz5pAFOpM25y3biThSiHiBCzMYFCOrhzh9a1q2grnJOvjU6cv6Anu8RZgvDVVx8cz1jKymfg4aAVt23F4Zb3tZPjKZ3BaK_dfgDI1TqV6_R644mzJ6Ys8sxfKib0mxasD47NyAMqnQCwVMugiYNOZCD_zdxPBJn0SKCphfQvYMzqKkgb8JFeUQVpuWry';

const logger = {
  info: (msg, options = {}) => {
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const emoji = options.emoji || 'ℹ️  ';
    const context = options.context ? `[${options.context}] ` : '';
    const level = chalk.green('INFO');
    const formattedMsg = `[ ${chalk.gray(timestamp)} ] ${emoji}${level} ${chalk.white(context.padEnd(20))}${chalk.white(msg)}`;
    console.log(formattedMsg);
  },
  warn: (msg, options = {}) => {
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const emoji = options.emoji || '⚠️ ';
    const context = options.context ? `[${options.context}] ` : '';
    const level = chalk.yellow('WARN');
    const formattedMsg = `[ ${chalk.gray(timestamp)} ] ${emoji}${level} ${chalk.white(context.padEnd(20))}${chalk.white(msg)}`;
    console.log(formattedMsg);
  },
  error: (msg, options = {}) => {
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const emoji = options.emoji || '❌ ';
    const context = options.context ? `[${options.context}] ` : '';
    const level = chalk.red('ERROR');
    const formattedMsg = `[ ${chalk.gray(timestamp)} ] ${emoji}${level} ${chalk.white(context.padEnd(20))}${chalk.white(msg)}`;
    console.log(formattedMsg);
  },
  debug: (msg, options = {}) => {
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const emoji = options.emoji || '🔍  ';
    const context = options.context ? `[${options.context}] ` : '';
    const level = chalk.blue('DEBUG');
    const formattedMsg = `[ ${chalk.gray(timestamp)} ] ${emoji}${level} ${chalk.white(context.padEnd(20))}${chalk.white(msg)}`;
    console.log(formattedMsg);
  }
};

function delay(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

function stripAnsi(str) {
  return str.replace(/\x1B\[[0-9;]*m/g, '');
}

function centerText(text, width) {
  const cleanText = stripAnsi(text);
  const textLength = cleanText.length;
  const totalPadding = Math.max(0, width - textLength);
  const leftPadding = Math.floor(totalPadding / 2);
  const rightPadding = totalPadding - leftPadding;
  return `${' '.repeat(leftPadding)}${text}${' '.repeat(rightPadding)}`;
}

function printHeader(title) {
  const width = 80;
  console.log(gradient.morning(`┬${'─'.repeat(width - 2)}┬`));
  console.log(gradient.morning(`│ ${title.padEnd(width - 4)} │`));
  console.log(gradient.morning(`┴${'─'.repeat(width - 2)}┴`));
}

function printInfo(label, value, context) {
  logger.info(`${label.padEnd(15)}: ${chalk.cyan(value)}`, { emoji: '📍 ', context });
}

function printProfileInfo(username, points, level, context) {
  printHeader(`Profile Info ${context}`);
  printInfo('Username', username || 'N/A', context);
  printInfo('Points', points.toString(), context);
  printInfo('Level', level.toString(), context);
  console.log('\n');
}

async function formatTaskTable(tasks, context) {
  console.log('\n');
  logger.info('Task List:', { context, emoji: '📋 ' });
  console.log('\n');

  const spinner = ora('Rendering tasks...').start();
  await new Promise(resolve => setTimeout(resolve, 1000));
  spinner.stop();

  const header = chalk.cyanBright('+----------------------+----------+-------+---------+\n| Task Name            | Category | Point | Status  |\n+----------------------+----------+-------+---------+');
  const rows = tasks.map(task => {
    const displayName = task.description && typeof task.description === 'string'
      ? (task.description.length > 20 ? task.description.slice(0, 17) + '...' : task.description)
      : 'Unknown Task';
    const status = task.status === 'COMPLETED' ? chalk.greenBright('Complte') : chalk.yellowBright('Pending');
    return `| ${displayName.padEnd(20)} | ${((task.category || 'N/A') + '     ').slice(0, 8)} | ${((task.points || 0).toString() + '    ').slice(0, 5)} | ${status.padEnd(6)} |`;
  }).join('\n');
  const footer = chalk.cyanBright('+----------------------+----------+-------+---------+');

  console.log(header + '\n' + rows + '\n' + footer);
  console.log('\n');
}

async function formatChestTable(chestResults, context) {
  logger.info('Daily Chest Results:', { context, emoji: '🎁 ' });
  console.log('\n');

  const spinner = ora('Rendering chest results...').start();
  await new Promise(resolve => setTimeout(resolve, 1000));
  spinner.stop();

  const header = chalk.cyanBright('+----------------------+--------------------------------+---------+\n| Chest Number         | Reward                         | Status  |\n+----------------------+--------------------------------+---------+');
  const rows = chestResults.map((result, index) => {
    const chestNum = `Chest ${index + 1}`;
    const reward = result.reward.length > 30 ? result.reward.slice(0, 27) + '...' : result.reward;
    const status = result.success ? chalk.greenBright('Success') : chalk.redBright('Failed ');
    return `| ${chestNum.padEnd(20)} | ${reward.padEnd(30)} | ${status.padEnd(7)} |`;
  }).join('\n');
  const footer = chalk.cyanBright('+----------------------+--------------------------------+---------+');

  console.log(header + '\n' + rows + '\n' + footer);
  console.log('\n');
}

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/102.0'
];

function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

function getAxiosConfig(proxy, additionalHeaders = {}) {
  const config = {
    headers: {
      'accept': 'application/json',
      'cache-control': 'no-cache',
      'origin': 'https://voyager.preview.craft-world.gg',
      'referer': 'https://voyager.preview.craft-world.gg/',
      'user-agent': getRandomUserAgent(),
      ...additionalHeaders
    },
    timeout: 60000
  };
  if (proxy) {
    config.httpsAgent = newAgent(proxy);
    config.proxy = false;
  }
  return config;
}

function newAgent(proxy) {
  if (proxy.startsWith('http://') || proxy.startsWith('https://')) {
    return new HttpsProxyAgent(proxy);
  } else if (proxy.startsWith('socks4://') || proxy.startsWith('socks5://')) {
    return new SocksProxyAgent(proxy);
  } else {
    logger.warn(`Unsupported proxy: ${proxy}`);
    return null;
  }
}

async function requestWithRetry(method, url, payload = null, config = {}, retries = 3, backoff = 2000, context) {
  for (let i = 0; i < retries; i++) {
    try {
      let response;
      if (method.toLowerCase() === 'get') {
        response = await axios.get(url, config);
      } else if (method.toLowerCase() === 'post') {
        response = await axios.post(url, payload, config);
      } else {
        throw new Error(`Method ${method} not supported`);
      }
      return response;
    } catch (error) {
      if (i < retries - 1) {
        logger.warn(`Retrying ${method.toUpperCase()} ${url} (${i + 1}/${retries})`, { emoji: '🔄', context });
        await delay(backoff / 1000);
        backoff *= 1.5;
        continue;
      }
      throw error;
    }
  }
}

async function readPrivateKeys() {
  try {
    const data = await fs.readFile('pk.txt', 'utf-8');
    const privateKeys = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    logger.info(`Loaded ${privateKeys.length} private key${privateKeys.length === 1 ? '' : 's'}`, { emoji: '🔑 ' });
    return privateKeys;
  } catch (error) {
    logger.error(`Failed to read pk.txt: ${error.message}`, { emoji: '❌ ' });
    return [];
  }
}

async function readProxies() {
  try {
    const data = await fs.readFile('proxy.txt', 'utf-8');
    const proxies = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (proxies.length === 0) {
      logger.warn('No proxies found. Proceeding without proxy.', { emoji: '⚠️ ' });
    } else {
      logger.info(`Loaded ${proxies.length} prox${proxies.length === 1 ? 'y' : 'ies'}`, { emoji: '🌐 ' });
    }
    return proxies;
  } catch (error) {
    logger.warn('proxy.txt not found.', { emoji: '⚠️ ' });
    return [];
  }
}

async function getPayload(address, proxy) {
  const url = 'https://voyager.preview.craft-world.gg/auth/payload';
  const payload = { address, chainId: '2020' };
  const config = getAxiosConfig(proxy);
  try {
    const response = await requestWithRetry('post', url, payload, config, 3, 2000, 'Auth');
    return response.data.payload;
  } catch (error) {
    throw new Error(`Failed to get payload: ${error.message}`);
  }
}

async function signMessage(payload, privateKey) {
  const wallet = new ethers.Wallet(privateKey);
  const siweMessage = new SiweMessage({
    domain: payload.domain,
    address: wallet.address,
    statement: payload.statement,
    uri: payload.uri,
    version: payload.version,
    chainId: payload.chain_id,
    nonce: payload.nonce,
    issuedAt: payload.issued_at,
    expirationTime: payload.expiration_time
  });
  const message = siweMessage.toMessage();
  const signature = await wallet.signMessage(message);
  return signature;
}

async function authenticate(signature, payload, proxy) {
  const url = 'https://voyager.preview.craft-world.gg/auth/login';
  const data = { payload: { signature, payload } };
  const config = getAxiosConfig(proxy, { 'x-firebase-appcheck': APP_CHECK_TOKEN });
  try {
    const response = await requestWithRetry('post', url, data, config, 3, 2000, 'Auth');
    return {
      customToken: response.data.customToken,
      uid: response.data.uid
    };
  } catch (error) {
    throw new Error(`Authentication failed: ${error.message}`);
  }
}

async function signInWithCustomToken(customToken, proxy) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${API_KEY}`;
  const data = { token: customToken, returnSecureToken: true };
  const config = getAxiosConfig(proxy, {
    'x-client-version': 'Chrome/JsCore/11.8.0/FirebaseCore-web',
    'x-firebase-appcheck': APP_CHECK_TOKEN,
    'x-firebase-gmpid': '1:54312317442:web:585f62354db53c142bed1b'
  });
  try {
    const response = await requestWithRetry('post', url, data, config, 3, 2000, 'Auth');
    return response.data;
  } catch (error) {
    throw new Error(`Sign in with custom token failed: ${error.message}`);
  }
}

async function createSession(idToken, proxy) {
  const url = 'https://voyager.preview.craft-world.gg/api/1/session/login';
  const data = { token: idToken };
  const config = getAxiosConfig(proxy);
  try {
    const response = await requestWithRetry('post', url, data, config, 3, 2000, 'Auth');
    const sessionCookie = extractSessionCookie(response);
    if (!sessionCookie) {
      throw new Error('Failed to extract session cookie');
    }
    return sessionCookie;
  } catch (error) {
    throw new Error(`Create session failed: ${error.message}`);
  }
}

function extractSessionCookie(response) {
  const setCookieHeader = response.headers['set-cookie'];
  if (setCookieHeader) {
    const sessionCookie = setCookieHeader.find(cookie => cookie.startsWith('session='));
    if (sessionCookie) {
      return sessionCookie.split(';')[0];
    }
  }
  return null;
}

async function fetchProfileInfo(uid, sessionCookie, proxy, context) {
  const spinner = ora({ text: 'Fetching profile info...', spinner: 'dots' }).start();
  try {
    const query = `
      query GetProfile($uid: ID!) {
        questPointsLeaderboardByUID(uid: $uid) {
          profile {
            uid
            displayName
            level
            questPoints
            twitterHandle
            rank {
              name
              divisionId
              subRank
            }
            equipment {
              slot
              level
              definitionId
            }
          }
          position
          coinRewardAmount
        }
      }
    `;
    const config = getAxiosConfig(proxy, { cookie: sessionCookie });
    const response = await requestWithRetry('post', 'https://voyager.preview.craft-world.gg/graphql', {
      query,
      variables: { uid }
    }, config, 3, 2000, context);
    const profile = response.data.data.questPointsLeaderboardByUID.profile;
    spinner.succeed(chalk.bold.greenBright(` Fetched profile info`));
    return {
      username: profile.displayName,
      points: profile.questPoints,
      level: profile.level
    };
  } catch (error) {
    spinner.fail(chalk.bold.redBright(` Failed to fetch profile info: ${error.message}`));
    return null;
  }
}

async function fetchTasks(sessionCookie, proxy, context) {
  const spinner = ora({ text: 'Fetching tasks...', spinner: 'dots' }).start();
  try {
    const query = `
      query QuestProgress {
        account {
          questProgresses {
            quest {
              id
              name
              description
              reward
              type
            }
            status
          }
        }
      }
    `;
    const config = getAxiosConfig(proxy, { cookie: sessionCookie });
    const response = await requestWithRetry('post', 'https://voyager.preview.craft-world.gg/graphql', { query }, config, 3, 2000, context);
    const questProgresses = response.data.data.account.questProgresses;
    const tasks = questProgresses.map(progress => ({
      id: progress.quest.id,
      description: progress.quest.description,
      category: progress.quest.type,
      points: progress.quest.reward,
      status: progress.status
    }));
    spinner.stop();
    return tasks;
  } catch (error) {
    spinner.fail(` Failed to fetch tasks: ${error.message}`);
    return { error: `Failed: ${error.message}` };
  }
}

async function completeTask(sessionCookie, taskId, taskName, proxy, context) {
  const taskContext = `${context}|T${taskId.slice(-6)}`;
  const spinner = ora({ text: `Completing ${taskName}...`, spinner: 'dots' }).start();
  try {
    const mutation = `
      mutation CompleteQuest($questId: String!) {
        completeQuest(questId: $questId) {
          success
        }
      }
    `;
    const config = getAxiosConfig(proxy, { cookie: sessionCookie });
    const response = await requestWithRetry('post', 'https://voyager.preview.craft-world.gg/graphql', {
      query: mutation,
      variables: { questId: taskId }
    }, config, 3, 2000, taskContext);
    if (response.data.data.completeQuest.success) {
      spinner.succeed(chalk.bold.greenBright(` Completed: ${taskName}`));
      return { success: true, message: `Task "${taskName}" completed` };
    } else {
      spinner.warn(` Failed to complete ${taskName}`);
      return { success: false, message: `Failed to complete: Invalid response` };
    }
  } catch (error) {
    spinner.fail(chalk.bold.redBright(` Failed to complete ${taskName}: ${error.message}`));
    return { success: false, message: `Failed to complete: ${error.message}` };
  }
}

async function openDailyChest(sessionCookie, proxy, context) {
  const maxAttempts = 5;
  let openedChests = 0;
  const chestResults = [];
  const spinner = ora({ text: 'Checking daily chest...', spinner: 'dots' }).start();

  try {
    const query = `
      query GetShopChests {
        account {
          getShopChests {
            id
            name
            dailyPurchases
            dailyLimit
          }
        }
      }
    `;
    let config = getAxiosConfig(proxy, { cookie: sessionCookie, Referer: 'https://voyager.preview.craft-world.gg/shop' });
    const chestResponse = await requestWithRetry('post', 'https://voyager.preview.craft-world.gg/graphql', { query }, config, 3, 2000, context);
    const chests = chestResponse.data.data.account.getShopChests;
    const freeChest = chests.find(c => c.id === 'free_uncommon_chest_1');

    if (!freeChest) {
      spinner.fail('Free chest not found');
      chestResults.push({ success: false, reward: 'None', message: 'Free chest not found' });
      return { success: false, message: 'Free chest not found', opened: 0, results: chestResults };
    }

    const remainingSpins = freeChest.dailyLimit - freeChest.dailyPurchases;
    if (remainingSpins <= 0) {
      spinner.stop();
      chestResults.push({ success: false, reward: 'None', message: 'Daily chest limit reached' });
      return { success: false, message: 'Daily chest limit reached', opened: 0, results: chestResults };
    }

    const attempts = Math.min(remainingSpins, maxAttempts);
    spinner.stop();

    const mutation = `
      mutation BuyAndOpenChestMutation($chestId: String!, $transactionHash: String) {
        buyAndOpenChest(chestId: $chestId, transactionHash: $transactionHash) {
          crystals
          equipment {
            name
            tier
          }
        }
      }
    `;

    for (let i = 0; i < attempts; i++) {
      const chestSpinner = ora({ text: `Opening daily chest ${i + 1}/${attempts}...`, spinner: 'dots' }).start();
      try {
        config = getAxiosConfig(proxy, { cookie: sessionCookie, Referer: 'https://voyager.preview.craft-world.gg/shop' });
        const openResponse = await requestWithRetry('post', 'https://voyager.preview.craft-world.gg/graphql', {
          query: mutation,
          variables: { chestId: 'free_uncommon_chest_1' }
        }, config, 3, 2000, context);

        const chestData = openResponse.data.data.buyAndOpenChest;
        if (chestData) {
          let rewardMsg = 'Opened successfully';
          if (chestData.equipment) {
            rewardMsg = `${chestData.equipment.name} (${chestData.equipment.tier})`;
          } else if (chestData.crystals) {
            rewardMsg = `${chestData.crystals} crystals`;
          }
          chestSpinner.succeed(chalk.bold.greenBright(` Daily chest ${i + 1}/${attempts}: ${rewardMsg}`));
          chestResults.push({ success: true, reward: rewardMsg, message: `Opened successfully` });
          openedChests++;
        } else {
          chestSpinner.fail(` Daily chest ${i + 1}/${attempts}: Failed to open`);
          chestResults.push({ success: false, reward: 'None', message: 'Failed to open' });
        }
      } catch (error) {
        chestSpinner.fail(chalk.bold.redBright(` Daily chest ${i + 1}/${attempts}: Failed - ${error.message}`));
        chestResults.push({ success: false, reward: 'None', message: `Failed: ${error.message}` });
      }
      await delay(2);
    }
    console.log();
    if (openedChests > 0) {
      return { success: true, message: `Opened ${openedChests} Chest`, opened: openedChests, results: chestResults };
    } else {
      return { success: false, message: 'Failed to open any daily chests', opened: 0, results: chestResults };
    }
  } catch (error) {
    spinner.fail(chalk.bold.redBright(`Failed to process daily chest: ${error.message}`));
    chestResults.push({ success: false, reward: 'None', message: `Failed: ${error.message}` });
    return { success: false, message: `Failed to process: ${error.message}`, opened: 0, results: chestResults };
  }
}

async function processAccount(privateKey, index, total, proxy) {
  const context = `Account ${index + 1}/${total}`;
  logger.info(chalk.bold.magentaBright(`Starting account processing`), { emoji: '🚀 ', context });

  printHeader(`Account Info ${context}`);
  const wallet = new ethers.Wallet(privateKey);
  const address = wallet.address;
  printInfo('Address', address, context);
  const ip = await getPublicIP(proxy, context);
  printInfo('IP', ip, context);
  console.log('\n');

  try {
    const payload = await getPayload(address, proxy);
    const signature = await signMessage(payload, privateKey);
    const authResponse = await authenticate(signature, payload, proxy);
    const customToken = authResponse.customToken;
    const uid = authResponse.uid; 
    const signInResponse = await signInWithCustomToken(customToken, proxy);
    const idToken = signInResponse.idToken;
    const sessionCookie = await createSession(idToken, proxy);

    const tasks = await fetchTasks(sessionCookie, proxy, context);
    if (tasks.error) {
      logger.error(`Skipping account due to tasks error: ${tasks.error}`, { context });
      return;
    }

    const pendingTasks = tasks.filter(task => task.status === 'READY_TO_CLAIM');

    if (pendingTasks.length === 0) {
      logger.info('No tasks ready to claim', { emoji: '⚠️ ', context });
    } else {
      console.log();
      const bar = new ProgressBar('Processing [:bar] :percent :etas', {
        complete: '█',
        incomplete: '░',
        width: 30,
        total: pendingTasks.length
      });

      let completedTasks = 0;

      for (const task of pendingTasks) {
        try {
          const result = await completeTask(sessionCookie, task.id, task.description || 'Unknown Task', proxy, context);
          if (result.success) {
            task.status = 'COMPLETED';
            completedTasks++;
          }
        } catch (error) {
          logger.error(`Error completing task ${task.id}: ${error.message}`, { context });
        }
        bar.tick();
        await delay(2);
      }
      console.log();
      logger.info(`Processed ${pendingTasks.length} Tasks: ${completedTasks} Completed`, { emoji: '📊 ', context });
    }
    const chestResult = await openDailyChest(sessionCookie, proxy, context);

    if (chestResult.success) {
      logger.info(`Daily Chest Processing: ${chestResult.message}`, { emoji: '🎁 ', context });
    } else {
      logger.warn(`Daily chest: ${chestResult.message}`, { emoji: '⚠️ ', context });
    }

    if (chestResult.results && chestResult.results.length > 0) {
      await formatChestTable(chestResult.results, context);
    }

    await formatTaskTable(tasks, context);

    const profileInfo = await fetchProfileInfo(uid, sessionCookie, proxy, context);
    if (profileInfo) {
      printProfileInfo(profileInfo.username, profileInfo.points, profileInfo.level, context);
    } else {
      logger.warn('Failed to display profile info', { emoji: '⚠️', context });
    }
    logger.info(chalk.bold.greenBright(`Completed account processing`), { emoji: '🎉 ', context });
    console.log(chalk.cyanBright('________________________________________________________________________________'));
  } catch (error) {
    logger.error(`Error processing account: ${error.message}`, { emoji: '❌ ', context });
  }
}

async function getPublicIP(proxy, context) {
  try {
    const config = getAxiosConfig(proxy);
    const response = await requestWithRetry('get', 'https://api.ipify.org?format=json', null, config, 3, 2000, context);
    return response.data.ip || 'Unknown';
  } catch (error) {
    logger.error(`Failed to get IP: ${error.message}`, { emoji: '❌ ', context });
    return 'Error retrieving IP';
  }
}

let globalUseProxy = false;
let globalProxies = [];

async function initializeConfig() {
  const useProxyAns = await askQuestion(chalk.cyanBright('🔌 Do You Want to Use Proxy? (y/n): '));
  if (useProxyAns.trim().toLowerCase() === 'y') {
    globalUseProxy = true;
    globalProxies = await readProxies();
    if (globalProxies.length === 0) {
      globalUseProxy = false;
      logger.warn('No proxies available, proceeding without proxy.', { emoji: '⚠️ ' });
    }
  } else {
    logger.info('Proceeding without proxy.', { emoji: 'ℹ️ ' });
  }
}

async function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

async function runCycle() {
  const privateKeys = await readPrivateKeys();
  if (privateKeys.length === 0) {
    logger.error('No private keys found in pk.txt. Exiting cycle.', { emoji: '❌ ' });
    return;
  }

  for (let i = 0; i < privateKeys.length; i++) {
    const proxy = globalUseProxy ? globalProxies[i % globalProxies.length] : null;
    try {
      await processAccount(privateKeys[i], i, privateKeys.length, proxy);
    } catch (error) {
      logger.error(`Error processing account: ${error.message}`, { emoji: '❌ ', context: `Account ${i + 1}/${privateKeys.length}` });
    }
    if (i < privateKeys.length - 1) {
      console.log('\n\n');
    }
    await delay(5);
  }
}

async function run() {
  const terminalWidth = process.stdout.columns || 80;
  cfonts.say('NT EXHAUST', {
    font: 'block',
    align: 'center',
    colors: ['cyan', 'magenta'],
    background: 'transparent',
    letterSpacing: 1,
    lineHeight: 1,
    space: true
  });
  console.log(gradient.retro(centerText('=== Telegram Channel 🚀 : NT Exhaust (@NTExhaust) ===', terminalWidth)));
  console.log(gradient.retro(centerText('✪ VOYAGER AUTO DAILY TASK & OPEN CHEST ✪', terminalWidth)));
  console.log('\n');
  await initializeConfig();

  while (true) {
    await runCycle();
    console.log();
    logger.info(chalk.bold.yellowBright('Cycle completed. Waiting 24 hours...'), { emoji: '🔄 ' });
    await delay(86400);
  }
}

run().catch(error => logger.error(`Fatal error: ${error.message}`, { emoji: '❌' }));