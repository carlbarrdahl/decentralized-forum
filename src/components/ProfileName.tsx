import React from "react";

import { usePublicRecord } from "@self.id/react";

export default function ProfileName({ did }) {
  const { content, isLoading, error } = usePublicRecord("basicProfile", did);
  return <span>{content?.name || did}</span>;
}
