import { db } from '../db.js';

export function getTaskPayload(teamId, taskId) {
  const teamTask = db.getTeamTask(teamId, taskId);
  if (!teamTask) return null;
  return teamTask.dynamic_data;
}

// Task 2: C Compiler Simulator
export function handleTask2Compile(teamId, code) {
  const teamTask = db.getTeamTask(teamId, 2);
  if (!teamTask) return { success: false, output: 'Task not found.' };

  const payload = teamTask.dynamic_data;
  
  if (!code || typeof code !== 'string') {
    return { success: false, output: 'Compilation Error: Empty source file.' };
  }

  // Check syntax and logic changes
  const hasAuthTokenSet = /auth_token\s*=\s*1337/.test(code) || /1337/.test(code);
  const isSyntaxClean = code.includes('main') && code.includes('{') && code.includes('}');

  if (!isSyntaxClean) {
    return { success: false, output: 'GCC Compilation Error: syntax error near "main". Expected brace or semicolon.' };
  }

  if (hasAuthTokenSet) {
    return {
      success: true,
      output: `[GCC 13.2.0] Compiling main.c...\nBuild succeeded. Running ./main...\nENTER AUTH PIN: 1337\nACCESS GRANTED! FLAG: ${teamTask.unique_flag}\nProgram exited with code 0.`
    };
  } else {
    return {
      success: false,
      output: `[GCC 13.2.0] Compiling main.c...\nBuild succeeded. Running ./main...\nENTER AUTH PIN: 0\nACCESS DENIED! Set auth_token to 1337.\nProgram exited with code 1.`
    };
  }
}

// Task 4: robots.txt & hidden route lookup
export function handleTask4Robots(teamId) {
  const teamTask = db.getTeamTask(teamId, 4);
  if (!teamTask) return null;
  return teamTask.dynamic_data.robotTxtContent;
}

export function handleTask4SecretRoute(teamId, routePath) {
  const teamTask = db.getTeamTask(teamId, 4);
  if (!teamTask) return { found: false };
  
  const expectedPath = teamTask.dynamic_data.hiddenPath;
  if (routePath === expectedPath || routePath === expectedPath + '/') {
    return {
      found: true,
      title: 'RESTRICTED MISSION CONTROL VAULT',
      content: `CONFIDENTIAL MISSION RECOVERY DIRECTIVE:\nYour team access flag for Mission 04 is: ${teamTask.unique_flag}`
    };
  }
  return { found: false };
}

// Task 7: Bank Internal Portal HTTP Request inspection
export function handleTask7Request(teamId, headers) {
  const teamTask = db.getTeamTask(teamId, 7);
  if (!teamTask) return { success: false, message: 'Task payload invalid.' };

  const expected = teamTask.dynamic_data.requiredHeaders;
  const bankAgent = headers['x-bank-agent'] || headers['X-Bank-Agent'] || headers['x-cyber-agent'] || headers['X-Cyber-Agent'];
  const bankAuth = headers['x-bank-auth'] || headers['X-Bank-Auth'] || headers['x-auth-token'] || headers['X-Auth-Token'];

  if (!bankAgent) {
    return {
      success: false,
      status: 400,
      message: 'HTTP 400 Bad Request: Missing required "X-Bank-Agent" header.'
    };
  }

  if (bankAgent !== expected['X-Bank-Agent'] && bankAgent !== expected['X-Cyber-Agent']) {
    return {
      success: false,
      status: 403,
      message: `HTTP 403 Forbidden: Invalid agent signature.`
    };
  }

  if (!bankAuth || (bankAuth !== expected['X-Bank-Auth'] && bankAuth !== expected['X-Auth-Token'])) {
    return {
      success: false,
      status: 401,
      message: `HTTP 401 Unauthorized: Invalid security authentication header.`
    };
  }

  return {
    success: true,
    status: 200,
    message: 'HTTP 200 OK — ACCESS GRANTED TO BANK INTERNAL PORTAL',
    token: teamTask.unique_flag
  };
}

// Task 8: Race Condition / Stateful Ledger
export function handleTask8GetLedger(teamId) {
  const teamTask = db.getTeamTask(teamId, 8);
  if (!teamTask) return null;
  return {
    accountId: teamTask.dynamic_data.accountId,
    transferId: teamTask.dynamic_data.transferId,
    balance: teamTask.dynamic_data.txState.balance,
    targetBalance: teamTask.dynamic_data.targetBalance,
    history: teamTask.dynamic_data.txState.history
  };
}

export function handleTask8Transfer(teamId, amount, isSimultaneous = false) {
  const teamTask = db.getTeamTask(teamId, 8);
  if (!teamTask) return { success: false, message: 'Invalid task state.' };

  const state = teamTask.dynamic_data.txState;
  const amt = Number(amount);

  if (isNaN(amt) || amt <= 0) {
    return { success: false, message: 'Invalid transfer amount.' };
  }

  if (!isSimultaneous && amt > state.balance) {
    return {
      success: false,
      message: `TRANSFER REJECTED: Insufficient balance. Current: $${state.balance}, Requested: $${amt}`
    };
  }

  if (isSimultaneous || amt === 150) {
    state.balance += (amt * 2);
    state.history.unshift({
      txId: `TX-${Math.floor(Math.random()*90000+10000)}`,
      amount: amt * 2,
      type: 'LEDGER_RACE_CREDIT',
      timestamp: new Date().toISOString(),
      balanceAfter: state.balance
    });
  } else {
    state.balance -= amt;
    state.history.unshift({
      txId: `TX-${Math.floor(Math.random()*90000+10000)}`,
      amount: -amt,
      type: 'TRANSFER_OUT',
      timestamp: new Date().toISOString(),
      balanceAfter: state.balance
    });
  }

  db.updateTeamTask(teamId, 8, { dynamic_data: teamTask.dynamic_data });

  let resultFlag = null;
  let transferId = null;
  if (state.balance >= teamTask.dynamic_data.targetBalance) {
    resultFlag = teamTask.unique_flag;
    transferId = teamTask.dynamic_data.transferId;
  }

  return {
    success: true,
    balance: state.balance,
    targetBalance: teamTask.dynamic_data.targetBalance,
    transferId,
    flag: resultFlag,
    message: resultFlag ? `TARGET BALANCE REACHED! TRANSFER ID UNLOCKED: ${teamTask.dynamic_data.transferId}` : 'Transfer completed.'
  };
}

// Task 9: Blind Boolean SQL Injection Engine
export function handleTask9Query(teamId, payloadQuery) {
  const teamTask = db.getTeamTask(teamId, 9);
  if (!teamTask) return { match: false, message: 'Task state missing.' };

  const { targetEmpId, secretPasscode, fakeDatabase } = teamTask.dynamic_data;
  const queryStr = String(payloadQuery || '').trim();

  if (!queryStr) {
    return { match: false, message: 'No input string provided.' };
  }

  let isMatch = false;

  if (queryStr === targetEmpId || queryStr.includes(targetEmpId)) {
    isMatch = true;
  } else if (/'\s*OR\s*'1'='1/i.test(queryStr) || /'\s*OR\s*1=1/i.test(queryStr) || /OR\s+TRUE/i.test(queryStr)) {
    isMatch = true;
  } else if (queryStr.toUpperCase().includes(secretPasscode.substring(0, 2))) {
    isMatch = true;
  }

  return {
    match: isMatch,
    message: isMatch ? 'Employee record found' : 'No matching employee',
    targetEmpId: isMatch ? targetEmpId : undefined,
    secretPasscode: queryStr.includes(secretPasscode) ? secretPasscode : undefined
  };
}

// Task 10: Standalone Multi-Layer Black Box Verification Core
export function handleTask10Verify(teamId, layer1Key, layer2Override) {
  const teamTask = db.getTeamTask(teamId, 10);
  if (!teamTask) {
    return { success: false, message: 'Missing mission record.' };
  }

  const clean1 = String(layer1Key || '').trim().toUpperCase();
  const clean2 = String(layer2Override || '').trim().toUpperCase();

  if (clean1 !== 'KEY-8472') {
    return {
      success: false,
      message: 'LAYER 1 FAILED: Invalid Layer 1 key. Decode the Double-Base64 payload stream (VkpKR1JuQlhXbUZOU0hkSlVrMUZWVDA5) to extract the key.'
    };
  }

  if (clean2 !== 'VAULT_CORE_2026') {
    return {
      success: true,
      layer: 1,
      hexMatrix: '56 41 55 4C 54 5F 43 4F 52 45 5F 32 30 32 36',
      message: 'LAYER 1 UNLOCKED! Hex matrix stream generated. Convert hex bytes to ASCII text to reveal the Layer 2 Override Key.'
    };
  }

  return {
    success: true,
    layer: 2,
    message: 'BLACK BOX MULTI-LAYER CORE FULLY UNLOCKED & SOLVED!',
    flag: teamTask.unique_flag || '9F2A-88D1-E40B'
  };
}

