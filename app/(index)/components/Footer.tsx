import React from "react";

import { track } from "../../../utils/mixpanel";

export default function Footer() {
  return (
    <>
      <footer>
        Created by{" "}
        <a
          href="https://bjrn.nu"
          onClick={() => track("Click Footer Link")}
          rel="noopener"
          target="_blank"
        >
          Björn Wiberg
        </a>
      </footer>
      <style jsx>{`
        footer {
          background: #fff;
          line-height: 2.5rem;
          text-align: center;
          border-top: 1px solid #eaeaea;
          position: fixed;
          bottom: 0;
          inline-size: 100%;
        }
        footer a {
          color: inherit;
          text-decoration: underline;
        }
        footer a:hover {
          text-decoration: none;
        }
      `}</style>
    </>
  );
}
