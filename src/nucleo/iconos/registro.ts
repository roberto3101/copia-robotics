import type { Icono } from './formas';
import { vigilancia } from './vigilancia';
import { sectores } from './sectores';
import { interfaz } from './interfaz';

export const registroIconos: Record<string, Icono> = {
  ...vigilancia,
  ...sectores,
  ...interfaz,
};

export type NombreIcono = keyof typeof registroIconos;
