"use client";

import Box from "@mui/material/Box";
import Link from "next/link";
import { track } from "../../../utils/mixpanel";

export default function V2Banner() {
  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        alignSelf: "stretch",
        background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
        color: "#fff",
        textAlign: "center",
        py: "0.5rem",
        px: "1rem",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Link
        href="/v2"
        onClick={() => track("Click Try V2 Banner")}
        style={{
          color: "#fff",
          fontSize: "0.875rem",
          fontWeight: 500,
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          textDecoration: "underline",
          textUnderlineOffset: "3px",
          textDecorationColor: "rgba(255, 255, 255, 0.5)",
        }}
      >
        Try out the new version{" "}
        <Box
          component="span"
          sx={{
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            background: "rgba(255, 255, 255, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            borderRadius: "4px",
            py: "0.1rem",
            px: "0.4rem",
            textDecoration: "none",
          }}
        >
          beta
        </Box>
      </Link>
    </Box>
  );
}
