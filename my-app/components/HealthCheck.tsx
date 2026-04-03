"use client";

import { useEffect, useState } from "react";

export default function HealthCheck() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    fetch("/api/health")
      .then((response) => response.json())
      .then((data) => {
        setStatus(`Server is ${data.status} at ${new Date(data.time).toLocaleTimeString()}`);
      })
      .catch(() => {
        setStatus("Health check failed");
      });
  }, []);

  return (
    <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 text-left text-sm text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200">
      <p className="font-semibold">Backend Health</p>
      <p>{status}</p>
    </div>
  );
}
