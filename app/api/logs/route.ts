import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const LOGS_FILE_PATH = path.join(process.cwd(), 'data', 'logs.json');

// Helper to read logs
const readLogs = () => {
  try {
    if (!fs.existsSync(LOGS_FILE_PATH)) {
      fs.writeFileSync(LOGS_FILE_PATH, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(LOGS_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading logs:', error);
    return [];
  }
};

// Helper to write logs
const writeLogs = (logs: any[]) => {
  try {
    fs.writeFileSync(LOGS_FILE_PATH, JSON.stringify(logs, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing logs:', error);
    return false;
  }
};

export async function GET(req: NextRequest) {
  try {
    const logs = readLogs();
    return NextResponse.json(logs);
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const logEntry = await req.json();
    const logs = readLogs();
    
    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...logEntry
    };
    
    logs.unshift(newLog); // Add new log at the beginning
    writeLogs(logs);
    
    return NextResponse.json({ success: true, log: newLog });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
