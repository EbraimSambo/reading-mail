import axios from "axios";

export interface TicketPayload {
  email: string;
  description: string;
  category: string;
}

const baseUrl =
  process.env.BPM_API_URL ??
  "https://api.muximaboavida.com/api/integracao/bpm/ticket";

export async function sendTicket(payload: TicketPayload) {
  try {
    const response = await axios.post(baseUrl, {
      categoria: payload.category,
      descricao: payload.description,
      email_requisitante: payload.email,
    });
    console.log("API response:", response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API error:", error.response?.data || error.message);
    } else {
      console.error("Unexpected error:", error);
    }
    return null;
  }
}
