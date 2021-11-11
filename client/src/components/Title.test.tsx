import { render } from "@testing-library/react";
import { Title } from "./Title";

describe("Title", () => {
  it("renders correctly", () => {
    expect(
      render(<Title />).getByText("Path Search Visualiser")
    ).toBeInTheDocument();
  });
});
