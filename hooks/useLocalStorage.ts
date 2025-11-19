import { useState, useEffect } from 'react';
import { AppData, loadData, saveData } from '@/lib/storage';

export function useLocalStorage() {
  const [data, setData] = useState<AppData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loaded = loadData();
    setData(loaded);
    setIsLoading(false);
  }, []);

  const updateData = (newData: AppData) => {
    setData(newData);
    saveData(newData);
  };

  return { data, updateData, isLoading };
}

