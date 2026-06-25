/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  originalPrice?: number;
  discountPercent?: number;
  image: string;
  stock: number;
  details: {
    lat: number;
    lng: number;
    zoom: number;
  };
}

export type FrameSize = "10x10" | "18x18";
export type FrameColor = "Madera natural" | "Negro" | "Blanco";

export interface CartItem {
  id: string; // Unique ID for cart item (productID_size_color or customID)
  productId: string;
  name: string;
  size: FrameSize;
  color: FrameColor;
  price: number;
  quantity: number;
  image: string;
  // If custom city:
  isCustom?: boolean;
  customDetails?: {
    latitude: number;
    longitude: number;
    zoom: number;
    address: string;
    style: "light" | "dark";
  };
}

export interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  department: string;
  city: string;
  address: string;
  notes?: string;
}

export interface Order {
  id?: string;
  items: CartItem[];
  shipping: ShippingInfo;
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: "wompi" | "epayco" | "contraentrega";
  status: "pending" | "paid" | "processing" | "shipped";
  createdAt: string;
}

export interface SiteSettings {
  site_active: boolean;
  construction_mode: boolean;
  construction_title: string;
  construction_subtitle: string;
  construction_message: string;
  construction_open_date: string;
  construction_logo: string;
  construction_bg_image: string;
  construction_email: string;
  construction_socials: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
  };
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  site_active: true,
  construction_mode: false,
  construction_title: "Próximamente",
  construction_subtitle: "Algo extraordinario está en camino",
  construction_message: "Estamos trabajando para ofrecerte la mejor experiencia.",
  construction_open_date: "",
  construction_logo: "",
  construction_bg_image: "",
  construction_email: "",
  construction_socials: {},
};

export interface MediaFile {
  name: string;
  url: string;
  createdAt: string;
  size?: number;
}
