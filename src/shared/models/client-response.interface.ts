import { IClient } from './client.interface';

/**
 * Описывает ответ API при запросе списка клиентов
 */
export interface IClientsResponse {
  meta: {
    size: number;
    limit: number;
    offset: number;
  };
  passes: IClient[];
}
