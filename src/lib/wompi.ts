import { Order } from "../types";

declare global {
  interface Window {
    WidgetCheckout?: new (config: WompiCheckoutConfig) => {
      open: (callback: (result: WompiCheckoutResult) => void) => void;
    };
  }
}

type WompiCheckoutConfig = {
  currency: "COP";
  amountInCents: number;
  reference: string;
  publicKey: string;
  redirectUrl?: string;
  signature: {
    integrity: string;
  };
  customerData: {
    email: string;
    fullName: string;
    phoneNumber: string;
  };
  shippingAddress: {
    addressLine1: string;
    city: string;
    phoneNumber: string;
    region: string;
    country: "CO";
  };
};

export type WompiCheckoutResult = {
  transaction?: {
    id?: string;
    status?: "APPROVED" | "DECLINED" | "VOIDED" | "ERROR" | "PENDING";
    reference?: string;
  };
};

const WOMPI_WIDGET_URL = "https://checkout.wompi.co/widget.js";
const WOMPI_CURRENCY = "COP" as const;

function getEnv(name: string) {
  return ((import.meta as any).env?.[name] || "").trim();
}

function loadWompiWidget() {
  if (window.WidgetCheckout) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${WOMPI_WIDGET_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("No se pudo cargar el widget de Wompi.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = WOMPI_WIDGET_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar el widget de Wompi."));
    document.head.appendChild(script);
  });
}

async function getIntegritySignature(reference: string, amountInCents: number) {
  const signatureEndpoint = getEnv("VITE_WOMPI_SIGNATURE_ENDPOINT");
  if (!signatureEndpoint) {
    throw new Error("Falta VITE_WOMPI_SIGNATURE_ENDPOINT. La firma de integridad debe generarse en backend.");
  }

  const response = await fetch(signatureEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reference,
      amountInCents,
      currency: WOMPI_CURRENCY,
    }),
  });

  if (!response.ok) {
    throw new Error("El endpoint de firma de Wompi no respondió correctamente.");
  }

  const payload = await response.json();
  const integrity = payload.integrity || payload.signature || payload.hash;
  if (!integrity) {
    throw new Error("El endpoint de firma no devolvió el campo integrity.");
  }

  return integrity;
}

export async function openWompiCheckout(order: Order, onResult: (result: WompiCheckoutResult) => void) {
  const publicKey = getEnv("VITE_WOMPI_PUBLIC_KEY");
  if (!publicKey) {
    throw new Error("Falta VITE_WOMPI_PUBLIC_KEY en las variables de entorno.");
  }

  const reference = order.paymentReference || `FRAG_${order.id}`;
  const amountInCents = Math.round(order.total * 100);
  const integrity = await getIntegritySignature(reference, amountInCents);

  await loadWompiWidget();

  if (!window.WidgetCheckout) {
    throw new Error("El widget de Wompi no quedó disponible en el navegador.");
  }

  const checkout = new window.WidgetCheckout({
    currency: WOMPI_CURRENCY,
    amountInCents,
    reference,
    publicKey,
    redirectUrl: getEnv("VITE_WOMPI_REDIRECT_URL") || window.location.origin,
    signature: { integrity },
    customerData: {
      email: order.shipping.email,
      fullName: order.shipping.fullName,
      phoneNumber: order.shipping.phone,
    },
    shippingAddress: {
      addressLine1: order.shipping.address,
      city: order.shipping.city,
      phoneNumber: order.shipping.phone,
      region: order.shipping.department,
      country: "CO",
    },
  });

  checkout.open(onResult);
}
