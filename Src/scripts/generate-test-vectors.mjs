#!/usr/bin/env node
/**
 * 產出符合 ADR-008 規範之 Ed25519 跨端離線授權簽驗測試向量（Fixture）
 *
 * 規範依據：
 *   - Docs/appsync/ADR-008_授權憑證格式與離線驗證契約.md
 *   - Docs/webplan/PRD_階段五_會員與帳號中心.md §1 FR-30
 *
 * 產出內容：
 *   - Ed25519 測試金鑰對（SPKI 公鑰、PKCS#8 私鑰、JWK raw base64url）
 *   - 3 組標準 compact JWS 測試向量（Pro、Lifetime、Commercial 多席次）
 *   - 寫入 Docs/appsync/fixtures/license-test-vectors.json 供官網與 App 端單元測試共用
 *
 * 用法：node scripts/generate-test-vectors.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const SRC_ROOT = path.resolve(import.meta.dirname, '..')
const APPSYNC_FIXTURES_DIR = path.resolve(SRC_ROOT, '..', 'Docs', 'appsync', 'fixtures')
const OUTPUT_FILE = path.join(APPSYNC_FIXTURES_DIR, 'license-test-vectors.json')

/** Base64URL 編碼輔助函式 */
function base64UrlEncode(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, 'utf8')
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

/** 簽發 compact JWS (EdDSA) */
function signCompactJws(header, payload, privateKey) {
  const headerB64 = base64UrlEncode(JSON.stringify(header))
  const payloadB64 = base64UrlEncode(JSON.stringify(payload))
  const dataToSign = Buffer.from(`${headerB64}.${payloadB64}`, 'utf8')

  const signature = crypto.sign(null, dataToSign, privateKey)
  const signatureB64 = base64UrlEncode(signature)

  return `${headerB64}.${payloadB64}.${signatureB64}`
}

/** 驗證 compact JWS */
function verifyCompactJws(jws, publicKey) {
  const parts = jws.split('.')
  if (parts.length !== 3) return false
  const [headerB64, payloadB64, signatureB64] = parts
  const dataToSign = Buffer.from(`${headerB64}.${payloadB64}`, 'utf8')
  const signature = Buffer.from(signatureB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64')

  return crypto.verify(null, dataToSign, publicKey, signature)
}

console.info('🔑 正在生成 Ed25519 測試金鑰對...')

// 1. 生成確定性或新 Ed25519 金鑰對
const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
})

const publicKeyObj = crypto.createPublicKey(publicKey)
const privateKeyObj = crypto.createPrivateKey(privateKey)

// 導出 JWK
const publicJwk = publicKeyObj.export({ format: 'jwk' })

const kid = 'K2026A'
const header = {
  alg: 'EdDSA',
  typ: 'pbent+jws',
  kid,
}

// 2. 建立 3 組測試案例
const testCases = [
  {
    id: 'case_pro_standard',
    description: '標準個人版 Pro 憑證（1 席次，綁定個人 Email）',
    payload: {
      v: 1,
      iss: 'promptbox.app',
      sub: 'alice@example.com',
      plan: 'pro',
      seat: 1,
      order: 'polar_ord_test_001',
      jti: 'jti_pro_test_001_8a9d0c1e',
      iat: 1773446400, // 2026-03-14
    },
  },
  {
    id: 'case_lifetime',
    description: '永久更新權 Lifetime 憑證',
    payload: {
      v: 1,
      iss: 'promptbox.app',
      sub: 'bob@example.com',
      plan: 'lifetime',
      seat: 1,
      order: 'polar_ord_test_002',
      jti: 'jti_life_test_002_4b5c6d7e',
      iat: 1773446400,
    },
  },
  {
    id: 'case_commercial_seat_3',
    description: '商業授權席次 3/5 憑證',
    payload: {
      v: 1,
      iss: 'promptbox.app',
      sub: 'developer3@company.com',
      plan: 'commercial',
      seat: 3,
      order: 'polar_ord_test_003',
      jti: 'jti_comm_test_003_1f2a3b4c',
      iat: 1773446400,
    },
  },
]

// 3. 簽章並進行自檢
const signedVectors = testCases.map((tc) => {
  const jws = signCompactJws(header, tc.payload, privateKeyObj)
  const isValid = verifyCompactJws(jws, publicKeyObj)

  if (!isValid) {
    throw new Error(`測試向量 [${tc.id}] 驗章失敗！請檢查簽署邏輯。`)
  }

  return {
    ...tc,
    header,
    expectedJws: jws,
    verified: isValid,
  }
})

// 4. 組裝輸出資料結構
const fixtureData = {
  version: 1,
  schema: 'Docs/appsync/ADR-008_授權憑證格式與離線驗證契約.md',
  createdAt: new Date().toISOString(),
  keyInfo: {
    kid,
    algorithm: 'Ed25519 / EdDSA',
    publicSpkiPem: publicKey,
    privatePkcs8Pem: privateKey,
    publicJwk: {
      kty: publicJwk.kty,
      crv: publicJwk.crv,
      x: publicJwk.x,
    },
  },
  vectors: signedVectors,
}

// 5. 寫入檔案
if (!fs.existsSync(APPSYNC_FIXTURES_DIR)) {
  fs.mkdirSync(APPSYNC_FIXTURES_DIR, { recursive: true })
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(fixtureData, null, 2), 'utf8')

console.info(`✔ 成功生成測試向量並寫入: ${path.relative(SRC_ROOT, OUTPUT_FILE)}`)
console.info(`  - 測試案例數: ${signedVectors.length}`)
console.info(`  - 演算法: EdDSA (Ed25519), kid: ${kid}`)
console.info(`  - 3/3 簽章全數通過本機離線公鑰驗證 (crypto.verify)`)
