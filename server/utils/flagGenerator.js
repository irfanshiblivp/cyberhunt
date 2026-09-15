import crypto from 'crypto';

export function generateRandomString(length = 8, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') {
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

export function generateTeamCode() {
  return `TEAM-${generateRandomString(4)}`;
}

export function generateAccessCode() {
  const p1 = generateRandomString(3);
  const p2 = generateRandomString(3);
  const p3 = generateRandomString(3);
  return `${p1}-${p2}-${p3}`;
}

export function generateUniqueFlag(teamCode, taskNumber) {
  if (taskNumber === 6) {
    return '11:56:18';
  }
  if (taskNumber === 7) {
    return '40A7-3D08-FDD9';
  }
  if (taskNumber === 8) {
    return 'Q7mP-82Lx-K4';
  }
  if (taskNumber === 9) {
    return 'K7pQ-82Lm-X4';
  }
  if (taskNumber === 10) {
    return 'K8Q-4MP-72X';
  }
  const hash = crypto.createHash('sha256')
    .update(`${teamCode}-TASK${taskNumber}-${process.env.SESSION_SECRET || 'CYBER_HUNT_SECRET_2026'}`)
    .digest('hex')
    .substring(0, 12)
    .toUpperCase();
  
  const formatted = `${hash.substring(0, 4)}-${hash.substring(4, 8)}-${hash.substring(8, 12)}`;
  return formatted;
}

export function generateTeamTaskPayload(teamCode, taskNumber, flag) {
  const hashSeed = crypto.createHash('md5').update(`${teamCode}-${taskNumber}`).digest('hex');
  
  switch (taskNumber) {
    case 1: // Task 1: The Torn Message (Jigsaw Puzzle)
      const keyword = 'SzdtUS00dk5wLVgy';
      return {
        keyword,
        flag: keyword, // Task 1 answer is SzdtUS00dk5wLVgy
        piecesCount: 12,
        storyContext: 'Twelve pieces of a torn photo/document were recovered from the bank crime scene. Put the evidence back together to reveal the word.'
      };
    
    case 2: // Task 2: The Encoded Word
      const t1Keyword = 'SzdtUS00dk5wLVgy';
      return {
        encodedTrace: 'SzdtUS00dk5wLVgy',
        flag,
        storyContext: 'The word from the torn document led to an encoded message. Identify the encoding and decode it to reveal the Task 2 flag.'
      };

    case 3: // Task 3: The Decoded Text (HTML Inspection on /K7mQ-4vNp-X2)
      return {
        targetPage: '/K7mQ-4vNp-X2',
        domAttribute: `data-bank-archive="/robots.txt"`,
        htmlComment: `<!-- BANK EVIDENCE CONTINUES AT: /robots.txt | CLUE KEY: ${flag} -->`,
        displayText: 'something hidden here',
        storyContext: 'Open page /K7mQ-4vNp-X2. It displays "something hidden here". Inspect the HTML source code of the page to reveal the hidden clue.'
      };

    case 4: // Task 4: The Hidden Archive (robots.txt)
      const hiddenPath = `/evidence-archive-${hashSeed.substring(0, 6)}`;
      return {
        hiddenPath,
        robotTxtContent: `User-agent: *\nDisallow: /admin/\nDisallow: /config/\nDisallow: ${hiddenPath}\n# BANK ROBBERY AUXILIARY ARCHIVE ROUTE`,
        secretKey: flag,
        storyContext: 'Inspect /robots.txt on the bank web server to discover the disallow directory hiding the auxiliary vault evidence.'
      };

    case 5: // Task 5: The Bank Statement (Double Base64 Encoding)
      const rawMsg = `TRANSACTION_FLAG:${flag}`;
      const base64Once = Buffer.from(rawMsg).toString('base64');
      const doubleBase64 = Buffer.from(base64Once).toString('base64');
      return {
        doubleBase64,
        flag,
        storyContext: 'Inside the auxiliary vault is an intercepted transaction payload. Multiple layers of encoding were applied to conceal the sensitive key stream. Analyze and reverse the transformation to extract the Task 5 flag.'
      };

    case 6: // Task 6: The Security Camera (Photo Timestamp)
      return {
        imageName: `image.jpg`,
        imagePath: `/image.jpg`,
        flag: `11:56:18`,
        storyContext: 'Analyze security photo image.jpg recovered from the bank security system. Inspect its metadata/properties to find the exact time the photo was taken.'
      };

    case 7: // Task 7: The Bank's Login System (/login)
      return {
        targetRoute: '/login',
        flag: '40A7-3D08-FDD9',
        storyContext: 'The robbers managed to access the bank internal system. Access /login and inspect the HTTP request/response flow using DevTools Network tab to discover how authentication was bypassed.'
      };

    case 8: // Task 8: The Visitor That Never Existed (/college)
      return {
        visitorId: 'VST-4821',
        archiveRef: 'ARCH-27',
        targetRoute: '/college',
        flag: 'Q7mP-82Lx-K4',
        storyContext: 'Investigate transaction logs showing visitor COLLEGE-WEB at 03:17:42. Open /college, use visitor ID VST-4821, analyze Network request transformations, and locate archive ARCH-27 to restore the record and recover the Task 8 flag.'
      };

    case 9: // Task 9: The Vanishing Employee (/employees)
      return {
        targetEmployeeId: 'EMP-4817',
        targetRoute: '/employees',
        recoveryCode: 'R4-91-X',
        investigationRef: 'CASE-4817',
        flag: 'K7pQ-82Lm-X4',
        storyContext: 'Inspect /employees, search EMP-4817, analyze browser Local Storage state transitions (directory_mode = archive), restore record with recovery code R4-91-X, and extract the Task 9 flag.'
      };

    case 10: // Task 10: The Dead Man's Switch (/dead-switch)
      return {
        targetRoute: '/dead-switch',
        flag: 'X9Q-7MK-42P-L8',
        storyContext: 'Open /dead-switch, correlate evidence timestamps, audio playback frequencies, steganography visual filters, and reconstruct the 5-part evidence chain to reveal final flag X9Q-7MK-42P-L8.'
      };

    default:
      return { flag };
  }
}
