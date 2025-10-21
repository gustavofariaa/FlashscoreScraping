import fs from 'fs';
import path from 'path';
import { OUTPUT_PATH } from '../../constants/index.js';

/**
 * Save checkpoint to file
 */
export const saveCheckpoint = (fileName, checkpointData) => {
  try {
    const checkpointPath = path.join(OUTPUT_PATH, `checkpoint_${fileName}.json`);
    fs.writeFileSync(checkpointPath, JSON.stringify(checkpointData, null, 2));
    console.log(`💾 Checkpoint saved (${checkpointData.processedCount}/${checkpointData.totalMatches} matches)`);
  } catch (err) {
    console.warn(`⚠️ Failed to save checkpoint: ${err.message}`);
  }
};

/**
 * Load checkpoint from file
 */
export const loadCheckpoint = (fileName) => {
  try {
    const checkpointPath = path.join(OUTPUT_PATH, `checkpoint_${fileName}.json`);
    if (fs.existsSync(checkpointPath)) {
      const data = fs.readFileSync(checkpointPath, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (err) {
    console.warn(`⚠️ Failed to load checkpoint: ${err.message}`);
    return null;
  }
};

/**
 * Delete checkpoint file
 */
export const deleteCheckpoint = (fileName) => {
  try {
    const checkpointPath = path.join(OUTPUT_PATH, `checkpoint_${fileName}.json`);
    if (fs.existsSync(checkpointPath)) {
      fs.unlinkSync(checkpointPath);
      console.log(`🗑️  Checkpoint deleted`);
    }
  } catch (err) {
    console.warn(`⚠️ Failed to delete checkpoint: ${err.message}`);
  }
};

/**
 * Check if checkpoint exists
 */
export const hasCheckpoint = (fileName) => {
  const checkpointPath = path.join(OUTPUT_PATH, `checkpoint_${fileName}.json`);
  return fs.existsSync(checkpointPath);
};

/**
 * Ask user if they want to resume from checkpoint (for CLI)
 */
export const shouldResumeCheckpoint = (checkpoint) => {
  if (!checkpoint) return false;
  
  const elapsed = Date.now() - checkpoint.timestamp;
  const minutes = Math.floor(elapsed / 60000);
  
  console.log(`\n┌─────────────────────────────────────────────┐`);
  console.log(`│  📌 CHECKPOINT FOUND                        │`);
  console.log(`├─────────────────────────────────────────────┤`);
  console.log(`│  Progress: ${checkpoint.processedCount}/${checkpoint.totalMatches} matches (${Math.round(checkpoint.processedCount/checkpoint.totalMatches*100)}%)        `);
  console.log(`│  Successful: ${checkpoint.successCount}                            `);
  console.log(`│  Failed: ${checkpoint.failedMatches.length}                                 `);
  console.log(`│  Created: ${minutes} minutes ago                  `);
  console.log(`└─────────────────────────────────────────────┘\n`);
  
  // Auto-resume if checkpoint is less than 2 hours old
  return elapsed < 7200000; // 2 hours
};