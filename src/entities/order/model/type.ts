export type OrderType = "dine-in" | "takeaway";
export type OrderStatus = "processing" | "preparing" | "completed";
export type OrderItem = {
  dishId: string;
  name: string;
  price: number | null;
  quantity: number;
  imageUrl?: string;
};
export type OrderItemDraft = Omit<OrderItem, "quantity" | "price"> & {
  price: number;
  quantity: number | string;
};
export type Order = {
  id: string;
  createdAt: string;
  type: OrderType;
  table: number | null;
  guests: number;
  responsible: string;
  status: OrderStatus;
  items: OrderItem[];
};
export type OrderDraft = {
  createdAt: string | null;
  type: OrderType;
  table: string | null;
  guests: number | string;
  items: OrderItemDraft[];
};

export type GuestOrderPayload = {
  restaurantId: string;
  source: "guest";
  createdAt: string;
  type: OrderType;
  table: number | null;
  guests: number;
  guestName: string | null;
  comment: string | null;
  items: OrderItem[];
  total: number;
};
