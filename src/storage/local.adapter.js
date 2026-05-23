import fs from 'fs/promises';
import path from 'path';
import config from '../config/index.js';

class LocalStorageAdapter {
  constructor() {
    this.basePath = config.storage.localPath;
  }

  async upload(buffer, key) {
    const filePath = path.join(this.basePath, key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);
    return { key, url: `/storage/${key}` };
  }

  async get(key) {
    const filePath = path.join(this.basePath, key);
    return await fs.readFile(filePath);
  }

  async delete(key) {
    const filePath = path.join(this.basePath, key);
    await fs.unlink(filePath);
  }

  async exists(key) {
    try {
      await fs.access(path.join(this.basePath, key));
      return true;
    } catch {
      return false;
    }
  }
}

export { LocalStorageAdapter };
