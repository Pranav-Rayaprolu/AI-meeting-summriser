// src/utils/getUuidUserId.ts
function sha1(str: string): Promise<string> {
  const utf8 = new TextEncoder().encode(str);
  return crypto.subtle.digest('SHA-1', utf8).then(hashBuffer => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // Convert to UUID format
    hashArray[6] = (hashArray[6] & 0x0f) | 0x50; // version 5
    hashArray[8] = (hashArray[8] & 0x3f) | 0x80; // variant
    const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return (
      hex.slice(0, 8) + '-' +
      hex.slice(8, 12) + '-' +
      hex.slice(12, 16) + '-' +
      hex.slice(16, 20) + '-' +
      hex.slice(20, 32)
    );
  });
}

export async function getUuidUserId(uid: string): Promise<string> {
  const DNS_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  return sha1(DNS_NAMESPACE + uid);
} 