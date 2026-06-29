/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from "@supabase/supabase-js";
import { UserProfile } from "../types";

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const registrationCodeEndpoint = (import.meta as any).env.VITE_REGISTRATION_CODE_ENDPOINT || "";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function createSixDigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
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

/**
 * Checks if a user is valid and matches the given password in Supabase.
 * Includes graceful local fallback in case Supabase credentials table isn't set up yet.
 */
export async function authenticateUserWithSupabase(username: string, password: string): Promise<{ username: string; email: string; isAdmin: boolean } | null> {
  try {
    const cleanUsername = normalizeEmail(username);
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", cleanUsername)
      .single();

    if (error) {
      console.warn("User not found or table error in Supabase users. Falling back.", error.message);
      return null;
    }

    if (data && data.password === password.trim()) {
      return {
        username: data.username,
        email: data.email || data.username,
        isAdmin: !!data.is_admin,
      };
    }
    
    return null;
  } catch (err) {
    console.error("Supabase user query failed:", err);
    return null;
  }
}

export async function requestRegistrationCode(email: string): Promise<{ success: boolean; message: string; devCode?: string }> {
  try {
    const cleanEmail = normalizeEmail(email);
    if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
      return { success: false, message: "Ingresa un correo válido." };
    }

    const { data: existingUser } = await supabase
      .from("users")
      .select("username")
      .eq("username", cleanEmail)
      .maybeSingle();

    if (existingUser) {
      return { success: false, message: "Este correo ya tiene una cuenta registrada." };
    }

    const code = createSixDigitCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from("registration_codes")
      .upsert({
        email: cleanEmail,
        code,
        expires_at: expiresAt,
        verified: false,
        created_at: new Date().toISOString(),
      });

    if (error) {
      return { success: false, message: `No se pudo crear el código: ${error.message}` };
    }

    if (registrationCodeEndpoint) {
      const response = await fetch(registrationCodeEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, code }),
      });
      if (!response.ok) {
        return { success: false, message: "El código se generó, pero no se pudo enviar el correo." };
      }
      return { success: true, message: "Te enviamos un código de 6 dígitos a tu correo." };
    }

    return {
      success: true,
      message: "Código creado en Supabase. Configura VITE_REGISTRATION_CODE_ENDPOINT para enviarlo por correo.",
      devCode: code,
    };
  } catch (err: any) {
    return { success: false, message: err.message || "No se pudo solicitar el código." };
  }
}

export async function verifyRegistrationCode(email: string, code: string): Promise<{ success: boolean; message: string }> {
  try {
    const cleanEmail = normalizeEmail(email);
    const cleanCode = code.replace(/\D/g, "");

    const { data, error } = await supabase
      .from("registration_codes")
      .select("*")
      .eq("email", cleanEmail)
      .eq("code", cleanCode)
      .maybeSingle();

    if (error || !data) {
      return { success: false, message: "Código incorrecto." };
    }

    if (new Date(data.expires_at).getTime() < Date.now()) {
      return { success: false, message: "El código venció. Solicita uno nuevo." };
    }

    const { error: updateError } = await supabase
      .from("registration_codes")
      .update({ verified: true })
      .eq("email", cleanEmail);

    if (updateError) {
      return { success: false, message: `No se pudo confirmar el correo: ${updateError.message}` };
    }

    return { success: true, message: "Correo confirmado. Crea tu contraseña." };
  } catch (err: any) {
    return { success: false, message: err.message || "No se pudo verificar el código." };
  }
}

export async function completeRegistrationWithPassword(email: string, password: string): Promise<{ success: boolean; message: string }> {
  try {
    const cleanEmail = normalizeEmail(email);
    const cleanPassword = password.trim();

    if (cleanPassword.length < 8) {
      return { success: false, message: "La contraseña debe tener mínimo 8 caracteres." };
    }

    const { data: codeData } = await supabase
      .from("registration_codes")
      .select("*")
      .eq("email", cleanEmail)
      .eq("verified", true)
      .maybeSingle();

    if (!codeData) {
      return { success: false, message: "Primero confirma el correo con el código enviado." };
    }

    return registerUserInSupabase(cleanEmail, cleanPassword, false);
  } catch (err: any) {
    return { success: false, message: err.message || "No se pudo completar el registro." };
  }
}

export async function getUserProfile(username: string): Promise<UserProfile | null> {
  try {
    const cleanUsername = normalizeEmail(username);
    const { data, error } = await supabase
      .from("users")
      .select("username,email,full_name,phone,document_id,department,city,address,updated_at")
      .eq("username", cleanUsername)
      .maybeSingle();

    if (error || !data) {
      if (error) console.warn("Could not retrieve user profile", error.message);
      return null;
    }

    return {
      username: data.username,
      email: data.email || data.username,
      full_name: data.full_name || "",
      phone: data.phone || "",
      document_id: data.document_id || "",
      department: data.department || "",
      city: data.city || "",
      address: data.address || "",
      updated_at: data.updated_at,
    };
  } catch (err) {
    console.error("getUserProfile failed", err);
    return null;
  }
}

export async function updateUserProfileField(
  username: string,
  field: keyof Pick<UserProfile, "full_name" | "phone" | "document_id" | "department" | "city" | "address">,
  value: string
) {
  try {
    const { error } = await supabase
      .from("users")
      .update({ [field]: value.trim(), updated_at: new Date().toISOString() })
      .eq("username", normalizeEmail(username));

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: "Dato guardado." };
  } catch (err: any) {
    return { success: false, message: err.message || "No se pudo guardar el dato." };
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

/**
 * Registers a new user directly inside Supabase credentials database.
 * If successful, returns true, otherwise throws or returns false.
 */
export async function registerUserInSupabase(username: string, password: string, isAdmin = false): Promise<{ success: boolean; message: string }> {
  try {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      return { success: false, message: "Usuario y contraseña requeridos." };
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("username")
      .eq("username", cleanUsername)
      .maybeSingle();

    if (existingUser) {
      return { success: false, message: "El usuario ya existe en Supabase." };
    }

    // Insert user
    const { error } = await supabase
      .from("users")
      .insert({
        username: cleanUsername,
        email: cleanUsername,
        password: cleanPassword,
        is_admin: isAdmin,
      });

    if (error) {
      return { success: false, message: `Error registering database user: ${error.message}` };
    }

    return { success: true, message: "Usuario registrado con éxito en la base de datos de Supabase." };
  } catch (err: any) {
    console.error("Supabase registration error:", err);
    return { success: false, message: err.message || "Error de conexión con Supabase." };
  }
}
