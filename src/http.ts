import axios from 'axios';

interface Params {
    email: string;
    description: string;
    category: string;
}

const baseUrl = "https://api.muximaboavida.com/api/integracao/bpm/ticket";

export async function sendApi(params: Params) {
    const result = await axios.post(baseUrl, {
        "categoria": params.category,
        "descricao": params.description,
        "email_requisitante": params.email
    }).then((response) => {
        console.log('API response: ', response.data);
        return response.data;
    }).catch((error) => {
        console.error('API error: ', error.response?.data || error.message);
        return null;
    });
    return result;
}