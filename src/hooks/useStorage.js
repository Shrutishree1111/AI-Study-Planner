import { useState, useEffect } from 'react';
import { storage } from '../lib/storage.js';

export const useStorage = (key, defaultValue) => {
    const [value, setValue] = useState(() => storage.get(key, defaultValue));

    const setAndStore = (newValue) => {
        const resolved = typeof newValue === 'function' ? newValue(value) : newValue;
        storage.set(key, resolved);
        setValue(resolved);
    };

    return [value, setAndStore];
};
