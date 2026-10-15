export type LoginRequest = { email: string; password: string };
export type RestaurantRegistrationRequest = LoginRequest & {
  fullName: string;
  restaurantName: string;
  restaurantAddress?: string;
};
export type EmployeeRegistrationRequest = LoginRequest & {
  fullName: string;
  restaurantId: number;
  invitationId?: string;
};
