import { EStorageDriver } from '../shared/index.js';
import { LocalStorageAdapter } from './local.adapter.js';
import { MinIOStorageAdapter } from './minio.adapter.js';
import config from '../config/index.js';

let adapterInstance = null;

const getStorageAdapter = () => {
  if (adapterInstance) {return adapterInstance;}
  if (config.storage.driver === EStorageDriver.MINIO) {
    adapterInstance = new MinIOStorageAdapter();
  } else {
    adapterInstance = new LocalStorageAdapter();
  }
  return adapterInstance;
};

export { getStorageAdapter };
