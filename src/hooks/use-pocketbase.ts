import { useState, useEffect } from 'react';
import type { Restaurant, Workplace } from '@/types/restaurant';
import {
  getWorkplaces, createWorkplace, updateWorkplace, deleteWorkplace as apiDeleteWorkplace,
  getRestaurants, createRestaurant, updateRestaurant, deleteRestaurant as apiDeleteRestaurant,
  subscribeToRestaurants, subscribeToWorkplaces, unsubscribeAll, deleteRestaurantsByWorkplace,
} from '@/services/pocketbase';
import { toast } from 'sonner';

export function usePocketBase(instanceId?: string, nickname?: string) {
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial fetch
  useEffect(() => {
    Promise.all([getWorkplaces(instanceId), getRestaurants(instanceId)])
      .then(([wp, rest]) => {
        setWorkplaces(wp);
        setRestaurants(rest);
      })
      .catch((err) => {
        console.error('Failed to load data:', err);
        toast.error('Erreur de chargement des données');
      })
      .finally(() => setLoading(false));
  }, [instanceId]);

  // Realtime subscriptions
  useEffect(() => {
    subscribeToRestaurants((action, record) => {
      if (instanceId && record.instanceId && record.instanceId !== instanceId) return;
      setRestaurants(prev => {
        if (action === 'create') {
          if (prev.find(r => r.id === record.id)) return prev;
          if (record.createdBy && record.createdBy !== nickname) {
            toast.info(record.createdBy + " a ajouté " + record.name);
          }
          return [...prev, record];
        }
        if (action === 'update') {
          if (record.updatedBy && record.updatedBy !== nickname) {
            const existing = prev.find(r => r.id === record.id);
            if (existing && existing.name) {
              toast.info(record.updatedBy + " a modifié " + record.name);
            }
          }
          return prev.map(r => r.id === record.id ? record : r);
        }
        if (action === 'delete') return prev.filter(r => r.id !== record.id);
        return prev;
      });
    });

    subscribeToWorkplaces((action, record) => {
      if (instanceId && record.instanceId && record.instanceId !== instanceId) return;
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
  }, [instanceId]);

  // --- Workplace mutations ---
  const addWorkplace = async (wp: Omit<Workplace, 'id'>) => {
    try {
      // If this is the first workplace or isActive, deactivate others
      if (wp.isActive) {
        await Promise.all(workplaces.map(w => updateWorkplace(w.id, { isActive: false })));
        setWorkplaces(prev => prev.map(w => ({ ...w, isActive: false })));
      }
      const created = await createWorkplace({ ...wp, instanceId: instanceId } as any);
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
      await updateWorkplace(wp.id, { name: wp.name, address: wp.address });
    } catch (err) {
      toast.error('Erreur lors de la modification du lieu');
    }
  };

  const removeWorkplace = async (id: string) => {
    try {
      await deleteRestaurantsByWorkplace(id);
      await apiDeleteWorkplace(id);
    } catch (err) {
      toast.error('Erreur lors de la suppression du lieu');
    }
  };

  // --- Restaurant mutations ---
  const addRestaurant = async (r: Omit<Restaurant, 'id'> & { id?: string }) => {
    try {
      const { id, ...data } = r as any;
      const created = await createRestaurant({ ...data, instanceId: instanceId } as any);
      return created;
    } catch (err) {
      toast.error('Erreur lors de l\'ajout du restaurant');
      throw err;
    }
  };

  const editRestaurant = async (r: Restaurant) => {
    try {
      await updateRestaurant(r.id, r);
    } catch (err) {
      toast.error('Erreur lors de la modification du restaurant');
    }
  };

  const removeRestaurant = async (id: string) => {
    try {
      await apiDeleteRestaurant(id);
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
