import { v4 as uuidv4 } from 'uuid';

export function generateUserId(): string {
  const fullUuid = uuidv4();
  const uuidWithoutDashes = fullUuid.replace(/-/g, '');
  return uuidWithoutDashes.substring(0, 8);
}
