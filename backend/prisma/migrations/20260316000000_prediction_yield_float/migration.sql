-- AlterTable: Change Prediction.predictedYield from TEXT to REAL (Float).
-- SQLite does not support ALTER COLUMN type; recreate table and copy data.

CREATE TABLE "Prediction_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "fieldId" TEXT,
    "cropType" TEXT NOT NULL,
    "predictedYield" REAL NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg/ha',
    "status" TEXT NOT NULL DEFAULT 'completed',
    "notes" TEXT,
    "confidenceScore" REAL,
    "riskLevel" TEXT,
    "suggestions" TEXT,
    "inputParams" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Prediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Prediction_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Copy data: cast predictedYield to REAL. Works whether table has 9 or 13 columns.
INSERT INTO "Prediction_new" ("id", "userId", "fieldId", "cropType", "predictedYield", "unit", "status", "notes", "confidenceScore", "riskLevel", "suggestions", "inputParams", "createdAt")
SELECT "id", "userId", "fieldId", "cropType", CAST("predictedYield" AS REAL), "unit", COALESCE("status", 'completed'), "notes", NULL, NULL, NULL, NULL, "createdAt"
FROM "Prediction";

DROP TABLE "Prediction";
ALTER TABLE "Prediction_new" RENAME TO "Prediction";
