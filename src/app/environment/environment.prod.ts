// Producción: ajusta urlHost al dominio real del API (con "/" final).
// Con un proxy inverso en el mismo dominio basta con '/'.
const urlHost = 'https://serviyabackend.onrender.com/';

export const environment = {
  production: true,
  urlHost,
  urlApi: urlHost + 'public/',
  urlApiPrivate: urlHost + 'private/',
};
