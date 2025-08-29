import { Client } from './client.interface';

/**
 * Описывает ответ API при запросе списка клиентов
 */
export interface ClientsResponse {
  meta: {
    size: number;
    limit: number;
    offset: number;
  };
  passes: Client[];
}
