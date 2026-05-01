"use client";
import { configure } from "onedollarstats";
import { useEffect } from "react";

export default function Analytics() {
  useEffect(() => {
    configure({ hostname: "4herfrika.org", devmode: false }); // toggle devmode to true to test locally
  }, []);

  return null;
}
