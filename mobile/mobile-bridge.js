(() => {
  const dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open('risk-mobile-library', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('tracks', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  const urls = new Map();
  const transact = async (mode, operation) => {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('tracks', mode);
      const store = tx.objectStore('tracks');
      let request;
      try { request = operation(store); } catch (error) { reject(error); return; }
      if (request && typeof request.onsuccess !== 'undefined') {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }
      tx.oncomplete = () => resolve(request && request.result);
      tx.onerror = () => reject(tx.error);
    });
  };
  const list = async () => (await transact('readonly', store => store.getAll()))
    .sort((a, b) => b.addedAt - a.addedAt)
    .map(({ id, title, artist, duration, addedAt }) => ({ id, title, artist, duration, addedAt, platform: 'local', thumbnail: '' }));
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'audio/*,.mp3,.m4a,.aac,.wav,.flac,.ogg,.opus,.webm';
  input.multiple = true;
  input.hidden = true;
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(input), { once: true });

  window.riskMobile = {
    getLibrary: list,
    importAudioFiles: () => new Promise(resolve => {
      input.onchange = async () => {
        const chosen = [...(input.files || [])];
        input.value = '';
        let count = 0;
        for (const file of chosen) {
          if (!file.type.startsWith('audio/') && !/\.(mp3|m4a|aac|wav|flac|ogg|opus|webm)$/i.test(file.name)) continue;
          const raw = file.name.replace(/\.[^.]+$/, '').replace(/^\d+(?:[.\s-]+)\s*/, '').trim() || 'Untitled';
          const split = raw.indexOf(' - ');
          const id = crypto.randomUUID();
          await transact('readwrite', store => store.put({
            id,
            title: split > -1 ? raw.slice(split + 3).trim() : raw,
            artist: split > -1 ? raw.slice(0, split).trim() : 'Unknown artist',
            duration: 0,
            addedAt: Date.now(),
            blob: file
          }));
          count++;
        }
        resolve(count);
      };
      input.oncancel = () => resolve(0);
      input.click();
    }),
    getAudioUrl: async id => {
      if (urls.has(id)) return urls.get(id);
      const track = await transact('readonly', store => store.get(id));
      if (!track || !track.blob) throw new Error('This audio file is no longer available on this device.');
      const objectUrl = URL.createObjectURL(track.blob);
      urls.set(id, objectUrl);
      return objectUrl;
    },
    deleteTrack: async id => {
      const objectUrl = urls.get(id);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      urls.delete(id);
      return transact('readwrite', store => store.delete(id));
    }
  };
})();
