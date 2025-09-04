/**
 * Утилиты для работы с localStorage для сохранения keypair и uid
 */

const STORAGE_PREFIX = 'mirror_';

/**
 * Сохраняет keypair и uid в localStorage
 * @param {string} uid - UUID анализа
 * @param {Object} keypair - Объект с ключевой парой
 */
export function saveKeypairToStorage(uid, keypair) {
  try {
    const storageKey = `${STORAGE_PREFIX}keypair_${uid}`;
    const data = {
      uid,
      keypair,
      timestamp: Date.now()
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
    console.log(`Keypair saved for uid: ${uid}`);
  } catch (error) {
    console.error('Error saving keypair to storage:', error);
  }
}

/**
 * Загружает keypair из localStorage по uid
 * @param {string} uid - UUID анализа
 * @returns {Object|null} - Объект с keypair или null если не найден
 */
export function loadKeypairFromStorage(uid) {
  try {
    const storageKey = `${STORAGE_PREFIX}keypair_${uid}`;
    const stored = localStorage.getItem(storageKey);
    
    if (!stored) {
      return null;
    }
    
    const data = JSON.parse(stored);
    
    // Проверяем, что данные не слишком старые (например, не старше 30 дней)
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 дней в миллисекундах
    if (Date.now() - data.timestamp > maxAge) {
      console.log(`Keypair for uid ${uid} is too old, removing from storage`);
      removeKeypairFromStorage(uid);
      return null;
    }
    
    // Восстанавливаем Uint8Array из объекта, если он есть
    const keypair = data.keypair;
    if (keypair && keypair.sk && typeof keypair.sk === 'object' && !(keypair.sk instanceof Uint8Array)) {
      // Преобразуем объект обратно в Uint8Array
      const skArray = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        skArray[i] = keypair.sk[i] || 0;
      }
      keypair.sk = skArray;
    }
    
    return keypair;
  } catch (error) {
    console.error('Error loading keypair from storage:', error);
    return null;
  }
}

/**
 * Удаляет keypair из localStorage по uid
 * @param {string} uid - UUID анализа
 */
export function removeKeypairFromStorage(uid) {
  try {
    const storageKey = `${STORAGE_PREFIX}keypair_${uid}`;
    localStorage.removeItem(storageKey);
    console.log(`Keypair removed for uid: ${uid}`);
  } catch (error) {
    console.error('Error removing keypair from storage:', error);
  }
}

/**
 * Проверяет, есть ли сохраненный keypair для данного uid
 * @param {string} uid - UUID анализа
 * @returns {boolean} - true если keypair найден
 */
export function hasKeypairInStorage(uid) {
  try {
    const storageKey = `${STORAGE_PREFIX}keypair_${uid}`;
    return localStorage.getItem(storageKey) !== null;
  } catch (error) {
    console.error('Error checking keypair in storage:', error);
    return false;
  }
}

/**
 * Получает список всех сохраненных uid
 * @returns {Array<string>} - Массив uid
 */
export function getAllStoredUids() {
  try {
    const keys = Object.keys(localStorage);
    return keys
      .filter(key => key.startsWith(`${STORAGE_PREFIX}keypair_`))
      .map(key => key.replace(`${STORAGE_PREFIX}keypair_`, ''));
  } catch (error) {
    console.error('Error getting stored uids:', error);
    return [];
  }
}

/**
 * Очищает все сохраненные keypair
 */
export function clearAllKeypairs() {
  try {
    const keys = Object.keys(localStorage);
    keys
      .filter(key => key.startsWith(`${STORAGE_PREFIX}keypair_`))
      .forEach(key => localStorage.removeItem(key));
    console.log('All keypairs cleared from storage');
  } catch (error) {
    console.error('Error clearing all keypairs:', error);
  }
}
