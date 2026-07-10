import * as fs from 'fs';
import * as path from 'path';

export type MissionStatus = 'Starting the mission' | 'Currently serving' | 'Ended the mission';

const missionStatuses: MissionStatus[] = ['Starting the mission', 'Currently serving', 'Ended the mission'];
const stateFilePath = path.resolve(__dirname, '..', '.state', 'mission-status.json');

function ensureStateFile(): void {
  fs.mkdirSync(path.dirname(stateFilePath), { recursive: true });
  if (!fs.existsSync(stateFilePath)) {
    fs.writeFileSync(stateFilePath, JSON.stringify({ index: 0 }, null, 2));
  }
}

export function generateUniqueTitle(prefix = 'MissionJournal_'): string {
  return `${prefix}${Date.now()}`;
}

export function getNextMissionStatus(): MissionStatus {
  ensureStateFile();
  const currentState = JSON.parse(fs.readFileSync(stateFilePath, 'utf8')) as { index?: number };
  const index = typeof currentState.index === 'number' ? currentState.index : 0;
  const nextStatus = missionStatuses[index % missionStatuses.length];
  const nextIndex = (index + 1) % missionStatuses.length;
  fs.writeFileSync(stateFilePath, JSON.stringify({ index: nextIndex }, null, 2));
  return nextStatus;
}

export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}
