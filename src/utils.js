const storageMap = {};
export const storage = {
  set: (key, value) => {
    return isBrowser() ? localStorage.setItem(key, value) : (storageMap[key] = value);
  },
  get: (key) => {
    return isBrowser() ? localStorage.getItem(key) : storageMap[key];
  }
};
export const isBrowser = () => {
  return !(typeof process === 'object' && String(process) === '[object process]');
}