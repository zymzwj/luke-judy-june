import React from "react";

export default function SyncStatus({ state, msg }) {
  return <div className={`sync-state ${state}`} title={msg} />;
}
