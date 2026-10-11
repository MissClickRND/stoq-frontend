export type LoginRequest = { email: string; password: string };
export type RestaurantRegistrationRequest = {
  name: string;
  city: string;
  email: string;
  password: string;
};
export type EmployeeRegistrationRequest = {
  name: string;
  email: string;
  restaurantId: string;
  invitationId?: string;
};
