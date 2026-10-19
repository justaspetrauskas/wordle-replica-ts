import { defineRailway, github, project, service } from "railway/iac";

export default defineRailway(() => {
  const wordleReplicaTs = service("wordle-replica-ts", {
    source: github("justaspetrauskas/wordle-replica-ts", { branch: "main", checkSuites: false }),
    build: { buildCommand: "npm run build" },
    deploy: {
      startCommand: "npm start",
      healthcheckPath: "/health",
      sleepApplication: true,
      limitOverride: { containers: { cpu: 4, memoryBytes: 4000000000 } },
    },
  });

  return project("wordl", {
    resources: [wordleReplicaTs],
  });
});
