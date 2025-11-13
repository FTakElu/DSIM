import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import dotenv from 'dotenv';

dotenv.config();

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    sessionToken: process.env.AWS_SESSION_TOKEN, // Necessário para AWS Academy
  },
});

export const dynamoDB = DynamoDBDocumentClient.from(client);

export const TABLES = {
  USERS: process.env.DYNAMODB_USERS_TABLE || 'DSIM_Users',
  PATIENTS: process.env.DYNAMODB_PATIENTS_TABLE || 'DSIM_Patients',
  SENSOR_DATA: process.env.DYNAMODB_SENSOR_DATA_TABLE || 'DSIM_SensorData',
  ALARMS: process.env.DYNAMODB_ALARMS_TABLE || 'DSIM_Alarms',
};
