import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// --- Google Translate React Crash Fix ---
// Google translate replaces text nodes with text + standard DOM nodes.
// React crashes when it tries to remove/update a node that Google Translate moved or altered.
// This safely intercepts standard DOM removing errors specifically avoiding the "white screen of death".
if (typeof Node === "function" && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      return child; // Silently ignore if parent shifted (Google Translate did it)
    }
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      return newNode; // Silently ignore if parent shifted
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };
}
// ----------------------------------------

createRoot(document.getElementById("root")!).render(<App />);
