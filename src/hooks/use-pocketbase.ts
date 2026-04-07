import { useState, useEffect } from 'react';
import type { Restaurant, Workplace } from '@/types/restaurant';
import {
  getWorkplaces, createWorkplace, updateWorkplace, deleteWorkplace as apiDeleteWorkplace,
  getRestaurants, createRestaurant, updateRestaurant, deleteRestaurant as apiDeleteRestaurant,
  subscribeToRestaurants, subscribeToWorkplaces, unsubscribeAll, deleteRestaurantsByWorkplace,
} from '@/services/pocketbase';
import { toast } from 'sonner';

export function usePocketBase() {
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial fetch
  useEffect(() => {
    Promise.all([getWorkplaces(), getRestaurants()])
      .then(([wp, rest]) => {
        setWorkplaces(wp);
        setRestaurants(rest);
      })
      .catch((err) => {
        console.error('Failed to load data:', err);
        toast.error('Erreur de chargement des données');
      })
      .finally(() => setLoading(false));
  }, []);

  // Realtime subscriptions
  useEffect(() => {
    subscribeToRestaurants((action, record) => {
      setRestaurants(prev => {
        if (action === 'create') {
          if (prev.find(r => r.id === record.id)) return prev;
          return [...prev, record];
        }
        if (action === 'update') return prev.map(r => r.id === record.id ? record : r);
        if (action === 'delete') return prev.filter(r => r.id !== record.id);
        return prev;
      });
    });

    subscribeToWorkplaces((action, record) => {
      setWorkplaces(prev => {
        if (action === 'create') {
          if (prev.find(w => w.id === record.id)) return prev;
          return [...prev, record];
        }
        if (action === 'update') return prev.map(w => w.id === record.id ? record : w);
        if (action === 'delete') return prev.filter(w => w.id !== record.id);
        return prev;
      });
    });

    return () => unsubscribeAll();
  }, []);

  // --- Workplace mutations ---
  const addWorkplace = async (wp: Omit<Workplace, 'id'>) => {
    try {
      // If this is the first workplace or isActive, deactivate others
      if (wp.isActive) {
        await Promise.all(workplaces.map(w => updateWorkplace(w.id, { isActive: false })));
        setWorkplaces(prev => prev.map(w => ({ ...w, isActive: false })));
      }
      const created = await createWorkplace(wp);
      setWorkplaces(prev => [...prev, created]);
      return created;
    } catch (err) {
      toast.error('Erreur lors de l\'ajout du lieu');
      throw err;
    }
  };

  const selectWorkplace = async (workplace: Workplace) => {
    try {
      await Promise.all(workplaces.map(w =>
        updateWorkplace(w.id, { isActive: w.id === workplace.id })
      ));
      setWorkplaces(prev => prev.map(w => ({ ...w, isActive: w.id === workplace.id })));
    } catch (err) {
      toast.error('Erreur lors de la sélection du lieu');
    }
  };

  const editWorkplace = async (wp: Workplace) => {
    try {
      const updated = await updateWorkplace(wp.id, { name: wp.name, address: wp.address });
      setWorkplaces(prev => prev.map(w => w.id === wp.id ? { ...w, ...updated } : w));
    } catch (err) {
      toast.error('Erreur lors de la modification du lieu');
    }
  };

  const removeWorkplace = async (id: string) => {
    try {
      await deleteRestaurantsByWorkplace(id);
      await apiDeleteWorkplace(id);
      setRestaurants(prev => prev.filter(r => r.workplaceId !== id));
      setWorkplaces(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      toast.error('Erreur lors de la suppression du lieu');
    }
  };

  // --- Restaurant mutations ---
  const addRestaurant = async (r: Omit<Restaurant, 'id'> & { id?: string }) => {
    try {
      const { id, ...data } = r as any;
      const created = await createRestaurant(data);
      setRestaurants(prev => [...prev, created]);
      return created;
    } catch (err) {
      toast.error('Erreur lors de l\'ajout du restaurant');
      throw err;
    }
  };

  const editRestaurant = async (r: Restaurant) => {
    try {
      const updated = await updateRestaurant(r.id, r);
      setRestaurants(prev => prev.map(rest => rest.id === r.id ? updated : rest));
    } catch (err) {
      toast.error('Erreur lors de la modification du restaurant');
    }
  };

  const removeRestaurant = async (id: string) => {
    try {
      await apiDeleteRestaurant(id);
      setRestaurants(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      toast.error('Erreur lors de la suppression du restaurant');
    }
  };

  return {
    workplaces, restaurants, loading,
    addWorkplace, selectWorkplace, editWorkplace, removeWorkplace,
    addRestaurant, editRestaurant, removeRestaurant,
    setWorkplaces, setRestaurants,
  };
}
