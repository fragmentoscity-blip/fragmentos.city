/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface AdminUser {
  username: string;
  email: string;
  isAdmin: true;
}

async function getAdminProfileForAuthUser(authUser: any): Promise<AdminUser | null> {
  const authUserId = authUser?.id;
  const email = authUser?.email || "";
  if (!authUserId || !email) return null;

  const { data, error } = await supabase
    .from("users")
    .select("username,email,is_admin")
    .eq("auth_user_id", authUserId)
    .eq("is_admin", true)
    .maybeSingle();

  if (error || !data) {
    if (error) console.warn("Admin profile lookup failed", error.message);
    return null;
  }

  return {
    username: data.username || email,
    email: data.email || email,
    isAdmin: true,
  };
}

export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return getAdminProfileForAuthUser(data.user);
}

export async function authenticateAdminUser(email: string, password: string): Promise<AdminUser | null> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();
  if (!cleanEmail || !cleanPassword) return null;

  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password: cleanPassword,
  });

  if (error || !data.user) {
    if (error) console.warn("Supabase Auth login failed", error.message);
    return null;
  }

  const adminUser = await getAdminProfileForAuthUser(data.user);
  if (!adminUser) {
    await supabase.auth.signOut();
    return null;
  }

  return adminUser;
}

export async function signOutAdminUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Uploads a file (image/video) to Supabase Storage.
 * Leverages the S3-powered Supabase buckets.
 * Defaults to the bucket named 'fragmentos' or 'media'.
 */
export async function uploadToSupabaseStorage(
  file: File,
  bucketName = "media"
): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  // Try uploading
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    // If the bucket doesn't exist, try to create it programmatically (might require higher privileges or fail, which is fine, we explain)
    if (error.message.includes("does not exist") || error.message.includes("Bucket not found")) {
      console.warn(`Bucket '${bucketName}' not found. Attempting auto-creation...`);
      try {
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 52428800, // 50MB
        });
        if (!createError) {
          // Retry the upload
          const { data: retryData, error: retryError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: false,
            });
          if (retryError) throw retryError;
          
          const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);
          return publicUrlData.publicUrl;
        }
      } catch (e) {
        console.error("Failed to automatically create bucket:", e);
      }
    }
    throw error;
  }

  // Get public S3 public URL
  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

/**
 * Safe database synchronization helper.
 * Uses local storage as active fallback if Supabase table is missing or gives an error.
 */
export async function getProductsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.warn("Could not retrieve products from Supabase table. Using local fallback.", error.message);
      return null;
    }
    return data;
  } catch (error) {
    console.error("Supabase products fetch failed", error);
    return null;
  }
}

export async function saveProductToSupabase(product: any) {
  try {
    const { error } = await supabase
      .from("products")
      .upsert({
        id: product.id,
        name: product.name,
        description: product.description,
        basePrice: product.basePrice,
        image: product.image,
        stock: product.stock,
        details: product.details,
      });
    if (error) {
      console.warn("Could not sync product design to Supabase", error.message);
    }
  } catch (err) {
    console.error("Supabase upsert failed", err);
  }
}

export async function deleteProductFromSupabase(id: string) {
  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);
    if (error) {
      console.warn("Could not delete product from Supabase table", error.message);
    }
  } catch (err) {
    console.error("Supabase delete failed", err);
  }
}

export async function getOrdersFromSupabase() {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) {
      console.warn("Could not retrieve orders from Supabase table. Using local fallback.", error.message);
      return null;
    }
    return data;
  } catch (error) {
    console.error("Supabase orders fetch failed", error);
    return null;
  }
}

export async function createOrderInSupabase(order: any) {
  try {
    const orderPayload = {
      id: order.id,
      items: order.items,
      shipping: order.shipping,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      total: order.total,
      paymentMethod: order.paymentMethod,
      status: order.status,
      createdAt: order.createdAt,
      paymentReference: order.paymentReference,
      wompiTransactionId: order.wompiTransactionId,
    };

    const { error } = await supabase
      .from("orders")
      .insert(orderPayload);

    if (error && (error.message.includes("paymentReference") || error.message.includes("wompiTransactionId"))) {
      const { paymentReference, wompiTransactionId, ...compatiblePayload } = orderPayload;
      const { error: retryError } = await supabase
        .from("orders")
        .insert(compatiblePayload);
      if (retryError) {
        console.warn("Could not sync new order to Supabase", retryError.message);
      }
      return;
    }

    if (error) {
      console.warn("Could not sync new order to Supabase", error.message);
    }
  } catch (err) {
    console.error("Supabase order creation failed", err);
  }
}

export async function updateOrderStatusInSupabase(orderId: string, status: string) {
  try {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);
    if (error) {
      console.warn("Could not update order status in Supabase table", error.message);
    }
  } catch (err) {
    console.error("Supabase status update failed", err);
  }
}

export async function getSiteSettings() {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .single();
    if (error) {
      console.warn("Could not load site_settings from Supabase:", error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error("getSiteSettings failed:", err);
    return null;
  }
}

export async function saveSiteSettings(settings: any) {
  try {
    const { error } = await supabase
      .from("site_settings")
      .upsert({ id: 1, ...settings, updated_at: new Date().toISOString() });
    if (error) {
      console.warn("Could not save site_settings to Supabase:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("saveSiteSettings failed:", err);
    return false;
  }
}

export async function listMediaFiles(bucketName = "media") {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list("uploads", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
    if (error) {
      console.warn("Could not list media files:", error.message);
      return [];
    }
    return (data || []).map((file) => {
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(`uploads/${file.name}`);
      return {
        name: file.name,
        url: urlData.publicUrl,
        createdAt: file.created_at || new Date().toISOString(),
        size: file.metadata?.size,
      };
    });
  } catch (err) {
    console.error("listMediaFiles failed:", err);
    return [];
  }
}

export async function deleteMediaFile(fileName: string, bucketName = "media") {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([`uploads/${fileName}`]);
    if (error) {
      console.warn("Could not delete media file:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("deleteMediaFile failed:", err);
    return false;
  }
}
