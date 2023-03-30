import "vitest-canvas-mock";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Title } from "./Title";

describe("Title", () => {
  it("renders", () => {
    render(<Title />);
    expect(screen.getByText("PFAlgoViz")).toBeDefined();
  });
});
