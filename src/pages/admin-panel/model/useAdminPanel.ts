import { useState } from "react";
import {
  useRestaurant,
  saveRestaurant as updateRestaurant,
  type RestaurantSettings,
} from "@/entities/restaurant";
import {
  useEmployees,
  changeRole,
  toggleBlock,
  approveEmployee,
} from "@/entities/employee";
import {
  useInvitations,
  createInvitation,
  revokeInvitation,
  deleteInvitation,
} from "@/entities/invitation";
export function useAdminPanel() {
  const { restaurant } = useRestaurant();
  const { employees } = useEmployees();
  const { invitations } = useInvitations();
  const [draft, setDraft] = useState<RestaurantSettings>({ ...restaurant });
  const saveRestaurant = () => {
    updateRestaurant({
      ...draft,
      name: draft.name.trim(),
      city: draft.city.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
    });
  };
  return {
    restaurant,
    draft,
    setDraft,
    saveRestaurant,
    resetRestaurant: () => setDraft({ ...restaurant }),
    employees,
    changeRole,
    toggleBlock,
    approveEmployee,
    invitations,
    createInvitation,
    revokeInvitation,
    deleteInvitation,
  };
}
