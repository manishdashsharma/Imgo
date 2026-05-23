import crypto from 'crypto';
import config from '../../config/index.js';

const buildCanonical = (imageId, params) => {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return `${imageId}:${sorted}`;
};

const buildSignedUrl = (imageId, transformParams, expiresInSeconds = 3600) => {
  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const allParams = {};
  for (const [k, v] of Object.entries(transformParams)) {
    if (v !== undefined && v !== null) { allParams[k] = String(v); }
  }
  allParams.expires = String(expires);

  const sig = crypto
    .createHmac('sha256', config.signedUrl.secret)
    .update(buildCanonical(imageId, allParams))
    .digest('hex')
    .slice(0, 32);

  return { ...allParams, sig };
};

const verifySignedUrl = (imageId, rawQuery) => {
  const { sig, ...rest } = rawQuery;
  if (!sig || !rest.expires) { return false; }

  const now = Math.floor(Date.now() / 1000);
  if (parseInt(rest.expires, 10) < now) { return false; }

  const expected = crypto
    .createHmac('sha256', config.signedUrl.secret)
    .update(buildCanonical(imageId, rest))
    .digest('hex')
    .slice(0, 32);

  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
};

export { buildSignedUrl, verifySignedUrl };
