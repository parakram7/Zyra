import { whatsappHref } from "@/lib/format";

export function donorConfirmationMessage(venueName: string) {
  return `Hi, I'm a volunteer coordinating your surplus food collection request. I'm confirming the pickup details for ${venueName}.`;
}

export function buildDonorWhatsAppLink(phone: string, venueName: string) {
  return whatsappHref(phone, donorConfirmationMessage(venueName));
}
